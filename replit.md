# Rūshī Sushi

Online ordering storefront for Rūshī Sushi, with Brazilian and Mexican menus, Pix checkout, order status, and admin routes.

## Run & Operate

- The Replit preview runs the managed workflow `artifacts/rushi-sushi: web`.
- `pnpm --filter @workspace/rushi-sushi run dev` — start the development server.
- `pnpm --filter @workspace/rushi-sushi run typecheck` — check the app's TypeScript.
- `pnpm --filter @workspace/rushi-sushi run build` — build the Node/Nitro production server.
- Production starts with `node artifacts/rushi-sushi/.output/server/index.mjs`.
- Never copy or commit `.env`; use Replit Secrets for server credentials.

## Stack

- pnpm workspace, React, TanStack Start, Vite, and Nitro's Node server preset.
- Supabase for the existing database/auth integration; payment providers are selected by the app's stored configuration.
- Original storefront pages are HTML documents served by TanStack routes; preserve their checkout behavior when changing presentation.

## Where things live

- `artifacts/rushi-sushi/public/index.html` — Brazilian storefront.
- `artifacts/rushi-sushi/public/mx/index.html` — Mexican storefront.
- `artifacts/rushi-sushi/src/routes/` — server-rendered page and API routes.
- `artifacts/rushi-sushi/src/integrations/supabase/` — Supabase clients and auth.
- `artifacts/rushi-sushi/.env.example` — variable names only; actual values belong in Replit Secrets.

## Architecture decisions

- Keep the production preset as `node-server`; a static export would break API routes and checkout.
- Do not add payment fallbacks that pretend a Pix payment succeeded. Configure the selected provider and webhook secrets before testing live orders.
- Public Supabase URL/publishable-key values are separate from the server-only service-role key.
- In Replit, app API routes are reached under `/rushi-api/...` to avoid the workspace's shared `/api` service; point new provider webhooks at that prefix.

## Product

Customers can browse menus, submit delivery details, create Pix orders, and view order status. Admin and payment operations depend on the existing Supabase project and provider credentials.

## User preferences

Preserve the imported site's branding and behavior; the request was to make the existing GitHub site run on Replit, not redesign it.

## Gotchas

- The storefront's loading overlay must not wait indefinitely for remote analytics or other third-party resources.
- Some story-photo records in the repository are only metadata; the matching image files are not included.
- Missing Supabase/payment/geocoding credentials disable those backend functions; do not mask that with mock success.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
