/**
 * ============================================================================
 * IDIOMAS DO SITE
 * ============================================================================
 * Três idiomas, cada um com seu endereço:
 *   português (Brasil)       → sem prefixo:  /           /esquemas/…
 *   inglês (Reino Unido)     → prefixo /en:  /en         /en/esquemas/…
 *   espanhol (Espanha)       → prefixo /es:  /es         /es/esquemas/…
 *
 * Onde fica cada coisa:
 *   - páginas ................. views/ (um arquivo por página, recebe o idioma)
 *   - rotas ................... app/(pt), app/en, app/es — arquivos GERADOS por
 *                               scripts/gen-locale-routes.mjs (`npm run gen:routes`)
 *   - textos da interface ..... messages/ (um arquivo por idioma)
 *   - Sobre/Termos/Privacidade  content/legal/
 *   - dossiês ................. data/schemeDetails*.ts
 *   - nós e vínculos do grafo . banco D1: nodes/links (português) e as tabelas
 *                               node_translations / link_translations
 *
 * Para acrescentar um idioma: inclua o código em LOCALES e LOCALE_INFO, crie
 * messages/<código>.ts (o TypeScript aponta toda chave que faltar), os textos
 * de content/legal/, a bandeira em components/LanguageSwitcher.tsx, o valor no
 * CHECK das tabelas de tradução (migrations/0003_translations.sql) e rode
 * `npm run gen:routes` (depois de incluir o idioma no script).
 * ============================================================================
 */
export const LOCALES = ['pt', 'en', 'es'] as const;
export type Locale = (typeof LOCALES)[number];

/** Idioma dos endereços sem prefixo. */
export const DEFAULT_LOCALE: Locale = 'pt';

/** Idiomas com tradução (todos menos o padrão). São também os valores de `lang` no banco. */
export const TRANSLATED_LOCALES = LOCALES.filter((l) => l !== DEFAULT_LOCALE);

export const LOCALE_INFO: Record<
  Locale,
  {
    /** Atributo `lang` do HTML e código usado em Intl (datas, números, ordenação). */
    tag: string;
    /** Formato do Open Graph (og:locale). */
    og: string;
    /** Nome do idioma no próprio idioma (seletor de idioma). */
    name: string;
    /** Sigla mostrada quando não cabe o nome. */
    short: string;
  }
> = {
  pt: { tag: 'pt-BR', og: 'pt_BR', name: 'Português', short: 'PT' },
  en: { tag: 'en-GB', og: 'en_GB', name: 'English', short: 'EN' },
  es: { tag: 'es-ES', og: 'es_ES', name: 'Español', short: 'ES' },
};

export const isLocale = (v: unknown): v is Locale => typeof v === 'string' && (LOCALES as readonly string[]).includes(v);

/**
 * Endereço de uma página num idioma: localePath('en', '/esquemas') → "/en/esquemas";
 * em português o endereço não muda. `path` começa com "/" e não tem prefixo.
 */
export const localePath = (locale: Locale, path: string): string =>
  locale === DEFAULT_LOCALE ? path : `/${locale}${path === '/' ? '' : path}`;

/**
 * Separa o idioma do endereço que aparece no navegador:
 * "/en/esquemas/x" → { locale: 'en', path: '/esquemas/x' }; "/esquemas" → pt.
 */
export function splitLocale(pathname: string): { locale: Locale; path: string } {
  const [, first, ...rest] = pathname.split('/');
  if (isLocale(first) && first !== DEFAULT_LOCALE) return { locale: first, path: `/${rest.join('/')}`.replace(/\/$/, '') || '/' };
  return { locale: DEFAULT_LOCALE, path: pathname || '/' };
}

/**
 * Bloco `alternates` dos metadados de uma página: endereço canônico no idioma
 * atual + as versões nos outros idiomas (hreflang), para o Google mostrar a
 * cada pessoa a versão no idioma dela. x-default = português.
 */
export function alternatesFor(locale: Locale, path: string) {
  return {
    canonical: localePath(locale, path),
    languages: {
      ...Object.fromEntries(LOCALES.map((l) => [LOCALE_INFO[l].tag, localePath(l, path)])),
      'x-default': localePath(DEFAULT_LOCALE, path),
    },
  };
}
