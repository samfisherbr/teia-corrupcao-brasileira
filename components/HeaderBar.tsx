'use client';

import React from 'react';
import { Search, DollarSign, Building, Scale, Share2 } from 'lucide-react';

interface HeaderBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeCategory: 'all' | 'transactions' | 'contracts' | 'processes';
  setActiveCategory: (cat: 'all' | 'transactions' | 'contracts' | 'processes') => void;
}

export default function HeaderBar({
  searchQuery,
  setSearchQuery,
  activeCategory,
  setActiveCategory
}: HeaderBarProps) {
  return (
    <header className="z-30 h-16 w-full glass-panel border-b border-slate-800/80 px-6 flex items-center justify-between">
      {/* Brand Title */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 glow-cyan">
          <Share2 className="w-4 h-4" />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="font-mono font-bold text-slate-100 tracking-wider text-sm">CORRWEB:</span>
          <span className="text-slate-300 text-xs font-medium">Network Visualizer v2.4</span>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="flex-1 max-w-xl mx-8">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search politician, company, process..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0e1726]/80 border border-slate-700/60 rounded-full pl-10 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/50 transition-all"
          />
        </div>
      </div>

      {/* Category Pills & Toggle */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setActiveCategory(activeCategory === 'transactions' ? 'all' : 'transactions')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            activeCategory === 'transactions'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 glow-green'
              : 'bg-slate-800/60 text-slate-300 border border-slate-700/50 hover:bg-slate-800'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5 text-amber-400" />
          <span>Transactions</span>
        </button>

        <button
          onClick={() => setActiveCategory(activeCategory === 'contracts' ? 'all' : 'contracts')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            activeCategory === 'contracts'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 glow-cyan'
              : 'bg-slate-800/60 text-slate-300 border border-slate-700/50 hover:bg-slate-800'
          }`}
        >
          <Building className="w-3.5 h-3.5 text-cyan-400" />
          <span>Contracts</span>
        </button>

        <button
          onClick={() => setActiveCategory(activeCategory === 'processes' ? 'all' : 'processes')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            activeCategory === 'processes'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50'
              : 'bg-slate-800/60 text-slate-300 border border-slate-700/50 hover:bg-slate-800'
          }`}
        >
          <Scale className="w-3.5 h-3.5 text-purple-400" />
          <span>Processes</span>
        </button>
      </div>
    </header>
  );
}