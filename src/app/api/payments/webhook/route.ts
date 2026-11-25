import { NextRequest, NextResponse } from "next/server";
import { getOrderByReference, setOrderStatus } from "@/lib/orders";
import { verifyWebhookSignature } from "@/lib/paystack";

export const runtime = "nodejs";

interface PaystackEvent {
  event?: string;
  data?: { reference?: string; amount?: number; status?: string };
}

export async function POST(request: NextRequest) {
  const raw = await request.text();

  try {
    if (!verifyWebhookSignature(raw, request.headers.get("x-paystack-signature"))) {
      return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ message: "Webhook secret unavailable" }, { status: 500 });
  }

  let event: PaystackEvent;
  try {
    event = JSON.parse(raw) as PaystackEvent;
  } catch {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }

  if (event.event === "charge.success" && event.data?.reference) {
    const reference = event.data.reference;
    const order = await getOrderByReference(reference);
    if (order && order.totalKobo === event.data.amount) {
      await setOrderStatus(reference, "paid", reference);
    }
  }

  return NextResponse.json({ received: true });
}
