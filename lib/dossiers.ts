/**
 * Dados derivados dos textos dos dossiês (data/schemeDetails.ts).
 *
 * Separado de lib/schemes.ts para que só as páginas que realmente mostram os
 * textos (dossiês, Glossário, sitemap) carreguem o arquivo de ~115 KB.
 */
import { SCHEME_DETAILS } from '@/data/schemeDetails';
import { schemeSlug } from '@/lib/schemes';

/** Ids de todos os esquemas com dossiê escrito (sitemap, página inicial). */
export const DOSSIER_SCHEME_IDS = Object.keys(SCHEME_DETAILS);

/**
 * Título de reserva, para quando o banco não responde ou a página é gerada no
 * build: o `title` do dossiê; sem dossiê, deriva do id ("Anoes Orcamento").
 */
export const fallbackSchemeTitle = (id: string): string =>
  SCHEME_DETAILS[id]?.title ??
  schemeSlug(id)
    .split('-')
    .map((w) => (w.length > 2 ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');

/** Data da última revisão do dossiê (AAAA-MM-DD), se houver. */
export const dossierReviewedAt = (id: string): string | null => SCHEME_DETAILS[id]?.reviewedAt ?? null;

export { formatDatePtBR } from '@/lib/format';
