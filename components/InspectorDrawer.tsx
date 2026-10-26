'use client';

import React, { useState } from 'react';
import { X, ExternalLink, ShieldAlert, Building2, Layers, UserCheck } from 'lucide-react';
import { GraphNode, GraphLink, GraphData } from '../types/graph';

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
  const [activeTab, setActiveTab] = useState<'connections' | 'timeline' | 'evidence'>('connections');

  if (!selectedNode && !selectedLink) return null;

  return (
    <aside className="absolute top-16 right-0 bottom-0 w-96 glass-panel border-l border-slate-800/80 flex flex-col z-20 shadow-2xl animate-in slide-in-from-right duration-200">
      {/* Header Bar */}
      <div className="p-4 border-b border-slate-800/80 flex justify-between items-center">
        <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest">
          {selectedNode ? 'NODE DOSSIER' : 'LINK DOSSIER'}
        </span>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Selected Node Content */}
      {selectedNode && (
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Avatar Profile Header */}
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-3">
              <img
                src={selectedNode.image_url}
                alt={selectedNode.label}
                className="w-20 h-20 rounded-full object-cover border-2 border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.3)]"
              />
            </div>
            <h2 className="text-lg font-bold text-slate-100">{selectedNode.label}</h2>
            <span className="mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 uppercase tracking-wider">
              {selectedNode.status || 'UNDER INVESTIGATION'}
            </span>
          </div>

          {/* Key Metrics */}
          <div className="bg-[#0b121e] p-4 rounded-xl border border-slate-800 space-y-3">
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">ESTIMATED IMPACT</span>
              <span className="text-xl font-mono font-bold text-slate-100">
                {selectedNode.estimatedImpact || '$450,000,000'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 border-t border-slate-800/80 pt-3 text-xs">
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase block">PARTIDO</span>
                <span className="font-semibold text-slate-200">{selectedNode.party || 'PLD'}</span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase block">STATUS</span>
                <span className="font-semibold text-slate-200">APURADO</span>
              </div>
            </div>
          </div>

          {/* Factual Narrative */}
          <p className="text-xs text-slate-300 leading-relaxed bg-[#0b121e]/60 p-3 rounded-xl border border-slate-800/80">
            {selectedNode.summary}
          </p>

          {/* Tabs */}
          <div className="border-b border-slate-800 flex space-x-6 text-xs font-mono">
            <button
              onClick={() => setActiveTab('connections')}
              className={`pb-2 border-b-2 transition-colors ${
                activeTab === 'connections' ? 'border-cyan-400 text-cyan-400 font-bold' : 'border-transparent text-slate-400'
              }`}
            >
              Connections
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`pb-2 border-b-2 transition-colors ${
                activeTab === 'timeline' ? 'border-cyan-400 text-cyan-400 font-bold' : 'border-transparent text-slate-400'
              }`}
            >
              Timeline
            </button>
            <button
              onClick={() => setActiveTab('evidence')}
              className={`pb-2 border-b-2 transition-colors ${
                activeTab === 'evidence' ? 'border-cyan-400 text-cyan-400 font-bold' : 'border-transparent text-slate-400'
              }`}
            >
              Evidence Docs
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}