import assert from "node:assert/strict";
import test from "node:test";
import { formatNaira, nairaToKobo, shippingKobo } from "../src/lib/money";

test("naira converts to kobo without floating point drift", () => {
  assert.equal(nairaToKobo(75_400), 75_400_00);
  assert.equal(nairaToKobo(42.5), 4_250);
});

test("formatNaira renders whole naira values cleanly", () => {
  assert.equal(formatNaira(185_000_00), "₦185,000");
  assert.equal(formatNaira(4_250_00), "₦4,250");
});

test("delivery is free above the threshold", () => {
  assert.equal(shippingKobo(nairaToKobo(150_000)), 0);
  assert.equal(shippingKobo(nairaToKobo(149_999)), 250_000);
});
