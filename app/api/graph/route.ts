/**
 * GET /api/graph — devolve { nodes, links } lidos do Cloudflare D1.
 *
 * Roda no runtime "edge" (exigência do next-on-pages). O binding do banco deve
 * se chamar `DB` e precisa existir nos DOIS ambientes do Cloudflare Pages
 * (Settings → Bindings): Production E Preview. São configurações separadas;
 * um deploy de preview (branch/pull request) não enxerga o binding de produção.
 *
 * Em caso de falha, a resposta traz `code` + `error` (mensagem em português
 * com o próximo passo) + `detail` (mensagem original do D1). A página exibe
 * isso na tela, para o problema ser identificável sem abrir os logs.
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
 * Cache de respostas BEM-SUCEDIDAS. Os dados só mudam quando um dossiê
 * aprovado é inserido, então a borda do Cloudflare pode guardar a resposta:
 *   max-age=60   → o navegador reaproveita por 1 minuto
 *   s-maxage=300 → a CDN reaproveita por 5 minutos (↑ = menos leituras no D1)
 *   stale-while-revalidate → serve a versão anterior enquanto busca a nova
 * Consequência: um caso recém-inserido aparece em até ~5 minutos.
 * Respostas de erro nunca são guardadas (ver `fail`).
 */
const CACHE_CONTROL = 'public, max-age=60, s-maxage=300, stale-while-revalidate=86400';

/** Tipos de falha reconhecidos. O frontend usa `code` para escolher o texto de ajuda. */
type FailureCode = 'NO_BINDING' | 'NO_TABLES' | 'SCHEMA_MISMATCH' | 'DB_UNAVAILABLE' | 'QUERY_FAILED';

function fail(code: FailureCode, error: string, detail?: string) {
  return Response.json(
    { code, error, detail },
    { status: code === 'NO_BINDING' || code === 'DB_UNAVAILABLE' ? 503 : 500, headers: { 'Cache-Control': 'no-store' } }
  );
}

/**
 * Traduz a mensagem crua do D1 num diagnóstico com o próximo passo.
 * Os textos citam só nomes de tabela/coluna, que são públicos (schema.sql).
 */
function diagnose(raw: string) {
  if (/no such table/i.test(raw)) {
    return fail(
      'NO_TABLES',
      'O banco D1 está ligado, mas as tabelas não existem. Rode o schema.sql neste banco: npx wrangler d1 execute <NOME_DO_BANCO> --remote --file=./schema.sql',
      raw
    );
  }
  if (/no such column/i.test(raw)) {
    return fail(
      'SCHEMA_MISMATCH',
      'As tabelas existem, mas com colunas diferentes do schema atual (Master Prompt v2). Recrie as tabelas com o schema.sql do repositório.',
      raw
    );
  }
  if (/database.*(not found|does not exist|deleted)|D1_ERROR.*(not found|unavailable)|could not (route|find)/i.test(raw)) {
    return fail(
      'DB_UNAVAILABLE',
      'O binding "DB" aponta para um banco D1 que não existe mais. Em Cloudflare Pages → Settings → Bindings, remova o binding antigo e ligue-o ao banco novo (em Production e em Preview).',
      raw
    );
  }
  return fail('QUERY_FAILED', 'Falha ao consultar o banco de dados.', raw);
}

export async function GET() {
  const { env } = getRequestContext() as unknown as { env: Env };
  const DB = env.DB;

  if (!DB) {
    return fail(
      'NO_BINDING',
      'Nenhum banco D1 ligado a este ambiente. Em Cloudflare Pages → Settings → Bindings, adicione um "D1 database" com o nome de variável DB — em Production E em Preview, que são configurações separadas — e faça um novo deploy.'
    );
  }

  try {
    // batch = as duas consultas numa única ida ao banco.
    const [nodesRes, linksRes] = await DB.batch([DB.prepare(NODES_SQL), DB.prepare(LINKS_SQL)]);

    return Response.json(
      { nodes: nodesRes.results, links: linksRes.results },
      { headers: { 'Cache-Control': CACHE_CONTROL } }
    );
  } catch (error) {
    const raw = error instanceof Error ? `${error.message}${error.cause ? ` (${String(error.cause)})` : ''}` : String(error);
    // Aparece em Cloudflare Pages → Deployments → (deploy) → Functions → Real-time logs.
    console.error('[api/graph] Falha na consulta ao D1:', raw);
    return diagnose(raw);
  }
}
