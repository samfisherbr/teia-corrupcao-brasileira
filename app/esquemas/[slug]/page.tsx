/**
 * Página de dossiê de um esquema (/esquemas/<slug>).
 *
 * Renderizada no servidor a cada visita (runtime edge, lê o D1), para que o
 * Google e outros robôs leiam o texto inteiro: o grafo da página inicial é
 * desenhado num <canvas> e o Glossário só aparece depois de um clique, então
 * nenhum dos dois é legível para eles.
 *
 * Conteúdo: título e resumo vêm do banco (nó `scheme`); impacto, contexto,
 * funcionamento, situação jurídica e fontes vêm de data/schemeDetails.ts;
 * entidades ligadas vêm dos links do banco. Sem banco, a página sai só com
 * o dossiê e um título de reserva. Esquema desconhecido → 404.
 */
import React, { cache } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowLeft, Coins, ExternalLink, Network } from 'lucide-react';
import { SCHEME_DETAILS } from '@/data/schemeDetails';
import { NODE_STYLE, entityChipStyle } from '@/lib/graphConfig';
import { NODE_ICONS } from '@/lib/nodeIcons';
import { loadScheme } from '@/lib/db';
import { fallbackSchemeTitle, schemeIdFromSlug, schemePath } from '@/lib/schemes';
import { SITE_NAME } from '@/lib/site';
import type { GraphNode, NodeType } from '@/types/graph';

export const runtime = 'edge';

const TYPE_ORDER = Object.keys(NODE_STYLE) as NodeType[];

/** Uma consulta ao banco por requisição, mesmo usada por generateMetadata e pela página. */
const getScheme = cache(async (slug: string) => {
  const id = schemeIdFromSlug(slug);
  const details = SCHEME_DETAILS[id];
  const db = await loadScheme(id);
  if (!details && !db?.scheme) return null;
  const title = db?.scheme?.label ?? fallbackSchemeTitle(id);
  const summary = db?.scheme?.summary ?? details?.context.split('. ')[0] ?? null;
  const entities = (db?.entities ?? []).sort(
    (a, b) => TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type) || a.label.localeCompare(b.label, 'pt-BR')
  );
  return { id, title, summary, details, entities };
});

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = await getScheme(slug);
  if (!s) return { title: `Esquema não encontrado | ${SITE_NAME}` };
  return {
    title: `${s.title} | ${SITE_NAME}`,
    description: s.summary ?? `Dossiê do esquema ${s.title}.`,
    alternates: { canonical: schemePath(s.id) },
    openGraph: { title: s.title, description: s.summary ?? undefined, type: 'article' },
  };
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">{title}</h2>
      {children}
    </section>
  );
}

function EntityChip({ node }: { node: GraphNode }) {
  const Icon = NODE_ICONS[node.type];
  return (
    <li
      className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md border font-medium"
      style={entityChipStyle(node.type)}
      title={NODE_STYLE[node.type]?.label}
    >
      {Icon && <Icon size={16} className="w-4 h-4 shrink-0" aria-hidden="true" />}
      <span>
        {node.label} {node.party ? `(${node.party})` : ''}
      </span>
    </li>
  );
}

export default async function SchemeDossierPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = await getScheme(slug);
  if (!s) notFound();
  const { title, summary, details, entities } = s;

  return (
    <div className="h-[100dvh] w-full bg-[#080d16] text-slate-200 font-sans px-4 py-10 sm:px-8 overflow-y-auto select-text">
      <article className="max-w-3xl mx-auto space-y-8">
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-mono">
          <Link href="/" className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300">
            <ArrowLeft size={16} className="w-4 h-4 shrink-0" aria-hidden="true" />
            Voltar ao painel
          </Link>
          <Link href="/esquemas" className="text-cyan-400 hover:text-cyan-300">
            Todos os esquemas
          </Link>
        </nav>

        <header className="space-y-3 border-b border-slate-800 pb-6">
          <span
            className="inline-block whitespace-nowrap text-[10px] font-mono font-bold tracking-widest uppercase px-2.5 py-1 rounded border"
            style={entityChipStyle('scheme')}
          >
            {NODE_STYLE.scheme.label}
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-white break-words">{title}</h1>
          {summary && <p className="text-base text-slate-300 leading-relaxed">{summary}</p>}
        </header>

        {details?.impact && (
          <div className="flex items-start gap-2 p-4 rounded-lg bg-slate-900 border border-slate-800">
            <Coins size={16} className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" aria-hidden="true" />
            <p className="text-sm leading-relaxed text-slate-300">
              <span className="font-mono text-slate-400">Impacto:</span>{' '}
              <strong className="font-medium text-slate-100">{details.impact}</strong>
            </p>
          </div>
        )}

        {details?.context && (
          <Section title="Contexto histórico e origem">
            <p className="text-sm text-slate-300 leading-relaxed">{details.context}</p>
          </Section>
        )}

        {details?.mechanism && (
          <Section title="Funcionamento do esquema">
            <p className="text-sm text-slate-300 leading-relaxed">{details.mechanism}</p>
          </Section>
        )}

        {entities.length > 0 && (
          <Section title="Entidades ligadas ao esquema">
            <ul className="flex flex-wrap gap-2">
              {entities.map((n) => (
                <EntityChip key={n.id} node={n} />
              ))}
            </ul>
          </Section>
        )}

        {details?.legalStatus && (
          <Section title="Desdobramentos jurídicos e situação atual">
            <p className="text-sm text-slate-300 leading-relaxed">{details.legalStatus}</p>
          </Section>
        )}

        {details?.sources && details.sources.length > 0 && (
          <Section title="Fontes documentais e reportagens">
            <ul className="space-y-1.5">
              {details.sources.map((src, i) => (
                <li key={i}>
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-cyan-400 hover:text-cyan-200 hover:underline"
                  >
                    <span>{src.title}</span>
                    <ExternalLink size={16} className="w-4 h-4 shrink-0" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </Section>
        )}

        <footer className="pt-6 border-t border-slate-800">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-400 hover:text-cyan-200 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/50 px-3 py-2 rounded-lg"
          >
            <Network size={16} className="w-4 h-4 shrink-0" aria-hidden="true" />
            Explorar as conexões na teia
          </Link>
        </footer>
      </article>
    </div>
  );
}
