import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, RefreshCw, Truck } from "lucide-react";
import { AddToCart } from "@/components/add-to-cart";
import { ProductCard } from "@/components/product-card";
import { ProductReviews } from "@/components/product-reviews";
import { getProductBySlug, getProducts } from "@/lib/catalog";
import { formatNaira } from "@/lib/money";
import { CATEGORIES } from "@/lib/types";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return {
    title: product?.name ?? "Piece not found",
    description: product?.description,
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const category = CATEGORIES.find((item) => item.slug === product.category);
  const related = (await getProducts({ category: product.category, limit: 5 })).filter(
    (item) => item.id !== product.id,
  );

  return (
    <div className="mx-auto max-w-[1600px] px-5 pb-24 pt-10 sm:px-8 lg:px-12">
      <nav className="mb-10 flex items-center gap-2 text-[10px] uppercase tracking-widest2 text-muted">
        <Link href="/" className="hover:text-accent">
          Home
        </Link>
        <ChevronRight size={12} />
        <Link href={`/collections/${product.category}`} className="hover:text-accent">
          {category?.label}
        </Link>
        <ChevronRight size={12} />
        <span className="text-cream/80">{product.name}</span>
      </nav>

      <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
        <div className="grid grid-cols-5 gap-3 sm:gap-5">
          <div className="col-span-5 aspect-[4/5] overflow-hidden border border-cream/10 bg-wine/30 sm:col-span-3">
            <Image
              src={product.imageFront}
              alt={`${product.name}, front`}
              width={800}
              height={1000}
              unoptimized
              priority
              className="h-full w-full object-cover"
            />
          </div>
          <div className="col-span-5 aspect-[4/5] overflow-hidden border border-cream/10 bg-wine/30 sm:col-span-2">
            <Image
              src={product.imageBack}
              alt={`${product.name}, back`}
              width={800}
              height={1000}
              unoptimized
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        <div className="lg:sticky lg:top-32 lg:self-start">
          <p className="eyebrow">
            {category?.label} · {product.subtitle}
          </p>
          <h1 className="mt-5 font-display text-6xl leading-[0.88] tracking-[-0.03em] sm:text-7xl">
            {product.name}
          </h1>
          <div className="mt-7 flex items-center gap-4">
            <span className="font-display text-4xl text-accent">{formatNaira(product.priceKobo)}</span>
            {product.compareAtKobo && (
              <span className="text-sm text-muted line-through">
                {formatNaira(product.compareAtKobo)}
              </span>
            )}
          </div>
          <p className="mt-7 max-w-lg text-sm leading-relaxed text-cream/75">
            {product.description}
          </p>

          <AddToCart product={product} />

          <div className="mt-12 space-y-5 border-t border-cream/15 pt-8 text-sm text-muted">
            <p className="flex items-start gap-3">
              <Truck size={18} className="mt-0.5 shrink-0 text-accent" strokeWidth={1.5} />
              Free delivery on orders over ₦150,000. Otherwise ₦2,500 nationwide.
            </p>
            <p className="flex items-start gap-3">
              <RefreshCw size={18} className="mt-0.5 shrink-0 text-accent" strokeWidth={1.5} />
              Unworn items can be returned within 14 days of delivery.
            </p>
          </div>
        </div>
      </div>

      <ProductReviews productId={product.id} />

      {related.length > 0 && (
        <section className="mt-28 border-t border-cream/10 pt-14">
          <div className="mb-10 flex items-end justify-between gap-6">
            <h2 className="font-display text-5xl tracking-[-0.02em] sm:text-6xl">
              More from {category?.label}
            </h2>
            <Link
              href={`/collections/${product.category}`}
              className="hidden text-[10px] font-semibold uppercase tracking-widest2 text-cream/80 hover:text-accent sm:block"
            >
              View all ↗
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8">
            {related.slice(0, 4).map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
