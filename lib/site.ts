/**
 * Dados institucionais usados nas páginas Sobre, Privacidade e Termos.
 * Altere aqui uma vez e as três páginas se atualizam.
 */

/** Nome do projeto como aparece nos textos. */
export const SITE_NAME = 'Teia da Corrupção';

/**
 * Domínio público (sem https://). Defina NEXT_PUBLIC_SITE_DOMAIN no Cloudflare
 * Pages ou troque o valor padrão abaixo pelo domínio real.
 */
export const SITE_DOMAIN = process.env.NEXT_PUBLIC_SITE_DOMAIN || 'teiadacorrupcao.io';

/** E-mail para dúvidas, correções e pedidos relativos à LGPD. */
export const CONTACT_EMAIL = 'samfisherbr@gmail.com';

/** Data da última revisão dos textos legais (atualize ao mudá-los). */
export const LEGAL_LAST_UPDATED = '3 de novembro de 2026';

/**
 * ID de editor do Google AdSense (público: aparece no HTML de toda página).
 * Usado no script e na meta tag de verificação (app/layout.tsx), no /ads.txt
 * e no banner (AdBanner). NEXT_PUBLIC_ADSENSE_CLIENT, se definida, tem prioridade.
 */
export const ADSENSE_CLIENT =
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim() || 'ca-pub-5667235064220150';
