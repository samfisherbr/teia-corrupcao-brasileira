/**
 * /robots.txt — instruções gerais para robôs (Google, Bing, AdSense…).
 *  - Todos liberados, exceto a API de dados (JSON bruto, sem valor para a
 *    busca). Também informa onde está o sitemap.
 *  - O controle de robôs de IA (quem bloquear, quem liberar) fica só no
 *    Cloudflare: AI Crawl Control → regra do WAF por User-Agent. Robôs de
 *    treino de IA (GPTBot, CCBot, Bytespider etc.) são bloqueados; os que
 *    buscam a página a pedido de um usuário ou para citar em busca
 *    (ChatGPT-User, OAI-SearchBot, Perplexity-User, Claude-User) e os da
 *    Anthropic (ClaudeBot, Claude-SearchBot) são liberados. Não repita essa
 *    lista aqui.
 * Gerado no build.
 */
import type { MetadataRoute } from 'next';
import { SITE_DOMAIN } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: '/api/' }],
    sitemap: `https://${SITE_DOMAIN}/sitemap.xml`,
  };
}
