import { randomUUID } from "node:crypto";
import { db, ensureSchema } from "./db";
import type { Review, ReviewStatus, SessionUser } from "./types";

type Row = Record<string, unknown>;

function mapReview(row: Row): Review {
  return {
    id: String(row.id),
    productId: String(row.product_id),
    productSlug: String(row.product_slug),
    authorName: String(row.author_name),
    rating: Number(row.rating),
    title: String(row.title),
    body: String(row.body),
    status: String(row.status) as ReviewStatus,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export async function getApprovedReviews(productId: string): Promise<Review[]> {
  await ensureSchema();
  const result = await db().execute({
    sql: `SELECT * FROM reviews WHERE product_id = ? AND status = 'approved'
          ORDER BY created_at DESC`,
    args: [productId],
  });
  return result.rows.map((row) => mapReview(row as Row));
}

export async function getReviewsByStatus(status?: ReviewStatus): Promise<Review[]> {
  await ensureSchema();
  const result = status
    ? await db().execute({
        sql: "SELECT * FROM reviews WHERE status = ? ORDER BY created_at DESC",
        args: [status],
      })
    : await db().execute("SELECT * FROM reviews ORDER BY created_at DESC");
  return result.rows.map((row) => mapReview(row as Row));
}

export async function getReviewsByUser(userId: string): Promise<Review[]> {
  await ensureSchema();
  const result = await db().execute({
    sql: "SELECT * FROM reviews WHERE user_id = ? ORDER BY created_at DESC",
    args: [userId],
  });
  return result.rows.map((row) => mapReview(row as Row));
}

export async function createReview(input: {
  productId: string;
  user: SessionUser;
  rating: number;
  title: string;
  body: string;
}): Promise<{ ok: boolean; message: string; review?: Review }> {
  await ensureSchema();

  if (!input.user.emailVerified) {
    return { ok: false, message: "Verify your email before leaving a review." };
  }
  if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) {
    return { ok: false, message: "Please choose a rating from 1 to 5." };
  }
  const title = input.title.trim();
  const body = input.body.trim();
  if (title.length < 3 || title.length > 90) {
    return { ok: false, message: "Please add a short review title." };
  }
  if (body.length < 12 || body.length > 1200) {
    return { ok: false, message: "Please write between 12 and 1200 characters." };
  }

  const product = await db().execute({
    sql: "SELECT id, slug FROM products WHERE id = ? AND active = 1 LIMIT 1",
    args: [input.productId],
  });
  const productRow = product.rows[0];
  if (!productRow) return { ok: false, message: "Product not found." };

  const existing = await db().execute({
    sql: "SELECT id FROM reviews WHERE product_id = ? AND user_id = ? LIMIT 1",
    args: [input.productId, input.user.id],
  });
  if (existing.rows.length) {
    return { ok: false, message: "You have already reviewed this product." };
  }

  const id = `rev_${randomUUID()}`;
  await db().execute({
    sql: `INSERT INTO reviews (
      id, product_id, product_slug, user_id, author_name, rating, title, body, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
    args: [
      id,
      input.productId,
      String(productRow.slug),
      input.user.id,
      input.user.name,
      input.rating,
      title,
      body,
    ],
  });

  const result = await db().execute({
    sql: "SELECT * FROM reviews WHERE id = ? LIMIT 1",
    args: [id],
  });
  return {
    ok: true,
    message: "Review submitted for moderation.",
    review: mapReview(result.rows[0] as Row),
  };
}

export async function moderateReview(
  id: string,
  status: Exclude<ReviewStatus, "pending">,
): Promise<boolean> {
  await ensureSchema();
  const result = await db().execute({
    sql: "UPDATE reviews SET status = ?, updated_at = datetime('now') WHERE id = ?",
    args: [status, id],
  });
  return Number(result.rowsAffected ?? 0) > 0;
}
