"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { addLine, cartCount, cartSubtotal, lineKey, updateQuantity } from "@/lib/cart";
import type { CartLine, Product } from "@/lib/types";

const STORAGE_KEY = "ws-storefront-cart";

interface CartContextValue {
  lines: CartLine[];
  count: number;
  subtotalKobo: number;
  hydrated: boolean;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product, variant: string, quantity: number) => void;
  setQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (Array.isArray(parsed)) setLines(parsed as CartLine[]);
      }
    } catch {
      setLines([]);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      count: cartCount(lines),
      subtotalKobo: cartSubtotal(lines),
      hydrated,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addItem: (product, variant, quantity) => {
        setLines((current) =>
          addLine(current, {
            key: lineKey(product.id, variant),
            productId: product.id,
            slug: product.slug,
            name: product.name,
            variant,
            image: product.imageFront,
            unitPriceKobo: product.priceKobo,
            quantity,
          }),
        );
        setIsOpen(true);
      },
      setQuantity: (key, quantity) =>
        setLines((current) => updateQuantity(current, key, quantity)),
      removeItem: (key) => setLines((current) => current.filter((line) => line.key !== key)),
      clear: () => setLines([]),
    }),
    [lines, hydrated, isOpen],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
