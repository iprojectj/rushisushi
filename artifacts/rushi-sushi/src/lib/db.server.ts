import postgres from "postgres";

let client: ReturnType<typeof postgres> | undefined;

export function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL do Replit não está configurada.");
  }
  client ??= postgres(process.env.DATABASE_URL, {
    max: 8,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false,
  });
  return client;
}

export async function queryDb(
  statement: string,
  values: unknown[] = [],
): Promise<any[]> {
  return (await getDb().unsafe(statement, values as never[])) as any[];
}
