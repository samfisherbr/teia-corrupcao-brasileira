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
 * a lista "Quem aparece no caso" vem dos vínculos do banco — cada entidade
 * com o papel, o STATUS JURÍDICO, o ano e a FONTE daquele vínculo (é o que
 * sustenta cada citação; no grafo isso só aparece ao clicar numa linha).
 * Sem banco, a página sai só com o dossiê e o título de reserva. Esquema
 * desconhecido → 404.
 *
 * Também saem daqui: a data "Revisado em" (reviewedAt do dossiê), os dados
 * estruturados JSON-LD (Article + BreadcrumbList) e, pelo arquivo vizinho
 * opengraph-image.tsx, a imagem de compartilhamento.
 *
 * Anúncio: um bloco "no artigo" (InArticleAd) dois parágrafos depois do
 * início — após o resumo e o contexto histórico —, como o Google recomenda.
 */
import React, { cache } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowLeft, CalendarCheck, Coins, ExternalLink, Network } from 'lucide-react';
import { SCHEME_DETAILS } from '@/data/schemeDetails';
import { FALLBACK_COLOR, NODE_STYLE, STATUS_STYLE, entityChipStyle } from '@/lib/graphConfig';
import { NODE_ICONS } from '@/lib/nodeIcons';
import InArticleAd from '@/components/InArticleAd';
import { loadScheme, type SchemeConnection } from '@/lib/db';
import { fallbackSchemeTitle, formatDatePtBR } from '@/lib/dossiers';
import { schemeIdFromSlug, schemePath } from '@/lib/schemes';
import { SITE_DOMAIN, SITE_NAME } from '@/lib/site';
import type { NodeType } from '@/types/graph';

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
  // Ordem: tipo (como na legenda do grafo), nome e ano.
  const connections = (db?.connections ?? []).sort(
    (a, b) =>
      TYPE_ORDER.indexOf(a.entity.type) - TYPE_ORDER.indexOf(b.entity.type) ||
      a.entity.label.localeCompare(b.entity.label, 'pt-BR') ||
      (a.year ?? 0) - (b.year ?? 0)
  );
  return { id, title, summary, details, connections };
});

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = await getScheme(slug);
  if (!s) return { title: `Esquema não encontrado | ${SITE_NAME}` };
  return {
    title: `${s.title} | ${SITE_NAME}`,
    description: s.summary ?? `Dossiê do esquema ${s.title}.`,
    alternates: { canonical: schemePath(s.id) },
    openGraph: {
      title: s.title,
      description: s.summary ?? undefined,
      type: 'article',
      url: schemePath(s.id),
      modifiedTime: s.details?.reviewedAt,
    },
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

/** Um vínculo do esquema: quem, com que papel, em que situação e segundo qual fonte. */
function ConnectionItem({ c }: { c: SchemeConnection }) {
  const Icon = NODE_ICONS[c.entity.type];
  const st = STATUS_STYLE[c.status];
  const color = st?.color ?? FALLBACK_COLOR;
  const reviewed = formatDatePtBR(c.reviewed_at);
  return (
    <li className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md border font-medium"
          style={entityChipStyle(c.entity.type)}
          title={NODE_STYLE[c.entity.type]?.label}
        >
          {Icon && <Icon size={16} className="w-4 h-4 shrink-0" aria-hidden="true" />}
          <span>
            {c.entity.label}
            {c.entity.party ? ` (${c.entity.party})` : ''}
          </span>
        </span>
        <span
          className="text-[10px] font-mono font-bold uppercase tracking-wide px-2 py-0.5 rounded border"
          style={{ backgroundColor: `${color}20`, color, borderColor: `${color}50` }}
        >
          {st?.label ?? c.status}
        </span>
        {c.year && <span className="text-[11px] font-mono text-slate-400 tabular-nums">{c.year}</span>}
      </div>
      {c.relation && <p className="text-sm text-slate-300 leading-relaxed">{c.relation}</p>}
      {c.amount && (
        <p className="text-xs text-slate-400">
          <span className="font-mono">Valor citado:</span> <span className="text-emerald-400 font-mono">{c.amount}</span>
          {c.amount_note ? ` — ${c.amount_note}` : ''}
        </p>
      )}
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
        {c.source_url && (
          <a
            href={c.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-200 hover:underline"
          >
            Fonte: {hostOf(c.source_url)}
            <ExternalLink size={12} className="w-3 h-3 shrink-0" aria-hidden="true" />
          </a>
        )}
        {reviewed && c.reviewed_at && (
          <span>
            Situação conferida em <time dateTime={c.reviewed_at.slice(0, 10)}>{reviewed}</time>
          </span>
        )}
      </p>
    </li>
  );
}

/** "https://www.stf.jus.br/x/y" → "stf.jus.br" (texto do link da fonte). */
function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\d?\./, '');
  } catch {
    return 'link';
  }
}

/** JSON-LD seguro para <script>: "<" escapado para um texto não fechar a tag. */
const jsonLd = (data: unknown) => ({ __html: JSON.stringify(data).replace(/</g, '\\u003c') });

export default async function SchemeDossierPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = await getScheme(slug);
  if (!s) notFound();
  const { title, summary, details, connections } = s;
  const reviewed = formatDatePtBR(details?.reviewedAt);
  const url = `https://${SITE_DOMAIN}${schemePath(s.id)}`;
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: title,
      description: summary ?? undefined,
      inLanguage: 'pt-BR',
      dateModified: details?.reviewedAt,
      mainEntityOfPage: url,
      author: { '@type': 'Organization', name: SITE_NAME, url: `https://${SITE_DOMAIN}` },
      publisher: { '@type': 'Organization', name: SITE_NAME, url: `https://${SITE_DOMAIN}` },
      citation: details?.sources.map((src) => src.url),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `https://${SITE_DOMAIN}/` },
        { '@type': 'ListItem', position: 2, name: 'Esquemas', item: `https://${SITE_DOMAIN}/esquemas` },
        { '@type': 'ListItem', position: 3, name: title, item: url },
      ],
    },
  ];

  return (
    <div className="h-[100dvh] w-full bg-[#080d16] text-slate-200 font-sans px-4 py-10 sm:px-8 overflow-y-auto select-text">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(structuredData)} />
      <article className="max-w-3xl mx-auto space-y-8">
        <nav className="flex items-center gap-3 text-xs font-mono">
          <Link href="/" className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300">
            <ArrowLeft size={16} className="w-4 h-4 shrink-0" aria-hidden="true" />
            Voltar ao painel
          </Link>
          <span aria-hidden="true" className="h-4 w-px bg-slate-600" />
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
          {reviewed && details && (
            <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-slate-400">
              <CalendarCheck size={16} className="w-4 h-4 shrink-0 text-cyan-400" aria-hidden="true" />
              <span>
                Revisado em <time dateTime={details.reviewedAt}>{reviewed}</time>.
              </span>
              <Link href="/correcoes" className="text-cyan-400 hover:text-cyan-200 hover:underline">
                Correções e atualizações
              </Link>
            </p>
          )}
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

        {/* key: navegar entre dossiês recria o bloco e pede um anúncio novo. */}
        <InArticleAd key={s.id} />

        {details?.mechanism && (
          <Section title="Funcionamento do esquema">
            <p className="text-sm text-slate-300 leading-relaxed">{details.mechanism}</p>
          </Section>
        )}

        {connections.length > 0 && (
          <Section title="Quem aparece no caso: papel, situação jurídica e fonte">
            <p className="text-xs text-slate-500 leading-relaxed">
              Cada item é um vínculo documentado com o esquema, com a situação jurídica daquele vínculo. Investigação
              ou denúncia não equivale a condenação, e anulação de condenação não equivale a absolvição.
            </p>
            <ul className="space-y-2">
              {connections.map((c) => (
                <ConnectionItem key={c.key} c={c} />
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
