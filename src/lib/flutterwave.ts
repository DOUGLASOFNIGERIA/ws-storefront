import { createHmac, timingSafeEqual } from "node:crypto";
import { koboToNaira, nairaToKobo } from "./money";

const FLUTTERWAVE_API = "https://api.flutterwave.com/v3";

export interface GatewayInitResult {
  authorizationUrl: string;
  reference: string;
}

export interface GatewayVerification {
  ok: boolean;
  status: string;
  amountKobo: number;
  reference: string;
}

export function flutterwaveConfigured(): boolean {
  return Boolean(process.env.FLW_SECRET_KEY?.trim());
}

export function flutterwaveWebhookConfigured(): boolean {
  return Boolean(process.env.FLW_SECRET_HASH?.trim());
}

function secret(): string {
  const value = process.env.FLW_SECRET_KEY?.trim();
  if (!value) throw new Error("FLW_SECRET_KEY is not configured");
  return value;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${FLUTTERWAVE_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${secret()}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  const payload = (await response.json()) as T & { status?: string; message?: string };
  if (!response.ok || payload.status === "error") {
    throw new Error(payload.message || `Flutterwave request failed (${response.status})`);
  }
  return payload;
}

export async function initializeFlutterwavePayment(input: {
  email: string;
  customerName: string;
  amountKobo: number;
  reference: string;
  callbackUrl: string;
  metadata: Record<string, unknown>;
}): Promise<GatewayInitResult> {
  const payload = await request<{
    status: string;
    data: { link: string };
  }>("/charges", {
    method: "POST",
    body: JSON.stringify({
      tx_ref: input.reference,
      amount: koboToNaira(input.amountKobo),
      currency: "NGN",
      email: input.email,
      name: input.customerName,
      redirect_url: input.callbackUrl,
      meta: input.metadata,
      payment_options: "card,banktransfer,ussd",
    }),
  });

  return {
    authorizationUrl: payload.data.link,
    reference: input.reference,
  };
}

export async function verifyFlutterwavePayment(reference: string): Promise<GatewayVerification> {
  const payload = await request<{
    status: string;
    data: { status: string; amount: number; tx_ref: string };
  }>(`/transactions/verify_by_reference?tx_ref=${encodeURIComponent(reference)}`);

  return {
    ok: payload.data.status.toLowerCase() === "successful",
    status: payload.data.status,
    amountKobo: nairaToKobo(payload.data.amount),
    reference: payload.data.tx_ref,
  };
}

export function verifyFlutterwaveWebhook(rawBody: string, hash: string | null): boolean {
  if (!hash || !flutterwaveWebhookConfigured()) return false;
  const expected = createHmac("sha256", process.env.FLW_SECRET_HASH!.trim())
    .update(rawBody)
    .digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(hash, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}
