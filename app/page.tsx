'use client';

import React, { useState, useMemo, useRef } from 'react';
import SidebarControls from '../components/SidebarControls';
import NetworkGraph from '../components/NetworkGraph';
import InspectorDrawer from '../components/InspectorDrawer';
import { INITIAL_DATA } from '../data/sanguesugadata';
import { GraphNode, GraphLink, NodeType, LinkStatus } from '../types/graph';

export default function Page() {
  const graphRef = useRef<any>(null);

  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [selectedLink, setSelectedLink] = useState<GraphLink | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [startYearFilter, setStartYearFilter] = useState(2000);
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

  const filteredData = useMemo(() => {
    const validLinks = INITIAL_DATA.links.filter(link => {
      const matchYear = link.year >= startYearFilter;
      const matchStatus = statusFilters[link.status];
      return matchYear && matchStatus;
    });

    const validNodes = INITIAL_DATA.nodes.filter(node => {
      const matchType = typeFilters[node.type];
      const matchSearch = searchQuery === '' || 
        node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.party.toLowerCase().includes(searchQuery.toLowerCase());
      
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
  }, [startYearFilter, typeFilters, statusFilters, searchQuery]);

  const toggleTypeFilter = (type: NodeType) => {
    setTypeFilters(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const toggleStatusFilter = (status: LinkStatus) => {
    setStatusFilters(prev => ({ ...prev, [status]: !prev[status] }));
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-100 font-sans overflow-hidden">
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
      />

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

      <InspectorDrawer
        selectedNode={selectedNode}
        selectedLink={selectedLink}
        onClose={() => {
          setSelectedNode(null);
          setSelectedLink(null);
        }}
        filteredData={filteredData}
        fullNodes={INITIAL_DATA.nodes}
        onSelectLink={(link) => {
          setSelectedLink(link);
          setSelectedNode(null);
        }}
      />
    </div>
  );
}
