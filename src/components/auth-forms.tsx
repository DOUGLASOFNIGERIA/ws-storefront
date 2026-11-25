"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface AuthResponse {
  ok: boolean;
  message: string;
  devOtp?: string;
}

export function RegisterForm() {
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<AuthResponse | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setResult(null);
    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          password: form.get("password"),
        }),
      });
      const data = (await response.json()) as AuthResponse;
      setResult(data);
      if (data.ok) event.currentTarget.reset();
    } catch {
      setResult({ ok: false, message: "Something went wrong. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div>
        <label htmlFor="name" className="label">
          Full name
        </label>
        <input id="name" name="name" required autoComplete="name" className="field" placeholder="Your name" />
      </div>
      <div>
        <label htmlFor="email" className="label">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="field"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label htmlFor="password" className="label">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="field"
          placeholder="At least 8 characters"
        />
      </div>
      <button type="submit" disabled={submitting} className="btn-primary w-full py-5">
        {submitting ? "Creating account…" : "Create account"}
      </button>
      {result && (
        <div
          className={
            result.ok
              ? "border border-accent/40 bg-accent/10 p-4 text-sm text-cream"
              : "border border-red-400/40 bg-red-500/10 p-4 text-sm text-red-200"
          }
        >
          <p>{result.message}</p>
          {result.devOtp && (
            <p className="mt-3 text-xs text-muted">
              Development code: <span className="font-semibold text-accent">{result.devOtp}</span>
            </p>
          )}
          {result.ok && (
            <Link href="/verify-email" className="mt-3 inline-block text-xs text-accent underline">
              Enter your verification code
            </Link>
          )}
        </div>
      )}
    </form>
  );
}

export function LoginForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
        }),
      });
      const data = (await response.json()) as AuthResponse;
      if (!data.ok) {
        setError(data.message);
        return;
      }
      router.push("/account");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div>
        <label htmlFor="email" className="label">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="field"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label htmlFor="password" className="label">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="field"
          placeholder="Your password"
        />
      </div>
      <button type="submit" disabled={submitting} className="btn-primary w-full py-5">
        {submitting ? "Signing in…" : "Sign in"}
      </button>
      {error && <p className="border border-red-400/40 bg-red-500/10 p-4 text-sm text-red-200">{error}</p>}
    </form>
  );
}

export function OtpVerificationForm({ email }: { email: string }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  async function verify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setVerifying(true);
    setMessage("");
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = (await response.json()) as AuthResponse;
      setMessage(data.message);
      setSuccess(data.ok);
      if (data.ok) {
        setCode("");
        router.push("/account");
        router.refresh();
      }
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setVerifying(false);
    }
  }

  async function resend() {
    setResending(true);
    setMessage("");
    try {
      const response = await fetch("/api/auth/resend-verification", { method: "POST" });
      const data = (await response.json()) as AuthResponse;
      const devCode = data.devOtp ? ` Development code: ${data.devOtp}.` : "";
      setMessage(`${data.message}${devCode}`);
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="mt-8">
      <p className="text-xs uppercase tracking-widest2 text-muted">Code sent to {email}</p>
      <form onSubmit={verify} className="mt-5 flex flex-col gap-4 sm:flex-row">
        <input
          value={code}
          onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]*"
          maxLength={6}
          required
          aria-label="6-digit verification code"
          className="field text-center text-2xl tracking-[0.4em]"
          placeholder="000000"
        />
        <button type="submit" disabled={verifying || success} className="btn-primary whitespace-nowrap py-5">
          {verifying ? "Verifying…" : "Verify code"}
        </button>
      </form>
      <button type="button" onClick={resend} disabled={resending} className="btn-outline mt-4 py-3">
        {resending ? "Sending…" : "Resend code"}
      </button>
      {message && (
        <p className={success ? "mt-4 text-sm text-accent" : "mt-4 text-sm text-cream/75"}>{message}</p>
      )}
    </div>
  );
}

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <button type="button" onClick={logout} disabled={loading} className="btn-outline py-3">
      {loading ? "Signing out…" : "Sign out"}
    </button>
  );
}
