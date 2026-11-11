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

Copying the source repository's `.env` is intentionally avoided. Keep private credentials in Replit Secrets. The blank `.env.example` lists the variables used by Supabase, payment providers, and geocoding.

The Supabase service-role key, selected Pix provider credentials, and geocoding credentials are required for their respective server features. A missing provider must not be treated as a successful payment.

The workspace already assigns `/api` to its shared API service. Rūshī's application API routes therefore use `/rushi-api/...` in Replit; configure provider webhook URLs with that prefix.
