import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { NewsletterForm } from "@/components/newsletter-form";
import { ProductCard } from "@/components/product-card";
import { getProducts } from "@/lib/catalog";
import { CATEGORIES } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await getProducts({ limit: 8 });

  return (
    <>
      <section className="relative overflow-hidden border-b border-cream/10">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="outline-text select-none font-display text-[38vw] leading-none">WS</span>
        </div>
        <div className="relative mx-auto flex max-w-[1600px] flex-col items-center px-5 py-24 text-center sm:px-8 lg:py-36">
          <p className="eyebrow">Wristwear · Clothing · Fragrance</p>
          <h1 className="mt-8 font-display text-[5rem] leading-[0.82] tracking-wide sm:text-[9rem] lg:text-[12rem]">
            The collection
          </h1>
          <p className="mt-8 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
            Three ways to make an impression. Built for the ones who would rather be themselves.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link href="/collections/all" className="btn-primary">
              Shop all <ArrowUpRight size={16} />
            </Link>
            <Link href="/collections/watches" className="btn-outline">
              Explore watches
            </Link>
          </div>
        </div>
      </section>

      <div className="overflow-hidden border-b border-cream/10 bg-wine/40 py-5">
        <div className="flex min-w-max items-center justify-center gap-10 px-6 text-[11px] font-semibold uppercase tracking-widest2 text-cream/70 sm:gap-20">
          <span>WS vs everybody</span>
          <span className="text-gold">✦</span>
          <span>Watches</span>
          <span className="text-gold">✦</span>
          <span>Clothing</span>
          <span className="text-gold">✦</span>
          <span>Perfume</span>
          <span className="text-gold">✦</span>
          <span>Made to be worn</span>
        </div>
      </div>

      <section className="mx-auto max-w-[1600px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mb-12 flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow">New season</p>
            <h2 className="mt-3 font-display text-6xl tracking-wide sm:text-8xl">The collection</h2>
          </div>
          <Link
            href="/collections/all"
            className="hidden shrink-0 border-b border-cream/40 pb-1 text-[11px] font-semibold uppercase tracking-widest2 text-cream transition-colors hover:border-gold hover:text-gold sm:block"
          >
            Shop all ↗
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="border-y border-cream/10 bg-wine/20">
        <div className="mx-auto grid max-w-[1600px] gap-0 sm:grid-cols-3 sm:px-8 lg:px-12">
          {CATEGORIES.map((category, index) => (
            <Link
              key={category.slug}
              href={`/collections/${category.slug}`}
              className={`group relative overflow-hidden px-5 py-14 sm:px-8 lg:py-20 ${
                index > 0 ? "border-t border-cream/10 sm:border-l sm:border-t-0" : ""
              }`}
            >
              <span className="outline-text pointer-events-none absolute -right-4 top-2 select-none font-display text-[8rem] leading-none transition-all duration-300 group-hover:-translate-y-2">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="relative">
                <p className="eyebrow">Collection {String(index + 1).padStart(2, "0")}</p>
                <h3 className="mt-4 font-display text-5xl tracking-wide transition-colors group-hover:text-gold">
                  {category.label}
                </h3>
                <p className="mt-3 max-w-xs text-sm text-muted">{category.blurb}</p>
                <span className="mt-8 inline-block text-[11px] font-semibold uppercase tracking-widest2 text-cream/80">
                  Explore ↗
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-5 py-24 text-center sm:px-8 lg:px-12 lg:py-36">
        <p className="eyebrow">Stay connected</p>
        <h2 className="mt-5 font-display text-6xl tracking-wide sm:text-8xl">Tell everybody.</h2>
        <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-muted">
          Collection news, drops and restocks. Straight to your inbox.
        </p>
        <div className="mt-10 flex justify-center">
          <NewsletterForm />
        </div>
      </section>
    </>
  );
}
