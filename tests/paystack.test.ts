import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import { verifyWebhookSignature } from "../src/lib/paystack";

process.env.PAYSTACK_SECRET_KEY = "sk_test_unit_test_secret";

test("webhook accepts a matching HMAC SHA512 signature", () => {
  const body = JSON.stringify({ event: "charge.success", data: { reference: "WS-1" } });
  const signature = createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
    .update(body)
    .digest("hex");
  assert.equal(verifyWebhookSignature(body, signature), true);
});

test("webhook rejects a tampered body or bad signature", () => {
  const body = "{\"event\":\"charge.success\"}";
  const signature = createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
    .update(body)
    .digest("hex");
  assert.equal(verifyWebhookSignature(`${body} `, signature), false);
  assert.equal(verifyWebhookSignature(body, "deadbeef"), false);
  assert.equal(verifyWebhookSignature(body, null), false);
});
