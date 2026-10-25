import React from 'react';
import './globals.tsx';

export const metadata = {
  title: 'Investigação de Esquemas de Corrupção - Brasil',
  description: 'Visualização de grafos de conexões entre políticos, empresas e esquemas.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased selection:bg-blue-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
