export type Category = "watches" | "clothing" | "perfume";

export interface Variant {
  name: string;
  stock: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  category: Category;
  description: string;
  priceKobo: number;
  compareAtKobo: number | null;
  imageFront: string;
  imageBack: string;
  variants: Variant[];
  featured: boolean;
  active: boolean;
  createdAt: string;
}

export interface CartLine {
  key: string;
  productId: string;
  slug: string;
  name: string;
  variant: string;
  image: string;
  unitPriceKobo: number;
  quantity: number;
}

export type OrderStatus = "pending" | "paid" | "failed" | "demo_paid";

export interface Order {
  id: string;
  reference: string;
  email: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string | null;
  country: string;
  items: CartLine[];
  subtotalKobo: number;
  shippingKobo: number;
  totalKobo: number;
  status: OrderStatus;
  paystackReference: string | null;
  createdAt: string;
}

export interface CheckoutInput {
  email: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode?: string;
  country?: string;
  items: Array<{ productId: string; variant: string; quantity: number }>;
}

export const CATEGORIES: Array<{ slug: Category; label: string; blurb: string }> = [
  {
    slug: "watches",
    label: "Wrist Watches",
    blurb: "Timepieces that say it without speaking.",
  },
  {
    slug: "clothing",
    label: "Clothing",
    blurb: "Everyday pieces, cut to be remembered.",
  },
  {
    slug: "perfume",
    label: "Perfume",
    blurb: "Scents with a long memory.",
  },
];

export function isCategory(value: string): value is Category {
  return CATEGORIES.some((category) => category.slug === value);
}
