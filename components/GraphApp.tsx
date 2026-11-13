'use client';

/**
 * ============================================================================
 * GRAPHAPP — a aplicação interativa da página inicial (roda no navegador)
 * ============================================================================
 * Orquestra a aplicação:
 *   - busca os dados em /api/graph (com limite de tempo e uma nova tentativa
 *     automática; o botão "Tentar novamente" refaz à mão);
 *   - guarda o estado dos filtros (busca, ano, tipos, status);
 *   - calcula `filteredData` (o que o grafo mostra) a partir dos filtros;
 *   - guarda qual nó/link está selecionado e repassa aos painéis.
 *
 * A parte do servidor (título, texto para busca e leitores de tela) fica em
 * app/page.tsx, que renderiza este componente.
 * ============================================================================
 */

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import HeaderBar, { ActivePage } from '@/components/HeaderBar';
import dynamic from 'next/dynamic';
import MobileTimeline from '@/components/MobileTimeline';
import NetworkGraph from '@/components/NetworkGraph';
import SidebarControls from '@/components/SidebarControls';
import InspectorDrawer from '@/components/InspectorDrawer';
import AdBanner from '@/components/AdBanner';
import { GraphNode, GraphLink, NodeType, LinkStatus, GraphData } from '@/types/graph';
import { getLinkEnds, normalizeText, STATUS_STYLE } from '@/lib/graphConfig';
import { computeSchemeStartYears } from '@/lib/schemes';
import { ADSENSE_CLIENT, ADSENSE_SLOTS } from '@/lib/site';
import { useI18n } from '@/components/I18nProvider';
import { DEFAULT_LOCALE } from '@/lib/i18n';

/**
 * Infográficos/Glossário: carregados À PARTE do JavaScript inicial. O painel
 * traz todos os textos dos dossiês (~115 KB) e só é visto se o usuário clicar
 * num dos botões do cabeçalho — então é baixado depois que o grafo já está na
 * tela (ou no primeiro clique, o que vier antes).
 */
const HeaderOverlay = dynamic(() => import('@/components/HeaderOverlay'), { ssr: false });

/** /api/graph: tempo máximo de espera por tentativa e nº de tentativas. */
const FETCH_TIMEOUT_MS = 15000;
const FETCH_ATTEMPTS = 2;
/** Espera (ms) depois da última tecla antes de a busca filtrar o grafo. */
const SEARCH_DEBOUNCE_MS = 200;

/** Devolve `value` só depois de `ms` sem mudanças (para não refazer o layout a cada tecla). */
function useDebounced<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return debounced;
}

/** Intervalo do controle de ano enquanto os dados não chegam (ou se nenhum link tiver ano). */
const FALLBACK_YEAR_RANGE = { min: 1989, max: new Date().getFullYear() };

/**
 * Filtros de "Tipos de Entidade" e "Status Jurídico" funcionam por SELEÇÃO:
 * começam todos desmarcados (= tudo visível no grafo). Marcar um ou mais
 * mostra SÓ os marcados; "Limpar filtros" volta a mostrar tudo.
 */
const NO_TYPE_SELECTED: Record<NodeType, boolean> = {
  politician: false,
  party: false,
  scheme: false,
  company: false,
  operator: false,
};

/** As chaves vêm de STATUS_STYLE em lib/graphConfig.ts. */
const NO_STATUS_SELECTED = Object.fromEntries(
  Object.keys(STATUS_STYLE).map((k) => [k, false])
) as Record<LinkStatus, boolean>;

export default function GraphApp() {
  // Idioma da página: define os textos da interface e o idioma dos dados (/api/graph?lang=…).
  const { t, locale } = useI18n();
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
  // Selecionar (toque/clique no grafo) só destaca o item e mostra o botão
  // flutuante "Exibir detalhes"; o painel de detalhes abre por esse botão.
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  // O campo de busca responde na hora; o grafo só refaz o layout quando a
  // digitação para (cada mudança reposiciona os nós e move a câmera).
  const debouncedSearch = useDebounced(searchQuery, SEARCH_DEBOUNCE_MS);
  const [startYearFilter, setStartYearFilter] = useState(FALLBACK_YEAR_RANGE.min);
  // true = marcado. Nenhum marcado = sem filtro (tudo visível).
  const [typeFilters, setTypeFilters] = useState<Record<NodeType, boolean>>(NO_TYPE_SELECTED);
  const [statusFilters, setStatusFilters] = useState<Record<LinkStatus, boolean>>(NO_STATUS_SELECTED);

  // Ano de início de cada esquema = ano do seu vínculo datado mais antigo.
  // É ele que o slider "Ano de Início" compara: um esquema de 1993 some por
  // inteiro ao passar de 1993, mesmo que tenha desdobramentos datados de 2015
  // ou vínculos sem ano. Esquema sem nenhum vínculo datado não tem ano de
  // início e não é afetado pelo slider.
  const schemeStartYear = useMemo(() => computeSchemeStartYears(graphData.nodes, graphData.links), [graphData]);

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

  // Celular (< 768px, mesmo limite do `md` do Tailwind): na primeira carga, o
  // slider começa no ano atual — ou no ano mais próximo dele que os dados
  // permitem (o máximo do slider é o início do esquema mais recente). No
  // desktop continua começando no ano mais antigo. Roda uma vez só: recarregar
  // os dados ou girar a tela não desfaz a escolha do usuário.
  const mobileYearInitDone = useRef(false);
  useEffect(() => {
    if (mobileYearInitDone.current || graphData.links.length === 0) return;
    mobileYearInitDone.current = true;
    if (!window.matchMedia('(max-width: 767px)').matches) return;
    const now = new Date().getFullYear();
    setStartYearFilter(Math.max(yearRange.min, Math.min(now, yearRange.max)));
  }, [graphData.links.length, yearRange]);

  // --- Carregamento dos dados ----------------------------------------------
  // AbortController cancela a requisição se o componente desmontar no meio.
  // Falha de rede, tempo esgotado ou erro 5xx → uma nova tentativa automática
  // (rede de celular oscilando, banco acordando) antes de mostrar o erro.
  useEffect(() => {
    const controller = new AbortController();

    const attempt = async (): Promise<{ data?: GraphData; error?: { message: string; detail?: string }; retry: boolean }> => {
      const timeout = new AbortController();
      const timer = setTimeout(() => timeout.abort(), FETCH_TIMEOUT_MS);
      const onAbort = () => timeout.abort();
      controller.signal.addEventListener('abort', onAbort);
      try {
        // cache: 'no-store' → o navegador nunca usa uma cópia guardada da API
        // (a rota tem um cache curto na BORDA; ver app/api/graph/route.ts).
        const apiUrl = locale === DEFAULT_LOCALE ? '/api/graph' : `/api/graph?lang=${locale}`;
        const res = await fetch(apiUrl, { signal: timeout.signal, cache: 'no-store' });
        if (!res.ok) {
          // A API devolve { code, error, detail } explicando a causa. Sem
          // corpo legível, cai no status HTTP.
          const body = await res.json().catch(() => null);
          return {
            error: {
              // O diagnóstico da API é em português (é para quem mantém o site);
              // nos outros idiomas vai um aviso genérico, e o código do erro em `detail`.
              message: locale === DEFAULT_LOCALE ? body?.error || t.app.apiStatus(res.status) : t.app.loadFailedGeneric,
              detail: [body?.code, body?.detail].filter(Boolean).join(' — ') || undefined,
            },
            // Erros de configuração (sem banco, sem tabelas) não mudam sozinhos.
            retry: res.status >= 500 && !['NO_BINDING', 'NO_TABLES', 'SCHEMA_MISMATCH'].includes(body?.code),
          };
        }
        const data = await res.json();
        if (!Array.isArray(data?.nodes) || !Array.isArray(data?.links)) {
          return { error: { message: t.app.badFormat }, retry: true };
        }
        return { data, retry: false };
      } catch (e: any) {
        if (controller.signal.aborted) return { retry: false };
        console.error('Failed to load graph data:', e);
        const timedOut = e?.name === 'AbortError';
        return {
          error: {
            message: timedOut
              ? t.app.timeout
              : t.app.offline,
            detail: timedOut ? undefined : e?.message,
          },
          retry: true,
        };
      } finally {
        clearTimeout(timer);
        controller.signal.removeEventListener('abort', onAbort);
      }
    };

    (async () => {
      setIsLoading(true);
      setError(null);
      let result = await attempt();
      for (let n = 1; n < FETCH_ATTEMPTS && result.retry && !controller.signal.aborted; n++) {
        await new Promise((r) => setTimeout(r, 800 * n));
        if (controller.signal.aborted) return;
        result = await attempt();
      }
      if (controller.signal.aborted) return;
      if (result.data) {
        setGraphData(result.data);
        const years = result.data.links.map((l) => Number(l.year)).filter((y) => Number.isFinite(y) && y > 0);
        if (years.length > 0) setStartYearFilter(Math.min(...years));
      } else if (result.error) {
        setError(result.error);
      }
      setIsLoading(false);
    })();

    return () => controller.abort();
  }, [reloadKey, locale, t]);

  // Baixa o painel de Infográficos/Glossário quando o navegador estiver
  // ocioso depois de o grafo aparecer; um clique no cabeçalho antes disso
  // também o carrega. Depois de montado, fica montado (a animação de
  // abrir/fechar depende disso).
  const [overlayMounted, setOverlayMounted] = useState(false);
  const hasData = graphData.nodes.length > 0;
  useEffect(() => {
    if (overlayMounted) return;
    if (activePage !== 'graph') {
      setOverlayMounted(true);
      return;
    }
    if (!hasData) return;
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(() => setOverlayMounted(true), { timeout: 4000 });
      return () => w.cancelIdleCallback?.(id);
    }
    const id = setTimeout(() => setOverlayMounted(true), 2000);
    return () => clearTimeout(id);
  }, [overlayMounted, activePage, hasData]);

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
    const query = normalizeText(debouncedSearch.trim());
    let matches = new Set<string>();

    const schemeOk = (id: string) => {
      const start = schemeStartYear.get(id);
      return start === undefined || start >= startYearFilter;
    };

    const anyStatusSelected = Object.values(statusFilters).some(Boolean);
    const validLinks = graphData.links.filter((link) => {
      const matchStatus = !anyStatusSelected || (statusFilters[link.status] ?? false);
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

    const anyTypeSelected = Object.values(typeFilters).some(Boolean);
    const typeOk = (n: GraphNode) => !anyTypeSelected || (typeFilters[n.type] ?? false);

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

    // Passo 4: "conectado" = tem pelo menos um vínculo que passa nos filtros
    // de ano e status (validLinks), MESMO que a outra ponta esteja oculta pelo
    // filtro de tipo. Antes contavam só os vínculos visíveis — e como não há
    // vínculos esquema–esquema nem partido–partido no banco, marcar só
    // "Esquemas" ou só "Partidos" esvaziava o grafo.
    const connected = new Set<string>();
    for (const l of validLinks) {
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
  }, [graphData, nodeTypeById, schemeStartYear, startYearFilter, typeFilters, statusFilters, debouncedSearch]);

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

  const clearTypeFilters = useCallback(() => setTypeFilters(NO_TYPE_SELECTED), []);
  const clearStatusFilters = useCallback(() => setStatusFilters(NO_STATUS_SELECTED), []);

  // No grafo (e no Índice de Esquemas): seleciona sem abrir o painel.
  const selectNode = useCallback((node: GraphNode) => {
    setSelectedNode(node);
    setSelectedLink(null);
    setDetailsOpen(false);
  }, []);

  const selectLink = useCallback((link: GraphLink) => {
    setSelectedLink(link);
    setSelectedNode(null);
    setDetailsOpen(false);
  }, []);

  // Dentro do painel de detalhes: navegar entre itens mantém o painel aberto.
  const selectNodeInDrawer = useCallback((node: GraphNode) => {
    setSelectedNode(node);
    setSelectedLink(null);
    setDetailsOpen(true);
  }, []);

  const selectLinkInDrawer = useCallback((link: GraphLink) => {
    setSelectedLink(link);
    setSelectedNode(null);
    setDetailsOpen(true);
  }, []);

  const openDetails = useCallback(() => setDetailsOpen(true), []);
  const closeDetails = useCallback(() => setDetailsOpen(false), []);

  const clearSelection = useCallback(() => {
    setSelectedNode(null);
    setSelectedLink(null);
    setDetailsOpen(false);
  }, []);

  // Clique no "Índice de Esquemas" da barra lateral: seleciona e voa até o nó.
  // 2.5 = nível de zoom; 600 = duração da animação em ms.
  // Selecionar já basta: o grafo enquadra o esquema e seus vizinhos.
  const handleSelectSchemeFromIndex = useCallback((schemeNode: GraphNode) => {
    selectNode(schemeNode);
  }, [selectNode]);


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
        {overlayMounted && <HeaderOverlay activePage={activePage} graphData={graphData} />}

        <SidebarControls
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          startYearFilter={startYearFilter}
          setStartYearFilter={setStartYearFilter}
          minYear={yearRange.min}
          maxYear={yearRange.max}
          typeFilters={typeFilters}
          toggleTypeFilter={toggleTypeFilter}
          clearTypeFilters={clearTypeFilters}
          statusFilters={statusFilters}
          toggleStatusFilter={toggleStatusFilter}
          clearStatusFilters={clearStatusFilters}
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
              <span className="text-xs font-mono text-cyan-400">{t.app.loading}</span>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#080d16] z-30 p-6 text-center">
              <span className="text-red-400 font-mono text-sm mb-2">{t.app.loadFailed}</span>
              <p className="text-slate-300 text-xs max-w-lg mb-2 leading-relaxed">{error.message}</p>
              {error.detail && (
                <code className="text-[11px] text-slate-500 max-w-lg mb-4 break-words">{error.detail}</code>
              )}
              <button
                onClick={() => setReloadKey((k) => k + 1)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 rounded border border-slate-700"
              >
                {t.common.tryAgain}
              </button>
            </div>
          )}

          {/* Banco ligado e com tabelas, mas ainda sem nenhum dossiê inserido */}
          {!error && !isLoading && graphData.nodes.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-6 text-center pointer-events-none">
              <span className="text-cyan-400 font-mono text-sm mb-2">{t.app.emptyTitle}</span>
              <p className="text-slate-400 text-xs max-w-md leading-relaxed">
                {t.app.emptyBody}
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
              onClearSelection={clearSelection}
              showPartyLinks={typeFilters.party}
              detailsOpen={detailsOpen}
              onOpenDetails={openDetails}
              // Pausa a animação enquanto Infográficos/Glossário cobrem o grafo.
              paused={activePage !== 'graph'}
            />
          )}

          <AdBanner adClient={ADSENSE_CLIENT} adSlot={ADSENSE_SLOTS.banner} />
        </main>

        {/* Painel de detalhes: só abre pelo botão "Exibir detalhes". Fechar
            mantém o item destacado no grafo (tocar no fundo limpa a seleção). */}
        <InspectorDrawer
          selectedNode={detailsOpen ? selectedNode : null}
          selectedLink={detailsOpen ? selectedLink : null}
          onClose={closeDetails}
          filteredData={filteredData}
          fullNodes={graphData.nodes}
          onSelectLink={selectLinkInDrawer}
          onSelectNode={selectNodeInDrawer}
        />
      </div>
    </div>
  );
}
