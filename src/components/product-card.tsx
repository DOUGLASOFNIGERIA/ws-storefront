import Image from "next/image";
import Link from "next/link";
import { formatNaira } from "@/lib/money";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden border border-cream/10 bg-wine/30">
        <Image
          src={product.imageFront}
          alt={`${product.name}, front`}
          width={800}
          height={1000}
          unoptimized
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
        <span className="absolute bottom-3 right-3 translate-y-1 bg-cream px-3 py-2 text-[9px] font-semibold uppercase tracking-widest2 text-ink opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          View piece ↗
        </span>
        {product.compareAtKobo && (
          <span className="absolute left-3 top-3 border border-cream/40 bg-ink/70 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-widest2 text-cream backdrop-blur-sm">
            Reduced
          </span>
        )}
      </div>
      <div className="mt-4 flex items-start justify-between gap-4 border-t border-cream/10 pt-4">
        <div className="min-w-0">
          <p className="truncate text-[10px] uppercase tracking-widest2 text-muted">
            {product.category} · {product.subtitle}
          </p>
          <h3 className="mt-1.5 truncate font-display text-2xl leading-tight text-cream transition-colors group-hover:text-accent sm:text-3xl">
            {product.name}
          </h3>
        </div>
        <p className="shrink-0 pt-1 text-sm tabular-nums text-cream/90">
          {formatNaira(product.priceKobo)}
        </p>
      </div>
    </Link>
  );
}
