'use client';

/**
 * ============================================================================
 * SIDEBARCONTROLS — painel de controle à esquerda (só desktop, ≥ 768px)
 * ============================================================================
 * Busca, controle de ano, filtros por tipo e por status, índice de esquemas
 * e contadores. Não guarda estado próprio: tudo vem de app/page.tsx por props.
 *
 * Largura: `w-80` no <aside>. Para mostrar no celular, troque `hidden md:flex`
 * por `flex` (e trate o espaço, ex. como gaveta).
 * Altura máxima do índice de esquemas: `max-h-40` (≈160px) mais abaixo.
 * ============================================================================
 */

import React from 'react';
import Link from 'next/link';
import { Search, Calendar, Filter, BookOpen, Scale, Component } from 'lucide-react';
import { NodeType, LinkStatus, GraphNode } from '@/types/graph';
import { NODE_STYLE, STATUS_STYLE } from '@/lib/graphConfig';
import { NODE_ICONS } from '@/lib/nodeIcons';

interface SidebarControlsProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  startYearFilter: number;
  setStartYearFilter: (year: number) => void;
  minYear: number;
  maxYear: number;
  /** true = marcado. Nenhum marcado = sem filtro (tudo visível no grafo). */
  typeFilters: Record<NodeType, boolean>;
  toggleTypeFilter: (type: NodeType) => void;
  clearTypeFilters: () => void;
  statusFilters: Record<LinkStatus, boolean>;
  toggleStatusFilter: (status: LinkStatus) => void;
  clearStatusFilters: () => void;
  nodeCount: number;
  linkCount: number;
  nodes: GraphNode[];
  selectedNode: GraphNode | null;
  onSelectScheme: (node: GraphNode) => void;
}

/** "Limpar filtros" ao lado do título de cada grupo de filtros. */
function ClearFiltersButton({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="text-[10px] font-mono text-cyan-400 hover:text-cyan-200 hover:underline disabled:text-slate-600 disabled:no-underline disabled:cursor-default"
    >
      Limpar filtros
    </button>
  );
}

export default function SidebarControls({
  searchQuery,
  setSearchQuery,
  startYearFilter,
  setStartYearFilter,
  minYear,
  maxYear,
  typeFilters,
  toggleTypeFilter,
  clearTypeFilters,
  statusFilters,
  toggleStatusFilter,
  clearStatusFilters,
  nodeCount,
  linkCount,
  nodes,
  selectedNode,
  onSelectScheme
}: SidebarControlsProps) {
  // Filtra apenas as entidades do tipo "Esquema de Corrupção"
  // Só os nós de esquema VISÍVEIS (já filtrados) entram no índice.
  const schemeNodes = React.useMemo(() => nodes.filter((node) => node.type === 'scheme'), [nodes]);
  const anyTypeSelected = Object.values(typeFilters).some(Boolean);
  const anyStatusSelected = Object.values(statusFilters).some(Boolean);

  return (
    <aside className="hidden md:flex w-80 bg-[#090f1b] border-r border-slate-800/80 flex-col z-20 shadow-xl h-full">
      
      {/* Cabeçalho */}
      <div className="p-4 border-b border-slate-800/80 flex items-center space-x-3">
        <div className="p-2 bg-cyan-950/60 border border-cyan-800/50 rounded-lg text-cyan-400">
          <Component className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-slate-100 leading-tight">Painel de Controle</h1>
        </div>
      </div>

      {/* Conteúdo Rolável */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Busca */}
        <div>
          <label className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
            Buscar Entidade
          </label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Político, partido ou empresa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0e1726] border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Filtro por Ano */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              Ano de Início (Fato)
            </label>
            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800/50 px-2 py-0.5 rounded">
              {startYearFilter}
            </span>
          </div>
          <input
            type="range"
            min={minYear}
            max={maxYear}
            step="1"
            value={startYearFilter}
            onChange={(e) => setStartYearFilter(Number(e.target.value))}
            aria-label="Ano de início"
            className="w-full accent-cyan-400 cursor-pointer bg-slate-900 rounded-lg h-1.5"
          />
        </div>

        {/* Tipos de Entidade */}
        <div>
          <div className="mb-2.5 flex items-center justify-between gap-2">
            <label className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-cyan-400" />
              Tipos de Entidade
            </label>
            <ClearFiltersButton onClick={clearTypeFilters} disabled={!anyTypeSelected} />
          </div>
          <div className="space-y-1.5">
            {(Object.keys(NODE_STYLE) as NodeType[]).map((typeKey) => {
              const cfg = NODE_STYLE[typeKey];
              const IconComp = NODE_ICONS[typeKey];
              const active = typeFilters[typeKey];
              return (
                <button
                  key={typeKey}
                  onClick={() => toggleTypeFilter(typeKey)}
                  aria-pressed={active}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg border text-xs transition-all ${
                    active
                      ? 'bg-slate-800/80 border-cyan-500/60 text-slate-100 shadow-[0_0_10px_rgba(34,211,238,0.15)]'
                      : 'bg-slate-950/40 border-slate-900 text-slate-500 hover:text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cfg.color }} />
                    <IconComp size={16} className="w-4 h-4 shrink-0" style={{ color: cfg.labelColor }} aria-hidden="true" />
                    <span>{cfg.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Status Jurídico */}
        <div>
          <div className="mb-2.5 flex items-center justify-between gap-2">
            <label className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-cyan-400" />
              Status Jurídico
            </label>
            <ClearFiltersButton onClick={clearStatusFilters} disabled={!anyStatusSelected} />
          </div>
          <div className="space-y-1.5">
            {(Object.keys(STATUS_STYLE) as LinkStatus[]).map((key) => ({ key, ...STATUS_STYLE[key] })).map((st) => (
              <button
                key={st.key}
                onClick={() => toggleStatusFilter(st.key)}
                aria-pressed={statusFilters[st.key]}
                className={`w-full flex items-center space-x-2.5 px-3 py-1.5 rounded-lg border text-xs transition-all ${
                  statusFilters[st.key]
                    ? 'bg-slate-800/80 border-cyan-500/60 text-slate-100 shadow-[0_0_10px_rgba(34,211,238,0.15)]'
                    : 'bg-slate-950 border-slate-900 text-slate-500 hover:text-slate-300 hover:border-slate-700'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: st.color }} />
                <span>{st.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ÍNDICE DE ESQUEMAS DE CORRUPÇÃO ROLÁVEL */}
        <div>
          <div className="mb-2.5 flex items-center justify-between gap-2">
            <label className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              Índice de Esquemas
            </label>
            {/* Página com todos os dossiês em texto (legível por robôs de busca). */}
            <Link href="/esquemas" className="text-[10px] font-mono text-cyan-400 hover:text-cyan-200 hover:underline">
              Ver todos →
            </Link>
          </div>
          {/* Altura: até 20rem, mas nunca maior que a tela menos 16rem (cabeçalho
              do site, título e rodapé da barra lateral), e nunca menor que 6rem.
              Assim, rolando a barra lateral até o índice, ele cabe inteiro na
              tela em qualquer altura de janela. Lista curta = caixa menor. */}
          <div
            className="overflow-y-auto space-y-1.5 pr-1"
            style={{ maxHeight: 'min(20rem, max(6rem, calc(100dvh - 16rem)))' }}
          >
            {schemeNodes.length === 0 ? (
              <span className="text-xs text-slate-600 italic block p-1">Nenhum esquema encontrado</span>
            ) : (
              schemeNodes.map((scheme) => {
                const isSelected = selectedNode?.id === scheme.id;
                return (
                  <button
                    key={scheme.id}
                    onClick={() => onSelectScheme(scheme)}
                    className={`w-full text-left p-2 rounded-lg border text-xs transition-all flex items-center justify-between group ${
                      isSelected
                        ? 'text-slate-100'
                        : 'bg-[#0e1726] border-slate-800 text-slate-300 hover:border-slate-700 hover:text-slate-100'
                    }`}
                    style={
                      isSelected
                        ? {
                            backgroundColor: `${NODE_STYLE.scheme.color}1f`,
                            borderColor: `${NODE_STYLE.scheme.color}cc`,
                            boxShadow: `0 0 10px ${NODE_STYLE.scheme.color}33`,
                          }
                        : undefined
                    }
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: NODE_STYLE.scheme.color }} />
                      <span className="font-medium truncate">{scheme.label}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Rodapé do Painel */}
      <div className="p-3 border-t border-slate-800/80 bg-[#080d16] text-[11px] font-mono text-slate-400 flex justify-between items-center">
        <span>Nós: <strong className="text-cyan-400">{nodeCount}</strong></span>
        <span>Conexões: <strong className="text-cyan-400">{linkCount}</strong></span>
      </div>
    </aside>
  );
}