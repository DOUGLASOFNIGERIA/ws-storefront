"use client";

import { FormEvent, useState } from "react";
import { ArrowUpRight } from "lucide-react";

type Status = "idle" | "loading" | "success" | "error";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await response.json()) as { message?: string };
      if (!response.ok) throw new Error(data.message || "Could not subscribe");
      setStatus("success");
      setMessage("You're on the list. Watch your inbox.");
      setEmail("");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Something went wrong");
    }
  }

  return (
    <form onSubmit={submit} className="w-full max-w-lg">
      <div className="flex border border-cream/30 focus-within:border-gold">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email address"
          className="min-w-0 flex-1 bg-transparent px-5 py-4 text-sm text-cream outline-none placeholder:text-muted/70"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          aria-label="Subscribe"
          className="flex w-16 items-center justify-center border-l border-cream/30 text-cream transition-colors hover:bg-gold hover:text-ink disabled:opacity-50"
        >
          <ArrowUpRight size={20} />
        </button>
      </div>
      {message && (
        <p
          role="status"
          className={`mt-3 text-xs ${status === "error" ? "text-red-300" : "text-gold"}`}
        >
          {message}
        </p>
      )}
    </form>
  );
}
