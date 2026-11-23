'use client';

/**
 * Carrossel dos Infográficos: um painel por vez, no tamanho da tela, em vez de
 * uma página vertical sem fim. Navegação: abas roláveis, botões
 * anterior/próximo, setas do teclado e arrastar para o lado no celular (não
 * vale dentro de áreas com rolagem horizontal, marcadas com data-no-swipe).
 * Só o painel aberto é montado.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BarChart3, ChevronLeft, ChevronRight, Filter, GanttChartSquare, Layers, TrendingUp, Users } from 'lucide-react';
import type { GraphData, GraphNode } from '@/types/graph';
import type { LocalizedSchemeDetail } from '@/lib/dossiers';
import { useI18n } from '@/components/I18nProvider';
import { FlowSlide, MoneySlide, OverviewSlide } from './ClassicSlides';
import WhoSlide from './WhoSlide';
import FunnelSlide from './FunnelSlide';
import TimelineSlide from './TimelineSlide';

const SLIDES = ['overview', 'who', 'funnel', 'timeline', 'flow', 'money'] as const;
type SlideKey = (typeof SLIDES)[number];
const ICONS: Record<SlideKey, React.ElementType> = { overview: BarChart3, who: Users, funnel: Filter, timeline: GanttChartSquare, flow: Layers, money: TrendingUp };

interface Props {
  graphData: GraphData;
  schemeNodes: GraphNode[];
  schemeDetails: Record<string, LocalizedSchemeDetail>;
  startYears: Map<string, number>;
}

export default function InfographicsDeck(props: Props) {
  const { t } = useI18n();
  const d = t.infographics.deck;
  const [nav, setNav] = useState<{ index: number; dir: 1 | -1 }>({ index: 0, dir: 1 });
  const index = nav.index;
  const stageRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const touch = useRef<{ x: number; y: number; ok: boolean } | null>(null);

  const go = useCallback((next: number) => {
    const n = (next + SLIDES.length) % SLIDES.length;
    setNav((cur) => ({ index: n, dir: n > cur.index ? 1 : -1 }));
  }, []);

  // A aba ativa rola para dentro da vista; o painel volta ao topo.
  useEffect(() => {
    tabRefs.current[index]?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
    stageRef.current?.scrollTo({ top: 0 });
  }, [index]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') { go(index + 1); e.preventDefault(); }
    else if (e.key === 'ArrowLeft') { go(index - 1); e.preventDefault(); }
    else if (e.key === 'Home') { go(0); e.preventDefault(); }
    else if (e.key === 'End') { go(SLIDES.length - 1); e.preventDefault(); }
  };

  const key = SLIDES[index];
  const anim = nav.dir === 1 ? 'slide-in-from-right-6' : 'slide-in-from-left-6';

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-3">
      <div role="tablist" aria-label={d.navLabel} onKeyDown={onKey} className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 shrink-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {SLIDES.map((k, i) => {
          const Icon = ICONS[k];
          const on = i === index;
          return (
            <button
              key={k}
              ref={(el) => { tabRefs.current[i] = el; }}
              id={`infog-tab-${k}`}
              role="tab"
              type="button"
              aria-selected={on}
              aria-controls="infog-stage"
              tabIndex={on ? 0 : -1}
              onClick={() => go(i)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                on ? 'bg-cyan-500/15 border-cyan-400/50 text-cyan-200' : 'bg-surface-field/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-600'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              {d.tabs[k]}
            </button>
          );
        })}
      </div>

      <div
        ref={stageRef}
        id="infog-stage"
        role="tabpanel"
        aria-labelledby={`infog-tab-${key}`}
        className="relative flex-1 min-h-[24rem] overflow-y-auto overflow-x-hidden rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-sm"
        onTouchStart={(e) => {
          const el = e.target as HTMLElement;
          touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, ok: !el.closest('[data-no-swipe]') };
        }}
        onTouchEnd={(e) => {
          const s = touch.current;
          touch.current = null;
          if (!s?.ok) return;
          const dx = e.changedTouches[0].clientX - s.x;
          const dy = e.changedTouches[0].clientY - s.y;
          if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.8) go(index + (dx < 0 ? 1 : -1));
        }}
      >
        <div key={key} className={`p-4 sm:p-6 min-h-full flex flex-col animate-in fade-in ${anim} duration-300 motion-reduce:animate-none`}>
          {key === 'overview' && <OverviewSlide {...props} />}
          {key === 'who' && <WhoSlide graphData={props.graphData} startYears={props.startYears} />}
          {key === 'funnel' && <FunnelSlide graphData={props.graphData} />}
          {key === 'timeline' && <TimelineSlide schemeNodes={props.schemeNodes} presidentTerms={props.graphData.presidents} />}
          {key === 'flow' && <FlowSlide {...props} />}
          {key === 'money' && <MoneySlide {...props} />}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 shrink-0">
        <button type="button" onClick={() => go(index - 1)} aria-label={d.prev} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-800 bg-surface-field/80 text-xs text-slate-300 hover:border-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400">
          <ChevronLeft className="w-4 h-4" /><span className="hidden sm:inline">{d.prev}</span>
        </button>
        <div className="flex items-center gap-1.5" aria-hidden>
          {SLIDES.map((k, i) => (
            <span key={k} className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? 'w-6 bg-cyan-400' : 'w-1.5 bg-slate-700'}`} />
          ))}
        </div>
        <span className="sr-only" aria-live="polite">{d.position(index + 1, SLIDES.length)}</span>
        <button type="button" onClick={() => go(index + 1)} aria-label={d.next} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-800 bg-surface-field/80 text-xs text-slate-300 hover:border-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400">
          <span className="hidden sm:inline">{d.next}</span><ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
