/**
 * Layout raiz do Next.js (envolve todas as páginas).
 *  - metadata: título/descrição da aba e de compartilhamento, e o ícone.
 *    metadataBase faz URLs canônicas e do sitemap usarem o domínio real.
 *  - <html lang="pt-BR" className="dark">: idioma (leitores de tela, tradutor)
 *    e tema escuro do Tailwind.
 *  - Google AdSense: toda página leva a meta tag de verificação
 *    `google-adsense-account` e o script do AdSense no <head>, com o ID de
 *    editor de lib/site.ts (ADSENSE_CLIENT). Isso basta para o Google verificar
 *    o site e para os Anúncios automáticos. Os blocos de anúncio (AdBanner,
 *    InArticleAd) usam os IDs de ADSENSE_SLOTS, no mesmo arquivo.
 */
import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { ADSENSE_CLIENT, SITE_DOMAIN } from '@/lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(`https://${SITE_DOMAIN}`),
  title: 'Teia da Corrupção',
  description: 'Mapeamento de Redes Relacionais e Investigação de Corrupção no Brasil',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  other: { 'google-adsense-account': ADSENSE_CLIENT },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark h-full w-full">
      <head>
        {/* Script do Google AdSense (o código fornecido pelo AdSense). */}
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-[#080d16] text-slate-100 antialiased selection:bg-cyan-500 selection:text-black h-full w-full overflow-hidden">
        {children}
      </body>
    </html>
  );
}
