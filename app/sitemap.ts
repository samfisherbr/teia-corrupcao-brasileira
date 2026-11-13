/**
 * /sitemap.xml — lista de todas as páginas do site para os robôs de busca.
 * Gerado no build: páginas fixas + uma página de dossiê por esquema com texto
 * em data/schemeDetails.ts, cada uma nos três idiomas (com as versões nos
 * outros idiomas indicadas em `alternates`, o hreflang do sitemap). Ao
 * adicionar um dossiê lá, ele entra no próximo deploy. A data de cada dossiê
 * é o `reviewedAt` dele. Endereços usam o domínio de lib/site.ts (NEXT_PUBLIC_SITE_DOMAIN).
 */
import type { MetadataRoute } from 'next';
import { SITE_DOMAIN } from '@/lib/site';
import { schemePath } from '@/lib/schemes';
import { DOSSIER_SCHEME_IDS, dossierReviewedAt } from '@/lib/dossiers';
import { CORRECTIONS } from '@/data/corrections';
import { LOCALES, LOCALE_INFO, localePath } from '@/lib/i18n';

/** Meio-dia UTC, para a data não mudar de dia conforme o fuso. */
const day = (iso: string) => new Date(`${iso}T12:00:00Z`);

type Entry = Omit<MetadataRoute.Sitemap[number], 'url' | 'alternates'> & { path: string };

export default function sitemap(): MetadataRoute.Sitemap {
  const base = `https://${SITE_DOMAIN}`;
  // lastModified = data REAL da última revisão (não a data do build: dizer ao
  // Google que tudo mudou a cada deploy faz ele passar a ignorar o campo).
  const reviewDates = DOSSIER_SCHEME_IDS.map(dossierReviewedAt).filter((d): d is string => !!d).sort();
  const newest = reviewDates.length ? day(reviewDates[reviewDates.length - 1]) : undefined;
  const lastCorrection = CORRECTIONS.map((c) => c.date).sort().pop();

  const pages: Entry[] = [
    { path: '/', lastModified: newest, changeFrequency: 'weekly', priority: 1 },
    { path: '/esquemas', lastModified: newest, changeFrequency: 'weekly', priority: 0.9 },
    ...DOSSIER_SCHEME_IDS.map((id): Entry => {
      const reviewed = dossierReviewedAt(id);
      return {
        path: schemePath(id),
        lastModified: reviewed ? day(reviewed) : undefined,
        changeFrequency: 'monthly',
        priority: 0.8,
      };
    }),
    {
      path: '/correcoes',
      lastModified: lastCorrection ? day(lastCorrection) : undefined,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    { path: '/about', changeFrequency: 'yearly', priority: 0.4 },
    { path: '/privacy', changeFrequency: 'yearly', priority: 0.3 },
    { path: '/terms', changeFrequency: 'yearly', priority: 0.3 },
  ];

  // Cada página entra uma vez por idioma, apontando para as outras versões.
  return pages.flatMap(({ path, ...rest }) => {
    const languages = Object.fromEntries(LOCALES.map((l) => [LOCALE_INFO[l].tag, `${base}${localePath(l, path)}`]));
    return LOCALES.map((l) => ({ url: `${base}${localePath(l, path)}`, ...rest, alternates: { languages } }));
  });
}
