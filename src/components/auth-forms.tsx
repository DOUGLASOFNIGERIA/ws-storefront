"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface AuthResponse {
  ok: boolean;
  message: string;
  devVerificationUrl?: string;
}

export function RegisterForm() {
  const router = useRouter();
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
      if (data.ok) {
        event.currentTarget.reset();
        router.refresh();
      }
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
        <div className={result.ok ? "border border-accent/40 bg-accent/10 p-4 text-sm text-cream" : "border border-red-400/40 bg-red-500/10 p-4 text-sm text-red-200"}>
          <p>{result.message}</p>
          {result.devVerificationUrl && (
            <p className="mt-3 break-all text-xs text-muted">
              Development link:{" "}
              <Link href={result.devVerificationUrl} className="text-accent underline">
                {result.devVerificationUrl}
              </Link>
            </p>
          )}
          {result.ok && <p className="mt-2 text-xs text-muted">You are signed in. Check the header for your account.</p>}
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

export function ResendVerificationButton() {
  const [state, setState] = useState<{ loading: boolean; message: string; url?: string }>({
    loading: false,
    message: "",
  });

  async function resend() {
    setState({ loading: true, message: "" });
    try {
      const response = await fetch("/api/auth/resend-verification", { method: "POST" });
      const data = (await response.json()) as AuthResponse;
      setState({ loading: false, message: data.message, url: data.devVerificationUrl });
    } catch {
      setState({ loading: false, message: "Something went wrong. Please try again." });
    }
  }

  return (
    <div className="mt-4">
      <button type="button" onClick={resend} disabled={state.loading} className="btn-outline py-3">
        {state.loading ? "Sending…" : "Resend verification email"}
      </button>
      {state.message && <p className="mt-3 text-sm text-cream/75">{state.message}</p>}
      {state.url && (
        <Link href={state.url} className="mt-2 block break-all text-xs text-accent underline">
          Development link: {state.url}
        </Link>
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
