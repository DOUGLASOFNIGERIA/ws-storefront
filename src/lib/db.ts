import { mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { createClient, type Client } from "@libsql/client";
import { SEED_PRODUCTS } from "./seed-data";

let client: Client | undefined;
let schemaPromise: Promise<void> | undefined;
let usingFallback = false;

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('watches', 'clothing', 'perfume')),
    description TEXT NOT NULL,
    price_kobo INTEGER NOT NULL,
    compare_at_kobo INTEGER,
    image_front TEXT NOT NULL,
    image_back TEXT NOT NULL,
    variants TEXT NOT NULL DEFAULT '[]',
    featured INTEGER NOT NULL DEFAULT 0,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)`,
  `CREATE TABLE IF NOT EXISTS subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    reference TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT,
    country TEXT NOT NULL,
    items_json TEXT NOT NULL,
    subtotal_kobo INTEGER NOT NULL,
    shipping_kobo INTEGER NOT NULL,
    total_kobo INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    gateway TEXT NOT NULL DEFAULT 'paystack',
    paystack_reference TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email)`,
  `CREATE INDEX IF NOT EXISTS idx_orders_reference ON orders(reference)`,
];

const MIGRATIONS = [
  `ALTER TABLE orders ADD COLUMN gateway TEXT NOT NULL DEFAULT 'paystack'`,
];

export function db(): Client {
  if (!client) {
    const configured = process.env.TURSO_DATABASE_URL?.trim();
    const fallbackDir = process.env.VERCEL
      ? path.join(tmpdir(), "ws-storefront")
      : path.join(process.cwd(), "data");
    const url = configured || `file:${path.join(fallbackDir, "ws.db")}`;
    usingFallback = !configured;
    if (url.startsWith("file:")) {
      mkdirSync(path.dirname(url.slice("file:".length)), { recursive: true });
    }
    client = createClient({
      url,
      authToken: process.env.TURSO_AUTH_TOKEN?.trim() || undefined,
    });
  }
  return client;
}

export function ensureSchema(): Promise<void> {
  if (!schemaPromise) {
    schemaPromise = (async () => {
      for (const statement of SCHEMA) {
        await db().execute(statement);
      }
      for (const statement of MIGRATIONS) {
        try {
          await db().execute(statement);
        } catch (error) {
          if (!/duplicate column|already exists/i.test(String(error))) throw error;
        }
      }
      if (usingFallback) {
        const count = await db().execute("SELECT COUNT(*) AS total FROM products");
        if (Number(count.rows[0]?.total ?? 0) === 0) {
          for (const product of SEED_PRODUCTS) {
            await db().execute({
              sql: `INSERT OR IGNORE INTO products (
                id, slug, name, subtitle, category, description, price_kobo, compare_at_kobo,
                image_front, image_back, variants, featured, active
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
              args: [
                product.id,
                product.slug,
                product.name,
                product.subtitle,
                product.category,
                product.description,
                product.priceKobo,
                product.compareAtKobo,
                product.imageFront,
                product.imageBack,
                JSON.stringify(product.variants),
                product.featured ? 1 : 0,
              ],
            });
          }
        }
      }
    })().catch((error) => {
      schemaPromise = undefined;
      throw error;
    });
  }
  return schemaPromise;
}
