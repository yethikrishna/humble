import { sql } from 'drizzle-orm';
import { db } from './db';

/**
 * Call a Postgres function using named-argument notation
 * (`func(p_foo => $1, p_bar => $2)`), mirroring the shape of the
 * Supabase `client.rpc(name, params)` calls this replaces.
 *
 * `name` and the keys of `params` must be trusted (hardcoded call sites in
 * our own code, never derived from request input) — they're inlined via
 * `sql.raw` with no escaping.
 */
export async function callDbFunction<T = unknown>(
  name: string,
  params: Record<string, unknown>,
): Promise<{ data: T | null; error: { message: string } | null }> {
  try {
    const entries = Object.entries(params).filter(([, value]) => value !== undefined);
    const args = sql.join(
      entries.map(([key, value]) => sql`${sql.raw(key)} => ${value}`),
      sql`, `,
    );

    const rows = await db.execute(sql`SELECT ${sql.raw(name)}(${args}) as result`);
    const row = rows[0] as Record<string, unknown> | undefined;
    return { data: (row?.result as T) ?? null, error: null };
  } catch (err) {
    return { data: null, error: { message: err instanceof Error ? err.message : String(err) } };
  }
}
