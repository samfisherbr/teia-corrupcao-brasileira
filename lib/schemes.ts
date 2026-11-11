/**
 * Endereços das páginas de dossiê (/esquemas/<slug>).
 *
 * O slug vem do id do esquema no banco: "esquema_anoes_orcamento" →
 * "anoes-orcamento". A conversão é reversível, então não é preciso guardar
 * slugs em lugar nenhum. Se o id de um esquema mudar no banco, o endereço da
 * página muda junto (e a chave em data/schemeDetails.ts precisa mudar também).
 */
import { SCHEME_DETAILS } from '@/data/schemeDetails';
import type { GraphLink, GraphNode } from '@/types/graph';
import { getLinkEnds } from '@/lib/graphConfig';

const PREFIX = 'esquema_';

export const schemeSlug = (id: string): string =>
  (id.startsWith(PREFIX) ? id.slice(PREFIX.length) : id).replace(/_/g, '-');

export const schemeIdFromSlug = (slug: string): string => `${PREFIX}${slug.replace(/-/g, '_')}`;

export const schemePath = (id: string): string => `/esquemas/${schemeSlug(id)}`;

/** Ids de todos os esquemas com dossiê escrito (usado no sitemap). */
export const DOSSIER_SCHEME_IDS = Object.keys(SCHEME_DETAILS);

/**
 * Título de reserva, só para quando o banco não responde: derivado do id,
 * sem acentos ("Anoes Orcamento"). Com o banco no ar, o título é o `label`.
 */
export const fallbackSchemeTitle = (id: string): string =>
  schemeSlug(id)
    .split('-')
    .map((w) => (w.length > 2 ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');

/**
 * ANO DO CASO = ano de início do esquema = ano do seu vínculo datado mais
 * antigo. Calculado a partir dos dados (nunca fixo no código): um vínculo
 * novo mais antigo, ou um esquema novo, muda o ano e a ordem das listas
 * sozinho. É a mesma regra do slider "Ano de Início".
 */
export function computeSchemeStartYears(nodes: GraphNode[], links: GraphLink[]): Map<string, number> {
  const schemeIds = new Set(nodes.filter((n) => n.type === 'scheme').map((n) => n.id));
  const start = new Map<string, number>();
  for (const l of links) {
    const y = Number(l.year);
    if (!Number.isFinite(y) || y <= 0) continue;
    const { sourceId, targetId } = getLinkEnds(l);
    for (const id of [sourceId, targetId]) {
      if (schemeIds.has(id) && (!start.has(id) || y < start.get(id)!)) start.set(id, y);
    }
  }
  return start;
}

/**
 * Ordem das listas de dossiês (Glossário e /esquemas): do caso mais RECENTE
 * para o mais antigo; esquemas sem nenhum vínculo datado vão para o fim;
 * empate → ordem alfabética.
 */
export function compareByYearDesc(
  a: { year?: number | null; title: string },
  b: { year?: number | null; title: string }
): number {
  const ya = a.year ?? -Infinity;
  const yb = b.year ?? -Infinity;
  if (ya !== yb) return yb - ya;
  return a.title.localeCompare(b.title, 'pt-BR');
}
