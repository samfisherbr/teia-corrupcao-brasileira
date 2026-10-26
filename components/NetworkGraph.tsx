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
  scheme: '#ff00c8',     // Magenta for Corruption Schemes
  politician: '#00f0ff', // Cyan for Politicians
  company: '#0aff96',    // Green for Companies
  party: '#a855f7'       // Purple for Parties
};

// Dynamic color mapping based on legal status
const STATUS_COLORS: Record<string, string> = {
  confirmed: '#ff0055',           // Glowing Red for Confirmed/Sentenced
  under_investigation: '#f59e0b', // Amber for Under Investigation
  acquitted: '#10b981'            // Emerald Green for Acquitted/Dismissed
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

  // 1. Responsive Canvas Size Tracking
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

  // 2. Programmatic D3 Physics Configuration
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
  }, [dimensions, graphData]);

  // Preload and cache node profile images
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

  // Custom 2D Canvas Renderer
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

    // Outer Glow
    ctx.beginPath();
    ctx.arc(node.x, node.y, size + 8, 0, 2 * Math.PI);
    ctx.fillStyle = isSelected ? `${color}44` : `${color}18`;
    ctx.fill();

    // Outer Border
    ctx.beginPath();
    ctx.arc(node.x, node.y, size + 3, 0, 2 * Math.PI);
    ctx.strokeStyle = color;
    ctx.lineWidth = isSelected ? 3 / globalScale : 1.8 / globalScale;
    ctx.stroke();

    // Inner Circle & Image
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
        ctx.clip();
        ctx.drawImage(img, node.x - size, node.y - size, size * 2, size * 2);
        ctx.restore();
      }
    }

    // Label Text
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

        /* Dynamic Link Color & Particle Animation based on Status */
        linkColor={(link: any) => STATUS_COLORS[link.status] || '#ff0055'}
        linkWidth={(link: any) => (selectedLink?.id === link.id ? 3.5 : 1.8)}
        linkLineDash={(link: any) => (link.status === 'under_investigation' ? [4, 4] : undefined)}
        linkDirectionalParticles={(link: any) => (link.status === 'under_investigation' ? 3 : 0)}
        linkDirectionalParticleSpeed={0.005}
        linkDirectionalParticleWidth={2.5}
        linkDirectionalParticleColor={(link: any) => STATUS_COLORS[link.status] || '#f59e0b'}

        onNodeClick={(node: any) => onSelectNode(node)}
        onLinkClick={(link: any) => onSelectLink(link)}
        cooldownTicks={150}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
        backgroundColor="#080d16"
      />

      {/* Dynamic Status Legend */}
      <div className="absolute top-4 right-6 bg-[#0e1726]/90 backdrop-blur-md border border-slate-800 rounded-lg p-3 text-[11px] space-y-2 z-10 font-mono">
        <div className="flex items-center space-x-2">
          <span className="w-4 h-0.5 bg-[#ff0055] inline-block shadow-[0_0_8px_#ff0055]" />
          <span className="text-slate-300">CONFIRMED / SENTENCED</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-4 h-0.5 border-b border-dashed border-[#f59e0b] inline-block" />
          <span className="text-slate-300">UNDER INVESTIGATION</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-4 h-0.5 bg-[#10b981] inline-block shadow-[0_0_8px_#10b981]" />
          <span className="text-slate-300">ACQUITTED / ARCHIVED</span>
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