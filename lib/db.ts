/**
 * Leitura do Cloudflare D1 para páginas renderizadas no servidor (dossiês).
 * A API do grafo (app/api/graph/route.ts) tem o próprio diagnóstico de erros;
 * aqui, qualquer falha devolve `null` e a página usa o texto de
 * data/schemeDetails.ts com título de reserva, em vez de quebrar.
 *
 * Só funciona rodando no Cloudflare (Worker do OpenNext, ou `npm run preview`):
 * o binding vem de getCloudflareContext(). As páginas que usam este módulo
 * declaram `export const dynamic = 'force-dynamic'`, para nunca serem geradas
 * no build, sem banco. Em `next dev`, o binding é o do wrangler.toml
 * (initOpenNextCloudflareForDev, em next.config.js); sem ele, getDB() devolve null.
 *
 * IDIOMA: as funções recebem o idioma da página. Em inglês e espanhol, nomes
 * de esquemas, resumos e descrições dos vínculos vêm das tabelas de tradução
 * (lib/translations.ts); o que não tiver tradução em dia vem em português.
 * Banco sem as tabelas de tradução → tudo em português, sem erro.
 */
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { toAmountKind, type AmountKind, type GraphNode, type LinkStatus, type LinkType, type NodeType } from '@/types/graph';
import type { Locale } from '@/lib/i18n';
import {
  applyLinkTranslation,
  applyNodeTranslation,
  dbLang,
  isMissingTranslationTables,
  linkSelect,
  nodeSelect,
} from '@/lib/translations';
import { edgeCachedJson } from '@/lib/edgeCache';

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

const toNode = (raw: Row): GraphNode => {
  const r = applyNodeTranslation(raw);
  return {
  id: String(r.id),
  label: String(r.label ?? r.id),
  type: r.type as NodeType,
  party: (clean(r.party) as string | null) ?? null,
  summary: (clean(r.summary) as string | null) ?? null,
  image_url: (clean(r.image_url) as string | null) ?? null,
  image_credit: (clean(r.image_credit) as string | null) ?? null,
  image_source_url: (clean(r.image_source_url) as string | null) ?? null,
  };
};

/**
 * Roda `run` com o idioma pedido; se o banco ainda não tiver as tabelas de
 * tradução, roda de novo em português (lang = null) em vez de falhar.
 */
async function withLang<T>(locale: Locale, run: (lang: string | null) => Promise<T>): Promise<T> {
  const lang = dbLang(locale);
  if (!lang) return run(null);
  try {
    return await run(lang);
  } catch (e) {
    if (!isMissingTranslationTables(e)) throw e;
    return run(null);
  }
}

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
  amount_kind: AmountKind | null;
  source_url: string | null;
  reviewed_at: string | null;
}

export function getDB(): D1Database | null {
  try {
    const { env } = getCloudflareContext() as unknown as { env: { DB?: D1Database } };
    return env.DB ?? null;
  } catch {
    return null; // fora do Cloudflare (ex.: build, ou next dev sem o binding)
  }
}

/**
 * Por quanto tempo os dados dos dossiês ficam no cache de borda
 * (lib/edgeCache.ts): até FRESH, sem consultar o banco; depois, até MAX_AGE,
 * a cópia ainda é entregue enquanto o banco é consultado em segundo plano.
 */
const PAGE_CACHE = { freshSeconds: 600, maxAgeSeconds: 3600 } as const;

/** Formato guardado no cache (JSON: sem Map). */
interface SchemeIndexData {
  nodes: GraphNode[];
  years: [string, number][];
  entityTerms: [string, string[]][];
}

/**
 * Índice de dossiês: nós do tipo esquema + ano de início de cada um (ano do
 * vínculo datado mais antigo — mesma regra de computeSchemeStartYears em
 * lib/schemes.ts) + nomes e partidos das entidades ligadas (para a busca).
 * Uma ida ao banco com duas leituras simples (todos os nós; origem, destino e
 * ano de todos os vínculos) e o resto calculado aqui — antes, duas junções
 * com OR liam ~7.400 linhas por visita; agora ~1.000, e só quando o cache vence.
 * Null se o banco não responder.
 */
export async function loadSchemeIndex(locale: Locale): Promise<{
  nodes: GraphNode[];
  years: Map<string, number>;
  /** Nomes e partidos das entidades ligadas a cada esquema (para a busca). */
  entityTerms: Map<string, string[]>;
} | null> {
  const db = getDB();
  if (!db) return null;
  try {
    const data = await edgeCachedJson<SchemeIndexData>(
      `scheme-index/${locale}`,
      async () => {
        const [nodesRes, linksRes] = await withLang(locale, (lang) =>
          db.batch<Row>([db.prepare(nodeSelect(lang)), db.prepare('SELECT source, target, year FROM links')])
        );
        const byId = new Map(nodesRes.results.map((r) => [String(r.id), r]));
        const isScheme = (id: string) => byId.get(id)?.type === 'scheme';
        const years = new Map<string, number>();
        const terms = new Map<string, string[]>();

        // Cada vínculo conta para o(s) esquema(s) nas suas pontas.
        const visit = (schemeId: string, otherId: string, rawYear: unknown) => {
          const y = Math.trunc(Number(clean(rawYear)));
          if (Number.isFinite(y) && y > 0) years.set(schemeId, Math.min(years.get(schemeId) ?? y, y));
          const other = byId.get(otherId);
          if (!other) return; // vínculo apontando para id inexistente
          if (!terms.has(schemeId)) terms.set(schemeId, []);
          // Busca: o nome em português sempre entra; no outro idioma, o traduzido também.
          for (const v of [other.label, clean(other._tr_label), clean(other.party)]) if (v) terms.get(schemeId)!.push(String(v));
        };
        for (const l of linksRes.results) {
          const source = String(l.source);
          const target = String(l.target);
          if (isScheme(source)) visit(source, target, l.year);
          if (isScheme(target) && target !== source) visit(target, source, l.year);
        }

        return {
          nodes: nodesRes.results.filter((r) => r.type === 'scheme').map(toNode),
          years: [...years],
          entityTerms: [...terms],
        };
      },
      PAGE_CACHE
    );
    return { nodes: data.nodes, years: new Map(data.years), entityTerms: new Map(data.entityTerms) };
  } catch (e) {
    console.error('[lib/db] loadSchemeIndex:', e);
    return null;
  }
}

/**
 * Esquema e seus vínculos diretos (cada um com a entidade da outra ponta, o
 * status, o ano e a fonte), numa única ida ao banco (consultas por índice:
 * idx_links_source / idx_links_target), guardado no cache de borda. Null se o
 * banco não responder.
 *
 * `SELECT l.*` (em lib/translations.ts) de propósito: funciona com ou sem as
 * colunas opcionais (reviewed_at, amount_note…) — as que faltarem viram null.
 */
export async function loadScheme(
  id: string,
  locale: Locale
): Promise<{ scheme: GraphNode | null; connections: SchemeConnection[] } | null> {
  const db = getDB();
  if (!db) return null;
  try {
    // "Não encontrado" (scheme null) não é guardado: um esquema recém-inserido aparece na hora.
    return await edgeCachedJson(
      `scheme/${locale}/${encodeURIComponent(id)}`,
      async () => {
        const [self, linksRes, nodesRes] = await withLang(locale, (lang) =>
          db.batch<Row>([
            db.prepare(`${nodeSelect(lang)} WHERE n.id = ?1`).bind(id),
            db.prepare(`${linkSelect(lang)} WHERE l.source = ?1 OR l.target = ?1`).bind(id),
            db
              .prepare(
                `${nodeSelect(lang)} WHERE n.id <> ?1 AND n.id IN (
                   SELECT target FROM links WHERE source = ?1
                   UNION SELECT source FROM links WHERE target = ?1)`
              )
              .bind(id),
          ])
        );
        const byId = new Map(nodesRes.results.map((r) => [String(r.id), toNode(r)]));
        const connections: SchemeConnection[] = [];
        for (const raw of linksRes.results) {
          const r = applyLinkTranslation(raw);
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
            amount_kind: toAmountKind(r.amount_kind),
            source_url: safeHttpUrl(r.source_url),
            reviewed_at: (clean(r.reviewed_at) as string | null) ?? null,
          });
        }
        return { scheme: self.results[0] ? toNode(self.results[0]) : null, connections };
      },
      { ...PAGE_CACHE, shouldCache: (v) => v.scheme !== null }
    );
  } catch (e) {
    console.error('[lib/db] loadScheme:', e);
    return null;
  }
}
