"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { CartItem } from "@/components/cart-item";
import { formatNaira, shippingKobo } from "@/lib/money";

export default function CartPage() {
  const { lines, subtotalKobo, hydrated } = useCart();
  const delivery = lines.length > 0 ? shippingKobo(subtotalKobo) : 0;

  return (
    <div className="mx-auto max-w-[1200px] px-5 py-16 sm:px-8 lg:py-24">
      <p className="eyebrow">Your bag</p>
      <h1 className="mt-4 font-display text-6xl tracking-[-0.01em] sm:text-7xl">The cart</h1>

      {!hydrated ? (
        <p className="mt-16 text-sm text-muted">Loading your bag…</p>
      ) : lines.length === 0 ? (
        <div className="mt-14 border border-cream/15 px-6 py-24 text-center">
          <p className="font-display text-4xl tracking-[-0.01em]">Your bag is empty.</p>
          <p className="mt-3 text-sm text-muted">The collection is waiting.</p>
          <Link href="/collections/all" className="btn-primary mt-8">
            Shop all
          </Link>
        </div>
      ) : (
        <div className="mt-14 grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          <div>
            {lines.map((line) => (
              <CartItem key={line.key} line={line} />
            ))}
            <Link
              href="/collections/all"
              className="mt-8 inline-block text-[11px] font-semibold uppercase tracking-widest2 text-muted hover:text-accent"
            >
              ← Continue shopping
            </Link>
          </div>
          <aside className="h-fit border border-cream/15 bg-wine/20 p-7 lg:sticky lg:top-28">
            <p className="eyebrow mb-6">Order summary</p>
            <dl className="space-y-4 text-sm">
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
                <dd className="font-display text-3xl tracking-[-0.01em]">
                  {formatNaira(subtotalKobo + delivery)}
                </dd>
              </div>
            </dl>
            <p className="mt-4 text-xs leading-relaxed text-muted">
              Taxes included. Delivery details are collected at checkout.
            </p>
            <Link href="/checkout" className="btn-primary mt-8 w-full">
              Checkout <ArrowRight size={16} />
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
