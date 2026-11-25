import assert from "node:assert/strict";
import test from "node:test";
import { addLine, cartCount, cartSubtotal, lineKey, normalizeQuantity, updateQuantity } from "../src/lib/cart";
import type { CartLine } from "../src/lib/types";

const line: CartLine = {
  key: lineKey("p1", "M"),
  productId: "p1",
  slug: "tee",
  name: "Tee",
  variant: "M",
  image: "/tee.svg",
  unitPriceKobo: 42_000_00,
  quantity: 2,
};

test("lineKey separates product and variant", () => {
  assert.equal(line.key, "p1::M");
});

test("cart totals multiply unit price by quantity", () => {
  assert.equal(cartCount([line]), 2);
  assert.equal(cartSubtotal([line]), 84_000_00);
});

test("adding the same product and variant merges quantities", () => {
  const result = addLine([line], { ...line, quantity: 3 });
  assert.equal(result.length, 1);
  assert.equal(result[0].quantity, 5);
});

test("adding a different variant creates a new line", () => {
  const result = addLine([line], { ...line, key: lineKey("p1", "L"), variant: "L" });
  assert.equal(result.length, 2);
});

test("zero quantity removes a line", () => {
  const result = updateQuantity([line], line.key, 0);
  assert.equal(result.length, 0);
});

test("quantity is clamped to stock", () => {
  assert.equal(normalizeQuantity("9", 4), 4);
  assert.equal(normalizeQuantity("-3", 4), 1);
  assert.equal(normalizeQuantity("oops", 4), 1);
});
