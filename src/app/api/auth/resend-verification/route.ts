import { NextResponse } from "next/server";
import { getCurrentUser, resendVerification } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, message: "Please sign in first." }, { status: 401 });
  }

  const result = await resendVerification(user);
  return NextResponse.json({
    ok: result.ok,
    message: result.message,
    emailSent: result.emailSent,
    devVerificationUrl: result.devVerificationUrl,
  });
}
