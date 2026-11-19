/**
 * Dados institucionais usados nas páginas Sobre, Privacidade e Termos.
 * Altere aqui uma vez e as três páginas se atualizam.
 */

/** Nome do projeto como aparece nos textos. É a marca: não é traduzido nos outros idiomas. */
export const SITE_NAME = 'Teia da Corrupção';

/**
 * Domínio público (sem https://). Defina NEXT_PUBLIC_SITE_DOMAIN no Cloudflare
 * Pages ou troque o valor padrão abaixo pelo domínio real.
 */
export const SITE_DOMAIN = process.env.NEXT_PUBLIC_SITE_DOMAIN || 'teiadacorrupcao.io';

/** E-mail para dúvidas, correções e pedidos relativos à LGPD. */
export const CONTACT_EMAIL = 'teiadacorrupcao@gmail.com';

/**
 * Data (AAAA-MM-DD) da última revisão dos textos legais — atualize ao mudá-los.
 * As páginas escrevem a data por extenso no idioma de cada uma.
 */
export const LEGAL_LAST_UPDATED = '2026-11-16';

/**
 * id da seção de texto da página inicial, logo abaixo do grafo (views/home.tsx).
 * Alvo do botão "Como ler o mapa" (GraphApp) e do item do menu do grafo.
 */
export const HOME_TEXT_ID = 'sobre-o-mapa';

/**
 * ID de editor do Google AdSense (público: aparece no HTML de toda página).
 * Usado no script e na meta tag de verificação (app/layout.tsx) e nos blocos
 * de anúncio. NEXT_PUBLIC_ADSENSE_CLIENT, se definida, tem prioridade.
 * Ao trocar de ID, atualize também public/ads.txt (arquivo de texto fixo).
 */
export const ADSENSE_CLIENT =
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim() || 'ca-pub-5667235064220150';

/**
 * IDs dos blocos de anúncio criados no AdSense (Anúncios → Por bloco).
 *  - inArticle: anúncio no artigo (fluido) dos dossiês, em
 *    components/InArticleAd.tsx.
 * A página do grafo NÃO tem anúncio: é um <canvas>, quase sem texto legível,
 * e a política do AdSense veta anúncio em tela sem conteúdo do editor
 * ("Inventory value"). O bloco "Network graph" (2182726962) do AdSense
 * ficou sem uso.
 */
export const ADSENSE_SLOTS = {
  inArticle: '1991155274',
} as const;
