'use client';

import React, { useCallback, useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Plus, Minus, Maximize } from 'lucide-react';
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
  scheme: '#ff00c8',     // Magenta for Corruption Schemes
  politician: '#00f0ff', // Cyan for Politicians
  company: '#0aff96',    // Green for Companies
  party: '#a855f7'       // Purple for Parties
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

  // Responsive Canvas Size Tracking
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

  useEffect(() => {
  if (graphRef.current) {
    // Repulsion force between bubbles (negative value pushes nodes apart)
    const chargeForce = graphRef.current.d3Force('charge');
    if (chargeForce) chargeForce.strength(-120);

    // Link distance and tightness
    const linkForce = graphRef.current.d3Force('link');
    if (linkForce) {
      linkForce.distance(120);
      linkForce.strength(0.1);
    }

    // Center force targeting screen middle
    const centerForce = graphRef.current.d3Force('center');
    if (centerForce) {
      centerForce.x(dimensions.width / 2);
      centerForce.y(dimensions.height / 2);
    }

    // Re-heat simulation to apply updated physics parameters
    graphRef.current.d3ReheatSimulation();
  }
}, [dimensions, graphData]);

  // Helper: Preload and cache node profile images
  const getNodeImage = (url: string) => {
    if (!url) return null;
    if (imgCacheRef.current.has(url)) {
      return imgCacheRef.current.get(url)!;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;
    imgCacheRef.current.set(url, img);
    return img;
  };

  // Custom 2D Canvas Renderer for Glowing Nodes and Pictures
  const drawNode = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const isSelected = selectedNode?.id === node.id;
    const color = COLOR_MAP[node.type as keyof typeof COLOR_MAP] || '#00f0ff';

    // -----------------------------------------------------------------
    // NODE SIZE HIERARCHY: Scheme is ALWAYS the largest bubble
    // -----------------------------------------------------------------
    let size = 12;
    if (node.type === 'scheme') {
      size = 28; // LARGEST BUBBLE for "Esquema de Corrupção"
    } else if (node.type === 'company') {
      size = 18;
    } else if (node.type === 'politician') {
      size = 10;
    }

    ctx.save();

    // 1. Outer Glow Aura
    ctx.beginPath();
    ctx.arc(node.x, node.y, size + 8, 0, 2 * Math.PI);
    ctx.fillStyle = isSelected ? `${color}44` : `${color}18`;
    ctx.fill();

    // 2. Double Ring Outer Border
    ctx.beginPath();
    ctx.arc(node.x, node.y, size + 3, 0, 2 * Math.PI);
    ctx.strokeStyle = color;
    ctx.lineWidth = isSelected ? 3 / globalScale : 1.8 / globalScale;
    ctx.stroke();

    // 3. Inner Circle Clipping Mask & Image Drawing
    ctx.beginPath();
    ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
    ctx.fillStyle = '#080d16';
    ctx.fill();

    if (node.image_url) {
      const img = getNodeImage(node.image_url);
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
        ctx.clip(); // Clip image to inside the circle
        ctx.drawImage(img, node.x - size, node.y - size, size * 2, size * 2);
        ctx.restore();
      }
    }

    // Inner Stroke Ring
    ctx.beginPath();
    ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1 / globalScale;
    ctx.stroke();

    // 4. Node Label Below Bubble
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
          ctx.arc(node.x, node.y, node.type === 'scheme' ? 30 : 20, 0, 2 * Math.PI);
          ctx.fill();
        }}
        linkColor={(link: any) => link.type === 'suspect_transactions' ? '#f59e0b' : '#ff0055'}
        linkWidth={(link: any) => (selectedLink?.id === link.id ? 3.5 : 1.8)}
        linkLineDash={(link: any) => link.type === 'suspect_transactions' ? [4, 4] : undefined}
        linkDirectionalParticles={(link: any) => link.type === 'suspect_transactions' ? 3 : 0}
        linkDirectionalParticleSpeed={0.005}
        linkDirectionalParticleWidth={2.5}
        linkDirectionalParticleColor={() => '#f59e0b'}
        onNodeClick={(node: any) => onSelectNode(node)}
        onLinkClick={(link: any) => onSelectLink(link)}
        cooldownTicks={120}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
        backgroundColor="#080d16"
      />

      {/* Top Right Floating Connection Legend */}
      <div className="absolute top-4 right-6 bg-[#0e1726]/90 backdrop-blur-md border border-slate-800 rounded-lg p-3 text-[11px] space-y-2 z-10 font-mono">
        <div className="flex items-center space-x-2">
          <span className="w-4 h-0.5 bg-red-500 inline-block shadow-[0_0_8px_#ff0055]" />
          <span className="text-slate-300">DIRECT FINANCING</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-4 h-0.5 border-b border-dashed border-amber-400 inline-block" />
          <span className="text-slate-300">SUSPECT TRANSACTIONS</span>
        </div>
      </div>

      {/* Bottom Left Camera Controls */}
      <div className="absolute bottom-6 left-6 flex items-center space-x-1.5 bg-[#0e1726]/90 border border-slate-800 rounded-lg p-1 z-10">
        <button
          onClick={() => graphRef.current?.zoom(graphRef.current.zoom() * 1.2, 400)}
          className="p-1.5 hover:bg-slate-800 text-slate-300 rounded transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={() => graphRef.current?.zoom(graphRef.current.zoom() / 1.2, 400)}
          className="p-1.5 hover:bg-slate-800 text-slate-300 rounded transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={() => graphRef.current?.zoomToFit(400, 50)}
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