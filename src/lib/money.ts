const koboPerNaira = 100;

export function formatNaira(kobo: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: kobo % koboPerNaira === 0 ? 0 : 2,
  }).format(kobo / koboPerNaira);
}

export function nairaToKobo(naira: number): number {
  return Math.round(naira * koboPerNaira);
}

export function koboToNaira(kobo: number): number {
  return kobo / koboPerNaira;
}

export function shippingKobo(subtotalKobo: number): number {
  return subtotalKobo >= nairaToKobo(150_000) ? 0 : nairaToKobo(2500);
}
