'use client';

import React, { useCallback, useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Plus, Minus, Maximize } from 'lucide-react';
import { forceCollide } from 'd3-force';
import { GraphData, GraphNode, GraphLink } from '@/types/graph';
import Link from 'next/link';
import { Scale, ShieldCheck, Info, FileText, ChevronUp } from 'lucide-react';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

interface NetworkGraphProps {
  graphRef: any;
  graphData: GraphData;
  selectedNode: GraphNode | null;
  selectedLink: GraphLink | null;
  onSelectNode: (node: GraphNode) => void;
  onSelectLink: (link: GraphLink) => void;
  onGraphReady?: () => void;
}

const COLOR_MAP = {
  scheme: '#ff00c8',     // Magenta para Esquemas
  politician: '#00eeff', // Ciano para Políticos
  company: '#878787',    // Cinza para Empresas
  operator: '#ffffff',   // White para Operadores
  party: '#0400ff'       // Azul para Partidos
};

const STATUS_COLORS: Record<string, string> = {
  confirmed: '#b1003b',
  under_investigation: '#f59e0b',
  acquitted: '#10b981'
};

export default function NetworkGraph({
  graphRef,
  graphData,
  selectedNode,
  selectedLink,
  onSelectNode,
  onSelectLink,
  onGraphReady
}: NetworkGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 800, height: 600 });

  const imgCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const [, setImagesLoaded] = useState<boolean>(false);

  useEffect(() => {
    if (graphRef.current && graphData.nodes.length > 0) {
      const fg = graphRef.current;

      // 1. Temporarily boost physics energy
      if (typeof fg.d3AlphaTarget === 'function') {
        fg.d3AlphaTarget(0.3);
      }

      // 2. Synchronously advance physics ticks (simulates time passing rapidly)
      // This forces nodes to push apart before drawing to screen
      for (let i = 0; i < 150; i++) {
        if (typeof fg.tickFrame === 'function') {
          fg.tickFrame();
        }
      }

      // 3. Reset alpha energy back to equilibrium
      if (typeof fg.d3AlphaTarget === 'function') {
        fg.d3AlphaTarget(0);
      }

      // 4. Fit view to updated coordinates
      if (typeof fg.zoomToFit === 'function') {
        const isMobile = dimensions.width < 768;
        fg.zoomToFit(0, isMobile ? 20 : 60); // 0ms duration for instant snap
      }

      // 5. Signal to page.tsx that background detangling is finished
      if (onGraphReady) {
        onGraphReady();
      }
    }
  }, [graphData, dimensions.width]);

  // Controla se o enquadramento inicial (refocus) já foi executado
  const hasInitialFitRef = useRef<boolean>(false);

  // 1. Observer Responsivo de Tamanho do Canvas
  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Resetar a flag de enquadramento se os dados do grafo mudarem radicalmente
  useEffect(() => {
    hasInitialFitRef.current = false;
  }, [graphData.nodes.length]);

  // 2. Pré-carregamento das Imagens dos Nós
  useEffect(() => {
    if (!graphData.nodes || graphData.nodes.length === 0) return;

    let loadedCount = 0;
    const nodesWithImages = graphData.nodes.filter((node) => node.image_url);

    if (nodesWithImages.length === 0) {
      setImagesLoaded(true);
      return;
    }

    nodesWithImages.forEach((node) => {
      if (!node.image_url) return;

      if (imgCacheRef.current.has(node.image_url)) {
        loadedCount++;
        if (loadedCount === nodesWithImages.length) setImagesLoaded(true);
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = node.image_url;
      img.onload = () => {
        imgCacheRef.current.set(node.image_url!, img);
        loadedCount++;
        if (loadedCount === nodesWithImages.length) {
          setImagesLoaded(true);
          if (graphRef.current) {
            graphRef.current.d3ReheatSimulation();
          }
        }
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === nodesWithImages.length) setImagesLoaded(true);
      };
    });
  }, [graphData.nodes, graphRef]);

  // 3. Configuração da Física D3 (Repulsão e Distância)
  useEffect(() => {
    if (graphRef.current) {
      const chargeForce = graphRef.current.d3Force('charge');
      const isMobile = dimensions.width < 768;

      // Adjust force constants for mobile screens vs desktop
      const chargeStrength = isMobile ? -1200 : -600;
      const schemeCharge = isMobile ? -900 : -1200;
      const linkDistance = isMobile ? 200 : 300;

      if (chargeForce) {
        chargeForce.strength((node: any) => (node.type === 'scheme' ? -1000 : -700));
      }

      const linkForce = graphRef.current.d3Force('link');
      if (linkForce) {
        linkForce.distance(200);
        linkForce.strength(0.3);
      }

      graphRef.current.d3Force(
        'collide',
        forceCollide().radius((node: any) => {
          if (node.type === 'scheme') return 300;
          if (node.type === 'company' || node.type === 'party') return 150;
          if (node.type === 'politician' || node.type === 'operator') return 100;
          return 30;
        }).strength(1)
      );

      const centerForce = graphRef.current.d3Force('center');
      if (centerForce) {
        centerForce.x(dimensions.width / 2);
        centerForce.y(dimensions.height / 2);
      }

      graphRef.current.d3ReheatSimulation();
    }
  }, [dimensions, graphData, graphRef]);

  // 4. Callback acionado apenas ao parar a simulação inicial para enquadrar a teia UMA VEZ
  const handleEngineStop = useCallback(() => {
    if (graphRef.current && !hasInitialFitRef.current) {
      if (typeof graphRef.current.zoomToFit === 'function') {
        const isMobile = dimensions.width < 768;
        const padding = isMobile ? 20 : 60;

        graphRef.current.zoomToFit(400, padding);

        if (isMobile && typeof graphRef.current.zoom === 'function') {
          setTimeout(() => {
            if (graphRef.current && graphRef.current.zoom() < 0.65) {
              graphRef.current.zoom(0.75, 300);
            }
          }, 100);
        }

        hasInitialFitRef.current = true;
      }
    }
  }, [graphRef, dimensions.width]);

  // 5. Custom 2D Canvas Node Renderer
  const drawNode = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const isSelected = selectedNode?.id === node.id;
    const color = COLOR_MAP[node.type as keyof typeof COLOR_MAP] || '#00f0ff';

    let size = 20;
    if (node.type === 'scheme') {
      size = 100;
    } else if (node.type === 'party' || node.type === 'company') {
      size = 70;
    } else if (node.type === 'politician' || node.type === 'operator') {
      size = 40;
    }

    ctx.save();

    // -----------------------------------------------------------------
    // PASS 1: DRAW NODE GEOMETRY (Glow, Borders, Inner Disc, Profile Image)
    // -----------------------------------------------------------------
    
    // Brilho Externo
    ctx.beginPath();
    ctx.arc(node.x, node.y, size + 8, 0, 2 * Math.PI);
    ctx.fillStyle = isSelected ? `${color}44` : `${color}18`;
    ctx.fill();

    // Borda Externa
    ctx.beginPath();
    ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
    ctx.strokeStyle = color;
    ctx.lineWidth = isSelected ? 3 / globalScale : 1.8 / globalScale;
    ctx.stroke();

    // Círculo Interno e Imagem
    ctx.beginPath();
    ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
    ctx.fillStyle = '#080d16';
    ctx.fill();

    if (node.image_url) {
      const img = imgCacheRef.current.get(node.image_url);
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
        ctx.clip();
        ctx.drawImage(img, node.x - size, node.y - size, size * 2, size * 2);
        ctx.restore();
      }
    }


  // -----------------------------------------------------------------
  // 2. CONFIGURAÇÃO CUSTOMIZADA DE RÓTULOS POR TIPO DE NÓ
  // -----------------------------------------------------------------
  let primaryLabel = node.label || '';
  let subLabel = '';
  let fontSize = Math.max(10, 11 / globalScale);
  let fontWeight = isSelected ? '700' : '500';
  let fontColor = isSelected ? '#ffffff' : '#cbd5e1';

  switch (node.type) {
    case 'politician':
      if (node.party && node.party !== 'N/A' && node.party !== 'NULL') {
        subLabel = `(${node.party})`;
      }
      fontColor = isSelected ? '#ffffff' : '#a5f3fc';
      break;

    case 'scheme':
      primaryLabel = primaryLabel.toUpperCase();
      fontSize = Math.max(12, 13 / globalScale);
      fontWeight = '600';
      fontColor = isSelected ? '#ffffff' : '#ff00c8';
      break;

    case 'company':
      fontColor = isSelected ? '#ffffff' : '#878787';
      break;

    case 'operator':
      fontColor = isSelected ? '#ffffff' : '#cdcdcd';
      break;

    case 'party':
      fontWeight = '600';
      fontColor = isSelected ? '#ffffff' : '#0400ff';
      break;

    default:
      break;
  }

  // -----------------------------------------------------------------
  // 3. RENDERIZAÇÃO PROGRESSIVA DE RÓTULOS (Level of Detail por Zoom)
  // -----------------------------------------------------------------
  const isScheme = node.type === 'scheme';
  const isPartyOrCompany = node.type === 'party' || node.type === 'company';
  const isPoliticianOrOperator = node.type === 'politician' || node.type === 'operator';

  // Regras de visibilidade por nível de zoom:
  // 1. Nós selecionados e Esquemas SEMPRE mostram seus rótulos
  // 2. Partidos e Empresas aparecem no zoom intermediário (globalScale >= 0.6)
  // 3. Políticos aparecem apenas quando houver zoom próximo (globalScale >= 1.1)
  const shouldShowLabel =
    isSelected ||
    isScheme ||
    (isPartyOrCompany && globalScale >= 0.3) ||
    (isPoliticianOrOperator && globalScale >= 0.5);

  if (shouldShowLabel) {
    ctx.font = `${fontWeight} ${fontSize}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = fontColor;

    // Posiciona o texto com folga proporcional ao tamanho da bolha
    const labelYPosition = node.y + size + 8 / globalScale;

    // Linha Principal
    ctx.fillText(primaryLabel, node.x, labelYPosition);

    // Segunda Linha (Ex: Sigla do Partido) — só aparece com zoom mais próximo
    if (subLabel && globalScale >= 1.3) {
      const subFontSize = Math.max(9, 10 / globalScale);
      ctx.font = `400 ${subFontSize}px Inter, sans-serif`;
      ctx.fillStyle = isSelected ? '#e0f2fe' : '#94a3b8';
      ctx.fillText(subLabel, node.x, labelYPosition + fontSize + 2 / globalScale);
    }
  }

  ctx.restore();
}, [selectedNode]);

return (
  <div ref={containerRef} className="relative w-full h-full flex-1 bg-[#080d16] overflow-hidden">
    <ForceGraph2D
      ref={graphRef}
      width={dimensions.width}
      height={dimensions.height}
      graphData={graphData}
      nodeCanvasObject={drawNode}
      nodePointerAreaPaint={(node: any, color, ctx) => {
        ctx.fillStyle = color;
        ctx.beginPath();

        let size = 15;
        if (node.type === 'scheme') size = 50;
        else if (node.type === 'party' || node.type === 'company') size = 30;

        // Adds a 15px invisible clickable padding ring around any bubble
        const clickPadding = 15;
        ctx.arc(node.x, node.y, size + clickPadding, 0, 2 * Math.PI);
        ctx.fill();
      }}

      linkCanvasObjectMode={() => 'replace'}
      linkCanvasObject={(link: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
        // 1. Garante suporte tanto para IDs em string quanto para objetos D3 já resolvidos
        const start = typeof link.source === 'object' ? link.source : null;
        const end = typeof link.target === 'object' ? link.target : null;

        // Se o D3 ainda não vinculou as coordenadas dos nós neste frame, aguarda o próximo ciclo
        if (!start || typeof start.x !== 'number' || !end || typeof end.x !== 'number') return;

        const color = STATUS_COLORS[link.status] || '#ff0055';
        const isSelected = selectedLink?.id === link.id;
        const baseWidth = isSelected ? 8 : 4;

        // 2. Proteção contra divisão por zero / escala inválida no Canvas 2D
        const safeScale = globalScale && globalScale > 0 ? globalScale : 1;
        const calculatedGlowWidth = baseWidth + 2 / safeScale;
        const glowWidth = Number.isFinite(calculatedGlowWidth) ? calculatedGlowWidth : baseWidth + 2;

        ctx.save();

        // Pass 1: Aura translúcida (Glow)
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.strokeStyle = `${color}44`;
        ctx.lineWidth = glowWidth;
        ctx.stroke();

        // Pass 2: Linha principal
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.strokeStyle = color;
        ctx.lineWidth = baseWidth;

        if (link.status === 'under_investigation') {
          ctx.setLineDash([4, 4]);
        } else {
          ctx.setLineDash([]);
        }

        ctx.stroke();
        ctx.restore();
      }}

      /* Keep directional particles and event handlers intact */
      linkDirectionalParticles={(link: any) => (link.status === 'under_investigation' ? 3 : 0)}
      linkDirectionalParticleSpeed={0.005}
      linkDirectionalParticleWidth={5.0}
      linkDirectionalParticleColor={(link: any) => STATUS_COLORS[link.status] || '#f59e0b'}
      onNodeClick={(node: any) => onSelectNode(node)}
      onLinkClick={(link: any) => onSelectLink(link)}
      onEngineStop={handleEngineStop}

      linkColor={(link: any) => STATUS_COLORS[link.status] || '#ff0055'}
      linkWidth={(link: any) => (selectedLink?.id === link.id ? 3.0 : 1.5)}
      linkLineDash={(link: any) => (link.status === 'under_investigation' ? [4, 4] : undefined)}

      // vvv Pre-computes 120 physics ticks BEFORE the canvas first paints: vvv
      warmupTicks={120}
      cooldownTicks={150}
      d3AlphaDecay={0.02}
      d3VelocityDecay={0.3}
      // ^^^ Pre-computes 120 physics ticks BEFORE the canvas first paints ^^^

      backgroundColor="#080d16"
    />

    {/* ----------------------------------------------------------------- */}
    {/* LEGENDA FIXA DE CORES DAS CONEXÕES (Canto Superior Direito)       */}
    {/* ----------------------------------------------------------------- */}
    <div className="absolute top-4 right-6 bg-[#0e1726]/90 backdrop-blur-md border border-slate-800 rounded-lg p-3 text-[11px] space-y-2 z-20 font-mono shadow-2xl select-none">
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
        Legenda das Conexões
      </div>

      {/* Status: Condenado / Confirmado */}
      <div className="flex items-center space-x-2.5">
        <span className="w-5 h-0.5 bg-[#ff0055] inline-block rounded-full shadow-[0_0_8px_#ff0055]" />
        <span className="text-slate-200">Condenado / Confirmado</span>
      </div>

      {/* Status: Sob Investigação (Tracejado) */}
      <div className="flex items-center space-x-2.5">
        <span className="w-5 h-0 border-b-2 border-dashed border-[#f59e0b] inline-block" />
        <span className="text-slate-200">Sob Investigação</span>
      </div>

      {/* Status: Absolvido / Arquivado */}
      <div className="flex items-center space-x-2.5">
        <span className="w-5 h-0.5 bg-[#10b981] inline-block rounded-full shadow-[0_0_8px_#10b981]" />
        <span className="text-slate-200">Absolvido / Arquivado</span>
      </div>
    </div>

    {/* ----------------------------------------------------------------- */}
    {/* LEGENDA FIXA DE CORES DOS CIRCULOS (Canto Superior Direito)       */}
    {/* ----------------------------------------------------------------- */}
    <div className="absolute top-36 right-6 bg-[#0e1726]/90 backdrop-blur-md border border-slate-800 rounded-lg p-3 text-[11px] space-y-2 z-20 font-mono shadow-2xl select-none">
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
        Legenda dos Círculos
      </div>

      {/* Status: Esquema */}
      <div className="flex items-center space-x-2.5">
        <span className="w-5 h-0.5 bg-[#ff36d3] inline-block rounded-full shadow-[0_0_8px_#ff00c8]" />
        <span className="text-slate-200">Esquema</span>
      </div>

      {/* Status: Partido */}
      <div className="flex items-center space-x-2.5">
        <span className="w-5 h-0.5 bg-[#322fff] inline-block rounded-full shadow-[0_0_8px_#1713e4]" />
        <span className="text-slate-200">Partido</span>
      </div>

      {/* Status: Político */}
      <div className="flex items-center space-x-2.5">
        <span className="w-5 h-0.5 bg-[#2ef1ff] inline-block rounded-full shadow-[0_0_8px_#00eeff]" />
        <span className="text-slate-200">Político</span>
      </div>

      {/* Status: Empresa */}
      <div className="flex items-center space-x-2.5">
        <span className="w-5 h-0.5 bg-[#939c98] inline-block rounded-full shadow-[0_0_8px_#bfcac5]" />
        <span className="text-slate-200">Empresa / Operador</span>
      </div>

      {/* Status: Operador */}
      <div className="flex items-center space-x-2.5">
        <span className="w-5 h-0.5 bg-[#e3e3e3] inline-block rounded-full shadow-[0_0_8px_#ffffff]" />
        <span className="text-slate-200">Operador</span>
      </div>
    </div>

    {/* Botões de Controle de Câmera */}
    <div className="absolute bottom-6 md:bottom-6 left-4 md:left-6 flex items-center space-x-1.5 bg-[#0e1726]/95 backdrop-blur-md border border-slate-800 rounded-lg p-1.5 z-20 shadow-xl select-none">
      <button
        onClick={() => {
          if (graphRef.current && typeof graphRef.current.zoom === 'function') {
            graphRef.current.zoom(graphRef.current.zoom() * 1.2, 400);
          }
        }}
        className="p-2 md:p-1.5 hover:bg-slate-800 active:bg-slate-700 text-slate-300 rounded transition-colors"
        aria-label="Zoom in"
      >
        <Plus className="w-4 h-4" />
      </button>
      <button
        onClick={() => {
          if (graphRef.current && typeof graphRef.current.zoom === 'function') {
            graphRef.current.zoom(graphRef.current.zoom() / 1.2, 400);
          }
        }}
        className="p-2 md:p-1.5 hover:bg-slate-800 active:bg-slate-700 text-slate-300 rounded transition-colors"
        aria-label="Zoom out"
      >
        <Minus className="w-4 h-4" />
      </button>
      <button
        onClick={() => {
          if (graphRef.current && typeof graphRef.current.zoomToFit === 'function') {
            const isMobile = dimensions.width < 768;
            graphRef.current.zoomToFit(400, isMobile ? 20 : 50);
          }
        }}
        className="px-2.5 py-1.5 md:py-1 hover:bg-slate-800 active:bg-slate-700 text-slate-300 text-xs font-mono rounded transition-colors"
      >
        refocus
      </button>
      <button
        onClick={() => {
          if (!document.fullscreenElement) document.documentElement.requestFullscreen();
          else document.exitFullscreen();
        }}
        className="p-2 md:p-1.5 hover:bg-slate-800 active:bg-slate-700 text-slate-300 rounded transition-colors"
        aria-label="Toggle fullscreen"
      >
        <Maximize className="w-4 h-4" />
      </button>
    </div>

    {/* Floating Legal & Policy Menu (Bottom-Right - Aligned with Camera Controls) */}
    <div className="absolute bottom-16 md:bottom-6 right-4 md:right-6 z-20 group">
      {/* Expanded Links Container (Reveals on hover or focus) */}
      <div className="absolute bottom-full right-0 mb-2 w-48 bg-[#0e1726]/95 backdrop-blur-md border border-slate-800 rounded-lg p-2 shadow-2xl opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200 flex flex-col space-y-1 text-xs">
        <div className="px-2 py-1 text-[10px] font-mono text-slate-500 uppercase tracking-wider border-b border-slate-800/80 mb-1">
          Informações Legais
        </div>

        <Link
          href="/about"
          className="flex items-center space-x-2 px-2 py-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-cyan-400 transition-colors"
        >
          <Info className="w-3.5 h-3.5 text-cyan-400" />
          <span>Sobre nós</span>
        </Link>

        <Link
          href="/privacy"
          className="flex items-center space-x-2 px-2 py-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-cyan-400 transition-colors"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>Política de privacidade</span>
        </Link>

        <Link
          href="/terms"
          className="flex items-center space-x-2 px-2 py-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-cyan-400 transition-colors"
        >
          <Scale className="w-3.5 h-3.5 text-cyan-400" />
          <span>Termos de serviço</span>
        </Link>
      </div>

      {/* Trigger Button */}
      <button
        className="flex items-center space-x-2 bg-[#0e1726]/95 backdrop-blur-md border border-slate-800 rounded-lg px-3 py-2 md:py-1.5 text-xs text-slate-300 hover:text-cyan-400 hover:border-slate-700/80 shadow-xl transition-all cursor-pointer select-none"
        aria-label="Legal pages menu"
      >
        <FileText className="w-4 h-4 text-cyan-400" />
        <span className="font-mono text-xs hidden sm:inline">Termos & Política</span>
        <ChevronUp className="w-3.5 h-3.5 text-slate-400 group-hover:rotate-180 transition-transform duration-200" />
      </button>
    </div>
  </div>
);
}