import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { OtpVerificationForm } from "@/components/auth-forms";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Verify email",
  description: "Verify your WS email address.",
};

export const dynamic = "force-dynamic";

export default async function VerifyEmailPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.emailVerified) redirect("/account");

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-5 text-center">
      <p className="eyebrow">Verification</p>
      <h1 className="mt-6 font-display text-6xl tracking-[-0.03em] sm:text-7xl">Check your email.</h1>
      <p className="mt-7 max-w-lg text-sm leading-relaxed text-cream/70">
        We sent a 6-digit code to confirm your address. Enter it below to unlock reviews and the full WS account
        experience.
      </p>
      <OtpVerificationForm email={user.email} />
      <Link href="/account" className="mt-8 text-xs text-muted underline hover:text-accent">
        Return to account
      </Link>
    </div>
  );
}
