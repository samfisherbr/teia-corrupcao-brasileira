'use client';

export const runtime = 'edge';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import HeaderBar from '../components/HeaderBar';
import NetworkGraph from '../components/NetworkGraph';
import TimelineWidget from '../components/TimelineWidget';
import SidebarControls from '../components/SidebarControls';
import InspectorDrawer from '../components/InspectorDrawer';
import { INITIAL_DATA } from '../data/sanguesugadata';
import { GraphNode, GraphLink, NodeType, LinkStatus, GraphData } from '../types/graph';

export default function Page() {
  const graphRef = useRef<any>(null);

  // Graph Data State (fetches API or falls back to static seed data)
  const [graphData, setGraphData] = useState<GraphData>(INITIAL_DATA);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(INITIAL_DATA.nodes[0]);
  const [selectedLink, setSelectedLink] = useState<GraphLink | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [startYearFilter, setStartYearFilter] = useState(2014);
  const [activeCategory, setActiveCategory] = useState<'all' | 'transactions' | 'contracts' | 'processes'>('all');
  const [typeFilters, setTypeFilters] = useState<Record<NodeType, boolean>>({
    politician: true,
    party: true,
    scheme: true,
    company: true
  });
  const [statusFilters, setStatusFilters] = useState<Record<LinkStatus, boolean>>({
    confirmed: true,
    under_investigation: true,
    acquitted: true
  });

  // Fetch live API data if available
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/graph');
        if (res.ok) {
          const data = await res.json();
          if (data.nodes && data.nodes.length > 0) {
            setGraphData(data);
          }
        }
      } catch (e) {
        console.log('Using fallback local dataset');
      }
    }
    loadData();
  }, []);

  // Compute filtered graph data dynamically
  const filteredData = useMemo(() => {
    const validLinks = graphData.links.filter(link => {
      const matchYear = link.year >= startYearFilter;
      const matchStatus = statusFilters[link.status];
      const matchCategory = activeCategory === 'all' || 
        (activeCategory === 'transactions' && link.type === 'suspect_transactions') ||
        (activeCategory === 'contracts' && link.type === 'direct_financing');
      return matchYear && matchStatus && matchCategory;
    });

    const validNodes = graphData.nodes.filter(node => {
      const matchType = typeFilters[node.type];
      const matchSearch = searchQuery === '' || 
        node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (node.party && node.party.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchType && matchSearch;
    });

    const validNodeIds = new Set(validNodes.map(n => n.id));

    const finalLinks = validLinks.filter(l => {
      const sId = typeof l.source === 'object' ? (l.source as any).id : l.source;
      const tId = typeof l.target === 'object' ? (l.target as any).id : l.target;
      return validNodeIds.has(sId) && validNodeIds.has(tId);
    });

    return {
      nodes: validNodes,
      links: finalLinks
    };
  }, [graphData, startYearFilter, typeFilters, statusFilters, searchQuery, activeCategory]);

  return (
    <div className="relative h-screen w-full bg-[#080d16] bg-grid-pattern text-slate-100 font-sans overflow-hidden flex flex-col">
      {/* Top Navigation Bar */}
      <HeaderBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />

      {/* Main Canvas Visualizer */}
      <main className="relative flex-1 w-full h-full">
        <NetworkGraph
          graphRef={graphRef}
          graphData={filteredData}
          selectedNode={selectedNode}
          selectedLink={selectedLink}
          onSelectNode={(node) => {
            setSelectedNode(node);
            setSelectedLink(null);
          }}
          onSelectLink={(link) => {
            setSelectedLink(link);
            setSelectedNode(null);
          }}
        />

        {/* Floating Bottom Timeline Slider */}
        <TimelineWidget
          startYear={startYearFilter}
          setStartYear={setStartYearFilter}
        />
      </main>

      {/* Right-side Glassmorphism Dossier Panel */}
      <InspectorDrawer
        selectedNode={selectedNode}
        selectedLink={selectedLink}
        onClose={() => {
          setSelectedNode(null);
          setSelectedLink(null);
        }}
        filteredData={filteredData}
        fullNodes={graphData.nodes}
        onSelectLink={(link) => {
          setSelectedLink(link);
          setSelectedNode(null);
        }}
      />
    </div>
  );
}