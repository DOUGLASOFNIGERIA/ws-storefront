import Link from "next/link";

const links = [
  { href: "/collections/all", label: "Shop all" },
  { href: "/collections/watches", label: "Watches" },
  { href: "/collections/clothing", label: "Clothing" },
  { href: "/collections/perfume", label: "Fragrance" },
  { href: "/search", label: "Search" },
  { href: "/cart", label: "Cart" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-cream/10 bg-wine/20">
      <div className="mx-auto max-w-[1600px] px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr] lg:gap-20">
          <div>
            <Link href="/" className="font-display text-6xl leading-none tracking-[-0.02em] text-cream">
              WS
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted">
              A small, considered edit of watches, clothing and fragrance. Selected in Lagos, worn
              wherever.
            </p>
          </div>
          <div>
            <p className="eyebrow mb-5">Shop</p>
            <ul className="space-y-3 text-sm text-cream/80">
              {links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition-colors hover:text-accent">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow mb-5">Help</p>
            <ul className="space-y-3 text-sm text-cream/80">
              <li>Delivery across Nigeria</li>
              <li>Returns within 14 days</li>
              <li>hello@ws-store.example</li>
            </ul>
          </div>
        </div>
        <div className="mt-16 flex flex-col gap-3 border-t border-cream/10 pt-6 text-[10px] uppercase tracking-widest2 text-muted sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} WS. All rights reserved.</span>
          <span>Selected in Lagos · Worn everywhere</span>
        </div>
      </div>
    </footer>
  );
}
