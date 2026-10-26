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
  politician: '#00f0ff',
  company: '#0aff96',
  scheme: '#ff00c8',
  party: '#a855f7'
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

  const drawNode = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const isSelected = selectedNode?.id === node.id;
    const size = node.type === 'politician' && node.id === 'pol_carlos_alves' ? 18 : 12;
    const color = COLOR_MAP[node.type as keyof typeof COLOR_MAP] || '#00f0ff';

    ctx.save();
    ctx.beginPath();
    ctx.arc(node.x, node.y, size + 6, 0, 2 * Math.PI);
    ctx.fillStyle = isSelected ? `${color}33` : `${color}11`;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(node.x, node.y, size + 3, 0, 2 * Math.PI);
    ctx.strokeStyle = color;
    ctx.lineWidth = isSelected ? 2.5 / globalScale : 1.5 / globalScale;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
    ctx.fillStyle = '#080d16';
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1 / globalScale;
    ctx.stroke();

    const label = node.label || '';
    ctx.font = `${isSelected ? 'bold' : 'normal'} ${10 / globalScale}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = isSelected ? '#ffffff' : '#94a3b8';
    ctx.fillText(label, node.x, node.y + size + 12 / globalScale);

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
          ctx.arc(node.x, node.y, 16, 0, 2 * Math.PI);
          ctx.fill();
        }}
        linkColor={(link: any) => link.type === 'suspect_transactions' ? '#f59e0b' : '#ff0055'}
        linkWidth={(link: any) => (selectedLink?.id === link.id ? 3 : 1.5)}
        linkLineDash={(link: any) => link.type === 'suspect_transactions' ? [4, 4] : undefined}
        linkDirectionalParticles={(link: any) => link.type === 'suspect_transactions' ? 3 : 0}
        linkDirectionalParticleSpeed={0.005}
        linkDirectionalParticleWidth={2.5}
        linkDirectionalParticleColor={() => '#f59e0b'}
        onNodeClick={(node: any) => onSelectNode(node)}
        onLinkClick={(link: any) => onSelectLink(link)}
        cooldownTicks={100}
        backgroundColor="#080d16"
      />

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