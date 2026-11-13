'use client';

/**
 * Idioma da página para os componentes que rodam no navegador.
 * O layout (views/layout.tsx) envolve tudo com <I18nProvider>; dentro
 * de qualquer componente 'use client':
 *
 *   const { t, locale, href } = useI18n();
 *   t.sidebar.title            → texto no idioma da página (messages/)
 *   href('/esquemas')          → "/esquemas", "/en/esquemas" ou "/es/esquemas"
 *
 * Componentes de servidor não usam isto: chamam getMessages(locale) e
 * localePath(locale, …) direto, com o `locale` dos parâmetros da rota.
 */
import React, { createContext, useContext, useMemo } from 'react';
import { DEFAULT_LOCALE, localePath, type Locale } from '@/lib/i18n';
import { getMessages, type Messages } from '@/messages';

interface I18n {
  locale: Locale;
  t: Messages;
  /** Endereço interno com o prefixo do idioma atual. */
  href: (path: string) => string;
}

const make = (locale: Locale): I18n => ({
  locale,
  t: getMessages(locale),
  href: (path) => localePath(locale, path),
});

const I18nContext = createContext<I18n>(make(DEFAULT_LOCALE));

export function I18nProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const value = useMemo(() => make(locale), [locale]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useI18n = (): I18n => useContext(I18nContext);
