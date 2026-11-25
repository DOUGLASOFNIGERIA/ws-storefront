import Link from "next/link";
import { Search } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { getProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export const metadata = { title: "Search" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const term = q?.trim() ?? "";
  const results = term ? await getProducts({ search: term }) : [];

  return (
    <div className="mx-auto max-w-[1600px] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
      <p className="eyebrow">Find your piece</p>
      <h1 className="mt-4 font-display text-6xl tracking-[-0.01em] sm:text-7xl">Search</h1>

      <form action="/search" method="get" className="mt-10 max-w-2xl">
        <div className="flex border border-cream/30 focus-within:border-accent">
          <label htmlFor="search-q" className="sr-only">
            Search products
          </label>
          <input
            id="search-q"
            name="q"
            type="search"
            defaultValue={term}
            placeholder="Try 'chronograph', 'hoodie' or 'oud'"
            className="min-w-0 flex-1 bg-transparent px-5 py-4 text-sm outline-none placeholder:text-muted/70"
          />
          <button
            type="submit"
            aria-label="Search"
            className="flex w-16 items-center justify-center border-l border-cream/30 text-cream hover:bg-accent hover:text-ink"
          >
            <Search size={19} />
          </button>
        </div>
      </form>

      {term && (
        <p className="mt-8 text-xs uppercase tracking-widest2 text-muted">
          {results.length} {results.length === 1 ? "result" : "results"} for “{term}”
        </p>
      )}

      {term && results.length === 0 ? (
        <div className="mt-10 border border-cream/15 px-6 py-20 text-center">
          <p className="font-display text-4xl tracking-[-0.01em]">No matches.</p>
          <p className="mt-3 text-sm text-muted">Try another word, or browse the full collection.</p>
          <Link href="/collections/all" className="btn-outline mt-8">
            Shop all
          </Link>
        </div>
      ) : (
        <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8">
          {results.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
