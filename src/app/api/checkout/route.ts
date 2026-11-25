import { NextRequest, NextResponse } from "next/server";
import { lineKey } from "@/lib/cart";
import { getProductById } from "@/lib/catalog";
import { shippingKobo } from "@/lib/money";
import { flutterwaveConfigured, initializeFlutterwavePayment } from "@/lib/flutterwave";
import { createOrder, setOrderStatus } from "@/lib/orders";
import { demoPaymentsEnabled, initializePayment, paystackConfigured } from "@/lib/paystack";
import {
  isPaymentGateway,
  type CartLine,
  type CheckoutInput,
  type PaymentGateway,
} from "@/lib/types";

export const runtime = "nodejs";

function required(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<CheckoutInput>;
    const gateway: PaymentGateway = isPaymentGateway(body.gateway) ? body.gateway : "paystack";

    if (
      !required(body.email) ||
      !required(body.customerName) ||
      !required(body.phone) ||
      !required(body.address) ||
      !required(body.city) ||
      !required(body.state)
    ) {
      return NextResponse.json({ message: "Please complete all required fields." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return NextResponse.json({ message: "Enter a valid email address." }, { status: 400 });
    }
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ message: "Your bag is empty." }, { status: 400 });
    }

    const lines: CartLine[] = [];
    for (const item of body.items) {
      if (!item || typeof item.productId !== "string") {
        return NextResponse.json({ message: "Invalid cart item." }, { status: 400 });
      }
      const product = await getProductById(item.productId);
      if (!product) {
        return NextResponse.json({ message: "A product in your bag is unavailable." }, { status: 400 });
      }
      const variant = product.variants.find((option) => option.name === item.variant);
      if (!variant) {
        return NextResponse.json({ message: `Invalid option for ${product.name}.` }, { status: 400 });
      }
      const quantity = Math.floor(Number(item.quantity));
      if (!Number.isFinite(quantity) || quantity < 1 || quantity > variant.stock) {
        return NextResponse.json({ message: `Invalid quantity for ${product.name}.` }, { status: 400 });
      }
      lines.push({
        key: lineKey(product.id, variant.name),
        productId: product.id,
        slug: product.slug,
        name: product.name,
        variant: variant.name,
        image: product.imageFront,
        unitPriceKobo: product.priceKobo,
        quantity,
      });
    }

    const subtotalKobo = lines.reduce(
      (total, line) => total + line.unitPriceKobo * line.quantity,
      0,
    );
    const deliveryKobo = shippingKobo(subtotalKobo);

    const order = await createOrder({
      input: {
        email: body.email.trim(),
        customerName: body.customerName.trim(),
        phone: body.phone.trim(),
        address: body.address.trim(),
        city: body.city.trim(),
        state: body.state.trim(),
        postalCode: typeof body.postalCode === "string" ? body.postalCode.trim() : undefined,
        country: "Nigeria",
        gateway,
      },
      lines,
      subtotalKobo,
      shippingKobo: deliveryKobo,
      totalKobo: subtotalKobo + deliveryKobo,
    });

    if (demoPaymentsEnabled()) {
      await setOrderStatus(order.reference, "demo_paid");
      return NextResponse.json({ demo: true, reference: order.reference });
    }

    const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
    const baseUrl = configuredUrl || request.nextUrl.origin;
    const callbackUrl = `${baseUrl}/order/${order.reference}?verify=1`;
    const metadata = {
      order_reference: order.reference,
      customer_name: order.customerName,
      gateway,
      items: lines.map((line) => `${line.name} x${line.quantity}`),
    };

    if (gateway === "manual") {
      await setOrderStatus(order.reference, "pending_manual");
      return NextResponse.json({ manual: true, reference: order.reference });
    }

    if (gateway === "flutterwave") {
      if (!flutterwaveConfigured()) {
        await setOrderStatus(order.reference, "failed");
        return NextResponse.json(
          { message: "Flutterwave is not configured. Set FLW_SECRET_KEY or choose another method." },
          { status: 503 },
        );
      }
      const payment = await initializeFlutterwavePayment({
        email: order.email,
        customerName: order.customerName,
        amountKobo: order.totalKobo,
        reference: order.reference,
        callbackUrl,
        metadata,
      });
      return NextResponse.json({ authorizationUrl: payment.authorizationUrl, reference: order.reference });
    }

    if (!paystackConfigured()) {
      await setOrderStatus(order.reference, "failed");
      return NextResponse.json(
        { message: "Paystack is not configured. Set PAYSTACK_SECRET_KEY or choose another method." },
        { status: 503 },
      );
    }

    const payment = await initializePayment({
      email: order.email,
      amountKobo: order.totalKobo,
      reference: order.reference,
      callbackUrl,
      metadata,
    });

    return NextResponse.json({ authorizationUrl: payment.authorizationUrl, reference: order.reference });
  } catch (error) {
    console.error("Checkout failed", error);
    return NextResponse.json({ message: "Checkout could not be completed. Please try again." }, { status: 500 });
  }
}
