'use client';

import React, { useCallback } from 'react';
import dynamic from 'next/dynamic';
import { GraphData, GraphNode, GraphLink } from '../types/graph';
import { NODE_TYPES, STATUS_COLORS } from './SidebarControls';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

interface NetworkGraphProps {
  graphRef: React.RefObject<any>;
  graphData: GraphData;
  selectedNode: GraphNode | null;
  selectedLink: GraphLink | null;
  onSelectNode: (node: GraphNode) => void;
  onSelectLink: (link: GraphLink) => void;
}

export default function NetworkGraph({
  graphRef,
  graphData,
  selectedNode,
  selectedLink,
  onSelectNode,
  onSelectLink
}: NetworkGraphProps) {

  const handleNodeCanvasObject = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const fontSize = 12 / globalScale;
    const radius = node.type === 'scheme' ? 10 : 7;
    const color = NODE_TYPES[node.type as keyof typeof NODE_TYPES]?.color || '#9CA3AF';
    const isSelected = selectedNode?.id === node.id;

    if (isSelected) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius + 4, 0, 2 * Math.PI, false);
      ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
      ctx.fill();
      ctx.strokeStyle = '#60A5FA';
      ctx.lineWidth = 2 / globalScale;
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = '#1F2937';
    ctx.lineWidth = 1.5 / globalScale;
    ctx.stroke();

    if (globalScale > 1.2 || isSelected) {
      ctx.font = `${isSelected ? 'bold' : 'normal'} ${fontSize}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = isSelected ? '#FFFFFF' : '#D1D5DB';
      ctx.fillText(node.label, node.x, node.y + radius + fontSize + 2);
    }
  }, [selectedNode]);

  return (
    <main className="flex-1 relative bg-slate-950">
      <ForceGraph2D
        ref={graphRef}
        graphData={graphData}
        nodeId="id"
        nodeCanvasObject={handleNodeCanvasObject}
        nodePointerAreaPaint={(node: any, color: string, ctx: CanvasRenderingContext2D) => {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(node.x, node.y, 12, 0, 2 * Math.PI, false);
          ctx.fill();
        }}
        linkColor={(link: any) => STATUS_COLORS[link.status as keyof typeof STATUS_COLORS] || '#4B5563'}
        linkWidth={(link: any) => (selectedLink?.id === link.id ? 3.5 : 1.8)}
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={0.006}
        linkDirectionalParticleWidth={3}
        onNodeClick={(node: any) => {
          onSelectNode(node as GraphNode);
          if (graphRef.current) {
            graphRef.current.centerAt(node.x, node.y, 400);
          }
        }}
        onLinkClick={(link: any) => {
          onSelectLink(link as GraphLink);
        }}
        cooldownTicks={100}
        backgroundColor="#020617"
      />

      <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 shadow-2xl flex items-center space-x-4 text-xs">
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
          <span className="text-slate-300">Político</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
          <span className="text-slate-300">Esquema</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
          <span className="text-slate-300">Empresa/Operador</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-purple-500 inline-block" />
          <span className="text-slate-300">Partido</span>
        </div>
      </div>
    </main>
  );
}
