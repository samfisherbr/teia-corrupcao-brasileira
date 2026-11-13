/**
 * Imagem de compartilhamento padrão do site, uma por idioma (gerada no build).
 * Vale para a página inicial e para as páginas que não têm imagem própria.
 * Desenho em lib/ogImage.tsx.
 */
import { renderOgImage } from '@/lib/ogImage';
import type { Locale } from '@/lib/i18n';
import { getMessages } from '@/messages';

export function siteOgImage(locale: Locale) {
  const t = getMessages(locale);
  return renderOgImage({ eyebrow: t.site.ogEyebrow, title: t.site.ogTitle, footer: t.site.ogFooter });
}
