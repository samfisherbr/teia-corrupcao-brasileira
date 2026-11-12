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
import type { GraphNode, LinkStatus, LinkType, NodeType } from '@/types/graph';

interface D1Result<T> {
  results: T[];
}
interface D1Prepared {
  bind(...values: unknown[]): D1Prepared;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
}
interface D1Database {
  prepare(sql: string): D1Prepared;
  batch<T = Record<string, unknown>>(stmts: D1Prepared[]): Promise<D1Result<T>[]>;
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
  image_credit: (clean(r.image_credit) as string | null) ?? null,
  image_source_url: (clean(r.image_source_url) as string | null) ?? null,
});

/** Só aceita http(s): um `javascript:` vindo do banco nunca vira link. */
export const safeHttpUrl = (v: unknown): string | null => {
  const s = clean(v);
  return typeof s === 'string' && /^https?:\/\//i.test(s.trim()) ? s.trim() : null;
};

/** Vínculo direto de um esquema com outra entidade, como aparece no dossiê. */
export interface SchemeConnection {
  key: string;
  entity: GraphNode;
  relation: string;
  type: LinkType | null;
  status: LinkStatus;
  year: number | null;
  amount: string | null;
  amount_note: string | null;
  source_url: string | null;
  reviewed_at: string | null;
}

export function getDB(): D1Database | null {
  try {
    const { env } = getRequestContext() as unknown as { env: { DB?: D1Database } };
    return env.DB ?? null;
  } catch {
    return null; // fora do Cloudflare (ex.: next dev sem setupDevPlatform)
  }
}

/**
 * Índice de dossiês: nós do tipo esquema + ano de início de cada um (ano do
 * vínculo datado mais antigo — mesma regra de computeSchemeStartYears em
 * lib/schemes.ts), numa única ida ao banco. Null se o banco não responder.
 */
export async function loadSchemeIndex(): Promise<{ nodes: GraphNode[]; years: Map<string, number> } | null> {
  const db = getDB();
  if (!db) return null;
  try {
    const [nodesRes, yearsRes] = await db.batch<Row>([
      db.prepare("SELECT * FROM nodes WHERE type = 'scheme'"),
      db.prepare(
        `SELECT n.id AS id, MIN(CAST(l.year AS INTEGER)) AS start
           FROM nodes n
           JOIN links l ON l.source = n.id OR l.target = n.id
          WHERE n.type = 'scheme' AND l.year IS NOT NULL AND CAST(l.year AS INTEGER) > 0
          GROUP BY n.id`
      ),
    ]);
    return {
      nodes: nodesRes.results.map(toNode),
      years: new Map(
        yearsRes.results
          .map((r) => [String(r.id), Number(r.start)] as [string, number])
          .filter(([, y]) => Number.isFinite(y) && y > 0)
      ),
    };
  } catch (e) {
    console.error('[lib/db] loadSchemeIndex:', e);
    return null;
  }
}

/**
 * Esquema e seus vínculos diretos (cada um com a entidade da outra ponta, o
 * status, o ano e a fonte), numa única ida ao banco. Null se o banco não
 * responder.
 *
 * `SELECT l.*` de propósito: funciona com ou sem as colunas opcionais
 * (reviewed_at, amount_note…) — as que faltarem viram null.
 */
export async function loadScheme(
  id: string
): Promise<{ scheme: GraphNode | null; connections: SchemeConnection[] } | null> {
  const db = getDB();
  if (!db) return null;
  try {
    const [self, linksRes, nodesRes] = await db.batch<Row>([
      db.prepare('SELECT * FROM nodes WHERE id = ?1').bind(id),
      db.prepare('SELECT rowid AS _rowid, l.* FROM links l WHERE l.source = ?1 OR l.target = ?1').bind(id),
      db
        .prepare(
          `SELECT * FROM nodes WHERE id <> ?1 AND id IN (
             SELECT target FROM links WHERE source = ?1
             UNION SELECT source FROM links WHERE target = ?1)`
        )
        .bind(id),
    ]);
    const byId = new Map(nodesRes.results.map((r) => [String(r.id), toNode(r)]));
    const connections: SchemeConnection[] = [];
    for (const r of linksRes.results) {
      const otherId = String(r.source) === id ? String(r.target) : String(r.source);
      const entity = byId.get(otherId);
      if (!entity) continue; // vínculo apontando para id inexistente
      const year = Number(clean(r.year));
      connections.push({
        key: String(r.id ?? r._rowid),
        entity,
        relation: String(clean(r.relation) ?? ''),
        type: (clean(r.type) as LinkType | null) ?? null,
        status: r.status as LinkStatus,
        year: clean(r.year) !== null && Number.isFinite(year) && year > 0 ? Math.trunc(year) : null,
        amount: (clean(r.amount) as string | null) ?? null,
        amount_note: (clean(r.amount_note) as string | null) ?? null,
        source_url: safeHttpUrl(r.source_url),
        reviewed_at: (clean(r.reviewed_at) as string | null) ?? null,
      });
    }
    return { scheme: self.results[0] ? toNode(self.results[0]) : null, connections };
  } catch (e) {
    console.error('[lib/db] loadScheme:', e);
    return null;
  }
}
