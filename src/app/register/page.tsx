import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/auth-forms";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create a WS account to order, review and track your pieces.",
};

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect("/account");

  return (
    <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
      <div className="grid gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
        <div className="lg:pt-10">
          <p className="eyebrow">Join WS</p>
          <h1 className="mt-6 font-display text-6xl leading-[0.9] tracking-[-0.03em] sm:text-7xl">
            Make it yours.
          </h1>
          <p className="mt-7 max-w-md text-sm leading-relaxed text-cream/70">
            One account for orders, delivery details and reviews. We will send a short verification link to confirm
            your email.
          </p>
          <div className="mt-10 border-t border-cream/15 pt-8 text-sm text-muted">
            Already have an account?{" "}
            <Link href="/login" className="text-accent hover:underline">
              Sign in
            </Link>
          </div>
        </div>
        <div className="border border-cream/15 bg-wine/20 p-8 sm:p-12">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
