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
          <span className="text-slate-300 text-xs font-medium">Corruption Visualizer</span>
        </div>
      </div>
    </header>
  );
}