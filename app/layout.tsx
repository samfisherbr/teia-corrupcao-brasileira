/**
 * Layout raiz do Next.js (envolve todas as páginas).
 *  - metadata: título/descrição da aba e de compartilhamento, e o ícone.
 *    metadataBase faz URLs canônicas e do sitemap usarem o domínio real.
 *  - <html lang="pt-BR" className="dark">: idioma (leitores de tela, tradutor)
 *    e tema escuro do Tailwind.
 *  - Google AdSense: com NEXT_PUBLIC_ADSENSE_CLIENT definido (ca-pub-…), toda
 *    página leva a meta tag de verificação `google-adsense-account` e o script
 *    do AdSense no <head>. Isso basta para o Google verificar o site durante a
 *    análise e, depois da aprovação, para os Anúncios automáticos. Blocos de
 *    anúncio fixos (AdBanner) precisam também de NEXT_PUBLIC_ADSENSE_SLOT.
 */
import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { SITE_DOMAIN } from '@/lib/site';

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

export const metadata: Metadata = {
  metadataBase: new URL(`https://${SITE_DOMAIN}`),
  title: 'Teia da Corrupção',
  description: 'Mapeamento de Redes Relacionais e Investigação de Corrupção no Brasil',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  ...(ADSENSE_CLIENT ? { other: { 'google-adsense-account': ADSENSE_CLIENT } } : {}),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark h-full w-full">
      <head>
        {ADSENSE_CLIENT && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body className="bg-[#080d16] text-slate-100 antialiased selection:bg-cyan-500 selection:text-black h-full w-full overflow-hidden">
        {children}
      </body>
    </html>
  );
}
