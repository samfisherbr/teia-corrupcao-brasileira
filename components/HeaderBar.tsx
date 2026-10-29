'use client';

import React from 'react';
import { Share2, PieChart, BookOpen, X } from 'lucide-react';

export type ActivePage = 'graph' | 'infographics' | 'glossary';

interface HeaderBarProps {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
}

export default function HeaderBar({ activePage, setActivePage }: HeaderBarProps) {
  return (
    <header className="z-50 h-16 w-full glass-panel border-b border-slate-800/80 px-3 sm:px-6 flex items-center justify-between relative bg-[#080d16]/90 backdrop-blur-md">
      {/* Brand Title & Navigation Buttons */}
      <div className="flex items-center space-x-2 sm:space-x-6 min-w-0">
        <div 
          className="flex items-center space-x-2 sm:space-x-3 cursor-pointer shrink-0" 
          onClick={() => setActivePage('graph')}
        >
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 glow-cyan shrink-0">
            <Share2 className="w-4 h-4" />
          </div>
          <div className="flex items-baseline space-x-1 sm:space-x-2">
            <span className="font-mono font-bold text-slate-100 tracking-wider text-xs sm:text-sm">
              CORRWEB:
            </span>
            {/* Subtitle hidden on mobile screens to save space */}
            <span className="hidden sm:inline-block text-slate-300 text-xs font-medium truncate max-w-[140px] md:max-w-none">
              Corruption Visualizer
            </span>
          </div>
        </div>

        {/* Dynamic Page Navigation Buttons */}
        <nav className="flex items-center space-x-1 sm:space-x-2 border-l border-slate-800/80 pl-2 sm:pl-6 shrink-0">
          <button
            onClick={() => setActivePage(activePage === 'infographics' ? 'graph' : 'infographics')}
            className={`flex items-center space-x-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-medium transition-all ${
              activePage === 'infographics'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 glow-cyan'
                : 'text-slate-300 hover:text-cyan-400 hover:bg-slate-800/60 border border-transparent hover:border-slate-700/60'
            }`}
          >
            <PieChart className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Infográficos</span>
          </button>

          <button
            onClick={() => setActivePage(activePage === 'glossary' ? 'graph' : 'glossary')}
            className={`flex items-center space-x-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-medium transition-all ${
              activePage === 'glossary'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 glow-cyan'
                : 'text-slate-300 hover:text-cyan-400 hover:bg-slate-800/60 border border-transparent hover:border-slate-700/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Glossário</span>
          </button>
        </nav>
      </div>

      {/* Close button indicator when an overlay page is active */}
      {activePage !== 'graph' && (
        <button
          onClick={() => setActivePage('graph')}
          className="flex items-center space-x-1.5 text-[11px] sm:text-xs font-mono text-slate-400 hover:text-slate-100 bg-slate-800/80 border border-slate-700/80 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg transition-all shrink-0 ml-2"
        >
          <X className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden min-[380px]:inline">Fechar</span>
        </button>
      )}
    </header>
  );
}