/**
 * /robots.txt — instruções para robôs de busca (Google, Bing…) e do AdSense.
 * Libera o site todo, exceto a API de dados (JSON bruto, sem valor para a
 * busca), e informa onde está o sitemap. Gerado no build.
 */
import type { MetadataRoute } from 'next';
import { SITE_DOMAIN } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/api/' },
    sitemap: `https://${SITE_DOMAIN}/sitemap.xml`,
  };
}
