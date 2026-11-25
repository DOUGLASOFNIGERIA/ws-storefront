"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/components/cart-provider";

const links = [
  { href: "/", label: "Home" },
  { href: "/collections/all", label: "Shop all" },
  { href: "/collections/watches", label: "Watches" },
  { href: "/collections/clothing", label: "Clothing" },
  { href: "/collections/perfume", label: "Fragrance" },
];

interface SiteHeaderProps {
  user?: { name: string; emailVerified: boolean } | null;
}

export function SiteHeader({ user }: SiteHeaderProps) {
  const pathname = usePathname();
  const { count, openCart, hydrated } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-cream/10 bg-ink/95 backdrop-blur-md">
      <div className="border-b border-cream/10">
        <div className="mx-auto flex h-8 max-w-[1600px] items-center justify-center px-5 text-[10px] uppercase tracking-widest2 text-muted sm:px-8">
          Complimentary delivery over ₦150,000 · Nationwide
        </div>
      </div>
      <div className="mx-auto flex h-[72px] max-w-[1600px] items-center justify-between gap-6 px-5 sm:px-8 lg:px-12">
        <Link href="/" className="group flex items-center gap-3" aria-label="WS home">
          <span className="font-display text-4xl leading-none tracking-[-0.02em] text-cream transition-colors group-hover:text-accent">
            WS
          </span>
          <span className="hidden h-7 w-px bg-cream/20 sm:block" />
          <span className="hidden text-[10px] uppercase tracking-widest2 text-muted sm:block">
            Lagos
          </span>
        </Link>

        <nav className="hidden items-center gap-9 lg:flex" aria-label="Main navigation">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`border-b pb-1 text-[10px] font-semibold uppercase tracking-widest2 transition-colors hover:text-accent ${
                  active ? "border-accent text-cream" : "border-transparent text-cream/75"
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
            className="text-cream/80 transition-colors hover:text-accent"
          >
            <Search size={19} strokeWidth={1.5} />
          </Link>
          <Link
            href={user ? "/account" : "/login"}
            aria-label={user ? "Open account" : "Sign in"}
            className="flex items-center gap-2 text-cream/80 transition-colors hover:text-accent"
          >
            <UserRound size={19} strokeWidth={1.5} />
            <span className="hidden text-[10px] font-semibold uppercase tracking-widest2 xl:block">
              {user ? (user.emailVerified ? "Account" : "Verify") : "Sign in"}
            </span>
          </Link>
          <button
            type="button"
            onClick={openCart}
            aria-label={`Open cart, ${count} items`}
            className="flex items-center gap-2 text-cream/80 transition-colors hover:text-accent"
          >
            <ShoppingBag size={19} strokeWidth={1.5} />
            <span className="text-xs tabular-nums">{hydrated ? count : 0}</span>
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            className="text-cream lg:hidden"
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="border-t border-cream/10 bg-ink px-5 py-7 lg:hidden" aria-label="Mobile navigation">
          <div className="mx-auto flex max-w-[1600px] flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="border-b border-cream/10 py-3 font-display text-4xl leading-none text-cream/90 hover:text-accent"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={user ? "/account" : "/login"}
              onClick={() => setMenuOpen(false)}
              className="border-b border-cream/10 py-3 font-display text-4xl leading-none text-accent"
            >
              {user ? (user.emailVerified ? "Account" : "Verify email") : "Sign in"}
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
