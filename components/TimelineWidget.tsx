{/*
'use client';

import React from 'react';

interface TimelineWidgetProps {
  startYear: number;
  setStartYear: (year: number) => void;
}


export default function TimelineWidget({ startYear, setStartYear }: TimelineWidgetProps) {
  return (
    <div className="hidden md:block absolute bottom-6 right-96 z-10 w-96 glass-panel rounded-xl p-4 border border-slate-800 bg-[#0e1726]/90 backdrop-blur-md shadow-2xl">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] font-mono font-semibold text-slate-400 tracking-wider uppercase">
          INVESTIGATION TIMELINE (2000 - 2026)
        </span>
        <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800/50 px-2 py-0.5 rounded">
          {startYear}
        </span>
      </div>

      <input
        type="range"
        min="2000"
        max="2026"
        step="1"
        value={startYear}
        onChange={(e) => setStartYear(Number(e.target.value))}
        className="w-full accent-cyan-400 cursor-pointer bg-slate-900 rounded-lg h-1.5"
      />

      <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-2">
        <span>2000</span>
        <span>2006</span>
        <span>2018</span>
        <span>2026</span>
      </div>
    </div>
  );
}
*/}