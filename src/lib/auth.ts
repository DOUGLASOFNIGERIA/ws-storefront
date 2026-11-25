import { createHash, createHmac, randomBytes, randomInt, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { db, ensureSchema } from "./db";
import { sendVerificationOtp } from "./email";
import type { SessionUser } from "./types";

const COOKIE_NAME = "ws_session";
const SESSION_AGE_SECONDS = 60 * 60 * 24 * 30;
const VERIFICATION_AGE_MINUTES = 10;
const VERIFICATION_MAX_ATTEMPTS = 5;
const VERIFICATION_RESEND_SECONDS = 60;
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
  devOtp?: string;
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

function storedDate(value: string): number {
  const normalized = value.includes("T") ? value : `${value.replace(" ", "T")}Z`;
  return new Date(normalized).getTime();
}

async function issueVerificationOtp(userId: string): Promise<string> {
  await db().execute({
    sql: "UPDATE email_verification_tokens SET used_at = datetime('now') WHERE user_id = ? AND used_at IS NULL",
    args: [userId],
  });

  const id = `evt_${randomUUID()}`;
  const otp = randomInt(0, 1_000_000).toString().padStart(6, "0");
  await db().execute({
    sql: `INSERT INTO email_verification_tokens (id, user_id, token_hash, expires_at)
          VALUES (?, ?, ?, ?)`,
    args: [
      id,
      userId,
      hashToken(`${id}:${otp}`),
      new Date(Date.now() + VERIFICATION_AGE_MINUTES * 60 * 1000).toISOString(),
    ],
  });
  return otp;
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
  const otp = await issueVerificationOtp(id);
  const delivery = await sendVerificationOtp(user.email, user.name, otp);

  return {
    ok: true,
    emailSent: delivery.ok,
    message: delivery.ok
      ? "Account created. Check your email for your 6-digit verification code."
      : "Account created, but we could not send the verification code. Ask an admin to verify your account.",
    user,
    ...(process.env.NODE_ENV !== "production" ? { devOtp: otp } : {}),
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

export async function verifyOtpForUser(user: SessionUser, otp: string): Promise<AuthResult> {
  await ensureSchema();
  if (!/^\d{6}$/.test(otp)) {
    return { ok: false, message: "Enter the 6-digit code from your email." };
  }

  const result = await db().execute({
    sql: `SELECT id, token_hash, expires_at, attempts FROM email_verification_tokens
          WHERE user_id = ? AND used_at IS NULL ORDER BY created_at DESC LIMIT 5`,
    args: [user.id],
  });

  for (const row of result.rows) {
    const id = String(row.id);
    const attempts = Number(row.attempts ?? 0);
    const remaining = VERIFICATION_MAX_ATTEMPTS - attempts;
    if (remaining <= 0 || storedDate(String(row.expires_at)) < Date.now()) continue;

    if (safeEqualHex(hashToken(`${id}:${otp}`), String(row.token_hash))) {
      await db().execute({
        sql: "UPDATE users SET email_verified = 1 WHERE id = ?",
        args: [user.id],
      });
      await db().execute({
        sql: "UPDATE email_verification_tokens SET used_at = datetime('now') WHERE id = ?",
        args: [id],
      });
      return {
        ok: true,
        message: "Email verified.",
        user: { ...user, emailVerified: true },
      };
    }

    await db().execute({
      sql: "UPDATE email_verification_tokens SET attempts = attempts + 1 WHERE id = ?",
      args: [id],
    });
    return {
      ok: false,
      message: `Incorrect code. ${remaining - 1} attempts remaining.`,
    };
  }

  return { ok: false, message: "Your code has expired or was already used. Request a new one." };
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
  if (Number(result.rowsAffected ?? 0) > 0) {
    await db().execute({
      sql: "UPDATE email_verification_tokens SET used_at = datetime('now') WHERE user_id = ? AND used_at IS NULL",
      args: [userId],
    });
    return true;
  }
  return false;
}

export async function resendVerification(user: SessionUser): Promise<AuthResult> {
  if (user.emailVerified) {
    return { ok: true, message: "Your email is already verified." };
  }

  const latest = await db().execute({
    sql: `SELECT created_at FROM email_verification_tokens
          WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`,
    args: [user.id],
  });
  const lastSent = latest.rows[0] ? storedDate(String(latest.rows[0].created_at)) : 0;
  const waitSeconds = Math.ceil((VERIFICATION_RESEND_SECONDS * 1000 - (Date.now() - lastSent)) / 1000);
  if (waitSeconds > 0) {
    return {
      ok: false,
      message: `Please wait ${waitSeconds} second${waitSeconds === 1 ? "" : "s"} before requesting another code.`,
    };
  }

  const otp = await issueVerificationOtp(user.id);
  const delivery = await sendVerificationOtp(user.email, user.name, otp);

  return {
    ok: true,
    emailSent: delivery.ok,
    message: delivery.ok
      ? "A new 6-digit verification code has been sent."
      : "We could not send the verification code. Ask an admin to verify your account.",
    ...(process.env.NODE_ENV !== "production" ? { devOtp: otp } : {}),
  };
}
