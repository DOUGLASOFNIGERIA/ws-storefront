import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Clock3, X } from "lucide-react";
import { flutterwaveConfigured, verifyFlutterwavePayment } from "@/lib/flutterwave";
import { formatNaira } from "@/lib/money";
import { getOrderByReference, setOrderStatus } from "@/lib/orders";
import { demoPaymentsEnabled, paystackConfigured, verifyPayment } from "@/lib/paystack";

export const dynamic = "force-dynamic";
export const metadata = { title: "Order" };

interface PageProps {
  params: Promise<{ reference: string }>;
  searchParams: Promise<{ verify?: string; demo?: string; manual?: string }>;
}

export default async function OrderPage({ params, searchParams }: PageProps) {
  const { reference } = await params;
  const query = await searchParams;
  let order = await getOrderByReference(reference);
  if (!order) notFound();

  if (query.verify === "1" && order.status === "pending" && !demoPaymentsEnabled()) {
    try {
      let verification:
        | { ok: boolean; amountKobo: number; reference: string }
        | undefined;

      if (order.gateway === "flutterwave" && flutterwaveConfigured()) {
        verification = await verifyFlutterwavePayment(order.paystackReference ?? order.reference);
      } else if (order.gateway === "paystack" && paystackConfigured()) {
        verification = await verifyPayment(order.paystackReference ?? order.reference);
      }

      if (verification) {
        order =
          (await setOrderStatus(
            order.reference,
            verification.ok && verification.amountKobo === order.totalKobo ? "paid" : "failed",
            verification.reference,
          )) ?? order;
      }
    } catch (error) {
      console.error("Callback verification failed", error);
    }
  }

  const paid = order.status === "paid" || order.status === "demo_paid";
  const failed = order.status === "failed";
  const manual = order.status === "pending_manual";

  return (
    <div className="mx-auto max-w-[1000px] px-5 py-16 sm:px-8 lg:py-24">
      <div
        className={`border px-7 py-9 ${
          paid
            ? "border-gold/50 bg-wine/30"
            : failed
              ? "border-red-400/40 bg-red-500/10"
              : "border-cream/20 bg-wine/20"
        }`}
      >
        <div className="flex items-center gap-4">
          {paid ? (
            <Check size={30} className="text-gold" strokeWidth={1.4} />
          ) : failed ? (
            <X size={30} className="text-red-300" strokeWidth={1.4} />
          ) : (
            <Clock3 size={30} className="text-cream/70" strokeWidth={1.4} />
          )}
          <div>
            <p className="eyebrow">Order {order.reference}</p>
            <h1 className="mt-2 font-display text-5xl tracking-wide sm:text-6xl">
              {paid
                ? "It's yours."
                : failed
                  ? "Payment not completed."
                  : manual
                    ? "Bank transfer pending."
                    : "Awaiting payment."}
            </h1>
          </div>
        </div>
        <p className="mt-6 max-w-xl text-sm leading-relaxed text-cream/75">
          {paid
            ? `Thank you, ${order.customerName}. We've received your order and will send delivery updates to ${order.email}.`
            : failed
              ? "We couldn't confirm your payment. If your bank was charged, contact us with your order reference."
              : manual
                ? "Your order is reserved. Payment instructions have been sent to your email; we will dispatch once the transfer is confirmed."
                : "Your payment is still being confirmed. You can re-check the status below."}
        </p>
        {query.demo === "1" && order.status === "demo_paid" && (
          <p className="mt-5 border border-gold/40 px-4 py-3 text-xs uppercase tracking-wider text-gold">
            Demo checkout — no real payment was taken.
          </p>
        )}
        {order.status === "pending" && (
          <Link href={`/order/${order.reference}?verify=1`} className="btn-outline mt-7">
            Re-check payment
          </Link>
        )}
      </div>

      <div className="mt-14 grid gap-10 sm:grid-cols-2">
        <section>
          <p className="eyebrow mb-5">Items</p>
          <div className="divide-y divide-cream/10 border-y border-cream/10">
            {order.items.map((item) => (
              <div key={item.key} className="flex items-start justify-between gap-4 py-4 text-sm">
                <div>
                  <p>{item.name}</p>
                  <p className="mt-1 text-xs text-muted">
                    {item.variant} · Qty {item.quantity}
                  </p>
                </div>
                <p className="shrink-0 tabular-nums">
                  {formatNaira(item.unitPriceKobo * item.quantity)}
                </p>
              </div>
            ))}
          </div>
          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd>{formatNaira(order.subtotalKobo)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Delivery</dt>
              <dd>{order.shippingKobo === 0 ? "Free" : formatNaira(order.shippingKobo)}</dd>
            </div>
            <div className="flex justify-between border-t border-cream/15 pt-4 font-semibold">
              <dt>Total</dt>
              <dd className="font-display text-2xl tracking-wide">
                {formatNaira(order.totalKobo)}
              </dd>
            </div>
          </dl>
        </section>

        <section>
          <p className="eyebrow mb-5">Delivery to</p>
          <address className="space-y-1 text-sm not-italic text-cream/80">
            <p>{order.customerName}</p>
            <p>{order.address}</p>
            <p>
              {order.city}, {order.state} {order.postalCode}
            </p>
            <p>{order.country}</p>
            <p className="pt-3 text-muted">{order.phone}</p>
            <p className="text-muted">{order.email}</p>
            <p className="pt-3 text-muted">
              Payment method: {order.gateway === "manual" ? "Bank transfer" : order.gateway === "flutterwave" ? "Flutterwave" : "Paystack"}
            </p>
          </address>
          <Link href="/collections/all" className="btn-outline mt-10">
            Continue shopping
          </Link>
        </section>
      </div>
    </div>
  );
}
