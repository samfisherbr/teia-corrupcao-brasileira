'use client';

/**
 * ============================================================================
 * HEADEROVERLAY — painéis de tela cheia "Infográficos" e "Glossário"
 * ============================================================================
 * Desce por cima do grafo quando o usuário clica nos botões do cabeçalho.
 * Sempre usa os dados COMPLETOS (não os filtrados), para os números não
 * mudarem conforme os filtros da barra lateral.
 *
 *   Infográficos: carrossel em components/infographics/ (um painel por vez):
 *     visão geral + ranking de partidos, quem está em cada esquema, do nome à
 *     condenação, quanto tempo cada esquema durou (com presidentes), fluxo
 *     operacional e mapa de calor financeiro.
 *   Glossário:
 *     Um cartão por esquema, com o texto de data/schemeDetails*.ts (no idioma
 *     da página, carregado sob demanda), e uma barra de busca fixa no topo
 *     que filtra os cartões (ver glossaryMatches).
 *
 * Ajustes comuns: quantos partidos mostrar → PARTY_RANKING_SIZE em
 * infographics/ClassicSlides.tsx.
 * ============================================================================
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ActivePage } from './HeaderBar';
import { GraphData, GraphNode } from '@/types/graph';
import { getLinkEnds, normalizeText, NODE_STYLE, entityChipStyle } from '@/lib/graphConfig';
import { NODE_ICONS } from '@/lib/nodeIcons';
import { loadSchemeDetails, type LocalizedSchemeDetail } from '@/lib/dossiers';
import { LOCALE_INFO } from '@/lib/i18n';
import { useI18n } from '@/components/I18nProvider';
import { schemePath, computeSchemeStartYears, compareByYearDesc } from '@/lib/schemes';
import Link from 'next/link';
import BlinkingSquares from './BlinkingSquares';
import InfographicsDeck from './infographics/InfographicsDeck';
import { 
  ExternalLink, 
  Coins, 
  ChevronDown, 
  ChevronUp, 
  BookOpen,
  ChartPie as PieChartIcon,
  Search,
  X
} from 'lucide-react';

/** Ordem dos tipos de entidade = ordem da legenda do grafo. */
const TYPE_ORDER = Object.keys(NODE_STYLE) as GraphNode['type'][];
// Ícones por tipo (mesmos da barra lateral e do painel de detalhes).
const PoliticianIcon = NODE_ICONS.politician;
const CompanyIcon = NODE_ICONS.company;
const OperatorIcon = NODE_ICONS.operator;

interface HeaderOverlayProps {
  activePage: ActivePage;
  graphData: GraphData;
}


export default function HeaderOverlay({ activePage, graphData }: HeaderOverlayProps) {
  // Controls overlay visibility based on active header navigation view
  const { t, locale, href } = useI18n();
  const isOpen = activePage === 'infographics' || activePage === 'glossary';

  // Textos dos dossiês no idioma da página. Chegam logo depois do painel
  // (arquivo à parte, ~115 KB por idioma); até lá, os cartões saem sem dossiê.
  const [schemeDetails, setSchemeDetails] = useState<Record<string, LocalizedSchemeDetail>>({});
  useEffect(() => {
    let cancelled = false;
    loadSchemeDetails(locale).then((d) => {
      if (!cancelled) setSchemeDetails(d);
    });
    return () => {
      cancelled = true;
    };
  }, [locale]);

  // `inert` isn't in React 18's DOM typings, so set it directly.
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    panelRef.current?.toggleAttribute('inert', !isOpen);
  }, [isOpen]);

  // Fundo dos Infográficos: os quadrados vão do topo até o fim do título e
  // não passam dele. Mede onde o título termina (em relação ao painel, sem
  // contar a rolagem) e converte em `fadeStart` (fração da altura, a partir
  // de baixo). Refaz a conta quando o título quebra linha ou a tela muda.
  const scrollRef = useRef<HTMLDivElement>(null);
  const infographicsTitleRef = useRef<HTMLHeadingElement>(null);
  const [squaresFadeStart, setSquaresFadeStart] = useState<number | null>(null);
  useEffect(() => {
    if (activePage !== 'infographics') return;
    const panel = panelRef.current;
    const scroller = scrollRef.current;
    const title = infographicsTitleRef.current;
    if (!panel || !scroller || !title) return;
    const measure = () => {
      const height = panel.clientHeight;
      if (!height) return;
      const bottom =
        title.getBoundingClientRect().bottom - panel.getBoundingClientRect().top + scroller.scrollTop;
      const next = Math.min(0.99, Math.max(0, 1 - bottom / height));
      setSquaresFadeStart((prev) => (prev !== null && Math.abs(prev - next) < 0.002 ? prev : next));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(panel);
    ro.observe(title);
    return () => ro.disconnect();
  }, [activePage]);
  
  // State for expanding/collapsing individual scheme dossiers in the Glossary
  const [expandedSchemeId, setExpandedSchemeId] = useState<string | null>(null);

  // Ano de cada caso (vínculo datado mais antigo), recalculado sempre que os
  // dados mudam; o Glossário lista do caso mais recente ao mais antigo.
  const schemeYears = useMemo(() => computeSchemeStartYears(graphData.nodes, graphData.links), [graphData]);
  const schemeNodes = useMemo(
    () =>
      graphData.nodes
        .filter((node) => node.type === 'scheme')
        .sort((a, b) =>
          compareByYearDesc(
            { year: schemeYears.get(a.id), title: a.label },
            { year: schemeYears.get(b.id), title: b.label },
            LOCALE_INFO[locale].tag
          )
        ),
    [graphData.nodes, schemeYears, locale]
  );

  // O(1) lookups instead of graphData.nodes.find() inside every link loop (was O(N·L)).
  const nodeById = useMemo(() => new Map(graphData.nodes.map((n) => [n.id, n])), [graphData.nodes]);

  // Adjacency list built once; the glossary used to rescan every link for every scheme on each render.
  const neighbours = useMemo(() => {
    const map = new Map<string, Set<string>>();
    const add = (a: string, b: string) => {
      if (!map.has(a)) map.set(a, new Set());
      map.get(a)!.add(b);
    };
    graphData.links.forEach((l) => {
      const { sourceId, targetId } = getLinkEnds(l);
      add(sourceId, targetId);
      add(targetId, sourceId);
    });
    return map;
  }, [graphData.links]);

  // Toggle scheme expansion state
  const toggleExpand = (id: string) => {
    setExpandedSchemeId((prev) => (prev === id ? null : id));
  };

  // Entidades ligadas diretamente a um esquema (usado nos cartões do Glossário),
  // agrupadas por tipo na ordem da legenda do grafo (NODE_STYLE).
  const getConnectedEntities = (schemeId: string): GraphNode[] =>
    Array.from(neighbours.get(schemeId) ?? [])
      .map((id) => nodeById.get(id))
      .filter((n): n is GraphNode => !!n)
      .sort((a, b) => TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type));

  // ===========================================================================
  // BUSCA DO GLOSSÁRIO
  // Independente da busca da barra lateral (que filtra o grafo). Procura, sem
  // diferenciar acentos/maiúsculas, no nome e resumo do esquema, nos textos do
  // dossiê (impacto, contexto, funcionamento, situação jurídica) e no nome/
  // partido das entidades ligadas. Todas as palavras digitadas precisam
  // aparecer (em qualquer campo).
  // ===========================================================================
  const [glossaryQuery, setGlossaryQuery] = useState('');

  const glossarySearchIndex = useMemo(
    () =>
      new Map(
        schemeNodes.map((scheme) => {
          const d = schemeDetails[scheme.id];
          const entities = Array.from(neighbours.get(scheme.id) ?? [])
            .map((id) => nodeById.get(id))
            .flatMap((n) => (n ? [n.label, n.party] : []));
          const haystack = [scheme.label, scheme.summary, d?.impact, d?.context, d?.mechanism, d?.legalStatus, ...entities]
            .map(normalizeText)
            .join(' ');
          return [scheme.id, haystack];
        })
      ),
    [schemeNodes, neighbours, nodeById, schemeDetails]
  );

  const filteredSchemeNodes = useMemo(() => {
    const terms = normalizeText(glossaryQuery).split(/\s+/).filter(Boolean);
    if (terms.length === 0) return schemeNodes;
    return schemeNodes.filter((scheme) => {
      const haystack = glossarySearchIndex.get(scheme.id) ?? '';
      return terms.every((t) => haystack.includes(t));
    });
  }, [schemeNodes, glossarySearchIndex, glossaryQuery]);

  return (
    <div
      className={`absolute inset-0 z-40 bg-slate-950 text-slate-100 transition-transform duration-500 ease-in-out ${
        isOpen ? 'translate-y-0 pointer-events-auto' : '-translate-y-full pointer-events-none'
      }`}
      // When closed the panel is only translated off-screen; without this its
      // links stay reachable with Tab and screen readers.
      // No box-shadow here: while parked above the graph it would cast a dark
      // band right under the header.
      ref={panelRef}
      aria-hidden={!isOpen}
    >
      {/* Fundo dos Infográficos: fixo no topo do painel, atrás do conteúdo
          (que rola no contêiner de dentro), indo só até o fim do título — ver
          squaresFadeStart. Sem cor de fundo própria (deixa o slate-950 do
          painel aparecer); quadrados no ciano do site (cyan-400). Só montado
          com a página aberta, para a animação não rodar escondida. */}
      {activePage === 'infographics' && squaresFadeStart !== null && (
        <BlinkingSquares
          className="absolute inset-0 w-full h-full pointer-events-none"
          direction="top"
          gridSize={80}
          squareSize={0.3}
          // Telas largas: célula limitada a 8px (≈ a do celular), então a
          // grade ganha colunas e os quadrados não engordam no computador.
          maxCellSize={8}
          fadeStart={squaresFadeStart}
          fadeEnd={1}
          falloff={2}
          minBrightness={0.55}
          twinkleSpeed={1}
          twinkleStrength={0.94}
          intensity={1}
          opacity={0.46}
          squareColor="#22d3ee"
        />
      )}
      <div ref={scrollRef} className="absolute inset-0 overflow-y-auto">
      <div className={`max-w-6xl mx-auto px-4 sm:px-8 ${activePage === 'infographics' ? 'h-full flex flex-col py-4 sm:py-6' : 'py-8 space-y-10'}`}>
        
        {/* =================================================================== */}
        {/* INFOGRAPHICS DASHBOARD PAGE                                        */}
        {/* =================================================================== */}
        {activePage === 'infographics' && (
          <div className="flex flex-col flex-1 min-h-0 gap-4 animate-in fade-in duration-300">
            {/* Title Section */}
            <div>
              <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono font-semibold uppercase tracking-wider">
                <PieChartIcon className="w-4 h-4" />
                <span>{t.infographics.eyebrow}</span>
              </div>
              <h1 ref={infographicsTitleRef} className="text-xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
                {t.infographics.title}
              </h1>
              <p className="hidden [@media(min-height:860px)]:block mt-3 text-sm text-slate-400 leading-relaxed">
                {t.infographics.intro}
              </p>
            </div>

            <InfographicsDeck graphData={graphData} schemeNodes={schemeNodes} schemeDetails={schemeDetails} startYears={schemeYears} />
          </div>
        )}

        {/* =================================================================== */}
        {/* SCHEME GLOSSARY & DOSSIERS PAGE                                     */}
        {/* =================================================================== */}
        {activePage === 'glossary' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-cyan-400" />
                {t.glossary.title}
              </h1>
              <p className="mt-6 text-sm text-slate-400 leading-relaxed">
                {t.glossary.intro}
              </p>
            </div>

            {/* Barra de busca: fica presa ao topo do painel (que é o elemento
                que rola) enquanto o usuário percorre os cartões. As margens
                negativas estendem o fundo até as bordas da coluna. */}
            {schemeNodes.length > 0 && (
              <div
                role="search"
                className="sticky top-0 z-10 -mx-4 sm:-mx-8 px-4 sm:px-8 py-3 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80"
              >
                <label htmlFor="glossary-search" className="sr-only">
                  {t.glossary.searchLabel}
                </label>
                <div className="relative">
                  <Search
                    size={16}
                    className="w-4 h-4 shrink-0 absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    id="glossary-search"
                    type="search"
                    autoComplete="off"
                    placeholder={t.search.placeholder}
                    value={glossaryQuery}
                    onChange={(e) => setGlossaryQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') setGlossaryQuery('');
                    }}
                    aria-describedby="glossary-search-count"
                    className="w-full bg-surface-field border border-slate-800 rounded-lg pl-9 pr-9 py-2 text-sm text-slate-200 placeholder-muted focus:outline-hidden focus:border-cyan-500 [&::-webkit-search-cancel-button]:hidden"
                  />
                  {glossaryQuery && (
                    <button
                      type="button"
                      onClick={() => setGlossaryQuery('')}
                      aria-label={t.common.clearSearch}
                      title={t.common.clearSearch}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-sm text-muted hover:text-slate-200 hover:bg-slate-800"
                    >
                      <X size={16} className="w-4 h-4 shrink-0" aria-hidden="true" />
                    </button>
                  )}
                </div>
                <p id="glossary-search-count" aria-live="polite" className="mt-2 text-[11px] font-mono text-muted">
                  {glossaryQuery.trim()
                    ? t.search.countFiltered(filteredSchemeNodes.length, schemeNodes.length)
                    : t.search.countAll(schemeNodes.length)}
                </p>
              </div>
            )}

            <div className="space-y-6">
              {schemeNodes.length === 0 ? (
                <p className="text-sm text-muted">{t.glossary.empty}</p>
              ) : filteredSchemeNodes.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl">
                  <p className="text-sm text-slate-400">
                    {t.search.noneFor} <strong className="text-slate-200">“{glossaryQuery.trim()}”</strong>.
                  </p>
                  <button
                    type="button"
                    onClick={() => setGlossaryQuery('')}
                    className="mt-3 text-xs font-semibold text-cyan-400 hover:text-cyan-200 hover:underline"
                  >
                    {t.common.clearSearch}
                  </button>
                </div>
              ) : (
                filteredSchemeNodes.map((scheme) => {
                  const details = schemeDetails[scheme.id];
                  // Dossiê exibido em português numa página de outro idioma (tradução pendente).
                  const textLang = details?.translationPending ? 'pt-BR' : undefined;
                  const connectedEntities = getConnectedEntities(scheme.id);
                  const isExpanded = expandedSchemeId === scheme.id;

                  const politicians = connectedEntities.filter((e) => e.type === 'politician');
                  const companies = connectedEntities.filter((e) => e.type === 'company');
                  const operators = connectedEntities.filter((e) => e.type === 'operator');

                  return (
                    <article
                      key={scheme.id}
                      className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-md"
                    >
                      <div className="p-6 space-y-4">
                        {/* Etiqueta e botão dividem a linha de cima e nunca quebram
                            por dentro; se não couberem lado a lado (celulares), o
                            botão desce para baixo da etiqueta (flex-wrap). O título
                            fica embaixo, com a largura inteira do cartão. */}
                        <div>
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <span
                                className="inline-block whitespace-nowrap text-[10px] font-mono font-bold tracking-widest uppercase px-2.5 py-1 rounded-sm border"
                                style={entityChipStyle('scheme')}
                              >
                                {t.nodeType.scheme.label}
                              </span>
                              {/* Ano do caso (vínculo datado mais antigo; ver computeSchemeStartYears) */}
                              {schemeYears.has(scheme.id) && (
                                <span className="text-[11px] font-mono font-bold text-slate-300 tabular-nums">
                                  {schemeYears.get(scheme.id)}
                                </span>
                              )}
                            </div>

                            <button
                              onClick={() => toggleExpand(scheme.id)}
                              aria-expanded={isExpanded}
                              className="shrink-0 whitespace-nowrap flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-200 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/50 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              <span>{isExpanded ? t.glossary.collapse : t.glossary.expand}</span>
                              {isExpanded ? <ChevronUp size={16} className="w-4 h-4 shrink-0" /> : <ChevronDown size={16} className="w-4 h-4 shrink-0" />}
                            </button>
                          </div>
                          <h2 className="text-2xl font-bold text-white mt-2 wrap-break-word">{scheme.label}</h2>
                        </div>

                        <p className="text-sm text-slate-300 leading-relaxed font-sans">
                          {scheme.summary}
                        </p>

                        {/* Quick entity & impact metric metrics bar */}
                        {/* Ícones travados em 16×16 (size + shrink-0): sem o shrink-0
                            o flexbox encolhia o ícone quando o texto quebrava linha. */}
                        <div className="pt-3 border-t border-slate-800 space-y-3 text-xs text-slate-400">
                          {/* Impacto ocupa a linha inteira e o texto flui em várias
                              linhas; o ícone fica alinhado à primeira linha. */}
                          <div className="flex items-start gap-2">
                            <Coins size={16} className="w-4 h-4 shrink-0 mt-px text-emerald-400" aria-hidden="true" />
                            <p className="min-w-0 leading-relaxed">
                              <span className="font-mono">{t.dossier.impact}</span>{' '}
                              <strong lang={textLang} className="font-medium text-slate-100">{details?.impact || t.glossary.impactPending}</strong>
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-2 font-mono">
                            <div className="flex items-center gap-1.5">
                              <PoliticianIcon size={16} className="w-4 h-4 shrink-0" style={{ color: NODE_STYLE.politician.labelColor }} aria-hidden="true" />
                              <span>{t.glossary.politicians} <strong className="text-slate-100">{politicians.length}</strong></span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <CompanyIcon size={16} className="w-4 h-4 shrink-0" style={{ color: NODE_STYLE.company.labelColor }} aria-hidden="true" />
                              <span>{t.glossary.companies} <strong className="text-slate-100">{companies.length}</strong></span>
                            </div>
                            {operators.length > 0 && (
                              <div className="flex items-center gap-1.5">
                                <OperatorIcon size={16} className="w-4 h-4 shrink-0" style={{ color: NODE_STYLE.operator.labelColor }} aria-hidden="true" />
                                <span>{t.glossary.operators} <strong className="text-slate-100">{operators.length}</strong></span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Detailed investigative dossier when expanded */}
                      {isExpanded && (
                        <div className="px-6 pb-6 pt-3 border-t border-slate-800 bg-slate-950/80 space-y-6 animate-in fade-in duration-200">
                          {details?.context && (
                            <div>
                              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
                                {t.glossary.context}
                              </h3>
                              <p lang={textLang} className="text-sm text-slate-300 leading-relaxed">{details.context}</p>
                            </div>
                          )}

                          {details?.mechanism && (
                            <div>
                              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
                                {t.glossary.mechanism}
                              </h3>
                              <p className="text-sm text-slate-300 leading-relaxed bg-slate-900 p-4 rounded-lg border border-slate-800">
                                {details.mechanism}
                              </p>
                            </div>
                          )}

                          {/* Connected Graph Entities Breakdown */}
                          {connectedEntities.length > 0 && (
                            <div>
                              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
                                {t.glossary.entities}
                              </h3>
                              <div className="flex flex-wrap gap-2">
                                {connectedEntities.map((ent) => {
                                  const Icon = NODE_ICONS[ent.type];
                                  return (
                                    <span
                                      key={ent.id}
                                      title={t.nodeType[ent.type]?.label}
                                      className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md border font-medium"
                                      style={entityChipStyle(ent.type)}
                                    >
                                      {Icon && <Icon size={16} className="w-4 h-4 shrink-0" aria-hidden="true" />}
                                      <span>
                                        {ent.label} {ent.party ? `(${ent.party})` : ''}
                                      </span>
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {details?.legalStatus && (
                            <div>
                              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
                                {t.glossary.legal}
                              </h3>
                              <p lang={textLang} className="text-sm text-slate-300 leading-relaxed">{details.legalStatus}</p>
                            </div>
                          )}

                          {details?.sources && details.sources.length > 0 && (
                            <div>
                              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
                                {t.glossary.sources}
                              </h3>
                              <ul className="space-y-1.5">
                                {details.sources.map((src, idx) => (
                                  <li key={idx}>
                                    <a
                                      href={src.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center text-xs text-cyan-400 hover:text-cyan-200 hover:underline gap-1.5"
                                    >
                                      <span>{src.title}</span>
                                      <ExternalLink size={16} className="w-4 h-4 shrink-0" aria-hidden="true" />
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <Link
                            href={href(schemePath(scheme.id))}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-200 hover:underline"
                          >
                            <BookOpen size={16} className="w-4 h-4 shrink-0" aria-hidden="true" />
                            {t.glossary.openPage}
                          </Link>
                        </div>
                      )}
                    </article>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
