'use client';

import React, { useState } from 'react';
import { ActivePage } from './HeaderBar';
import { GraphData, GraphNode } from '@/types/graph';
import { SCHEME_DETAILS } from '@/data/schemeDetails';
import { ExternalLink, Users, Building, Coins, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';

interface HeaderOverlayProps {
  activePage: ActivePage;
  onClose: () => void;
  graphData: GraphData;
}

export default function HeaderOverlay({ activePage, onClose, graphData }: HeaderOverlayProps) {
  const isOpen = activePage === 'infographics' || activePage === 'glossary';
  const [expandedSchemeId, setExpandedSchemeId] = useState<string | null>(null);

  // Filter all 'scheme' type nodes from database
  const schemeNodes = graphData.nodes.filter((node) => node.type === 'scheme');

  const toggleExpand = (id: string) => {
    setExpandedSchemeId((prev) => (prev === id ? null : id));
  };

  // Helper to retrieve all nodes connected to a specific scheme
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
      className={`absolute inset-0 z-40 bg-white text-slate-900 transition-transform duration-500 ease-in-out shadow-2xl overflow-y-auto ${
        isOpen ? 'translate-y-0 pointer-events-auto' : '-translate-y-full pointer-events-none'
      }`}
    >
      <div className="max-w-5xl mx-auto px-8 py-10">
        {/* Infographics Page Content */}
        {activePage === 'infographics' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                Infographics & Visual Insights
              </h1>
              <p className="mt-2 text-slate-600 text-sm">
                Visual data breakdown of financial impacts and corruption network density across active database records.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl shadow-sm">
                <span className="text-xs font-mono text-slate-500 uppercase tracking-wider block">
                  Total Mapped Schemes
                </span>
                <span className="text-2xl font-bold text-slate-900 mt-1 block">
                  {schemeNodes.length} Schemes
                </span>
              </div>
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl shadow-sm">
                <span className="text-xs font-mono text-slate-500 uppercase tracking-wider block">
                  Total Database Nodes
                </span>
                <span className="text-2xl font-bold text-slate-900 mt-1 block">
                  {graphData.nodes.length} Entities
                </span>
              </div>
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl shadow-sm">
                <span className="text-xs font-mono text-slate-500 uppercase tracking-wider block">
                  Total Tracked Links
                </span>
                <span className="text-2xl font-bold text-slate-900 mt-1 block">
                  {graphData.links.length} Connections
                </span>
              </div>
            </div>

            <div className="w-full h-80 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 font-mono text-sm">
              [ Infographic Visual Analytics & Breakdown Render Here ]
            </div>
          </div>
        )}

        {/* Glossary Page Content */}
        {activePage === 'glossary' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-cyan-600" />
                Corruption Schemes Glossary
              </h1>
              <p className="mt-2 text-slate-600 text-sm">
                Comprehensive directory, operational mechanics, financial metrics, and legal documentation for all registered corruption schemes.
              </p>
            </div>

            <div className="space-y-6">
              {schemeNodes.length === 0 ? (
                <p className="text-sm text-slate-500">No schemes registered in the database yet.</p>
              ) : (
                schemeNodes.map((scheme) => {
                  const details = SCHEME_DETAILS[scheme.id];
                  const connectedEntities = getConnectedEntities(scheme.id);
                  const isExpanded = expandedSchemeId === scheme.id;

                  const politicians = connectedEntities.filter((e) => e.type === 'politician');
                  const companies = connectedEntities.filter((e) => e.type === 'company');

                  return (
                    <article
                      key={scheme.id}
                      className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm transition-all"
                    >
                      {/* Scheme Header Card */}
                      <div className="p-6 space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-700 uppercase bg-cyan-50 px-2.5 py-1 rounded border border-cyan-200">
                              ESQUEMA DE CORRUPÇÃO
                            </span>
                            <h2 className="text-2xl font-bold text-slate-900 mt-2">{scheme.label}</h2>
                          </div>
                          
                          <button
                            onClick={() => toggleExpand(scheme.id)}
                            className="flex items-center space-x-1 text-xs font-semibold text-cyan-700 hover:text-cyan-900 bg-cyan-100/60 hover:bg-cyan-100 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <span>{isExpanded ? 'Recolher Dossiê' : 'Ver Dossiê Completo'}</span>
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>

                        {/* Executive Summary */}
                        <p className="text-sm text-slate-700 leading-relaxed font-sans">
                          {scheme.summary}
                        </p>

                        {/* Quick Metrics Bar */}
                        <div className="flex flex-wrap gap-4 pt-2 border-t border-slate-200 text-xs font-mono text-slate-600">
                          <div className="flex items-center space-x-1.5">
                            <Coins className="w-4 h-4 text-emerald-600" />
                            <span>Impacto: <strong className="text-slate-900">{scheme.estimatedImpact || details?.impact || 'Em Apuração'}</strong></span>
                          </div>
                          <div className="flex items-center space-x-1.5">
                            <Users className="w-4 h-4 text-blue-600" />
                            <span>Políticos Vinculados: <strong className="text-slate-900">{politicians.length}</strong></span>
                          </div>
                          <div className="flex items-center space-x-1.5">
                            <Building className="w-4 h-4 text-amber-600" />
                            <span>Empresas Envolvidas: <strong className="text-slate-900">{companies.length}</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Investigative Content */}
                      {isExpanded && (
                        <div className="px-6 pb-6 pt-2 border-t border-slate-200 bg-white space-y-6 animate-in fade-in duration-200">
                          {/* Context & History */}
                          {details?.context && (
                            <div>
                              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                                Contexto Histórico e Origem
                              </h3>
                              <p className="text-sm text-slate-700 leading-relaxed">{details.context}</p>
                            </div>
                          )}

                          {/* Operational Mechanism */}
                          {details?.mechanism && (
                            <div>
                              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                                Funcionamento do Esquema
                              </h3>
                              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-200">
                                {details.mechanism}
                              </p>
                            </div>
                          )}

                          {/* Connected Graph Entities */}
                          {connectedEntities.length > 0 && (
                            <div>
                              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-2">
                                Entidades Mapeadas no Banco de Dados
                              </h3>
                              <div className="flex flex-wrap gap-2">
                                {connectedEntities.map((ent) => (
                                  <span
                                    key={ent.id}
                                    className={`text-xs px-2.5 py-1 rounded-md border font-medium ${
                                      ent.type === 'politician'
                                        ? 'bg-blue-50 text-blue-800 border-blue-200'
                                        : ent.type === 'company'
                                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                                        : 'bg-slate-100 text-slate-800 border-slate-200'
                                    }`}
                                  >
                                    {ent.label} {ent.party ? `(${ent.party})` : ''}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Legal Outcomes */}
                          {details?.legalStatus && (
                            <div>
                              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                                Desdobramentos Jurídicos & Situação Atual
                              </h3>
                              <p className="text-sm text-slate-700 leading-relaxed">{details.legalStatus}</p>
                            </div>
                          )}

                          {/* Documentary Sources */}
                          {details?.sources && details.sources.length > 0 && (
                            <div>
                              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-2">
                                Fontes Documentais & Reportagens
                              </h3>
                              <ul className="space-y-1.5">
                                {details.sources.map((src, idx) => (
                                  <li key={idx}>
                                    <a
                                      href={src.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center text-xs text-cyan-700 hover:text-cyan-900 hover:underline gap-1.5"
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