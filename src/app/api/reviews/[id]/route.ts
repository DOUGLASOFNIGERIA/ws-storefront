import { NextResponse } from "next/server";
import { getCurrentUser, isAdminUser } from "@/lib/auth";
import { moderateReview } from "@/lib/reviews";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!(await isAdminUser(user))) {
    return NextResponse.json({ ok: false, message: "Not authorised." }, { status: 403 });
  }

  const { id } = await context.params;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  if (body.status !== "approved" && body.status !== "rejected") {
    return NextResponse.json({ ok: false, message: "Invalid status." }, { status: 400 });
  }

  const updated = await moderateReview(id, body.status);
  if (!updated) {
    return NextResponse.json({ ok: false, message: "Review not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true, message: `Review ${body.status}.` });
}
