/**
 * Endereços das páginas de dossiê (/esquemas/<slug>).
 *
 * O slug vem do id do esquema no banco: "esquema_anoes_orcamento" →
 * "anoes-orcamento". A conversão é reversível, então não é preciso guardar
 * slugs em lugar nenhum. Se o id de um esquema mudar no banco, o endereço da
 * página muda junto (e a chave em data/schemeDetails.ts precisa mudar também).
 */
import { SCHEME_DETAILS } from '@/data/schemeDetails';

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
