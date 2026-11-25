"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { CartItem } from "@/components/cart-item";
import { formatNaira } from "@/lib/money";

export function CartDrawer() {
  const { lines, count, subtotalKobo, isOpen, closeCart } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Shopping cart">
      <button
        type="button"
        className="absolute inset-0 bg-black/75"
        onClick={closeCart}
        aria-label="Close cart"
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md animate-drawer-in flex-col border-l border-cream/10 bg-ink shadow-2xl">
        <div className="flex items-center justify-between border-b border-cream/10 px-6 py-6">
          <div>
            <p className="eyebrow">Your bag</p>
            <h2 className="font-display text-3xl tracking-wide">
              {count} {count === 1 ? "item" : "items"}
            </h2>
          </div>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close cart"
            className="text-cream/70 transition-colors hover:text-gold"
          >
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6">
          {lines.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <p className="font-display text-4xl tracking-wide text-cream/80">Nothing in here yet.</p>
              <Link href="/collections/all" onClick={closeCart} className="btn-outline">
                Shop all
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-cream/10">
              {lines.map((line) => (
                <CartItem key={line.key} line={line} compact />
              ))}
            </div>
          )}
        </div>

        {lines.length > 0 && (
          <div className="border-t border-cream/10 px-6 py-6">
            <div className="mb-5 flex items-center justify-between text-sm">
              <span className="uppercase tracking-widest2 text-muted">Subtotal</span>
              <span className="font-display text-2xl tracking-wide">{formatNaira(subtotalKobo)}</span>
            </div>
            <p className="mb-5 text-xs text-muted">Shipping calculated at checkout.</p>
            <Link href="/checkout" onClick={closeCart} className="btn-primary w-full">
              Checkout
            </Link>
            <button
              type="button"
              onClick={closeCart}
              className="mt-4 w-full text-center text-[11px] uppercase tracking-widest2 text-muted hover:text-cream"
            >
              Continue shopping
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
