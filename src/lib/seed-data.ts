import type { Category } from "./types";

export interface SeedProduct {
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
  variants: Array<{ name: string; stock: number }>;
  featured: boolean;
}

export const SEED_PRODUCTS: SeedProduct[] = [
  {
    id: "ws-w-01",
    slug: "onyx-chronograph",
    name: "Onyx Chronograph",
    subtitle: "Black / Gold",
    category: "watches",
    description:
      "A black dial with gold accents, three sub-dials and a brushed stainless steel bracelet. Built for the hours that matter.",
    priceKobo: 185_000_00,
    compareAtKobo: 210_000_00,
    imageFront: "/products/onyx-chronograph-front.svg",
    imageBack: "/products/onyx-chronograph-back.svg",
    variants: [
      { name: "Black / Gold", stock: 12 },
      { name: "Black / Silver", stock: 8 },
    ],
    featured: true,
  },
  {
    id: "ws-w-02",
    slug: "sapphire-automatic",
    name: "Sapphire Automatic",
    subtitle: "Silver / Blue",
    category: "watches",
    description:
      "An automatic movement behind a sapphire-blue sunray dial. Polished case, exhibition back, quiet confidence.",
    priceKobo: 240_000_00,
    compareAtKobo: null,
    imageFront: "/products/sapphire-automatic-front.svg",
    imageBack: "/products/sapphire-automatic-back.svg",
    variants: [{ name: "Silver / Blue", stock: 10 }],
    featured: true,
  },
  {
    id: "ws-w-03",
    slug: "heritage-leather",
    name: "Heritage Leather",
    subtitle: "Brown / Cream",
    category: "watches",
    description:
      "A warm cream dial, brown leather strap and vintage-inspired markers. The everyday watch with an old soul.",
    priceKobo: 145_000_00,
    compareAtKobo: 160_000_00,
    imageFront: "/products/heritage-leather-front.svg",
    imageBack: "/products/heritage-leather-back.svg",
    variants: [{ name: "Brown / Cream", stock: 16 }],
    featured: false,
  },
  {
    id: "ws-w-04",
    slug: "matrix-steel",
    name: "Matrix Steel",
    subtitle: "Silver / Graphite",
    category: "watches",
    description:
      "A clean graphite dial in a brushed steel case. Minimal, sharp and unbothered by noise.",
    priceKobo: 198_000_00,
    compareAtKobo: null,
    imageFront: "/products/matrix-steel-front.svg",
    imageBack: "/products/matrix-steel-back.svg",
    variants: [{ name: "Silver / Graphite", stock: 9 }],
    featured: false,
  },
  {
    id: "ws-c-01",
    slug: "ws-vs-everybody-tee",
    name: "WS Vs Everybody Tee",
    subtitle: "Black / White",
    category: "clothing",
    description:
      "Heavyweight combed cotton with the WS Vs Everybody print at the chest. Oversized fit, soft hand feel.",
    priceKobo: 42_000_00,
    compareAtKobo: 50_000_00,
    imageFront: "/products/ws-vs-everybody-tee-front.svg",
    imageBack: "/products/ws-vs-everybody-tee-back.svg",
    variants: [
      { name: "S", stock: 14 },
      { name: "M", stock: 22 },
      { name: "L", stock: 18 },
      { name: "XL", stock: 10 },
    ],
    featured: true,
  },
  {
    id: "ws-c-02",
    slug: "crown-oversized-tee",
    name: "Crown Oversized Tee",
    subtitle: "Ivory / Gold",
    category: "clothing",
    description:
      "A boxy ivory tee with a gold crown motif. Garment-dyed for a lived-in finish from the first wear.",
    priceKobo: 45_000_00,
    compareAtKobo: null,
    imageFront: "/products/crown-oversized-tee-front.svg",
    imageBack: "/products/crown-oversized-tee-back.svg",
    variants: [
      { name: "S", stock: 11 },
      { name: "M", stock: 16 },
      { name: "L", stock: 12 },
      { name: "XL", stock: 6 },
    ],
    featured: true,
  },
  {
    id: "ws-c-03",
    slug: "midnight-lagos-hoodie",
    name: "Midnight Lagos Hoodie",
    subtitle: "Black / Cream",
    category: "clothing",
    description:
      "Fleece-lined, double-needle stitched and finished with the Lagos script across the back.",
    priceKobo: 78_000_00,
    compareAtKobo: 90_000_00,
    imageFront: "/products/midnight-lagos-hoodie-front.svg",
    imageBack: "/products/midnight-lagos-hoodie-back.svg",
    variants: [
      { name: "M", stock: 9 },
      { name: "L", stock: 13 },
      { name: "XL", stock: 7 },
    ],
    featured: true,
  },
  {
    id: "ws-c-04",
    slug: "everybody-tank",
    name: "Everybody Tank",
    subtitle: "Black / White",
    category: "clothing",
    description:
      "A ribbed cotton tank cut for movement, with a small WS mark at the chest.",
    priceKobo: 35_000_00,
    compareAtKobo: null,
    imageFront: "/products/everybody-tank-front.svg",
    imageBack: "/products/everybody-tank-back.svg",
    variants: [
      { name: "S", stock: 20 },
      { name: "M", stock: 24 },
      { name: "L", stock: 15 },
    ],
    featured: false,
  },
  {
    id: "ws-p-01",
    slug: "oud-no-01",
    name: "Oud No. 01",
    subtitle: "Amber / 100ml",
    category: "perfume",
    description:
      "Smoked oud, saffron and amber. A warm, long-lasting extrait that announces itself before you do.",
    priceKobo: 95_000_00,
    compareAtKobo: 110_000_00,
    imageFront: "/products/oud-no-01-front.svg",
    imageBack: "/products/oud-no-01-back.svg",
    variants: [{ name: "100ml", stock: 18 }],
    featured: true,
  },
  {
    id: "ws-p-02",
    slug: "lagos-nights",
    name: "Lagos Nights",
    subtitle: "Deep Blue / 100ml",
    category: "perfume",
    description:
      "Bergamot, night-blooming jasmine and a base of smooth woods. Bottled like the city after dark.",
    priceKobo: 88_000_00,
    compareAtKobo: null,
    imageFront: "/products/lagos-nights-front.svg",
    imageBack: "/products/lagos-nights-back.svg",
    variants: [{ name: "100ml", stock: 21 }],
    featured: true,
  },
  {
    id: "ws-p-03",
    slug: "white-oud",
    name: "White Oud",
    subtitle: "Ivory / 100ml",
    category: "perfume",
    description:
      "A softer take on oud: white musk, pear and sandalwood with a clean, airy finish.",
    priceKobo: 92_000_00,
    compareAtKobo: null,
    imageFront: "/products/white-oud-front.svg",
    imageBack: "/products/white-oud-back.svg",
    variants: [{ name: "100ml", stock: 15 }],
    featured: false,
  },
  {
    id: "ws-p-04",
    slug: "signature-blend",
    name: "Signature Blend",
    subtitle: "Burgundy / 100ml",
    category: "perfume",
    description:
      "The house signature: black pepper, rose absolute and vanilla resin in a deep burgundy flacon.",
    priceKobo: 110_000_00,
    compareAtKobo: 125_000_00,
    imageFront: "/products/signature-blend-front.svg",
    imageBack: "/products/signature-blend-back.svg",
    variants: [{ name: "100ml", stock: 12 }],
    featured: false,
  },
];
