import { randomUUID } from "node:crypto";
import { db, ensureSchema } from "./db";
import type { CartLine, CheckoutInput, Order, OrderStatus } from "./types";

type Row = Record<string, unknown>;

function text(value: unknown): string {
  return value == null ? "" : String(value);
}

function number(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function mapOrder(row: Row): Order {
  let items: CartLine[] = [];
  try {
    const parsed = JSON.parse(text(row.items_json));
    if (Array.isArray(parsed)) items = parsed as CartLine[];
  } catch {
    items = [];
  }

  return {
    id: text(row.id),
    reference: text(row.reference),
    email: text(row.email),
    customerName: text(row.customer_name),
    phone: text(row.phone),
    address: text(row.address),
    city: text(row.city),
    state: text(row.state),
    postalCode: row.postal_code == null ? null : text(row.postal_code),
    country: text(row.country),
    items,
    subtotalKobo: number(row.subtotal_kobo),
    shippingKobo: number(row.shipping_kobo),
    totalKobo: number(row.total_kobo),
    status: text(row.status) as OrderStatus,
    gateway: (text(row.gateway) || "paystack") as Order["gateway"],
    paystackReference: row.paystack_reference == null ? null : text(row.paystack_reference),
    createdAt: text(row.created_at),
  };
}

export function generateReference(): string {
  const stamp = new Date().toISOString().replace(/\D/g, "").slice(0, 14);
  return `WS-${stamp}-${randomUUID().slice(0, 8).toUpperCase()}`;
}

export interface NewOrder {
  input: Omit<CheckoutInput, "items">;
  lines: CartLine[];
  subtotalKobo: number;
  shippingKobo: number;
  totalKobo: number;
}

export async function createOrder(order: NewOrder): Promise<Order> {
  await ensureSchema();
  const record: Order = {
    id: randomUUID(),
    reference: generateReference(),
    email: order.input.email,
    customerName: order.input.customerName,
    phone: order.input.phone,
    address: order.input.address,
    city: order.input.city,
    state: order.input.state,
    postalCode: order.input.postalCode ?? null,
    country: order.input.country ?? "Nigeria",
    items: order.lines,
    subtotalKobo: order.subtotalKobo,
    shippingKobo: order.shippingKobo,
    totalKobo: order.totalKobo,
    status: "pending",
    gateway: order.input.gateway ?? "paystack",
    paystackReference: null,
    createdAt: new Date().toISOString(),
  };

  await db().execute({
    sql: `INSERT INTO orders (
      id, reference, email, customer_name, phone, address, city, state, postal_code,
      country, items_json, subtotal_kobo, shipping_kobo, total_kobo, status, gateway, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      record.id,
      record.reference,
      record.email,
      record.customerName,
      record.phone,
      record.address,
      record.city,
      record.state,
      record.postalCode,
      record.country,
      JSON.stringify(record.items),
      record.subtotalKobo,
      record.shippingKobo,
      record.totalKobo,
      record.status,
      record.gateway,
      record.createdAt,
    ],
  });

  return record;
}

export async function getOrderByReference(reference: string): Promise<Order | null> {
  await ensureSchema();
  const result = await db().execute({
    sql: "SELECT * FROM orders WHERE reference = ? LIMIT 1",
    args: [reference],
  });
  const row = result.rows[0];
  return row ? mapOrder(row as Row) : null;
}

export async function getOrdersByEmail(email: string): Promise<Order[]> {
  await ensureSchema();
  const result = await db().execute({
    sql: "SELECT * FROM orders WHERE lower(email) = ? ORDER BY created_at DESC",
    args: [email.trim().toLowerCase()],
  });
  return result.rows.map((row) => mapOrder(row as Row));
}

export async function setOrderStatus(
  reference: string,
  status: OrderStatus,
  paystackReference?: string | null,
): Promise<Order | null> {
  await ensureSchema();
  await db().execute({
    sql: `UPDATE orders SET status = ?, paystack_reference = COALESCE(?, paystack_reference)
          WHERE reference = ?`,
    args: [status, paystackReference ?? null, reference],
  });
  return getOrderByReference(reference);
}

export async function addSubscriber(email: string): Promise<boolean> {
  await ensureSchema();
  const result = await db().execute({
    sql: "INSERT OR IGNORE INTO subscribers (email) VALUES (?)",
    args: [email.trim().toLowerCase()],
  });
  return result.rowsAffected > 0;
}
