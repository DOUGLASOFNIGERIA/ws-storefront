import type { Metadata } from "next";
import Link from "next/link";
import { verifyEmail } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Verify email",
  description: "Verify your WS email address.",
};

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function VerifyEmailPage({ searchParams }: PageProps) {
  const { token } = await searchParams;
  const verified = token ? await verifyEmail(token) : false;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-5 text-center">
      <p className="eyebrow">{verified ? "Email confirmed" : "Verification"}</p>
      <h1 className="mt-6 font-display text-6xl tracking-[-0.03em] sm:text-7xl">
        {verified ? "You are verified." : "Link not valid."}
      </h1>
      <p className="mt-7 max-w-lg text-sm leading-relaxed text-cream/70">
        {verified
          ? "Your email is confirmed. You can now leave reviews and enjoy the full WS account experience."
          : "This verification link is missing, expired or has already been used. Sign in to request a new one."}
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link href="/account" className="btn-primary">
          Go to account
        </Link>
        {!verified && (
          <Link href="/login" className="btn-outline">
            Sign in
          </Link>
        )}
      </div>
    </div>
  );
}
