'use client';

import React from 'react';
import { FileText, X, ExternalLink } from 'lucide-react';
import { GraphNode, GraphLink, GraphData } from '../types/graph';
import { NODE_TYPES, STATUS_COLORS } from './SidebarControls';

interface InspectorDrawerProps {
  selectedNode: GraphNode | null;
  selectedLink: GraphLink | null;
  onClose: () => void;
  filteredData: GraphData;
  fullNodes: GraphNode[];
  onSelectLink: (link: GraphLink) => void;
}

export default function InspectorDrawer({
  selectedNode,
  selectedLink,
  onClose,
  filteredData,
  fullNodes,
  onSelectLink
}: InspectorDrawerProps) {
  if (!selectedNode && !selectedLink) return null;

  return (
    <aside className="w-96 bg-slate-900 border-l border-slate-800 flex flex-col z-20 shadow-2xl animate-in slide-in-from-right duration-200">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-blue-400" />
          {selectedNode ? 'Dossiê do Investigado' : 'Detalhes da Conexão'}
        </span>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {selectedNode && (
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="flex items-start space-x-4">
            <img
              src={selectedNode.image_url}
              alt={selectedNode.label}
              className="w-16 h-16 rounded-xl object-cover border border-slate-700 shadow-md"
            />
            <div>
              <h2 className="text-base font-bold text-slate-100">{selectedNode.label}</h2>
              <div className="mt-1 flex items-center gap-2">
                <span 
                  className="px-2 py-0.5 rounded text-[11px] font-semibold text-white uppercase tracking-wider"
                  style={{ backgroundColor: NODE_TYPES[selectedNode.type]?.color }}
                >
                  {NODE_TYPES[selectedNode.type]?.label}
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
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Resumo Factual</h3>
            <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              {selectedNode.summary}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Conexões Mapeadas</h3>
            <div className="space-y-2">
              {filteredData.links
                .filter(l => 
                  (typeof l.source === 'object' ? (l.source as any).id : l.source) === selectedNode.id ||
                  (typeof l.target === 'object' ? (l.target as any).id : l.target) === selectedNode.id
                )
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
                        <span className="text-xs font-medium text-slate-200">{otherNode?.label}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                          {link.year}
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

      {selectedLink && (
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Status da Relação:</span>
              <span 
                className="font-bold uppercase tracking-wide px-2 py-0.5 rounded text-[10px]"
                style={{ 
                  backgroundColor: `${STATUS_COLORS[selectedLink.status]}20`,
                  color: STATUS_COLORS[selectedLink.status],
                  border: `1px solid ${STATUS_COLORS[selectedLink.status]}50`
                }}
              >
                {selectedLink.status === 'confirmed' ? 'Condenado / Confirmado' : selectedLink.status}
              </span>
            </div>

            <div className="border-t border-slate-900 pt-3">
              <span className="text-xs text-slate-500 block">Ano do Fato:</span>
              <span className="text-sm font-mono font-bold text-slate-200">{selectedLink.year}</span>
            </div>

            {selectedLink.amount && (
              <div className="border-t border-slate-900 pt-3">
                <span className="text-xs text-slate-500 block">Montante Envolvido:</span>
                <span className="text-base font-mono font-bold text-emerald-400">{selectedLink.amount}</span>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Descrição do Vínculo</h3>
            <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              {selectedLink.relation}
            </p>
          </div>

          {selectedLink.source_url && (
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Fonte Documental</h3>
              <a
                href={selectedLink.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-blue-950/30 border border-blue-900/50 rounded-lg text-xs text-blue-400 hover:bg-blue-900/40 transition-colors"
              >
                <span className="truncate mr-2">{selectedLink.source_url}</span>
                <ExternalLink className="w-4 h-4 flex-shrink-0" />
              </a>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
