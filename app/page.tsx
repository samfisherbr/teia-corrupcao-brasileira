'use client';

// NOTE: `export const runtime = 'edge'` was removed. This page is a client
// component with no server data, so it can be statically prerendered; only
// /api/graph needs the edge runtime for next-on-pages.

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import HeaderBar, { ActivePage } from '@/components/HeaderBar';
import HeaderOverlay from '@/components/HeaderOverlay';
import NetworkGraph from '@/components/NetworkGraph';
import SidebarControls from '@/components/SidebarControls';
import InspectorDrawer from '@/components/InspectorDrawer';
import AdBanner from '@/components/AdBanner';
import { GraphNode, GraphLink, NodeType, LinkStatus, GraphData } from '@/types/graph';
import { getLinkEnds, normalizeText } from '@/lib/graphConfig';

const FALLBACK_YEAR_RANGE = { min: 1989, max: new Date().getFullYear() };

export default function Page() {
  const graphRef = useRef<any>(null);

  const [activePage, setActivePage] = useState<ActivePage>('graph');

  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [selectedLink, setSelectedLink] = useState<GraphLink | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [startYearFilter, setStartYearFilter] = useState(FALLBACK_YEAR_RANGE.min);
  const [typeFilters, setTypeFilters] = useState<Record<NodeType, boolean>>({
    politician: true,
    party: true,
    scheme: true,
    company: true,
    operator: true,
  });
  const [statusFilters, setStatusFilters] = useState<Record<LinkStatus, boolean>>({
    confirmed: true,
    under_investigation: true,
    acquitted: true,
  });

  // Slider bounds come from the data. The old slider was hard-coded to
  // 2000–2026, so 1990s cases (PC Farias, Anões, SIVAM…) vanished as soon as
  // the user touched it.
  const yearRange = useMemo(() => {
    const years = graphData.links
      .map((l) => Number(l.year))
      .filter((y) => Number.isFinite(y) && y > 0);
    if (years.length === 0) return FALLBACK_YEAR_RANGE;
    return { min: Math.min(...years), max: Math.max(...years) };
  }, [graphData.links]);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/graph', { signal: controller.signal });
        if (!res.ok) throw new Error(`A API retornou status ${res.status}`);
        const data = await res.json();
        if (!Array.isArray(data?.nodes) || !Array.isArray(data?.links)) {
          throw new Error('Resposta da API em formato inesperado.');
        }
        setGraphData(data);
        const years = (data.links as GraphLink[])
          .map((l) => Number(l.year))
          .filter((y) => Number.isFinite(y) && y > 0);
        if (years.length > 0) setStartYearFilter(Math.min(...years));
      } catch (e: any) {
        if (e?.name === 'AbortError') return;
        console.error('Failed to load graph data:', e);
        setError(e?.message || 'Erro ao conectar ao banco de dados');
      } finally {
        // Previously the spinner was only cleared by a callback from the graph
        // component, which never fired if the dynamic chunk mounted late.
        if (!controller.signal.aborted) setIsLoading(false);
      }
    })();

    return () => controller.abort();
  }, [reloadKey]);

  const filteredData = useMemo<GraphData>(() => {
    const query = normalizeText(searchQuery.trim());

    const validLinks = graphData.links.filter((link) => {
      // Links with no year are kept (they used to be silently dropped,
      // because `null >= 2000` is false).
      const matchYear = link.year == null || link.year >= startYearFilter;
      const matchStatus = statusFilters[link.status] ?? true;
      return matchYear && matchStatus;
    });

    const typeOk = (n: GraphNode) => typeFilters[n.type] ?? true;

    let visibleIds: Set<string>;
    if (!query) {
      visibleIds = new Set(graphData.nodes.filter(typeOk).map((n) => n.id));
    } else {
      // Search keeps the matches AND their direct neighbours, so a hit is shown
      // in context instead of as an isolated dot with no edges.
      const matches = new Set(
        graphData.nodes
          .filter((n) => typeOk(n) && (normalizeText(n.label).includes(query) || normalizeText(n.party).includes(query)))
          .map((n) => n.id)
      );
      visibleIds = new Set(matches);
      for (const l of validLinks) {
        const { sourceId, targetId } = getLinkEnds(l);
        if (matches.has(sourceId)) visibleIds.add(targetId);
        if (matches.has(targetId)) visibleIds.add(sourceId);
      }
      const typeOkIds = new Set(graphData.nodes.filter(typeOk).map((n) => n.id));
      visibleIds.forEach((id) => { if (!typeOkIds.has(id)) visibleIds.delete(id); });
    }

    return {
      nodes: graphData.nodes.filter((n) => visibleIds.has(n.id)),
      links: validLinks.filter((l) => {
        const { sourceId, targetId } = getLinkEnds(l);
        return visibleIds.has(sourceId) && visibleIds.has(targetId);
      }),
    };
  }, [graphData, startYearFilter, typeFilters, statusFilters, searchQuery]);

  const toggleTypeFilter = useCallback((type: NodeType) => {
    setTypeFilters((prev) => ({ ...prev, [type]: !prev[type] }));
  }, []);

  const toggleStatusFilter = useCallback((status: LinkStatus) => {
    setStatusFilters((prev) => ({ ...prev, [status]: !prev[status] }));
  }, []);

  const selectNode = useCallback((node: GraphNode) => {
    setSelectedNode(node);
    setSelectedLink(null);
  }, []);

  const selectLink = useCallback((link: GraphLink) => {
    setSelectedLink(link);
    setSelectedNode(null);
  }, []);

  const handleSelectSchemeFromIndex = useCallback((schemeNode: GraphNode) => {
    selectNode(schemeNode);
    const fg = graphRef.current;
    if (fg && typeof schemeNode.x === 'number' && typeof schemeNode.y === 'number') {
      fg.centerAt(schemeNode.x, schemeNode.y, 600);
      fg.zoom(2.5, 600);
    }
  }, [selectNode]);

  const adClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const adSlot = process.env.NEXT_PUBLIC_ADSENSE_SLOT;

  return (
    <div className="relative h-[100dvh] w-full bg-[#080d16] text-slate-100 font-sans overflow-hidden flex flex-col">
      <HeaderBar activePage={activePage} setActivePage={setActivePage} />

      <div className="flex flex-1 w-full min-h-0 relative overflow-hidden">
        <HeaderOverlay activePage={activePage} graphData={graphData} />

        <SidebarControls
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          startYearFilter={startYearFilter}
          setStartYearFilter={setStartYearFilter}
          minYear={yearRange.min}
          maxYear={yearRange.max}
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
          {isLoading && !error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#080d16] z-30">
              <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-3" />
              <span className="text-xs font-mono text-cyan-400">Carregando a teia…</span>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#080d16] z-30 p-6 text-center">
              <span className="text-red-400 font-mono text-sm mb-2">Falha ao carregar os dados</span>
              <p className="text-slate-400 text-xs max-w-md mb-4">{error}</p>
              <button
                onClick={() => setReloadKey((k) => k + 1)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 rounded border border-slate-700"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {!error && !isLoading && (
            <NetworkGraph
              graphRef={graphRef}
              graphData={filteredData}
              selectedNode={selectedNode}
              selectedLink={selectedLink}
              onSelectNode={selectNode}
              onSelectLink={selectLink}
            />
          )}

          {adClient && adSlot && <AdBanner adClient={adClient} adSlot={adSlot} />}
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
          onSelectLink={selectLink}
          onSelectNode={selectNode}
        />
      </div>
    </div>
  );
}
