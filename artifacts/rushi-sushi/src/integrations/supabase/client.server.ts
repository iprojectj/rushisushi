import { getDb } from "@/lib/db.server";

const columns: Record<string, Set<string>> = {
  app_settings: new Set(["key", "value", "updated_at"]),
  leads: new Set(["id", "whatsapp", "nome", "email", "first_seen_at", "last_seen_at", "created_at", "updated_at"]),
  lead_submissions: new Set(["id", "lead_id", "form_type", "order_id", "nome", "whatsapp", "email", "fields", "page_url", "user_agent", "ip", "created_at"]),
  site_sessions: new Set(["id", "first_seen", "last_seen", "path", "max_step", "pageviews", "utm_source", "utm_campaign", "device", "city", "region", "region_code", "lat", "lng"]),
};

type Filter = { column: string; operator: "eq" | "gte" | "lte" | "in" | "contains"; value: unknown };
type Result = { data: any; error: any };

class LocalQuery {
  private operation: "select" | "insert" | "update" | "delete" | "upsert" = "select";
  private payload: Record<string, unknown> | Record<string, unknown>[] = {};
  private selected = "*";
  private returning = false;
  private filters: Filter[] = [];
  private ordering: { column: string; ascending: boolean }[] = [];
  private rowLimit?: number;
  private singleMode: "single" | "maybeSingle" | null = null;

  constructor(private readonly table: string) {
    if (!columns[table]) throw new Error("Tabela não permitida.");
  }

  private column(name: string) {
    if (!columns[this.table]?.has(name)) throw new Error(`Coluna não permitida: ${name}`);
    return `"${name}"`;
  }

  select(names = "*") {
    const requested = names.trim() === "*" ? "*" : names.split(",").map((name) => this.column(name.trim())).join(", ");
    this.selected = requested;
    if (this.operation !== "select") this.returning = true;
    return this;
  }
  eq(column: string, value: unknown) { this.filters.push({ column, operator: "eq", value }); return this; }
  gte(column: string, value: unknown) { this.filters.push({ column, operator: "gte", value }); return this; }
  lte(column: string, value: unknown) { this.filters.push({ column, operator: "lte", value }); return this; }
  in(column: string, value: unknown[]) { this.filters.push({ column, operator: "in", value }); return this; }
  contains(column: string, value: unknown) { this.filters.push({ column, operator: "contains", value }); return this; }
  order(column: string, options?: { ascending?: boolean }) {
    this.ordering.push({ column, ascending: options?.ascending ?? true }); return this;
  }
  limit(value: number) { this.rowLimit = Math.max(0, Math.min(10000, Math.floor(value))); return this; }
  maybeSingle() { this.singleMode = "maybeSingle"; return this; }
  single() { this.singleMode = "single"; return this; }
  insert(payload: Record<string, unknown> | Record<string, unknown>[]) {
    this.operation = "insert"; this.payload = payload; return this;
  }
  upsert(payload: Record<string, unknown>) { this.operation = "upsert"; this.payload = payload; return this; }
  update(payload: Record<string, unknown>) { this.operation = "update"; this.payload = payload; return this; }
  delete() { this.operation = "delete"; return this; }

  private jsonValue(column: string, value: unknown) {
    return ["fields", "value"].includes(column) ? JSON.stringify(value ?? {}) : value;
  }

  private async run(): Promise<Result> {
    try {
      const sql = getDb();
      const values: unknown[] = [];
      const bind = (value: unknown, column?: string) => {
        values.push(column ? this.jsonValue(column, value) : value);
        return `$${values.length}${column && ["fields", "value"].includes(column) ? "::jsonb" : ""}`;
      };
      const where = this.filters.map(({ column, operator, value }) => {
        const col = this.column(column);
        if (operator === "eq" && value === null) return `${col} IS NULL`;
        if (operator === "in") {
          const items = Array.isArray(value) ? value : [];
          if (!items.length) return "FALSE";
          return `${col} IN (${items.map((item) => bind(item)).join(", ")})`;
        }
        if (operator === "contains") {
          values.push(JSON.stringify(value));
          return `${col} @> $${values.length}::jsonb`;
        }
        const op = operator === "eq" ? "=" : operator === "gte" ? ">=" : "<=";
        return `${col} ${op} ${bind(value)}`;
      });
      const whereSql = where.length ? ` WHERE ${where.join(" AND ")}` : "";
      let statement = "";
      const rows = Array.isArray(this.payload) ? this.payload : [this.payload];

      if (this.operation === "select") {
        statement = `SELECT ${this.selected} FROM "${this.table}"${whereSql}`;
        if (this.ordering.length) {
          statement += ` ORDER BY ${this.ordering.map((item) => `${this.column(item.column)} ${item.ascending ? "ASC" : "DESC"}`).join(", ")}`;
        }
        if (this.rowLimit !== undefined) statement += ` LIMIT ${this.rowLimit}`;
      } else if (this.operation === "insert" || this.operation === "upsert") {
        if (!rows.length) return { data: [], error: null };
        const names = [...new Set(rows.flatMap((row) => Object.keys(row)))];
        names.forEach((name) => this.column(name));
        const tuples = rows.map((row) =>
          `(${names.map((name) => bind(row[name], name)).join(", ")})`,
        );
        statement = `INSERT INTO "${this.table}" (${names.map((name) => this.column(name)).join(", ")}) VALUES ${tuples.join(", ")}`;
        if (this.operation === "upsert") {
          const conflict = names.includes("key") ? "key" : names[0];
          const updates = names.filter((name) => name !== conflict);
          statement += updates.length
            ? ` ON CONFLICT (${this.column(conflict)}) DO UPDATE SET ${updates.map((name) => `${this.column(name)} = EXCLUDED.${this.column(name)}`).join(", ")}`
            : ` ON CONFLICT (${this.column(conflict)}) DO NOTHING`;
        }
        if (this.returning) statement += ` RETURNING ${this.selected}`;
      } else if (this.operation === "update") {
        const payload = this.payload as Record<string, unknown>;
        const assignments = Object.entries(payload).map(([name, value]) => `${this.column(name)} = ${bind(value, name)}`);
        statement = `UPDATE "${this.table}" SET ${assignments.join(", ")}${whereSql}${this.returning ? ` RETURNING ${this.selected}` : ""}`;
      } else {
        statement = `DELETE FROM "${this.table}"${whereSql}${this.returning ? ` RETURNING ${this.selected}` : ""}`;
      }

      const data = await sql.unsafe(statement, values as never[]);
      if (!this.singleMode) return { data: [...data], error: null };
      if (!data.length && this.singleMode === "maybeSingle") return { data: null, error: null };
      if (data.length !== 1) return { data: null, error: new Error("Esperado exatamente um registro.") };
      return { data: data[0], error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  then<TResult1 = Result, TResult2 = never>(
    onfulfilled?: ((value: Result) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    return this.run().then(onfulfilled, onrejected);
  }
}

export const supabaseAdmin = {
  from(table: string) {
    return new LocalQuery(table);
  },
};
