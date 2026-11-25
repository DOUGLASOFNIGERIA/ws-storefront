import Link from "next/link";
import { Star } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getApprovedReviews } from "@/lib/reviews";
import { ReviewForm } from "./review-form";

interface ProductReviewsProps {
  productId: string;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function niceDate(value: string): string {
  const date = new Date(value.includes("T") ? value : value.replace(" ", "T") + "Z");
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("en-NG", { dateStyle: "medium" });
}

export async function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews, user] = await Promise.all([getApprovedReviews(productId), getCurrentUser()]);
  const average = reviews.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  return (
    <section className="mt-28 border-t border-cream/10 pt-14">
      <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div>
          <p className="eyebrow">Customer reviews</p>
          <h2 className="mt-5 font-display text-5xl tracking-[-0.02em] sm:text-6xl">What people say.</h2>
          <div className="mt-8 flex items-end gap-4">
            <span className="font-display text-7xl leading-none text-accent">{average.toFixed(1)}</span>
            <div className="pb-2">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((value) => (
                  <Star
                    key={value}
                    size={14}
                    className={value <= Math.round(average) ? "text-accent" : "text-muted/40"}
                    fill={value <= Math.round(average) ? "currentColor" : "none"}
                    strokeWidth={1.5}
                  />
                ))}
              </div>
              <p className="mt-2 text-xs text-muted">
                {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
              </p>
            </div>
          </div>
          <div className="mt-10">
            <ReviewForm
              productId={productId}
              user={user ? { name: user.name, emailVerified: user.emailVerified } : null}
            />
          </div>
        </div>

        <div className="space-y-5">
          {reviews.length === 0 ? (
            <div className="border border-cream/15 p-8 text-sm text-muted">
              No reviews published yet. Yours could be the first.
            </div>
          ) : (
            reviews.map((review) => (
              <article key={review.id} className="border border-cream/15 p-7">
                <div className="flex items-start justify-between gap-5">
                  <div className="flex items-center gap-4">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full border border-accent/40 font-display text-lg text-accent">
                      {initials(review.authorName)}
                    </span>
                    <div>
                      <p className="text-sm text-cream/90">{review.authorName}</p>
                      <p className="mt-1 text-[10px] uppercase tracking-widest2 text-muted">
                        {niceDate(review.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <Star
                        key={value}
                        size={13}
                        className={value <= review.rating ? "text-accent" : "text-muted/40"}
                        fill={value <= review.rating ? "currentColor" : "none"}
                        strokeWidth={1.5}
                      />
                    ))}
                  </div>
                </div>
                <h3 className="mt-6 font-display text-3xl">{review.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-cream/70">{review.body}</p>
              </article>
            ))
          )}
          <p className="pt-2 text-xs text-muted">
            Want to see all reviews?{" "}
            <Link href="/account" className="text-accent hover:underline">
              Manage yours
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
