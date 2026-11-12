/**
 * Registro público de correções (/correcoes). Conteúdo estático, gerado no
 * build a partir de data/corrections.ts — para registrar uma correção, edite
 * aquele arquivo (as instruções estão no topo dele).
 */
import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, History } from 'lucide-react';
import { CORRECTIONS, CORRECTION_KIND_LABEL } from '@/data/corrections';
import { fallbackSchemeTitle, formatDatePtBR } from '@/lib/dossiers';
import { schemePath } from '@/lib/schemes';
import { CONTACT_EMAIL, SITE_NAME } from '@/lib/site';

export const metadata: Metadata = {
  title: `Correções e atualizações | ${SITE_NAME}`,
  description: `Registro público das correções e atualizações feitas nos dossiês da ${SITE_NAME}: o que mudou, quando e por quê.`,
  alternates: { canonical: '/correcoes' },
};

export default function CorrectionsPage() {
  // Mais recentes primeiro; no mesmo dia, mantém a ordem do arquivo.
  const entries = CORRECTIONS.map((c, i) => ({ ...c, i })).sort((a, b) => b.date.localeCompare(a.date) || a.i - b.i);

  return (
    <div className="h-[100dvh] w-full bg-[#080d16] text-slate-200 font-sans px-4 py-10 sm:px-8 overflow-y-auto select-text">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-300">
          <ArrowLeft size={16} className="w-4 h-4 shrink-0" aria-hidden="true" />
          Voltar ao painel
        </Link>

        <header className="space-y-2 border-b border-slate-800 pb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <History className="w-8 h-8 shrink-0 text-cyan-400" aria-hidden="true" />
            Correções e atualizações
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Toda mudança de conteúdo nos dossiês — erro corrigido, decisão judicial nova, fonte trocada ou
            posicionamento incluído a pedido de pessoa citada — fica registrada aqui, com a data e o motivo.
          </p>
        </header>

        {entries.length === 0 ? (
          <p className="text-sm text-slate-400">Nenhuma correção registrada até o momento.</p>
        ) : (
          <ol className="space-y-3">
            {entries.map((c) => (
              <li key={c.i} className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-mono">
                  <time dateTime={c.date} className="font-bold text-slate-300">
                    {formatDatePtBR(c.date) ?? c.date}
                  </time>
                  <span className="px-2 py-0.5 rounded border border-slate-700 bg-slate-800 text-slate-300 uppercase tracking-wider text-[10px]">
                    {CORRECTION_KIND_LABEL[c.kind]}
                  </span>
                </div>
                {c.scheme && (
                  <Link href={schemePath(c.scheme)} className="block text-sm font-bold text-cyan-400 hover:text-cyan-200 hover:underline">
                    {fallbackSchemeTitle(c.scheme)}
                  </Link>
                )}
                <p className="text-sm text-slate-300 leading-relaxed">{c.summary}</p>
              </li>
            ))}
          </ol>
        )}

        <footer className="pt-6 border-t border-slate-800 text-sm text-slate-400 leading-relaxed">
          Encontrou um erro ou uma decisão mais recente? Escreva para{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-cyan-400 hover:underline">
            {CONTACT_EMAIL}
          </a>
          , indicando o vínculo e a fonte. Veja também os{' '}
          <Link href="/terms" className="text-cyan-400 hover:underline">
            Termos de Uso
          </Link>{' '}
          (correções e direito de resposta).
        </footer>
      </div>
    </div>
  );
}
