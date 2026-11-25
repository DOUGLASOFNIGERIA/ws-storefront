"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { normalizeQuantity } from "@/lib/cart";
import { formatNaira } from "@/lib/money";
import type { Product } from "@/lib/types";

export function AddToCart({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [variant, setVariant] = useState(product.variants[0]?.name ?? "Default");
  const [quantity, setQuantity] = useState(1);

  const stock =
    product.variants.find((option) => option.name === variant)?.stock ?? 0;
  const soldOut = stock <= 0;

  return (
    <div className="mt-10">
      {product.variants.length > 0 && (
        <div className="mb-7">
          <p className="label">
            {product.category === "clothing" ? "Select size" : "Select option"}
          </p>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((option) => (
              <button
                key={option.name}
                type="button"
                onClick={() => {
                  setVariant(option.name);
                  setQuantity(1);
                }}
                aria-pressed={variant === option.name}
                className={`min-w-14 border px-4 py-3 text-xs uppercase tracking-wider transition-colors ${
                  variant === option.name
                    ? "border-gold bg-gold text-ink"
                    : "border-cream/25 text-cream/80 hover:border-cream/60"
                }`}
              >
                {option.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mb-7 flex items-center gap-6">
        <p className="label mb-0">Quantity</p>
        <div className="flex items-center border border-cream/25">
          <button
            type="button"
            onClick={() => setQuantity((current) => Math.max(1, current - 1))}
            aria-label="Decrease quantity"
            className="px-4 py-3 text-cream/70 hover:text-gold"
          >
            <Minus size={15} />
          </button>
          <span className="w-8 text-center text-sm tabular-nums">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((current) => normalizeQuantity(current + 1, stock))}
            aria-label="Increase quantity"
            className="px-4 py-3 text-cream/70 hover:text-gold"
          >
            <Plus size={15} />
          </button>
        </div>
        <span className="text-xs text-muted">
          {soldOut ? "Sold out" : `${stock} available`}
        </span>
      </div>

      <button
        type="button"
        disabled={soldOut}
        onClick={() => addItem(product, variant, quantity)}
        className="btn-primary w-full sm:w-auto"
      >
        <ShoppingBag size={17} strokeWidth={1.6} />
        {soldOut ? "Sold out" : `Add to bag — ${formatNaira(product.priceKobo * quantity)}`}
      </button>
    </div>
  );
}
