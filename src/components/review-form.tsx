"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Star } from "lucide-react";
import { useState } from "react";

interface ReviewFormProps {
  productId: string;
  user: { name: string; emailVerified: boolean } | null;
}

export function ReviewForm({ productId, user }: ReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  if (!user) {
    return (
      <div className="border border-cream/15 p-7">
        <p className="font-display text-2xl">Leave a review</p>
        <p className="mt-3 text-sm text-muted">
          Sign in to share your experience with this piece.
        </p>
        <div className="mt-5 flex gap-3">
          <Link href="/login" className="btn-outline py-3">
            Sign in
          </Link>
          <Link href="/register" className="btn-outline py-3">
            Create account
          </Link>
        </div>
      </div>
    );
  }

  if (!user.emailVerified) {
    return (
      <div className="border border-accent/35 bg-accent/10 p-7">
        <p className="font-display text-2xl">Verify your email</p>
        <p className="mt-3 text-sm text-cream/75">
          Confirm your email address before leaving a review. You can do that from your account page.
        </p>
        <Link href="/account" className="btn-outline mt-5 py-3">
          Go to account
        </Link>
      </div>
    );
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, title, body }),
      });
      const data = (await response.json()) as { ok: boolean; message: string };
      setMessage(data.message);
      if (data.ok) {
        setTitle("");
        setBody("");
        setRating(5);
        router.refresh();
      }
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="border border-cream/15 p-7">
      <p className="font-display text-2xl">Leave a review</p>
      <p className="mt-2 text-xs text-muted">Reviews are published after a quick moderation check.</p>

      <div className="mt-6">
        <span className="label">Your rating</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              aria-label={`${value} star${value > 1 ? "s" : ""}`}
              className={`p-1 transition-colors ${value <= rating ? "text-accent" : "text-muted/50 hover:text-accent"}`}
            >
              <Star size={24} fill={value <= rating ? "currentColor" : "none"} strokeWidth={1.5} />
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <label htmlFor="review-title" className="label">
          Title
        </label>
        <input
          id="review-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
          minLength={3}
          maxLength={90}
          className="field"
          placeholder="What stood out?"
        />
      </div>

      <div className="mt-6">
        <label htmlFor="review-body" className="label">
          Review
        </label>
        <textarea
          id="review-body"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          required
          minLength={12}
          maxLength={1200}
          rows={5}
          className="field resize-none"
          placeholder="Tell us about the fit, finish, scent or everyday feel."
        />
      </div>

      <button type="submit" disabled={submitting} className="btn-primary mt-7 py-4">
        {submitting ? "Submitting…" : "Submit review"}
      </button>
      {message && <p className="mt-4 text-sm text-cream/75">{message}</p>}
    </form>
  );
}
