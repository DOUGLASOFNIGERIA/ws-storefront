import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { getProducts } from "@/lib/catalog";
import { CATEGORIES, isCategory } from "@/lib/types";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = CATEGORIES.find((item) => item.slug === slug);
  return {
    title: category ? category.label : "Shop all",
    description: category?.blurb ?? "The complete WS collection.",
  };
}

export default async function CollectionPage({ params }: PageProps) {
  const { slug } = await params;
  if (slug !== "all" && !isCategory(slug)) notFound();

  const category = CATEGORIES.find((item) => item.slug === slug);
  const products = await getProducts(slug === "all" ? {} : { category: slug });

  return (
    <div className="mx-auto max-w-[1600px] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
      <div className="relative mb-14 overflow-hidden border-b border-cream/10 pb-12">
        <span className="outline-text pointer-events-none absolute -top-10 right-0 select-none font-display text-[10rem] leading-none lg:text-[16rem]">
          WS
        </span>
        <p className="eyebrow relative">
          <Link href="/" className="hover:text-gold">
            Home
          </Link>{" "}
          / {category ? category.label : "Shop all"}
        </p>
        <h1 className="relative mt-6 font-display text-6xl tracking-wide sm:text-8xl lg:text-[10rem]">
          {category ? category.label : "Shop all"}
        </h1>
        <p className="relative mt-4 max-w-lg text-sm text-muted">
          {category?.blurb ?? "Every watch, every piece of clothing, every scent. One place."}
        </p>
      </div>

      <div className="mb-10 flex flex-wrap gap-3">
        <Link
          href="/collections/all"
          className={`border px-5 py-2.5 text-[11px] font-semibold uppercase tracking-widest2 transition-colors ${
            slug === "all"
              ? "border-gold bg-gold text-ink"
              : "border-cream/25 text-cream/80 hover:border-gold hover:text-gold"
          }`}
        >
          All
        </Link>
        {CATEGORIES.map((item) => (
          <Link
            key={item.slug}
            href={`/collections/${item.slug}`}
            className={`border px-5 py-2.5 text-[11px] font-semibold uppercase tracking-widest2 transition-colors ${
              slug === item.slug
                ? "border-gold bg-gold text-ink"
                : "border-cream/25 text-cream/80 hover:border-gold hover:text-gold"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <p className="mb-8 text-xs uppercase tracking-widest2 text-muted">
        {products.length} {products.length === 1 ? "product" : "products"}
      </p>

      {products.length === 0 ? (
        <div className="border border-cream/15 py-24 text-center">
          <p className="font-display text-4xl tracking-wide">Nothing here yet.</p>
          <Link href="/collections/all" className="btn-outline mt-8">
            Shop all
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
