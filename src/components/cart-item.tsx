"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { formatNaira } from "@/lib/money";
import type { CartLine } from "@/lib/types";

export function CartItem({ line, compact = false }: { line: CartLine; compact?: boolean }) {
  const { setQuantity, removeItem } = useCart();

  return (
    <div className={`flex gap-4 py-5 ${compact ? "" : "border-b border-cream/10"}`}>
      <Link href={`/products/${line.slug}`} className="shrink-0 bg-wine/30">
        <Image
          src={line.image}
          alt={line.name}
          width={compact ? 96 : 140}
          height={compact ? 120 : 175}
          unoptimized
          className="h-auto w-[96px] object-cover sm:w-[110px]"
        />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-widest2 text-muted">{line.variant}</p>
            <Link
              href={`/products/${line.slug}`}
              className={`block truncate font-display tracking-wide hover:text-gold ${
                compact ? "text-2xl" : "text-3xl"
              }`}
            >
              {line.name}
            </Link>
            <p className="mt-1 text-sm text-cream/80">{formatNaira(line.unitPriceKobo)}</p>
          </div>
          <button
            type="button"
            onClick={() => removeItem(line.key)}
            aria-label={`Remove ${line.name}`}
            className="text-muted transition-colors hover:text-gold"
          >
            <Trash2 size={17} strokeWidth={1.5} />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center border border-cream/20">
            <button
              type="button"
              onClick={() => setQuantity(line.key, line.quantity - 1)}
              aria-label="Decrease quantity"
              className="px-3 py-2 text-cream/70 hover:text-gold"
            >
              <Minus size={14} />
            </button>
            <span className="min-w-8 text-center text-sm tabular-nums">{line.quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity(line.key, line.quantity + 1)}
              aria-label="Increase quantity"
              className="px-3 py-2 text-cream/70 hover:text-gold"
            >
              <Plus size={14} />
            </button>
          </div>
          <span className="font-display text-xl tracking-wide">
            {formatNaira(line.unitPriceKobo * line.quantity)}
          </span>
        </div>
      </div>
    </div>
  );
}
