CREATE TABLE public.site_sessions (
  id text PRIMARY KEY,
  first_seen timestamptz NOT NULL DEFAULT now(),
  last_seen timestamptz NOT NULL DEFAULT now(),
  path text,
  max_step int NOT NULL DEFAULT 1,
  pageviews int NOT NULL DEFAULT 1,
  utm_source text, utm_campaign text, device text, city text
);
CREATE INDEX site_sessions_last_seen_idx ON public.site_sessions(last_seen DESC);
CREATE INDEX site_sessions_first_seen_idx ON public.site_sessions(first_seen DESC);
GRANT SELECT ON public.site_sessions TO authenticated;
GRANT ALL ON public.site_sessions TO service_role;
ALTER TABLE public.site_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read sessions" ON public.site_sessions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));