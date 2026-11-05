'use client';

/**
 * MOBILETIMELINE — barra "Ano de Início" para celular (< 768px, `md`).
 * No celular a barra lateral (SidebarControls) fica oculta; esta faixa logo
 * abaixo do cabeçalho dá acesso ao mesmo filtro de ano, para aumentar ou
 * reduzir os nós do grafo. Usa o mesmo estado do slider da barra lateral
 * (startYearFilter em app/page.tsx), então os dois sempre concordam.
 *
 * A área de toque do slider tem 32px de altura (h-8), embora a trilha
 * desenhada seja fina, para ser fácil de arrastar com o dedo.
 */
import React from 'react';
import { Calendar } from 'lucide-react';

interface MobileTimelineProps {
  startYearFilter: number;
  setStartYearFilter: (year: number) => void;
  minYear: number;
  maxYear: number;
  nodeCount: number;
}

export default function MobileTimeline({
  startYearFilter,
  setStartYearFilter,
  minYear,
  maxYear,
  nodeCount,
}: MobileTimelineProps) {
  return (
    <div className="md:hidden z-30 shrink-0 w-full px-3 py-2 bg-[#090f1b] border-b border-slate-800/80 flex items-center gap-3">
      <label
        htmlFor="mobile-year"
        className="shrink-0 flex items-center gap-1.5 text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider"
      >
        <Calendar size={16} className="w-4 h-4 shrink-0 text-cyan-400" aria-hidden="true" />
        Desde
      </label>

      <span className="shrink-0 text-[10px] font-mono text-slate-500" aria-hidden="true">
        {minYear}
      </span>
      <input
        id="mobile-year"
        type="range"
        min={minYear}
        max={maxYear}
        step="1"
        value={startYearFilter}
        onChange={(e) => setStartYearFilter(Number(e.target.value))}
        aria-label="Ano de início"
        aria-valuetext={`A partir de ${startYearFilter}, ${nodeCount} nós visíveis`}
        className="min-w-0 flex-1 h-8 accent-cyan-400 cursor-pointer bg-transparent"
      />
      <span className="shrink-0 text-[10px] font-mono text-slate-500" aria-hidden="true">
        {maxYear}
      </span>

      <span className="shrink-0 text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800/50 px-2 py-0.5 rounded tabular-nums">
        {startYearFilter}
      </span>
    </div>
  );
}
