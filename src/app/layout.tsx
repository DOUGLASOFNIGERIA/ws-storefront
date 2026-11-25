import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import { CartProvider } from "@/components/cart-provider";
import { CartDrawer } from "@/components/cart-drawer";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getCurrentUser } from "@/lib/auth";
import "./globals.css";

export const dynamic = "force-dynamic";

const display = Cormorant_Garamond({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "WS | Watches, Clothing & Perfume",
    template: "%s | WS",
  },
  description:
    "A small, considered edit of watches, clothing and fragrance from Lagos. Chosen to be worn, not just owned.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    title: "WS | Watches, Clothing & Perfume",
    description: "A small, considered edit of watches, clothing and fragrance from Lagos.",
    type: "website",
  },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>
        <CartProvider>
          <a
            href="#MainContent"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-cream focus:px-4 focus:py-2 focus:text-ink"
          >
            Skip to content
          </a>
          <SiteHeader
            user={user ? { name: user.name, emailVerified: user.emailVerified } : null}
          />
          <main id="MainContent" className="min-h-[60vh]">
            {children}
          </main>
          <SiteFooter />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
