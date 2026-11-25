import { mkdirSync } from "node:fs";
import path from "node:path";
import { createClient, type Client } from "@libsql/client";

let client: Client | undefined;
let schemaPromise: Promise<void> | undefined;

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
    const url = configured || `file:${path.join(process.cwd(), "data", "ws.db")}`;
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
    })().catch((error) => {
      schemaPromise = undefined;
      throw error;
    });
  }
  return schemaPromise;
}
