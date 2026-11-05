/**
 * /sitemap.xml — lista de todas as páginas do site para os robôs de busca.
 * Gerado no build: páginas fixas + uma página de dossiê por esquema com texto
 * em data/schemeDetails.ts. Ao adicionar um dossiê lá, ele entra no próximo
 * deploy. Endereços usam o domínio de lib/site.ts (NEXT_PUBLIC_SITE_DOMAIN).
 */
import type { MetadataRoute } from 'next';
import { SITE_DOMAIN } from '@/lib/site';
import { DOSSIER_SCHEME_IDS, schemePath } from '@/lib/schemes';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = `https://${SITE_DOMAIN}`;
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/esquemas`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    ...DOSSIER_SCHEME_IDS.map((id) => ({
      url: `${base}${schemePath(id)}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    { url: `${base}/about`, lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];
}
