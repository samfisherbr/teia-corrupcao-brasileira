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
 *    `google-adsense-account` e o script do AdSense no <head>, com o ID de
 *    editor de lib/site.ts (ADSENSE_CLIENT). Isso basta para o Google verificar
 *    o site e para os Anúncios automáticos. Os blocos de anúncio (AdBanner,
 *    InArticleAd) usam os IDs de ADSENSE_SLOTS, no mesmo arquivo.
 */
import React from 'react';
import type { Metadata } from 'next';
import '@/app/globals.css';
import { ADSENSE_CLIENT, SITE_DOMAIN, SITE_NAME } from '@/lib/site';
import { LOCALE_INFO, type Locale } from '@/lib/i18n';
import { getMessages } from '@/messages';
import { I18nProvider } from '@/components/I18nProvider';

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
    other: { 'google-adsense-account': ADSENSE_CLIENT },
  };
}

export default function LocaleLayout({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return (
    <html lang={LOCALE_INFO[locale].tag} className="dark h-full w-full">
      <head>
        {/* Script do Google AdSense (o código fornecido pelo AdSense). */}
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-[#080d16] text-slate-100 antialiased selection:bg-cyan-500 selection:text-black h-full w-full overflow-hidden">
        <I18nProvider locale={locale}>{children}</I18nProvider>
      </body>
    </html>
  );
}
