'use client';

/**
 * ============================================================================
 * PÁGINA PRINCIPAL (/)
 * ============================================================================
 * Orquestra a aplicação:
 *   - busca os dados em /api/graph (uma vez; botão "Tentar novamente" refaz);
 *   - guarda o estado dos filtros (busca, ano, tipos, status);
 *   - calcula `filteredData` (o que o grafo mostra) a partir dos filtros;
 *   - guarda qual nó/link está selecionado e repassa aos painéis.
 *
 * Sem `export const runtime = 'edge'` aqui de propósito: a página é estática
 * (componente cliente sem dados de servidor). Só a rota /api/graph precisa
 * do runtime edge para o Cloudflare (next-on-pages).
 * ============================================================================
 */

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import HeaderBar, { ActivePage } from '@/components/HeaderBar';
import HeaderOverlay from '@/components/HeaderOverlay';
import MobileTimeline from '@/components/MobileTimeline';
import NetworkGraph from '@/components/NetworkGraph';
import SidebarControls from '@/components/SidebarControls';
import InspectorDrawer from '@/components/InspectorDrawer';
import AdBanner from '@/components/AdBanner';
import { GraphNode, GraphLink, NodeType, LinkStatus, GraphData } from '@/types/graph';
import { getLinkEnds, normalizeText, STATUS_STYLE } from '@/lib/graphConfig';

/** Intervalo do controle de ano enquanto os dados não chegam (ou se nenhum link tiver ano). */
const FALLBACK_YEAR_RANGE = { min: 1989, max: new Date().getFullYear() };

/** Todos os tipos de entidade começam visíveis. Troque `true` por `false` para esconder um tipo por padrão. */
const INITIAL_TYPE_FILTERS: Record<NodeType, boolean> = {
  politician: true,
  party: true,
  scheme: true,
  company: true,
  operator: true,
};

/** Todos os status começam visíveis (as chaves vêm de STATUS_STYLE em lib/graphConfig.ts). */
const INITIAL_STATUS_FILTERS = Object.fromEntries(
  Object.keys(STATUS_STYLE).map((k) => [k, true])
) as Record<LinkStatus, boolean>;

export default function Page() {
  // Instância do grafo (zoom, centerAt…). Preenchida pelo NetworkGraph.
  const graphRef = useRef<any>(null);

  // --- Estado de navegação e dados ---------------------------------------
  const [activePage, setActivePage] = useState<ActivePage>('graph');

  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [isLoading, setIsLoading] = useState(true);
  // Falha ao carregar: `message` é o texto principal (vindo da API quando ela
  // explica a causa) e `detail` a mensagem técnica original do D1, se houver.
  const [error, setError] = useState<{ message: string; detail?: string } | null>(null);
  const [reloadKey, setReloadKey] = useState(0); // incrementar = buscar os dados de novo

  // --- Seleção e filtros ---------------------------------------------------

  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [selectedLink, setSelectedLink] = useState<GraphLink | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [startYearFilter, setStartYearFilter] = useState(FALLBACK_YEAR_RANGE.min);
  const [typeFilters, setTypeFilters] = useState<Record<NodeType, boolean>>(INITIAL_TYPE_FILTERS);
  const [statusFilters, setStatusFilters] = useState<Record<LinkStatus, boolean>>(INITIAL_STATUS_FILTERS);

  // Ano de início de cada esquema = ano do seu vínculo datado mais antigo.
  // É ele que o slider "Ano de Início" compara: um esquema de 1993 some por
  // inteiro ao passar de 1993, mesmo que tenha desdobramentos datados de 2015
  // ou vínculos sem ano. Esquema sem nenhum vínculo datado não tem ano de
  // início e não é afetado pelo slider.
  const schemeStartYear = useMemo(() => {
    const schemeIds = new Set(graphData.nodes.filter((n) => n.type === 'scheme').map((n) => n.id));
    const start = new Map<string, number>();
    for (const l of graphData.links) {
      const y = Number(l.year);
      if (!Number.isFinite(y) || y <= 0) continue;
      const { sourceId, targetId } = getLinkEnds(l);
      for (const id of [sourceId, targetId]) {
        if (schemeIds.has(id) && (!start.has(id) || y < start.get(id)!)) start.set(id, y);
      }
    }
    return start;
  }, [graphData]);

  // Limites do slider vêm dos dados. O máximo é o início do esquema mais
  // recente (passar dele esvaziaria o grafo); sem esquemas datados, usa os
  // anos dos vínculos. O antigo slider fixo em 2000–2026 escondia os casos
  // dos anos 1990 (PC Farias, Anões, SIVAM…) assim que era tocado.
  const yearRange = useMemo(() => {
    const linkYears = graphData.links
      .map((l) => Number(l.year))
      .filter((y) => Number.isFinite(y) && y > 0);
    if (linkYears.length === 0) return FALLBACK_YEAR_RANGE;
    const starts = Array.from(schemeStartYear.values());
    const min = Math.min(...linkYears);
    const max = starts.length > 0 ? Math.max(...starts) : Math.max(...linkYears);
    return { min, max: Math.max(min, max) };
  }, [graphData.links, schemeStartYear]);

  // --- Carregamento dos dados ----------------------------------------------
  // AbortController cancela a requisição se o componente desmontar no meio.
  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        // cache: 'no-store' → o navegador nunca usa uma cópia guardada da API
        // (complementa o Cache-Control: no-store da rota). Sem isso, um celular
        // podia continuar mostrando dados antigos depois de novos INSERTs.
        const res = await fetch('/api/graph', { signal: controller.signal, cache: 'no-store' });
        if (!res.ok) {
          // A API devolve { code, error, detail } explicando a causa (ver
          // app/api/graph/route.ts). Sem corpo legível, cai no status HTTP.
          const body = await res.json().catch(() => null);
          setError({
            message: body?.error || `A API retornou status ${res.status}.`,
            detail: [body?.code, body?.detail].filter(Boolean).join(' — ') || undefined,
          });
          return;
        }
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
        setError({ message: e?.message || 'Erro ao conectar ao banco de dados.' });
      } finally {
        // Previously the spinner was only cleared by a callback from the graph
        // component, which never fired if the dynamic chunk mounted late.
        if (!controller.signal.aborted) setIsLoading(false);
      }
    })();

    return () => controller.abort();
  }, [reloadKey]);

  // --- Filtragem -------------------------------------------------------------
  // 1) links: status marcado e filtro de ano —
  //    - link ligado a um esquema: passa se o esquema começou no ano do filtro
  //      ou depois (ver schemeStartYear); o ano do próprio link não importa;
  //    - outros links (ex.: político–partido): ano >= filtro, e links sem ano
  //      sempre passam;
  // 2) nós: tipo marcado; com busca, os encontrados + vizinhos diretos;
  // 3) só ficam links cujas DUAS pontas estão visíveis;
  // 4) somem os nós que ficaram sem nenhum link visível (ex.: ao mover o
  //    slider de ano ou desmarcar um tipo). Exceções que continuam na tela:
  //    os resultados diretos da busca (para a busca nunca parecer vazia) e o
  //    nó selecionado (para o painel de detalhes não descrever um nó sumido).
  //    Nós sem nenhum link no banco também ficam ocultos.
  const nodeTypeById = useMemo(() => new Map(graphData.nodes.map((n) => [n.id, n.type])), [graphData.nodes]);

  const baseFiltered = useMemo(() => {
    const query = normalizeText(searchQuery.trim());
    let matches = new Set<string>();

    const schemeOk = (id: string) => {
      const start = schemeStartYear.get(id);
      return start === undefined || start >= startYearFilter;
    };

    const validLinks = graphData.links.filter((link) => {
      const matchStatus = statusFilters[link.status] ?? true;
      if (!matchStatus) return false;
      const { sourceId, targetId } = getLinkEnds(link);
      const touchesScheme = nodeTypeById.get(sourceId) === 'scheme' || nodeTypeById.get(targetId) === 'scheme';
      if (touchesScheme) {
        // Ambas as pontas que forem esquemas precisam passar (link esquema–esquema).
        return [sourceId, targetId].every((id) => nodeTypeById.get(id) !== 'scheme' || schemeOk(id));
      }
      // Links sem ano são mantidos (antes sumiam: `null >= 2000` é false).
      return link.year == null || link.year >= startYearFilter;
    });

    const typeOk = (n: GraphNode) => typeFilters[n.type] ?? true;

    let visibleIds: Set<string>;
    if (!query) {
      visibleIds = new Set(graphData.nodes.filter(typeOk).map((n) => n.id));
    } else {
      // Search keeps the matches AND their direct neighbours, so a hit is shown
      // in context instead of as an isolated dot with no edges.
      matches = new Set(
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

    const links = validLinks.filter((l) => {
      const { sourceId, targetId } = getLinkEnds(l);
      return visibleIds.has(sourceId) && visibleIds.has(targetId);
    });

    // Passo 4: uma passada basta — tirar um nó sem links não remove outros links.
    const connected = new Set<string>();
    for (const l of links) {
      const { sourceId, targetId } = getLinkEnds(l);
      connected.add(sourceId);
      connected.add(targetId);
    }
    const keep = (id: string) => connected.has(id) || matches.has(id);

    return {
      data: { nodes: graphData.nodes.filter((n) => visibleIds.has(n.id) && keep(n.id)), links } as GraphData,
      // Passaram nos filtros mas ficaram sem links (só voltam se selecionados).
      isolatedIds: new Set(graphData.nodes.filter((n) => visibleIds.has(n.id) && !keep(n.id)).map((n) => n.id)),
    };
  }, [graphData, nodeTypeById, schemeStartYear, startYearFilter, typeFilters, statusFilters, searchQuery]);

  // Exceção do nó selecionado, separada para que selecionar um nó comum não
  // gere arrays novos (o que reaqueceria a simulação do grafo a cada clique).
  const selectedId = selectedNode?.id;
  const filteredData = useMemo<GraphData>(() => {
    const { data, isolatedIds } = baseFiltered;
    if (!selectedId || !isolatedIds.has(selectedId)) return data;
    const shown = new Set(data.nodes.map((n) => n.id));
    return { nodes: graphData.nodes.filter((n) => n.id === selectedId || shown.has(n.id)), links: data.links };
  }, [baseFiltered, selectedId, graphData.nodes]);

  // --- Ações ------------------------------------------------------------------
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

  // Clique no "Índice de Esquemas" da barra lateral: seleciona e voa até o nó.
  // 2.5 = nível de zoom; 600 = duração da animação em ms.
  const handleSelectSchemeFromIndex = useCallback((schemeNode: GraphNode) => {
    selectNode(schemeNode);
    const fg = graphRef.current;
    if (fg && typeof schemeNode.x === 'number' && typeof schemeNode.y === 'number') {
      fg.centerAt(schemeNode.x, schemeNode.y, 600);
      fg.zoom(2.5, 600);
    }
  }, [selectNode]);

  // Anúncio só aparece se as duas variáveis de ambiente existirem (ver README).
  const adClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const adSlot = process.env.NEXT_PUBLIC_ADSENSE_SLOT;

  return (
    <div className="relative h-[100dvh] w-full bg-[#080d16] text-slate-100 font-sans overflow-hidden flex flex-col">
      <HeaderBar activePage={activePage} setActivePage={setActivePage} />

      {/* Filtro de ano no celular (a barra lateral some < 768px). Oculto com
          Infográficos/Glossário abertos, que não dependem dele. */}
      {activePage === 'graph' && (
        <MobileTimeline
          startYearFilter={startYearFilter}
          setStartYearFilter={setStartYearFilter}
          minYear={yearRange.min}
          maxYear={yearRange.max}
          nodeCount={filteredData.nodes.length}
        />
      )}

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
              <p className="text-slate-300 text-xs max-w-lg mb-2 leading-relaxed">{error.message}</p>
              {error.detail && (
                <code className="text-[11px] text-slate-500 max-w-lg mb-4 break-words">{error.detail}</code>
              )}
              <button
                onClick={() => setReloadKey((k) => k + 1)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 rounded border border-slate-700"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {/* Banco ligado e com tabelas, mas ainda sem nenhum dossiê inserido */}
          {!error && !isLoading && graphData.nodes.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-6 text-center pointer-events-none">
              <span className="text-cyan-400 font-mono text-sm mb-2">Banco conectado, ainda sem dados</span>
              <p className="text-slate-400 text-xs max-w-md leading-relaxed">
                Insira o SQL da Fase 2 de um dossiê aprovado (nodes antes de links). Os dados aparecem aqui assim
                que a página for recarregada.
              </p>
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
              // Pausa a animação enquanto Infográficos/Glossário cobrem o grafo.
              paused={activePage !== 'graph'}
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
