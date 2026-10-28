'use client';

import React, { useCallback, useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Plus, Minus, Maximize } from 'lucide-react';
import { forceCollide } from 'd3-force';
import { GraphData, GraphNode, GraphLink } from '@/types/graph';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

interface NetworkGraphProps {
  graphRef: React.RefObject<any>;
  graphData: GraphData;
  selectedNode: GraphNode | null;
  selectedLink: GraphLink | null;
  onSelectNode: (node: GraphNode | null) => void;
  onSelectLink: (link: GraphLink | null) => void;
}

const COLOR_MAP = {
  scheme: '#ffffff',
  politician: '#00d5e4',
  company: '#09cc77',
  party: '#934ad8',
};

const STATUS_COLORS: Record<string, string> = {
  confirmed: '#b1003b',
  under_investigation: '#f59e0b',
  acquitted: '#10b981',
};

export default function NetworkGraph({
  graphRef,
  graphData,
  selectedNode,
  selectedLink,
  onSelectNode,
  onSelectLink,
}: NetworkGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 800, height: 600 });
  const imgCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());

  // 1. Dynamic Resize Observer
  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // 2. Safely configure D3 physics without calling unbound functions
  useEffect(() => {
    const fg = graphRef.current;
    if (!fg || typeof fg.d3Force !== 'function') return;

    // Repulsion Force
    const chargeForce = fg.d3Force('charge');
    if (chargeForce) {
      chargeForce.strength((node: any) => (node.type === 'scheme' ? -1000 : -500));
    }

    // Link Distance
    const linkForce = fg.d3Force('link');
    if (linkForce) {
      linkForce.distance(200);
      linkForce.strength(0.15);
    }

    // Collision Boundaries
    fg.d3Force(
      'collide',
      forceCollide()
        .radius((node: any) => {
          if (node.type === 'scheme') return 100;
          if (node.type === 'party' || node.type === 'company') return 50;
          if (node.type === 'politician') return 20;
          return 30;
        })
        .strength(1)
    );

    // Center Force
    const centerForce = fg.d3Force('center');
    if (centerForce) {
      centerForce.x(dimensions.width / 2);
      centerForce.y(dimensions.height / 2);
    }

    // Safe re-heat call
    if (typeof fg.d3ReheatSimulation === 'function') {
      fg.d3ReheatSimulation();
    }
  }, [dimensions, graphData, graphRef]);

  // 3. Safe Refocus / Engine Stop
  const handleEngineStop = useCallback(() => {
    const fg = graphRef.current;
    if (fg && typeof fg.zoomToFit === 'function') {
      fg.zoomToFit(400, 60);
    }
  }, [graphRef]);

  // 4. Custom Canvas Node Drawing
  const drawNode = useCallback(
    (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const isSelected = selectedNode?.id === node.id;
      const color = COLOR_MAP[node.type as keyof typeof COLOR_MAP] || '#00f0ff';

      let size = 12;
      if (node.type === 'scheme') {
        size = 70;
      } else if (node.type === 'company' || node.type === 'party') {
        size = 30;
      } else if (node.type === 'politician') {
        size = 15;
      }

      ctx.save();

      // Outer Glow
      ctx.beginPath();
      ctx.arc(node.x, node.y, size + 8, 0, 2 * Math.PI);
      ctx.fillStyle = isSelected ? `${color}44` : `${color}18`;
      ctx.fill();

      // Outer Ring
      ctx.beginPath();
      ctx.arc(node.x, node.y, size + 3, 0, 2 * Math.PI);
      ctx.strokeStyle = color;
      ctx.lineWidth = isSelected ? 3 / globalScale : 1.8 / globalScale;
      ctx.stroke();

      // Inner Fill & Avatar
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

      // Label Text
      const label = node.label || '';
      ctx.font = `${isSelected ? 'bold' : '500'} ${Math.max(10, 11 / globalScale)}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = isSelected ? '#ffffff' : '#cbd5e1';
      ctx.fillText(label, node.x, node.y + size + 14 / globalScale);

      ctx.restore();
    },
    [selectedNode]
  );

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
        linkColor={(link: any) => STATUS_COLORS[link.status] || '#b1003b'}
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

      {/* Camera Controls */}
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