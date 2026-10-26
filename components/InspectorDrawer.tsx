'use client';

import React from 'react';
import { FileText, X, ExternalLink, ArrowRight } from 'lucide-react';
import { GraphNode, GraphLink, GraphData } from '../types/graph';
import { NODE_TYPES, STATUS_COLORS } from './SidebarControls';

interface InspectorDrawerProps {
  selectedNode: GraphNode | null;
  selectedLink: GraphLink | null;
  onClose: () => void;
  filteredData: GraphData;
  fullNodes: GraphNode[];
  onSelectLink: (link: GraphLink) => void;
  onSelectNode?: (node: GraphNode) => void;
}

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  transaction: { label: 'Transação Financeira', color: '#f59e0b' },
  contract: { label: 'Contrato Público', color: '#3b82f6' },
  process: { label: 'Processo / Dossiê', color: '#a855f7' }
};

export default function InspectorDrawer({
  selectedNode,
  selectedLink,
  onClose,
  filteredData,
  fullNodes,
  onSelectLink,
  onSelectNode
}: InspectorDrawerProps) {
  if (!selectedNode && !selectedLink) return null;

  // Normalização segura das entidades de Origem e Destino do Link (Suporta ID em String ou Objeto D3)
  const getLinkEntities = (link: GraphLink) => {
    const sourceObj = typeof link.source === 'object' ? (link.source as GraphNode) : null;
    const targetObj = typeof link.target === 'object' ? (link.target as GraphNode) : null;

    const sourceId = sourceObj ? sourceObj.id : (link.source as string);
    const targetId = targetObj ? targetObj.id : (link.target as string);

    const sourceNode = sourceObj || fullNodes.find(n => n.id === sourceId) || null;
    const targetNode = targetObj || fullNodes.find(n => n.id === targetId) || null;

    return { sourceNode, targetNode };
  };

  const { sourceNode, targetNode } = selectedLink 
    ? getLinkEntities(selectedLink) 
    : { sourceNode: null, targetNode: null };

  return (
    <aside className="w-96 bg-slate-900 border-l border-slate-800 flex flex-col z-20 shadow-2xl animate-in slide-in-from-right duration-200">
      {/* Topo do Drawer */}
      <div className="p-4 border-b border-slate-800 flex justify-between items-center">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
          <FileText className="w-4 h-4 text-blue-400" />
          {selectedNode ? 'Dossiê da Entidade' : 'Detalhes do Vínculo'}
        </span>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Conteúdo do Nó Selecionado */}
      {selectedNode && (
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="flex items-start space-x-4">
            {selectedNode.image_url ? (
              <img
                src={selectedNode.image_url}
                alt={selectedNode.label}
                className="w-16 h-16 rounded-xl object-cover border border-slate-700 shadow-md flex-shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 font-bold text-xl flex-shrink-0">
                {selectedNode.label.charAt(0)}
              </div>
            )}
            <div>
              <h2 className="text-base font-bold text-slate-100 leading-snug">{selectedNode.label}</h2>
              <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                <span 
                  className="px-2 py-0.5 rounded text-[10px] font-semibold text-white uppercase tracking-wider"
                  style={{ backgroundColor: NODE_TYPES[selectedNode.type]?.color || '#3b82f6' }}
                >
                  {NODE_TYPES[selectedNode.type]?.label || selectedNode.type}
                </span>
                {selectedNode.party && selectedNode.party !== 'N/A' && (
                  <span className="bg-slate-800 border border-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded font-mono">
                    {selectedNode.party}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono">Resumo Factual</h3>
            <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              {selectedNode.summary}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono">Conexões Mapeadas</h3>
            <div className="space-y-2">
              {filteredData.links
                .filter(l => {
                  const sId = typeof l.source === 'object' ? (l.source as any).id : l.source;
                  const tId = typeof l.target === 'object' ? (l.target as any).id : l.target;
                  return sId === selectedNode.id || tId === selectedNode.id;
                })
                .map(link => {
                  const sId = typeof link.source === 'object' ? (link.source as any).id : link.source;
                  const tId = typeof link.target === 'object' ? (link.target as any).id : link.target;
                  const otherId = sId === selectedNode.id ? tId : sId;
                  const otherNode = fullNodes.find(n => n.id === otherId);

                  return (
                    <div 
                      key={link.id} 
                      onClick={() => onSelectLink(link)}
                      className="p-3 bg-slate-950 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-medium text-slate-200">{otherNode?.label || otherId}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                          {link.year || 'N/A'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2">{link.relation}</p>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo do Link Selecionado */}
      {selectedLink && (
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Card de Entidades Conectadas (Origem -> Destino) */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <span className="text-[10px] font-mono font-semibold text-slate-500 uppercase tracking-wider block">
              Entidades Conectadas
            </span>
            <div className="flex items-center justify-between gap-2">
              {/* Origem */}
              <button
                onClick={() => sourceNode && onSelectNode && onSelectNode(sourceNode)}
                className="flex-1 p-2 bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors text-left group"
              >
                <span className="text-[10px] text-slate-500 block uppercase font-mono">Origem</span>
                <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-400 transition-colors line-clamp-1">
                  {sourceNode?.label || (typeof selectedLink.source === 'string' ? selectedLink.source : 'Origem')}
                </span>
              </button>

              <ArrowRight className="w-4 h-4 text-slate-600 flex-shrink-0" />

              {/* Destino */}
              <button
                onClick={() => targetNode && onSelectNode && onSelectNode(targetNode)}
                className="flex-1 p-2 bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors text-left group"
              >
                <span className="text-[10px] text-slate-500 block uppercase font-mono">Destino</span>
                <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-400 transition-colors line-clamp-1">
                  {targetNode?.label || (typeof selectedLink.target === 'string' ? selectedLink.target : 'Destino')}
                </span>
              </button>
            </div>
          </div>

          {/* Metadados do Vínculo */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            {/* Categoria Operacional (type) */}
            {selectedLink.type && CATEGORY_LABELS[selectedLink.type] && (
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Categoria da Relação:</span>
                <span 
                  className="font-bold font-mono uppercase tracking-wide px-2 py-0.5 rounded text-[10px]"
                  style={{
                    backgroundColor: `${CATEGORY_LABELS[selectedLink.type].color}20`,
                    color: CATEGORY_LABELS[selectedLink.type].color,
                    border: `1px solid ${CATEGORY_LABELS[selectedLink.type].color}50`
                  }}
                >
                  {CATEGORY_LABELS[selectedLink.type].label}
                </span>
              </div>
            )}

            {/* Status Jurídico */}
            <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-900 pt-3">
              <span>Status Jurídico:</span>
              <span 
                className="font-bold font-mono uppercase tracking-wide px-2 py-0.5 rounded text-[10px]"
                style={{ 
                  backgroundColor: `${STATUS_COLORS[selectedLink.status] || '#9ca3af'}20`,
                  color: STATUS_COLORS[selectedLink.status] || '#9ca3af',
                  border: `1px solid ${STATUS_COLORS[selectedLink.status] || '#9ca3af'}50`
                }}
              >
                {selectedLink.status === 'confirmed' ? 'Condenado / Confirmado' : 
                 selectedLink.status === 'under_investigation' ? 'Sob Investigação' : 
                 selectedLink.status === 'acquitted' ? 'Absolvido / Arquivado' : selectedLink.status}
              </span>
            </div>

            {/* Ano do Fato */}
            <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-900 pt-3">
              <span>Ano do Fato:</span>
              <span className="text-sm font-mono font-bold text-slate-200">{selectedLink.year || 'N/A'}</span>
            </div>

            {/* Montante Envolvido */}
            {selectedLink.amount && selectedLink.amount !== 'N/A' && (
              <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-900 pt-3">
                <span>Montante Envolvido:</span>
                <span className="text-sm font-mono font-bold text-emerald-400">{selectedLink.amount}</span>
              </div>
            )}
          </div>

          {/* Descrição Factual / Relação */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono">Descrição do Vínculo</h3>
            <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              {selectedLink.relation}
            </p>
          </div>

          {/* Fonte Documental / Evidência */}
          {selectedLink.source_url && (
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono">Fonte Documental</h3>
              <a
                href={selectedLink.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-blue-950/30 border border-blue-900/50 rounded-lg text-xs text-blue-400 hover:bg-blue-900/40 transition-colors"
              >
                <span className="truncate mr-2 font-mono">{selectedLink.source_url}</span>
                <ExternalLink className="w-4 h-4 flex-shrink-0" />
              </a>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}