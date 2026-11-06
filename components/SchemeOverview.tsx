'use client';

/**
 * ============================================================================
 * SCHEMEOVERVIEW — "Visão por esquemas" (visão inicial do grafo)
 * ============================================================================
 * Mostra só os esquemas. Círculo maior = mais entidades ligadas ao esquema;
 * linha mais grossa = mais entidades em comum entre dois esquemas (cálculo em
 * lib/schemeOverview.ts). Serve para ler a "teia" de casos sem o novelo de
 * centenas de nós; o grafo completo continua no botão "Teia completa".
 *
 *  - Clique num esquema → abre o painel de detalhes (mesmo da teia completa).
 *  - Clique numa linha → cartão com as entidades em comum (clicáveis).
 *  - Passar o mouse / selecionar → destaca o esquema e seus vizinhos.
 *  - Opções: contar partidos como "em comum" e mínimo de entidades em comum.
 *
 * Ajustes: tamanho dos círculos → nodeRadius; espessura das linhas →
 * linkWidthPx; distâncias/repulsão → efeito "FÍSICA".
 * ============================================================================
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { forceCollide, forceX, forceY } from 'd3-force';
import { Plus, Minus, X, Network, SlidersHorizontal, ChevronUp } from 'lucide-react';
import type { GraphData, GraphNode } from '@/types/graph';
import { NODE_STYLE, entityChipStyle } from '@/lib/graphConfig';
import { NODE_ICONS } from '@/lib/nodeIcons';
import { computeSchemeOverview, type OverviewLink, type OverviewNode } from '@/lib/schemeOverview';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

interface SchemeOverviewProps {
  graphRef: React.MutableRefObject<any>;
  data: GraphData;
  selectedNode: GraphNode | null;
  onSelectNode: (node: GraphNode) => void;
  /** Abre a teia completa (com o esquema selecionado, se houver). */
  onOpenFullGraph: () => void;
  paused?: boolean;
}

const BG_COLOR = '#080d16';
const SCHEME = NODE_STYLE.scheme;
const MOBILE_BREAKPOINT = 768;

/** Raio (unidades do grafo): base + proporcional à raiz do nº de entidades. */
const nodeRadius = (n: OverviewNode) => 14 + 6 * Math.sqrt(n.entityCount);
/** Espessura da linha em px de tela, pelo nº de entidades em comum. */
const linkWidthPx = (l: OverviewLink) => Math.min(10, 1 + l.weight * 1.2);

/** Limiares oferecidos em "Mínimo em comum". */
const THRESHOLDS = [1, 2, 3, 5];
/**
 * "auto": escolhe o menor limiar que deixa no máximo AUTO_MAX_LINKS_PER_NODE
 * linhas por esquema (em média). ↑ mais linhas visíveis; ↓ visão mais limpa.
 */
const AUTO_MAX_LINKS_PER_NODE = 2.5;

/** Zoom máximo do enquadramento automático ("recentralizar" e ao abrir). */
const FIT_MAX_ZOOM = 1.2;

const LABEL_PX = 12;
const LABEL_PX_MOBILE = 10;
const LABEL_MAX_WIDTH_PX = 150;
const LABEL_MAX_WIDTH_PX_MOBILE = 110;
const LABEL_MAX_LINES = 3;

const endId = (e: string | OverviewNode) => (typeof e === 'object' ? e.id : e);

function wrap(ctx: CanvasRenderingContext2D, text: string, maxLines: number, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const cand = cur ? `${cur} ${w}` : w;
    if (!cur || ctx.measureText(cand).width <= maxWidth) cur = cand;
    else {
      lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  if (lines.length <= maxLines) return lines;
  const kept = lines.slice(0, maxLines);
  kept[maxLines - 1] = `${kept[maxLines - 1].replace(/\s+\S*$/, '')}…`;
  return kept;
}

export default function SchemeOverview({
  graphRef,
  data,
  selectedNode,
  onSelectNode,
  onOpenFullGraph,
  paused = false,
}: SchemeOverviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ width: 800, height: 600 });
  const isMobile = dims.width < MOBILE_BREAKPOINT;
  const [graphReady, setGraphReady] = useState(false);
  const setInstance = useCallback(
    (inst: any) => {
      graphRef.current = inst;
      setGraphReady(!!inst);
    },
    [graphRef]
  );

  const [countParties, setCountParties] = useState(false);
  const [minSharedChoice, setMinSharedChoice] = useState<'auto' | number>('auto');
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [selectedPair, setSelectedPair] = useState<OverviewLink | null>(null);
  // Painel de opções: aberto no desktop, fechado no celular (não cobre o grafo).
  const [optionsOpen, setOptionsOpen] = useState(true);
  useEffect(() => {
    if (window.innerWidth < MOBILE_BREAKPOINT) setOptionsOpen(false);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setDims({ width: el.clientWidth, height: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* DADOS — reaproveita os objetos de nó entre recálculos para manter as
     posições quando um filtro muda (os círculos não "pulam" de lugar). */
  const nodeCache = useRef(new Map<string, OverviewNode>());
  // Limiar efetivo: o escolhido, ou no modo "auto" o menor que não passa de
  // AUTO_MAX_LINKS_PER_NODE linhas por esquema.
  const minShared = useMemo(() => {
    if (minSharedChoice !== 'auto') return minSharedChoice;
    const all = computeSchemeOverview(data, { countParties, minShared: 1 });
    const limit = Math.max(1, all.nodes.length) * AUTO_MAX_LINKS_PER_NODE;
    return THRESHOLDS.find((t) => all.links.filter((l) => l.direct || l.shared.length >= t).length <= limit) ?? THRESHOLDS[THRESHOLDS.length - 1];
  }, [minSharedChoice, data, countParties]);

  const overview = useMemo(() => {
    const { nodes, links } = computeSchemeOverview(data, { countParties, minShared });
    const merged = nodes.map((n) => {
      const prev = nodeCache.current.get(n.id);
      if (prev) {
        prev.scheme = n.scheme;
        prev.entityCount = n.entityCount;
        prev.degree = n.degree;
        return prev;
      }
      nodeCache.current.set(n.id, n);
      return n;
    });
    return { nodes: merged, links };
  }, [data, countParties, minShared]);

  // O cartão de "em comum" some se o par deixar de existir (filtros).
  useEffect(() => {
    if (!selectedPair) return;
    const a = endId(selectedPair.source);
    const b = endId(selectedPair.target);
    const still = overview.links.find((l) => {
      const s = endId(l.source);
      const t = endId(l.target);
      return (s === a && t === b) || (s === b && t === a);
    });
    setSelectedPair(still ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overview]);

  const maxWeight = useMemo(() => Math.max(1, ...overview.links.map((l) => l.weight)), [overview.links]);

  /* FOCO — esquema sob o mouse (ou o selecionado) e seus vizinhos. */
  const focusId = hoverId ?? (selectedNode?.type === 'scheme' ? selectedNode.id : null);
  const neighbours = useMemo(() => {
    const set = new Set<string>();
    if (!focusId) return set;
    overview.links.forEach((l) => {
      const s = endId(l.source);
      const t = endId(l.target);
      if (s === focusId) set.add(t);
      if (t === focusId) set.add(s);
    });
    return set;
  }, [focusId, overview.links]);
  const isDimmed = (id: string) => !!focusId && id !== focusId && !neighbours.has(id);

  /* FÍSICA — esquemas que compartilham mais ficam mais perto.
     A repulsão tem alcance limitado (distanceMax) e uma atração leve ao centro
     (forceX/forceY) segura os esquemas sem ligação por perto; sem isso eles
     eram empurrados para longe e o enquadramento encolhia tudo. A colisão
     reserva espaço para o rótulo embaixo do círculo. */
  useEffect(() => {
    const fg = graphRef.current;
    if (!fg) return;
    fg.d3Force('link')
      ?.distance((l: OverviewLink) => 110 + 220 / Math.sqrt(l.weight || 1))
      .strength((l: OverviewLink) => Math.min(0.9, 0.1 + 0.08 * l.weight));
    fg.d3Force('charge')?.strength(-420).distanceMax(900);
    fg.d3Force('x', forceX(0).strength(0.06));
    fg.d3Force('y', forceY(0).strength(0.06));
    fg.d3Force('collide', forceCollide((n: OverviewNode) => nodeRadius(n) + 55).iterations(2));
    fg.d3ReheatSimulation();
  }, [graphReady, overview, graphRef]);

  useEffect(() => {
    const fg = graphRef.current;
    if (!fg) return;
    if (paused) fg.pauseAnimation?.();
    else fg.resumeAnimation?.();
  }, [paused, graphReady, graphRef]);

  /* CÂMERA — enquadra ao abrir e quando o conjunto de esquemas muda.
     Com poucos esquemas visíveis (ex.: linha do tempo no ano atual), o
     enquadramento automático daria um zoom enorme num círculo só; FIT_MAX_ZOOM
     limita esse zoom automático (o usuário ainda pode aproximar à vontade). */
  const fitPadding = isMobile ? 24 : 70;
  const userMovedRef = useRef(false);
  const fit = useCallback(
    (ms: number) => {
      const fg = graphRef.current;
      if (!fg) return;
      fg.zoomToFit(ms, fitPadding);
      setTimeout(() => {
        const z = graphRef.current?.zoom?.();
        if (typeof z === 'number' && z > FIT_MAX_ZOOM) graphRef.current.zoom(FIT_MAX_ZOOM, 300);
      }, ms + 30);
    },
    [graphRef, fitPadding]
  );
  useEffect(() => {
    userMovedRef.current = false;
    const t = setTimeout(() => fit(400), 600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graphReady, overview.nodes.length]);

  // Esquema escolhido no Índice da barra lateral → centraliza nele.
  useEffect(() => {
    if (selectedNode?.type !== 'scheme') return;
    const n = nodeCache.current.get(selectedNode.id);
    if (n && typeof n.x === 'number' && typeof n.y === 'number') graphRef.current?.centerAt(n.x, n.y, 600);
  }, [selectedNode, graphRef]);

  /* DESENHO */
  const drawNode = useCallback(
    (node: OverviewNode, ctx: CanvasRenderingContext2D, scale: number) => {
      const r = nodeRadius(node);
      const selected = selectedNode?.id === node.id;
      const dim = isDimmed(node.id);
      ctx.save();
      ctx.globalAlpha = dim ? 0.25 : 1;
      ctx.beginPath();
      ctx.arc(node.x!, node.y!, r + 10, 0, 2 * Math.PI);
      ctx.fillStyle = `${SCHEME.color}${selected || node.id === focusId ? '44' : '18'}`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(node.x!, node.y!, r, 0, 2 * Math.PI);
      ctx.fillStyle = BG_COLOR;
      ctx.fill();
      ctx.lineWidth = (selected ? 4 : 2.5) / scale;
      ctx.strokeStyle = selected ? '#ffffff' : SCHEME.color;
      ctx.stroke();
      // Nº de entidades dentro do círculo, quando ele é grande o bastante na tela.
      if (r * scale >= 12) {
        ctx.font = `700 ${12 / scale}px Inter, system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = SCHEME.labelColor;
        ctx.fillText(String(node.entityCount), node.x!, node.y!);
      }
      ctx.restore();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedNode, focusId, neighbours]
  );

  const paintPointer = useCallback((node: OverviewNode, color: string, ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(node.x!, node.y!, nodeRadius(node) + 10, 0, 2 * Math.PI);
    ctx.fill();
  }, []);

  const drawLink = useCallback(
    (link: any, ctx: CanvasRenderingContext2D, scale: number) => {
      const s = link.source as OverviewNode;
      const t = link.target as OverviewNode;
      if (typeof s.x !== 'number' || typeof t.x !== 'number') return;
      const isPair =
        !!selectedPair &&
        ((endId(selectedPair.source) === s.id && endId(selectedPair.target) === t.id) ||
          (endId(selectedPair.source) === t.id && endId(selectedPair.target) === s.id));
      const touchesFocus = !!focusId && (s.id === focusId || t.id === focusId);
      // Contraste RELATIVO ao link mais forte visível: com dados esparsos
      // (quase tudo com 1 em comum, como no banco real) as linhas continuam
      // bem visíveis; com dados densos, as fracas recuam.
      const rel = maxWeight > 1 ? (link.weight - 1) / (maxWeight - 1) : 1;
      const base = 0.3 + 0.5 * rel;
      const alpha = isPair ? 0.95 : focusId ? (touchesFocus ? 0.9 : 0.05) : base;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(s.x, s.y!);
      ctx.lineTo(t.x, t.y!);
      ctx.strokeStyle = isPair ? `rgba(236,254,255,${alpha})` : `rgba(255,92,224,${alpha})`;
      ctx.lineWidth = (linkWidthPx(link) + (isPair ? 2 : 0)) / scale;
      if (link.direct && link.shared.length === 0) ctx.setLineDash([8 / scale, 6 / scale]);
      ctx.stroke();
      ctx.restore();
    },
    [selectedPair, focusId, maxWeight]
  );

  /* RÓTULOS — desenhados por ordem de importância (selecionado, em foco e
     vizinhos, depois os maiores esquemas). Um rótulo que encostaria num já
     desenhado é pulado; ao aproximar o zoom, há espaço e ele aparece. Assim
     os nomes nunca se sobrepõem, nem no celular. */
  const labelCache = useRef(new Map<string, string[]>());
  const drawLabels = useCallback(
    (ctx: CanvasRenderingContext2D, scale: number) => {
      const priority = (n: OverviewNode) =>
        (selectedNode?.id === n.id ? 3e6 : 0) + (n.id === focusId ? 2e6 : 0) + (neighbours.has(n.id) ? 1e6 : 0) + n.entityCount;
      const ordered = overview.nodes.filter((n) => typeof n.x === 'number').sort((a, b) => priority(b) - priority(a));
      const gap = 4 / scale;
      const labelPx = isMobile ? LABEL_PX_MOBILE : LABEL_PX;
      const maxW = isMobile ? LABEL_MAX_WIDTH_PX_MOBILE : LABEL_MAX_WIDTH_PX;
      // Os próprios círculos já contam como ocupados: um rótulo não cobre outro esquema.
      const placed: { x0: number; y0: number; x1: number; y1: number; owner?: string }[] = ordered.map((n) => {
        const r = nodeRadius(n) + 2 / scale;
        return { x0: n.x! - r, x1: n.x! + r, y0: n.y! - r, y1: n.y! + r, owner: n.id };
      });

      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.lineJoin = 'round';
      for (const node of ordered) {
        const selected = selectedNode?.id === node.id;
        const text = node.scheme.label.toUpperCase();
        const key = `${selected}|${labelPx}|${text}`;
        ctx.font = `600 ${labelPx}px Inter, system-ui, sans-serif`;
        let lines = labelCache.current.get(key);
        if (!lines) {
          lines = wrap(ctx, text, selected ? 99 : LABEL_MAX_LINES, maxW);
          labelCache.current.set(key, lines);
        }
        const widthPx = Math.max(...lines.map((l) => ctx.measureText(l).width));
        const fs = labelPx / scale;
        const y = node.y! + nodeRadius(node) + 8 / scale;
        const box = {
          x0: node.x! - widthPx / 2 / scale - gap,
          x1: node.x! + widthPx / 2 / scale + gap,
          y0: y - gap,
          y1: y + lines.length * fs * 1.2 + gap,
        };
        const collides = placed.some(
          (b) => b.owner !== node.id && box.x0 < b.x1 && box.x1 > b.x0 && box.y0 < b.y1 && box.y1 > b.y0
        );
        if (collides && !selected) continue;
        placed.push(box);

        ctx.globalAlpha = isDimmed(node.id) ? 0.25 : 1;
        ctx.font = `${selected ? 700 : 600} ${fs}px Inter, system-ui, sans-serif`;
        ctx.lineWidth = 4 / scale;
        ctx.strokeStyle = BG_COLOR;
        ctx.fillStyle = selected ? '#ffffff' : SCHEME.labelColor;
        lines.forEach((line, i) => {
          ctx.strokeText(line, node.x!, y + i * fs * 1.2);
          ctx.fillText(line, node.x!, y + i * fs * 1.2);
        });
      }
      ctx.restore();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [overview.nodes, selectedNode, focusId, neighbours, isMobile]
  );

  const pairA = selectedPair ? (selectedPair.source as OverviewNode) : null;
  const pairB = selectedPair ? (selectedPair.target as OverviewNode) : null;

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <ForceGraph2D
        ref={setInstance as any}
        width={dims.width}
        height={dims.height}
        graphData={overview as any}
        nodeId="id"
        nodeRelSize={1}
        nodeVal={(n: any) => nodeRadius(n) ** 2}
        nodeCanvasObject={drawNode as any}
        nodePointerAreaPaint={paintPointer as any}
        linkCanvasObjectMode={() => 'replace'}
        linkCanvasObject={drawLink}
        linkWidth={(l: any) => linkWidthPx(l) + 6}
        linkLabel={(l: any) =>
          `${(l.source as OverviewNode).scheme.label} ↔ ${(l.target as OverviewNode).scheme.label}: ${
            l.shared.length
          } em comum`
        }
        nodeLabel={() => ''}
        onRenderFramePost={drawLabels}
        onNodeHover={(n: any) => setHoverId(n ? n.id : null)}
        onNodeClick={(n: any) => {
          setSelectedPair(null);
          onSelectNode((n as OverviewNode).scheme);
        }}
        onLinkClick={(l: any) => setSelectedPair(l)}
        onBackgroundClick={() => setSelectedPair(null)}
        onZoom={() => {
          userMovedRef.current = true;
        }}
        onEngineStop={() => {
          if (!userMovedRef.current) fit(400);
        }}
        warmupTicks={150}
        cooldownTime={3500}
        d3AlphaDecay={0.035}
        d3VelocityDecay={0.4}
        backgroundColor={BG_COLOR}
      />

      {/* OPÇÕES + LEGENDA (recolhível) */}
      <div className="absolute top-16 left-3 md:top-4 md:left-auto md:right-6 z-20 w-60 bg-[#0e1726]/90 backdrop-blur-md border border-slate-800 rounded-lg text-[11px] font-mono text-slate-300 shadow-2xl select-none">
        <button
          type="button"
          onClick={() => setOptionsOpen((o) => !o)}
          aria-expanded={optionsOpen}
          className="w-full flex items-center justify-between gap-2 px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider"
        >
          <span className="flex items-center gap-1.5">
            <SlidersHorizontal size={16} className="w-4 h-4 text-cyan-400" aria-hidden="true" />
            Visão por esquemas
          </span>
          <ChevronUp size={16} className={`w-4 h-4 transition-transform ${optionsOpen ? '' : 'rotate-180'}`} aria-hidden="true" />
        </button>
        {optionsOpen && (
          <div className="px-3 pb-3 space-y-2">
            <p className="font-sans text-slate-400 leading-snug">
              Círculo = nº de entidades do esquema. Linha = entidades em comum entre dois esquemas (mais grossa, mais em
              comum). Clique numa linha para ver quem.
            </p>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={countParties}
                onChange={(e) => setCountParties(e.target.checked)}
                className="accent-cyan-400"
              />
              Contar partidos em comum
            </label>
            <label className="flex items-center justify-between gap-2">
              <span>Mínimo em comum</span>
              <select
                value={String(minSharedChoice)}
                onChange={(e) => setMinSharedChoice(e.target.value === 'auto' ? 'auto' : Number(e.target.value))}
                className="bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-slate-200"
              >
                <option value="auto">auto ({minShared})</option>
                {THRESHOLDS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
            <div className="text-slate-500">
              {overview.nodes.length} esquemas · {overview.links.length} ligações
            </div>
          </div>
        )}
      </div>

      {/* CARTÃO: entidades em comum na linha clicada */}
      {selectedPair && pairA && pairB && (
        <div className="absolute z-30 left-3 right-3 bottom-24 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-[36rem] max-h-[45%] overflow-y-auto bg-[#0e1726]/95 backdrop-blur-md border border-slate-700 rounded-xl p-4 shadow-2xl">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="text-sm font-semibold text-slate-100 leading-snug">
              <button className="hover:text-cyan-300 hover:underline text-left" onClick={() => onSelectNode(pairA.scheme)}>
                {pairA.scheme.label}
              </button>
              <span className="text-slate-500"> ↔ </span>
              <button className="hover:text-cyan-300 hover:underline text-left" onClick={() => onSelectNode(pairB.scheme)}>
                {pairB.scheme.label}
              </button>
              <div className="mt-0.5 text-[11px] font-mono font-normal text-slate-400">
                {selectedPair.shared.length > 0
                  ? `${selectedPair.shared.length} ${selectedPair.shared.length === 1 ? 'entidade' : 'entidades'} em comum`
                  : 'Ligação direta entre os esquemas no banco'}
              </div>
            </div>
            <button
              onClick={() => setSelectedPair(null)}
              aria-label="Fechar"
              className="shrink-0 p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800"
            >
              <X size={16} className="w-4 h-4" />
            </button>
          </div>
          {selectedPair.shared.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {selectedPair.shared.map((e) => {
                const Icon = NODE_ICONS[e.type];
                return (
                  <li key={e.id}>
                    <button
                      onClick={() => onSelectNode(e)}
                      className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md border font-medium hover:brightness-125"
                      style={entityChipStyle(e.type)}
                      title={NODE_STYLE[e.type]?.label}
                    >
                      {Icon && <Icon size={16} className="w-4 h-4 shrink-0" aria-hidden="true" />}
                      {e.label} {e.party && e.type === 'politician' ? `(${e.party})` : ''}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {/* CONTROLES DE CÂMERA (mesma posição/estilo da teia completa) */}
      <div className="absolute bottom-6 left-4 md:left-6 flex items-center space-x-1.5 bg-[#0e1726]/95 backdrop-blur-md border border-slate-800 rounded-lg p-1.5 z-20 shadow-xl select-none">
        <button
          onClick={() => graphRef.current?.zoom(graphRef.current.zoom() * 1.2, 400)}
          className="p-2 md:p-1.5 hover:bg-slate-800 text-slate-300 rounded"
          aria-label="Aproximar"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={() => graphRef.current?.zoom(graphRef.current.zoom() / 1.2, 400)}
          className="p-2 md:p-1.5 hover:bg-slate-800 text-slate-300 rounded"
          aria-label="Afastar"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={() => fit(400)}
          className="px-2.5 py-1.5 md:py-1 hover:bg-slate-800 text-slate-300 text-xs font-mono rounded"
        >
          recentralizar
        </button>
        {selectedNode?.type === 'scheme' && (
          <button
            onClick={onOpenFullGraph}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 md:py-1 hover:bg-slate-800 text-cyan-400 text-xs font-mono rounded"
            aria-label="Ver na teia completa"
            title="Ver na teia completa"
          >
            <Network size={16} className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">ver na teia completa</span>
          </button>
        )}
      </div>
    </div>
  );
}
