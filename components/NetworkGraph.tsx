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
  scheme: '#ff00c8',     // Magenta para Esquemas
  politician: '#00f0ff', // Ciano para Políticos
  company: '#0aff96',    // Verde para Empresas
  party: '#a855f7'       // Roxo para Partidos
};

const STATUS_COLORS: Record<string, string> = {
  confirmed: '#ff0055',
  under_investigation: '#f59e0b',
  acquitted: '#10b981'
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
          if (node.type === 'scheme') return 55;
          if (node.type === 'politician') return 40;
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
        graphRef.current.zoomToFit(400, 60);
        hasInitialFitRef.current = true; // Bloqueia reenquadramentos futuros causados por arrastes/zoom do usuário
      }
    }
  }, [graphRef]);

  // 5. Renderizador customizado do Canvas 2D
  const drawNode = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const isSelected = selectedNode?.id === node.id;
    const color = COLOR_MAP[node.type as keyof typeof COLOR_MAP] || '#00f0ff';

    let size = 12;
    if (node.type === 'scheme') {
      size = 28;
    } else if (node.type === 'politician') {
      size = 18;
    } else if (node.type === 'company') {
      size = 14;
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

    // Rótulo de Texto
    const label = node.label || '';
    ctx.font = `${isSelected ? 'bold' : '500'} ${Math.max(10, 11 / globalScale)}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = isSelected ? '#ffffff' : '#cbd5e1';
    ctx.fillText(label, node.x, node.y + size + 14 / globalScale);

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

      {/* Botões de Controle de Câmera */}
      <div className="absolute bottom-6 left-6 flex items-center space-x-1.5 bg-[#0e1726]/90 border border-slate-800 rounded-lg p-1 z-10">
        <button
          onClick={() => {
            if (graphRef.current && typeof graphRef.current.zoom === 'function') {
              graphRef.current.zoom(graphRef.current.zoom() * 1.2, 400);
            }
          }}
          className="p-1.5 hover:bg-slate-800 text-slate-300 rounded transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            if (graphRef.current && typeof graphRef.current.zoom === 'function') {
              graphRef.current.zoom(graphRef.current.zoom() / 1.2, 400);
            }
          }}
          className="p-1.5 hover:bg-slate-800 text-slate-300 rounded transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            if (graphRef.current && typeof graphRef.current.zoomToFit === 'function') {
              graphRef.current.zoomToFit(400, 50);
            }
          }}
          className="px-2 py-1 hover:bg-slate-800 text-slate-300 text-xs font-mono rounded transition-colors"
        >
          refocus
        </button>
        <button
          onClick={() => {
            if (!document.fullscreenElement) document.documentElement.requestFullscreen();
            else document.exitFullscreen();
          }}
          className="p-1.5 hover:bg-slate-800 text-slate-300 rounded transition-colors"
        >
          <Maximize className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}