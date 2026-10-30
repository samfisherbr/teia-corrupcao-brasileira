'use client';

export const runtime = 'edge';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import HeaderBar, { ActivePage } from '@/components/HeaderBar';
import HeaderOverlay from '@/components/HeaderOverlay';
import NetworkGraph from '@/components/NetworkGraph';
//import TimelineWidget from '@/components/TimelineWidget';
import SidebarControls from '@/components/SidebarControls';
import InspectorDrawer from '@/components/InspectorDrawer';
import { GraphNode, GraphLink, NodeType, LinkStatus, GraphData } from '@/types/graph';

export default function Page() {
  const graphRef = useRef<any>(null);

  // View state for sliding panels ('graph' | 'infographics' | 'glossary')
  const [activePage, setActivePage] = useState<ActivePage>('graph');

  // Initialize EMPTY graph data (connected to Cloudflare D1 Database)
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [selectedLink, setSelectedLink] = useState<GraphLink | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [startYearFilter, setStartYearFilter] = useState(2000);
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

  // Fetch strictly from Cloudflare D1 Database endpoint
  useEffect(() => {
    async function loadDataFromD1() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/graph');
        if (!res.ok) {
          throw new Error(`D1 API returned status ${res.status}`);
        }
        const data = await res.json();
        if (data.nodes && data.links) {
          setGraphData(data);
        }
      } catch (e: any) {
        console.error('Failed to load data from Cloudflare D1:', e);
        setError(e.message || 'Error connecting to D1 Database');
      } finally {
        setIsLoading(false);
      }
    }
    loadDataFromD1();
  }, []);

  const filteredData = useMemo(() => {
    const validLinks = graphData.links.filter(link => {
      const matchYear = link.year >= startYearFilter;
      const matchStatus = statusFilters[link.status];
      
      const linkTypeStr = (link.type as string) || '';
      const matchCategory = activeCategory === 'all' || 
        (activeCategory === 'transactions' && (linkTypeStr === 'suspect_transactions' || linkTypeStr === 'transaction')) ||
        (activeCategory === 'contracts' && (linkTypeStr === 'direct_financing' || linkTypeStr === 'contract')) ||
        (activeCategory === 'processes' && linkTypeStr === 'process');

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

  const toggleTypeFilter = (type: NodeType) => {
    setTypeFilters(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const toggleStatusFilter = (status: LinkStatus) => {
    setStatusFilters(prev => ({ ...prev, [status]: !prev[status] }));
  };

  const handleSelectSchemeFromIndex = (schemeNode: GraphNode) => {
  setSelectedNode(schemeNode);
  setSelectedLink(null);

  if (graphRef.current) {
    // Pega as coordenadas x e y do nó dentro da simulação D3
    const x = (schemeNode as any).x || 0;
    const y = (schemeNode as any).y || 0;
    
    // Centraliza a câmera e aplica o zoom no nó selecionado
    if (typeof graphRef.current.centerAt === 'function') {
      graphRef.current.centerAt(x, y, 600);
    }
    if (typeof graphRef.current.zoom === 'function') {
      graphRef.current.zoom(2.5, 600);
    }
  }
};

  return (
    <div className="relative h-screen w-screen bg-[#080d16] bg-grid-pattern text-slate-100 font-sans overflow-hidden flex flex-col">
      {/* Permanent Header Bar */}
      <HeaderBar activePage={activePage} setActivePage={setActivePage} />

      <div className="flex flex-1 w-full h-[calc(100vh-4rem)] relative overflow-hidden">
        {/* Sliding White Page Overlay (Infographics & Glossary) covering network graph and sidebar */}
        <HeaderOverlay 
          activePage={activePage} 
          onClose={() => setActivePage('graph')} 
          graphData={graphData} 
        />

        <SidebarControls
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          startYearFilter={startYearFilter}
          setStartYearFilter={setStartYearFilter}
          typeFilters={typeFilters}
          toggleTypeFilter={toggleTypeFilter}
          statusFilters={statusFilters}
          toggleStatusFilter={toggleStatusFilter}
          nodeCount={filteredData.nodes.length}
          linkCount={filteredData.links.length}
          nodes={filteredData.nodes}
          selectedNode={selectedNode}
          onSelectScheme={handleSelectSchemeFromIndex}
        />

        <main className="relative flex-1 w-full h-full overflow-hidden bg-[#080d16]">
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#080d16] z-30">
              <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-3" />
              <span className="text-xs font-mono text-cyan-400">Loading Cloudflare D1 Database...</span>
            </div>
          ) : error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#080d16] z-30 p-6 text-center">
              <span className="text-red-400 font-mono text-sm mb-2">D1 Database Connection Failure</span>
              <p className="text-slate-400 text-xs max-w-md mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 rounded border border-slate-700"
              >
                Retry Request
              </button>
            </div>
          ) : (
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
          )}

          <TimelineWidget
            startYear={startYearFilter}
            setStartYear={setStartYearFilter}
          />
        </main>

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
    </div>
  );
}