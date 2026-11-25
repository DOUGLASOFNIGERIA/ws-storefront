import { db, ensureSchema } from "../src/lib/db";
import { SEED_PRODUCTS } from "../src/lib/seed-data";

async function seed() {
  await ensureSchema();
  let inserted = 0;

  for (const product of SEED_PRODUCTS) {
    const result = await db().execute({
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
    inserted += result.rowsAffected;
  }

  const count = await db().execute("SELECT COUNT(*) AS total FROM products");
  console.log(`Seed complete: ${inserted} inserted, ${String(count.rows[0]?.total ?? 0)} total products.`);
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exitCode = 1;
});
