import { NextResponse } from "next/server";
import { createSession, registerUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const result = await registerUser({
    name: typeof body.name === "string" ? body.name : "",
    email: typeof body.email === "string" ? body.email : "",
    password: typeof body.password === "string" ? body.password : "",
  });

  if (!result.ok || !result.user) {
    return NextResponse.json({ ok: false, message: result.message }, { status: 400 });
  }

  await createSession(result.user.id);
  return NextResponse.json({
    ok: true,
    message: result.message,
    emailSent: result.emailSent,
    devOtp: result.devOtp,
  });
}
