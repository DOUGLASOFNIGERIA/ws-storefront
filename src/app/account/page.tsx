import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoutButton, OtpVerificationForm } from "@/components/auth-forms";
import { getCurrentUser, isAdminUser } from "@/lib/auth";
import { formatNaira } from "@/lib/money";
import { getOrdersByEmail } from "@/lib/orders";
import { getReviewsByUser } from "@/lib/reviews";

export const metadata: Metadata = {
  title: "Account",
  description: "Your WS orders, reviews and account details.",
};

export const dynamic = "force-dynamic";

function niceDate(value: string): string {
  const date = new Date(value.includes("T") ? value : value.replace(" ", "T") + "Z");
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("en-NG", { dateStyle: "medium" });
}

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [orders, reviews, admin] = await Promise.all([
    getOrdersByEmail(user.email),
    getReviewsByUser(user.id),
    isAdminUser(user),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-8 border-b border-cream/15 pb-12">
        <div>
          <p className="eyebrow">WS account</p>
          <h1 className="mt-5 font-display text-6xl leading-none tracking-[-0.03em] sm:text-7xl">
            Hello, {user.name.split(" ")[0]}.
          </h1>
          <p className="mt-4 text-sm text-muted">{user.email}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {admin && (
            <Link href="/admin" className="btn-outline py-3">
              Moderation
            </Link>
          )}
          <LogoutButton />
        </div>
      </div>

      {!user.emailVerified && (
        <section className="mt-10 border border-accent/35 bg-accent/10 p-8">
          <h2 className="font-display text-3xl">Verify your email</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-cream/75">
            Confirm your address to leave product reviews. Enter the 6-digit code from your inbox, or request a fresh
            one below.
          </p>
          <OtpVerificationForm email={user.email} />
        </section>
      )}

      <section className="mt-16">
        <div className="mb-8 flex items-end justify-between gap-6">
          <h2 className="font-display text-4xl tracking-[-0.02em]">Orders</h2>
          <span className="text-[10px] uppercase tracking-widest2 text-muted">
            {orders.length} {orders.length === 1 ? "order" : "orders"}
          </span>
        </div>
        {orders.length === 0 ? (
          <div className="border border-cream/15 p-8 text-sm text-muted">
            No orders yet.{" "}
            <Link href="/collections/all" className="text-accent hover:underline">
              Explore the collection
            </Link>
            .
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/order/${order.reference}`}
                className="flex flex-wrap items-center justify-between gap-4 border border-cream/15 p-6 transition-colors hover:border-accent/50"
              >
                <div>
                  <p className="text-xs uppercase tracking-widest2 text-muted">{order.reference}</p>
                  <p className="mt-2 text-sm text-cream/85">{niceDate(order.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-2xl text-accent">{formatNaira(order.totalKobo)}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-widest2 text-muted">{order.status.replaceAll("_", " ")}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mt-20">
        <div className="mb-8 flex items-end justify-between gap-6">
          <h2 className="font-display text-4xl tracking-[-0.02em]">Your reviews</h2>
          <span className="text-[10px] uppercase tracking-widest2 text-muted">
            {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
          </span>
        </div>
        {reviews.length === 0 ? (
          <div className="border border-cream/15 p-8 text-sm text-muted">
            You have not written a review yet. Open a product you own and share your experience.
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <article key={review.id} className="border border-cream/15 p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Link href={`/products/${review.productSlug}`} className="font-display text-2xl hover:text-accent">
                    {review.title}
                  </Link>
                  <span className="text-[10px] uppercase tracking-widest2 text-accent">{review.status}</span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-cream/70">{review.body}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
