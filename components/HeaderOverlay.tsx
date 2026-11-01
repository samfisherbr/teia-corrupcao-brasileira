'use client';

import React, { useState, useMemo } from 'react';
import { ActivePage } from './HeaderBar';
import { GraphData, GraphNode, GraphLink } from '@/types/graph';
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
  ShieldAlert
} from 'lucide-react';

interface HeaderOverlayProps {
  activePage: ActivePage;
  onClose: () => void;
  graphData: GraphData;
}

// Helper para extrair e converter strings monetárias em números
function parseMonetaryValue(amountStr?: string | null): number {
  if (!amountStr || amountStr === 'NULL' || amountStr === 'N/A') return 0;
  const numericOnly = amountStr.replace(/[^0-9]/g, '');
  const parsed = parseInt(numericOnly, 10);
  return isNaN(parsed) ? 0 : parsed;
}

// Helper para formatar números em moeda BRL legível
function formatBRL(value: number): string {
  if (value >= 1_000_000_000) {
    return `R$ ${(value / 1_000_000_000).toFixed(1)} Bi`;
  }
  if (value >= 1_000_000) {
    return `R$ ${(value / 1_000_000).toFixed(1)} Mi`;
  }
  if (value >= 1_000) {
    return `R$ ${(value / 1_000).toFixed(0)} mil`;
  }
  return `R$ ${value.toLocaleString('pt-BR')}`;
}

export default function HeaderOverlay({ activePage, onClose, graphData }: HeaderOverlayProps) {
  const isOpen = activePage === 'infographics' || activePage === 'glossary';
  const [expandedSchemeId, setExpandedSchemeId] = useState<string | null>(null);

  // Filtrar nós do tipo "scheme"
  const schemeNodes = useMemo(() => {
    return graphData.nodes.filter((node) => node.type === 'scheme');
  }, [graphData.nodes]);

  // ---------------------------------------------------------------------------
  // INFOGRÁFICO 1: RANKING DE CENTRALIDADE POR PARTIDO
  // ---------------------------------------------------------------------------
  const partyCentralityRanking = useMemo(() => {
    const partyMap: Record<string, { party: string; count: number; politicians: Set<string> }> = {};

    graphData.nodes.forEach((node) => {
      if (node.party && node.party !== 'NULL' && node.party !== 'N/A' && node.party !== 'scheme') {
        const p = node.party.toUpperCase();
        if (!partyMap[p]) {
          partyMap[p] = { party: p, count: 0, politicians: new Set() };
        }
        if (node.type === 'politician') {
          partyMap[p].politicians.add(node.id);
        }
      }
    });

    // Calcular grau de centralidade (total de conexões envolvendo cada partido/político do partido)
    graphData.links.forEach((link) => {
      const sId = typeof link.source === 'object' ? (link.source as any).id : link.source;
      const tId = typeof link.target === 'object' ? (link.target as any).id : link.target;

      const sourceNode = graphData.nodes.find((n) => n.id === sId);
      const targetNode = graphData.nodes.find((n) => n.id === tId);

      [sourceNode, targetNode].forEach((node) => {
        if (node?.party && partyMap[node.party.toUpperCase()]) {
          partyMap[node.party.toUpperCase()].count += 1;
        }
      });
    });

    const ranked = Object.values(partyMap).sort((a, b) => b.count - a.count);
    const maxCount = Math.max(...ranked.map((r) => r.count), 1);

    return ranked.map((item) => ({
      ...item,
      percentage: Math.round((item.count / maxCount) * 100),
      politicianCount: item.politicians.size
    }));
  }, [graphData]);

  // ---------------------------------------------------------------------------
  // INFOGRÁFICO 2: DIAGRAMA DE FLUXO OPERACIONAL (TIPOS DE CONEXÃO & STATUS)
  // ---------------------------------------------------------------------------
  const operationalFlowMetrics = useMemo(() => {
    const totalLinks = graphData.links.length || 1;

    let transactions = 0;
    let contracts = 0;
    let processes = 0;

    let confirmed = 0;
    let underInvestigation = 0;
    let acquitted = 0;

    graphData.links.forEach((link) => {
      const linkType = (link.type as string) || '';

      // Tipos de conexão (compatível com tipos legados e novos)
      if (linkType === 'transaction' || linkType === 'suspect_transactions' || linkType === 'suspect_transaction') {
        transactions++;
      } else if (linkType === 'contract' || linkType === 'direct_financing') {
        contracts++;
      } else {
        processes++;
      }

      // Status jurídico
      if (link.status === 'confirmed') confirmed++;
      else if (link.status === 'under_investigation') underInvestigation++;
      else if (link.status === 'acquitted') acquitted++;
    });

    const categories = [
      {
        name: 'Transações & Propinas',
        typeKey: 'transaction',
        count: transactions,
        percentage: Math.round((transactions / totalLinks) * 100),
        color: '#f59e0b',
        bgClass: 'bg-amber-500'
      },
      {
        name: 'Contratos & Licitações',
        typeKey: 'contract',
        count: contracts,
        percentage: Math.round((contracts / totalLinks) * 100),
        color: '#10b981',
        bgClass: 'bg-emerald-500'
      },
      {
        name: 'Processos & Investigações',
        typeKey: 'process',
        count: processes,
        percentage: Math.round((processes / totalLinks) * 100),
        color: '#3b82f6',
        bgClass: 'bg-blue-500'
      }
    ];

    return {
      totalLinks,
      categories,
      statusBreakdown: {
        confirmed,
        underInvestigation,
        acquitted
      }
    };
  }, [graphData.links]);

  // ---------------------------------------------------------------------------
  // INFOGRÁFICO 3: MAPA DE CALOR FINANCEIRO POR ESQUEMA (TREEMAP)
  // ---------------------------------------------------------------------------
  const financialTreemapData = useMemo(() => {
    const schemeAmounts: Array<{ id: string; label: string; amount: number; formatted: string }> = [];

    schemeNodes.forEach((scheme) => {
      let totalSchemeVal = 0;

      // Soma os valores atribuídos às conexões diretas do esquema
      graphData.links.forEach((link) => {
        const sId = typeof link.source === 'object' ? (link.source as any).id : link.source;
        const tId = typeof link.target === 'object' ? (link.target as any).id : link.target;

        if (sId === scheme.id || tId === scheme.id) {
          totalSchemeVal += parseMonetaryValue(link.amount);
        }
      });

      // Se o valor acumulado dos links for 0, busca o valor estimado no cadastro ou dossiê
      if (totalSchemeVal === 0) {
        const fallbackText = scheme.estimatedImpact || SCHEME_DETAILS[scheme.id]?.impact;
        totalSchemeVal = parseMonetaryValue(fallbackText);
      }

      schemeAmounts.push({
        id: scheme.id,
        label: scheme.label,
        amount: totalSchemeVal,
        formatted: totalSchemeVal > 0 ? formatBRL(totalSchemeVal) : 'Em apuração'
      });
    });

    const grandTotal = schemeAmounts.reduce((acc, curr) => acc + curr.amount, 0);
    schemeAmounts.sort((a, b) => b.amount - a.amount);

    return {
      items: schemeAmounts,
      grandTotal,
      formattedGrandTotal: grandTotal > 0 ? formatBRL(grandTotal) : 'Em levantamento'
    };
  }, [schemeNodes, graphData.links]);

  const toggleExpand = (id: string) => {
    setExpandedSchemeId((prev) => (prev === id ? null : id));
  };

  const getConnectedEntities = (schemeId: string) => {
    const connectedNodeIds = new Set<string>();

    graphData.links.forEach((link) => {
      const sId = typeof link.source === 'object' ? (link.source as any).id : link.source;
      const tId = typeof link.target === 'object' ? (link.target as any).id : link.target;

      if (sId === schemeId) connectedNodeIds.add(tId);
      if (tId === schemeId) connectedNodeIds.add(sId);
    });

    return graphData.nodes.filter((node) => connectedNodeIds.has(node.id));
  };

  return (
    <div
      className={`absolute inset-0 z-40 bg-slate-950 text-slate-100 transition-transform duration-500 ease-in-out shadow-2xl overflow-y-auto ${
        isOpen ? 'translate-y-0 pointer-events-auto' : '-translate-y-full pointer-events-none'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-10">
        {/* PAINEL DE INFOGRÁFICOS */}
        {activePage === 'infographics' && (
          <div className="space-y-10 animate-in fade-in duration-300">
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

            {/* Métricas Globais */}
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

            {/* Grid Infográficos 1 & 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Infográfico 1 */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-purple-400" />
                      1. Ranking de Centralidade por Partido
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
                    partyCentralityRanking.slice(0, 6).map((item) => (
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

              {/* Infográfico 2 */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Layers className="w-5 h-5 text-amber-400" />
                      2. Diagrama de Fluxo Operacional
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
                  <span className="text-slate-400">Status Jurídico:</span>
                  <div className="flex space-x-3">
                    <span className="text-pink-400">🔴 {operationalFlowMetrics.statusBreakdown.confirmed} Condenados</span>
                    <span className="text-amber-400">🟡 {operationalFlowMetrics.statusBreakdown.underInvestigation} Sob Investigação</span>
                    <span className="text-emerald-400">🟢 {operationalFlowMetrics.statusBreakdown.acquitted} Absolvidos</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Infográfico 3 */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    3. Mapa de Calor Financeiro por Esquema (Treemap Proporcional)
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

        {/* SEÇÃO DO GLOSSÁRIO */}
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

            <div className="space-y-6">
              {schemeNodes.length === 0 ? (
                <p className="text-sm text-slate-500">Nenhum esquema cadastrado no banco de dados ainda.</p>
              ) : (
                schemeNodes.map((scheme) => {
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
                            className="flex items-center space-x-1 text-xs font-semibold text-cyan-400 hover:text-cyan-200 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/50 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <span>{isExpanded ? 'Recolher Dossiê' : 'Ver Dossiê Completo'}</span>
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>

                        <p className="text-sm text-slate-300 leading-relaxed font-sans">
                          {scheme.summary}
                        </p>

                        <div className="flex flex-wrap gap-4 pt-3 border-t border-slate-800 text-xs font-mono text-slate-400">
                          <div className="flex items-center space-x-1.5">
                            <Coins className="w-4 h-4 text-emerald-400" />
                            <span>Impacto: <strong className="text-slate-100">{scheme.estimatedImpact || details?.impact || 'Em Apuração'}</strong></span>
                          </div>
                          <div className="flex items-center space-x-1.5">
                            <Users className="w-4 h-4 text-blue-400" />
                            <span>Políticos Vinculados: <strong className="text-slate-100">{politicians.length}</strong></span>
                          </div>
                          <div className="flex items-center space-x-1.5">
                            <Building className="w-4 h-4 text-amber-400" />
                            <span>Empresas Envolvidas: <strong className="text-slate-100">{companies.length}</strong></span>
                          </div>
                        </div>
                      </div>

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

                          {connectedEntities.length > 0 && (
                            <div>
                              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
                                Entidades Mapeadas no Banco de Dados
                              </h3>
                              <div className="flex flex-wrap gap-2">
                                {connectedEntities.map((ent) => (
                                  <span
                                    key={ent.id}
                                    className={`text-xs px-2.5 py-1 rounded-md border font-medium ${
                                      ent.type === 'politician'
                                        ? 'bg-blue-950/60 text-blue-300 border-blue-800/60'
                                        : ent.type === 'company'
                                        ? 'bg-amber-950/60 text-amber-300 border-amber-800/60'
                                        : 'bg-slate-800 text-slate-300 border-slate-700'
                                    }`}
                                  >
                                    {ent.label} {ent.party ? `(${ent.party})` : ''}
                                  </span>
                                ))}
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
                                      <ExternalLink className="w-3 h-3" />
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