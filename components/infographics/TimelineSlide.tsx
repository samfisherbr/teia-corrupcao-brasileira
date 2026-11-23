'use client';

/**
 * "Quanto tempo cada esquema operou até ser interrompido": Gantt com uma faixa
 * dedicada aos presidentes. Barra = início → fim da atividade (hachurado no
 * início quando a data é de um ato habilitador); tracejado = intervalo até a
 * descoberta; marcador = o que interrompeu ou revelou. Zoom e rolagem
 * horizontal (cabeçalho e nomes ficam fixos); tocar numa linha mostra datas e
 * o presidente da época. Cor das barras = cor de "esquema" do grafo; faixa dos
 * presidentes = cor de "político"; siglas = cor de "partido".
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { GanttChartSquare, Minus, Plus } from 'lucide-react';
import { PRESIDENTS, buildGantt, presidentsBetween, type GanttRow } from '@/lib/infographics';
import { entityChipStyle, NODE_STYLE } from '@/lib/graphConfig';
import { schemePath } from '@/lib/schemes';
import { formatDate } from '@/lib/format';
import { schemeTimeline } from '@/lib/dossiers';
import type { EndBasis, GraphNode } from '@/types/graph';
import { useI18n } from '@/components/I18nProvider';
import { Segmented, SlideHeader, useElementSize } from './shared';

type Sort = 'start' | 'duration' | 'name';

const LABEL_W = 132; // px, coluna de nomes (celular); em telas largas vira 188
const ROW_H = 34;
const MARK = '#e2e8f0';

/** Marcador de cada tipo de interrupção: forma própria, para não depender só de cor. */
function Marker({ basis, size = 12 }: { basis: EndBasis; size?: number }) {
  const p = { width: size, height: size, viewBox: '0 0 12 12', fill: MARK, stroke: '#080d16', strokeWidth: 1.2, 'aria-hidden': true } as const;
  switch (basis) {
    case 'police_investigation': return <svg {...p}><circle cx="6" cy="6" r="4.6" /></svg>;
    case 'documented_end': return <svg {...p}><rect x="1.6" y="1.6" width="8.8" height="8.8" /></svg>;
    case 'parliamentary_inquiry': return <svg {...p}><path d="M6 .8 11.2 6 6 11.2.8 6Z" /></svg>;
    case 'oversight': return <svg {...p}><path d="M6 1 11.2 10.6H.8Z" /></svg>;
    case 'court_ruling': return <svg {...p}><path d="M4.4 .8h3.2v3.6h3.6v3.2H7.6v3.6H4.4V7.6H.8V4.4h3.6Z" /></svg>;
  }
}

/** 'AAAA' / 'AAAA-MM' / 'AAAA-MM-DD' no idioma da página, na precisão da fonte. */
function showDate(date: string, locale: Parameters<typeof formatDate>[1]): string {
  if (/^\d{4}$/.test(date)) return date;
  if (/^\d{4}-\d{2}$/.test(date)) {
    const [y, m] = date.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, 15)).toLocaleDateString(locale === 'pt' ? 'pt-BR' : locale === 'es' ? 'es-ES' : 'en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  }
  return formatDate(date, locale) ?? date;
}

export default function TimelineSlide({ schemeNodes }: { schemeNodes: GraphNode[] }) {
  const { t, locale, href } = useI18n();
  const d = t.infographics.deck.timeline;
  const [sort, setSort] = useState<Sort>('start');
  const [zoom, setZoom] = useState(0);
  const [sel, setSel] = useState<string | null>(null);
  const [wrapRef, wrap] = useElementSize<HTMLDivElement>();
  const cardRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (sel) cardRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [sel]);

  const rows = useMemo(() => buildGantt(schemeNodes, (id) => schemeTimeline(id)), [schemeNodes]);
  const sorted = useMemo(() => {
    const byName = (a: GanttRow, b: GanttRow) => a.label.localeCompare(b.label, locale);
    return [...rows].sort((a, b) => (sort === 'name' ? byName(a, b) : sort === 'duration' ? b.duration - a.duration || byName(a, b) : a.start - b.start || byName(a, b)));
  }, [rows, sort, locale]);

  const now = useMemo(() => { const n = new Date(); return n.getFullYear() + n.getMonth() / 12; }, []);
  const minY = Math.floor(Math.min(...rows.map((r) => r.start), PRESIDENTS[2].from)) - 1;
  const maxY = Math.ceil(Math.max(...rows.map((r) => Math.max(r.end, r.exposed ?? 0)), now)) + 1;
  const span = maxY - minY;
  const labelW = wrap.w >= 640 ? 188 : LABEL_W;
  const fit = Math.max(0, wrap.w - labelW - 24) / span;
  const ppy = Math.max(fit, 14) * Math.pow(1.4, zoom);
  const chartW = span * ppy;
  const X = (y: number) => (y - minY) * ppy;

  const selected = sorted.find((r) => r.id === sel) ?? null;
  const inOffice = selected ? presidentsBetween(selected.start, selected.start + 0.001, now)[0] : null;
  const inOfficeEnd = selected ? presidentsBetween(selected.end, selected.end + 0.001, now)[0] : null;
  const ticks: number[] = [];
  for (let y = Math.ceil(minY / 5) * 5; y <= maxY; y += 5) ticks.push(y);
  const bodyH = sorted.length * ROW_H;

  const markerLegend: EndBasis[] = ['police_investigation', 'documented_end', 'parliamentary_inquiry', 'oversight', 'court_ruling'];

  return (
    <div className="flex flex-col gap-3 flex-1 min-h-0">
      <SlideHeader title={d.title} intro={d.intro} icon={<GanttChartSquare className="w-5 h-5 shrink-0" style={{ color: NODE_STYLE.scheme.labelColor }} />} />

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <Segmented<Sort> label={d.sortLabel} value={sort} onChange={setSort} options={[{ value: 'start', label: d.sortStart }, { value: 'duration', label: d.sortDuration }, { value: 'name', label: d.sortName }]} />
        <div className="flex items-center gap-1" role="group" aria-label="Zoom">
          <button type="button" aria-label={d.zoomOut} disabled={zoom <= 0} onClick={() => setZoom((z) => Math.max(0, z - 1))} className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-700/80 bg-surface-field text-slate-300 disabled:opacity-35"><Minus className="w-3.5 h-3.5" /></button>
          <button type="button" aria-label={d.zoomIn} disabled={zoom >= 4} onClick={() => setZoom((z) => Math.min(4, z + 1))} className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-700/80 bg-surface-field text-slate-300 disabled:opacity-35"><Plus className="w-3.5 h-3.5" /></button>
        </div>
        <ul className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-400">
          {markerLegend.map((b) => (
            <li key={b} className="flex items-center gap-1"><Marker basis={b} size={10} />{d.endBasis[b]}</li>
          ))}
          <li className="flex items-center gap-1"><span className="w-4 h-2 rounded-sm" style={{ background: `repeating-linear-gradient(45deg, ${NODE_STYLE.scheme.color}, ${NODE_STYLE.scheme.color} 2px, #080d16 2px, #080d16 4px)` }} />{d.legendHatched}</li>
        </ul>
      </div>

      <div ref={wrapRef} data-no-swipe className="relative overflow-auto rounded-xl border border-slate-800 bg-slate-950/60 flex-1 basis-0 min-h-[16rem]">
        <div style={{ width: labelW + chartW + 24, minWidth: '100%' }} className="relative">
          {/* Cabeçalho fixo: eixo de anos + faixa de presidentes */}
          <div className="sticky top-0 z-20 flex bg-slate-950 border-b border-slate-800">
            <div className="sticky left-0 z-30 shrink-0 bg-slate-950 border-r border-slate-800/80 flex flex-col justify-end text-[10px] font-mono uppercase tracking-wider text-muted" style={{ width: labelW }}>
              <span className="px-2 h-6 flex items-center">{/* eixo */}</span>
              <span className="px-2 h-8 flex items-center" style={{ color: NODE_STYLE.politician.labelColor }}>{d.presidents}</span>
            </div>
            <div className="relative" style={{ width: chartW + 24 }}>
              <div className="relative h-6">
                {ticks.map((y) => (
                  <span key={y} className="absolute top-1 -translate-x-1/2 text-[10px] font-mono text-muted" style={{ left: X(y) }}>{y}</span>
                ))}
              </div>
              <div className="relative h-8">
                {PRESIDENTS.map((p, i) => {
                  const a = X(Math.max(p.from, minY));
                  const b = X(Math.min(p.to ?? now, maxY));
                  const w = b - a;
                  const active = selected && (inOffice?.id === p.id || inOfficeEnd?.id === p.id);
                  return (
                    <div
                      key={p.id}
                      title={`${p.name} (${p.party})`}
                      className="absolute top-0 h-full overflow-hidden border-x border-slate-950 flex items-center justify-center gap-1 px-1 transition-colors"
                      style={{ left: a, width: w, backgroundColor: `${NODE_STYLE.politician.color}${active ? '55' : i % 2 ? '1f' : '33'}`, boxShadow: active ? `inset 0 0 0 1.5px ${NODE_STYLE.politician.color}` : undefined }}
                    >
                      {w > 38 && <span className="text-[10px] font-semibold truncate" style={{ color: NODE_STYLE.politician.labelColor }}>{p.name}</span>}
                      {w > 92 && <span className="hidden sm:inline text-[9px] font-mono border px-1 rounded-sm" style={entityChipStyle('party')}>{p.party}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Corpo */}
          <div className="relative flex" style={{ height: bodyH }}>
            <div className="sticky left-0 z-10 shrink-0 bg-slate-950 border-r border-slate-800/80" style={{ width: labelW }}>
              {sorted.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  aria-pressed={sel === r.id}
                  onClick={() => setSel(sel === r.id ? null : r.id)}
                  className={`w-full flex items-center px-2 text-left text-[11px] sm:text-xs truncate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-400 ${sel === r.id ? 'bg-fuchsia-500/10 font-bold' : 'hover:bg-slate-900'}`}
                  style={{ height: ROW_H, color: sel === r.id ? NODE_STYLE.scheme.labelColor : '#cbd5e1' }}
                >
                  <span className="truncate">{r.label}{r.startBasis === 'enabling_act' ? ' *' : ''}</span>
                </button>
              ))}
            </div>

            <div className="relative" style={{ width: chartW + 24 }}>
              {/* faixas dos presidentes ao fundo + grade de anos */}
              {PRESIDENTS.map((p, i) => (
                <div key={p.id} className="absolute top-0 bottom-0" style={{ left: X(Math.max(p.from, minY)), width: X(Math.min(p.to ?? now, maxY)) - X(Math.max(p.from, minY)), backgroundColor: i % 2 ? 'transparent' : `${NODE_STYLE.politician.color}0a` }} />
              ))}
              {ticks.map((y) => <div key={y} className="absolute top-0 bottom-0 w-px bg-slate-800/80" style={{ left: X(y) }} />)}
              <div className="absolute top-0 bottom-0 w-px bg-cyan-400/50" style={{ left: X(now) }} aria-hidden />
              {selected && (
                <>
                  <div className="absolute top-0 bottom-0 w-px bg-fuchsia-400/70" style={{ left: X(selected.start) }} />
                  <div className="absolute top-0 bottom-0 w-px bg-fuchsia-400/70" style={{ left: X(selected.end) }} />
                </>
              )}

              {sorted.map((r, i) => {
                const left = X(r.start);
                const w = Math.max(6, X(r.end) - left);
                const hatch = r.startBasis === 'enabling_act' ? Math.min(w, Math.max(8, ppy * 1.5)) : 0;
                const mark: EndBasis = r.exposedBasis ?? r.endBasis;
                const markX = r.exposed !== null ? X(r.exposed) : left + w;
                const labelX = Math.max(markX, left + w) + 10;
                const dim = sel && sel !== r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    tabIndex={-1}
                    aria-label={r.label}
                    onClick={() => setSel(sel === r.id ? null : r.id)}
                    className={`absolute left-0 right-0 transition-opacity ${dim ? 'opacity-35' : ''}`}
                    style={{ top: i * ROW_H, height: ROW_H }}
                  >
                    {r.exposed !== null && <span className="absolute border-t-2 border-dashed border-slate-400/70" style={{ left: left + w, width: Math.max(0, X(r.exposed) - left - w), top: ROW_H / 2 - 1 }} />}
                    <span className="absolute rounded-full overflow-hidden" style={{ left, width: w, top: ROW_H / 2 - 7, height: 14, background: `linear-gradient(90deg, ${NODE_STYLE.scheme.color}, ${NODE_STYLE.scheme.labelColor})`, boxShadow: sel === r.id ? `0 0 10px ${NODE_STYLE.scheme.color}` : undefined }}>
                      {hatch > 0 && <span className="absolute inset-y-0 left-0" style={{ width: hatch, background: 'repeating-linear-gradient(45deg, rgba(8,13,22,.78) 0 2px, transparent 2px 5px)' }} />}
                    </span>
                    <span className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: markX, top: ROW_H / 2 }}><Marker basis={mark} /></span>
                    <span className="absolute top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 whitespace-nowrap" style={{ left: labelX }}>{d.years(r.duration)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {selected ? (
        <div ref={cardRef} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 animate-in fade-in duration-200 motion-reduce:animate-none">
            <div className="space-y-1 min-w-0">
              <div className="font-bold" style={{ color: NODE_STYLE.scheme.labelColor }}>{selected.label}</div>
              <div className="text-slate-300 leading-relaxed">
                <span className="text-muted">{d.started}:</span> {showDate(selected.startDate, locale)} <span className="text-muted">({d.startBasis[selected.startBasis]})</span>
                {' · '}<span className="text-muted">{d.ended}:</span> {showDate(selected.endDate, locale)} <span className="text-muted">({d.endBasis[selected.endBasis]})</span>
                {selected.exposedDate && <> · <span className="text-muted">{d.exposed}:</span> {showDate(selected.exposedDate, locale)}</>}
                {' · '}<strong>{d.years(selected.duration)}</strong>
              </div>
              {inOffice && (
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="text-muted">{d.inOffice}:</span>
                  <span className="font-semibold" style={{ color: NODE_STYLE.politician.labelColor }}>{inOffice.name}</span>
                  <span className="text-[10px] font-mono border px-1 rounded-sm" style={entityChipStyle('party')}>{inOffice.party}</span>
                </div>
              )}
            </div>
            <Link href={href(schemePath(selected.id))} className="shrink-0 font-medium text-cyan-400 hover:text-cyan-300 underline underline-offset-2">{d.open} →</Link>
          </div>
        </div>
      ) : (
        <p className="text-[11px] text-muted">{d.selectHint}</p>
      )}
    </div>
  );
}
