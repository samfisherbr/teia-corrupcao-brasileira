import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

// Minimal D1 typing (swap for `@cloudflare/workers-types` if you add it as a devDependency).
interface D1PreparedStatement {}
interface D1Database {
  prepare(sql: string): D1PreparedStatement;
  batch<T = Record<string, unknown>>(stmts: D1PreparedStatement[]): Promise<{ results: T[] }[]>;
}

interface Env {
  DB?: D1Database;
}

// Explicit columns (no SELECT *) and NULLIF() so the literal string 'NULL'
// that slipped in via generated INSERTs reaches the client as a real null.
const NODES_SQL = `
  SELECT id, label, type,
         NULLIF(NULLIF(party, 'NULL'), 'N/A')  AS party,
         NULLIF(summary, 'NULL')               AS summary,
         NULLIF(NULLIF(image_url, 'NULL'), '') AS image_url
  FROM nodes`;

const LINKS_SQL = `
  SELECT rowid AS id, source, target, relation, type, status,
         NULLIF(NULLIF(amount, 'NULL'), 'N/A') AS amount,
         CAST(NULLIF(year, 'NULL') AS INTEGER) AS year,
         NULLIF(source_url, 'NULL')            AS source_url
  FROM links`;

export async function GET() {
  const { env } = getRequestContext() as unknown as { env: Env };
  const DB = env.DB;

  if (!DB) {
    return Response.json({ error: 'D1 database binding "DB" not found.' }, { status: 500 });
  }

  try {
    // One round-trip instead of two sequential queries.
    const [nodesRes, linksRes] = await DB.batch([DB.prepare(NODES_SQL), DB.prepare(LINKS_SQL)]);

    return Response.json(
      { nodes: nodesRes.results, links: linksRes.results },
      {
        headers: {
          // Data changes only when a dossier is approved; let the edge cache it.
          'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=86400',
        },
      }
    );
  } catch (error) {
    console.error('D1 query failed', error);
    // Don't leak SQL/driver details to the browser.
    return Response.json({ error: 'Falha ao consultar o banco de dados.' }, { status: 500 });
  }
}
