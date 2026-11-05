/**
 * Leitura do Cloudflare D1 para páginas renderizadas no servidor (dossiês).
 * A API do grafo (app/api/graph/route.ts) tem o próprio diagnóstico de erros;
 * aqui, qualquer falha devolve `null` e a página usa o texto de
 * data/schemeDetails.ts com título de reserva, em vez de quebrar.
 *
 * Só funciona no runtime "edge" do Cloudflare Pages (as páginas que usam
 * este módulo declaram `export const runtime = 'edge'`). Em `next dev` sem
 * o binding, getDB() devolve null.
 */
import { getRequestContext } from '@cloudflare/next-on-pages';
import type { GraphNode, NodeType } from '@/types/graph';

interface D1Result<T> {
  results: T[];
}
interface D1Prepared {
  bind(...values: unknown[]): D1Prepared;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
}
interface D1Database {
  prepare(sql: string): D1Prepared;
}

type Row = Record<string, unknown>;

const clean = (v: unknown): unknown =>
  v === undefined || v === '' || v === 'NULL' || v === 'N/A' ? null : v;

const toNode = (r: Row): GraphNode => ({
  id: String(r.id),
  label: String(r.label ?? r.id),
  type: r.type as NodeType,
  party: (clean(r.party) as string | null) ?? null,
  summary: (clean(r.summary) as string | null) ?? null,
  image_url: (clean(r.image_url) as string | null) ?? null,
});

export function getDB(): D1Database | null {
  try {
    const { env } = getRequestContext() as unknown as { env: { DB?: D1Database } };
    return env.DB ?? null;
  } catch {
    return null; // fora do Cloudflare (ex.: next dev sem setupDevPlatform)
  }
}

/** Todos os nós do tipo esquema, ou null se o banco não responder. */
export async function loadSchemeNodes(): Promise<GraphNode[] | null> {
  const db = getDB();
  if (!db) return null;
  try {
    const { results } = await db.prepare("SELECT * FROM nodes WHERE type = 'scheme'").all<Row>();
    return results.map(toNode);
  } catch (e) {
    console.error('[lib/db] loadSchemeNodes:', e);
    return null;
  }
}

/** Esquema e as entidades ligadas a ele diretamente, ou null se o banco não responder. */
export async function loadScheme(
  id: string
): Promise<{ scheme: GraphNode | null; entities: GraphNode[] } | null> {
  const db = getDB();
  if (!db) return null;
  try {
    const [self, neighbours] = await Promise.all([
      db.prepare('SELECT * FROM nodes WHERE id = ?').bind(id).all<Row>(),
      db
        .prepare(
          `SELECT DISTINCT n.* FROM nodes n
             JOIN links l ON (l.source = ?1 AND l.target = n.id) OR (l.target = ?1 AND l.source = n.id)
            WHERE n.id <> ?1`
        )
        .bind(id)
        .all<Row>(),
    ]);
    return {
      scheme: self.results[0] ? toNode(self.results[0]) : null,
      entities: neighbours.results.map(toNode),
    };
  } catch (e) {
    console.error('[lib/db] loadScheme:', e);
    return null;
  }
}
