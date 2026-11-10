/**
 * /robots.txt — instruções para robôs (Google, Bing, AdSense, IA…).
 *  - Robôs de IA (AI_BOTS em lib/aiBots.ts): proibidos no site inteiro. Além
 *    deste pedido, o middleware.ts responde 403 a eles.
 *  - Robôs de IA liberados (ALLOWED_AI_BOTS — hoje, os da Anthropic):
 *    `Allow: /` explícito, com a mesma exceção da API que vale para a busca.
 *  - Demais robôs (busca e AdSense): liberados, exceto a API de dados (JSON
 *    bruto, sem valor para a busca). Também informa onde está o sitemap.
 * Gerado no build.
 */
import type { MetadataRoute } from 'next';
import { SITE_DOMAIN } from '@/lib/site';
import { AI_BOTS, ALLOWED_AI_BOTS } from '@/lib/aiBots';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: ALLOWED_AI_BOTS.map((b) => b.name), allow: '/', disallow: '/api/' },
      { userAgent: AI_BOTS.map((b) => b.name), disallow: '/' },
      { userAgent: '*', allow: '/', disallow: '/api/' },
    ],
    sitemap: `https://${SITE_DOMAIN}/sitemap.xml`,
  };
}
