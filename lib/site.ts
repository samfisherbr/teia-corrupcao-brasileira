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
