/**
 * GET /api/graph — devolve { nodes, links } lidos do Cloudflare D1.
 *
 * Roda no runtime "edge" (exigência do next-on-pages). O binding do banco deve
 * se chamar `DB` (wrangler.toml ou painel do Cloudflare Pages → Settings →
 * Functions → D1 bindings).
 *
 * Ajustes comuns:
 *   - colunas devolvidas → NODES_SQL / LINKS_SQL
 *   - tempo de cache     → CACHE_CONTROL
 */
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

// Tipagem mínima do D1 (troque por `@cloudflare/workers-types` se preferir
// adicioná-lo como devDependency).
interface D1PreparedStatement {}
interface D1Database {
  prepare(sql: string): D1PreparedStatement;
  batch<T = Record<string, unknown>>(stmts: D1PreparedStatement[]): Promise<{ results: T[] }[]>;
}
interface Env {
  DB?: D1Database;
}

/**
 * Colunas explícitas (nada de SELECT *). Os NULLIF() são uma proteção: se um
 * INSERT gerado escrever 'NULL' entre aspas (texto) em vez de NULL, o
 * navegador ainda recebe null de verdade.
 */
const NODES_SQL = `
  SELECT id, label, type,
         NULLIF(NULLIF(party, 'NULL'), 'N/A')  AS party,
         NULLIF(summary, 'NULL')               AS summary,
         NULLIF(NULLIF(image_url, 'NULL'), '') AS image_url
  FROM nodes`;

/** Schema do Master Prompt v2 (com amount_brl e amount_note). */
const LINKS_SQL = `
  SELECT rowid AS id, source, target, relation, type, status,
         NULLIF(NULLIF(amount, 'NULL'), 'N/A') AS amount,
         amount_brl,
         NULLIF(amount_note, 'NULL')           AS amount_note,
         CAST(NULLIF(year, 'NULL') AS INTEGER) AS year,
         NULLIF(source_url, 'NULL')            AS source_url
  FROM links`;

/**
 * Os dados só mudam quando um dossiê aprovado é inserido, então a borda do
 * Cloudflare pode guardar a resposta:
 *   max-age=60   → o navegador reaproveita por 1 minuto
 *   s-maxage=300 → a CDN reaproveita por 5 minutos (↑ = menos leituras no D1)
 *   stale-while-revalidate → serve a versão anterior enquanto busca a nova
 * Consequência: um caso recém-inserido aparece em até ~5 minutos.
 */
const CACHE_CONTROL = 'public, max-age=60, s-maxage=300, stale-while-revalidate=86400';

export async function GET() {
  const { env } = getRequestContext() as unknown as { env: Env };
  const DB = env.DB;

  if (!DB) {
    return Response.json({ error: 'Binding "DB" do D1 não encontrado.' }, { status: 500 });
  }

  try {
    // batch = as duas consultas numa única ida ao banco.
    const [nodesRes, linksRes] = await DB.batch([DB.prepare(NODES_SQL), DB.prepare(LINKS_SQL)]);

    return Response.json(
      { nodes: nodesRes.results, links: linksRes.results },
      { headers: { 'Cache-Control': CACHE_CONTROL } }
    );
  } catch (error) {
    console.error('Falha na consulta ao D1', error);
    // Mensagem genérica: não expõe SQL nem detalhes do driver ao navegador.
    return Response.json({ error: 'Falha ao consultar o banco de dados.' }, { status: 500 });
  }
}
