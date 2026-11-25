import type { Metadata } from "next";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser, isAdminUser, listUsers, adminVerifyUser } from "@/lib/auth";
import { getReviewsByStatus, moderateReview } from "@/lib/reviews";

export const metadata: Metadata = {
  title: "Moderation",
  description: "WS review moderation and account verification.",
};

export const dynamic = "force-dynamic";

function niceDate(value: string): string {
  const date = new Date(value.includes("T") ? value : value.replace(" ", "T") + "Z");
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("en-NG", { dateStyle: "medium" });
}

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!(await isAdminUser(user))) redirect("/account");

  const [pending, users] = await Promise.all([getReviewsByStatus("pending"), listUsers()]);
  const unverified = users.filter((item) => !item.emailVerified);

  async function moderateAction(formData: FormData) {
    "use server";
    const current = await getCurrentUser();
    if (!(await isAdminUser(current))) return;
    const id = String(formData.get("id") ?? "");
    const slug = String(formData.get("slug") ?? "");
    const status = String(formData.get("status") ?? "");
    if (status !== "approved" && status !== "rejected") return;
    await moderateReview(id, status);
    revalidatePath("/admin");
    if (slug) revalidatePath(`/products/${slug}`);
  }

  async function verifyAction(formData: FormData) {
    "use server";
    const current = await getCurrentUser();
    if (!(await isAdminUser(current))) return;
    await adminVerifyUser(String(formData.get("id") ?? ""));
    revalidatePath("/admin");
    revalidatePath("/account");
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
      <p className="eyebrow">WS admin</p>
      <h1 className="mt-5 font-display text-6xl leading-none tracking-[-0.03em] sm:text-7xl">Moderation</h1>

      <section className="mt-16">
        <div className="mb-8 flex items-end justify-between gap-6 border-b border-cream/15 pb-6">
          <h2 className="font-display text-4xl">Pending reviews</h2>
          <span className="text-[10px] uppercase tracking-widest2 text-muted">{pending.length} waiting</span>
        </div>
        {pending.length === 0 ? (
          <p className="border border-cream/15 p-8 text-sm text-muted">Nothing to review right now.</p>
        ) : (
          <div className="space-y-5">
            {pending.map((review) => (
              <article key={review.id} className="border border-cream/15 p-7">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest2 text-muted">
                      {niceDate(review.createdAt)} · {review.rating}/5
                    </p>
                    <h3 className="mt-2 font-display text-3xl">{review.title}</h3>
                    <p className="mt-1 text-xs text-accent">
                      <Link href={`/products/${review.productSlug}`}>{review.productSlug}</Link> · {review.authorName}
                    </p>
                  </div>
                </div>
                <p className="mt-5 max-w-3xl text-sm leading-relaxed text-cream/75">{review.body}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <form action={moderateAction}>
                    <input type="hidden" name="id" value={review.id} />
                    <input type="hidden" name="slug" value={review.productSlug} />
                    <input type="hidden" name="status" value="approved" />
                    <button type="submit" className="btn-primary py-3">
                      Approve
                    </button>
                  </form>
                  <form action={moderateAction}>
                    <input type="hidden" name="id" value={review.id} />
                    <input type="hidden" name="slug" value={review.productSlug} />
                    <input type="hidden" name="status" value="rejected" />
                    <button type="submit" className="btn-outline py-3">
                      Reject
                    </button>
                  </form>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="mt-20">
        <div className="mb-8 flex items-end justify-between gap-6 border-b border-cream/15 pb-6">
          <h2 className="font-display text-4xl">Unverified accounts</h2>
          <span className="text-[10px] uppercase tracking-widest2 text-muted">{unverified.length} waiting</span>
        </div>
        {unverified.length === 0 ? (
          <p className="border border-cream/15 p-8 text-sm text-muted">All accounts are verified.</p>
        ) : (
          <div className="space-y-4">
            {unverified.map((item) => (
              <div key={item.id} className="flex flex-wrap items-center justify-between gap-4 border border-cream/15 p-6">
                <div>
                  <p className="font-display text-2xl">{item.name}</p>
                  <p className="mt-1 text-xs text-muted">{item.email}</p>
                </div>
                <form action={verifyAction}>
                  <input type="hidden" name="id" value={item.id} />
                  <button type="submit" className="btn-outline py-3">
                    Verify manually
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
