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

function pexels(id: number, width = 1200, height = 1500): string {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${width}&h=${height}&fit=crop`;
}

export const SEED_PRODUCTS: SeedProduct[] = [
  {
    id: "ws-w-01",
    slug: "onyx-chronograph",
    name: "Onyx Chronograph",
    subtitle: "Black / Gold",
    category: "watches",
    description:
      "A black chronograph dial with gold-tone markers and a polished stainless steel bracelet. Considering the detail, presence and price, this is the kind of watch that makes an impression without trying too hard.",
    priceKobo: 185_000_00,
    compareAtKobo: 210_000_00,
    imageFront: pexels(13703305),
    imageBack: pexels(13703306),
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
      "A deep blue dial framed by a silver-linked bracelet. Clean lines, sharp contrast and enough character to carry a suit or a plain white tee.",
    priceKobo: 240_000_00,
    compareAtKobo: null,
    imageFront: pexels(34189734),
    imageBack: pexels(1697570),
    variants: [{ name: "Silver / Blue", stock: 10 }],
    featured: true,
  },
  {
    id: "ws-w-03",
    slug: "heritage-leather",
    name: "Heritage Leather",
    subtitle: "Gold / Black",
    category: "watches",
    description:
      "A black dial, gold-tone markers and a brown leather strap. Vintage-inspired, quietly warm and made for everyday wear.",
    priceKobo: 145_000_00,
    compareAtKobo: 160_000_00,
    imageFront: pexels(1120275),
    imageBack: pexels(1120276),
    variants: [{ name: "Gold / Black", stock: 16 }],
    featured: false,
  },
  {
    id: "ws-w-04",
    slug: "matrix-steel",
    name: "Matrix Steel",
    subtitle: "Silver / Graphite",
    category: "watches",
    description:
      "A graphite dial in a silver-linked steel case. Minimal, sharp and unbothered by noise.",
    priceKobo: 198_000_00,
    compareAtKobo: null,
    imageFront: pexels(190819),
    imageBack: pexels(4567366),
    variants: [{ name: "Silver / Graphite", stock: 9 }],
    featured: false,
  },
  {
    id: "ws-c-01",
    slug: "studio-tee",
    name: "Studio Tee",
    subtitle: "Black / Cotton",
    category: "clothing",
    description:
      "A heavyweight black cotton tee with a relaxed shoulder and a clean neckline. Soft from the first wear, structured enough to hold its shape.",
    priceKobo: 42_000_00,
    compareAtKobo: 50_000_00,
    imageFront: pexels(1620418),
    imageBack: pexels(1403344),
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
    subtitle: "Sand / Oversized",
    category: "clothing",
    description:
      "A boxy sand-toned tee with a lived-in hand feel. Easy to layer, easy to wear and cut with enough room to move.",
    priceKobo: 45_000_00,
    compareAtKobo: null,
    imageFront: pexels(28758240),
    imageBack: pexels(19881716),
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
    subtitle: "Black / Fleece",
    category: "clothing",
    description:
      "A substantial black fleece hoodie with a relaxed fit, double-needle stitching and a soft brushed interior.",
    priceKobo: 78_000_00,
    compareAtKobo: 90_000_00,
    imageFront: pexels(11215942),
    imageBack: pexels(8520046),
    variants: [
      { name: "M", stock: 9 },
      { name: "L", stock: 13 },
      { name: "XL", stock: 7 },
    ],
    featured: true,
  },
  {
    id: "ws-c-04",
    slug: "everyday-tank",
    name: "Everyday Tank",
    subtitle: "White / Black",
    category: "clothing",
    description:
      "A ribbed cotton tank cut for movement. Clean enough on its own, simple enough to layer under everything else.",
    priceKobo: 35_000_00,
    compareAtKobo: null,
    imageFront: pexels(8433475),
    imageBack: pexels(9486604),
    variants: [
      { name: "White", stock: 20 },
      { name: "Black", stock: 24 },
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
      "Smoked oud, saffron and amber in a warm amber-toned flacon. Long-lasting, confident and impossible to ignore.",
    priceKobo: 95_000_00,
    compareAtKobo: 110_000_00,
    imageFront: pexels(11216292),
    imageBack: pexels(11216317),
    variants: [{ name: "100ml", stock: 18 }],
    featured: true,
  },
  {
    id: "ws-p-02",
    slug: "lagos-nights",
    name: "Lagos Nights",
    subtitle: "Black / 100ml",
    category: "perfume",
    description:
      "Bergamot, night-blooming jasmine and smooth woods. Presented in a polished black bottle made for evenings out.",
    priceKobo: 88_000_00,
    compareAtKobo: null,
    imageFront: pexels(11216321),
    imageBack: pexels(9657652),
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
    imageFront: pexels(33711974),
    imageBack: pexels(33711971),
    variants: [{ name: "100ml", stock: 15 }],
    featured: false,
  },
  {
    id: "ws-p-04",
    slug: "signature-blend",
    name: "Signature Blend",
    subtitle: "Amber / 100ml",
    category: "perfume",
    description:
      "The house signature: black pepper, rose absolute and vanilla resin in a richly reflective bottle.",
    priceKobo: 110_000_00,
    compareAtKobo: 125_000_00,
    imageFront: pexels(11216320),
    imageBack: pexels(11216322),
    variants: [{ name: "100ml", stock: 12 }],
    featured: false,
  },
];
