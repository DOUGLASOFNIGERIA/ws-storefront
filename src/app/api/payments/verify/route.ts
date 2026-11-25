import { NextRequest, NextResponse } from "next/server";
import { verifyFlutterwavePayment, flutterwaveConfigured } from "@/lib/flutterwave";
import { getOrderByReference, setOrderStatus } from "@/lib/orders";
import { paystackConfigured, verifyPayment } from "@/lib/paystack";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { reference?: string };
    if (typeof body.reference !== "string" || !body.reference) {
      return NextResponse.json({ message: "Reference is required" }, { status: 400 });
    }

    const order = await getOrderByReference(body.reference);
    if (!order) return NextResponse.json({ message: "Order not found" }, { status: 404 });
    if (order.status === "paid" || order.status === "demo_paid") {
      return NextResponse.json({ ok: true, status: order.status });
    }
    if (order.gateway === "manual") {
      return NextResponse.json({ ok: false, status: order.status, message: "Awaiting bank transfer confirmation." });
    }

    if (order.gateway === "flutterwave") {
      if (!flutterwaveConfigured()) {
        return NextResponse.json({ message: "Flutterwave is not configured" }, { status: 503 });
      }
      const verification = await verifyFlutterwavePayment(order.paystackReference ?? order.reference);
      if (verification.ok && verification.amountKobo === order.totalKobo) {
        const updated = await setOrderStatus(order.reference, "paid", verification.reference);
        return NextResponse.json({ ok: true, status: updated?.status ?? "paid" });
      }
      await setOrderStatus(order.reference, "failed");
      return NextResponse.json({ ok: false, status: verification.status });
    }

    if (!paystackConfigured()) {
      return NextResponse.json({ message: "Paystack is not configured" }, { status: 503 });
    }

    const verification = await verifyPayment(order.paystackReference ?? order.reference);
    if (verification.ok && verification.amountKobo === order.totalKobo) {
      const updated = await setOrderStatus(order.reference, "paid", verification.reference);
      return NextResponse.json({ ok: true, status: updated?.status ?? "paid" });
    }

    await setOrderStatus(order.reference, "failed");
    return NextResponse.json({ ok: false, status: verification.status });
  } catch (error) {
    console.error("Payment verification failed", error);
    return NextResponse.json({ message: "Verification failed" }, { status: 500 });
  }
}
