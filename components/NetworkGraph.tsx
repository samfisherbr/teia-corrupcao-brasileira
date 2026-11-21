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
import { Plus, Minus, Maximize, Scale, ShieldCheck, Info, FileText, ChevronUp, PanelRightOpen, RotateCcwClock, BookOpenText, Cookie } from 'lucide-react';
import { HOME_TEXT_ID } from '@/lib/site';
import { ConsentGate, ConsentSettingsButton } from '@/components/ConsentSettings';
import { GraphData, GraphNode, GraphLink, NodeType, LinkStatus } from '@/types/graph';
import { NODE_STYLE, STATUS_STYLE, FALLBACK_COLOR, getNodeRadius, getLinkKey, getLinkEnds } from '@/lib/graphConfig';
import { computeLayoutTargets, seedPositions, applyLayoutForces, isPartyLink } from '@/lib/layout';
import { createIsoState, depthOf, fullIsoOffset, morphForZoom, project, resolveLifts, setMorph, unprojectGround, zoomForFull25D } from '@/lib/iso';
import { drawFloor, drawGroundMarks, getGlossSprite, getSphereSprite, SPHERE_PHOTO_INSET } from '@/components/graph25d';
import { createVortex, drawVortex, VortexState } from '@/components/graphVortex';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { resizedPhotoUrl } from '@/lib/photoUrl';
import { fitToView, type Fit, type FitItem, type Rect } from '@/lib/fitArea';
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
/**
 * Margem (px) entre a teia e a borda da área livre ao enquadrar a teia
 * inteira. O enquadramento já conta os círculos e os nomes dos esquemas
 * (lib/fitArea.ts), então a margem é só respiro.
 */
const FIT_PADDING_DESKTOP = 24;
const FIT_PADDING_MOBILE = 12;
/** Mudança mínima (fração do zoom) para o reenquadramento ao assentar acontecer. */
const SETTLE_REFIT_MIN_CHANGE = 0.02;

/**
 * Rótulos dos nós (desenho em 7 e enquadramento em 4), em px de tela:
 * contorno escuro, largura máxima antes de quebrar a linha, nº máximo de
 * linhas e altura da linha (× tamanho da fonte).
 */
const HALO_PX = 4;
const LABEL_MAX_WIDTH_PX = 170;
const LABEL_MAX_LINES = 3;
const LABEL_LINE_HEIGHT = 1.2;

/**
 * Física: quantos "passos" a simulação roda ANTES do primeiro desenho
 * (invisível ao usuário) e por quanto tempo continua animando depois.
 *   - WARMUP_TICKS ↑ = abre mais "assentado", porém demora mais para aparecer.
 *     Como as posições já nascem no lugar certo (layout semeado), 30 basta:
 *     os passos de aquecimento rodam todos de uma vez e travam a página
 *     (100 passos ≈ 0,4–0,7 s sem resposta no celular); o resto do
 *     assentamento acontece animado, durante COOLDOWN_MS.
 *   - COOLDOWN_MS  = tempo MÁXIMO de animação após aparecer (trava de
 *     segurança para aparelhos lentos; normalmente a física para antes, ao
 *     chegar em ALPHA_MIN).
 *   - ALPHA_DECAY  = quanto a "energia" da simulação cai a cada passo.
 *     ↑ assenta mais rápido (e mais "duro"); ↓ mais lento e suave.
 *   - ALPHA_MIN    = energia abaixo da qual a física PARA (onEngineStop). O
 *     padrão da biblioteca é 0 (nunca para sozinha: ia sempre até
 *     COOLDOWN_MS), mas abaixo de ~0,01 os nós só se mexem frações de pixel.
 * Medido com os dados de nov/2026 (348 nós): 0,045 + 0,01 para em ~100
 * passos (~1,7 s a 60 quadros/s; antes ~4 s), sem círculos sobrepostos.
 */
const WARMUP_TICKS = 30;
const COOLDOWN_MS = 4000;
const ALPHA_DECAY = 0.045;
const ALPHA_MIN = 0.01;

/**
 * Deriva contínua ("teia respirando"): DESLIGADA em todos os aparelhos — a
 * teia se acomoda em COOLDOWN_MS e fica parada, igual no celular e no
 * desktop. Para religar (a simulação nunca para), troque por `true`.
 */
const DRIFT_ENABLED = false;

/**
 * Intervalo mínimo (ms) entre dois quadros do vórtice com o grafo parado.
 * 33 ≈ 30 quadros/s (com folga de 1–2 ms para não cair para 20 em telas de 60 Hz).
 */
const VORTEX_FRAME_MS = 31;

/**
 * Fotos dos nós: começam a baixar quando a simulação assenta (onEngineStop) ou
 * PHOTO_LOAD_DELAY_MS depois de o grafo aparecer, o que vier primeiro. Assim
 * os ~240 downloads e decodificações não disputam a CPU com o primeiro desenho.
 */
const PHOTO_LOAD_DELAY_MS = 2500;

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
/** Folga da área de clique das linhas (padrão linkHoverPrecision da biblioteca). */
const LINK_HOVER_PRECISION = 4;

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
 * MODO 2.5D (interruptor acima dos controles de câmera; ver lib/iso.ts).
 * Ligado, a teia passa a 2.5D ao aproximar — seja pela roda/pinça, seja
 * pelo enquadramento automático da seleção — e volta ao 2D ao afastar.
 *   SWITCH_ANIM_MS          — duração da animação ao ligar/desligar.
 *   FOCUS25D_MS             — duração do enquadramento da seleção no 2.5D.
 *   FOCUS25D_MAX_ZOOM       — zoom máximo desse enquadramento (2D: FOCUS_MAX_ZOOM).
 *                             Menor que no 2D: cabem mais vizinhos na tela.
 *   FOCUS25D_FIT_SHARE      — fração dos vizinhos que precisa caber; os mais
 *                             distantes (ligados a outros casos, longe) podem
 *                             ficar fora, para o zoom não despencar por causa deles.
 *   FOCUS25D_LABEL_ALLOWANCE — espaço (unid. do grafo) abaixo de cada esfera para o rótulo.
 * Sem preferência salva: a escolha vale só para a visita atual. Com
 * "reduzir movimento" ligado no sistema, o interruptor já começa desligado.
 */
const SWITCH_ANIM_MS = 500;
const FOCUS25D_MS = 900;
const FOCUS25D_MAX_ZOOM = 0.9;
const FOCUS25D_FIT_SHARE = 0.75;
const FOCUS25D_LABEL_ALLOWANCE = 50;
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
/**
 * Preferência do interruptor, guardada SÓ no navegador do visitante
 * (localStorage: não é cookie e não vai para nenhum servidor). '1' = ligado,
 * '0' = desligado; sem valor salvo, vale o padrão (ligado, ou desligado com
 * "reduzir movimento").
 */
const VIEW25D_STORAGE_KEY = 'teia.view25d';

/**
 * AFASTAR OS GRUPOS NO 2.5D — cada esquema e as suas entidades diretas
 * (as "luas") se afastam dos outros grupos, como um bloco, para os sistemas
 * não se embolarem no chão achatado do isométrico. Só no DESENHO: a física e
 * o 2D não mudam, e o afastamento cresce junto com a transição (0 no 2D).
 *   SPREAD_25D — distância entre grupos no 2.5D completo ÷ distância no 2D.
 * O afastamento é a partir do grupo que está no centro da tela (ou do item
 * selecionado) quando o 2.5D começa: esse grupo fica parado e os outros se
 * afastam dele. Entidades de vários esquemas ficam no meio deles; os
 * partidos se movem juntos, como o núcleo.
 */
const SPREAD_25D = 1.4;
/** Chave especial em schemesOfRef com a lista de todos os esquemas. */
const SCHEMES_KEY = '__schemes__';

/** Altura-base do tipo (NODE_STYLE.lift). */
const baseLift = (node: any) => NODE_STYLE[node?.type as NodeType]?.lift ?? 0;
/**
 * Altura usada no 2.5D: a ajustada para não haver esferas escondidas
 * (resolveLifts em lib/iso.ts, guardada em __lift) ou, antes do 1º cálculo,
 * a do tipo.
 */
const nodeLift = (node: any) => (typeof node?.__lift === 'number' ? node.__lift : baseLift(node));
/** Duração da animação quando as alturas são recalculadas com o 2.5D na tela. */
const LIFT_ANIM_MS = 500;
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

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
  // As fotos só começam a baixar depois do primeiro desenho (ver PHOTO_LOAD_DELAY_MS).
  const [photosEnabled, setPhotosEnabled] = useState(false);

  // O ForceGraph2D é carregado sob demanda, então graphRef.current pode ser
  // null quando os efeitos rodam pela 1ª vez. O ref-callback + estado faz os
  // efeitos rodarem de novo assim que a instância existe.
  const [graphReady, setGraphReady] = useState(false);
  const setGraphInstance = useCallback((instance: any) => {
    graphRef.current = instance;
    setGraphReady(!!instance);
  }, [graphRef]);

  /* -------------------------------------------------------------------------
   * 0a. MODO 2.5D — estado da projeção (lib/iso.ts)
   *     isoRef      — projeção atual (muda a cada quadro de zoom; ref, sem re-render)
   *     switchTRef  — animação do interruptor (0 = desligado, 1 = ligado)
   *     active25d   — há algo de 2.5D na tela (m > 0)? Só muda ao cruzar o
   *                   limiar; desliga arrasto de nós e partículas no 2.5D.
   * ----------------------------------------------------------------------- */
  const [enabled25d, setEnabled25d] = useState(true);
  const enabled25dRef = useRef(true);
  const isoRef = useRef(createIsoState());
  const switchTRef = useRef(1);
  const switchAnimRef = useRef(0);
  const focusAnimRef = useRef(0);
  // Até quando (performance.now()) a câmera está enquadrando a seleção: nesse
  // tempo o botão "Exibir detalhes" fica escondido em vez de correr atrás do nó.
  const cameraBusyUntilRef = useRef(0);
  // Se o usuário já mexeu na câmera (roda, pinça, arrasto, botões, seleção),
  // o reenquadramento ao assentar não acontece. Volta a false quando o
  // conjunto de nós muda (filtros) — aí a teia é reenquadrada de novo.
  const userMovedCameraRef = useRef(false);
  // Legenda aberta abaixo de 1280px (acima disso fica sempre aberta).
  const [legendOpen, setLegendOpen] = useState(false);
  // Posiciona o botão "Exibir detalhes" (definido na seção 8b; ref para poder
  // ser chamado de qualquer lugar sem depender da ordem das declarações).
  const positionDetailsButtonRef = useRef<(scale: number) => void>(() => {});
  const [active25d, setActive25d] = useState(false);
  // clearHover é definido mais abaixo (seção 0); o ref evita depender da ordem.
  const clearHoverRef = useRef<() => void>(() => {});
  /** Ponto (mundo, com altura) do item selecionado: o nó, ou o meio da linha. Atualizado a cada render. */
  const selectionPointRef = useRef<(m?: number) => { x: number; y: number; z: number } | null>(() => null);
  /** Âncora de grupo do item selecionado (ver groupAnchor), ou null. */
  const selectionAnchorRef = useRef<() => [number, number] | null>(() => null);
  const active25dRef = useRef(false);
  const dimensionsRef = useRef(dimensions);
  dimensionsRef.current = dimensions;

  // Preferência salva (só neste navegador) > "reduzir movimento" > ligado.
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = window.localStorage.getItem(VIEW25D_STORAGE_KEY);
    } catch {
      // armazenamento bloqueado (ex.: janela anônima restrita): usa o padrão
    }
    const on = saved === '1' ? true : saved === '0' ? false : !window.matchMedia(REDUCED_MOTION_QUERY).matches;
    enabled25dRef.current = on;
    switchTRef.current = on ? 1 : 0;
    setEnabled25d(on);
  }, []);

  /* Afastamento dos grupos (ver SPREAD_25D). schemesOfRef: id do nó → os
   * esquemas a que ele está ligado (preenchido na seção 0, onde está a lista
   * de vizinhos). spreadCentreRef: ponto a partir do qual os grupos se afastam. */
  const schemesOfRef = useRef(new Map<string, any[]>());
  const spreadCentreRef = useRef({ x: 0, y: 0 });

  /** Ponto que representa o grupo do nó: o esquema, a média dos seus esquemas, o núcleo (partidos) ou ele mesmo. */
  const groupAnchor = useCallback((n: any): [number, number] => {
    if (n.type === 'scheme') return [n.x, n.y];
    if (n.type === 'party') return [0, 0];
    const schemes = schemesOfRef.current.get(n.id);
    if (!schemes || schemes.length === 0) return [n.x, n.y];
    let x = 0, y = 0, c = 0;
    for (const sc of schemes) {
      if (typeof sc.x !== 'number') continue;
      x += sc.x; y += sc.y; c++;
    }
    return c ? [x / c, y / c] : [n.x, n.y];
  }, []);

  /** Posição no chão já com o afastamento dos grupos, para um m (padrão: o atual). */
  const spreadXY = useCallback((n: any, m: number = isoRef.current.m): [number, number] => {
    if (m === 0) return [n.x, n.y];
    const k = (SPREAD_25D - 1) * m;
    const [ax, ay] = groupAnchor(n);
    const c = spreadCentreRef.current;
    return [n.x + k * (ax - c.x), n.y + k * (ay - c.y)];
  }, [groupAnchor]);

  /** Posição desenhada de um nó: projetada (e com grupos afastados) no 2.5D; no 2D, o próprio x/y. */
  const pos = useCallback((n: any): [number, number] => {
    const [x, y] = spreadXY(n);
    return project(isoRef.current, x, y, nodeLift(n));
  }, [spreadXY]);

  /**
   * Escolhe de onde os grupos se afastam, ao ENTRAR no 2.5D: o grupo do item
   * selecionado ou, sem seleção, o esquema (ou o núcleo) mais perto do centro
   * da tela. Fica fixo enquanto houver 2.5D na tela.
   */
  const chooseSpreadCentre = useCallback((cx: number, cy: number) => {
    const sel = selectionAnchorRef.current();
    if (sel) {
      spreadCentreRef.current = { x: sel[0], y: sel[1] };
      return;
    }
    let best: [number, number] = [0, 0];
    let bestD = Math.hypot(cx, cy);
    for (const sc of schemesOfRef.current.get(SCHEMES_KEY) ?? []) {
      if (typeof sc.x !== 'number') continue;
      const d = Math.hypot(sc.x - cx, sc.y - cy);
      if (d < bestD) { bestD = d; best = [sc.x, sc.y]; }
    }
    spreadCentreRef.current = { x: best[0], y: best[1] };
  }, []);

  /** setMorph + escolha do centro do afastamento ao sair do 2D. Use sempre esta. */
  const applyMorph = useCallback((m: number, cx: number, cy: number) => {
    const st = isoRef.current;
    if (st.m === 0 && m >= 1e-3) chooseSpreadCentre(cx, cy);
    setMorph(st, m, cx, cy);
  }, [chooseSpreadCentre]);

  /** Pede um redesenho (zoom(zoom atual) só marca o canvas; não mexe na câmera). */
  const requestFrame = useCallback(() => {
    const fg = graphRef.current;
    const k = fg?.zoom?.();
    if (typeof k === 'number') fg.zoom(k);
  }, [graphRef]);

  const cancelFocusAnim = useCallback(() => {
    cancelAnimationFrame(focusAnimRef.current);
    focusAnimRef.current = 0;
  }, []);

  /** O usuário pegou a câmera (roda, pinça, arrasto, botões): para o enquadramento animado e mostra já o "Exibir detalhes". */
  const userTookCamera = useCallback(() => {
    userMovedCameraRef.current = true;
    cancelFocusAnim();
    if (cameraBusyUntilRef.current) {
      cameraBusyUntilRef.current = 0;
      positionDetailsButtonRef.current(graphRef.current?.zoom?.() ?? 1);
    }
  }, [cancelFocusAnim, graphRef]);

  const toggle25d = useCallback(() => {
    // A teia se move sob o cursor parado: sem isso o destaque de hover
    // "pularia" para o que passasse por baixo dele.
    suppressHoverUntilRef.current = Date.now() + SWITCH_ANIM_MS + 300;
    clearHoverRef.current();
    // Um enquadramento de seleção em andamento disputaria a câmera com esta animação.
    cancelFocusAnim();
    const next = !enabled25dRef.current;
    enabled25dRef.current = next;
    setEnabled25d(next);
    try {
      window.localStorage.setItem(VIEW25D_STORAGE_KEY, next ? '1' : '0');
    } catch {
      // sem armazenamento: a escolha vale só para esta visita
    }
    cancelAnimationFrame(switchAnimRef.current);
    const from = switchTRef.current;
    const to = next ? 1 : 0;
    const start = performance.now();
    // Com algo selecionado, ele fica PARADO na tela durante a animação (o
    // resto gira/achata em volta dele): guarda onde ele está agora, em px.
    const fg0 = graphRef.current;
    const pin = selectionPointRef.current();
    let pinScreen: { x: number; y: number } | null = null;
    if (fg0 && pin) {
      const [px, py] = project(isoRef.current, pin.x, pin.y, pin.z);
      pinScreen = fg0.graph2ScreenCoords(px, py);
    }
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / SWITCH_ANIM_MS);
      switchTRef.current = from + (to - from) * easeInOutCubic(t);
      const fg = graphRef.current;
      if (fg && pinScreen) {
        // Aplica a projeção deste passo e põe a câmera de modo que o ponto
        // selecionado continue em pinScreen.
        const k = fg.zoom();
        const { width, height } = dimensionsRef.current;
        const c = fg.centerAt();
        applyMorph(morphForZoom(k, Math.min(width, height)) * switchTRef.current, c.x, c.y);
        const p = selectionPointRef.current() ?? { x: 0, y: 0, z: 0 };
        const [px, py] = project(isoRef.current, p.x, p.y, p.z);
        fg.centerAt(px - (pinScreen.x - width / 2) / k, py - (pinScreen.y - height / 2) / k);
      } else {
        requestFrame();
      }
      if (t < 1) switchAnimRef.current = requestAnimationFrame(step);
    };
    switchAnimRef.current = requestAnimationFrame(step);
  }, [requestFrame, graphRef, applyMorph, cancelFocusAnim]);

  useEffect(() => () => {
    cancelAnimationFrame(switchAnimRef.current);
    cancelAnimationFrame(focusAnimRef.current);
  }, []);

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

  // Esquemas de cada nó (para o afastamento dos grupos no 2.5D).
  const schemesOf = useMemo(() => {
    const byId = new Map<string, any>(graphData.nodes.map((n: any) => [n.id, n]));
    const out = new Map<string, any[]>();
    for (const n of graphData.nodes as any[]) {
      if (n.type === 'scheme' || n.type === 'party') continue;
      const list: any[] = [];
      adjacency.get(n.id)?.forEach((id) => {
        const other = byId.get(id);
        if (other?.type === 'scheme') list.push(other);
      });
      out.set(n.id, list);
    }
    // Os próprios esquemas entram como candidatos a centro (chooseSpreadCentre).
    out.set(SCHEMES_KEY, (graphData.nodes as any[]).filter((n) => n.type === 'scheme'));
    return out;
  }, [graphData.nodes, adjacency]);
  schemesOfRef.current = schemesOf;

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
  clearHoverRef.current = clearHover;

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
   * 4. CÂMERA — enquadra a teia inteira logo que os nós aparecem
   *    (instantâneo) e de novo quando o conjunto de nós muda (filtros).
   *    Quando a física assenta (onEngineStop, ~1,7 s), reenquadra suavemente
   *    SE o usuário não mexeu na câmera e se a diferença passar de
   *    SETTLE_REFIT_MIN_CHANGE: com a teia inteira quase não muda, mas com
   *    filtros (ex.: o ano atual, padrão no celular) os poucos nós visíveis
   *    ainda se aproximam bastante depois do 1º quadro.
   *    A detecção de "mexeu" escuta na fase de CAPTURA (ver o contêiner):
   *    o d3-zoom engole a roda do mouse, e antes um zoom pela roda não era
   *    percebido e era desfeito pelo reenquadramento.
   * ----------------------------------------------------------------------- */
  const fitPadding = isMobile ? FIT_PADDING_MOBILE : FIT_PADDING_DESKTOP;

  // Contexto só para medir os rótulos (mesma fonte do desenho em 7).
  const measureCtxRef = useRef<CanvasRenderingContext2D | null>(null);

  /**
   * Calcula o enquadramento da teia inteira: maior zoom em que todos os
   * círculos E os nomes visíveis cabem no canvas sem ficar por baixo dos
   * painéis marcados com `data-graph-overlay` (legendas, controles, "Como
   * ler o mapa", menu legal). Ver lib/fitArea.ts.
   * Os nomes têm tamanho fixo em px; quais aparecem depende do zoom (minZoom
   * de cada tipo), então o cálculo é refeito com os tipos que passam a ter
   * nome no zoom encontrado (no máximo 3 voltas).
   */
  const computeFit = useCallback(() => {
    const box = containerRef.current?.getBoundingClientRect();
    const nodes = (graphData.nodes as any[]).filter((n) => typeof n.x === 'number' && typeof n.y === 'number');
    if (!box || box.width === 0 || box.height === 0 || nodes.length === 0) return null;

    const overlays: Rect[] = [];
    document.querySelectorAll<HTMLElement>('[data-graph-overlay]').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return; // escondido (display: none)
      overlays.push({ left: r.left - box.left, top: r.top - box.top, right: r.right - box.left, bottom: r.bottom - box.top });
    });

    if (!measureCtxRef.current) measureCtxRef.current = document.createElement('canvas').getContext('2d');
    const ctx = measureCtxRef.current;
    const labelBox = (n: any) => {
      const style = NODE_STYLE[n.type as NodeType];
      const px = style?.labelPx ?? 11;
      let text = String(n.label ?? '');
      if (n.type === 'scheme') text = text.toUpperCase();
      let w = LABEL_MAX_WIDTH_PX;
      if (ctx) {
        ctx.font = `${n.type === 'scheme' || n.type === 'party' ? 600 : 500} ${px}px Inter, system-ui, sans-serif`;
        w = ctx.measureText(text).width;
      }
      const lines = Math.min(LABEL_MAX_LINES, Math.max(1, Math.ceil(w / LABEL_MAX_WIDTH_PX)));
      // Mesmas medidas do desenho: 6 px abaixo do círculo + linhas + contorno (halo).
      return { halfW: Math.min(w, LABEL_MAX_WIDTH_PX) / 2 + HALO_PX, below: 6 + lines * px * LABEL_LINE_HEIGHT + HALO_PX };
    };

    let fit: Fit | null = null;
    let k = 0;
    for (let round = 0; round < 3; round++) {
      const items: FitItem[] = nodes.map((n) => {
        const labelled = (NODE_STYLE[n.type as NodeType]?.minZoom ?? 0.5) <= k;
        const lb = labelled ? labelBox(n) : null;
        return { x: n.x, y: n.y, r: getNodeRadius(n.type, n), labelHalfW: lb?.halfW ?? 0, labelBelow: lb?.below ?? 0 };
      });
      const next = fitToView(items, box.width, box.height, overlays, fitPadding);
      if (!next) break;
      fit = next;
      if (next.k <= k) break; // nenhum tipo novo ganha nome neste zoom
      k = next.k;
    }
    return fit;
  }, [graphData, fitPadding]);

  /** Aplica o enquadramento (ms = duração da animação). */
  const fitGraph = useCallback((ms: number) => {
    const fg = graphRef.current;
    const fit = computeFit();
    if (!fg || !fit) return;
    // Mesma ordem do zoomToFit da biblioteca: o zoom gira em torno do centro do canvas.
    fg.centerAt(fit.cx, fit.cy, ms);
    fg.zoom(fit.k, ms);
  }, [graphRef, computeFit]);

  useEffect(() => {
    const fg = graphRef.current;
    if (!fg || graphData.nodes.length === 0) return;
    userMovedCameraRef.current = false;
    // Espera um quadro para a biblioteca registrar os nós antes de medir.
    const id = requestAnimationFrame(() => fitGraph(0));
    return () => cancelAnimationFrame(id);
    // Só reenquadra quando muda o CONJUNTO de nós (filtros), não a cada render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graphReady, graphData.nodes.length]);

  /* 4b. ENQUADRAR O FOCO — ao selecionar um nó ou uma linha, a câmera mostra
   *     o nó e TODOS os vizinhos em destaque, com zoom limitado e o foco
   *     acima dos controles de câmera (igual no celular e no desktop).
   *     Quando o painel de detalhes abre no desktop (ocupa DRAWER_WIDTH_PX à
   *     direita), a câmera desliza para a esquerda; ao fechar, volta. */
  /**
   * 4c. ENQUADRAR O FOCO NO 2.5D — animação própria (a da biblioteca anda em
   *     linha reta no espaço projetado, que muda durante a transição).
   *     A cada quadro: zoom → projeção do momento → câmera sobre o ponto do
   *     caminho entre o centro atual e o item selecionado (em coordenadas do
   *     mundo, com a altura). Termina com o item no centro, acima dos
   *     controles e, com o painel aberto no desktop, à esquerda dele.
   *
   *     Zoom final: o necessário para caber FOCUS25D_FIT_SHARE dos vizinhos
   *     (os mais distantes podem ficar fora), entre o zoom em que o 2.5D fica
   *     completo e FOCUS25D_MAX_ZOOM.
   */
  function startFocus25d(lit: Set<string>) {
    const g = graphRef.current;
    if (!g) return;
    cancelFocusAnim();
    const st = isoRef.current;
    const { width, height } = dimensionsRef.current;
    const viewMin = Math.min(width, height);

    // Ponto focal: o nó, ou o meio da linha — já com o afastamento dos
    // grupos como ficará no 2.5D completo (m = 1). Vindo do 2D, o afastamento
    // passa a partir do grupo selecionado (ele fica parado; os outros se afastam).
    if (st.m === 0) {
      const c = g.centerAt();
      chooseSpreadCentre(c.x, c.y);
    }
    const focus = selectionPointRef.current(1);
    if (!focus) return;
    const { x: fx, y: fy, z: fz } = focus;
    const centreId: string | null = selectedNode ? selectedNode.id : null;

    // Espaço útil: tira o painel (desktop, aberto) e a faixa dos controles.
    const drawer = !isMobile && detailsOpenRef.current ? DRAWER_WIDTH_PX : 0;
    const pad = Math.min(60, 0.08 * viewMin);
    const halfW = (width - drawer) / 2 - pad;
    const halfH = (height - BOTTOM_CONTROLS_PX) / 2 - pad;

    // Zoom que cada vizinho exige para caber (no 2.5D completo).
    const needs: number[] = [];
    lit.forEach((id) => {
      if (id === centreId) return;
      const n: any = nodeById.get(id);
      if (!n || typeof n.x !== 'number') return;
      const r = getNodeRadius(n.type, n);
      const [nx, ny] = spreadXY(n, 1);
      const [ox, oy] = fullIsoOffset(nx - fx, ny - fy, nodeLift(n) - fz);
      const kx = halfW / (Math.abs(ox) + r);
      const ky = halfH / (Math.abs(oy) + r + FOCUS25D_LABEL_ALLOWANCE);
      needs.push(Math.min(kx, ky));
    });
    needs.sort((a, b) => a - b);
    const kFull = zoomForFull25D(viewMin);
    const kMax = Math.max(kFull, FOCUS25D_MAX_ZOOM);
    const kFit = needs.length ? needs[Math.floor((1 - FOCUS25D_FIT_SHARE) * needs.length)] : kMax;
    const kEnd = Math.min(kMax, Math.max(kFull, kFit));

    const k0 = g.zoom();
    const c0 = g.centerAt();
    const [w0x, w0y] = unprojectGround(st, c0.x, c0.y);
    const offX = drawer / 2;
    const offY = BOTTOM_CONTROLS_PX / 2;
    const start = performance.now();
    suppressHoverUntilRef.current = Date.now() + FOCUS25D_MS + 700;

    const step = (now: number) => {
      const gg = graphRef.current;
      if (!gg) return;
      const e = easeInOutCubic(Math.min(1, (now - start) / FOCUS25D_MS));
      const k = Math.exp(Math.log(k0) + (Math.log(kEnd) - Math.log(k0)) * e);
      gg.zoom(k);
      const c = gg.centerAt();
      applyMorph(morphForZoom(k, viewMin) * switchTRef.current, c.x, c.y);
      // O ponto focal com o afastamento DESTE passo (cresce junto com m).
      const p = selectionPointRef.current() ?? focus;
      const [px, py] = project(st, w0x + (p.x - w0x) * e, w0y + (p.y - w0y) * e, p.z * e);
      gg.centerAt(px + (offX * e) / k, py + (offY * e) / k);
      focusAnimRef.current = e < 1 ? requestAnimationFrame(step) : 0;
    };
    focusAnimRef.current = requestAnimationFrame(step);
  }

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
    // "Exibir detalhes" só aparece quando a câmera para (ver positionDetailsButton).
    const busyMs = enabled25dRef.current ? 50 + FOCUS25D_MS : 50 + FOCUS_FIT_MS + 80 + 300;
    cameraBusyUntilRef.current = performance.now() + busyMs;
    const showBtn = setTimeout(() => {
      cameraBusyUntilRef.current = 0;
      positionDetailsButtonRef.current(graphRef.current?.zoom?.() ?? 1);
    }, busyMs + 20);
    if (enabled25dRef.current) {
      const t0 = setTimeout(() => startFocus25d(lit), 50);
      return () => {
        clearTimeout(t0);
        clearTimeout(showBtn);
        cancelFocusAnim();
      };
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
      clearTimeout(showBtn);
      cameraBusyUntilRef.current = 0;
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

  /**
   * 4d. ALTURAS AUTOMÁTICAS NO 2.5D — quando a física se acomoda (ao abrir,
   *     ao mudar filtros, depois de arrastar), recalcula a altura de cada
   *     entidade para nenhuma ficar escondida atrás de outra (resolveLifts em
   *     lib/iso.ts). Se o 2.5D estiver na tela, as esferas deslizam até a
   *     nova altura em LIFT_ANIM_MS; no 2D, só passa a valer.
   */
  const liftAnimRef = useRef(0);
  const recomputeLifts = useCallback(() => {
    const nodes = graphData.nodes.filter((n: any) => typeof n.x === 'number') as any[];
    if (!nodes.length) return;
    const { lifts } = resolveLifts(
      nodes.map((n) => ({ x: n.x, y: n.y, r: getNodeRadius(n.type, n), base: baseLift(n) })),
    );
    cancelAnimationFrame(liftAnimRef.current);
    if (isoRef.current.m === 0) {
      nodes.forEach((n, i) => { n.__lift = lifts[i]; });
      return;
    }
    const from = nodes.map((n) => nodeLift(n));
    const start = performance.now();
    const step = (now: number) => {
      const e = easeInOutCubic(Math.min(1, (now - start) / LIFT_ANIM_MS));
      nodes.forEach((n, i) => { n.__lift = from[i] + (lifts[i] - from[i]) * e; });
      requestFrame();
      if (e < 1) liftAnimRef.current = requestAnimationFrame(step);
    };
    liftAnimRef.current = requestAnimationFrame(step);
  }, [graphData.nodes, requestFrame]);
  useEffect(() => () => cancelAnimationFrame(liftAnimRef.current), []);

  const handleEngineStop = useCallback(() => {
    setPhotosEnabled(true);
    recomputeLifts();
    const fg = graphRef.current;
    if (!fg || userMovedCameraRef.current) return;
    const fit = computeFit();
    if (fit && Math.abs(fit.k / fg.zoom() - 1) > SETTLE_REFIT_MIN_CHANGE) fitGraph(400);
  }, [recomputeLifts, graphRef, computeFit, fitGraph]);

  /* -------------------------------------------------------------------------
   * 5. IMAGENS — pré-carrega fotos dos nós (ex.: Wikimedia Commons)
   * ----------------------------------------------------------------------- */
  // Libera as fotos PHOTO_LOAD_DELAY_MS depois de o grafo existir, caso a
  // simulação ainda não tenha assentado (handleEngineStop também libera).
  useEffect(() => {
    if (!graphReady || photosEnabled) return;
    const id = window.setTimeout(() => setPhotosEnabled(true), PHOTO_LOAD_DELAY_MS);
    return () => window.clearTimeout(id);
  }, [graphReady, photosEnabled]);

  useEffect(() => {
    if (!photosEnabled) return;
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
    // url → tipo do nó (o tipo decide o recorte: rosto para pessoas, inteiro para logos).
    const urls = new Map<string, string>();
    graphData.nodes.forEach((n) => {
      if (n.image_url && !urls.has(n.image_url)) urls.set(n.image_url, n.type);
    });
    urls.forEach((nodeType, url) => {
      if (imgCacheRef.current.has(url) || pendingRef.current.has(url) || failedRef.current.has(url)) return;
      pendingRef.current.add(url);
      // Pede a versão reduzida pelo Cloudflare (lib/photoUrl.ts); se ela falhar
      // (preview, transformações desligadas), tenta a foto original uma vez.
      const load = (src: string, fallback: string | null) => {
        const img = new Image();
        img.crossOrigin = 'anonymous'; // necessário para desenhar no canvas sem "contaminá-lo"
        img.decoding = 'async';
        img.onload = () => {
          // decode() decodifica FORA da thread principal; sem ele, o drawImage
          // de makePhotoSprite decodificaria cada AVIF/WebP ali, travando a página.
          // Se decode() falhar (navegador antigo), desenha assim mesmo.
          img.decode().catch(() => {}).then(() => {
            pendingRef.current.delete(url);
            const sprite = makePhotoSprite(img);
            if (!sprite) {
              failedRef.current.add(url);
              return;
            }
            imgCacheRef.current.set(url, sprite);
            requestRedraw();
          });
        };
        // Falhou (também a original): fica só o círculo de vidro, e a foto não é pedida de novo.
        img.onerror = () => {
          if (fallback) return load(fallback, null);
          pendingRef.current.delete(url);
          failedRef.current.add(url);
        };
        img.src = src;
      };
      const resized = resizedPhotoUrl(url, nodeType);
      load(resized ?? url, resized ? url : null);
    });
  }, [graphData.nodes, graphRef, photosEnabled]);

  useEffect(() => () => cancelAnimationFrame(redrawRafRef.current), []);

  /* -------------------------------------------------------------------------
   * 6. DESENHO DOS CÍRCULOS (sem texto — o texto vem no passo 8)
   * ----------------------------------------------------------------------- */
  /** Opacidade de um nó: foco + contexto e brilho por zoom (ver FADED_ALPHA / BRIGHT_ZOOM). */
  const nodeAlpha = useCallback((node: any, globalScale: number) => {
    if (!isNodeLit(node.id)) return FADED_ALPHA;
    if (!hasFocus && node.type !== 'scheme') {
      return zoomBrightness(globalScale, BRIGHT_ZOOM[node.type as keyof typeof BRIGHT_ZOOM] ?? 0.6);
    }
    return 1;
  }, [isNodeLit, hasFocus]);

  /**
   * Desenha um nó em (x, y). m = quanto 2.5D (0..1): o disco plano some
   * (opacidade 1 − m) enquanto a esfera aparece (opacidade m) no mesmo lugar
   * e com o mesmo tamanho e cor. A foto continua sempre de frente.
   */
  const drawNodeAt = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number, x: number, y: number, m: number) => {
    const isSelected = selectedNode?.id === node.id;
    const color = NODE_STYLE[node.type as NodeType]?.color ?? '#00f0ff';
    const size = getNodeRadius(node.type, node);
    const isFocusCentre = focusIds.has(node.id);
    const isScheme = node.type === 'scheme';
    const alpha = nodeAlpha(node, globalScale);
    const photo = !isScheme && node.image_url ? imgCacheRef.current.get(node.image_url) : undefined;

    ctx.save();
    ctx.globalAlpha = alpha;

    // Brilho externo. Sufixo hex = opacidade: '44' ≈ 27% (selecionado), '18' ≈ 9%.
    ctx.beginPath();
    ctx.arc(x, y, size + 8, 0, 2 * Math.PI);
    ctx.fillStyle = `${color}${isSelected || isFocusCentre ? '44' : '18'}`;
    ctx.fill();

    // Disco plano (2D). Esquemas: círculo SÓLIDO na cor do tipo.
    // Demais entidades: fundo PRETO sólido e, por cima,
    //   - com foto: a foto, um pouco recuada (anel preto em volta);
    //   - sem foto: o vidro fosco no tom do tipo (ver drawFrostedGlass).
    // Foto e vidro são sprites prontos (ver SPRITES no topo do arquivo).
    if (m < 1) {
      ctx.globalAlpha = alpha * (1 - m);
      ctx.beginPath();
      ctx.arc(x, y, size, 0, 2 * Math.PI);
      if (isScheme) {
        ctx.fillStyle = color;
        ctx.fill();
      } else if (photo) {
        ctx.fillStyle = '#000000';
        ctx.fill();
        const r = size * IMAGE_INSET;
        ctx.drawImage(photo, x - r, y - r, r * 2, r * 2);
      } else {
        const glass = getGlassSprite(size, color);
        if (glass) {
          ctx.drawImage(glass, x - size, y - size, size * 2, size * 2);
        } else {
          ctx.fillStyle = '#000000';
          ctx.fill();
          drawFrostedGlass(ctx, x, y, size, color);
        }
      }
    }

    // Esfera (2.5D): sprite sombreado; com foto, a foto vai DENTRO do vidro,
    // sempre de frente para quem olha, com um reflexo por cima.
    if (m > 0) {
      ctx.globalAlpha = alpha * m;
      const sphere = getSphereSprite(color, isScheme ? 'solid' : 'glass');
      if (sphere) ctx.drawImage(sphere, x - size, y - size, size * 2, size * 2);
      if (photo) {
        const r = size * SPHERE_PHOTO_INSET;
        ctx.drawImage(photo, x - r, y - r, r * 2, r * 2);
        const gloss = getGlossSprite();
        if (gloss) ctx.drawImage(gloss, x - size, y - size, size * 2, size * 2);
      }
    }

    // Borda colorida por cima. Dividir por globalScale mantém a espessura
    // constante na tela, independentemente do zoom.
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, 2 * Math.PI);
    ctx.strokeStyle = isSelected && isScheme ? '#ffffff' : color;
    ctx.lineWidth = (isSelected ? 3 : 1.8) / globalScale;
    ctx.stroke();

    ctx.restore();
  }, [selectedNode, focusIds, nodeAlpha]);

  // Chamado pela biblioteca para cada nó. No 2.5D não desenha nada aqui: as
  // esferas são pintadas depois, de trás para frente (ver renderFramePost).
  const drawNode = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    if (isoRef.current.m > 0) return;
    drawNodeAt(node, ctx, globalScale, node.x, node.y, 0);
  }, [drawNodeAt]);

  // Área de clique = raio desenhado + folga (antes era menor que o círculo).
  const paintPointerArea = useCallback((node: any, color: string, ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    const [x, y] = pos(node);
    ctx.arc(x, y, getNodeRadius(node.type, node) + CLICK_PADDING, 0, 2 * Math.PI);
    ctx.fill();
  }, [pos]);

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
    // Pontas na posição desenhada (projetada no 2.5D).
    const [sx, sy] = pos(start);
    const [ex, ey] = pos(end);

    const style = statusStyle(link.status);
    const color = style?.color ?? FALLBACK_COLOR;
    const baseWidth = isLinkSelected(link) ? LINK_WIDTH_SELECTED : LINK_WIDTH;
    const safeScale = globalScale > 0 ? globalScale : 1;

    // A linha vai só até a BORDA de cada círculo (não entra nem atravessa o
    // círculo): encurta cada ponta pelo raio do nó + metade da borda.
    const dx = ex - sx;
    const dy = ey - sy;
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
    ctx.moveTo(sx + ux * r0, sy + uy * r0);
    ctx.lineTo(ex - ux * r1, ey - uy * r1);

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
  }, [isLinkSelected, isLinkLit, hasFocus, pos]);

  // Área de clique da linha: a mesma da biblioteca (largura + folga), mas
  // entre as posições desenhadas — no 2.5D a linha não está mais em x/y.
  const paintLinkPointerArea = useCallback((link: any, color: string, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const start = link.source;
    const end = link.target;
    if (typeof start !== 'object' || typeof end !== 'object' || typeof start.x !== 'number' || typeof end.x !== 'number') return;
    const [sx, sy] = pos(start);
    const [ex, ey] = pos(end);
    const w = isLinkSelected(link) ? LINK_WIDTH_SELECTED : LINK_WIDTH;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.strokeStyle = color;
    ctx.lineWidth = (w + LINK_HOVER_PRECISION) / (globalScale || 1) + 2;
    ctx.stroke();
  }, [pos, isLinkSelected]);

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
  // Medidas dos rótulos: constantes HALO_PX / LABEL_* no topo do arquivo.
  // Linhas já quebradas + largura (px de tela) da maior: medir texto é caro e
  // o resultado não muda com o zoom, então é medido uma vez por rótulo.
  const labelLinesCache = useRef(new Map<string, { lines: string[]; widthPx: number }>());
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
    const toDraw: { node: any; lines: string[]; x: number; y: number; fontSize: number; px: number; weight: number }[] = [];

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

      const [nx, ny] = pos(node);
      const y = ny + getNodeRadius(node.type, node) + 6 / scale;
      const lineStep = fontSize * LABEL_LINE_HEIGHT;
      const extraLine = node.type === 'politician' && node.party && (scale >= 1 || isSelected || (hasFocus && litIds.has(node.id))) ? 1 : 0;
      const box = {
        x0: nx - widthPx / 2 / scale - pad,
        x1: nx + widthPx / 2 / scale + pad,
        y0: y - pad,
        y1: y + (lines.length + extraLine) * lineStep + pad,
      };
      const mustShow = isSelected || focusIds.has(node.id);
      if (!mustShow && placed.some((b) => box.x0 < b.x1 && box.x1 > b.x0 && box.y0 < b.y1 && box.y1 > b.y0)) continue;
      placed.push(box);
      toDraw.push({ node, lines, x: nx, y, fontSize, px, weight });
    }

    // Desenha do menos para o mais importante (o centro do foco fica por cima).
    for (const { node, lines, x, y, fontSize, px, weight } of toDraw.reverse()) {
      const style = NODE_STYLE[node.type as NodeType];
      const isSelected = selectedNode?.id === node.id;
      const lineStep = fontSize * LABEL_LINE_HEIGHT;
      ctx.font = `${weight} ${fontSize}px Inter, system-ui, sans-serif`;
      ctx.lineWidth = HALO_PX / scale;
      ctx.strokeStyle = BG_COLOR;
      ctx.fillStyle = isSelected || focusIds.has(node.id) ? '#ffffff' : style?.labelColor ?? '#cbd5e1';
      lines.forEach((line, i) => {
        ctx.strokeText(line, x, y + i * lineStep);
        ctx.fillText(line, x, y + i * lineStep);
      });

      // Linha extra com a sigla do partido (políticos, com zoom próximo).
      if (node.type === 'politician' && node.party && (scale >= 1 || isSelected || (hasFocus && litIds.has(node.id)))) {
        const subSize = (px - 1) / scale;
        ctx.font = `400 ${subSize}px Inter, system-ui, sans-serif`;
        const y2 = y + (lines.length - 1) * lineStep + fontSize + 2 / scale;
        ctx.strokeText(`(${node.party})`, x, y2);
        ctx.fillStyle = isSelected ? '#e0f2fe' : '#94a3b8';
        ctx.fillText(`(${node.party})`, x, y2);
      }
    }
    ctx.restore();
    positionDetailsButtonRef.current(scale);
  }, [labelOrder, selectedNode, wrapLabel, hasFocus, focusIds, litIds, pos]);

  /* -------------------------------------------------------------------------
   * 8a. QUADRO NO 2.5D
   *     Antes (renderFramePre): atualiza a projeção para o zoom atual e pinta
   *       o chão, as linhas de construção, as sombras e as hastes.
   *     Depois (renderFramePost): pinta as esferas de trás para frente (para
   *       a da frente cobrir a de trás) e, por cima de tudo, os rótulos.
   *     Ordem completa: chão → sombras → linhas (biblioteca) → esferas → rótulos.
   * ----------------------------------------------------------------------- */
  const groundMarksRef = useRef<{ x: number; y: number; z: number; r: number; color: string; alpha: number }[]>([]);
  const depthOrderRef = useRef<any[]>([]);

  /* VÓRTICE DO NÚCLEO (components/graphVortex.ts) — canvas próprio atrás do
   * grafo. renderFramePre guarda a câmera do quadro (vortexSnapRef) e já
   * redesenha o vórtice no MESMO quadro (zoom/arrasto sem atraso); entre um
   * quadro do grafo e outro, o laço do efeito mais abaixo o mantém girando. */
  const vortexCanvasRef = useRef<HTMLCanvasElement>(null);
  const vortexStateRef = useRef<VortexState | null>(null);
  const vortexSnapRef = useRef<{ transform: DOMMatrix; scale: number; cx: number; cy: number; w: number; h: number; alpha: number } | null>(null);
  const vortexDrawnAtRef = useRef(0);
  const reducedMotionRef = useRef(false);
  const paintVortex = useCallback(() => {
    const canvas = vortexCanvasRef.current;
    const snap = vortexSnapRef.current;
    if (!canvas || !snap) return;
    if (canvas.width !== snap.w || canvas.height !== snap.h) {
      canvas.width = snap.w;
      canvas.height = snap.h;
    }
    const vctx = canvas.getContext('2d');
    if (!vctx) return;
    const vs = vortexStateRef.current ?? (vortexStateRef.current = createVortex());
    const now = performance.now();
    vortexDrawnAtRef.current = now;
    // "Reduzir movimento": um quadro parado (o vórtice ainda acompanha o zoom).
    const time = reducedMotionRef.current ? 0 : now / 1000;
    drawVortex(vctx, vs, isoRef.current, snap.transform, snap.scale, snap.cx, snap.cy, time, snap.alpha);
  }, []);

  const renderFramePre = useCallback((ctx: CanvasRenderingContext2D, globalScale: number) => {
    const st = isoRef.current;
    const { width, height } = dimensionsRef.current;
    const m = morphForZoom(globalScale, Math.min(width, height)) * switchTRef.current;
    // Centro da tela no espaço projetado (o mesmo da biblioteca).
    const c = ctx.getTransform().inverse().transformPoint({ x: ctx.canvas.width / 2, y: ctx.canvas.height / 2 });
    applyMorph(m, c.x, c.y);
    // Vórtice: centro do núcleo (0, 0) com o afastamento dos grupos, como os partidos.
    // Opacidade = a do partido mais aceso (nodeAlpha: brilho por zoom e foco),
    // então o vórtice apaga e acende junto com os partidos.
    {
      const k = (SPREAD_25D - 1) * st.m;
      const sc = spreadCentreRef.current;
      let alpha = 0;
      let parties = 0;
      for (const n of graphData.nodes) {
        if (n.type !== 'party') continue;
        parties++;
        alpha = Math.max(alpha, nodeAlpha(n, globalScale));
      }
      // Sem partidos na tela (filtro): segue a regra de brilho dos partidos mesmo assim.
      if (!parties) alpha = hasFocus ? FADED_ALPHA : zoomBrightness(globalScale, BRIGHT_ZOOM.party);
      vortexSnapRef.current = { transform: ctx.getTransform(), scale: globalScale, cx: -k * sc.x, cy: -k * sc.y, w: ctx.canvas.width, h: ctx.canvas.height, alpha };
      paintVortex();
    }
    const on = st.m > 0;
    if (on !== active25dRef.current) {
      active25dRef.current = on;
      setActive25d(on);
    }
    if (!on) return;
    const spreadK = (SPREAD_25D - 1) * st.m;
    drawFloor(ctx, st, globalScale, { x: spreadCentreRef.current.x, y: spreadCentreRef.current.y, k: spreadK });
    // Reaproveita os mesmos objetos a cada quadro (sem lixo para o coletor).
    const marks = groundMarksRef.current;
    let count = 0;
    for (const n of graphData.nodes as any[]) {
      if (typeof n.x !== 'number') continue;
      const [x, y] = spreadXY(n);
      const it = marks[count] ?? (marks[count] = { x: 0, y: 0, z: 0, r: 0, color: '', alpha: 0 });
      it.x = x;
      it.y = y;
      it.z = nodeLift(n);
      it.r = getNodeRadius(n.type, n);
      it.color = NODE_STYLE[n.type as NodeType]?.color ?? FALLBACK_COLOR;
      it.alpha = nodeAlpha(n, globalScale) * (isNodeLit(n.id) ? 1 : 0.6);
      count++;
    }
    marks.length = count;
    drawGroundMarks(ctx, st, globalScale, marks);
  }, [graphData.nodes, nodeAlpha, isNodeLit, hasFocus, applyMorph, spreadXY, paintVortex]);

  // Laço do vórtice: continua girando com o grafo parado. Pula o quadro em que
  // o próprio grafo já o desenhou; pausa sozinho com a aba oculta (rAF).
  useEffect(() => {
    const mq = window.matchMedia(REDUCED_MOTION_QUERY);
    const onMq = () => {
      reducedMotionRef.current = mq.matches;
      paintVortex();
    };
    onMq();
    mq.addEventListener('change', onMq);
    let raf = 0;
    // Até 30 quadros/s (VORTEX_FRAME_MS): o giro é lento e não precisa de 60.
    // Enquanto a simulação anda, o grafo já redesenha o vórtice a cada quadro
    // (renderFramePre), e este laço só pula.
    const loop = () => {
      if (!reducedMotionRef.current && performance.now() - vortexDrawnAtRef.current >= VORTEX_FRAME_MS) paintVortex();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      mq.removeEventListener('change', onMq);
    };
  }, [paintVortex]);

  const renderFramePost = useCallback((ctx: CanvasRenderingContext2D, globalScale: number) => {
    const st = isoRef.current;
    if (st.m > 0) {
      // Profundidade guardada no próprio nó e lista reaproveitada entre quadros.
      const order = depthOrderRef.current;
      order.length = 0;
      for (const n of graphData.nodes as any[]) {
        if (typeof n.x !== 'number') continue;
        const [x, y] = spreadXY(n);
        n.__depth = depthOf(st, x, y, nodeLift(n));
        order.push(n);
      }
      order.sort((a, b) => a.__depth - b.__depth);
      for (const n of order) {
        const [x, y] = pos(n);
        drawNodeAt(n, ctx, globalScale, x, y, st.m);
      }
    }
    drawLabels(ctx, globalScale);
  }, [graphData.nodes, pos, drawNodeAt, drawLabels, spreadXY]);

  /* -------------------------------------------------------------------------
   * 8b. BOTÃO FLUTUANTE "Exibir detalhes" — aparece acima do item selecionado
   *     (nó, ou meio da linha). A posição é atualizada a cada quadro
   *     desenhado, direto no estilo do elemento (sem re-render do React), para
   *     acompanhar zoom, arrasto e o movimento da simulação.
   * ----------------------------------------------------------------------- */
  const detailsBtnRef = useRef<HTMLButtonElement>(null);
  const nodeById = useMemo(() => new Map(graphData.nodes.map((n: any) => [n.id, n])), [graphData.nodes]);

  selectionPointRef.current = (m?: number) => {
    if (selectedNode) {
      const n: any = nodeById.get(selectedNode.id);
      if (!n || typeof n.x !== 'number') return null;
      const [x, y] = spreadXY(n, m);
      return { x, y, z: nodeLift(n) };
    }
    if (selectedLink) {
      const { sourceId, targetId } = getLinkEnds(selectedLink);
      const a: any = nodeById.get(sourceId);
      const b: any = nodeById.get(targetId);
      if (!a || !b || typeof a.x !== 'number' || typeof b.x !== 'number') return null;
      const [ax, ay] = spreadXY(a, m);
      const [bx, by] = spreadXY(b, m);
      return { x: (ax + bx) / 2, y: (ay + by) / 2, z: (nodeLift(a) + nodeLift(b)) / 2 };
    }
    return null;
  };
  selectionAnchorRef.current = () => {
    if (selectedNode) {
      const n: any = nodeById.get(selectedNode.id);
      return n && typeof n.x === 'number' ? groupAnchor(n) : null;
    }
    if (selectedLink) {
      const { sourceId, targetId } = getLinkEnds(selectedLink);
      const a: any = nodeById.get(sourceId);
      const b: any = nodeById.get(targetId);
      if (!a || !b || typeof a.x !== 'number' || typeof b.x !== 'number') return null;
      const [ax, ay] = groupAnchor(a);
      const [bx, by] = groupAnchor(b);
      return [(ax + bx) / 2, (ay + by) / 2];
    }
    return null;
  };
  const showDetailsButton = !detailsOpen && (!!selectedNode || !!selectedLink);

  function positionDetailsButton(scale: number) {
    const btn = detailsBtnRef.current;
    const fg = graphRef.current;
    if (!btn) return;
    const hide = () => {
      btn.style.visibility = 'hidden';
      btn.style.opacity = '0';
    };
    // Escondido enquanto a câmera enquadra a seleção: seguir o nó durante a
    // animação fazia o botão fugir do cursor.
    if (!fg || !showDetailsButton || performance.now() < cameraBusyUntilRef.current) {
      hide();
      return;
    }
    let gx: number | undefined;
    let gy: number | undefined;
    let r = 0;
    if (selectedNode) {
      const n: any = nodeById.get(selectedNode.id);
      if (n && typeof n.x === 'number') [gx, gy] = pos(n);
      r = getNodeRadius(n?.type, n);
    } else if (selectedLink) {
      const s: any = typeof selectedLink.source === 'object' ? selectedLink.source : nodeById.get(selectedLink.source as string);
      const t: any = typeof selectedLink.target === 'object' ? selectedLink.target : nodeById.get(selectedLink.target as string);
      if (s && t && typeof s.x === 'number' && typeof t.x === 'number') {
        const [ax, ay] = pos(s);
        const [bx, by] = pos(t);
        gx = (ax + bx) / 2;
        gy = (ay + by) / 2;
      }
    }
    if (typeof gx !== 'number' || typeof gy !== 'number') {
      hide();
      return;
    }
    const p = fg.graph2ScreenCoords(gx, gy);
    const top = p.y - r * scale - 14; // logo acima do círculo
    const halfW = btn.offsetWidth / 2;
    const x = Math.min(Math.max(p.x, halfW + 8), dimensions.width - halfW - 8);
    const y = Math.min(Math.max(top, btn.offsetHeight + 8), dimensions.height - 8);
    // Propriedade `translate`, não `transform`: o `active:scale-95` do clique
    // (propriedade `scale`) multiplicava também o deslocamento do transform,
    // e o botão pulava ~20 px para cima/esquerda no exato momento do clique.
    btn.style.translate = `${x - halfW}px ${y - btn.offsetHeight}px`;
    btn.style.visibility = 'visible';
    btn.style.opacity = '1';
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
  // Só nas linhas em FOCO (nó/linha selecionado ou sob o mouse): enquanto houver
  // uma partícula na tela, a biblioteca redesenha o grafo inteiro a cada quadro.
  // Sem foco, sem partículas — a teia assentada fica parada e não gasta CPU.
  // No 2.5D, sem partículas: a biblioteca as desenha em x/y (no plano), não na linha projetada.
  const linkParticles = useCallback(
    (link: any) => (!active25d && hasFocus && isLinkLit(link) ? statusStyle(link.status)?.particles ?? 0 : 0),
    [isLinkLit, active25d, hasFocus]
  );
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
   * 8d. MENU "TERMOS & PRIVACIDADE" — abre/fecha com clique no botão. Aberto,
   *     um clique/toque em qualquer lugar fora do botão e da lista o fecha
   *     (o clique segue normalmente para o que estiver embaixo, ex.: o grafo),
   *     assim como Esc (devolvendo o foco ao botão).
   * ----------------------------------------------------------------------- */
  const [legalOpen, setLegalOpen] = useState(false);
  const legalMenuRef = useRef<HTMLDivElement>(null);
  const legalButtonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!legalOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!legalMenuRef.current?.contains(e.target as Node)) setLegalOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setLegalOpen(false);
      legalButtonRef.current?.focus();
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [legalOpen]);

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
      className="relative isolate w-full h-full flex-1 bg-surface-canvas overflow-hidden"
      // Qualquer interação manual (roda, pinça, arrasto, botões) marca que o
      // usuário mexeu na câmera e cancela o enquadramento animado da seleção.
      // Na fase de CAPTURA: o d3-zoom do canvas chama stopImmediatePropagation()
      // na roda do mouse, então um onWheel comum nunca recebia o evento.
      onWheelCapture={userTookCamera}
      onPointerDownCapture={userTookCamera}
      // Cursor saiu do grafo: some o destaque de hover.
      onMouseLeave={clearHover}
    >
      {/* Vórtice do núcleo: atrás do grafo (z negativo dentro do contêiner "isolate"), sem receber cliques. */}
      <canvas ref={vortexCanvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 h-full w-full" />
      <ForceGraph2D
        // A tipagem da biblioteca só aceita objeto de ref, mas ref-callback funciona.
        ref={setGraphInstance as any}
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData as any}
        // Desenho customizado (passos 6–8)
        nodeCanvasObject={drawNode}
        nodePointerAreaPaint={paintPointerArea}
        linkPointerAreaPaint={paintLinkPointerArea}
        linkCanvasObjectMode={LINK_CANVAS_MODE}
        linkCanvasObject={drawLink}
        onRenderFramePre={renderFramePre}
        onRenderFramePost={renderFramePost}
        // No 2.5D o arrasto de nós fica desligado: o ponteiro está no espaço
        // projetado e o nó "pularia" para outra posição no plano.
        enableNodeDrag={!active25d}
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
        d3AlphaDecay={ALPHA_DECAY}
        d3AlphaMin={ALPHA_MIN}
        d3VelocityDecay={0.35} // "atrito": ↑ nós param mais cedo, menos tremedeira
        // Transparente: o fundo vem do contêiner (bg-surface-canvas = BG_COLOR),
        // para o vórtice aparecer por trás.
        backgroundColor="rgba(0, 0, 0, 0)"
      />

      {/* Botão "Exibir detalhes" (posição definida em positionDetailsButton) */}
      <button
        ref={detailsBtnRef}
        type="button"
        onClick={onOpenDetails}
        style={{ visibility: 'hidden', opacity: 0 }}
        className="absolute left-0 top-0 z-30 inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-2 rounded-lg text-xs font-semibold text-cyan-200 bg-surface-field/95 backdrop-blur-md border border-cyan-500/60 shadow-[0_0_16px_rgba(34,211,238,0.35)] hover:bg-cyan-950 active:scale-95 transition-[color,background-color,border-color,opacity] duration-150"
      >
        <PanelRightOpen size={16} className="w-4 h-4 shrink-0" aria-hidden="true" />
        {t.graph.showDetails}
      </button>

      {/* LEGENDAS — geradas de lib/graphConfig.ts. Celular (< 640px): escondidas.
          640–1279px: recolhidas atrás do botão "Legenda" (abertas, cobriam
          boa parte da teia). A partir de 1280px: sempre abertas. */}
      <div data-graph-overlay className="absolute top-4 right-6 hidden sm:flex flex-col items-end gap-3 z-20 select-none">
        <button
          type="button"
          onClick={() => setLegendOpen((v) => !v)}
          aria-expanded={legendOpen}
          aria-controls="graph-legend"
          className="xl:hidden inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-field/95 backdrop-blur-md border border-slate-800 text-xs font-mono text-slate-300 hover:text-cyan-400 hover:border-slate-700/80 shadow-xl transition-colors"
        >
          <Info size={14} className="w-3.5 h-3.5" aria-hidden="true" />
          {t.graph.legend}
          <ChevronUp size={14} className={`w-3.5 h-3.5 text-slate-400 transition-transform ${legendOpen ? '' : 'rotate-180'}`} aria-hidden="true" />
        </button>
        <div id="graph-legend" className={`${legendOpen ? 'flex' : 'hidden'} xl:flex flex-col gap-3`}>
        <div className="bg-surface-field/90 backdrop-blur-md border border-slate-800 rounded-lg p-3 text-[11px] space-y-2 font-mono shadow-2xl">
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

        <div className="bg-surface-field/90 backdrop-blur-md border border-slate-800 rounded-lg p-3 text-[11px] space-y-2 font-mono shadow-2xl">
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
      </div>

      {/* CANTO INFERIOR ESQUERDO — interruptor 2.5D em cima, controles de câmera
          embaixo, os dois na mesma margem esquerda. */}
      <div data-graph-overlay className="absolute bottom-6 left-4 md:left-6 z-20 flex flex-col items-start gap-2 select-none">
      {/* INTERRUPTOR 2.5D — liga/desliga a transição para 2.5D ao aproximar
          (ver MODO 2.5D no topo do arquivo). Não fica salvo entre visitas. */}
      <button
        type="button"
        role="switch"
        aria-checked={enabled25d}
        aria-label={t.graph.toggle25dAria}
        title={t.graph.toggle25dAria}
        onClick={toggle25d}
        className="flex items-center gap-2 bg-surface-field/95 backdrop-blur-md border border-slate-800 rounded-lg pl-2 pr-3 py-2.5 md:py-2 shadow-xl text-xs font-mono font-semibold hover:border-slate-700/80 transition-colors"
      >
        <span
          aria-hidden="true"
          className={`relative inline-block w-8 h-[18px] rounded-full transition-colors duration-300 ${enabled25d ? 'bg-cyan-500/85' : 'bg-slate-700'}`}
        >
          <span
            className={`absolute top-[2px] left-[2px] w-[14px] h-[14px] rounded-full bg-slate-50 shadow-sm transition-transform duration-300 ${enabled25d ? 'translate-x-[14px]' : ''}`}
          />
        </span>
        <span className={enabled25d ? 'text-cyan-200' : 'text-slate-400'}>2.5D</span>
      </button>

      {/* CONTROLES DE CÂMERA — o fator 1.2 é o "passo" de cada clique de zoom.
          Alinhados na base com o MENU LEGAL (mesmo bottom-6 e mesma altura). */}
      <div className="flex items-center space-x-1.5 bg-surface-field/95 backdrop-blur-md border border-slate-800 rounded-lg p-1.5 shadow-xl">
        <button
          onClick={() => graphRef.current?.zoom(graphRef.current.zoom() * 1.2, 400)}
          className="p-2 md:p-1.5 hover:bg-slate-800 active:bg-slate-700 text-slate-300 rounded-sm transition-colors"
          aria-label={t.graph.zoomIn}
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={() => graphRef.current?.zoom(graphRef.current.zoom() / 1.2, 400)}
          className="p-2 md:p-1.5 hover:bg-slate-800 active:bg-slate-700 text-slate-300 rounded-sm transition-colors"
          aria-label={t.graph.zoomOut}
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={() => fitGraph(400)}
          className="px-2.5 py-1.5 md:py-1 hover:bg-slate-800 active:bg-slate-700 text-slate-300 text-xs font-mono rounded-sm transition-colors"
        >
          {t.graph.recenter}
        </button>
        <button
          onClick={toggleFullscreen}
          className="p-2 md:p-1.5 hover:bg-slate-800 active:bg-slate-700 text-slate-300 rounded-sm transition-colors"
          aria-label={t.graph.fullscreen}
        >
          <Maximize className="w-4 h-4" />
        </button>
      </div>
      </div>

      {/* CANTO INFERIOR DIREITO — duas peças empilhadas, alinhadas à direita:

          1. SELETOR DE IDIOMA (só no celular, < 640px; em telas maiores ele fica
             no cabeçalho). Fica logo acima do botão "Termos & Privacidade".
          2. MENU LEGAL — abre e fecha com clique/toque no botão (igual no
             desktop e no celular); também fecha com clique/toque fora do botão
             e da lista, com Esc ou ao escolher um link (ver legalOpen).
             A lista de links abre ENTRE o botão e o seletor de
             idioma e ocupa espaço de verdade (a altura anima de 0 até o tamanho
             dela, via grid-rows 0fr → 1fr), então o seletor sobe junto e
             continua visível com o menu aberto — sem altura fixa no código.

          Posição (bottom-6) e altura do botão iguais às dos controles de câmera,
          para os dois ficarem alinhados na base: o py-3.5/md:py-3 do botão
          reproduz a altura da caixa de câmera (46px no celular, 42px no desktop).
          Se mudar o padding de um, mude o do outro. */}
      <div data-graph-overlay className="absolute bottom-6 right-4 md:right-6 z-20 flex flex-col items-end gap-2">
        <LanguageSwitcher path="/" variant="floating" className="sm:hidden" />

        <div ref={legalMenuRef} className="flex flex-col items-end">
          {/* Fechada: altura 0, transparente e `invisible` (fora do Tab e do clique). */}
          <div
            id="legal-menu"
            className={`grid transition-all duration-200 ${legalOpen ? 'grid-rows-[1fr] opacity-100 visible' : 'grid-rows-[0fr] opacity-0 invisible'}`}
          >
            <div className="overflow-hidden min-h-0">
              <div onClick={() => setLegalOpen(false)} className="mb-2 w-52 bg-surface-field/95 backdrop-blur-md border border-slate-800 rounded-lg p-2 shadow-2xl flex flex-col space-y-1 text-xs">
                <div className="px-2 py-1 text-[10px] font-mono text-muted uppercase tracking-wider border-b border-slate-800/80 mb-1">
                  {t.graph.legalInfo}
                </div>
                {/* Desce até o texto da página inicial, abaixo do grafo (views/home.tsx). */}
                <a href={`#${HOME_TEXT_ID}`} className="flex items-center space-x-2 px-2 py-1.5 rounded-sm hover:bg-slate-800 text-slate-300 hover:text-cyan-400 transition-colors">
                  <BookOpenText className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
                  <span>{t.home.scrollCue}</span>
                </a>
                {/* Só no celular: em telas ≥ 768px o cabeçalho já tem o botão "Dossiês". */}
                <Link href={href('/esquemas')} className="md:hidden flex items-center space-x-2 px-2 py-1.5 rounded-sm hover:bg-slate-800 text-slate-300 hover:text-cyan-400 transition-colors">
                  <FileText className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
                  <span>{t.graph.menuDossiers}</span>
                </Link>
                <Link href={href('/correcoes')} className="flex items-center space-x-2 px-2 py-1.5 rounded-sm hover:bg-slate-800 text-slate-300 hover:text-cyan-400 transition-colors">
                  <RotateCcwClock className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
                  <span>{t.common.correctionsAndUpdates}</span>
                </Link>
                <Link href={href('/about')} className="flex items-center space-x-2 px-2 py-1.5 rounded-sm hover:bg-slate-800 text-slate-300 hover:text-cyan-400 transition-colors">
                  <Info className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
                  <span>{t.graph.menuAbout}</span>
                </Link>
                <Link href={href('/privacy')} className="flex items-center space-x-2 px-2 py-1.5 rounded-sm hover:bg-slate-800 text-slate-300 hover:text-cyan-400 transition-colors">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
                  <span>{t.common.privacyPolicy}</span>
                </Link>
                {/* Só onde o GDPR vale e a ferramenta de consentimento do Google carregou (components/ConsentSettings.tsx). */}
                <ConsentGate>
                  <ConsentSettingsButton className="w-full text-left flex items-center space-x-2 px-2 py-1.5 rounded-sm hover:bg-slate-800 text-slate-300 hover:text-cyan-400 transition-colors">
                    <Cookie className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
                    <span>{t.common.consentSettings}</span>
                  </ConsentSettingsButton>
                </ConsentGate>
                <Link href={href('/terms')} className="flex items-center space-x-2 px-2 py-1.5 rounded-sm hover:bg-slate-800 text-slate-300 hover:text-cyan-400 transition-colors">
                  <Scale className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
                  <span>{t.common.termsOfUse}</span>
                </Link>
              </div>
            </div>
          </div>

          <button
            ref={legalButtonRef}
            type="button"
            onClick={() => setLegalOpen((o) => !o)}
            className={`flex items-center space-x-2 bg-surface-field/95 backdrop-blur-md border rounded-lg px-3 py-3.5 md:py-3 text-xs leading-4 hover:text-cyan-400 hover:border-slate-700/80 shadow-xl transition-all cursor-pointer select-none ${legalOpen ? 'text-cyan-400 border-slate-700/80' : 'text-slate-300 border-slate-800'}`}
            aria-label={t.graph.legalMenuAria}
            aria-haspopup="true"
            aria-expanded={legalOpen}
            aria-controls="legal-menu"
          >
            <FileText className="w-4 h-4 text-cyan-400" />
            <span className="font-mono text-xs hidden sm:inline">{t.graph.termsAndPrivacy}</span>
            <ChevronUp className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${legalOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
