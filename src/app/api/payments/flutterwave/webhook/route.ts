import { NextRequest, NextResponse } from "next/server";
import { verifyFlutterwaveWebhook } from "@/lib/flutterwave";
import { getOrderByReference, setOrderStatus } from "@/lib/orders";

export const runtime = "nodejs";

interface FlutterwaveEvent {
  event?: string;
  data?: { tx_ref?: string; amount?: number; status?: string };
}

export async function POST(request: NextRequest) {
  const raw = await request.text();

  let event: FlutterwaveEvent;
  try {
    event = JSON.parse(raw) as FlutterwaveEvent;
  } catch {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }

  try {
    if (!verifyFlutterwaveWebhook(raw, request.headers.get("verif-hash"))) {
      return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ message: "Webhook secret unavailable" }, { status: 500 });
  }

  const status = event.data?.status?.toLowerCase();
  if (event.event === "charge.completed" && status === "successful" && event.data?.tx_ref) {
    const reference = event.data.tx_ref;
    const order = await getOrderByReference(reference);
    const amountKobo = Math.round((event.data.amount ?? 0) * 100);
    if (order && order.gateway === "flutterwave" && order.totalKobo === amountKobo) {
      await setOrderStatus(reference, "paid", reference);
    }
  }

  return NextResponse.json({ received: true });
}
