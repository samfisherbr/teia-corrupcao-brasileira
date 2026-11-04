/**
 * Layout raiz do Next.js (envolve todas as páginas).
 *  - metadata: título/descrição da aba e de compartilhamento, e o ícone.
 *  - <html lang="pt-BR" className="dark">: idioma (leitores de tela, tradutor)
 *    e tema escuro do Tailwind.
 */
import React from 'react';
import './globals.css';

export const metadata = {
  title: 'Teia da Corrupção',
  description: 'Mapeamento de Redes Relacionais e Investigação de Corrupção no Brasil',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark h-full w-full">
      <body className="bg-[#080d16] text-slate-100 antialiased selection:bg-cyan-500 selection:text-black h-full w-full overflow-hidden">
        {children}
      </body>
    </html>
  );
}