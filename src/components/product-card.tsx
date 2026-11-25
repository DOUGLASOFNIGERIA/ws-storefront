import Image from "next/image";
import Link from "next/link";
import { formatNaira } from "@/lib/money";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.slug}`} className="group block animate-fade-up">
      <div className="relative aspect-[4/5] overflow-hidden bg-wine/30">
        <Image
          src={product.imageFront}
          alt={`${product.name}, front`}
          width={800}
          height={1000}
          unoptimized
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500 group-hover:opacity-0"
        />
        <Image
          src={product.imageBack}
          alt={`${product.name}, back`}
          width={800}
          height={1000}
          unoptimized
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />
        <span className="absolute bottom-4 right-4 translate-y-2 bg-cream px-3 py-2 text-[10px] font-bold uppercase tracking-widest2 text-ink opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          View product ↗
        </span>
        {product.compareAtKobo && (
          <span className="absolute left-4 top-4 bg-wine px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest2 text-cream">
            Sale
          </span>
        )}
      </div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[10px] uppercase tracking-widest2 text-muted">
            {product.subtitle}
          </p>
          <h3 className="mt-1 truncate font-display text-2xl tracking-wide text-cream transition-colors group-hover:text-gold">
            {product.name}
          </h3>
        </div>
        <p className="shrink-0 pt-5 text-sm tabular-nums text-cream/90">
          {formatNaira(product.priceKobo)}
        </p>
      </div>
    </Link>
  );
}
