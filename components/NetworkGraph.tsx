'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { forceCollide } from 'd3-force';
import { GraphData, GraphNode, GraphLink } from '@/types/graph';

interface NetworkGraphProps {
  graphRef: React.RefObject<any>;
  graphData: GraphData;
  selectedNode: GraphNode | null;
  selectedLink: GraphLink | null;
  onSelectNode: (node: GraphNode | null) => void;
  onSelectLink: (link: GraphLink | null) => void;
}

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

  // 1. Ajuste dinâmico do tamanho do Canvas
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // 2. Configuração das forças físicas do D3 (Evita aglomeração e círculos deformados)
  useEffect(() => {
    if (graphRef.current && graphData.nodes.length > 0) {
      // Repulsão entre nós
      const chargeForce = graphRef.current.d3Force('charge');
      if (chargeForce) {
        chargeForce.strength((node: any) => (node.type === 'scheme' ? -1200 : -600));
      }

      // Distância das conexões
      const linkForce = graphRef.current.d3Force('link');
      if (linkForce) {
        linkForce.distance(200).strength(0.2);
      }

      // Força de colisão para afastar nós sobrepostos
      graphRef.current.d3Force(
        'collide',
        forceCollide()
          .radius((node: any) => {
            if (node.type === 'scheme') return 80;
            if (node.type === 'party' || node.type === 'company') return 50;
            return 35;
          })
          .strength(1)
      );

      // Recalcula e reinicia a simulação
      graphRef.current.d3AlphaTarget(0.2).restart();

      const timer = setTimeout(() => {
        if (graphRef.current) {
          graphRef.current.d3AlphaTarget(0);
          graphRef.current.zoomToFit(400, 60);
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [graphData, dimensions, graphRef]);

  // 3. Enquadramento e Zoom Geral quando a simulação estabilizar
  const handleEngineStop = useCallback(() => {
    if (graphRef.current) {
      graphRef.current.zoomToFit(400, 60);
    }
  }, [graphRef]);

  return (
    <div ref={containerRef} className="w-full h-full relative bg-[#080d16]">
      <ForceGraph2D
        ref={graphRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        nodeLabel={(node: any) => `${node.label} (${node.type})`}
        nodeColor={(node: any) => {
          if (node.type === 'scheme') return '#cc01a0';
          if (node.type === 'politician') return '#00c3d1';
          if (node.type === 'company') return '#00c771';
          return '#a855f7';
        }}
        nodeVal={(node: any) => (node.type === 'scheme' ? 12 : 6)}
        linkColor={(link: any) => {
          if (link.status === 'confirmed') return '#b1003b';
          if (link.status === 'under_investigation') return '#f59e0b';
          return '#10b981';
        }}
        linkWidth={(link: any) => (selectedLink && selectedLink.id === link.id ? 4 : 2)}
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={0.005}
        onNodeClick={(node: any) => onSelectNode(node)}
        onLinkClick={(link: any) => onSelectLink(link)}
        onBackgroundClick={() => {
          onSelectNode(null);
          onSelectLink(null);
        }}
        onEngineStop={handleEngineStop}
        cooldownTicks={100}
      />
    </div>
  );
}