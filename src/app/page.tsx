import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { NewsletterForm } from "@/components/newsletter-form";
import { ProductCard } from "@/components/product-card";
import { getProducts } from "@/lib/catalog";
import { CATEGORIES } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await getProducts({ limit: 8 });
  const featured = products.find((product) => product.id === "ws-w-01") ?? products[0];

  return (
    <>
      <section className="border-b border-cream/10">
        <div className="mx-auto grid max-w-[1600px] gap-14 px-5 py-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-20 lg:px-12 lg:py-24">
          <div>
            <p className="eyebrow">Independent edit · Lagos</p>
            <h1 className="mt-6 font-display text-[4.25rem] leading-[0.88] tracking-[-0.03em] sm:text-[6.5rem] lg:text-[7.5rem]">
              Objects with presence.
            </h1>
            <p className="mt-8 max-w-md text-sm leading-relaxed text-muted sm:text-base">
              Watches, garments and scent chosen one piece at a time. Considered, dependable and
              made for the way you actually dress.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link href="/collections/all" className="btn-primary">
                Shop the edit <ArrowUpRight size={16} />
              </Link>
              <Link href="/collections/watches" className="btn-outline">
                Explore watches
              </Link>
            </div>
            <div className="mt-14 grid max-w-lg grid-cols-3 gap-6 border-t border-cream/10 pt-6">
              <div>
                <p className="font-display text-3xl text-cream">12</p>
                <p className="mt-1 text-[10px] uppercase tracking-widest2 text-muted">Pieces</p>
              </div>
              <div>
                <p className="font-display text-3xl text-cream">03</p>
                <p className="mt-1 text-[10px] uppercase tracking-widest2 text-muted">Categories</p>
              </div>
              <div>
                <p className="font-display text-3xl text-cream">NG</p>
                <p className="mt-1 text-[10px] uppercase tracking-widest2 text-muted">Nationwide</p>
              </div>
            </div>
          </div>

          {featured && (
            <div className="relative mx-auto w-full max-w-[620px] lg:max-w-none">
              <div className="aspect-[4/5] overflow-hidden border border-cream/10 bg-wine/30">
                <Image
                  src={featured.imageFront}
                  alt={`${featured.name}, front`}
                  width={800}
                  height={1000}
                  unoptimized
                  priority
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-4 hidden border border-cream/15 bg-ink px-6 py-5 shadow-2xl sm:block lg:-left-10">
                <p className="eyebrow">Featured piece</p>
                <p className="mt-2 font-display text-3xl leading-none text-cream">{featured.name}</p>
                <p className="mt-2 text-xs text-muted">{featured.subtitle}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mb-12 flex items-end justify-between gap-6 border-b border-cream/10 pb-6">
          <div>
            <p className="eyebrow">Just in</p>
            <h2 className="mt-3 font-display text-5xl tracking-[-0.02em] sm:text-7xl">
              Recent arrivals
            </h2>
          </div>
          <Link
            href="/collections/all"
            className="hidden shrink-0 border-b border-cream/40 pb-1 text-[10px] font-semibold uppercase tracking-widest2 text-cream transition-colors hover:border-accent hover:text-accent sm:block"
          >
            View all ↗
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="border-y border-cream/10 bg-wine/20">
        <div className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12">
          <div className="border-b border-cream/10 py-14 lg:py-20">
            <p className="eyebrow">The edit</p>
            <h2 className="mt-3 font-display text-5xl tracking-[-0.02em] sm:text-7xl">
              Three ways to get dressed.
            </h2>
          </div>
          <div className="divide-y divide-cream/10">
            {CATEGORIES.map((category, index) => {
              const image = products.find((product) => product.category === category.slug)?.imageFront;
              return (
                <Link
                  key={category.slug}
                  href={`/collections/${category.slug}`}
                  className="group grid grid-cols-[44px_1fr_auto] items-center gap-5 py-8 sm:grid-cols-[72px_1fr_auto] sm:gap-8"
                >
                  <div className="h-16 w-11 overflow-hidden border border-cream/10 bg-wine/30 sm:h-24 sm:w-[72px]">
                    {image && (
                      <Image
                        src={image}
                        alt=""
                        width={160}
                        height={200}
                        unoptimized
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest2 text-muted">
                      {String(index + 1).padStart(2, "0")} / {category.label}
                    </p>
                    <h3 className="mt-2 font-display text-4xl leading-none text-cream transition-colors group-hover:text-accent sm:text-5xl">
                      {category.label}
                    </h3>
                    <p className="mt-2 max-w-md text-xs leading-relaxed text-muted sm:text-sm">
                      {category.blurb}
                    </p>
                  </div>
                  <ArrowUpRight
                    size={20}
                    className="text-muted transition-all group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-accent"
                  />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:gap-20">
          <div>
            <p className="eyebrow">From the studio</p>
            <h2 className="mt-4 font-display text-5xl leading-[0.95] tracking-[-0.02em] sm:text-7xl">
              Notes on new pieces, restocks and the occasional good story.
            </h2>
          </div>
          <div>
            <p className="mb-6 max-w-md text-sm leading-relaxed text-muted">
              No noise. Just the things worth knowing about, sent when there is something to say.
            </p>
            <NewsletterForm />
          </div>
        </div>
      </section>
    </>
  );
}
