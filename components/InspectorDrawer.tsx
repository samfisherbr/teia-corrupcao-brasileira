'use client';

/**
 * ============================================================================
 * INSPECTORDRAWER — painel lateral direito de detalhes
 * ============================================================================
 * Abre ao clicar num círculo ("Dossiê da Entidade") ou numa linha ("Detalhes
 * do Vínculo"). Em celular ocupa a tela toda; no desktop, 384px (w-96).
 *
 *  - Entidade: foto, tipo, partido, resumo e conexões visíveis, agrupadas em
 *    seções por tipo da outra ponta (Esquemas, Partidos, Empresas…), na ordem
 *    e nas cores de NODE_STYLE (clicar numa conexão abre o vínculo).
 *  - Vínculo: origem → destino (clicáveis), tipo, status, ano, valor,
 *    ressalva do valor (amount_note), descrição e fonte.
 *
 * Largura: troque `md:w-96` no <aside>. Cores/rótulos: lib/graphConfig.ts.
 * ============================================================================
 */

import React from 'react';
import Link from 'next/link';
import { FileText, X, ExternalLink, ArrowRight, BookOpen } from 'lucide-react';
import { schemePath } from '@/lib/schemes';
import { GraphNode, GraphLink, GraphData, NodeType, LinkStatus, LinkType } from '@/types/graph';
import { NODE_STYLE, STATUS_STYLE, LINK_TYPE_STYLE, FALLBACK_COLOR, getLinkEnds, getLinkKey, entityChipStyle } from '@/lib/graphConfig';
import { NODE_ICONS } from '@/lib/nodeIcons';

/** Ordem das seções de conexões = ordem da legenda do grafo. */
const SECTION_ORDER = Object.keys(NODE_STYLE) as NodeType[];

interface InspectorDrawerProps {
  selectedNode: GraphNode | null;
  selectedLink: GraphLink | null;
  onClose: () => void;
  filteredData: GraphData;
  fullNodes: GraphNode[];
  onSelectLink: (link: GraphLink) => void;
  onSelectNode?: (node: GraphNode) => void;
}


export default function InspectorDrawer({
  selectedNode,
  selectedLink,
  onClose,
  filteredData,
  fullNodes,
  onSelectLink,
  onSelectNode
}: InspectorDrawerProps) {
  // Hooks precisam rodar antes de qualquer `return` antecipado (regra do React).
  // nodeById: busca O(1) de nós; brokenImage: lembra a foto que falhou ao carregar.
  const nodeById = React.useMemo(() => new Map(fullNodes.map((n) => [n.id, n])), [fullNodes]);
  const [brokenImage, setBrokenImage] = React.useState<string | null>(null);

  // Conexões da entidade selecionada, agrupadas pelo tipo da outra ponta.
  const connectionSections = React.useMemo(() => {
    if (!selectedNode) return [];
    const groups = new Map<string, { link: GraphLink; otherId: string; other: GraphNode | undefined }[]>();
    filteredData.links.forEach((link) => {
      const { sourceId, targetId } = getLinkEnds(link);
      if (sourceId !== selectedNode.id && targetId !== selectedNode.id) return;
      const otherId = sourceId === selectedNode.id ? targetId : sourceId;
      const other = nodeById.get(otherId);
      const key = other && other.type in NODE_STYLE ? other.type : 'other';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push({ link, otherId, other });
    });
    return [...SECTION_ORDER, 'other']
      .filter((key) => groups.has(key))
      .map((key) => ({ key, items: groups.get(key)! }));
  }, [selectedNode, filteredData.links, nodeById]);

  if (!selectedNode && !selectedLink) return null;

  const nodeStyle = selectedNode ? NODE_STYLE[selectedNode.type as NodeType] : undefined;
  const statusStyle = selectedLink ? STATUS_STYLE[selectedLink.status as LinkStatus] : undefined;
  const statusColor = statusStyle?.color ?? FALLBACK_COLOR;
  const typeStyle = selectedLink?.type ? LINK_TYPE_STYLE[selectedLink.type as LinkType] : undefined;

  // Normalização segura das entidades de Origem e Destino do Link (Suporta ID em String ou Objeto D3)
  const getLinkEntities = (link: GraphLink) => {
    const sourceObj = typeof link.source === 'object' ? (link.source as GraphNode) : null;
    const targetObj = typeof link.target === 'object' ? (link.target as GraphNode) : null;

    const sourceId = sourceObj ? sourceObj.id : (link.source as string);
    const targetId = targetObj ? targetObj.id : (link.target as string);

    const sourceNode = sourceObj || nodeById.get(sourceId) || null;
    const targetNode = targetObj || nodeById.get(targetId) || null;

    return { sourceNode, targetNode };
  };

  const { sourceNode, targetNode } = selectedLink 
    ? getLinkEntities(selectedLink) 
    : { sourceNode: null, targetNode: null };

  return (
     <aside className="absolute inset-y-0 right-0 w-full md:w-96 bg-[#0c1322]/95 backdrop-blur-xl border-l border-slate-800 flex flex-col z-30 shadow-2xl animate-in slide-in-from-right duration-200">
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
            {selectedNode.image_url && brokenImage !== selectedNode.image_url ? (
              <img
                src={selectedNode.image_url}
                alt={selectedNode.label}
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={() => setBrokenImage(selectedNode.image_url)}
                className="w-16 h-16 rounded-xl object-cover border border-slate-700 shadow-md flex-shrink-0"
              />
            ) : (
              <div
                className="w-16 h-16 rounded-xl border flex items-center justify-center font-bold text-xl flex-shrink-0"
                style={entityChipStyle(selectedNode.type)}
              >
                {(selectedNode.label || '?').charAt(0)}
              </div>
            )}
            <div>
              <h2 className="text-base font-bold text-slate-100 leading-snug">{selectedNode.label}</h2>
              <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                <span
                  className="px-2 py-0.5 rounded border text-[10px] font-semibold uppercase tracking-wider"
                  style={entityChipStyle(selectedNode.type)}
                >
                  {nodeStyle?.label || selectedNode.type}
                </span>
                {selectedNode.party && (
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
            {selectedNode.type === 'scheme' && (
              <Link
                href={schemePath(selectedNode.id)}
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-200 hover:underline"
              >
                <BookOpen size={16} className="w-4 h-4 shrink-0" aria-hidden="true" />
                Ler o dossiê completo
              </Link>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">Conexões Mapeadas</h3>
            {connectionSections.length === 0 && (
              <p className="text-xs text-slate-500 italic">Nenhuma conexão visível com os filtros atuais.</p>
            )}
            {connectionSections.map(({ key, items }) => {
              const st = NODE_STYLE[key as NodeType];
              const Icon = NODE_ICONS[key as NodeType];
              const color = st?.color ?? FALLBACK_COLOR;
              return (
                <section key={key} aria-label={st?.plural ?? 'Outros'}>
                  <h4
                    className="flex items-center gap-2 mb-2 pb-1.5 border-b text-[11px] font-mono font-semibold uppercase tracking-wider"
                    style={{ color: st?.labelColor ?? '#cbd5e1', borderColor: `${color}40` }}
                  >
                    {Icon && <Icon size={16} className="w-4 h-4 shrink-0" aria-hidden="true" />}
                    <span>{st?.plural ?? 'Outros'}</span>
                    <span
                      className="ml-auto px-1.5 py-0.5 rounded border text-[10px] leading-none"
                      style={entityChipStyle(key)}
                    >
                      {items.length}
                    </span>
                  </h4>
                  <div className="space-y-2">
                    {items.map(({ link, otherId, other }) => (
                      <button
                        type="button"
                        key={getLinkKey(link)}
                        onClick={() => onSelectLink(link)}
                        className="w-full text-left p-3 bg-slate-950 border border-slate-800 border-l-2 rounded-lg hover:border-slate-700 transition-colors cursor-pointer"
                        style={{ borderLeftColor: color }}
                      >
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <span className="text-xs font-medium text-slate-200">
                            {other?.label || otherId}
                            {other?.party && other.type === 'politician' && (
                              <span className="ml-1 font-mono text-slate-500">({other.party})</span>
                            )}
                          </span>
                          <span className="shrink-0 text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                            {link.year || 'N/A'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-2">{link.relation}</p>
                      </button>
                    ))}
                  </div>
                </section>
              );
            })}
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
            {typeStyle && (
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Categoria da Relação:</span>
                <span
                  className="font-bold font-mono uppercase tracking-wide px-2 py-0.5 rounded text-[10px]"
                  style={{ backgroundColor: `${typeStyle.color}20`, color: typeStyle.color, border: `1px solid ${typeStyle.color}50` }}
                >
                  {typeStyle.label}
                </span>
              </div>
            )}

            {/* Status Jurídico */}
            <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-900 pt-3">
              <span>Status Jurídico:</span>
              <span 
                className="font-bold font-mono uppercase tracking-wide px-2 py-0.5 rounded text-[10px]"
                style={{ backgroundColor: `${statusColor}20`, color: statusColor, border: `1px solid ${statusColor}50` }}
              >
                {statusStyle?.label ?? selectedLink.status}
              </span>
            </div>

            {/* Ano do Fato */}
            <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-900 pt-3">
              <span>Ano do Fato:</span>
              <span className="text-sm font-mono font-bold text-slate-200">{selectedLink.year || 'N/A'}</span>
            </div>

            {/* Montante Envolvido + ressalva (amount_note), quando houver */}
            {selectedLink.amount && (
              <div className="text-xs text-slate-400 border-t border-slate-900 pt-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span>Montante Envolvido:</span>
                  <span className="text-sm font-mono font-bold text-emerald-400">{selectedLink.amount}</span>
                </div>
                {selectedLink.amount_note && (
                  <p className="text-[11px] text-slate-500 italic text-right">{selectedLink.amount_note}</p>
                )}
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