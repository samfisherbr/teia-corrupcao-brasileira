/**
 * Dados derivados dos textos dos dossiês (data/schemeDetails*.ts).
 *
 * Separado de lib/schemes.ts para que só as páginas que realmente mostram os
 * textos (dossiês, Glossário, sitemap) carreguem os arquivos de ~115 KB.
 *
 * IDIOMAS: o português (data/schemeDetails.ts) é a fonte da verdade — de lá
 * vêm a lista de dossiês, as fontes e a data de revisão. As traduções ficam em
 * data/schemeDetails.en.ts e data/schemeDetails.es.ts e só são carregadas
 * quando a página é naquele idioma (loadSchemeDetails).
 *
 * TRADUÇÃO DESATUALIZADA: cada tradução guarda o `reviewedAt` do texto em
 * português que ela traduziu. Se o `reviewedAt` do português mudar (o texto
 * foi revisto) e a tradução não, o site volta a mostrar o PORTUGUÊS naquele
 * dossiê, com um aviso de "tradução em revisão" — uma tradução velha nunca
 * fica no ar afirmando algo que o original já corrigiu. Para liberar de novo:
 * atualize o texto traduzido e copie o novo `reviewedAt` para ele.
 * `npm run check:translations` lista o que está faltando ou desatualizado.
 */
import { SCHEME_DETAILS, type SchemeDetail, type SchemeDetailTranslation } from '@/data/schemeDetails';
import { schemeSlug } from '@/lib/schemes';
import type { Locale } from '@/lib/i18n';

/** Dossiê pronto para exibir num idioma. */
export interface LocalizedSchemeDetail extends SchemeDetail {
  /** true = a página é em outro idioma, mas o texto exibido é o português (tradução ausente ou desatualizada). */
  translationPending: boolean;
}

/** Ids de todos os esquemas com dossiê escrito (sitemap, página inicial). */
export const DOSSIER_SCHEME_IDS = Object.keys(SCHEME_DETAILS);

/** Título derivado do id, para esquema sem dossiê: "esquema_anoes_orcamento" → "Anoes Orcamento". */
const titleFromId = (id: string): string =>
  schemeSlug(id)
    .split('-')
    .map((w) => (w.length > 2 ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');

/** Data da última revisão do dossiê (AAAA-MM-DD), se houver. A mesma nos três idiomas. */
export const dossierReviewedAt = (id: string): string | null => SCHEME_DETAILS[id]?.reviewedAt ?? null;

async function loadTranslations(locale: Locale): Promise<Record<string, SchemeDetailTranslation>> {
  if (locale === 'en') return (await import('@/data/schemeDetails.en')).SCHEME_DETAILS_EN;
  if (locale === 'es') return (await import('@/data/schemeDetails.es')).SCHEME_DETAILS_ES;
  return {};
}

/**
 * Todos os dossiês no idioma pedido (chave = id do esquema). Onde não há
 * tradução em dia, vem o texto em português com `translationPending: true`.
 */
export async function loadSchemeDetails(locale: Locale): Promise<Record<string, LocalizedSchemeDetail>> {
  const translations = await loadTranslations(locale);
  const out: Record<string, LocalizedSchemeDetail> = {};
  for (const [id, base] of Object.entries(SCHEME_DETAILS)) {
    const tr = translations[id];
    const fresh = !!tr && tr.reviewedAt === base.reviewedAt;
    out[id] = fresh
      ? {
          ...base,
          title: tr.title,
          context: tr.context,
          mechanism: tr.mechanism,
          impact: tr.impact,
          legalStatus: tr.legalStatus,
          translationPending: false,
        }
      : { ...base, translationPending: locale !== 'pt' };
  }
  return out;
}

/**
 * Título de reserva, para quando o banco não responde ou a página é gerada no
 * build: o `title` do dossiê (já no idioma de `details`); sem dossiê, deriva
 * do id ("Anoes Orcamento").
 */
export const fallbackSchemeTitle = (id: string, details?: Record<string, { title: string }>): string =>
  (details ?? SCHEME_DETAILS)[id]?.title ?? titleFromId(id);
