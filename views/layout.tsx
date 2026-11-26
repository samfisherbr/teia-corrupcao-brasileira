/**
 * Layout raiz do Next.js (envolve todas as páginas de um idioma). Usado pelos
 * três layouts de rota — app/(pt)/layout.tsx, app/en/layout.tsx e
 * app/es/layout.tsx —, cada um passando o seu `locale` (lib/i18n.ts).
 *  - metadata: título/descrição da aba e de compartilhamento, e o ícone.
 *    metadataBase faz URLs canônicas e do sitemap usarem o domínio real.
 *  - <html lang="…" className="dark">: idioma da página (leitores de tela,
 *    tradutor do navegador, busca) e tema escuro do Tailwind.
 *  - I18nProvider: entrega o idioma aos componentes do navegador (useI18n).
 *  - Google AdSense: toda página leva a meta tag de verificação
 *    `google-adsense-account` e o script do AdSense, com o ID de editor de
 *    lib/site.ts (ADSENSE_CLIENT). O script é inserido por
 *    components/AdSenseLoader.tsx depois que a página carrega; no EEE, Reino
 *    Unido e Suíça os anúncios ficam pausados até o consentimento. Isso basta para o Google verificar
 *    o site e para os Anúncios automáticos. O bloco de anúncio dos dossiês
 *    (InArticleAd) usa o ID de ADSENSE_SLOTS, no mesmo arquivo. A página do
 *    grafo não tem anúncio (ver ADSENSE_SLOTS).
 */
import React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/app/globals.css';
import { ADSENSE_CLIENT, SITE_DOMAIN, SITE_NAME } from '@/lib/site';
import { LOCALE_INFO, type Locale } from '@/lib/i18n';
import { getMessages } from '@/messages';
import { I18nProvider } from '@/components/I18nProvider';
import AdSenseLoader from '@/components/AdSenseLoader';

/**
 * Fonte Inter, servida pelo próprio site (next/font baixa os arquivos no build;
 * o navegador não acessa o Google). Expõe a variável --font-inter, que
 * `font-sans` (@theme em app/globals.css) e app/globals.css usam. `latin` cobre os
 * acentos do português e do espanhol.
 */
const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' });

export function layoutMetadata(locale: Locale): Metadata {
  const t = getMessages(locale);
  return {
    metadataBase: new URL(`https://${SITE_DOMAIN}`),
    title: SITE_NAME,
    description: t.site.defaultDescription,
    icons: {
      icon: '/icon.svg',
      shortcut: '/icon.svg',
      apple: '/icon.svg',
    },
    // Padrão de compartilhamento (WhatsApp, X…) para todas as páginas; cada
    // página pode sobrescrever. A imagem vem de views/og-image.tsx.
    openGraph: { siteName: SITE_NAME, locale: LOCALE_INFO[locale].og, type: 'website' },
    twitter: { card: 'summary_large_image' },
    // Libera prévia grande de imagem e trecho sem limite nos resultados do
    // Google: sem `max-image-preview:large` o Discover não mostra o cartão com
    // imagem grande.
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
    },
    other: { 'google-adsense-account': ADSENSE_CLIENT },
  };
}

export default function LocaleLayout({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return (
    <html lang={LOCALE_INFO[locale].tag} className={`dark h-full w-full ${inter.variable}`}>
      <body className="bg-surface-canvas text-slate-100 font-sans antialiased selection:bg-cyan-500 selection:text-black h-full w-full overflow-hidden">
        <I18nProvider locale={locale}>{children}</I18nProvider>
        {/* Script do AdSense: depois da página e, no EEE/Reino Unido/Suíça, anúncios só após consentimento. */}
        <AdSenseLoader />
      </body>
    </html>
  );
}
