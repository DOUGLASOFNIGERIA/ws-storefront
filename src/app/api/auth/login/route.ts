import { NextResponse } from "next/server";
import { loginUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const result = await loginUser({
    email: typeof body.email === "string" ? body.email : "",
    password: typeof body.password === "string" ? body.password : "",
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, message: result.message }, { status: 401 });
  }

  return NextResponse.json({ ok: true, message: result.message });
}
