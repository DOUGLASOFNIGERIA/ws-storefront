import { createHash, createHmac, randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { db, ensureSchema } from "./db";
import { sendVerificationEmail } from "./email";
import type { SessionUser } from "./types";

const COOKIE_NAME = "ws_session";
const SESSION_AGE_SECONDS = 60 * 60 * 24 * 30;
const VERIFICATION_AGE_HOURS = 24;
let fallbackSecret: string | undefined;

interface SessionPayload {
  uid: string;
  exp: number;
}

export interface AuthResult {
  ok: boolean;
  message: string;
  user?: SessionUser;
  emailSent?: boolean;
  devVerificationUrl?: string;
}

function base64url(value: string): string {
  return Buffer.from(value).toString("base64url");
}

function sign(value: string, secret: string): string {
  return createHmac("sha256", secret).update(value).digest("hex");
}

function safeEqualHex(left: string, right: string): boolean {
  try {
    const a = Buffer.from(left, "hex");
    const b = Buffer.from(right, "hex");
    return a.length === b.length && a.length > 0 && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function getSessionSecret(): Promise<string> {
  const configured = process.env.SESSION_SECRET?.trim();
  if (configured) return configured;
  if (fallbackSecret) return fallbackSecret;

  await ensureSchema();
  const existing = await db().execute({
    sql: "SELECT value FROM app_settings WHERE key = 'session_secret' LIMIT 1",
    args: [],
  });
  const stored = existing.rows[0]?.value;
  if (stored) {
    fallbackSecret = String(stored);
    return fallbackSecret;
  }

  fallbackSecret = randomBytes(48).toString("hex");
  await db().execute({
    sql: "INSERT OR IGNORE INTO app_settings (key, value) VALUES ('session_secret', ?)",
    args: [fallbackSecret],
  });
  return fallbackSecret;
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const derived = scryptSync(password, salt, 64);
  return `${salt.toString("hex")}:${derived.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;
  try {
    const expected = Buffer.from(hashHex, "hex");
    const actual = scryptSync(password, Buffer.from(saltHex, "hex"), expected.length);
    return expected.length > 0 && timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

export async function createSession(userId: string): Promise<void> {
  const secret = await getSessionSecret();
  const payload = base64url(
    JSON.stringify({ uid: userId, exp: Date.now() + SESSION_AGE_SECONDS * 1000 } satisfies SessionPayload),
  );
  const signature = sign(payload, secret);
  const store = await cookies();
  store.set(COOKIE_NAME, `${payload}.${signature}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_AGE_SECONDS,
  });
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

async function readSessionUserId(): Promise<string | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const secret = await getSessionSecret();
  if (!safeEqualHex(signature, sign(payload, secret))) return null;

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as SessionPayload;
    if (!parsed.uid || typeof parsed.exp !== "number" || parsed.exp < Date.now()) return null;
    return parsed.uid;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  await ensureSchema();
  const userId = await readSessionUserId();
  if (!userId) return null;

  const result = await db().execute({
    sql: "SELECT id, email, name, email_verified, role FROM users WHERE id = ? LIMIT 1",
    args: [userId],
  });
  const row = result.rows[0];
  if (!row) return null;

  return {
    id: String(row.id),
    email: String(row.email),
    name: String(row.name),
    emailVerified: Number(row.email_verified) === 1,
    role: row.role === "admin" ? "admin" : "customer",
  };
}

export async function isAdminUser(user: SessionUser | null): Promise<boolean> {
  if (!user) return false;
  const configured = process.env.ADMIN_EMAILS?.split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  if (!configured?.length) return user.role === "admin";
  return configured.includes(user.email.toLowerCase()) || user.role === "admin";
}

async function createVerificationToken(userId: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  await db().execute({
    sql: `INSERT INTO email_verification_tokens (id, user_id, token_hash, expires_at)
          VALUES (?, ?, ?, ?)`,
    args: [
      `evt_${randomUUID()}`,
      userId,
      hashToken(token),
      new Date(Date.now() + VERIFICATION_AGE_HOURS * 60 * 60 * 1000).toISOString(),
    ],
  });
  return token;
}

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResult> {
  await ensureSchema();
  const name = input.name.trim();
  const email = normalizeEmail(input.email);

  if (name.length < 2 || name.length > 80) {
    return { ok: false, message: "Please enter your name." };
  }
  if (!isValidEmail(email)) {
    return { ok: false, message: "Please enter a valid email address." };
  }
  if (input.password.length < 8) {
    return { ok: false, message: "Password must be at least 8 characters." };
  }

  const existing = await db().execute({
    sql: "SELECT id FROM users WHERE email = ? LIMIT 1",
    args: [email],
  });
  if (existing.rows.length) {
    return { ok: false, message: "An account with that email already exists." };
  }

  const userCount = await db().execute("SELECT COUNT(*) AS total FROM users");
  const role = Number(userCount.rows[0]?.total ?? 0) === 0 ? "admin" : "customer";
  const id = `usr_${randomUUID()}`;

  await db().execute({
    sql: `INSERT INTO users (id, email, name, password_hash, email_verified, role)
          VALUES (?, ?, ?, ?, 0, ?)`,
    args: [id, email, name, hashPassword(input.password), role],
  });

  const user: SessionUser = {
    id,
    email,
    name,
    emailVerified: false,
    role: role as SessionUser["role"],
  };
  const token = await createVerificationToken(id);
  const delivery = await sendVerificationEmail(user.email, user.name, token);

  return {
    ok: true,
    emailSent: delivery.ok,
    message: delivery.ok
      ? "Account created. Check your email to verify your address."
      : "Account created, but we could not send the verification email. Ask an admin to verify your account.",
    user,
    ...(process.env.NODE_ENV !== "production" ? { devVerificationUrl: delivery.url } : {}),
  };
}

export async function loginUser(input: {
  email: string;
  password: string;
}): Promise<AuthResult> {
  await ensureSchema();
  const email = normalizeEmail(input.email);
  const result = await db().execute({
    sql: "SELECT id, email, name, password_hash, email_verified, role FROM users WHERE email = ? LIMIT 1",
    args: [email],
  });
  const row = result.rows[0];
  if (!row || !verifyPassword(input.password, String(row.password_hash))) {
    return { ok: false, message: "Incorrect email or password." };
  }

  const user: SessionUser = {
    id: String(row.id),
    email: String(row.email),
    name: String(row.name),
    emailVerified: Number(row.email_verified) === 1,
    role: row.role === "admin" ? "admin" : "customer",
  };
  await db().execute({
    sql: "UPDATE users SET last_login_at = datetime('now') WHERE id = ?",
    args: [user.id],
  });
  await createSession(user.id);

  return { ok: true, message: "Signed in.", user };
}

export async function verifyEmail(token: string): Promise<boolean> {
  await ensureSchema();
  const result = await db().execute({
    sql: `SELECT id, user_id, expires_at FROM email_verification_tokens
          WHERE token_hash = ? AND used_at IS NULL LIMIT 1`,
    args: [hashToken(token)],
  });
  const row = result.rows[0];
  if (!row) return false;
  if (new Date(String(row.expires_at)).getTime() < Date.now()) return false;

  await db().execute({
    sql: "UPDATE users SET email_verified = 1 WHERE id = ?",
    args: [String(row.user_id)],
  });
  await db().execute({
    sql: "UPDATE email_verification_tokens SET used_at = datetime('now') WHERE id = ?",
    args: [String(row.id)],
  });
  return true;
}

export async function listUsers(): Promise<SessionUser[]> {
  await ensureSchema();
  const result = await db().execute({
    sql: "SELECT id, email, name, email_verified, role FROM users ORDER BY created_at DESC",
    args: [],
  });
  return result.rows.map((row) => ({
    id: String(row.id),
    email: String(row.email),
    name: String(row.name),
    emailVerified: Number(row.email_verified) === 1,
    role: row.role === "admin" ? "admin" : "customer",
  }));
}

export async function adminVerifyUser(userId: string): Promise<boolean> {
  await ensureSchema();
  const result = await db().execute({
    sql: "UPDATE users SET email_verified = 1 WHERE id = ?",
    args: [userId],
  });
  return Number(result.rowsAffected ?? 0) > 0;
}

export async function resendVerification(user: SessionUser): Promise<AuthResult> {
  if (user.emailVerified) {
    return { ok: true, message: "Your email is already verified." };
  }

  await db().execute({
    sql: "UPDATE email_verification_tokens SET used_at = datetime('now') WHERE user_id = ? AND used_at IS NULL",
    args: [user.id],
  });
  const token = await createVerificationToken(user.id);
  const delivery = await sendVerificationEmail(user.email, user.name, token);

  return {
    ok: true,
    emailSent: delivery.ok,
    message: delivery.ok
      ? "Verification email sent."
      : "We could not send the verification email. Ask an admin to verify your account.",
    ...(process.env.NODE_ENV !== "production" ? { devVerificationUrl: delivery.url } : {}),
  };
}
