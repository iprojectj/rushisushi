import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { queryDb } from "@/lib/db.server";
import { requireAdmin } from "@/lib/admin-auth.functions";

const rangeSchema = z.object({ start: z.string().datetime(), end: z.string().datetime() });
const idSchema = z.object({ id: z.string().uuid() });
const sessionColumns = "id, last_seen, path, max_step, pageviews, utm_source, utm_campaign, device, city, region, region_code, lat, lng";

export const getAdminDashboardRows = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .inputValidator((input: unknown) => rangeSchema.parse(input))
  .handler(async ({ data }) => queryDb(
    `SELECT id, lead_id, order_id, created_at, nome, fields FROM lead_submissions
     WHERE form_type = $1 AND created_at >= $2 AND created_at <= $3
     ORDER BY created_at DESC LIMIT 5000`,
    ["checkout", data.start, data.end],
  ));

export const getAdminLeadsData = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async () => {
    const [leads, submissions] = await Promise.all([
      queryDb("SELECT id, nome, whatsapp, email, last_seen_at, first_seen_at FROM leads ORDER BY last_seen_at DESC LIMIT 500"),
      queryDb("SELECT id, lead_id, form_type, order_id, created_at, fields, page_url FROM lead_submissions ORDER BY created_at DESC LIMIT 5000"),
    ]);
    return { leads, submissions };
  });

export const deleteAdminLead = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((input: unknown) => idSchema.parse(input))
  .handler(async ({ data }) => {
    await queryDb("DELETE FROM lead_submissions WHERE lead_id = $1", [data.id]);
    await queryDb("DELETE FROM leads WHERE id = $1", [data.id]);
    return { success: true };
  });

export const getAdminLeadDetail = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .inputValidator((input: unknown) => idSchema.parse(input))
  .handler(async ({ data }) => {
    const [leads, submissions] = await Promise.all([
      queryDb("SELECT id, nome, whatsapp, email, first_seen_at, last_seen_at FROM leads WHERE id = $1 LIMIT 1", [data.id]),
      queryDb("SELECT id, form_type, order_id, created_at, fields, page_url FROM lead_submissions WHERE lead_id = $1 ORDER BY created_at DESC", [data.id]),
    ]);
    return { lead: leads[0] ?? null, submissions };
  });

export const getAdminTrafficSessions = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .inputValidator((input: unknown) => rangeSchema.parse(input))
  .handler(async ({ data }) => queryDb(
    `SELECT ${sessionColumns} FROM site_sessions WHERE first_seen >= $1 AND first_seen <= $2
     ORDER BY last_seen DESC LIMIT 5000`,
    [data.start, data.end],
  ));

export const getAdminLiveSessions = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async () => queryDb(
    `SELECT ${sessionColumns} FROM site_sessions WHERE last_seen >= $1 ORDER BY last_seen DESC LIMIT 2000`,
    [new Date(Date.now() - 60_000).toISOString()],
  ));
