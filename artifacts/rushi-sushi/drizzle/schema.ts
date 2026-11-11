import {
  doublePrecision,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const appSettings = pgTable("app_settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull().default({}),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const leads = pgTable("leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  whatsapp: text("whatsapp").notNull().unique(),
  nome: text("nome"),
  email: text("email"),
  firstSeenAt: timestamp("first_seen_at", { withTimezone: true }).notNull().defaultNow(),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const leadSubmissions = pgTable("lead_submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  leadId: uuid("lead_id").references(() => leads.id, { onDelete: "cascade" }),
  formType: text("form_type").notNull(),
  orderId: text("order_id"),
  nome: text("nome"),
  whatsapp: text("whatsapp"),
  email: text("email"),
  fields: jsonb("fields").notNull().default({}),
  pageUrl: text("page_url"),
  userAgent: text("user_agent"),
  ip: text("ip"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("lead_submissions_order_id_idx").on(table.orderId),
  index("lead_submissions_created_at_idx").on(table.createdAt),
  index("lead_submissions_form_type_idx").on(table.formType),
]);

export const siteSessions = pgTable("site_sessions", {
  id: text("id").primaryKey(),
  firstSeen: timestamp("first_seen", { withTimezone: true }).notNull().defaultNow(),
  lastSeen: timestamp("last_seen", { withTimezone: true }).notNull().defaultNow(),
  path: text("path"),
  maxStep: integer("max_step").notNull().default(0),
  pageviews: integer("pageviews").notNull().default(1),
  utmSource: text("utm_source"),
  utmCampaign: text("utm_campaign"),
  device: text("device"),
  city: text("city"),
  region: text("region"),
  regionCode: text("region_code"),
  lat: doublePrecision("lat"),
  lng: doublePrecision("lng"),
}, (table) => [index("site_sessions_last_seen_idx").on(table.lastSeen)]);
