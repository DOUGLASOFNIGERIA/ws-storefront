import { NextResponse } from "next/server";
import { getCurrentUser, isAdminUser } from "@/lib/auth";
import { createReview, getApprovedReviews, getReviewsByStatus, getReviewsByUser } from "@/lib/reviews";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");
  if (productId) {
    return NextResponse.json({ reviews: await getApprovedReviews(productId) });
  }

  const user = await getCurrentUser();
  const status = searchParams.get("status");
  if (status && (await isAdminUser(user))) {
    const allowed = ["pending", "approved", "rejected"];
    if (!allowed.includes(status)) {
      return NextResponse.json({ ok: false, message: "Invalid status." }, { status: 400 });
    }
    return NextResponse.json({ reviews: await getReviewsByStatus(status as "pending" | "approved" | "rejected") });
  }

  if (!user) {
    return NextResponse.json({ ok: false, message: "Please sign in first." }, { status: 401 });
  }
  return NextResponse.json({ reviews: await getReviewsByUser(user.id) });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, message: "Please sign in first." }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const result = await createReview({
    productId: typeof body.productId === "string" ? body.productId : "",
    user,
    rating: Number(body.rating),
    title: typeof body.title === "string" ? body.title : "",
    body: typeof body.body === "string" ? body.body : "",
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, message: result.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true, message: result.message, review: result.review });
}
