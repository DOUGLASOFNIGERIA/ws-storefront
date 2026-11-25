import { NextResponse } from "next/server";
import { getCurrentUser, verifyOtpForUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, message: "Please sign in first." }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const code = typeof body.code === "string" ? body.code.trim() : "";
  const result = await verifyOtpForUser(user, code);
  return NextResponse.json(
    { ok: result.ok, message: result.message },
    { status: result.ok ? 200 : 400 },
  );
}
