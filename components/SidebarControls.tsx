'use client';

import React from 'react';
import { ShieldAlert, Search, Calendar, Filter, Layers, UserCheck, Building2 } from 'lucide-react';
import { NodeType, LinkStatus } from '@/types/graph';

export const NODE_TYPES: Record<NodeType, { label: string; color: string; icon: React.ElementType }> = {
  politician: { label: 'Político', color: '#00f0ff', icon: UserCheck },
  party: { label: 'Partido', color: '#a855f7', icon: Layers },
  scheme: { label: 'Esquema de Corrupção', color: '#ff00c8', icon: ShieldAlert },
  company: { label: 'Empresa / Operador', color: '#0aff96', icon: Building2 }
};

export const STATUS_COLORS: Record<LinkStatus, string> = {
  confirmed: '#ff0055',
  under_investigation: '#f59e0b',
  acquitted: '#10b981'
};

interface SidebarControlsProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  startYearFilter: number;
  setStartYearFilter: (year: number) => void;
  typeFilters: Record<NodeType, boolean>;
  toggleTypeFilter: (type: NodeType) => void;
  statusFilters: Record<LinkStatus, boolean>;
  toggleStatusFilter: (status: LinkStatus) => void;
  nodeCount: number;
  linkCount: number;
}

export default function SidebarControls({
  searchQuery,
  setSearchQuery,
  startYearFilter,
  setStartYearFilter,
  typeFilters,
  toggleTypeFilter,
  statusFilters,
  toggleStatusFilter,
  nodeCount,
  linkCount
}: SidebarControlsProps) {
  return (
    <aside className="w-80 bg-[#090f1b] border-r border-slate-800/80 flex flex-col z-20 shadow-xl">
      <div className="p-4 border-b border-slate-800/80 flex items-center space-x-3">
        <div className="p-2 bg-cyan-950/60 border border-cyan-800/50 rounded-lg text-cyan-400">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-slate-100 leading-tight">Painel de Controle</h1>
          <p className="text-[11px] text-slate-400 font-mono">INQUEST v2.4</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
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
            min="2000"
            max="2026"
            step="1"
            value={startYearFilter}
            onChange={(e) => setStartYearFilter(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer bg-slate-900 rounded-lg h-1.5"
          />
        </div>

        <div>
          <label className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider mb-2.5 block flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            Tipos de Entidade
          </label>
          <div className="space-y-1.5">
            {(Object.keys(NODE_TYPES) as NodeType[]).map((typeKey) => {
              const cfg = NODE_TYPES[typeKey];
              const IconComp = cfg.icon;
              const active = typeFilters[typeKey];
              return (
                <button
                  key={typeKey}
                  onClick={() => toggleTypeFilter(typeKey)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg border text-xs transition-all ${
                    active 
                      ? 'bg-slate-800/80 border-slate-700 text-slate-200' 
                      : 'bg-slate-950/40 border-slate-900 text-slate-600 opacity-60'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <span 
                      className="w-2.5 h-2.5 rounded-full" 
                      style={{ backgroundColor: cfg.color }} 
                    />
                    <IconComp className="w-3.5 h-3.5 text-slate-400" />
                    <span>{cfg.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider mb-2.5 block">
            Status Jurídico
          </label>
          <div className="space-y-1.5">
            {[
              { key: 'confirmed' as LinkStatus, label: 'Condenado / Confirmado', color: STATUS_COLORS.confirmed },
              { key: 'under_investigation' as LinkStatus, label: 'Sob Investigação', color: STATUS_COLORS.under_investigation },
              { key: 'acquitted' as LinkStatus, label: 'Absolvido / Arquivado', color: STATUS_COLORS.acquitted }
            ].map((st) => (
              <button
                key={st.key}
                onClick={() => toggleStatusFilter(st.key)}
                className={`w-full flex items-center space-x-2.5 px-3 py-1.5 rounded-lg border text-xs transition-all ${
                  statusFilters[st.key]
                    ? 'bg-slate-800/50 border-slate-700 text-slate-300'
                    : 'bg-slate-950 border-slate-900 text-slate-600'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: st.color }} />
                <span>{st.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-3 border-t border-slate-800/80 bg-[#080d16] text-[11px] font-mono text-slate-400 flex justify-between items-center">
        <span>Nós: <strong className="text-cyan-400">{nodeCount}</strong></span>
        <span>Conexões: <strong className="text-cyan-400">{linkCount}</strong></span>
      </div>
    </aside>
  );
}