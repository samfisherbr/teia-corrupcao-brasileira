'use client';

import React, { useCallback, useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Plus, Minus, Maximize } from 'lucide-react';
import { forceCollide } from 'd3-force';
import { GraphData, GraphNode, GraphLink } from '@/types/graph';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });



interface NetworkGraphProps {
  graphRef: any;
  graphData: GraphData;
  selectedNode: GraphNode | null;
  selectedLink: GraphLink | null;
  onSelectNode: (node: GraphNode) => void;
  onSelectLink: (link: GraphLink) => void;
}

const COLOR_MAP = {
  scheme: '#d1e000',     // Magenta para Esquemas
  politician: '#00bdca', // Ciano para Políticos
  company: '#00cc74',    // Verde para Empresas
  party: '#1713e4'       // Roxo para Partidos
};

const STATUS_COLORS: Record<string, string> = {
  confirmed: '#ff0000ad',
  under_investigation: '#fffb00b2',
  acquitted: '#00ffaaab'
};

export default function NetworkGraph({
  graphRef,
  graphData,
  selectedNode,
  selectedLink,
  onSelectNode,
  onSelectLink
}: NetworkGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 800, height: 600 });

  const imgCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const [, setImagesLoaded] = useState<boolean>(false);

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
      const schemeCharge = isMobile ? -600 : -1000;
      const linkDistance = isMobile ? 100 : 200;

      if (chargeForce) {
        chargeForce.strength((node: any) => (node.type === 'scheme' ? -1000 : -500));
      }

      const linkForce = graphRef.current.d3Force('link');
      if (linkForce) {
        linkForce.distance(200);
        linkForce.strength(0.15);
      }

      graphRef.current.d3Force(
        'collide',
        forceCollide().radius((node: any) => {
          if (node.type === 'scheme') return 200;
          if (node.type === 'company') return 100;
          if (node.type === 'party') return 100;
          if (node.type === 'politician') return 50;
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

  // 5. Renderizador customizado do Canvas 2D
  const drawNode = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const isSelected = selectedNode?.id === node.id;
    const color = COLOR_MAP[node.type as keyof typeof COLOR_MAP] || '#00f0ff';

    let size = 12;
    if (node.type === 'scheme') {
      size = 50;
    } else if (node.type === 'party') {
      size = 30;
    } else if (node.type === 'politician') {
      size = 15;
    } else if (node.type === 'company') {
      size = 30;
    }

    ctx.save();

    // Brilho Externo
    ctx.beginPath();
    ctx.arc(node.x, node.y, size + 8, 0, 2 * Math.PI);
    ctx.fillStyle = isSelected ? `${color}44` : `${color}18`;
    ctx.fill();

    // Borda Externa
    ctx.beginPath();
    ctx.arc(node.x, node.y, size + 3, 0, 2 * Math.PI);
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
        fontSize = Math.max(13, 14 / globalScale);
        fontWeight = '700';
        fontColor = isSelected ? '#ffffff' : '#fef08a';
        break;

      case 'company':
        fontColor = isSelected ? '#ffffff' : '#6ee7b7';
        break;

      case 'party':
        fontWeight = '600';
        fontColor = isSelected ? '#ffffff' : '#c7d2fe';
        break;

      default:
        break;
    }

    // -----------------------------------------------------------------
    // 3. RENDERIZAÇÃO PROGRESSIVA DE RÓTULOS (Level of Detail por Zoom)
    // -----------------------------------------------------------------
    const isScheme = node.type === 'scheme';
    const isPartyOrCompany = node.type === 'party' || node.type === 'company';
    const isPolitician = node.type === 'politician';

    // Regras de visibilidade por nível de zoom:
    // 1. Nós selecionados e Esquemas SEMPRE mostram seus rótulos
    // 2. Partidos e Empresas aparecem no zoom intermediário (globalScale >= 0.6)
    // 3. Políticos aparecem apenas quando houver zoom próximo (globalScale >= 1.1)
    const shouldShowLabel =
      isSelected ||
      isScheme ||
      (isPartyOrCompany && globalScale >= 0.3) ||
      (isPolitician && globalScale >= 0.5);

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
          ctx.arc(node.x, node.y, node.type === 'scheme' ? 35 : 22, 0, 2 * Math.PI);
          ctx.fill();
        }}
        linkColor={(link: any) => STATUS_COLORS[link.status] || '#ff0055'}
        linkWidth={(link: any) => (selectedLink?.id === link.id ? 3.5 : 1.8)}
        linkLineDash={(link: any) => (link.status === 'under_investigation' ? [4, 4] : undefined)}
        linkDirectionalParticles={(link: any) => (link.status === 'under_investigation' ? 3 : 0)}
        linkDirectionalParticleSpeed={0.005}
        linkDirectionalParticleWidth={2.5}
        linkDirectionalParticleColor={(link: any) => STATUS_COLORS[link.status] || '#f59e0b'}
        onNodeClick={(node: any) => onSelectNode(node)}
        onLinkClick={(link: any) => onSelectLink(link)}
        onEngineStop={handleEngineStop}
        cooldownTicks={150}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
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

      {/* Botões de Controle de Câmera */}
      <div className="absolute bottom-16 md:bottom-6 left-4 md:left-6 flex items-center space-x-1.5 bg-[#0e1726]/95 backdrop-blur-md border border-slate-800 rounded-lg p-1.5 z-20 shadow-xl select-none">
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
    </div>
  );
}