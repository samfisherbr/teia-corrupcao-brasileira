'use client';

/**
 * ============================================================================
 * HEADEROVERLAY — painéis de tela cheia "Infográficos" e "Glossário"
 * ============================================================================
 * Desce por cima do grafo quando o usuário clica nos botões do cabeçalho.
 * Sempre usa os dados COMPLETOS (não os filtrados), para os números não
 * mudarem conforme os filtros da barra lateral.
 *
 *   Infográficos:
 *     1. Ranking de partidos por número de vínculos (centralidade de grau)
 *     2. Rosca com a proporção de tipos de vínculo + contagem por status
 *     3. Cartões com o valor financeiro de cada esquema
 *   Glossário:
 *     Um cartão por esquema, com o texto de data/schemeDetails.ts, e uma
 *     barra de busca fixa no topo que filtra os cartões (ver glossaryMatches).
 *
 * Ajustes comuns: quantos partidos mostrar → PARTY_RANKING_SIZE;
 * cores da rosca → `categories` em operationalFlowMetrics.
 * ============================================================================
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ActivePage } from './HeaderBar';
import { GraphData, GraphNode } from '@/types/graph';
import { getLinkEnds, normalizeText, STATUS_STYLE } from '@/lib/graphConfig';
import type { LinkStatus } from '@/types/graph';
import { parseAmount, formatAmount } from '@/lib/money';
import { SCHEME_DETAILS } from '@/data/schemeDetails';
import { 
  ExternalLink, 
  Users, 
  Building, 
  Coins, 
  ChevronDown, 
  ChevronUp, 
  BookOpen,
  PieChart as PieChartIcon,
  BarChart3,
  Layers,
  Activity,
  TrendingUp,
  ShieldAlert,
  UserCheck,
  Search,
  X
} from 'lucide-react';

/** Quantos partidos aparecem no ranking do infográfico 1. */
const PARTY_RANKING_SIZE = 6;

interface HeaderOverlayProps {
  activePage: ActivePage;
  graphData: GraphData;
}


export default function HeaderOverlay({ activePage, graphData }: HeaderOverlayProps) {
  // Controls overlay visibility based on active header navigation view
  const isOpen = activePage === 'infographics' || activePage === 'glossary';

  // `inert` isn't in React 18's DOM typings, so set it directly.
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    panelRef.current?.toggleAttribute('inert', !isOpen);
  }, [isOpen]);
  
  // State for expanding/collapsing individual scheme dossiers in the Glossary
  const [expandedSchemeId, setExpandedSchemeId] = useState<string | null>(null);

  const schemeNodes = useMemo(() => graphData.nodes.filter((node) => node.type === 'scheme'), [graphData.nodes]);

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

  // ===========================================================================
  // INFOGRÁFICO 1 — RANKING DE CENTRALIDADE POR PARTIDO
  // Conta, para cada sigla, quantas pontas de link pertencem a nós daquela
  // sigla (o próprio partido + seus políticos). A barra é relativa ao 1º lugar.
  // ===========================================================================
  const partyCentralityRanking = useMemo(() => {
    const partyMap: Record<string, { party: string; count: number; politicians: Set<string> }> = {};

    graphData.nodes.forEach((node) => {
      if (!node.party) return;
      const p = node.party.toUpperCase();
      if (!partyMap[p]) partyMap[p] = { party: p, count: 0, politicians: new Set() };
      if (node.type === 'politician') partyMap[p].politicians.add(node.id);
    });

    // Degree centrality: each link endpoint belonging to a party counts once.
    graphData.links.forEach((link) => {
      const { sourceId, targetId } = getLinkEnds(link);
      [nodeById.get(sourceId), nodeById.get(targetId)].forEach((node) => {
        const key = node?.party?.toUpperCase();
        if (key && partyMap[key]) partyMap[key].count += 1;
      });
    });

    const ranked = Object.values(partyMap).sort((a, b) => b.count - a.count);
    const maxCount = Math.max(...ranked.map((r) => r.count), 1);

    return ranked.map((item) => ({
      ...item,
      percentage: Math.round((item.count / maxCount) * 100),
      politicianCount: item.politicians.size
    }));
  }, [graphData, nodeById]);

  // ===========================================================================
  // INFOGRÁFICO 2 — FLUXO OPERACIONAL
  // Proporção de links por tipo (transação / contrato / processo) e contagem
  // por status jurídico (os 6 status de STATUS_STYLE).
  // ===========================================================================
  const operationalFlowMetrics = useMemo(() => {
    const totalLinks = graphData.links.length;
    const pct = (n: number) => (totalLinks ? Math.round((n / totalLinks) * 100) : 0);

    let transactions = 0;
    let contracts = 0;
    let processes = 0;

    // Contagem por status, já com as 6 chaves zeradas.
    const statusCounts = Object.fromEntries(Object.keys(STATUS_STYLE).map((k) => [k, 0])) as Record<LinkStatus, number>;

    graphData.links.forEach((link) => {
      const linkType = (link.type as string) || '';

      // Unknown/NULL types are no longer silently counted as "processes".
      if (linkType === 'transaction') transactions++;
      else if (linkType === 'contract') contracts++;
      else if (linkType === 'process') processes++;

      // Legal status metric aggregation
      if (link.status in statusCounts) statusCounts[link.status] += 1;
    });

    const categories = [
      {
        name: 'Transações & Propinas',
        typeKey: 'transaction',
        count: transactions,
        percentage: pct(transactions),
        color: '#f59e0b',
        bgClass: 'bg-amber-500'
      },
      {
        name: 'Contratos & Licitações',
        typeKey: 'contract',
        count: contracts,
        percentage: pct(contracts),
        color: '#10b981',
        bgClass: 'bg-emerald-500'
      },
      {
        name: 'Processos & Investigações',
        typeKey: 'process',
        count: processes,
        percentage: pct(processes),
        color: '#3b82f6',
        bgClass: 'bg-blue-500'
      }
    ];

    return {
      totalLinks,
      categories,
      statusCounts
    };
  }, [graphData.links]);

  // ===========================================================================
  // INFOGRÁFICO 3 — VALOR FINANCEIRO POR ESQUEMA
  // Prioridade do número de cada esquema:
  //   1. soma de `amount_brl` (inteiro em reais, schema v2) dos links do esquema;
  //   2. se não houver, soma do texto `amount` interpretado por lib/money.ts;
  //   3. se ainda for zero, a 1ª cifra do campo `impact` em schemeDetails.ts.
  // Reais e dólares nunca são somados entre si.
  // ===========================================================================
  const financialTreemapData = useMemo(() => {
    // NOTE: summing every link touching a scheme can double-count the same money
    // (scheme→party and party→politician often describe one flow). A numeric
    // `amount_value` column in D1 would let you sum only "primary" links.
    const items = schemeNodes.map((scheme) => {
      let brl = 0;
      graphData.links.forEach((link) => {
        const { sourceId, targetId } = getLinkEnds(link);
        if (sourceId !== scheme.id && targetId !== scheme.id) return;
        if (typeof link.amount_brl === 'number' && link.amount_brl > 0) {
          brl += link.amount_brl;
          return;
        }
        const parsed = parseAmount(link.amount);
        if (parsed?.currency === 'BRL') brl += parsed.value;
      });

      let amount = brl;
      let currency: 'BRL' | 'USD' = 'BRL';
      if (amount === 0) {
        const fallback = parseAmount(SCHEME_DETAILS[scheme.id]?.impact);
        if (fallback) {
          amount = fallback.value;
          currency = fallback.currency;
        }
      }

      return {
        id: scheme.id,
        label: scheme.label,
        amount,
        currency,
        formatted: amount > 0 ? formatAmount(amount, currency) : 'Em apuração',
      };
    });

    // Never add BRL and USD together (the old parser did, after concatenating digits).
    const totalBRL = items.filter((i) => i.currency === 'BRL').reduce((acc, i) => acc + i.amount, 0);
    const totalUSD = items.filter((i) => i.currency === 'USD').reduce((acc, i) => acc + i.amount, 0);
    items.sort((a, b) => (b.currency === a.currency ? b.amount - a.amount : a.currency === 'BRL' ? -1 : 1));

    const parts = [
      totalBRL > 0 ? formatAmount(totalBRL, 'BRL') : null,
      totalUSD > 0 ? formatAmount(totalUSD, 'USD') : null,
    ].filter(Boolean);

    return { items, formattedGrandTotal: parts.length ? parts.join(' + ') : 'Em levantamento' };
  }, [schemeNodes, graphData.links]);

  // Toggle scheme expansion state
  const toggleExpand = (id: string) => {
    setExpandedSchemeId((prev) => (prev === id ? null : id));
  };

  // Entidades ligadas diretamente a um esquema (usado nos cartões do Glossário).
  const getConnectedEntities = (schemeId: string): GraphNode[] =>
    Array.from(neighbours.get(schemeId) ?? [])
      .map((id) => nodeById.get(id))
      .filter((n): n is GraphNode => !!n);

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
          const d = SCHEME_DETAILS[scheme.id];
          const entities = Array.from(neighbours.get(scheme.id) ?? [])
            .map((id) => nodeById.get(id))
            .flatMap((n) => (n ? [n.label, n.party] : []));
          const haystack = [scheme.label, scheme.summary, d?.impact, d?.context, d?.mechanism, d?.legalStatus, ...entities]
            .map(normalizeText)
            .join(' ');
          return [scheme.id, haystack];
        })
      ),
    [schemeNodes, neighbours, nodeById]
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
      className={`absolute inset-0 z-40 bg-slate-950 text-slate-100 transition-transform duration-500 ease-in-out shadow-2xl overflow-y-auto ${
        isOpen ? 'translate-y-0 pointer-events-auto' : '-translate-y-full pointer-events-none'
      }`}
      // When closed the panel is only translated off-screen; without this its
      // links stay reachable with Tab and screen readers.
      ref={panelRef}
      aria-hidden={!isOpen}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-10">
        
        {/* =================================================================== */}
        {/* INFOGRAPHICS DASHBOARD PAGE                                        */}
        {/* =================================================================== */}
        {activePage === 'infographics' && (
          <div className="space-y-10 animate-in fade-in duration-300">
            {/* Title Section */}
            <div>
              <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono font-semibold uppercase tracking-wider">
                <PieChartIcon className="w-4 h-4" />
                <span>Painel de Análise de Dados</span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white mt-1">
                Infográficos & Inteligência Visual
              </h1>
              <p className="mt-1 text-slate-400 text-sm">
                Métricas agregadas do banco de dados sobre redes de influência, fluxos operacionais e volume financeiro.
              </p>
            </div>

            {/* Global Aggregated Metrics Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
                    Volume Mapeado
                  </span>
                  <span className="text-2xl font-bold text-emerald-400 mt-1 block">
                    {financialTreemapData.formattedGrandTotal}
                  </span>
                </div>
                <div className="p-3 bg-emerald-950/60 border border-emerald-800/40 rounded-lg text-emerald-400">
                  <Coins className="w-6 h-6" />
                </div>
              </div>

              <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
                    Esquemas Registrados
                  </span>
                  <span className="text-2xl font-bold text-cyan-400 mt-1 block">
                    {schemeNodes.length} Casos
                  </span>
                </div>
                <div className="p-3 bg-cyan-950/60 border border-cyan-800/40 rounded-lg text-cyan-400">
                  <ShieldAlert className="w-6 h-6" />
                </div>
              </div>

              <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
                    Conexões Ativas
                  </span>
                  <span className="text-2xl font-bold text-pink-400 mt-1 block">
                    {graphData.links.length} Vínculos
                  </span>
                </div>
                <div className="p-3 bg-pink-950/60 border border-pink-800/40 rounded-lg text-pink-400">
                  <Activity className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Main Infographics Grid (Cards 1 & 2) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Infographic 1: Party Centrality Ranking */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-purple-400" />
                      1. Ranking de centralidade por partido
                    </h2>
                    <span className="text-[11px] font-mono bg-purple-950/80 text-purple-300 border border-purple-800/50 px-2 py-0.5 rounded">
                      Grau de Conexões
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Volume de nós e conexões associadas a cada sigla partidária na base.
                  </p>
                </div>

                <div className="space-y-4 my-2">
                  {partyCentralityRanking.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">Nenhum partido com vínculos registrado.</p>
                  ) : (
                    partyCentralityRanking.slice(0, PARTY_RANKING_SIZE).map((item) => (
                      <div key={item.party} className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold font-mono text-slate-200">
                            {item.party} <span className="text-slate-500 font-normal">({item.politicianCount} políticos)</span>
                          </span>
                          <span className="font-mono text-purple-400 font-semibold">
                            {item.count} vínculos
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className="h-full bg-gradient-to-r from-purple-600 to-cyan-400 rounded-full transition-all duration-500"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg text-[11px] text-slate-400 leading-relaxed">
                  💡 <strong>Insight:</strong> Revela quais partidos possuem maior travessia de ligações transversais entre diferentes esquemas investigados.
                </div>
              </div>

              {/* Infographic 2: Operational Flow Diagram */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Layers className="w-5 h-5 text-amber-400" />
                      2. Diagrama de fluxo operacional
                    </h2>
                    <span className="text-[11px] font-mono bg-amber-950/80 text-amber-300 border border-amber-800/50 px-2 py-0.5 rounded">
                      Proporção de Vínculos
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Distribuição das conexões por categoria de operação e status jurídico.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6 my-2">
                  <div className="relative w-36 h-36 flex-shrink-0 flex items-center justify-center">
                    <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                      {operationalFlowMetrics.categories.map((cat, idx) => {
                        const strokeDasharray = `${cat.percentage} ${100 - cat.percentage}`;
                        const offset = operationalFlowMetrics.categories
                          .slice(0, idx)
                          .reduce((acc, curr) => acc + curr.percentage, 0);

                        return (
                          <circle
                            key={cat.typeKey}
                            cx="18"
                            cy="18"
                            r="15.915"
                            fill="transparent"
                            stroke={cat.color}
                            strokeWidth="3.8"
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={-offset}
                          />
                        );
                      })}
                    </svg>
                    <div className="absolute text-center">
                      <span className="text-lg font-extrabold text-white block">
                        {operationalFlowMetrics.totalLinks}
                      </span>
                      <span className="text-[9px] font-mono text-slate-400 block uppercase">
                        Conexões
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2.5 w-full">
                    {operationalFlowMetrics.categories.map((cat) => (
                      <div key={cat.typeKey} className="flex items-center justify-between text-xs p-2 bg-slate-950/60 border border-slate-800/80 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${cat.bgClass}`} />
                          <span className="text-slate-200">{cat.name}</span>
                        </div>
                        <span className="font-mono font-bold text-slate-300">
                          {cat.count} ({cat.percentage}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-400">Status jurídico:</span>
                  {/* Uma etiqueta por status, com a cor de STATUS_STYLE */}
                  <div className="flex flex-wrap justify-end gap-x-3 gap-y-1">
                    {(Object.keys(STATUS_STYLE) as LinkStatus[]).map((key) => (
                      <span key={key} className="flex items-center gap-1" style={{ color: STATUS_STYLE[key].color }}>
                        <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: STATUS_STYLE[key].color }} />
                        {operationalFlowMetrics.statusCounts[key]} {STATUS_STYLE[key].label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Infographic 3: Scheme Financial Heatmap */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    3. Mapa de calor financeiro por esquema
                  </h2>
                  <span className="text-[11px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-800/50 px-2.5 py-0.5 rounded">
                    Total: {financialTreemapData.formattedGrandTotal}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Comparativo de peso e volume financeiro atribuído a cada operação no banco de dados.
                </p>
              </div>

              {financialTreemapData.items.length === 0 ? (
                <p className="text-xs text-slate-500 italic">Nenhum esquema financeiro carregado.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {financialTreemapData.items.map((item, index) => {
                    const intensityColors = [
                      'from-emerald-950/90 to-emerald-900/60 border-emerald-500/50 text-emerald-300',
                      'from-cyan-950/90 to-cyan-900/60 border-cyan-500/50 text-cyan-300',
                      'from-slate-900 to-slate-950 border-slate-800 text-slate-300'
                    ];

                    const colorStyle = intensityColors[Math.min(index, 2)];

                    return (
                      <div
                        key={item.id}
                        className={`p-5 rounded-xl border bg-gradient-to-br ${colorStyle} flex flex-col justify-between space-y-3 transition-all hover:scale-[1.01]`}
                      >
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                            ESQUEMA #{index + 1}
                          </span>
                          <h3 className="font-bold text-sm text-white line-clamp-2">
                            {item.label}
                          </h3>
                        </div>

                        <div className="pt-2 border-t border-slate-800/80 flex items-baseline justify-between">
                          <span className="text-[11px] font-mono text-slate-400">Cifra Estimada:</span>
                          <span className="text-lg font-mono font-extrabold text-emerald-400">
                            {item.formatted}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
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
                Glossário e Dossiê dos Esquemas
              </h1>
              <p className="mt-2 text-slate-400 text-sm">
                Documentação factual, contexto histórico, mecanismo operacional e status judicial dos esquemas de corrupção cadastrados.
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
                  Buscar no glossário
                </label>
                <div className="relative">
                  <Search
                    size={16}
                    className="w-4 h-4 shrink-0 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    id="glossary-search"
                    type="search"
                    autoComplete="off"
                    placeholder="Buscar esquema, político, partido, empresa ou termo..."
                    value={glossaryQuery}
                    onChange={(e) => setGlossaryQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') setGlossaryQuery('');
                    }}
                    aria-describedby="glossary-search-count"
                    className="w-full bg-[#0e1726] border border-slate-800 rounded-lg pl-9 pr-9 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 [&::-webkit-search-cancel-button]:hidden"
                  />
                  {glossaryQuery && (
                    <button
                      type="button"
                      onClick={() => setGlossaryQuery('')}
                      aria-label="Limpar busca"
                      title="Limpar busca"
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-slate-500 hover:text-slate-200 hover:bg-slate-800"
                    >
                      <X size={16} className="w-4 h-4 shrink-0" aria-hidden="true" />
                    </button>
                  )}
                </div>
                <p id="glossary-search-count" aria-live="polite" className="mt-2 text-[11px] font-mono text-slate-500">
                  {glossaryQuery.trim()
                    ? `${filteredSchemeNodes.length} de ${schemeNodes.length} esquemas encontrados`
                    : `${schemeNodes.length} esquemas cadastrados`}
                </p>
              </div>
            )}

            <div className="space-y-6">
              {schemeNodes.length === 0 ? (
                <p className="text-sm text-slate-500">Nenhum esquema cadastrado no banco de dados ainda.</p>
              ) : filteredSchemeNodes.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl">
                  <p className="text-sm text-slate-400">
                    Nenhum esquema encontrado para <strong className="text-slate-200">“{glossaryQuery.trim()}”</strong>.
                  </p>
                  <button
                    type="button"
                    onClick={() => setGlossaryQuery('')}
                    className="mt-3 text-xs font-semibold text-cyan-400 hover:text-cyan-200 hover:underline"
                  >
                    Limpar busca
                  </button>
                </div>
              ) : (
                filteredSchemeNodes.map((scheme) => {
                  const details = SCHEME_DETAILS[scheme.id];
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
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase bg-cyan-950/80 px-2.5 py-1 rounded border border-cyan-800/60">
                              ESQUEMA DE CORRUPÇÃO
                            </span>
                            <h2 className="text-2xl font-bold text-white mt-2">{scheme.label}</h2>
                          </div>

                          <button
                            onClick={() => toggleExpand(scheme.id)}
                            aria-expanded={isExpanded}
                            className="flex items-center space-x-1 text-xs font-semibold text-cyan-400 hover:text-cyan-200 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/50 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <span>{isExpanded ? 'Recolher Dossiê' : 'Ver Dossiê Completo'}</span>
                            {isExpanded ? <ChevronUp size={16} className="w-4 h-4 shrink-0" /> : <ChevronDown size={16} className="w-4 h-4 shrink-0" />}
                          </button>
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
                              <span className="font-mono">Impacto:</span>{' '}
                              <strong className="font-medium text-slate-100">{details?.impact || 'Em Apuração'}</strong>
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-2 font-mono">
                            <div className="flex items-center gap-1.5">
                              <Users size={16} className="w-4 h-4 shrink-0 text-blue-400" aria-hidden="true" />
                              <span>Políticos Vinculados: <strong className="text-slate-100">{politicians.length}</strong></span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Building size={16} className="w-4 h-4 shrink-0 text-amber-400" aria-hidden="true" />
                              <span>Empresas Envolvidas: <strong className="text-slate-100">{companies.length}</strong></span>
                            </div>
                            {operators.length > 0 && (
                              <div className="flex items-center gap-1.5">
                                <UserCheck size={16} className="w-4 h-4 shrink-0 text-purple-400" aria-hidden="true" />
                                <span>Operadores Financeiros: <strong className="text-slate-100">{operators.length}</strong></span>
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
                                Contexto Histórico e Origem
                              </h3>
                              <p className="text-sm text-slate-300 leading-relaxed">{details.context}</p>
                            </div>
                          )}

                          {details?.mechanism && (
                            <div>
                              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
                                Funcionamento do Esquema
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
                                Entidades Mapeadas no Banco de Dados
                              </h3>
                              <div className="flex flex-wrap gap-2">
                                {connectedEntities.map((ent) => {
                                  const eType = ent.type;
                                  return (
                                    <span
                                      key={ent.id}
                                      className={`text-xs px-2.5 py-1 rounded-md border font-medium ${
                                        eType === 'politician'
                                          ? 'bg-blue-950/60 text-blue-300 border-blue-800/60'
                                          : eType === 'company'
                                          ? 'bg-amber-950/60 text-amber-300 border-amber-800/60'
                                          : eType === 'operator'
                                          ? 'bg-purple-950/60 text-purple-300 border-purple-800/60'
                                          : 'bg-slate-800 text-slate-300 border-slate-700'
                                      }`}
                                    >
                                      {ent.label} {ent.party ? `(${ent.party})` : ''}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {details?.legalStatus && (
                            <div>
                              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
                                Desdobramentos Jurídicos & Situação Atual
                              </h3>
                              <p className="text-sm text-slate-300 leading-relaxed">{details.legalStatus}</p>
                            </div>
                          )}

                          {details?.sources && details.sources.length > 0 && (
                            <div>
                              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
                                Fontes Documentais & Reportagens
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
  );
}