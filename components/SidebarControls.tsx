'use client';

import React from 'react';
import { ShieldAlert, Search, Calendar, Filter, Layers, UserCheck, Building2 } from 'lucide-react';
import { NodeType, LinkStatus } from '../types/graph';

export const NODE_TYPES: Record<NodeType, { label: string; color: string; icon: React.ElementType }> = {
  politician: { label: 'Político', color: '#3B82F6', icon: UserCheck },
  party: { label: 'Partido', color: '#8B5CF6', icon: Layers },
  scheme: { label: 'Esquema de Corrupção', color: '#EF4444', icon: ShieldAlert },
  company: { label: 'Empresa / Operador', color: '#F59E0B', icon: Building2 }
};

export const STATUS_COLORS: Record<LinkStatus, string> = {
  confirmed: '#EF4444',
  under_investigation: '#F59E0B',
  acquitted: '#10B981'
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
    <aside className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col z-10 shadow-xl">
      <div className="p-4 border-b border-slate-800 flex items-center space-x-3">
        <div className="p-2 bg-red-950 border border-red-800 rounded-lg text-red-500">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-100 leading-tight">Painel de Investigação</h1>
          <p className="text-xs text-slate-400">Mapeamento de Redes & Corrupção</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
            Buscar Entidade
          </label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Político, partido ou empresa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              Ano de Início Fato (a partir de)
            </label>
            <span className="text-xs font-mono font-bold text-blue-400 bg-blue-950/60 border border-blue-800/50 px-2 py-0.5 rounded">
              {startYearFilter}
            </span>
          </div>
          <input
            type="range"
            min="2000"
            max="2006"
            step="1"
            value={startYearFilter}
            onChange={(e) => setStartYearFilter(Number(e.target.value))}
            className="w-full accent-blue-500 cursor-pointer bg-slate-950 rounded-lg h-2"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
            <span>2000</span>
            <span>2002</span>
            <span>2004</span>
            <span>2006</span>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 block flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-blue-400" />
            Tipos de Entidade
          </label>
          <div className="space-y-2">
            {(Object.keys(NODE_TYPES) as NodeType[]).map((typeKey) => {
              const cfg = NODE_TYPES[typeKey];
              const IconComp = cfg.icon;
              const active = typeFilters[typeKey];
              return (
                <button
                  key={typeKey}
                  onClick={() => toggleTypeFilter(typeKey)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-sm transition-all ${
                    active 
                      ? 'bg-slate-800/80 border-slate-700 text-slate-200' 
                      : 'bg-slate-950/40 border-slate-900 text-slate-600 opacity-60'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <span 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: cfg.color }} 
                    />
                    <IconComp className="w-4 h-4 text-slate-400" />
                    <span>{cfg.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 block">
            Status Jurídico da Conexão
          </label>
          <div className="space-y-2">
            {[
              { key: 'confirmed' as LinkStatus, label: 'Condenado / Confirmado', color: STATUS_COLORS.confirmed },
              { key: 'under_investigation' as LinkStatus, label: 'Sob Investigação', color: STATUS_COLORS.under_investigation },
              { key: 'acquitted' as LinkStatus, label: 'Absolvido / Arquivado', color: STATUS_COLORS.acquitted }
            ].map((st) => (
              <button
                key={st.key}
                onClick={() => toggleStatusFilter(st.key)}
                className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg border text-xs transition-all ${
                  statusFilters[st.key]
                    ? 'bg-slate-800/50 border-slate-700 text-slate-300'
                    : 'bg-slate-950 border-slate-900 text-slate-600'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: st.color }} />
                <span>{st.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-950/50 text-xs text-slate-500 flex justify-between items-center">
        <span>Exibindo: <strong className="text-slate-300">{nodeCount}</strong> nós</span>
        <span>Conexões: <strong className="text-slate-300">{linkCount}</strong></span>
      </div>
    </aside>
  );
}
