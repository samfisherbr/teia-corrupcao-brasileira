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
import { Plus, Minus, Maximize, Scale, ShieldCheck, Info, FileText, ChevronUp } from 'lucide-react';
import { GraphData, GraphNode, GraphLink, NodeType, LinkStatus } from '@/types/graph';
import { NODE_STYLE, STATUS_STYLE, FALLBACK_COLOR, getNodeRadius, getLinkKey } from '@/lib/graphConfig';
import { computeLayoutTargets, seedPositions, applyLayoutForces } from '@/lib/layout';

// A biblioteca usa `window`, então só carrega no navegador (ssr: false).
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

interface NetworkGraphProps {
  graphRef: React.MutableRefObject<any>;
  graphData: GraphData;
  selectedNode: GraphNode | null;
  selectedLink: GraphLink | null;
  onSelectNode: (node: GraphNode) => void;
  onSelectLink: (link: GraphLink) => void;
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
 * Desktop/notebook = mouse ou trackpad (ponteiro fino, com hover). Nesses, a
 * simulação nunca para e a deriva suave mantém a teia "respirando".
 * Celular/tablet (toque) = a teia se acomoda e fica parada, poupando bateria.
 * Para ligar a deriva em todos os aparelhos, troque a expressão por `true`.
 */
const DESKTOP_POINTER_QUERY = '(hover: hover) and (pointer: fine)';

function useIsDesktopPointer() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_POINTER_QUERY);
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return isDesktop;
}

/** Espessura das linhas em unidades do grafo: normal / selecionada. */
const LINK_WIDTH = 4;
const LINK_WIDTH_SELECTED = 8;

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
  paused = false,
}: NetworkGraphProps) {
  // Movimento constante só em desktop/notebook (ver DESKTOP_POINTER_QUERY).
  const driftEnabled = useIsDesktopPointer();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const isMobile = dimensions.width < MOBILE_BREAKPOINT;

  // Cache de imagens já baixadas + conjunto das que estão baixando, para não
  // pedir a mesma foto de novo a cada mudança de filtro.
  const imgCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const pendingRef = useRef<Set<string>>(new Set());

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
   * 1. TAMANHO DO CANVAS — acompanha o contêiner (inclusive ao girar o celular)
   * ----------------------------------------------------------------------- */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const updateSize = () => setDimensions({ width: el.clientWidth, height: el.clientHeight });
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

  const handleEngineStop = useCallback(() => {
    if (!userMovedCameraRef.current) graphRef.current?.zoomToFit(400, fitPadding);
  }, [graphRef, fitPadding]);

  /* -------------------------------------------------------------------------
   * 5. IMAGENS — pré-carrega fotos dos nós (ex.: Wikimedia Commons)
   * ----------------------------------------------------------------------- */
  useEffect(() => {
    const urls = Array.from(new Set(graphData.nodes.map((n) => n.image_url).filter((u): u is string => !!u)));
    urls.forEach((url) => {
      if (imgCacheRef.current.has(url) || pendingRef.current.has(url)) return;
      pendingRef.current.add(url);
      const img = new Image();
      img.crossOrigin = 'anonymous'; // necessário para desenhar no canvas sem "contaminá-lo"
      img.onload = () => {
        pendingRef.current.delete(url);
        imgCacheRef.current.set(url, img);
        // Força um redesenho: o canvas pode estar parado após a física acabar.
        graphRef.current?.d3ReheatSimulation?.();
      };
      img.onerror = () => pendingRef.current.delete(url); // fica só o círculo vazio
      img.src = url;
    });
  }, [graphData.nodes, graphRef]);

  /* -------------------------------------------------------------------------
   * 6. DESENHO DOS CÍRCULOS (sem texto — o texto vem no passo 8)
   * ----------------------------------------------------------------------- */
  const drawNode = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const isSelected = selectedNode?.id === node.id;
    const color = NODE_STYLE[node.type as NodeType]?.color ?? '#00f0ff';
    const size = getNodeRadius(node.type);

    ctx.save();

    // Brilho externo. Sufixo hex = opacidade: '44' ≈ 27% (selecionado), '18' ≈ 9%.
    ctx.beginPath();
    ctx.arc(node.x, node.y, size + 8, 0, 2 * Math.PI);
    ctx.fillStyle = `${color}${isSelected ? '44' : '18'}`;
    ctx.fill();

    // Disco interno escuro (fundo da foto).
    ctx.beginPath();
    ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
    ctx.fillStyle = BG_COLOR;
    ctx.fill();

    // Foto recortada em círculo, se já carregou.
    if (node.image_url) {
      const img = imgCacheRef.current.get(node.image_url);
      if (img && img.naturalWidth > 0) {
        ctx.save();
        ctx.clip();
        ctx.drawImage(img, node.x - size, node.y - size, size * 2, size * 2);
        ctx.restore();
      }
    }

    // Borda colorida por cima da foto. Dividir por globalScale mantém a
    // espessura constante na tela, independentemente do zoom.
    ctx.strokeStyle = color;
    ctx.lineWidth = (isSelected ? 3 : 1.8) / globalScale;
    ctx.stroke();

    ctx.restore();
  }, [selectedNode]);

  // Área de clique = raio desenhado + folga (antes era menor que o círculo).
  const paintPointerArea = useCallback((node: any, color: string, ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(node.x, node.y, getNodeRadius(node.type) + CLICK_PADDING, 0, 2 * Math.PI);
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

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);

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
  }, [isLinkSelected]);

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
  const labelLinesCache = useRef(new Map<string, string[]>());
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

  const drawLabels = useCallback((ctx: CanvasRenderingContext2D, globalScale: number) => {
    const scale = globalScale > 0 ? globalScale : 1;

    // O selecionado é desenhado por último → fica por cima até de outros rótulos.
    const ordered = selectedNode
      ? [...graphData.nodes.filter((n) => n.id !== selectedNode.id), ...graphData.nodes.filter((n) => n.id === selectedNode.id)]
      : graphData.nodes;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.lineJoin = 'round';

    for (const node of ordered as any[]) {
      if (typeof node.x !== 'number') continue;
      const style = NODE_STYLE[node.type as NodeType];
      const isSelected = selectedNode?.id === node.id;
      // Nível de detalhe: com a câmera afastada só aparecem esquemas/partidos.
      if (!isSelected && scale < (style?.minZoom ?? 0.5)) continue;

      // Tamanho em px de tela convertido para unidades do grafo.
      const px = style?.labelPx ?? 11;
      const fontSize = px / scale;
      const weight = isSelected ? 700 : node.type === 'scheme' || node.type === 'party' ? 600 : 500;

      let text = String(node.label ?? '');
      if (node.type === 'scheme') text = text.toUpperCase();

      // Quebra medida na fonte em px de tela (independe do zoom → cacheável).
      const maxLines = isSelected ? Infinity : LABEL_MAX_LINES;
      const cacheKey = `${weight}|${px}|${maxLines}|${text}`;
      let lines = labelLinesCache.current.get(cacheKey);
      if (!lines) {
        ctx.font = `${weight} ${px}px Inter, system-ui, sans-serif`;
        lines = wrapLabel(ctx, text, maxLines);
        labelLinesCache.current.set(cacheKey, lines);
      }

      const y = node.y + getNodeRadius(node.type) + 6 / scale;
      const lineStep = fontSize * LABEL_LINE_HEIGHT;
      ctx.font = `${weight} ${fontSize}px Inter, system-ui, sans-serif`;
      ctx.lineWidth = HALO_PX / scale;
      ctx.strokeStyle = BG_COLOR;
      ctx.fillStyle = isSelected ? '#ffffff' : style?.labelColor ?? '#cbd5e1';
      lines.forEach((line, i) => {
        ctx.strokeText(line, node.x, y + i * lineStep);
        ctx.fillText(line, node.x, y + i * lineStep);
      });

      // Linha extra com a sigla do partido (políticos, com zoom próximo).
      if (node.type === 'politician' && node.party && (scale >= 1 || isSelected)) {
        const subSize = (px - 1) / scale;
        ctx.font = `400 ${subSize}px Inter, system-ui, sans-serif`;
        const y2 = y + (lines.length - 1) * lineStep + fontSize + 2 / scale;
        ctx.strokeText(`(${node.party})`, node.x, y2);
        ctx.fillStyle = isSelected ? '#e0f2fe' : '#94a3b8';
        ctx.fillText(`(${node.party})`, node.x, y2);
      }
    }
    ctx.restore();
  }, [graphData.nodes, selectedNode, wrapLabel]);

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
        linkCanvasObjectMode={() => 'replace'}
        linkCanvasObject={drawLink}
        onRenderFramePost={drawLabels}
        // No modo 'replace' a cor/tracejado vêm de drawLink; linkWidth ainda
        // define a área de clique da linha, por isso acompanha a espessura.
        linkWidth={(link: any) => (isLinkSelected(link) ? LINK_WIDTH_SELECTED : LINK_WIDTH)}
        // Partículas animadas (quantidade por status em STATUS_STYLE.particles)
        linkDirectionalParticles={(link: any) => statusStyle(link.status)?.particles ?? 0}
        linkDirectionalParticleSpeed={0.005}
        linkDirectionalParticleWidth={5}
        linkDirectionalParticleColor={(link: any) => statusColor(link.status)}
        // Interação
        onNodeClick={(node: any) => onSelectNode(node)}
        onLinkClick={(link: any) => onSelectLink(link)}
        // Arrastar: a biblioteca já faz o comportamento desejado sozinha —
        //   • esquema (fixo antes do arraste) → continua fixo onde foi solto;
        //   • demais nós (livres) → são soltos e voltam a se acomodar na teia.
        // Para fixar também os outros nós ao soltar, acrescente:
        //   onNodeDragEnd={(node: any) => { node.fx = node.x; node.fy = node.y; }}
        onEngineStop={handleEngineStop}
        // Física: ver constantes no topo do arquivo e lib/layout.ts
        warmupTicks={WARMUP_TICKS}
        // Desktop: Infinity = a simulação nunca para (deriva contínua).
        // Celular: para depois de COOLDOWN_MS e a teia fica em repouso.
        cooldownTime={driftEnabled ? Infinity : COOLDOWN_MS}
        d3AlphaDecay={0.03}   // ↑ assenta mais rápido (e mais "duro"); ↓ mais lento e suave
        d3VelocityDecay={0.35} // "atrito": ↑ nós param mais cedo, menos tremedeira
        backgroundColor={BG_COLOR}
      />

      {/* LEGENDAS — geradas de lib/graphConfig.ts; escondidas em telas pequenas */}
      <div className="absolute top-4 right-6 hidden sm:block space-y-3 z-20 select-none">
        <div className="bg-[#0e1726]/90 backdrop-blur-md border border-slate-800 rounded-lg p-3 text-[11px] space-y-2 font-mono shadow-2xl">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Legenda das Conexões</div>
          {(Object.keys(STATUS_STYLE) as LinkStatus[]).map((key) => {
            const st = STATUS_STYLE[key];
            return (
              <div key={key} className="flex items-center space-x-2.5">
                {st.dashed ? (
                  <span className="w-5 h-0 border-b-2 border-dashed inline-block" style={{ borderColor: st.color }} />
                ) : (
                  <span className="w-5 h-0.5 inline-block rounded-full" style={{ backgroundColor: st.color, boxShadow: `0 0 8px ${st.color}` }} />
                )}
                <span className="text-slate-200">{st.label}</span>
              </div>
            );
          })}
        </div>

        <div className="bg-[#0e1726]/90 backdrop-blur-md border border-slate-800 rounded-lg p-3 text-[11px] space-y-2 font-mono shadow-2xl">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Legenda dos Círculos</div>
          {(Object.keys(NODE_STYLE) as NodeType[]).map((key) => (
            <div key={key} className="flex items-center space-x-2.5">
              <span
                className="w-2.5 h-2.5 inline-block rounded-full border"
                style={{ borderColor: NODE_STYLE[key].color, boxShadow: `0 0 8px ${NODE_STYLE[key].color}` }}
              />
              <span className="text-slate-200">{NODE_STYLE[key].label}</span>
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
          aria-label="Aproximar"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={() => graphRef.current?.zoom(graphRef.current.zoom() / 1.2, 400)}
          className="p-2 md:p-1.5 hover:bg-slate-800 active:bg-slate-700 text-slate-300 rounded transition-colors"
          aria-label="Afastar"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={() => graphRef.current?.zoomToFit(400, fitPadding)}
          className="px-2.5 py-1.5 md:py-1 hover:bg-slate-800 active:bg-slate-700 text-slate-300 text-xs font-mono rounded transition-colors"
        >
          recentralizar
        </button>
        <button
          onClick={toggleFullscreen}
          className="p-2 md:p-1.5 hover:bg-slate-800 active:bg-slate-700 text-slate-300 rounded transition-colors"
          aria-label="Tela cheia"
        >
          <Maximize className="w-4 h-4" />
        </button>
      </div>

      {/* MENU LEGAL — abre com o mouse (hover) e também com toque/teclado (focus-within).
          Posição (bottom-6) e altura do botão iguais às dos controles de câmera, para
          os dois ficarem alinhados na base: o py-3.5/md:py-3 do botão reproduz a altura
          da caixa de câmera (46px no celular, 42px no desktop). Se mudar o padding de
          um, mude o do outro. */}
      <div className="absolute bottom-6 right-4 md:right-6 z-20 group">
        <div className="absolute bottom-full right-0 mb-2 w-48 bg-[#0e1726]/95 backdrop-blur-md border border-slate-800 rounded-lg p-2 shadow-2xl opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:translate-y-0 group-focus-within:pointer-events-auto transition-all duration-200 flex flex-col space-y-1 text-xs">
          <div className="px-2 py-1 text-[10px] font-mono text-slate-500 uppercase tracking-wider border-b border-slate-800/80 mb-1">
            Informações Legais
          </div>
          <Link href="/esquemas" className="flex items-center space-x-2 px-2 py-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-cyan-400 transition-colors">
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span>Dossiês dos esquemas</span>
          </Link>
          <Link href="/about" className="flex items-center space-x-2 px-2 py-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-cyan-400 transition-colors">
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>Sobre nós</span>
          </Link>
          <Link href="/privacy" className="flex items-center space-x-2 px-2 py-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-cyan-400 transition-colors">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Política de privacidade</span>
          </Link>
          <Link href="/terms" className="flex items-center space-x-2 px-2 py-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-cyan-400 transition-colors">
            <Scale className="w-3.5 h-3.5 text-cyan-400" />
            <span>Termos de uso</span>
          </Link>
        </div>

        <button
          className="flex items-center space-x-2 bg-[#0e1726]/95 backdrop-blur-md border border-slate-800 rounded-lg px-3 py-3.5 md:py-3 text-xs leading-4 text-slate-300 hover:text-cyan-400 hover:border-slate-700/80 shadow-xl transition-all cursor-pointer select-none"
          aria-label="Menu de páginas legais"
          aria-haspopup="true"
        >
          <FileText className="w-4 h-4 text-cyan-400" />
          <span className="font-mono text-xs hidden sm:inline">Termos & Privacidade</span>
          <ChevronUp className="w-3.5 h-3.5 text-slate-400 group-hover:rotate-180 group-focus-within:rotate-180 transition-transform duration-200" />
        </button>
      </div>
    </div>
  );
}
