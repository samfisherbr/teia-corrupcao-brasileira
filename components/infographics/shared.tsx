'use client';

/** Peças compartilhadas pelos slides dos Infográficos. */
import React, { useEffect, useRef, useState } from 'react';

/** Largura (px) de um elemento, atualizada ao redimensionar. 0 até a 1ª medição. */
export function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, size] as const;
}

/** Controle segmentado (uma opção ativa). */
export function Segmented<V extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: V;
  options: { value: V; label: string }[];
  onChange: (v: V) => void;
}) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className="text-[10px] font-mono uppercase tracking-wider text-muted shrink-0">{label}</span>
      <div role="group" aria-label={label} className="flex rounded-lg border border-slate-700/80 bg-surface-field p-0.5">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            aria-pressed={value === o.value}
            onClick={() => onChange(o.value)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
              value === o.value ? 'bg-cyan-500/15 text-cyan-300' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Cabeçalho padrão de um slide. */
export function SlideHeader({ title, intro, icon, badge }: { title: string; intro?: string; icon?: React.ReactNode; badge?: React.ReactNode }) {
  return (
    <header className="space-y-1">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 min-w-0">
          {icon}
          <span className="min-w-0">{title}</span>
        </h2>
        {badge}
      </div>
      {intro && <p className="text-xs text-slate-400 leading-relaxed">{intro}</p>}
    </header>
  );
}

/** Número que sobe até o valor ao aparecer (respeita "reduzir movimento"). */
export function useCountUp(target: number, ms = 700): number {
  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [v, setV] = useState(0);
  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / ms);
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms, reduced]);
  return reduced ? target : v;
}
