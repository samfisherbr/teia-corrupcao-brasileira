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
 * `SELECT *` de propósito: a API funciona com QUALQUER versão das tabelas
 * (a antiga, sem amount_brl/amount_note, ou a do Master Prompt v2). Colunas
 * que faltarem são preenchidas com null em `normalizeLink`. Pedir colunas pelo
 * nome fazia a consulta inteira falhar ("no such column") se uma delas não
 * existisse — foi o que quebrou o preview com tabelas no formato antigo.
 */
const NODES_SQL = 'SELECT * FROM nodes';
const LINKS_SQL = 'SELECT rowid AS _rowid, * FROM links';

type Row = Record<string, unknown>;

/** Texto 'NULL'/'N/A'/'' vindo de INSERTs gerados vira null de verdade. */
const clean = (v: unknown): unknown =>
  v === undefined || v === '' || v === 'NULL' || v === 'N/A' ? null : v;

/** Converte para inteiro, ou null se não for número (ex.: year = 'NULL'). */
const toInt = (v: unknown): number | null => {
  const n = Number(clean(v));
  return Number.isFinite(n) && clean(v) !== null ? Math.trunc(n) : null;
};

function normalizeNode(r: Row) {
  return {
    id: r.id,
    label: r.label,
    type: r.type,
    party: clean(r.party),
    summary: clean(r.summary),
    image_url: clean(r.image_url),
  };
}

function normalizeLink(r: Row) {
  return {
    id: r.id ?? r._rowid, // tabelas antigas podem não ter coluna id
    source: r.source,
    target: r.target,
    relation: r.relation,
    type: clean(r.type),
    status: r.status,
    amount: clean(r.amount),
    amount_brl: toInt(r.amount_brl), // ausente nas tabelas antigas → null
    amount_note: clean(r.amount_note), // ausente nas tabelas antigas → null
    year: toInt(r.year),
    source_url: clean(r.source_url),
  };
}

/**
 * Cache: NENHUM. Toda visita lê o banco de novo.
 *
 * Antes era 'public, max-age=60, s-maxage=300, stale-while-revalidate=86400'.
 * O stale-while-revalidate deixava o navegador mostrar uma cópia de até 24 h
 * e só buscar a nova em segundo plano — por isso o celular (aberto com menos
 * frequência) continuava exibindo só o primeiro caso inserido, enquanto o
 * desktop, recarregado toda hora, já via tudo.
 *
 * O custo é baixo: duas consultas simples ao D1 por visita. Se o volume de
 * acessos crescer muito, use um cache CURTO e sem stale-while-revalidate,
 * por exemplo 'public, max-age=0, s-maxage=60' (nunca stale no navegador).
 */
const CACHE_CONTROL = 'no-store';

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
      'As tabelas existem, mas falta uma coluna essencial (ex.: id, source, target). Recrie as tabelas com o schema.sql do repositório.',
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
    const [nodesRes, linksRes] = await DB.batch<Row>([DB.prepare(NODES_SQL), DB.prepare(LINKS_SQL)]);

    return Response.json(
      { nodes: nodesRes.results.map(normalizeNode), links: linksRes.results.map(normalizeLink) },
      { headers: { 'Cache-Control': CACHE_CONTROL } }
    );
  } catch (error) {
    const raw = error instanceof Error ? `${error.message}${error.cause ? ` (${String(error.cause)})` : ''}` : String(error);
    // Aparece em Cloudflare Pages → Deployments → (deploy) → Functions → Real-time logs.
    console.error('[api/graph] Falha na consulta ao D1:', raw);
    return diagnose(raw);
  }
}
