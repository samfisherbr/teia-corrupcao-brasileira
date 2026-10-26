import React from 'react';
import './globals.css';

export const metadata = {
  title: 'CORRWEB',
  description: 'Mapeamento de Redes Relacionais e Investigação de Corrupção no Brasil',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="bg-[#080d16] text-slate-100 antialiased selection:bg-cyan-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}