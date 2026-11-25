import { NextRequest, NextResponse } from "next/server";
import { addSubscriber } from "@/lib/orders";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { email?: unknown };
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ message: "Enter a valid email address." }, { status: 400 });
    }

    const added = await addSubscriber(email);
    return NextResponse.json({
      message: added ? "You're on the list." : "You're already on the list.",
    });
  } catch (error) {
    console.error("Newsletter signup failed", error);
    return NextResponse.json({ message: "Could not subscribe right now." }, { status: 500 });
  }
}
