'use client';

/**
 * "Do nome à condenação": funil com uma unidade = pessoa ou empresa em UM caso.
 * Barras empilhadas por tipo (cores do grafo); filtro de tipos; tocar numa
 * etapa lista quem está nela. Regras de contagem em lib/infographics.ts.
 */
import React, { useMemo, useState } from 'react';
import { Filter } from 'lucide-react';
import { FUNNEL_GROUPS, buildFunnel, type FunnelEntry, type FunnelGroup } from '@/lib/infographics';
import { entityChipStyle, NODE_STYLE, STATUS_STYLE } from '@/lib/graphConfig';
import type { GraphData } from '@/types/graph';
import { useI18n } from '@/components/I18nProvider';
import { SlideHeader } from './shared';

export default function FunnelSlide({ graphData }: { graphData: GraphData }) {
  const { t } = useI18n();
  const d = t.infographics.deck.funnel;
  const [shown, setShown] = useState<Set<FunnelGroup>>(new Set(FUNNEL_GROUPS));
  const [open, setOpen] = useState<string | null>(null);

  const f = useMemo(() => buildFunnel(graphData), [graphData]);
  const labels = useMemo(() => new Map(graphData.nodes.map((n) => [n.id, n])), [graphData.nodes]);
  const sum = (c: Record<FunnelGroup, number>) => FUNNEL_GROUPS.reduce((a, g) => a + (shown.has(g) ? c[g] : 0), 0);
  const named = sum(f.stages[0].counts) || 1;

  const toggle = (g: FunnelGroup) =>
    setShown((s) => {
      const n = new Set(s);
      if (n.has(g)) {
        if (n.size > 1) n.delete(g);
      } else n.add(g);
      return n;
    });

  const Bar = ({ counts, scale, align }: { counts: Record<FunnelGroup, number>; scale: number; align: 'center' | 'start' }) => (
    <div className={`flex ${align === 'center' ? 'justify-center' : 'justify-start'}`}>
      <div className="flex h-9 sm:h-10 rounded-md overflow-hidden transition-[width] duration-500" style={{ width: `${Math.max(2, scale * 100)}%` }}>
        {FUNNEL_GROUPS.filter((g) => shown.has(g) && counts[g] > 0).map((g) => (
          <span key={g} className="flex items-center justify-center text-[11px] font-bold text-slate-950 border-r border-slate-950/60 last:border-r-0" style={{ flexGrow: counts[g], flexBasis: 0, backgroundColor: NODE_STYLE[g].color, minWidth: 3 }} title={`${t.nodeType[g].plural}: ${counts[g]}`}>
            {counts[g] / named >= 0.05 ? counts[g] : ''}
          </span>
        ))}
      </div>
    </div>
  );

  const Who = ({ entries }: { entries: FunnelEntry[] }) => {
    const list = entries.filter((e) => shown.has(e.group));
    return (
      <div className="mt-2 mb-1 rounded-lg border border-slate-700/80 bg-slate-950/70 p-3 animate-in fade-in slide-in-from-top-1 duration-200 motion-reduce:animate-none">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted">{d.who(list.length)}</span>
          <button type="button" onClick={() => setOpen(null)} className="text-[11px] text-slate-400 hover:text-white">{d.close}</button>
        </div>
        <div className="flex flex-wrap gap-1 max-h-48 overflow-y-auto pr-1" data-no-swipe>
          {list
            .map((e) => ({ e, n: labels.get(e.entityId), s: labels.get(e.schemeId) }))
            .sort((a, b) => (a.n?.label ?? '').localeCompare(b.n?.label ?? ''))
            .map(({ e, n, s }) => (
              <span key={`${e.entityId}|${e.schemeId}`} className="px-1.5 py-0.5 rounded border text-[11px]" style={entityChipStyle(e.group)} title={`${s?.label ?? ''} · ${t.status[e.current]}`}>
                {n?.label}
                <span className="opacity-60"> · {s?.label}</span>
              </span>
            ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <SlideHeader title={d.title} intro={`${d.intro} ${d.unit(f.total, f.distinct)}`} icon={<Filter className="w-5 h-5 shrink-0" style={{ color: NODE_STYLE.politician.labelColor }} />} />
      <div className="flex flex-wrap gap-1.5" role="group" aria-label={t.infographics.deck.who.filterLabel}>
        {FUNNEL_GROUPS.map((g) => (
          <button key={g} type="button" aria-pressed={shown.has(g)} onClick={() => toggle(g)} className={`flex items-center gap-1.5 px-2 py-1 rounded-md border text-[11px] font-medium transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${shown.has(g) ? '' : 'opacity-40'}`} style={entityChipStyle(g)}>
            <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: NODE_STYLE[g].color }} />
            {g === 'company' ? t.nodeType.company.plural : t.nodeType[g].plural}
          </button>
        ))}
      </div>
      <p className="text-[11px] text-muted">{d.tapHint}</p>

      <ol className="space-y-2">
        {f.stages.map((s) => {
          const total = sum(s.counts);
          const isOpen = open === s.key;
          return (
            <li key={s.key}>
              <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : s.key)} className="w-full text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-lg">
                <span className="flex items-baseline justify-between gap-3 mb-1 text-xs">
                  <span className="text-slate-200 font-medium group-hover:text-white">{d.stages[s.key]}</span>
                  <span className="font-mono shrink-0"><strong className="text-white text-sm tabular-nums">{total}</strong> <span className="text-muted">· {d.ofNamed(Math.round((total / named) * 100))}</span></span>
                </span>
                <Bar counts={s.counts} scale={total / named} align="center" />
              </button>
              {isOpen && <Who entries={s.entries} />}
            </li>
          );
        })}
      </ol>

      <div className="pt-3 border-t border-slate-800/80 space-y-2">
        <h3 className="text-sm font-bold text-white">{d.restTitle}</h3>
        {f.rest.map((r) => {
          const total = sum(r.counts);
          const isOpen = open === r.key;
          const color = STATUS_STYLE[r.key].labelColor;
          return (
            <div key={r.key}>
              <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : r.key)} className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-lg">
                <span className="flex items-baseline justify-between gap-3 mb-1 text-xs">
                  <span className="flex items-center gap-1.5 font-medium" style={{ color }}><span className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_STYLE[r.key].color }} />{d.rest[r.key]}</span>
                  <strong className="text-white text-sm font-mono tabular-nums">{total}</strong>
                </span>
                <Bar counts={r.counts} scale={total / named} align="start" />
              </button>
              {isOpen && <Who entries={r.entries} />}
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-muted">{d.footnote}</p>
    </div>
  );
}
