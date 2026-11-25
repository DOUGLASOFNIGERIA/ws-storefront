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
    description: category?.blurb ?? "The complete WS edit: watches, clothing and fragrance.",
  };
}

export default async function CollectionPage({ params }: PageProps) {
  const { slug } = await params;
  if (slug !== "all" && !isCategory(slug)) notFound();

  const category = CATEGORIES.find((item) => item.slug === slug);
  const products = await getProducts(slug === "all" ? {} : { category: slug });

  return (
    <div className="mx-auto max-w-[1600px] px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
      <div className="mb-12 border-b border-cream/10 pb-10">
        <p className="eyebrow">
          <Link href="/" className="hover:text-accent">
            Home
          </Link>{" "}
          / {category ? category.label : "Shop all"}
        </p>
        <h1 className="mt-5 font-display text-6xl leading-[0.9] tracking-[-0.03em] sm:text-8xl">
          {category ? category.label : "Shop all"}
        </h1>
        <p className="mt-5 max-w-lg text-sm leading-relaxed text-muted">
          {category?.blurb ?? "Every watch, garment and scent in one place. Chosen with the same careful eye."}
        </p>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        <Link
          href="/collections/all"
          className={`border px-5 py-2.5 text-[10px] font-semibold uppercase tracking-widest2 transition-colors ${
            slug === "all"
              ? "border-accent bg-accent text-cream"
              : "border-cream/20 text-cream/75 hover:border-accent hover:text-accent"
          }`}
        >
          All
        </Link>
        {CATEGORIES.map((item) => (
          <Link
            key={item.slug}
            href={`/collections/${item.slug}`}
            className={`border px-5 py-2.5 text-[10px] font-semibold uppercase tracking-widest2 transition-colors ${
              slug === item.slug
                ? "border-accent bg-accent text-cream"
                : "border-cream/20 text-cream/75 hover:border-accent hover:text-accent"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <p className="mb-8 text-[10px] uppercase tracking-widest2 text-muted">
        {products.length} {products.length === 1 ? "piece" : "pieces"}
      </p>

      {products.length === 0 ? (
        <div className="border border-cream/15 py-24 text-center">
          <p className="font-display text-4xl tracking-[-0.02em]">Nothing here yet.</p>
          <Link href="/collections/all" className="btn-outline mt-8">
            Shop all
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
