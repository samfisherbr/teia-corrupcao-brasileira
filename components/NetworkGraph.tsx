'use client';

/**
 * ============================================================================
 * NETWORKGRAPH — o grafo interativo (canvas 2D)
 * ============================================================================
 * Responsável por:
 *   1. medir o espaço disponível e redimensionar o canvas;
 *   2. calcular o layout radial (lib/layout.ts) e configurar a física d3;
 *   3. desenhar círculos, imagens, linhas e — numa passada FINAL — os rótulos,
 *      para que o texto fique sempre por cima de círculos e linhas;
 *   4. legendas, controles de câmera e menu de páginas legais.
 *
 * Ordem de pintura em cada quadro (feita pela biblioteca force-graph):
 *   linhas (drawLink) → círculos (drawNode) → rótulos (drawLabels, via
 *   onRenderFramePost). Antes, o rótulo era desenhado junto com o seu círculo,
 *   então o círculo seguinte podia cobri-lo.
 * ============================================================================
 */

import React, { useCallback, useRef, useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Plus, Minus, Maximize, Scale, ShieldCheck, Info, FileText, ChevronUp, PanelRightOpen, History } from 'lucide-react';
import { GraphData, GraphNode, GraphLink, NodeType, LinkStatus } from '@/types/graph';
import { NODE_STYLE, STATUS_STYLE, FALLBACK_COLOR, getNodeRadius, getLinkKey, getLinkEnds } from '@/lib/graphConfig';
import { computeLayoutTargets, seedPositions, applyLayoutForces, isPartyLink } from '@/lib/layout';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useI18n } from '@/components/I18nProvider';

// A biblioteca usa `window`, então só carrega no navegador (ssr: false).
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

interface NetworkGraphProps {
  graphRef: React.MutableRefObject<any>;
  graphData: GraphData;
  selectedNode: GraphNode | null;
  selectedLink: GraphLink | null;
  onSelectNode: (node: GraphNode) => void;
  onSelectLink: (link: GraphLink) => void;
  /**
   * Mostrar sempre as ligações com partidos? Por padrão elas ficam ocultas
   * (o núcleo de partidos ligaria tudo a tudo) e só aparecem quando um nó ou
   * linha ligado a elas está em foco. true quando o filtro "Partido" está marcado.
   */
  showPartyLinks?: boolean;
  /** Toque/clique no fundo: limpa a seleção. */
  onClearSelection: () => void;
  /** Painel de detalhes aberto? (o botão "Exibir detalhes" some enquanto estiver). */
  detailsOpen: boolean;
  /** Botão flutuante "Exibir detalhes": abre o painel do item selecionado. */
  onOpenDetails: () => void;
  /** true quando um painel (Infográficos/Glossário) cobre o grafo: a animação pausa. */
  paused?: boolean;
}

/* ---------------------------------------------------------------------------
 * PARÂMETROS AJUSTÁVEIS DESTE COMPONENTE
 * ------------------------------------------------------------------------- */

/** Largura (px) abaixo da qual a tela é tratada como celular. */
const MOBILE_BREAKPOINT = 768;

/** Anel invisível extra (unidades do grafo) em volta de cada círculo que ainda aceita clique. */
const CLICK_PADDING = 15;

/** Margem (px) entre a teia e a borda da tela ao enquadrar com "recentralizar". */
const FIT_PADDING_DESKTOP = 60;
const FIT_PADDING_MOBILE = 20;

/**
 * Física: quantos "passos" a simulação roda ANTES do primeiro desenho
 * (invisível ao usuário) e por quanto tempo continua animando depois.
 *   - WARMUP_TICKS ↑ = abre mais "assentado", porém demora mais para aparecer.
 *     Como as posições já nascem no lugar certo (layout semeado), 100 basta.
 *   - COOLDOWN_MS  = tempo máximo de animação após aparecer.
 */
const WARMUP_TICKS = 100;
const COOLDOWN_MS = 4000;

/**
 * Deriva contínua ("teia respirando"): DESLIGADA em todos os aparelhos — a
 * teia se acomoda em COOLDOWN_MS e fica parada, igual no celular e no
 * desktop. Para religar (a simulação nunca para), troque por `true`.
 */
const DRIFT_ENABLED = false;

/**
 * Mouse/trackpad (ponteiro fino, com hover)? Só nesses aparelhos o hover
 * destaca nós e linhas. Em telas de toque a biblioteca trata a posição do
 * último toque como "hover", e o destaque pulava para vizinhos quando a
 * câmera se movia — por isso lá o destaque vem só do toque (seleção).
 */
const HOVER_POINTER_QUERY = '(hover: hover) and (pointer: fine)';

function useHoverPointer() {
  const [canHover, setCanHover] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(HOVER_POINTER_QUERY);
    const update = () => setCanHover(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return canHover;
}

/** Espessura das linhas em unidades do grafo: normal / selecionada. */
const LINK_WIDTH = 4;
const LINK_WIDTH_SELECTED = 8;

/**
 * FOCO + CONTEXTO: ao passar o mouse num nó (ou selecionar um nó ou uma
 * linha), ele, seus vizinhos diretos e as linhas entre eles ficam em destaque;
 * o resto do grafo fica quase transparente, mas continua visível como
 * contexto. Os vizinhos ganham rótulo mesmo com a câmera afastada.
 *   FADED_ALPHA ↓ = fundo mais apagado; ↑ = mais contexto visível.
 */
const FADED_ALPHA = 0.1;
/**
 * BRILHO POR ZOOM: com a câmera afastada, entidades que não são esquemas e as
 * linhas ficam apagadas (DIM_ALPHA) e acendem ao aproximar. BRIGHT_ZOOM diz o
 * zoom em que cada tipo acende por completo; a transição é gradual ao longo
 * de BRIGHT_ZOOM_RAMP antes desse ponto. Partidos, empresas e linhas acendem
 * juntos; políticos e operadores, um pouco depois (≈ rótulo + 0,15).
 * Esquemas ficam sempre acesos; com algo em foco, vale a regra do foco.
 */
const DIM_ALPHA = 0.35;
const BRIGHT_ZOOM: Record<Exclude<NodeType, 'scheme'>, number> = {
  party: 0.45,
  company: 0.45,
  politician: 0.6,
  operator: 0.6,
};
const LINK_BRIGHT_ZOOM = 0.45;
const BRIGHT_ZOOM_RAMP = 0.1;

/** Opacidade (DIM_ALPHA → 1) para um zoom, acendendo por completo em `full`. */
const zoomBrightness = (scale: number, full: number) => {
  const t = Math.min(1, Math.max(0, (scale - (full - BRIGHT_ZOOM_RAMP)) / BRIGHT_ZOOM_RAMP));
  return DIM_ALPHA + (1 - DIM_ALPHA) * t;
};
const FADED_LINK_ALPHA = 0.05;
/** Enquadramento do foco ao selecionar: duração, margem (px) e zoom máximo. */
const FOCUS_FIT_MS = 600;
const FOCUS_FIT_PADDING = 90;
const FOCUS_MAX_ZOOM = 1.2;
/** Altura dos controles de câmera na base: o foco sobe para não ficar sob eles. */
const BOTTOM_CONTROLS_PX = 80;
/** Largura do painel de detalhes no desktop (md:w-96 = 384px em InspectorDrawer). */
const DRAWER_WIDTH_PX = 384;

/**
 * VIDRO FOSCO (entidades sem foto que não são esquemas), desenhado sobre um
 * fundo preto sólido — as linhas terminam na borda do círculo e não passam
 * por trás. O efeito é montado em camadas baratas:
 *   1. "fosco": camada escura (FROST_ALPHA) que dá profundidade ao vidro;
 *   2. tinta: gradiente radial na cor do tipo, mais clara no centro
 *      (GLASS_TINT_CENTER) e mais transparente na borda (GLASS_TINT_EDGE);
 *   3. reflexo: brilho branco suave no alto à esquerda (GLASS_SHEEN) e um
 *      fio de luz na borda interna (GLASS_RIM), que dão a leitura de vidro.
 * Opacidades em hex de 2 dígitos (00–ff), somadas à cor #rrggbb do tipo.
 */
const FROST_ALPHA = 0.55;
const GLASS_TINT_CENTER = '59'; // ≈ 35%
const GLASS_TINT_EDGE = '1f'; // ≈ 12%
const GLASS_SHEEN = 0.22;
const GLASS_RIM = 0.18;
/** Foto: raio relativo ao círculo (o restante é um anel preto em volta). */
const IMAGE_INSET = 0.84;

function drawFrostedGlass(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.clip();

  // 1. fosco
  ctx.fillStyle = `rgba(8, 13, 22, ${FROST_ALPHA})`;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);

  // 2. tinta na cor do tipo
  const tint = ctx.createRadialGradient(x, y, r * 0.1, x, y, r);
  tint.addColorStop(0, `${color}${GLASS_TINT_CENTER}`);
  tint.addColorStop(1, `${color}${GLASS_TINT_EDGE}`);
  ctx.fillStyle = tint;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);

  // 3. reflexo no alto à esquerda + fio de luz na borda interna
  const sheen = ctx.createRadialGradient(x - r * 0.45, y - r * 0.5, 0, x - r * 0.45, y - r * 0.5, r * 0.9);
  sheen.addColorStop(0, `rgba(255, 255, 255, ${GLASS_SHEEN})`);
  sheen.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = sheen;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);

  ctx.beginPath();
  ctx.arc(x, y, r * 0.93, 0, 2 * Math.PI);
  ctx.strokeStyle = `rgba(255, 255, 255, ${GLASS_RIM})`;
  ctx.lineWidth = r * 0.05;
  ctx.stroke();
  ctx.restore();
}

/**
 * SPRITES — o canvas é redesenhado a cada quadro (60×/s enquanto a física
 * roda ou há partículas nas linhas), então o que é caro de pintar é pintado
 * UMA vez num canvas auxiliar e depois só carimbado com drawImage:
 *   - vidro fosco: um sprite por (cor, raio) — na prática, um por tipo de
 *     entidade. Antes eram 2 gradientes + recorte por nó, por quadro.
 *   - fotos: cada foto é reduzida e recortada em círculo ao terminar de
 *     baixar. Antes, a imagem original inteira era recortada e reamostrada
 *     por nó, por quadro (e ficava na memória em tamanho cheio).
 * GLASS_SPRITE_SCALE / PHOTO_SPRITE_PX ↑ = mais nitidez com zoom alto, mais memória.
 */
const GLASS_SPRITE_SCALE = 3;
const PHOTO_SPRITE_PX = 192;
const glassSprites = new Map<string, HTMLCanvasElement>();

function getGlassSprite(r: number, color: string): HTMLCanvasElement | null {
  const key = `${color}|${r}`;
  const cached = glassSprites.get(key);
  if (cached) return cached;
  // Raios fora do padrão (não deveria haver muitos): desenha direto, sem cache.
  if (glassSprites.size >= 32) return null;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = Math.ceil(r * 2 * GLASS_SPRITE_SCALE);
  const g = canvas.getContext('2d');
  if (!g) return null;
  g.scale(GLASS_SPRITE_SCALE, GLASS_SPRITE_SCALE);
  g.beginPath();
  g.arc(r, r, r, 0, 2 * Math.PI);
  g.fillStyle = '#000000';
  g.fill();
  drawFrostedGlass(g, r, r, r, color);
  glassSprites.set(key, canvas);
  return canvas;
}

/** Foto já reduzida e recortada em círculo (mesmo enquadramento de antes: a imagem inteira no quadrado). */
function makePhotoSprite(img: HTMLImageElement): HTMLCanvasElement | null {
  if (!img.naturalWidth || !img.naturalHeight) return null;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = PHOTO_SPRITE_PX;
  const g = canvas.getContext('2d');
  if (!g) return null;
  g.beginPath();
  g.arc(PHOTO_SPRITE_PX / 2, PHOTO_SPRITE_PX / 2, PHOTO_SPRITE_PX / 2, 0, 2 * Math.PI);
  g.clip();
  g.imageSmoothingQuality = 'high';
  g.drawImage(img, 0, 0, PHOTO_SPRITE_PX, PHOTO_SPRITE_PX);
  return canvas;
}

/** Modo de desenho das linhas (função estável: não muda a cada render). */
const LINK_CANVAS_MODE = () => 'replace' as const;

/** Cor de fundo do canvas; também usada como "contorno" atrás dos rótulos. */
const BG_COLOR = '#080d16';

const statusStyle = (status: string) => STATUS_STYLE[status as LinkStatus];
const statusColor = (status: string) => statusStyle(status)?.color ?? FALLBACK_COLOR;

export default function NetworkGraph({
  graphRef,
  graphData,
  selectedNode,
  selectedLink,
  onSelectNode,
  onSelectLink,
  onClearSelection,
  showPartyLinks = false,
  detailsOpen,
  onOpenDetails,
  paused = false,
}: NetworkGraphProps) {
  const { t, href } = useI18n();
  const driftEnabled = DRIFT_ENABLED;
  const canHover = useHoverPointer();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const isMobile = dimensions.width < MOBILE_BREAKPOINT;

  // Cache de fotos prontas para desenhar (ver makePhotoSprite) + conjuntos das
  // que estão baixando e das que falharam, para não pedir a mesma foto de
  // novo a cada mudança de filtro.
  const imgCacheRef = useRef<Map<string, HTMLCanvasElement>>(new Map());
  const pendingRef = useRef<Set<string>>(new Set());
  const failedRef = useRef<Set<string>>(new Set());
  const redrawRafRef = useRef(0);

  // Se o usuário já mexeu na câmera (zoom/arrasto), não reenquadramos sozinhos.
  const userMovedCameraRef = useRef(false);

  // O ForceGraph2D é carregado sob demanda, então graphRef.current pode ser
  // null quando os efeitos rodam pela 1ª vez. O ref-callback + estado faz os
  // efeitos rodarem de novo assim que a instância existe.
  const [graphReady, setGraphReady] = useState(false);
  const setGraphInstance = useCallback((instance: any) => {
    graphRef.current = instance;
    setGraphReady(!!instance);
  }, [graphRef]);

  /* -------------------------------------------------------------------------
   * 0. FOCO + CONTEXTO — quem está em destaque (ver FADED_ALPHA)
   *    Vem só da seleção (toque/clique), igual no celular e no desktop:
   *    nó selecionado > linha selecionada. Passar o mouse não destaca.
   * ----------------------------------------------------------------------- */

  const adjacency = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const l of graphData.links) {
      const { sourceId, targetId } = getLinkEnds(l);
      if (!map.has(sourceId)) map.set(sourceId, new Set());
      if (!map.has(targetId)) map.set(targetId, new Set());
      map.get(sourceId)!.add(targetId);
      map.get(targetId)!.add(sourceId);
    }
    return map;
  }, [graphData.links]);

  // Hover (só com mouse): nó ou linha sob o cursor. Tem prioridade sobre a
  // seleção enquanto o cursor estiver em cima; ao sair, volta o destaque da
  // seleção. Não move a câmera nem abre nada.
  const [hoverNodeId, setHoverNodeId] = useState<string | null>(null);
  const [hoverLink, setHoverLink] = useState<GraphLink | null>(null);
  // Até quando ignorar o hover (a câmera está se movendo sozinha: os nós
  // passam sob o cursor parado e o destaque "pularia" para eles).
  const suppressHoverUntilRef = useRef(0);
  const clearHover = useCallback(() => {
    setHoverNodeId(null);
    setHoverLink(null);
  }, []);

  // O que está em foco: nó (com vizinhos) ou linha (só as duas pontas).
  // Prioridade: nó sob o mouse > linha sob o mouse > nó selecionado > linha selecionada.
  const focus = useMemo<{ nodeId: string } | { link: GraphLink } | null>(() => {
    if (hoverNodeId) return { nodeId: hoverNodeId };
    if (hoverLink) return { link: hoverLink };
    if (selectedNode) return { nodeId: selectedNode.id };
    if (selectedLink) return { link: selectedLink };
    return null;
  }, [hoverNodeId, hoverLink, selectedNode, selectedLink]);

  // focusIds = nós centrais do foco; litIds = centrais + vizinhos (em destaque).
  const { focusIds, litIds } = useMemo(() => {
    if (!focus) return { focusIds: new Set<string>(), litIds: new Set<string>() };
    if ('nodeId' in focus) {
      const lit = new Set([focus.nodeId]);
      adjacency.get(focus.nodeId)?.forEach((n) => lit.add(n));
      return { focusIds: new Set([focus.nodeId]), litIds: lit };
    }
    const { sourceId, targetId } = getLinkEnds(focus.link);
    return { focusIds: new Set([sourceId, targetId]), litIds: new Set([sourceId, targetId]) };
  }, [focus, adjacency]);

  const hasFocus = focusIds.size > 0;
  const isNodeLit = useCallback((id: string) => !hasFocus || litIds.has(id), [hasFocus, litIds]);
  const focusLinkKey = focus && 'link' in focus ? getLinkKey(focus.link) : null;
  const isLinkLit = useCallback(
    (link: any) => {
      if (!hasFocus) return true;
      if (focusLinkKey !== null) return getLinkKey(link) === focusLinkKey;
      const { sourceId, targetId } = getLinkEnds(link);
      return focusIds.has(sourceId) || focusIds.has(targetId);
    },
    [hasFocus, focusIds, focusLinkKey]
  );

  /* -------------------------------------------------------------------------
   * 1. TAMANHO DO CANVAS — acompanha o contêiner (inclusive ao girar o celular)
   * ----------------------------------------------------------------------- */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    // Mesmo tamanho → mesmo objeto: não re-renderiza o grafo à toa.
    const updateSize = () =>
      setDimensions((prev) =>
        prev.width === el.clientWidth && prev.height === el.clientHeight
          ? prev
          : { width: el.clientWidth, height: el.clientHeight }
      );
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /* -------------------------------------------------------------------------
   * 2. LAYOUT — calcula a posição-alvo de cada nó e posiciona os nós novos.
   *    Roda DURANTE a renderização (useMemo) e não num efeito, para que a
   *    biblioteca já receba os nós no lugar certo no primeiro quadro.
   *    Detalhes e parâmetros: lib/layout.ts
   * ----------------------------------------------------------------------- */
  const layoutTargets = useMemo(() => {
    const targets = computeLayoutTargets(graphData.nodes, graphData.links);
    seedPositions(graphData.nodes, targets);
    return targets;
  }, [graphData]);

  /* -------------------------------------------------------------------------
   * 3. FÍSICA — aplica as forças do layout na simulação da biblioteca.
   * ----------------------------------------------------------------------- */
  useEffect(() => {
    const fg = graphRef.current;
    if (!fg) return;
    applyLayoutForces((name, force) => fg.d3Force(name, force), layoutTargets, driftEnabled);
    fg.d3ReheatSimulation();
  }, [graphReady, layoutTargets, driftEnabled, graphRef]);

  /* -------------------------------------------------------------------------
   * 3b. PAUSA — com um painel aberto por cima do grafo, a animação para (não
   *     gasta CPU/bateria desenhando algo invisível). Com a aba do navegador
   *     em segundo plano, o próprio navegador já suspende a animação.
   * ----------------------------------------------------------------------- */
  useEffect(() => {
    const fg = graphRef.current;
    if (!fg) return;
    if (paused) fg.pauseAnimation?.();
    else fg.resumeAnimation?.();
  }, [paused, graphReady, graphRef]);

  /* -------------------------------------------------------------------------
   * 4. CÂMERA — enquadra a teia inteira logo que ela aparece (instantâneo,
   *    sem a animação de "zoom pulando" de antes) e de novo, suavemente,
   *    quando ela se acomoda — a não ser que o usuário já tenha mexido.
   *    No desktop a simulação nunca "termina" (deriva contínua), então o
   *    segundo enquadramento é feito por tempo (COOLDOWN_MS) em vez de esperar
   *    o fim da física.
   * ----------------------------------------------------------------------- */
  const fitPadding = isMobile ? FIT_PADDING_MOBILE : FIT_PADDING_DESKTOP;

  useEffect(() => {
    const fg = graphRef.current;
    if (!fg || graphData.nodes.length === 0) return;
    userMovedCameraRef.current = false;
    // Espera um quadro para a biblioteca registrar os nós antes de medir.
    const id = requestAnimationFrame(() => fg.zoomToFit(0, fitPadding));
    const settle = setTimeout(() => {
      if (!userMovedCameraRef.current) graphRef.current?.zoomToFit(400, fitPadding);
    }, COOLDOWN_MS);
    return () => {
      cancelAnimationFrame(id);
      clearTimeout(settle);
    };
    // Só reenquadra quando muda o CONJUNTO de nós (filtros), não a cada render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graphReady, graphData.nodes.length]);

  /* 4b. ENQUADRAR O FOCO — ao selecionar um nó ou uma linha, a câmera mostra
   *     o nó e TODOS os vizinhos em destaque, com zoom limitado e o foco
   *     acima dos controles de câmera (igual no celular e no desktop).
   *     Quando o painel de detalhes abre no desktop (ocupa DRAWER_WIDTH_PX à
   *     direita), a câmera desliza para a esquerda; ao fechar, volta. */
  const selectionKey = selectedNode ? `n:${selectedNode.id}` : selectedLink ? `l:${getLinkKey(selectedLink)}` : '';
  useEffect(() => {
    const fg = graphRef.current;
    if (!fg || !selectionKey) return;
    userMovedCameraRef.current = true; // não reenquadrar a teia inteira depois
    // Durante o enquadramento, ignora o hover e solta o que estava, para o
    // destaque ficar no item selecionado.
    suppressHoverUntilRef.current = Date.now() + FOCUS_FIT_MS + 700;
    clearHover();
    const lit = new Set<string>();
    if (selectedNode) {
      lit.add(selectedNode.id);
      adjacency.get(selectedNode.id)?.forEach((id) => lit.add(id));
    } else if (selectedLink) {
      const { sourceId, targetId } = getLinkEnds(selectedLink);
      lit.add(sourceId);
      lit.add(targetId);
    }
    // zoomToFit enquadra os CENTROS dos nós; a margem extra = maior raio do
    // grupo × zoom máximo, para os círculos inteiros caberem na tela.
    const biggest = Math.max(0, ...Array.from(lit).map((id) => getNodeRadius((nodeById.get(id) as any)?.type, nodeById.get(id) as any)));
    // Nunca mais que 30% do menor lado da tela (no celular, uma margem fixa
    // grande sobraria pouco espaço e o zoom despencaria).
    const padding = Math.min(FOCUS_FIT_PADDING + biggest * FOCUS_MAX_ZOOM, 0.3 * Math.min(dimensions.width, dimensions.height));
    const t1 = setTimeout(() => {
      graphRef.current?.zoomToFit(FOCUS_FIT_MS, padding, (n: any) => lit.has(n.id));
    }, 50);
    const t2 = setTimeout(() => {
      const g = graphRef.current;
      if (!g) return;
      const z = Math.min(g.zoom(), FOCUS_MAX_ZOOM);
      if (g.zoom() > FOCUS_MAX_ZOOM) g.zoom(FOCUS_MAX_ZOOM, 300);
      const c = g.centerAt();
      if (!c) return;
      // Sobe o foco acima dos controles; no desktop, com o painel aberto,
      // desloca também para a esquerda (o painel ocupa a direita).
      const dx = !isMobile && detailsOpenRef.current ? DRAWER_WIDTH_PX / 2 / z : 0;
      g.centerAt(c.x + dx, c.y + BOTTOM_CONTROLS_PX / 2 / z, 300);
    }, FOCUS_FIT_MS + 80);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectionKey, graphReady]);

  // Painel abre/fecha no desktop → desliza a câmera metade da largura dele.
  const detailsOpenRef = useRef(detailsOpen);
  useEffect(() => {
    const was = detailsOpenRef.current;
    detailsOpenRef.current = detailsOpen;
    const g = graphRef.current;
    if (!g || isMobile || was === detailsOpen) return;
    suppressHoverUntilRef.current = Date.now() + 700;
    const c = g.centerAt();
    if (!c) return;
    const dx = DRAWER_WIDTH_PX / 2 / g.zoom();
    g.centerAt(c.x + (detailsOpen ? dx : -dx), c.y, 400);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detailsOpen]);

  const handleEngineStop = useCallback(() => {
    if (!userMovedCameraRef.current) graphRef.current?.zoomToFit(400, fitPadding);
  }, [graphRef, fitPadding]);

  /* -------------------------------------------------------------------------
   * 5. IMAGENS — pré-carrega fotos dos nós (ex.: Wikimedia Commons)
   * ----------------------------------------------------------------------- */
  useEffect(() => {
    // Pede UM redesenho no próximo quadro, por mais fotos que cheguem juntas.
    // zoom(zoom atual) só marca o canvas como "precisa redesenhar": não mexe
    // na câmera nem na física. (Antes cada foto reaquecia a simulação — com
    // ~150 fotos, a teia ficava tremendo e gastando CPU enquanto carregavam.)
    const requestRedraw = () => {
      if (redrawRafRef.current) return;
      redrawRafRef.current = requestAnimationFrame(() => {
        redrawRafRef.current = 0;
        const fg = graphRef.current;
        const k = fg?.zoom?.();
        if (typeof k === 'number') fg.zoom(k);
      });
    };
    const urls = new Set(graphData.nodes.map((n) => n.image_url).filter((u): u is string => !!u));
    urls.forEach((url) => {
      if (imgCacheRef.current.has(url) || pendingRef.current.has(url) || failedRef.current.has(url)) return;
      pendingRef.current.add(url);
      const img = new Image();
      img.crossOrigin = 'anonymous'; // necessário para desenhar no canvas sem "contaminá-lo"
      img.decoding = 'async';
      img.onload = () => {
        pendingRef.current.delete(url);
        const sprite = makePhotoSprite(img);
        if (!sprite) {
          failedRef.current.add(url);
          return;
        }
        imgCacheRef.current.set(url, sprite);
        requestRedraw();
      };
      // Falhou: fica só o círculo de vidro, e a foto não é pedida de novo.
      img.onerror = () => {
        pendingRef.current.delete(url);
        failedRef.current.add(url);
      };
      img.src = url;
    });
  }, [graphData.nodes, graphRef]);

  useEffect(() => () => cancelAnimationFrame(redrawRafRef.current), []);

  /* -------------------------------------------------------------------------
   * 6. DESENHO DOS CÍRCULOS (sem texto — o texto vem no passo 8)
   * ----------------------------------------------------------------------- */
  const drawNode = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const isSelected = selectedNode?.id === node.id;
    const color = NODE_STYLE[node.type as NodeType]?.color ?? '#00f0ff';
    const size = getNodeRadius(node.type, node);
    const lit = isNodeLit(node.id);
    const isFocusCentre = focusIds.has(node.id);
    const isScheme = node.type === 'scheme';

    // Opacidade: fora do foco → FADED_ALPHA; sem foco, entidades comuns acendem
    // conforme o zoom (ver BRIGHT_ZOOM).
    let alpha = lit ? 1 : FADED_ALPHA;
    if (lit && !hasFocus && !isScheme) {
      alpha = zoomBrightness(globalScale, BRIGHT_ZOOM[node.type as keyof typeof BRIGHT_ZOOM] ?? 0.6);
    }

    ctx.save();
    ctx.globalAlpha = alpha;

    // Brilho externo. Sufixo hex = opacidade: '44' ≈ 27% (selecionado), '18' ≈ 9%.
    ctx.beginPath();
    ctx.arc(node.x, node.y, size + 8, 0, 2 * Math.PI);
    ctx.fillStyle = `${color}${isSelected || isFocusCentre ? '44' : '18'}`;
    ctx.fill();

    // Disco interno. Esquemas: círculo SÓLIDO na cor do tipo.
    // Demais entidades: fundo PRETO sólido e, por cima,
    //   - com foto: a foto, um pouco recuada (anel preto em volta);
    //   - sem foto: o vidro fosco no tom do tipo (ver drawFrostedGlass).
    // Foto e vidro são sprites prontos (ver SPRITES no topo do arquivo).
    ctx.beginPath();
    ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
    if (isScheme) {
      ctx.fillStyle = color;
      ctx.fill();
    } else {
      const photo = node.image_url ? imgCacheRef.current.get(node.image_url) : undefined;
      if (photo) {
        ctx.fillStyle = '#000000';
        ctx.fill();
        const r = size * IMAGE_INSET;
        ctx.drawImage(photo, node.x - r, node.y - r, r * 2, r * 2);
      } else {
        const glass = getGlassSprite(size, color);
        if (glass) {
          ctx.drawImage(glass, node.x - size, node.y - size, size * 2, size * 2);
        } else {
          ctx.fillStyle = '#000000';
          ctx.fill();
          drawFrostedGlass(ctx, node.x, node.y, size, color);
        }
      }
      ctx.beginPath();
      ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
    }

    // Borda colorida por cima. Dividir por globalScale mantém a espessura
    // constante na tela, independentemente do zoom.
    ctx.strokeStyle = isSelected && isScheme ? '#ffffff' : color;
    ctx.lineWidth = (isSelected ? 3 : 1.8) / globalScale;
    ctx.stroke();

    ctx.restore();
  }, [selectedNode, isNodeLit, focusIds, hasFocus]);

  // Área de clique = raio desenhado + folga (antes era menor que o círculo).
  const paintPointerArea = useCallback((node: any, color: string, ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(node.x, node.y, getNodeRadius(node.type, node) + CLICK_PADDING, 0, 2 * Math.PI);
    ctx.fill();
  }, []);

  /* -------------------------------------------------------------------------
   * 7. DESENHO DAS LINHAS
   * ----------------------------------------------------------------------- */
  const selectedLinkKey = selectedLink ? getLinkKey(selectedLink) : null;
  const isLinkSelected = useCallback(
    (link: any) => selectedLinkKey !== null && getLinkKey(link) === selectedLinkKey,
    [selectedLinkKey]
  );

  const drawLink = useCallback((link: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const start = link.source;
    const end = link.target;
    // Nos primeiros quadros o d3 ainda pode não ter trocado ids por objetos.
    if (typeof start !== 'object' || typeof end !== 'object' || typeof start.x !== 'number' || typeof end.x !== 'number') return;

    const style = statusStyle(link.status);
    const color = style?.color ?? FALLBACK_COLOR;
    const baseWidth = isLinkSelected(link) ? LINK_WIDTH_SELECTED : LINK_WIDTH;
    const safeScale = globalScale > 0 ? globalScale : 1;

    // A linha vai só até a BORDA de cada círculo (não entra nem atravessa o
    // círculo): encurta cada ponta pelo raio do nó + metade da borda.
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const len = Math.hypot(dx, dy);
    const border = 1 / safeScale;
    const r0 = getNodeRadius(start.type, start) + border;
    const r1 = getNodeRadius(end.type, end) + border;
    if (len <= r0 + r1) return; // círculos encostados/sobrepostos: nada visível entre eles
    const ux = dx / len;
    const uy = dy / len;

    ctx.save();
    // Fora do foco → quase transparente; sem foco → acende com o zoom, junto
    // com partidos e empresas (LINK_BRIGHT_ZOOM).
    ctx.globalAlpha = !isLinkLit(link) ? FADED_LINK_ALPHA : hasFocus ? 1 : zoomBrightness(safeScale, LINK_BRIGHT_ZOOM);
    ctx.beginPath();
    ctx.moveTo(start.x + ux * r0, start.y + uy * r0);
    ctx.lineTo(end.x - ux * r1, end.y - uy * r1);

    // Passada 1: aura translúcida mais larga.
    ctx.strokeStyle = `${color}44`;
    ctx.lineWidth = baseWidth + 2 / safeScale;
    ctx.stroke();

    // Passada 2: linha principal (tracejada se o caso está em aberto).
    ctx.strokeStyle = color;
    ctx.lineWidth = baseWidth;
    ctx.setLineDash(style?.dashed ? [12, 10] : []);
    ctx.stroke();
    ctx.restore();
  }, [isLinkSelected, isLinkLit, hasFocus]);

  /* -------------------------------------------------------------------------
   * 8. RÓTULOS — desenhados DEPOIS de tudo (onRenderFramePost), então ficam
   *    sempre na frente de círculos e linhas. Cada texto ganha um contorno da
   *    cor do fundo ("halo") para continuar legível mesmo sobre uma linha.
   *
   *    Ajustes:
   *      - tamanho e zoom mínimo por tipo → NODE_STYLE em lib/graphConfig.ts
   *      - espessura do halo              → HALO_PX abaixo
   *      - largura máxima de cada linha   → LABEL_MAX_WIDTH_PX abaixo
   *      - nº máximo de linhas            → LABEL_MAX_LINES abaixo (o nó
   *        selecionado mostra o nome inteiro, sem limite de linhas)
   *
   *    Nomes longos quebram em várias linhas, de preferência nos espaços (e
   *    depois de "/"); se passar do limite de linhas, a última termina em "…".
   *    A quebra é calculada em pixels de tela, então não muda com o zoom e
   *    pode ficar em cache (labelLinesCache).
   * ----------------------------------------------------------------------- */
  const HALO_PX = 4;
  const LABEL_MAX_WIDTH_PX = 170;
  const LABEL_MAX_LINES = 3;
  const LABEL_LINE_HEIGHT = 1.2;
  // Linhas já quebradas + largura (px de tela) da maior: medir texto é caro e
  // o resultado não muda com o zoom, então é medido uma vez por rótulo.
  const labelLinesCache = useRef(new Map<string, { lines: string[]; widthPx: number }>());
  const positionDetailsButtonRef = useRef<(scale: number) => void>(() => {});
  // Se a fonte Inter terminar de carregar depois do 1º desenho, as medidas
  // feitas com a fonte reserva ficariam erradas: limpa o cache.
  useEffect(() => {
    document.fonts?.ready.then(() => labelLinesCache.current.clear()).catch(() => {});
  }, []);

  const wrapLabel = useCallback((ctx: CanvasRenderingContext2D, text: string, maxLines: number): string[] => {
    const words = text.split(/\s+/).filter(Boolean);
    const lines: string[] = [];
    let current = '';
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (!current || ctx.measureText(candidate).width <= LABEL_MAX_WIDTH_PX) {
        current = candidate;
      } else {
        lines.push(current);
        current = word;
      }
    }
    if (current) lines.push(current);

    // Palavra única mais larga que o limite (raro): corta por caracteres.
    const fitted = lines.flatMap((line) => {
      if (ctx.measureText(line).width <= LABEL_MAX_WIDTH_PX) return [line];
      const parts: string[] = [];
      let chunk = '';
      for (const ch of line) {
        if (chunk && ctx.measureText(chunk + ch).width > LABEL_MAX_WIDTH_PX) {
          parts.push(chunk);
          chunk = ch;
        } else chunk += ch;
      }
      if (chunk) parts.push(chunk);
      return parts;
    });

    if (fitted.length <= maxLines) return fitted;
    const kept = fitted.slice(0, maxLines);
    let last = kept[maxLines - 1];
    while (last.length > 1 && ctx.measureText(`${last}…`).width > LABEL_MAX_WIDTH_PX) last = last.slice(0, -1);
    kept[maxLines - 1] = `${last.trimEnd()}…`;
    return kept;
  }, []);

  // Anticolisão: rótulos são considerados do MAIS importante para o menos
  // (centro do foco, vizinhos em destaque, esquemas, partidos, o resto) e um
  // rótulo que encostaria num já aceito é pulado — aparece ao aproximar.
  // A ordem só muda com os dados ou com o foco, então é calculada aqui e não
  // a cada quadro.
  const labelOrder = useMemo(() => {
    const selectedId = selectedNode?.id;
    const importance = (n: GraphNode) =>
      (focusIds.has(n.id) || selectedId === n.id ? 4e6 : 0) +
      (hasFocus && litIds.has(n.id) ? 2e6 : 0) +
      (n.type === 'scheme' ? 3e5 : n.type === 'party' ? 2e5 : n.type === 'company' ? 1e5 : 0) +
      (adjacency.get(n.id)?.size ?? 0);
    const scored = graphData.nodes.map((node) => ({ node, score: importance(node) }));
    scored.sort((a, b) => b.score - a.score);
    return scored.map((x) => x.node as any);
  }, [graphData.nodes, selectedNode, focusIds, litIds, hasFocus, adjacency]);

  const drawLabels = useCallback((ctx: CanvasRenderingContext2D, globalScale: number) => {
    const scale = globalScale > 0 ? globalScale : 1;
    const placed: { x0: number; x1: number; y0: number; y1: number }[] = [];
    const pad = 3 / scale;
    const toDraw: { node: any; lines: string[]; y: number; fontSize: number; px: number; weight: number }[] = [];

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.lineJoin = 'round';

    for (const node of labelOrder) {
      if (typeof node.x !== 'number') continue;
      const style = NODE_STYLE[node.type as NodeType];
      const isSelected = selectedNode?.id === node.id;
      // Com foco: só os nós em destaque têm rótulo — todos eles, mesmo com a
      // câmera afastada. Sem foco: nível de detalhe por tipo (minZoom).
      if (hasFocus) {
        if (!litIds.has(node.id)) continue;
      } else if (!isSelected && scale < (style?.minZoom ?? 0.5)) continue;

      // Tamanho em px de tela convertido para unidades do grafo.
      const px = style?.labelPx ?? 11;
      const fontSize = px / scale;
      const weight = isSelected ? 700 : node.type === 'scheme' || node.type === 'party' ? 600 : 500;

      let text = String(node.label ?? '');
      if (node.type === 'scheme') text = text.toUpperCase();

      // Quebra medida na fonte em px de tela (independe do zoom → cacheável).
      const maxLines = isSelected || focusIds.has(node.id) ? Infinity : LABEL_MAX_LINES;
      const cacheKey = `${weight}|${px}|${maxLines}|${text}`;
      let wrapped = labelLinesCache.current.get(cacheKey);
      if (!wrapped) {
        ctx.font = `${weight} ${px}px Inter, system-ui, sans-serif`;
        const wrappedLines = wrapLabel(ctx, text, maxLines);
        wrapped = { lines: wrappedLines, widthPx: Math.max(0, ...wrappedLines.map((l) => ctx.measureText(l).width)) };
        labelLinesCache.current.set(cacheKey, wrapped);
      }
      const { lines, widthPx } = wrapped;

      const y = node.y + getNodeRadius(node.type, node) + 6 / scale;
      const lineStep = fontSize * LABEL_LINE_HEIGHT;
      const extraLine = node.type === 'politician' && node.party && (scale >= 1 || isSelected || (hasFocus && litIds.has(node.id))) ? 1 : 0;
      const box = {
        x0: node.x - widthPx / 2 / scale - pad,
        x1: node.x + widthPx / 2 / scale + pad,
        y0: y - pad,
        y1: y + (lines.length + extraLine) * lineStep + pad,
      };
      const mustShow = isSelected || focusIds.has(node.id);
      if (!mustShow && placed.some((b) => box.x0 < b.x1 && box.x1 > b.x0 && box.y0 < b.y1 && box.y1 > b.y0)) continue;
      placed.push(box);
      toDraw.push({ node, lines, y, fontSize, px, weight });
    }

    // Desenha do menos para o mais importante (o centro do foco fica por cima).
    for (const { node, lines, y, fontSize, px, weight } of toDraw.reverse()) {
      const style = NODE_STYLE[node.type as NodeType];
      const isSelected = selectedNode?.id === node.id;
      const lineStep = fontSize * LABEL_LINE_HEIGHT;
      ctx.font = `${weight} ${fontSize}px Inter, system-ui, sans-serif`;
      ctx.lineWidth = HALO_PX / scale;
      ctx.strokeStyle = BG_COLOR;
      ctx.fillStyle = isSelected || focusIds.has(node.id) ? '#ffffff' : style?.labelColor ?? '#cbd5e1';
      lines.forEach((line, i) => {
        ctx.strokeText(line, node.x, y + i * lineStep);
        ctx.fillText(line, node.x, y + i * lineStep);
      });

      // Linha extra com a sigla do partido (políticos, com zoom próximo).
      if (node.type === 'politician' && node.party && (scale >= 1 || isSelected || (hasFocus && litIds.has(node.id)))) {
        const subSize = (px - 1) / scale;
        ctx.font = `400 ${subSize}px Inter, system-ui, sans-serif`;
        const y2 = y + (lines.length - 1) * lineStep + fontSize + 2 / scale;
        ctx.strokeText(`(${node.party})`, node.x, y2);
        ctx.fillStyle = isSelected ? '#e0f2fe' : '#94a3b8';
        ctx.fillText(`(${node.party})`, node.x, y2);
      }
    }
    ctx.restore();
    positionDetailsButtonRef.current(scale);
  }, [labelOrder, selectedNode, wrapLabel, hasFocus, focusIds, litIds]);

  /* -------------------------------------------------------------------------
   * 8b. BOTÃO FLUTUANTE "Exibir detalhes" — aparece acima do item selecionado
   *     (nó, ou meio da linha). A posição é atualizada a cada quadro
   *     desenhado, direto no estilo do elemento (sem re-render do React), para
   *     acompanhar zoom, arrasto e o movimento da simulação.
   * ----------------------------------------------------------------------- */
  const detailsBtnRef = useRef<HTMLButtonElement>(null);
  const nodeById = useMemo(() => new Map(graphData.nodes.map((n: any) => [n.id, n])), [graphData.nodes]);
  const showDetailsButton = !detailsOpen && (!!selectedNode || !!selectedLink);

  function positionDetailsButton(scale: number) {
    const btn = detailsBtnRef.current;
    const fg = graphRef.current;
    if (!btn) return;
    if (!fg || !showDetailsButton) {
      btn.style.visibility = 'hidden';
      return;
    }
    let gx: number | undefined;
    let gy: number | undefined;
    let r = 0;
    if (selectedNode) {
      const n: any = nodeById.get(selectedNode.id);
      gx = n?.x;
      gy = n?.y;
      r = getNodeRadius(n?.type, n);
    } else if (selectedLink) {
      const s: any = typeof selectedLink.source === 'object' ? selectedLink.source : nodeById.get(selectedLink.source as string);
      const t: any = typeof selectedLink.target === 'object' ? selectedLink.target : nodeById.get(selectedLink.target as string);
      if (s && t) {
        gx = (s.x + t.x) / 2;
        gy = (s.y + t.y) / 2;
      }
    }
    if (typeof gx !== 'number' || typeof gy !== 'number') {
      btn.style.visibility = 'hidden';
      return;
    }
    const p = fg.graph2ScreenCoords(gx, gy);
    const top = p.y - r * scale - 14; // logo acima do círculo
    const halfW = btn.offsetWidth / 2;
    const x = Math.min(Math.max(p.x, halfW + 8), dimensions.width - halfW - 8);
    const y = Math.min(Math.max(top, btn.offsetHeight + 8), dimensions.height - 8);
    btn.style.transform = `translate(${x - halfW}px, ${y - btn.offsetHeight}px)`;
    btn.style.visibility = 'visible';
  }

  // drawLabels é memorizado; o ref garante que ele chame sempre a versão
  // atual (com a seleção e o tamanho da tela de agora).
  positionDetailsButtonRef.current = positionDetailsButton;

  // Sem novo quadro (ex.: simulação parada), o botão precisa aparecer/sumir já.
  useEffect(() => {
    positionDetailsButton(graphRef.current?.zoom?.() ?? 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDetailsButton, selectedNode, selectedLink]);

  /* -------------------------------------------------------------------------
   * 8c. FUNÇÕES PASSADAS À BIBLIOTECA — memorizadas: uma função nova a cada
   *     render faria a biblioteca tratar a propriedade como alterada.
   * ----------------------------------------------------------------------- */
  const linkWidth = useCallback((link: any) => (isLinkSelected(link) ? LINK_WIDTH_SELECTED : LINK_WIDTH), [isLinkSelected]);
  // Ligações com partidos: ocultas (sem desenho nem clique) a não ser que
  // estejam em foco ou o filtro "Partido" esteja marcado (showPartyLinks).
  const linkVisibility = useCallback(
    (link: any) => !isPartyLink(link) || showPartyLinks || (hasFocus && isLinkLit(link)),
    [showPartyLinks, hasFocus, isLinkLit]
  );
  // Partículas animadas (quantidade por status em STATUS_STYLE.particles).
  const linkParticles = useCallback((link: any) => (isLinkLit(link) ? statusStyle(link.status)?.particles ?? 0 : 0), [isLinkLit]);
  const linkParticleColor = useCallback((link: any) => statusColor(link.status), []);
  // Hover (só com mouse; ver HOVER_POINTER_QUERY e suppressHoverUntilRef).
  const handleNodeHover = useCallback(
    (node: any) => {
      if (!canHover || Date.now() < suppressHoverUntilRef.current) return;
      setHoverNodeId(node ? node.id : null);
    },
    [canHover]
  );
  const handleLinkHover = useCallback(
    (link: any) => {
      if (!canHover || Date.now() < suppressHoverUntilRef.current) return;
      setHoverLink(link ?? null);
    },
    [canHover]
  );

  /* -------------------------------------------------------------------------
   * 9. TELA CHEIA — protegido para iOS Safari (sem API) e promessas rejeitadas
   * ----------------------------------------------------------------------- */
  const toggleFullscreen = () => {
    const doc = document as Document & { webkitFullscreenElement?: Element };
    if (!document.fullscreenElement && !doc.webkitFullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex-1 bg-[#080d16] overflow-hidden"
      // Qualquer interação manual cancela o reenquadramento automático.
      onWheel={() => { userMovedCameraRef.current = true; }}
      onPointerDown={() => { userMovedCameraRef.current = true; }}
      // Cursor saiu do grafo: some o destaque de hover.
      onMouseLeave={clearHover}
    >
      <ForceGraph2D
        // A tipagem da biblioteca só aceita objeto de ref, mas ref-callback funciona.
        ref={setGraphInstance as any}
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData as any}
        // Desenho customizado (passos 6–8)
        nodeCanvasObject={drawNode}
        nodePointerAreaPaint={paintPointerArea}
        linkCanvasObjectMode={LINK_CANVAS_MODE}
        linkCanvasObject={drawLink}
        onRenderFramePost={drawLabels}
        // No modo 'replace' a cor/tracejado vêm de drawLink; linkWidth ainda
        // define a área de clique da linha, por isso acompanha a espessura.
        linkWidth={linkWidth}
        linkVisibility={linkVisibility}
        linkDirectionalParticles={linkParticles}
        linkDirectionalParticleSpeed={0.005}
        linkDirectionalParticleWidth={5}
        linkDirectionalParticleColor={linkParticleColor}
        // Interação (funções em 8c). No celular, o toque seleciona.
        onNodeClick={onSelectNode as any}
        onLinkClick={onSelectLink as any}
        onNodeHover={handleNodeHover}
        onLinkHover={handleLinkHover}
        // Toque/clique no fundo limpa a seleção (e o botão "Exibir detalhes").
        onBackgroundClick={onClearSelection}
        // Arrastar: a biblioteca já faz o comportamento desejado sozinha —
        //   • esquema (fixo antes do arraste) → continua fixo onde foi solto;
        //   • demais nós (livres) → são soltos e voltam a se acomodar na teia.
        // Para fixar também os outros nós ao soltar, acrescente:
        //   onNodeDragEnd={(node: any) => { node.fx = node.x; node.fy = node.y; }}
        onEngineStop={handleEngineStop}
        // Física: ver constantes no topo do arquivo e lib/layout.ts
        warmupTicks={WARMUP_TICKS}
        // Com DRIFT_ENABLED = false (padrão), a simulação para depois de
        // COOLDOWN_MS e a teia fica em repouso em todos os aparelhos.
        cooldownTime={driftEnabled ? Infinity : COOLDOWN_MS}
        d3AlphaDecay={0.03}   // ↑ assenta mais rápido (e mais "duro"); ↓ mais lento e suave
        d3VelocityDecay={0.35} // "atrito": ↑ nós param mais cedo, menos tremedeira
        backgroundColor={BG_COLOR}
      />

      {/* Botão "Exibir detalhes" (posição definida em positionDetailsButton) */}
      <button
        ref={detailsBtnRef}
        type="button"
        onClick={onOpenDetails}
        style={{ visibility: 'hidden' }}
        className="absolute left-0 top-0 z-30 inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-2 rounded-lg text-xs font-semibold text-cyan-200 bg-[#0e1726]/95 backdrop-blur-md border border-cyan-500/60 shadow-[0_0_16px_rgba(34,211,238,0.35)] hover:bg-cyan-950 active:scale-95 transition-colors"
      >
        <PanelRightOpen size={16} className="w-4 h-4 shrink-0" aria-hidden="true" />
        {t.graph.showDetails}
      </button>

      {/* LEGENDAS — geradas de lib/graphConfig.ts; escondidas em telas pequenas */}
      <div className="absolute top-4 right-6 hidden sm:block space-y-3 z-20 select-none">
        <div className="bg-[#0e1726]/90 backdrop-blur-md border border-slate-800 rounded-lg p-3 text-[11px] space-y-2 font-mono shadow-2xl">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t.graph.linkLegend}</div>
          {(Object.keys(STATUS_STYLE) as LinkStatus[]).map((key) => {
            const st = STATUS_STYLE[key];
            return (
              <div key={key} className="flex items-center space-x-2.5">
                {st.dashed ? (
                  <span className="w-5 h-0 border-b-2 border-dashed inline-block" style={{ borderColor: st.color }} />
                ) : (
                  <span className="w-5 h-0.5 inline-block rounded-full" style={{ backgroundColor: st.color, boxShadow: `0 0 8px ${st.color}` }} />
                )}
                <span className="text-slate-200">{t.status[key]}</span>
              </div>
            );
          })}
        </div>

        <div className="bg-[#0e1726]/90 backdrop-blur-md border border-slate-800 rounded-lg p-3 text-[11px] space-y-2 font-mono shadow-2xl">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t.graph.nodeLegend}</div>
          {(Object.keys(NODE_STYLE) as NodeType[]).map((key) => (
            <div key={key} className="flex items-center space-x-2.5">
              <span
                className="w-2.5 h-2.5 inline-block rounded-full border"
                style={{
                  borderColor: NODE_STYLE[key].color,
                  // Esquemas são círculos sólidos no grafo; os demais, anéis.
                  backgroundColor: key === 'scheme' ? NODE_STYLE[key].color : undefined,
                  boxShadow: `0 0 8px ${NODE_STYLE[key].color}`,
                }}
              />
              <span className="text-slate-200">{t.nodeType[key].label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CONTROLES DE CÂMERA — o fator 1.2 é o "passo" de cada clique de zoom.
          Alinhados na base com o MENU LEGAL (mesmo bottom-6 e mesma altura). */}
      <div className="absolute bottom-6 left-4 md:left-6 flex items-center space-x-1.5 bg-[#0e1726]/95 backdrop-blur-md border border-slate-800 rounded-lg p-1.5 z-20 shadow-xl select-none">
        <button
          onClick={() => graphRef.current?.zoom(graphRef.current.zoom() * 1.2, 400)}
          className="p-2 md:p-1.5 hover:bg-slate-800 active:bg-slate-700 text-slate-300 rounded transition-colors"
          aria-label={t.graph.zoomIn}
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={() => graphRef.current?.zoom(graphRef.current.zoom() / 1.2, 400)}
          className="p-2 md:p-1.5 hover:bg-slate-800 active:bg-slate-700 text-slate-300 rounded transition-colors"
          aria-label={t.graph.zoomOut}
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={() => graphRef.current?.zoomToFit(400, fitPadding)}
          className="px-2.5 py-1.5 md:py-1 hover:bg-slate-800 active:bg-slate-700 text-slate-300 text-xs font-mono rounded transition-colors"
        >
          {t.graph.recenter}
        </button>
        <button
          onClick={toggleFullscreen}
          className="p-2 md:p-1.5 hover:bg-slate-800 active:bg-slate-700 text-slate-300 rounded transition-colors"
          aria-label={t.graph.fullscreen}
        >
          <Maximize className="w-4 h-4" />
        </button>
      </div>

      {/* CANTO INFERIOR DIREITO — duas peças empilhadas, alinhadas à direita:

          1. SELETOR DE IDIOMA (só no celular, < 640px; em telas maiores ele fica
             no cabeçalho). Fica logo acima do botão "Termos & Privacidade".
          2. MENU LEGAL — abre com o mouse (hover) e também com toque/teclado
             (focus-within). A lista de links abre ENTRE o botão e o seletor de
             idioma e ocupa espaço de verdade (a altura anima de 0 até o tamanho
             dela, via grid-rows 0fr → 1fr), então o seletor sobe junto e
             continua visível com o menu aberto — sem altura fixa no código.

          Posição (bottom-6) e altura do botão iguais às dos controles de câmera,
          para os dois ficarem alinhados na base: o py-3.5/md:py-3 do botão
          reproduz a altura da caixa de câmera (46px no celular, 42px no desktop).
          Se mudar o padding de um, mude o do outro. */}
      <div className="absolute bottom-6 right-4 md:right-6 z-20 flex flex-col items-end gap-2">
        <LanguageSwitcher path="/" variant="floating" className="sm:hidden" />

        <div className="group flex flex-col items-end">
          <div className="grid grid-rows-[0fr] opacity-0 group-hover:grid-rows-[1fr] group-hover:opacity-100 group-focus-within:grid-rows-[1fr] group-focus-within:opacity-100 transition-all duration-200">
            <div className="overflow-hidden min-h-0">
              <div className="mb-2 w-52 bg-[#0e1726]/95 backdrop-blur-md border border-slate-800 rounded-lg p-2 shadow-2xl flex flex-col space-y-1 text-xs">
                <div className="px-2 py-1 text-[10px] font-mono text-slate-500 uppercase tracking-wider border-b border-slate-800/80 mb-1">
                  {t.graph.legalInfo}
                </div>
                {/* Só no celular: em telas ≥ 768px o cabeçalho já tem o botão "Dossiês". */}
                <Link href={href('/esquemas')} className="md:hidden flex items-center space-x-2 px-2 py-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-cyan-400 transition-colors">
                  <FileText className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
                  <span>{t.graph.menuDossiers}</span>
                </Link>
                <Link href={href('/correcoes')} className="flex items-center space-x-2 px-2 py-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-cyan-400 transition-colors">
                  <History className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
                  <span>{t.common.correctionsAndUpdates}</span>
                </Link>
                <Link href={href('/about')} className="flex items-center space-x-2 px-2 py-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-cyan-400 transition-colors">
                  <Info className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
                  <span>{t.graph.menuAbout}</span>
                </Link>
                <Link href={href('/privacy')} className="flex items-center space-x-2 px-2 py-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-cyan-400 transition-colors">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
                  <span>{t.common.privacyPolicy}</span>
                </Link>
                <Link href={href('/terms')} className="flex items-center space-x-2 px-2 py-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-cyan-400 transition-colors">
                  <Scale className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
                  <span>{t.common.termsOfUse}</span>
                </Link>
              </div>
            </div>
          </div>

          <button
            className="flex items-center space-x-2 bg-[#0e1726]/95 backdrop-blur-md border border-slate-800 rounded-lg px-3 py-3.5 md:py-3 text-xs leading-4 text-slate-300 hover:text-cyan-400 hover:border-slate-700/80 shadow-xl transition-all cursor-pointer select-none"
            aria-label={t.graph.legalMenuAria}
            aria-haspopup="true"
          >
            <FileText className="w-4 h-4 text-cyan-400" />
            <span className="font-mono text-xs hidden sm:inline">{t.graph.termsAndPrivacy}</span>
            <ChevronUp className="w-3.5 h-3.5 text-slate-400 group-hover:rotate-180 group-focus-within:rotate-180 transition-transform duration-200" />
          </button>
        </div>
      </div>
    </div>
  );
}
