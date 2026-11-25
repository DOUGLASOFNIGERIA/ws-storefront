import { db, ensureSchema } from "./db";
import type { Category, Product, Variant } from "./types";

type Row = Record<string, unknown>;

function text(value: unknown): string {
  return value == null ? "" : String(value);
}

function number(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function mapProduct(row: Row): Product {
  let variants: Variant[] = [];
  try {
    const parsed = JSON.parse(text(row.variants));
    if (Array.isArray(parsed)) variants = parsed as Variant[];
  } catch {
    variants = [];
  }

  return {
    id: text(row.id),
    slug: text(row.slug),
    name: text(row.name),
    subtitle: text(row.subtitle),
    category: text(row.category) as Category,
    description: text(row.description),
    priceKobo: number(row.price_kobo),
    compareAtKobo: row.compare_at_kobo == null ? null : number(row.compare_at_kobo),
    imageFront: text(row.image_front),
    imageBack: text(row.image_back),
    variants,
    featured: number(row.featured) === 1,
    active: number(row.active) === 1,
    createdAt: text(row.created_at),
  };
}

interface ProductQuery {
  category?: Category;
  search?: string;
  featured?: boolean;
  limit?: number;
}

export async function getProducts(query: ProductQuery = {}): Promise<Product[]> {
  await ensureSchema();
  const clauses = ["active = 1"];
  const args: Array<string | number> = [];

  if (query.category) {
    clauses.push("category = ?");
    args.push(query.category);
  }
  if (query.search?.trim()) {
    const term = `%${query.search.trim().toLowerCase()}%`;
    clauses.push("(lower(name) LIKE ? OR lower(subtitle) LIKE ? OR lower(description) LIKE ?)");
    args.push(term, term, term);
  }
  if (query.featured) clauses.push("featured = 1");

  let sql = `SELECT * FROM products WHERE ${clauses.join(" AND ")} ORDER BY featured DESC, created_at DESC`;
  if (query.limit && query.limit > 0) {
    sql += " LIMIT ?";
    args.push(query.limit);
  }

  const result = await db().execute({ sql, args });
  return result.rows.map((row) => mapProduct(row as Row));
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  await ensureSchema();
  const result = await db().execute({
    sql: "SELECT * FROM products WHERE slug = ? AND active = 1 LIMIT 1",
    args: [slug],
  });
  const row = result.rows[0];
  return row ? mapProduct(row as Row) : null;
}

export async function getProductById(id: string): Promise<Product | null> {
  await ensureSchema();
  const result = await db().execute({
    sql: "SELECT * FROM products WHERE id = ? AND active = 1 LIMIT 1",
    args: [id],
  });
  const row = result.rows[0];
  return row ? mapProduct(row as Row) : null;
}
