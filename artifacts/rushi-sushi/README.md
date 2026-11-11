# Rūshī Sushi

Rūshī Sushi's ordering site, including the Brazilian and Mexican storefronts, order tracking, and Pix checkout.

## Run on Replit

The Replit workspace runs this package through its managed web workflow:

```sh
pnpm --filter @workspace/rushi-sushi run dev
```

Check types and create the production Node server with:

```sh
pnpm --filter @workspace/rushi-sushi run typecheck
pnpm --filter @workspace/rushi-sushi run build
```

## Configuration

Copying the source repository's `.env` is intentionally avoided. The app now stores leads, orders, settings, and traffic in Replit PostgreSQL; it no longer needs the old Supabase project or Lovable secrets.

Keep private credentials in Replit Secrets. `ADMIN_PASSWORD` protects the admin panel, `SESSION_SECRET` signs its secure session cookie, and `KALANGFY_API_KEY` plus `KALANGFY_SIGNING_SECRET` enable PIX creation and payment confirmation. `UTMIFY_API_TOKEN` enables sales attribution. The active gateway defaults to Kalangfy. A missing or failing payment provider must never be treated as a successful payment.

The workspace already assigns `/api` to its shared API service. Rūshī's application API routes therefore use `/rushi-api/...` in Replit; for Kalangfy, configure the webhook URL as `/rushi-api/public/kalangfy-webhook` on the app's domain.
