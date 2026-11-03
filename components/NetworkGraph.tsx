'use client';

import React, { useCallback, useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Plus, Minus, Maximize, Scale, ShieldCheck, Info, FileText, ChevronUp } from 'lucide-react';
import { forceCollide } from 'd3-force';
import { GraphData, GraphNode, GraphLink, NodeType, LinkStatus } from '@/types/graph';
import { NODE_STYLE, STATUS_STYLE, FALLBACK_COLOR, getNodeRadius, getLinkKey } from '@/lib/graphConfig';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

interface NetworkGraphProps {
  graphRef: React.MutableRefObject<any>;
  graphData: GraphData;
  selectedNode: GraphNode | null;
  selectedLink: GraphLink | null;
  onSelectNode: (node: GraphNode) => void;
  onSelectLink: (link: GraphLink) => void;
}

const MOBILE_BREAKPOINT = 768;
// Extra invisible ring around each bubble that still counts as a click.
const CLICK_PADDING = 15;

const statusColor = (status: string) => STATUS_STYLE[status as LinkStatus]?.color ?? FALLBACK_COLOR;

export default function NetworkGraph({
  graphRef,
  graphData,
  selectedNode,
  selectedLink,
  onSelectNode,
  onSelectLink,
}: NetworkGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const isMobile = dimensions.width < MOBILE_BREAKPOINT;

  // Image cache + in-flight set, so filtering doesn't re-request images that
  // are still downloading (the old code only cached on load).
  const imgCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const pendingRef = useRef<Set<string>>(new Set());
  const hasInitialFitRef = useRef(false);

  // ForceGraph2D is loaded lazily, so graphRef.current can still be null when
  // effects first run. A callback ref + state lets the physics effect re-run
  // as soon as the instance actually exists.
  const [graphReady, setGraphReady] = useState(false);
  const setGraphInstance = useCallback((instance: any) => {
    graphRef.current = instance;
    setGraphReady(!!instance);
  }, [graphRef]);

  // REMOVED: the "detangling" effect that called fg.tickFrame() 150× and
  // fg.d3AlphaTarget(). Neither method is exposed by react-force-graph-2d's
  // ref (its methodNames list doesn't include them), so the loop was a no-op;
  // the only thing it actually did was zoomToFit(0) on *every* filter change /
  // keystroke. `warmupTicks` already pre-computes the layout before first paint.

  // 1. Responsive canvas size
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const updateSize = () => setDimensions({ width: el.clientWidth, height: el.clientHeight });
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Refit the camera once when the visible set changes size.
  useEffect(() => {
    hasInitialFitRef.current = false;
  }, [graphData.nodes.length]);

  // 2. Image preloading
  useEffect(() => {
    const urls = Array.from(new Set(graphData.nodes.map((n) => n.image_url).filter((u): u is string => !!u)));
    urls.forEach((url) => {
      if (imgCacheRef.current.has(url) || pendingRef.current.has(url)) return;
      pendingRef.current.add(url);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        pendingRef.current.delete(url);
        imgCacheRef.current.set(url, img);
        // Nudge a repaint; the canvas may be idle after the engine stopped.
        graphRef.current?.d3ReheatSimulation?.();
      };
      img.onerror = () => pendingRef.current.delete(url);
      img.src = url;
    });
  }, [graphData.nodes, graphRef]);

  // 3. d3 physics. Collision radius is derived from the SAME radius used for
  //    drawing, instead of separate hard-coded tables (300/150/100 vs 100/70/40).
  useEffect(() => {
    const fg = graphRef.current;
    if (!fg) return;

    fg.d3Force('charge')?.strength((node: any) =>
      node.type === 'scheme' ? (isMobile ? -900 : -1200) : (isMobile ? -1200 : -600)
    );
    fg.d3Force('link')?.distance(isMobile ? 400 : 500).strength(0.3);
    fg.d3Force(
      'collide',
      forceCollide().radius((node: any) => getNodeRadius(node.type) * 1.6).strength(1)
    );
    // The library centres the graph at (0,0); the old code moved the centre
    // force to (width/2, height/2), pushing the layout off-origin.
    fg.d3ReheatSimulation();
  }, [graphReady, isMobile, graphData, graphRef]);

  // 4. Fit the camera once per data set, when the simulation settles.
  const handleEngineStop = useCallback(() => {
    const fg = graphRef.current;
    if (!fg || hasInitialFitRef.current) return;
    hasInitialFitRef.current = true;
    fg.zoomToFit(400, isMobile ? 20 : 60);
    if (isMobile) {
      setTimeout(() => {
        if (graphRef.current && graphRef.current.zoom() < 0.65) graphRef.current.zoom(0.75, 300);
      }, 450);
    }
  }, [graphRef, isMobile]);

  // 5. Node renderer
  const drawNode = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const isSelected = selectedNode?.id === node.id;
    const style = NODE_STYLE[node.type as NodeType];
    const color = style?.color ?? '#00f0ff';
    const size = getNodeRadius(node.type);

    ctx.save();

    // Outer glow
    ctx.beginPath();
    ctx.arc(node.x, node.y, size + 8, 0, 2 * Math.PI);
    ctx.fillStyle = `${color}${isSelected ? '44' : '18'}`;
    ctx.fill();

    // Inner disc (fill first, then stroke on top so the border isn't painted over)
    ctx.beginPath();
    ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
    ctx.fillStyle = '#080d16';
    ctx.fill();

    if (node.image_url) {
      const img = imgCacheRef.current.get(node.image_url);
      if (img && img.naturalWidth > 0) {
        ctx.save();
        ctx.clip();
        ctx.drawImage(img, node.x - size, node.y - size, size * 2, size * 2);
        ctx.restore();
      }
    }

    ctx.strokeStyle = color;
    ctx.lineWidth = (isSelected ? 3 : 1.8) / globalScale;
    ctx.stroke();

    // Labels with zoom-dependent level of detail
    const showLabel =
      isSelected ||
      node.type === 'scheme' ||
      ((node.type === 'party' || node.type === 'company') && globalScale >= 0.3) ||
      ((node.type === 'politician' || node.type === 'operator') && globalScale >= 0.5);

    if (showLabel) {
      const isScheme = node.type === 'scheme';
      const fontSize = isScheme ? Math.max(12, 13 / globalScale) : Math.max(10, 11 / globalScale);
      const fontWeight = isSelected ? '700' : isScheme || node.type === 'party' ? '600' : '500';
      const label = isScheme ? String(node.label ?? '').toUpperCase() : String(node.label ?? '');

      ctx.font = `${fontWeight} ${fontSize}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      // Fix: selected politicians used to get #000000 text on a #080d16 background.
      ctx.fillStyle = isSelected ? '#ffffff' : style?.labelColor ?? '#cbd5e1';

      const labelY = node.y + size + 8 / globalScale;
      ctx.fillText(label, node.x, labelY);

      if (node.type === 'politician' && node.party && globalScale >= 1.3) {
        ctx.font = `400 ${Math.max(9, 10 / globalScale)}px Inter, sans-serif`;
        ctx.fillStyle = isSelected ? '#e0f2fe' : '#94a3b8';
        ctx.fillText(`(${node.party})`, node.x, labelY + fontSize + 2 / globalScale);
      }
    }

    ctx.restore();
  }, [selectedNode]);

  // Hit area now matches the drawn radius (it used to be 50/30/15 + 15,
  // so the outer ring of every bubble ignored clicks).
  const paintPointerArea = useCallback((node: any, color: string, ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(node.x, node.y, getNodeRadius(node.type) + CLICK_PADDING, 0, 2 * Math.PI);
    ctx.fill();
  }, []);

  const selectedLinkKey = selectedLink ? getLinkKey(selectedLink) : null;

  const drawLink = useCallback((link: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const start = link.source;
    const end = link.target;
    if (typeof start !== 'object' || typeof end !== 'object' || typeof start.x !== 'number' || typeof end.x !== 'number') return;

    const color = statusColor(link.status);
    // Compare by a derived key: if the table has no id column, `undefined === undefined`
    // used to mark every link as selected.
    const isSelected = selectedLinkKey !== null && getLinkKey(link) === selectedLinkKey;
    const baseWidth = isSelected ? 8 : 4;
    const safeScale = globalScale > 0 ? globalScale : 1;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);

    ctx.strokeStyle = `${color}44`;
    ctx.lineWidth = baseWidth + 2 / safeScale;
    ctx.stroke();

    ctx.strokeStyle = color;
    ctx.lineWidth = baseWidth;
    ctx.setLineDash(link.status === 'under_investigation' ? [4, 4] : []);
    ctx.stroke();
    ctx.restore();
  }, [selectedLinkKey]);

  const toggleFullscreen = () => {
    // requestFullscreen is missing on iOS Safari and returns a rejecting promise elsewhere.
    const doc = document as Document & { webkitFullscreenElement?: Element };
    if (!document.fullscreenElement && !doc.webkitFullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-full flex-1 bg-[#080d16] overflow-hidden">
      <ForceGraph2D
        // The lib types `ref` as a MutableRefObject, but callback refs work at runtime.
        ref={setGraphInstance as any}
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData as any}
        nodeCanvasObject={drawNode}
        nodePointerAreaPaint={paintPointerArea}
        linkCanvasObjectMode={() => 'replace'}
        linkCanvasObject={drawLink}
        // In 'replace' mode linkColor/linkLineDash are ignored (removed as dead props);
        // linkWidth still defines the click hit-area, so match the drawn width.
        linkWidth={(link: any) => (selectedLinkKey !== null && getLinkKey(link) === selectedLinkKey ? 8 : 4)}
        linkDirectionalParticles={(link: any) => (link.status === 'under_investigation' ? 3 : 0)}
        linkDirectionalParticleSpeed={0.005}
        linkDirectionalParticleWidth={5}
        linkDirectionalParticleColor={(link: any) => statusColor(link.status)}
        onNodeClick={(node: any) => onSelectNode(node)}
        onLinkClick={(link: any) => onSelectLink(link)}
        onEngineStop={handleEngineStop}
        warmupTicks={120}
        cooldownTicks={150}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
        backgroundColor="#080d16"
      />

      {/* Legends generated from the shared config, so they can't drift from the canvas colors */}
      <div className="absolute top-4 right-6 hidden sm:block space-y-3 z-20 select-none">
        <div className="bg-[#0e1726]/90 backdrop-blur-md border border-slate-800 rounded-lg p-3 text-[11px] space-y-2 font-mono shadow-2xl">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Legenda das Conexões</div>
          {(Object.keys(STATUS_STYLE) as LinkStatus[]).map((key) => (
            <div key={key} className="flex items-center space-x-2.5">
              {key === 'under_investigation' ? (
                <span className="w-5 h-0 border-b-2 border-dashed inline-block" style={{ borderColor: STATUS_STYLE[key].color }} />
              ) : (
                <span
                  className="w-5 h-0.5 inline-block rounded-full"
                  style={{ backgroundColor: STATUS_STYLE[key].color, boxShadow: `0 0 8px ${STATUS_STYLE[key].color}` }}
                />
              )}
              <span className="text-slate-200">{STATUS_STYLE[key].label}</span>
            </div>
          ))}
        </div>

        <div className="bg-[#0e1726]/90 backdrop-blur-md border border-slate-800 rounded-lg p-3 text-[11px] space-y-2 font-mono shadow-2xl">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Legenda dos Círculos</div>
          {(Object.keys(NODE_STYLE) as NodeType[]).map((key) => (
            <div key={key} className="flex items-center space-x-2.5">
              <span
                className="w-2.5 h-2.5 inline-block rounded-full border"
                style={{ borderColor: NODE_STYLE[key].color, boxShadow: `0 0 8px ${NODE_STYLE[key].color}` }}
              />
              <span className="text-slate-200">{NODE_STYLE[key].label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Camera controls */}
      <div className="absolute bottom-6 left-4 md:left-6 flex items-center space-x-1.5 bg-[#0e1726]/95 backdrop-blur-md border border-slate-800 rounded-lg p-1.5 z-20 shadow-xl select-none">
        <button
          onClick={() => graphRef.current?.zoom(graphRef.current.zoom() * 1.2, 400)}
          className="p-2 md:p-1.5 hover:bg-slate-800 active:bg-slate-700 text-slate-300 rounded transition-colors"
          aria-label="Aproximar"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={() => graphRef.current?.zoom(graphRef.current.zoom() / 1.2, 400)}
          className="p-2 md:p-1.5 hover:bg-slate-800 active:bg-slate-700 text-slate-300 rounded transition-colors"
          aria-label="Afastar"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={() => graphRef.current?.zoomToFit(400, isMobile ? 20 : 50)}
          className="px-2.5 py-1.5 md:py-1 hover:bg-slate-800 active:bg-slate-700 text-slate-300 text-xs font-mono rounded transition-colors"
        >
          recentralizar
        </button>
        <button
          onClick={toggleFullscreen}
          className="p-2 md:p-1.5 hover:bg-slate-800 active:bg-slate-700 text-slate-300 rounded transition-colors"
          aria-label="Tela cheia"
        >
          <Maximize className="w-4 h-4" />
        </button>
      </div>

      {/* Legal menu — opens on hover AND keyboard/touch focus (focus-within) */}
      <div className="absolute bottom-16 md:bottom-6 right-4 md:right-6 z-20 group">
        <div className="absolute bottom-full right-0 mb-2 w-48 bg-[#0e1726]/95 backdrop-blur-md border border-slate-800 rounded-lg p-2 shadow-2xl opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:translate-y-0 group-focus-within:pointer-events-auto transition-all duration-200 flex flex-col space-y-1 text-xs">
          <div className="px-2 py-1 text-[10px] font-mono text-slate-500 uppercase tracking-wider border-b border-slate-800/80 mb-1">
            Informações Legais
          </div>
          <Link href="/about" className="flex items-center space-x-2 px-2 py-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-cyan-400 transition-colors">
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>Sobre nós</span>
          </Link>
          <Link href="/privacy" className="flex items-center space-x-2 px-2 py-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-cyan-400 transition-colors">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Política de privacidade</span>
          </Link>
          <Link href="/terms" className="flex items-center space-x-2 px-2 py-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-cyan-400 transition-colors">
            <Scale className="w-3.5 h-3.5 text-cyan-400" />
            <span>Termos de serviço</span>
          </Link>
        </div>

        <button
          className="flex items-center space-x-2 bg-[#0e1726]/95 backdrop-blur-md border border-slate-800 rounded-lg px-3 py-2 md:py-1.5 text-xs text-slate-300 hover:text-cyan-400 hover:border-slate-700/80 shadow-xl transition-all cursor-pointer select-none"
          aria-label="Menu de páginas legais"
          aria-haspopup="true"
        >
          <FileText className="w-4 h-4 text-cyan-400" />
          <span className="font-mono text-xs hidden sm:inline">Termos & Política</span>
          <ChevronUp className="w-3.5 h-3.5 text-slate-400 group-hover:rotate-180 group-focus-within:rotate-180 transition-transform duration-200" />
        </button>
      </div>
    </div>
  );
}
