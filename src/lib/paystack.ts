import { createHmac, timingSafeEqual } from "node:crypto";

const PAYSTACK_API = "https://api.paystack.co";

export interface PaymentInitResult {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
}

export interface PaymentVerification {
  ok: boolean;
  status: string;
  amountKobo: number;
  reference: string;
}

export function paystackConfigured(): boolean {
  return Boolean(process.env.PAYSTACK_SECRET_KEY?.trim());
}

export function demoPaymentsEnabled(): boolean {
  return process.env.WS_DEMO_PAYMENTS === "true" && !paystackConfigured();
}

function secret(): string {
  const value = process.env.PAYSTACK_SECRET_KEY?.trim();
  if (!value) throw new Error("PAYSTACK_SECRET_KEY is not configured");
  return value;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${PAYSTACK_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${secret()}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  const payload = (await response.json()) as T & { status?: boolean; message?: string };
  if (!response.ok || payload.status === false) {
    throw new Error(payload.message || `Paystack request failed (${response.status})`);
  }
  return payload;
}

export async function initializePayment(input: {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl: string;
  metadata: Record<string, unknown>;
}): Promise<PaymentInitResult> {
  const payload = await request<{
    status: boolean;
    data: { authorization_url: string; access_code: string; reference: string };
  }>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email: input.email,
      amount: input.amountKobo,
      reference: input.reference,
      callback_url: input.callbackUrl,
      metadata: input.metadata,
      currency: "NGN",
    }),
  });

  return {
    authorizationUrl: payload.data.authorization_url,
    accessCode: payload.data.access_code,
    reference: payload.data.reference,
  };
}

export async function verifyPayment(reference: string): Promise<PaymentVerification> {
  const payload = await request<{
    status: boolean;
    data: { status: string; amount: number; reference: string };
  }>(`/transaction/verify/${encodeURIComponent(reference)}`);

  return {
    ok: payload.data.status === "success",
    status: payload.data.status,
    amountKobo: payload.data.amount,
    reference: payload.data.reference,
  };
}

export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  if (!signature) return false;
  const expected = createHmac("sha512", secret()).update(rawBody).digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}
