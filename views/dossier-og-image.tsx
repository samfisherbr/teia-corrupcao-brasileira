/**
 * Imagem de compartilhamento de cada dossiê (/esquemas/<slug>), com o título
 * do caso no idioma da página. Gerada sob demanda no runtime edge; o título
 * vem de data/schemeDetails*.ts (sem consulta ao banco). Desenho em lib/ogImage.tsx.
 */
import { fallbackSchemeTitle, loadSchemeDetails } from '@/lib/dossiers';
import { renderOgImage } from '@/lib/ogImage';
import { schemeIdFromSlug } from '@/lib/schemes';
import type { Locale } from '@/lib/i18n';
import { getMessages } from '@/messages';

export async function dossierOgImage(locale: Locale, slug: string) {
  const t = getMessages(locale);
  const details = await loadSchemeDetails(locale);
  return renderOgImage({
    eyebrow: t.site.ogDossier,
    title: fallbackSchemeTitle(schemeIdFromSlug(slug), details),
    footer: t.site.ogFooter,
  });
}
