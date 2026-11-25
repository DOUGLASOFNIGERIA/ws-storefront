# WS Storefront

A full-stack storefront inspired by the reference collection page: bold wordmark, minimal navigation, a hover-swap product grid, product detail pages, a persistent cart, newsletter signup, and checkout with Paystack, Flutterwave, or a manual bank-transfer fallback. The brand is **WS** and the catalog covers **wrist watches, clothing and perfume**.

## Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 15 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 3 |
| Database | Turso (libSQL), SQLite file fallback for local development |
| Payments | Paystack + Flutterwave card checkout, manual bank transfer, callback verification, signed webhooks |
| Hosting | Vercel |

## Getting started

```bash
npm install
cp .env.example .env.local
npm run db:seed
npm run dev
```

Open http://localhost:3000.

The local database is created at `data/ws.db`. Product artwork in `public/products` is generated with `node scripts/generate-images.mjs`.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `TURSO_DATABASE_URL` | `libsql://...` URL from Turso. Unset = local SQLite file. |
| `TURSO_AUTH_TOKEN` | Turso database auth token. |
| `PAYSTACK_SECRET_KEY` | Server-side Paystack secret, used to initialize and verify card transactions. |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Paystack public key for inline checkout widgets. |
| `FLW_SECRET_KEY` | Flutterwave secret key for card/bank/USSD charges. |
| `NEXT_PUBLIC_FLW_PUBLIC_KEY` | Flutterwave public key for inline checkout widgets. |
| `FLW_SECRET_HASH` | Flutterwave webhook hash used to verify `verif-hash`. |
| `NEXT_PUBLIC_APP_URL` | Public site URL used for payment callback links. |
| `WS_DEMO_PAYMENTS` | Set to `true` **only** when no secret key is configured to test checkout without charging money. |
| `ADMIN_TOKEN` | Reserved for admin endpoints. |

## Workflow

1. Home shows the collection grid; category pages filter to watches, clothing or perfume.
2. Product pages offer variant and quantity selection before adding to the cart.
3. Cart state persists in `localStorage` and is shown in a drawer and on `/cart`.
4. Checkout recalculates every price from the database, creates a pending order, then redirects to the selected provider (Paystack or Flutterwave) or reserves it as a manual bank-transfer order.
5. After card payment, the provider redirects to `/order/<reference>?verify=1`. The server verifies the transaction amount and marks the order paid. Signed webhooks at `/api/payments/webhook` and `/api/payments/flutterwave/webhook` provide a second, authoritative confirmation.
6. Newsletter signups are stored in the `subscribers` table.

## API

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/api/products` | GET | Filter products by `category`, `q`, `featured`, `limit` |
| `/api/newsletter` | POST | Subscribe an email address |
| `/api/checkout` | POST | Validate cart, create order, initialize selected payment method |
| `/api/payments/verify` | POST | Manually re-verify a Paystack or Flutterwave order by reference |
| `/api/payments/webhook` | POST | Paystack `charge.success` webhook (HMAC SHA512 verified) |
| `/api/payments/flutterwave/webhook` | POST | Flutterwave `charge.completed` webhook (`verif-hash` verified) |
| `/api/health` | GET | Database connectivity check |

## Testing

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

## Deploying

1. Create a Turso database and run `npm run db:seed` locally with `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` pointing at it.
2. Add the same Turso variables, `PAYSTACK_SECRET_KEY`, `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`, `FLW_SECRET_KEY`, `NEXT_PUBLIC_FLW_PUBLIC_KEY`, `FLW_SECRET_HASH` and `NEXT_PUBLIC_APP_URL` to the Vercel project.
3. Register `https://<your-domain>/api/payments/webhook` in Paystack and `https://<your-domain>/api/payments/flutterwave/webhook` in Flutterwave.
4. Deploy with `npm run build` (or import the repository into Vercel).
5. Leave `WS_DEMO_PAYMENTS` unset in production.

Never commit `.env.local` or real API keys.
