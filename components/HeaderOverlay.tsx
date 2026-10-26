'use client';

import React from 'react';
import { ActivePage } from './HeaderBar';
import { GraphData } from '@/types/graph';

interface HeaderOverlayProps {
  activePage: ActivePage;
  onClose: () => void;
  graphData: GraphData;
}

export default function HeaderOverlay({ activePage, onClose, graphData }: HeaderOverlayProps) {
  const isOpen = activePage === 'infographics' || activePage === 'glossary';

  // Filter out the 'scheme' nodes from your loaded database to display in the glossary
  const schemeNodes = graphData.nodes.filter((node) => node.type === 'scheme');

  return (
    <div
      className={`absolute inset-x-0 bottom-0 top-16 z-40 bg-white text-slate-900 transition-transform duration-500 ease-in-out shadow-2xl overflow-y-auto ${
        isOpen ? 'translate-y-0' : '-translate-y-full'
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
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                Corruption Schemes Glossary
              </h1>
              <p className="mt-2 text-slate-600 text-sm">
                Comprehensive directory and longer explanations of all corruption schemes registered in your database.
              </p>
            </div>

            <div className="space-y-6">
              {schemeNodes.length === 0 ? (
                <p className="text-sm text-slate-500">No schemes found in the database yet.</p>
              ) : (
                schemeNodes.map((scheme) => (
                  <article
                    key={scheme.id}
                    className="p-6 bg-slate-50 border border-slate-200 rounded-xl space-y-3 shadow-sm"
                  >
                    <div className="flex justify-between items-start">
                      <h2 className="text-xl font-bold text-slate-900">{scheme.label}</h2>
                      <span className="text-xs font-mono font-semibold px-2.5 py-1 bg-slate-200 text-slate-800 rounded-md">
                        {scheme.party || 'SCHEME'}
                      </span>
                    </div>

                    <p className="text-sm text-slate-700 leading-relaxed">
                      {scheme.summary || 'Detailed investigative documentation for this corruption scheme is being processed.'}
                    </p>

                    {scheme.image_url && (
                      <div className="pt-2">
                        <img
                          src={scheme.image_url}
                          alt={scheme.label}
                          className="w-32 h-20 object-cover rounded-lg border border-slate-200 shadow-sm"
                        />
                      </div>
                    )}
                  </article>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}