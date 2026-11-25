"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/components/cart-provider";

const links = [
  { href: "/", label: "Home" },
  { href: "/collections/all", label: "Shop all" },
  { href: "/collections/watches", label: "Watches" },
  { href: "/collections/clothing", label: "Clothing" },
  { href: "/collections/perfume", label: "Perfume" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { count, openCart, hydrated } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-cream/10 bg-ink/90 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-[1600px] items-center justify-between gap-6 px-5 sm:px-8 lg:px-12">
        <Link href="/" className="group flex items-baseline gap-3" aria-label="WS home">
          <span className="font-display text-4xl leading-none tracking-wide text-cream transition-colors group-hover:text-gold">
            WS
          </span>
          <span className="hidden text-[9px] font-semibold uppercase tracking-widest2 text-muted sm:block">
            Vs Everybody
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Main navigation">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[11px] font-semibold uppercase tracking-widest2 transition-colors hover:text-gold ${
                  active ? "text-gold" : "text-cream/80"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-5">
          <Link
            href="/search"
            aria-label="Search products"
            className="text-cream/80 transition-colors hover:text-gold"
          >
            <Search size={20} strokeWidth={1.5} />
          </Link>
          <button
            type="button"
            onClick={openCart}
            aria-label={`Open cart, ${count} items`}
            className="flex items-center gap-2 text-cream/80 transition-colors hover:text-gold"
          >
            <ShoppingBag size={20} strokeWidth={1.5} />
            <span className="text-xs tabular-nums">{hydrated ? count : 0}</span>
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            className="text-cream lg:hidden"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="border-t border-cream/10 bg-ink px-5 py-6 lg:hidden" aria-label="Mobile navigation">
          <div className="mx-auto flex max-w-[1600px] flex-col gap-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="font-display text-3xl tracking-wide text-cream/90 hover:text-gold"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
