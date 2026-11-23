'use client';

/**
 * Os três infográficos que já existiam (ranking de partidos, fluxo operacional
 * e mapa de calor financeiro), agora como slides do carrossel. Os cálculos são
 * os mesmos de antes; o mapa de calor virou um treemap proporcional ao valor.
 * Reais e dólares nunca são somados (ver lib/money.ts).
 */
import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Activity, BarChart3, Coins, Layers, ShieldExclamationPoint, TrendingUp } from 'lucide-react';
import type { GraphData, GraphNode, LinkStatus } from '@/types/graph';
import { entityChipStyle, getLinkEnds, NODE_STYLE, STATUS_STYLE } from '@/lib/graphConfig';
import { formatAmount, parseAmount } from '@/lib/money';
import { schemePath } from '@/lib/schemes';
import { squarify } from '@/lib/infographics';
import type { LocalizedSchemeDetail } from '@/lib/dossiers';
import { useI18n } from '@/components/I18nProvider';
import { SlideHeader, useCountUp, useElementSize } from './shared';

/** Quantos partidos aparecem no ranking. */
const PARTY_RANKING_SIZE = 6;

interface ClassicProps {
  graphData: GraphData;
  schemeNodes: GraphNode[];
  schemeDetails: Record<string, LocalizedSchemeDetail>;
}

/* ------------------------------------------------------------------ */
/* Visão geral: números-chave + ranking de partidos                    */
/* ------------------------------------------------------------------ */

export function money(
  schemeNodes: GraphNode[],
  links: GraphData['links'],
  details: Record<string, LocalizedSchemeDetail>,
  locale: Parameters<typeof formatAmount>[2],
  pending: string,
  totalPending: string,
) {
  const items = schemeNodes.map((scheme) => {
    let brl = 0;
    links.forEach((link) => {
      const { sourceId, targetId } = getLinkEnds(link);
      if (sourceId !== scheme.id && targetId !== scheme.id) return;
      if (typeof link.amount_brl === 'number' && link.amount_brl > 0) {
        brl += link.amount_brl;
        return;
      }
      const parsed = parseAmount(link.amount);
      if (parsed?.currency === 'BRL') brl += parsed.value;
    });
    let amount = brl;
    let currency: 'BRL' | 'USD' = 'BRL';
    if (amount === 0) {
      const fallback = parseAmount(details[scheme.id]?.impact);
      if (fallback) {
        amount = fallback.value;
        currency = fallback.currency;
      }
    }
    return { id: scheme.id, label: scheme.label, amount, currency, formatted: amount > 0 ? formatAmount(amount, currency, locale) : pending };
  });
  const totalBRL = items.filter((i) => i.currency === 'BRL').reduce((a, i) => a + i.amount, 0);
  const totalUSD = items.filter((i) => i.currency === 'USD').reduce((a, i) => a + i.amount, 0);
  items.sort((a, b) => (b.currency === a.currency ? b.amount - a.amount : a.currency === 'BRL' ? -1 : 1));
  const parts = [totalBRL > 0 ? formatAmount(totalBRL, 'BRL', locale) : null, totalUSD > 0 ? formatAmount(totalUSD, 'USD', locale) : null].filter(Boolean);
  return { items, formattedGrandTotal: parts.length ? parts.join(' + ') : totalPending };
}

export function OverviewSlide({ graphData, schemeNodes, schemeDetails }: ClassicProps) {
  const { t, locale } = useI18n();
  const nodeById = useMemo(() => new Map(graphData.nodes.map((n) => [n.id, n])), [graphData.nodes]);
  const grand = useMemo(
    () => money(schemeNodes, graphData.links, schemeDetails, locale, t.infographics.amountPending, t.infographics.totalPending),
    [schemeNodes, graphData.links, schemeDetails, locale, t],
  );

  // Centralidade de grau por sigla: cada ponta de vínculo de um nó do partido conta uma vez.
  const ranking = useMemo(() => {
    const map: Record<string, { party: string; count: number; politicians: Set<string> }> = {};
    graphData.nodes.forEach((n) => {
      if (!n.party) return;
      const p = n.party.toUpperCase();
      map[p] ??= { party: p, count: 0, politicians: new Set() };
      if (n.type === 'politician') map[p].politicians.add(n.id);
    });
    graphData.links.forEach((l) => {
      const { sourceId, targetId } = getLinkEnds(l);
      [nodeById.get(sourceId), nodeById.get(targetId)].forEach((n) => {
        const k = n?.party?.toUpperCase();
        if (k && map[k]) map[k].count += 1;
      });
    });
    const ranked = Object.values(map).sort((a, b) => b.count - a.count);
    const max = Math.max(...ranked.map((r) => r.count), 1);
    return ranked.map((r) => ({ ...r, pct: Math.round((r.count / max) * 100), politicianCount: r.politicians.size }));
  }, [graphData, nodeById]);

  const nSchemes = useCountUp(schemeNodes.length);
  const nLinks = useCountUp(graphData.links.length);
  const [hot, setHot] = useState<string | null>(null);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">{t.infographics.mappedVolume}</span>
            <span className="text-lg sm:text-xl font-bold text-emerald-400 mt-0.5 block break-words">{grand.formattedGrandTotal}</span>
          </div>
          <div className="p-2.5 bg-emerald-950/60 border border-emerald-800/40 rounded-lg text-emerald-400 shrink-0"><Coins className="w-5 h-5" /></div>
        </div>
        <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">{t.infographics.registeredSchemes}</span>
            <span className="text-lg sm:text-xl font-bold mt-0.5 block tabular-nums" style={{ color: NODE_STYLE.scheme.labelColor }}>{t.infographics.cases(nSchemes)}</span>
          </div>
          <div className="p-2.5 border rounded-lg shrink-0" style={entityChipStyle('scheme')}><ShieldExclamationPoint className="w-5 h-5" /></div>
        </div>
        <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">{t.infographics.activeConnections}</span>
            <span className="text-lg sm:text-xl font-bold text-blue-400 mt-0.5 block tabular-nums">{t.infographics.links(nLinks)}</span>
          </div>
          <div className="p-2.5 bg-blue-950/60 border border-blue-800/40 rounded-lg text-blue-400 shrink-0"><Activity className="w-5 h-5" /></div>
        </div>
      </div>

      <section className="space-y-4">
        <SlideHeader
          title={t.infographics.rankingTitle.replace(/^\d+\.\s*/, '')}
          intro={t.infographics.rankingIntro}
          icon={<BarChart3 className="w-5 h-5 shrink-0" style={{ color: NODE_STYLE.party.labelColor }} />}
          badge={<span className="hidden sm:inline shrink-0 whitespace-nowrap text-[11px] font-mono border px-2 py-0.5 rounded-sm" style={entityChipStyle('party')}>{t.infographics.rankingBadge}</span>}
        />
        {ranking.length === 0 ? (
          <p className="text-xs text-muted italic">{t.infographics.rankingEmpty}</p>
        ) : (
          <ul className="space-y-3">
            {ranking.slice(0, PARTY_RANKING_SIZE).map((item) => (
              <li key={item.party} onMouseEnter={() => setHot(item.party)} onMouseLeave={() => setHot(null)} className={`space-y-1.5 transition-opacity ${hot && hot !== item.party ? 'opacity-50' : ''}`}>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold font-mono text-slate-200">
                    {item.party} <span className="text-muted font-normal">{t.infographics.politiciansCount(item.politicianCount)}</span>
                  </span>
                  <span className="font-mono font-semibold" style={{ color: NODE_STYLE.party.labelColor }}>{t.infographics.linksCount(item.count)}</span>
                </div>
                <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${item.pct}%`, backgroundImage: `linear-gradient(to right, ${NODE_STYLE.party.color}, ${NODE_STYLE.party.labelColor})` }} />
                </div>
              </li>
            ))}
          </ul>
        )}
        <p className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg text-[11px] text-slate-400 leading-relaxed">
          💡 <strong>{t.infographics.insightLabel}</strong> {t.infographics.insight}
        </p>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Fluxo operacional: rosca + status jurídico                          */
/* ------------------------------------------------------------------ */

export function FlowSlide({ graphData }: ClassicProps) {
  const { t } = useI18n();
  const [active, setActive] = useState<string | null>(null);

  const m = useMemo(() => {
    const total = graphData.links.length;
    const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0);
    const c = { transaction: 0, contract: 0, process: 0 } as Record<string, number>;
    const statusCounts = Object.fromEntries(Object.keys(STATUS_STYLE).map((k) => [k, 0])) as Record<LinkStatus, number>;
    graphData.links.forEach((l) => {
      if (l.type && l.type in c) c[l.type] += 1;
      if (l.status in statusCounts) statusCounts[l.status] += 1;
    });
    const categories = [
      { name: t.infographics.categoryTransaction, key: 'transaction', color: '#f59e0b' },
      { name: t.infographics.categoryContract, key: 'contract', color: '#10b981' },
      { name: t.infographics.categoryProcess, key: 'process', color: '#3b82f6' },
    ].map((x) => ({ ...x, count: c[x.key], percentage: pct(c[x.key]) }));
    return { total, categories, statusCounts };
  }, [graphData.links, t]);

  const maxStatus = Math.max(...Object.values(m.statusCounts), 1);
  const offsets = m.categories.map((_, i) => m.categories.slice(0, i).reduce((a, c) => a + c.percentage, 0));

  return (
    <div className="space-y-6">
      <SlideHeader
        title={t.infographics.flowTitle.replace(/^\d+\.\s*/, '')}
        intro={t.infographics.flowIntro}
        icon={<Layers className="w-5 h-5 text-amber-400 shrink-0" />}
        badge={<span className="hidden sm:inline text-[11px] font-mono bg-amber-950/80 text-amber-300 border border-amber-800/50 px-2 py-0.5 rounded-sm">{t.infographics.flowBadge}</span>}
      />
      <div className="grid gap-6 md:grid-cols-2 items-center">
        <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-center gap-5">
          <div className="relative w-40 h-40 shrink-0 flex items-center justify-center">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90" role="img" aria-label={t.infographics.flowBadge}>
              {m.categories.map((cat, i) => {
                const o = offsets[i];
                return (
                  <circle
                    key={cat.key}
                    cx="18" cy="18" r="15.915" fill="transparent" stroke={cat.color}
                    strokeWidth={active === cat.key ? 5 : 3.8}
                    strokeDasharray={`${cat.percentage} ${100 - cat.percentage}`}
                    strokeDashoffset={-o}
                    opacity={active && active !== cat.key ? 0.3 : 1}
                    className="transition-all duration-300 cursor-pointer"
                    onMouseEnter={() => setActive(cat.key)}
                    onMouseLeave={() => setActive(null)}
                    onClick={() => setActive(active === cat.key ? null : cat.key)}
                  />
                );
              })}
            </svg>
            <div className="absolute text-center pointer-events-none">
              <span className="text-2xl font-extrabold text-white block tabular-nums">
                {active ? m.categories.find((c) => c.key === active)?.count : m.total}
              </span>
              <span className="text-[9px] font-mono text-slate-400 block uppercase">{t.infographics.connections}</span>
            </div>
          </div>
          <div className="space-y-2 w-full">
            {m.categories.map((cat) => (
              <button
                key={cat.key}
                type="button"
                aria-pressed={active === cat.key}
                onClick={() => setActive(active === cat.key ? null : cat.key)}
                onMouseEnter={() => setActive(cat.key)}
                onMouseLeave={() => setActive(null)}
                className={`w-full flex items-center justify-between text-xs p-2.5 bg-slate-950/60 border rounded-lg transition-colors text-left ${active === cat.key ? 'border-slate-500' : 'border-slate-800/80'}`}
              >
                <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} /><span className="text-slate-200">{cat.name}</span></span>
                <span className="font-mono font-bold text-slate-300">{cat.count} ({cat.percentage}%)</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2.5">
          <span className="text-[11px] font-mono text-slate-400">{t.infographics.legalStatus}</span>
          {(Object.keys(STATUS_STYLE) as LinkStatus[]).map((k) => (
            <div key={k} className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono" style={{ color: STATUS_STYLE[k].labelColor }}>
                <span>{t.status[k]}</span>
                <span>{m.statusCounts[k]}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(m.statusCounts[k] / maxStatus) * 100}%`, backgroundColor: STATUS_STYLE[k].color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Mapa de calor financeiro: treemap proporcional ao valor             */
/* ------------------------------------------------------------------ */

export function MoneySlide({ graphData, schemeNodes, schemeDetails }: ClassicProps) {
  const { t, locale, href } = useI18n();
  const [boxRef, box] = useElementSize<HTMLDivElement>();
  const data = useMemo(
    () => money(schemeNodes, graphData.links, schemeDetails, locale, t.infographics.amountPending, t.infographics.totalPending),
    [schemeNodes, graphData.links, schemeDetails, locale, t],
  );
  const sized = data.items.filter((i) => i.currency === 'BRL' && i.amount > 0);
  const other = data.items.filter((i) => i.currency !== 'BRL' && i.amount > 0);
  const pending = data.items.filter((i) => i.amount <= 0);

  // Proporção do quadro: larga no computador, alta no celular.
  const tall = box.w > 0 && box.w < 560;
  const W = 100;
  const H = tall ? 150 : 62;
  // A área é proporcional à RAIZ do valor: com o valor puro, um esquema de R$ 6 bi apagaria os de R$ 5 mi.
  const rects = useMemo(() => squarify(sized, (i) => Math.sqrt(i.amount), W, H), [sized, H]);
  const maxAmount = Math.max(...sized.map((i) => i.amount), 1);

  return (
    <div className="space-y-4">
      <SlideHeader
        title={t.infographics.heatmapTitle.replace(/^\d+\.\s*/, '')}
        intro={`${t.infographics.heatmapIntro} ${t.infographics.deck.moneyScale}`}
        icon={<TrendingUp className="w-5 h-5 text-emerald-400 shrink-0" />}
        badge={<span className="shrink-0 text-[11px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-800/50 px-2.5 py-0.5 rounded-sm">{t.infographics.total} {data.formattedGrandTotal}</span>}
      />
      {sized.length === 0 ? (
        <p className="text-xs text-muted italic">{t.infographics.heatmapEmpty}</p>
      ) : (
        <div ref={boxRef} className="relative w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-950" style={{ aspectRatio: `${W} / ${H}` }}>
          {rects.map((r, idx) => {
            const heat = Math.sqrt(r.item.amount / maxAmount); // 0–1
            const pw = (r.w / W) * box.w;
            const ph = (r.h / W) * box.w;
            const big = pw >= 150 && ph >= 110;
            const showLabel = pw >= 84 && ph >= 56;
            const showAmount = pw >= 58 && ph >= 30;
            return (
              <Link
                key={r.item.id}
                href={href(schemePath(r.item.id))}
                title={`${r.item.label} — ${r.item.formatted}`}
                className="absolute p-1.5 sm:p-2.5 flex flex-col justify-between gap-1 overflow-hidden border border-slate-950 transition-[filter,transform] duration-200 hover:brightness-125 hover:z-10 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 animate-in fade-in zoom-in-95 motion-reduce:animate-none"
                style={{
                  left: `${(r.x / W) * 100}%`, top: `${(r.y / H) * 100}%`, width: `${(r.w / W) * 100}%`, height: `${(r.h / H) * 100}%`,
                  background: `linear-gradient(135deg, rgba(16,185,129,${0.1 + heat * 0.5}), rgba(8,145,178,${0.06 + heat * 0.3}))`,
                  animationDelay: `${Math.min(idx, 14) * 35}ms`, animationFillMode: 'backwards',
                }}
              >
                {showLabel && <span className={`font-bold text-white leading-tight ${big ? 'text-sm line-clamp-3' : 'text-[10px] line-clamp-2'}`}>{r.item.label}</span>}
                {showAmount && <span className={`font-mono font-extrabold text-emerald-300 whitespace-nowrap ${big ? 'text-base' : 'text-[10px]'}`}>{r.item.formatted}</span>}
              </Link>
            );
          })}
        </div>
      )}
      {(other.length > 0 || pending.length > 0) && (
        <div className="flex flex-wrap gap-1.5 text-[11px]">
          {other.map((i) => (
            <Link key={i.id} href={href(schemePath(i.id))} className="px-2 py-1 rounded-md border border-slate-700/80 bg-slate-950/60 text-slate-300 hover:border-cyan-400/60">
              {i.label} · <span className="font-mono text-emerald-300">{i.formatted}</span>
            </Link>
          ))}
          {pending.map((i) => (
            <Link key={i.id} href={href(schemePath(i.id))} className="px-2 py-1 rounded-md border border-slate-800 text-muted hover:border-cyan-400/60">
              {i.label} · {t.infographics.amountPending}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
