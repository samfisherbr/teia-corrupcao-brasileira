/**
 * Endereços das páginas de dossiê (/esquemas/<slug>).
 *
 * O slug vem do id do esquema no banco: "esquema_anoes_orcamento" →
 * "anoes-orcamento". A conversão é reversível, então não é preciso guardar
 * slugs em lugar nenhum. Se o id de um esquema mudar no banco, o endereço da
 * página muda junto (e a chave em data/schemeDetails.ts precisa mudar também).
 *
 * Este módulo NÃO importa data/schemeDetails.ts de propósito: ele entra no
 * JavaScript da página inicial, e os textos dos dossiês (~115 KB) não devem
 * ir junto. O que depende dos textos fica em lib/dossiers.ts.
 */
import type { GraphLink, GraphNode } from '@/types/graph';
import { getLinkEnds } from '@/lib/graphConfig';

const PREFIX = 'esquema_';

export const schemeSlug = (id: string): string =>
  (id.startsWith(PREFIX) ? id.slice(PREFIX.length) : id).replace(/_/g, '-');

export const schemeIdFromSlug = (slug: string): string => `${PREFIX}${slug.replace(/-/g, '_')}`;

/**
 * Endereço do dossiê SEM o prefixo de idioma. Para montar um link, passe pelo
 * localePath de lib/i18n.ts: localePath(locale, schemePath(id)). O slug é o
 * mesmo nos três idiomas (vem do id do banco).
 */
export const schemePath = (id: string): string => `/esquemas/${schemeSlug(id)}`;

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
  b: { year?: number | null; title: string },
  /** Código de idioma para a ordem alfabética (LOCALE_INFO[locale].tag). */
  tag: string = 'pt-BR'
): number {
  const ya = a.year ?? -Infinity;
  const yb = b.year ?? -Infinity;
  if (ya !== yb) return yb - ya;
  return a.title.localeCompare(b.title, tag);
}
