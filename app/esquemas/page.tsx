/**
 * Índice dos dossiês (/esquemas): lista de todos os esquemas, cada um com
 * link para a sua página. Renderizado no servidor (runtime edge, lê o D1) —
 * é a porta de entrada dos robôs de busca para os dossiês.
 *
 * Lista = esquemas do banco + esquemas com dossiê em data/schemeDetails.ts
 * (sem banco, sai só a segunda parte, com títulos de reserva).
 */
import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { SCHEME_DETAILS } from '@/data/schemeDetails';
import { entityChipStyle } from '@/lib/graphConfig';
import { loadSchemeNodes } from '@/lib/db';
import { DOSSIER_SCHEME_IDS, fallbackSchemeTitle, schemePath } from '@/lib/schemes';
import { SITE_NAME } from '@/lib/site';

export const runtime = 'edge';

export const metadata: Metadata = {
  title: `Esquemas de corrupção | ${SITE_NAME}`,
  description:
    'Dossiês dos esquemas de corrupção mapeados: contexto histórico, funcionamento, impacto financeiro, desdobramentos jurídicos e fontes.',
  alternates: { canonical: '/esquemas' },
};

export default async function SchemesIndexPage() {
  const nodes = (await loadSchemeNodes()) ?? [];
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const ids = Array.from(new Set([...nodes.map((n) => n.id), ...DOSSIER_SCHEME_IDS]));
  const items = ids
    .map((id) => ({
      id,
      title: byId.get(id)?.label ?? fallbackSchemeTitle(id),
      summary: byId.get(id)?.summary ?? SCHEME_DETAILS[id]?.context.split('. ')[0] ?? null,
    }))
    .sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'));

  return (
    <div className="h-[100dvh] w-full bg-[#080d16] text-slate-200 font-sans px-4 py-10 sm:px-8 overflow-y-auto select-text">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-300">
          <ArrowLeft size={16} className="w-4 h-4 shrink-0" aria-hidden="true" />
          Voltar ao painel
        </Link>

        <header className="space-y-2 border-b border-slate-800 pb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <BookOpen className="w-8 h-8 shrink-0 text-cyan-400" aria-hidden="true" />
            Esquemas de corrupção
          </h1>
          <p className="text-sm text-slate-400">
            {items.length} esquemas documentados, com contexto histórico, funcionamento, impacto financeiro,
            situação jurídica e fontes.
          </p>
        </header>

        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={schemePath(item.id)}
                className="block p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-600 transition-colors"
              >
                <span
                  className="inline-block whitespace-nowrap text-[10px] font-mono font-bold tracking-widest uppercase px-2 py-0.5 rounded border"
                  style={entityChipStyle('scheme')}
                >
                  Dossiê
                </span>
                <h2 className="mt-2 text-lg font-bold text-white">{item.title}</h2>
                {item.summary && <p className="mt-1 text-sm text-slate-400 leading-relaxed line-clamp-2">{item.summary}</p>}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
