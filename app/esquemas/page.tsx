/**
 * Índice dos dossiês (/esquemas): lista de todos os esquemas, cada um com
 * link para a sua página. Renderizado no servidor (runtime edge, lê o D1) —
 * é a porta de entrada dos robôs de busca para os dossiês.
 *
 * Lista e contagem = esquemas do BANCO, lidos a cada visita: um caso novo
 * no D1 aparece (e soma na contagem) sem mudar o código. Só se o banco não
 * responder, a lista sai dos dossiês em data/schemeDetails.ts (títulos de
 * reserva). Busca no navegador: components/SchemeSearchList.tsx.
 */
import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { SCHEME_DETAILS } from '@/data/schemeDetails';
import { loadSchemeIndex } from '@/lib/db';
import { DOSSIER_SCHEME_IDS, fallbackSchemeTitle } from '@/lib/dossiers';
import { compareByYearDesc, schemePath } from '@/lib/schemes';
import SchemeSearchList, { type SchemeListItem } from '@/components/SchemeSearchList';
import { SITE_NAME } from '@/lib/site';

export const runtime = 'edge';

export const metadata: Metadata = {
  title: `Esquemas de corrupção | ${SITE_NAME}`,
  description:
    'Dossiês dos esquemas de corrupção mapeados: contexto histórico, funcionamento, impacto financeiro, desdobramentos jurídicos e fontes.',
  alternates: { canonical: '/esquemas' },
};

export default async function SchemesIndexPage() {
  // Lista ordenada pelo ano do caso, do mais recente ao mais antigo, com os
  // anos lidos do banco a cada visita (sem banco: sem anos, ordem alfabética).
  const index = await loadSchemeIndex();
  const nodes = index?.nodes ?? [];
  const years = index?.years ?? new Map<string, number>();
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const ids = index ? nodes.map((n) => n.id) : DOSSIER_SCHEME_IDS;
  const items: SchemeListItem[] = ids
    .map((id) => {
      const d = SCHEME_DETAILS[id];
      const title = byId.get(id)?.label ?? fallbackSchemeTitle(id);
      const summary = byId.get(id)?.summary ?? d?.context.split('. ')[0] ?? null;
      return {
        id,
        href: schemePath(id),
        title,
        summary,
        year: years.get(id) ?? null,
        // Mesmos campos da busca do Glossário.
        terms: [title, summary, d?.impact, d?.context, d?.mechanism, d?.legalStatus, ...(index?.entityTerms.get(id) ?? [])]
          .filter(Boolean)
          .join(' '),
      };
    })
    .sort(compareByYearDesc);

  return (
    <div className="h-[100dvh] w-full bg-[#080d16] text-slate-200 font-sans px-4 py-10 sm:px-8 overflow-y-auto select-text">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-300">
          <ArrowLeft size={16} className="w-4 h-4 shrink-0" aria-hidden="true" />
          Voltar ao painel
        </Link>

        <header>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <BookOpen className="w-8 h-8 shrink-0 text-cyan-400" aria-hidden="true" />
            Esquemas de corrupção
          </h1>
        </header>

        <SchemeSearchList items={items}>
          <p className="text-sm text-slate-400">
            {items.length} esquemas documentados, com contexto histórico, funcionamento, impacto financeiro,
            situação jurídica e fontes — do caso mais recente ao mais antigo.
          </p>
        </SchemeSearchList>
      </div>
    </div>
  );
}
