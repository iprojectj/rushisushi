-- Fresh Replit Postgres schema. Supabase auth/RLS dependencies are intentionally removed.
CREATE TABLE IF NOT EXISTS app_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  whatsapp text NOT NULL UNIQUE,
  nome text,
  email text,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lead_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  form_type text NOT NULL,
  order_id text,
  nome text,
  whatsapp text,
  email text,
  fields jsonb NOT NULL DEFAULT '{}'::jsonb,
  page_url text,
  user_agent text,
  ip text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS lead_submissions_order_id_idx ON lead_submissions(order_id);
CREATE INDEX IF NOT EXISTS lead_submissions_created_at_idx ON lead_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS lead_submissions_form_type_idx ON lead_submissions(form_type);

CREATE TABLE IF NOT EXISTS site_sessions (
  id text PRIMARY KEY,
  first_seen timestamptz NOT NULL DEFAULT now(),
  last_seen timestamptz NOT NULL DEFAULT now(),
  path text,
  max_step integer NOT NULL DEFAULT 0,
  pageviews integer NOT NULL DEFAULT 1,
  utm_source text,
  utm_campaign text,
  device text,
  city text,
  region text,
  region_code text,
  lat double precision,
  lng double precision
);

CREATE INDEX IF NOT EXISTS site_sessions_last_seen_idx ON site_sessions(last_seen DESC);
INSERT INTO app_settings (key, value)
VALUES ('active_gateway', '"kalangfy"'::jsonb), ('utmify_track_paid', 'true'::jsonb)
ON CONFLICT (key) DO NOTHING;
