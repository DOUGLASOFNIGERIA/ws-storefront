import type { CartLine } from "./types";

export function lineKey(productId: string, variant: string): string {
  return `${productId}::${variant}`;
}

export function cartCount(lines: CartLine[]): number {
  return lines.reduce((total, line) => total + line.quantity, 0);
}

export function cartSubtotal(lines: CartLine[]): number {
  return lines.reduce((total, line) => total + line.unitPriceKobo * line.quantity, 0);
}

export function addLine(lines: CartLine[], incoming: CartLine): CartLine[] {
  const existing = lines.find((line) => line.key === incoming.key);
  if (!existing) return [...lines, incoming];
  return lines.map((line) =>
    line.key === incoming.key
      ? { ...line, quantity: line.quantity + incoming.quantity }
      : line,
  );
}

export function updateQuantity(lines: CartLine[], key: string, quantity: number): CartLine[] {
  if (quantity <= 0) return lines.filter((line) => line.key !== key);
  return lines.map((line) => (line.key === key ? { ...line, quantity } : line));
}

export function normalizeQuantity(value: unknown, stock: number): number {
  const parsed = Math.floor(Number(value));
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return Math.min(parsed, Math.max(stock, 1));
}
