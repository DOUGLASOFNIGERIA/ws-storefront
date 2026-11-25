import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import { verifyFlutterwaveWebhook } from "../src/lib/flutterwave";
import { isPaymentGateway } from "../src/lib/types";

process.env.FLW_SECRET_HASH = "flw_test_webhook_hash";

test("gateway parser accepts only supported methods", () => {
  assert.equal(isPaymentGateway("paystack"), true);
  assert.equal(isPaymentGateway("flutterwave"), true);
  assert.equal(isPaymentGateway("manual"), true);
  assert.equal(isPaymentGateway(" bitcoin"), false);
  assert.equal(isPaymentGateway(undefined), false);
});

test("Flutterwave webhook accepts a matching SHA256 hash", () => {
  const body = JSON.stringify({ event: "charge.completed", data: { tx_ref: "WS-1" } });
  const hash = createHmac("sha256", process.env.FLW_SECRET_HASH!)
    .update(body)
    .digest("hex");
  assert.equal(verifyFlutterwaveWebhook(body, hash), true);
});

test("Flutterwave webhook rejects missing or tampered hashes", () => {
  const body = "{\"event\":\"charge.completed\"}";
  const hash = createHmac("sha256", process.env.FLW_SECRET_HASH!)
    .update(body)
    .digest("hex");
  assert.equal(verifyFlutterwaveWebhook(`${body} `, hash), false);
  assert.equal(verifyFlutterwaveWebhook(body, "deadbeef"), false);
  assert.equal(verifyFlutterwaveWebhook(body, null), false);
});
