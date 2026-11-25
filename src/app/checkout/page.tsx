"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Banknote, CreditCard, Lock, LoaderCircle } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { formatNaira, shippingKobo } from "@/lib/money";
import { PAYMENT_GATEWAYS, type PaymentGateway } from "@/lib/types";

export default function CheckoutPage() {
  const { lines, subtotalKobo } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [gateway, setGateway] = useState<PaymentGateway>("paystack");
  const delivery = shippingKobo(subtotalKobo);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const form = new FormData(event.currentTarget);
    const payload = {
      email: String(form.get("email") ?? "").trim(),
      customerName: String(form.get("customerName") ?? "").trim(),
      phone: String(form.get("phone") ?? "").trim(),
      address: String(form.get("address") ?? "").trim(),
      city: String(form.get("city") ?? "").trim(),
      state: String(form.get("state") ?? "").trim(),
      postalCode: String(form.get("postalCode") ?? "").trim(),
      gateway,
      items: lines.map((line) => ({
        productId: line.productId,
        variant: line.variant,
        quantity: line.quantity,
      })),
    };

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as {
        authorizationUrl?: string;
        reference?: string;
        demo?: boolean;
        manual?: boolean;
        message?: string;
      };
      if (!response.ok) throw new Error(data.message || "Checkout failed");

      if (data.authorizationUrl) {
        window.location.assign(data.authorizationUrl);
      } else if (data.demo && data.reference) {
        window.location.assign(`/order/${data.reference}?demo=1`);
      } else if (data.manual && data.reference) {
        window.location.assign(`/order/${data.reference}?manual=1`);
      } else {
        throw new Error("No payment destination was returned");
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-[900px] px-5 py-24 text-center sm:px-8">
        <p className="font-display text-5xl tracking-wide sm:text-7xl">Your bag is empty.</p>
        <p className="mt-4 text-sm text-muted">Add something before checking out.</p>
        <Link href="/collections/all" className="btn-primary mt-10">
          Shop all
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8 lg:py-24">
      <Link
        href="/cart"
        className="mb-10 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest2 text-muted hover:text-gold"
      >
        <ArrowLeft size={14} /> Back to cart
      </Link>
      <p className="eyebrow">Almost yours</p>
      <h1 className="mt-4 font-display text-6xl tracking-wide sm:text-8xl">Checkout</h1>

      <div className="mt-14 grid gap-12 lg:grid-cols-[1.3fr_1fr]">
        <form onSubmit={submit} className="space-y-8">
          <fieldset className="space-y-6">
            <legend className="eyebrow mb-6 border-b border-cream/15 pb-4 w-full">Contact</legend>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="customerName">Full name</label>
                <input id="customerName" name="customerName" required className="field" placeholder="Your name" />
              </div>
              <div>
                <label className="label" htmlFor="email">Email address</label>
                <input id="email" name="email" type="email" required className="field" placeholder="you@example.com" />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="phone">Phone number</label>
              <input id="phone" name="phone" type="tel" required className="field" placeholder="080 0000 0000" />
            </div>
          </fieldset>

          <fieldset className="space-y-6">
            <legend className="eyebrow mb-6 border-b border-cream/15 pb-4 w-full">Delivery address</legend>
            <div>
              <label className="label" htmlFor="address">Street address</label>
              <input id="address" name="address" required className="field" placeholder="House number and street" />
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="city">City</label>
                <input id="city" name="city" required className="field" placeholder="Lagos" />
              </div>
              <div>
                <label className="label" htmlFor="state">State</label>
                <input id="state" name="state" required className="field" placeholder="Lagos" />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="postalCode">Postal code (optional)</label>
              <input id="postalCode" name="postalCode" className="field" placeholder="100001" />
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="eyebrow mb-6 border-b border-cream/15 pb-4 w-full">Payment method</legend>
            <div className="grid gap-3">
              {PAYMENT_GATEWAYS.map((option) => {
                const active = gateway === option.id;
                const Icon = option.id === "manual" ? Banknote : CreditCard;
                return (
                  <label
                    key={option.id}
                    className={`flex cursor-pointer items-start gap-4 border p-4 transition-colors ${
                      active
                        ? "border-gold bg-gold/10"
                        : "border-cream/15 hover:border-cream/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="gateway"
                      value={option.id}
                      checked={active}
                      onChange={() => setGateway(option.id)}
                      className="mt-1 accent-[#c9a227]"
                    />
                    <Icon size={18} className="mt-0.5 shrink-0 text-gold" />
                    <span>
                      <span className="block text-sm font-semibold uppercase tracking-widest2">
                        {option.label}
                      </span>
                      <span className="mt-1 block text-xs text-muted">{option.detail}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {error && (
            <p role="alert" className="border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </p>
          )}

          <button type="submit" disabled={submitting} className="btn-primary w-full py-5">
            {submitting ? (
              <>
                <LoaderCircle size={17} className="animate-spin" /> Preparing payment…
              </>
            ) : (
              <>
                <Lock size={16} /> Pay {formatNaira(subtotalKobo + delivery)} with{" "}
                {gateway === "paystack"
                  ? "Paystack"
                  : gateway === "flutterwave"
                    ? "Flutterwave"
                    : "bank transfer"}
              </>
            )}
          </button>
          <p className="text-center text-xs text-muted">
            {gateway === "manual"
              ? "Your order will be reserved and we will share payment details by email."
              : `You will be redirected to ${gateway === "paystack" ? "Paystack" : "Flutterwave"} to complete payment securely.`}
          </p>
        </form>

        <aside className="h-fit border border-cream/15 bg-wine/20 p-7 lg:sticky lg:top-28">
          <p className="eyebrow mb-6">Your order</p>
          <div className="space-y-5 border-b border-cream/15 pb-6">
            {lines.map((line) => (
              <div key={line.key} className="flex items-start justify-between gap-4 text-sm">
                <div>
                  <p className="text-cream">{line.name}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {line.variant} · Qty {line.quantity}
                  </p>
                </div>
                <p className="shrink-0 tabular-nums">
                  {formatNaira(line.unitPriceKobo * line.quantity)}
                </p>
              </div>
            ))}
          </div>
          <dl className="mt-6 space-y-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd>{formatNaira(subtotalKobo)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Delivery</dt>
              <dd>{delivery === 0 ? "Free" : formatNaira(delivery)}</dd>
            </div>
            <div className="flex justify-between border-t border-cream/15 pt-5">
              <dt className="font-semibold uppercase tracking-widest2">Total</dt>
              <dd className="font-display text-3xl tracking-wide">
                {formatNaira(subtotalKobo + delivery)}
              </dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
