'use client';

/**
 * "Quem está em cada esquema": barras empilhadas por tipo de entidade, com
 * ordenação, escala (absoluta / 100%) e filtro de tipos. Tocar numa barra abre
 * os nomes. Cores = as do grafo (NODE_STYLE).
 */
import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Users } from 'lucide-react';
import { COMPOSITION_TYPES, buildComposition, type CompositionType } from '@/lib/infographics';
import { entityChipStyle, NODE_STYLE } from '@/lib/graphConfig';
import { schemePath } from '@/lib/schemes';
import type { GraphData } from '@/types/graph';
import { useI18n } from '@/components/I18nProvider';
import { Segmented, SlideHeader } from './shared';

type Sort = 'start' | 'size' | 'name';
type Scale = 'abs' | 'pct';

export default function WhoSlide({ graphData, startYears }: { graphData: GraphData; startYears: Map<string, number> }) {
  const { t, locale, href } = useI18n();
  const d = t.infographics.deck.who;
  const [sort, setSort] = useState<Sort>('start');
  const [scale, setScale] = useState<Scale>('abs');
  const [shown, setShown] = useState<Set<CompositionType>>(new Set(COMPOSITION_TYPES));
  const [open, setOpen] = useState<string | null>(null);

  const rows = useMemo(() => buildComposition(graphData), [graphData]);
  const visible = useMemo(() => {
    const withTotal = rows.map((r) => ({ ...r, vis: COMPOSITION_TYPES.reduce((a, k) => a + (shown.has(k) ? r.counts[k] : 0), 0) }));
    const cmpName = (a: { label: string }, b: { label: string }) => a.label.localeCompare(b.label, locale);
    return withTotal.sort((a, b) =>
      sort === 'name' ? cmpName(a, b) : sort === 'size' ? b.vis - a.vis || cmpName(a, b) : (startYears.get(a.id) ?? 9999) - (startYears.get(b.id) ?? 9999) || cmpName(a, b),
    );
  }, [rows, shown, sort, startYears, locale]);
  const max = Math.max(...visible.map((r) => r.vis), 1);

  const toggle = (k: CompositionType) =>
    setShown((s) => {
      const n = new Set(s);
      if (n.has(k)) {
        if (n.size > 1) n.delete(k);
      } else n.add(k);
      return n;
    });

  return (
    <div className="space-y-4">
      <SlideHeader title={d.title} intro={d.intro} icon={<Users className="w-5 h-5 shrink-0" style={{ color: NODE_STYLE.politician.labelColor }} />} />

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label={d.filterLabel}>
          {COMPOSITION_TYPES.map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={shown.has(k)}
              onClick={() => toggle(k)}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-md border text-[11px] font-medium transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${shown.has(k) ? '' : 'opacity-40'}`}
              style={entityChipStyle(k)}
            >
              <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: NODE_STYLE[k].color }} />
              {t.nodeType[k].plural}
            </button>
          ))}
        </div>
        <Segmented<Sort> label={d.sortLabel} value={sort} onChange={setSort} options={[{ value: 'start', label: d.sortStart }, { value: 'size', label: d.sortSize }, { value: 'name', label: d.sortName }]} />
        <Segmented<Scale> label={d.viewLabel} value={scale} onChange={setScale} options={[{ value: 'abs', label: d.absolute }, { value: 'pct', label: d.normalized }]} />
      </div>

      <ul className="space-y-1">
        {visible.map((r) => {
          const isOpen = open === r.id;
          const scaleBase = scale === 'pct' ? r.vis || 1 : max;
          return (
            <li key={r.id} className={`rounded-lg border transition-colors ${isOpen ? 'border-slate-600 bg-slate-950/60' : 'border-transparent hover:bg-slate-950/40'}`}>
              <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : r.id)} className="w-full text-left px-2 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-lg">
                <span className="flex items-center justify-between gap-2 text-xs mb-1">
                  <span className="font-semibold truncate" style={{ color: NODE_STYLE.scheme.labelColor }}>{r.label}</span>
                  <span className="flex items-center gap-1 font-mono text-muted shrink-0">
                    {r.vis}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </span>
                </span>
                <span className="flex h-5 sm:h-6 overflow-hidden rounded-md bg-slate-950/70" style={{ width: `${scale === 'pct' ? 100 : Math.max(4, (r.vis / scaleBase) * 100)}%` }}>
                  {COMPOSITION_TYPES.filter((k) => shown.has(k) && r.counts[k] > 0).map((k) => (
                    <span
                      key={k}
                      className="flex items-center justify-center text-[10px] font-bold text-slate-950 border-r border-slate-950/60 last:border-r-0 transition-[flex-grow] duration-500"
                      style={{ flexGrow: r.counts[k], flexBasis: 0, backgroundColor: NODE_STYLE[k].color, minWidth: 6 }}
                      title={`${t.nodeType[k].plural}: ${r.counts[k]}`}
                    >
                      {r.counts[k] > 1 ? r.counts[k] : ''}
                    </span>
                  ))}
                </span>
              </button>
              {isOpen && (
                <div className="px-3 pb-3 pt-1 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200 motion-reduce:animate-none">
                  {r.vis === 0 && <p className="text-xs text-muted">{d.none}</p>}
                  {COMPOSITION_TYPES.filter((k) => shown.has(k) && r.members[k].length > 0).map((k) => (
                    <div key={k}>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-muted">{t.nodeType[k].plural} · {r.members[k].length}</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {r.members[k].map((n) => (
                          <span key={n.id} className="px-1.5 py-0.5 rounded border text-[11px]" style={entityChipStyle(k)}>
                            {n.label}{k === 'politician' && n.party ? ` · ${n.party}` : ''}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                  <Link href={href(schemePath(r.id))} className="inline-block text-[11px] font-medium text-cyan-400 hover:text-cyan-300 underline underline-offset-2">{d.open} →</Link>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
