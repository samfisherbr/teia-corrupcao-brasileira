/**
 * Moldura comum das páginas Sobre, Termos e Privacidade: barra do topo
 * (voltar + seletor de idioma), cabeçalho com ícone e título, e o corpo.
 * O corpo de cada idioma fica em content/legal/<página>.<idioma>.tsx.
 */
import React from 'react';
import PageNav from '@/components/PageNav';
import type { Locale } from '@/lib/i18n';

export default function LegalPage({
  locale,
  path,
  icon,
  title,
  subtitle,
  children,
}: {
  locale: Locale;
  /** Endereço da página sem prefixo de idioma ("/about"). */
  path: string;
  icon: React.ReactNode;
  title: string;
  /** Linha abaixo do título (subtítulo ou "Última atualização: …"). */
  subtitle: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="h-[100dvh] w-full bg-[#080d16] text-slate-200 font-sans px-4 py-12 sm:px-8 md:px-16 lg:px-24 overflow-y-auto select-text">
      <div className="max-w-4xl mx-auto space-y-8">
        <PageNav locale={locale} path={path} />

        <div className="border-b border-slate-800 pb-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-400/30 text-cyan-400">{icon}</div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">{title}</h1>
          </div>
          {subtitle}
        </div>

        {children}
      </div>
    </div>
  );
}
