/**
 * ENQUADRAMENTO DA TEIA INTEIRA — maior zoom em que todos os círculos e os
 * nomes visíveis cabem no canvas SEM ficar por baixo dos painéis que flutuam
 * sobre ele (legendas, controles de câmera, "Como ler o mapa", menu "Termos &
 * Privacidade"). Usado por components/NetworkGraph.tsx (seção 4, CÂMERA).
 *
 * Como funciona:
 *  1. Enquadra no canvas inteiro (menos a margem).
 *  2. Se algum painel cobre um círculo ou um nome, tira da área uma faixa do
 *     lado desse painel — o lado (esquerda/direita/cima/baixo) que permite o
 *     MAIOR zoom — e enquadra de novo. Repete até nada ficar coberto.
 *  Painéis sobre um canto vazio não custam nada: a teia é mais ou menos
 *  redonda e as legendas ficam nos cantos. Um corte que deixaria a área menor
 *  que MIN_SHARE da largura/altura não é feito (melhor um painel cobrir um
 *  pedaço da teia do que encolhê-la demais); o mesmo vale para um corte que
 *  tiraria mais que MAX_SHRINK_PER_PANEL do zoom.
 *
 * Os nomes têm tamanho fixo em PIXELS DE TELA (não mudam com o zoom), por
 * isso o zoom não é uma simples proporção: é achado por busca binária.
 */

export type Rect = { left: number; top: number; right: number; bottom: number };

/**
 * Um nó para o enquadramento: posição e raio em unidades do grafo, mais o que
 * o nome ocupa em px de tela: meia largura (para os lados, centrado no nó) e
 * altura (para baixo do círculo). Zero = sem nome visível.
 */
export type FitItem = { x: number; y: number; r: number; labelHalfW: number; labelBelow: number };

/** Resultado no formato do force-graph: `centerAt(cx, cy)` + `zoom(k)`. */
export type Fit = { k: number; cx: number; cy: number };

/** Fração mínima da largura/altura do canvas que a área de enquadramento mantém. */
const MIN_SHARE = 0.45;
/** Folga (px) entre um painel e a teia. */
const PANEL_GAP = 8;
/**
 * Quanto do zoom (fração) a teia pode perder para não ficar por baixo de um
 * painel. Acima disso o painel fica por cima de uma borda da teia: em telas
 * médias (ex.: 1024 px) a legenda ocupa mais de 1/3 da largura do canvas, e
 * desviar dela deixaria a teia minúscula.
 */
const MAX_SHRINK_PER_PANEL = 0.3;

const intersects = (a: Rect, b: Rect) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
const rectArea = (r: Rect) => (r.right - r.left) * (r.bottom - r.top);

/**
 * Maior k (busca binária) em que a extensão na tela — max(alto·k + extraAlto)
 * − min(baixo·k − extraBaixo) — cabe em `room`. A extensão é convexa em k,
 * então os k que cabem formam um intervalo começando perto de 0.
 */
function maxScale(lo: number[], hi: number[], extraLo: number[], extraHi: number[], room: number): number {
  const span = (k: number) => {
    let a = Infinity;
    let b = -Infinity;
    for (let i = 0; i < lo.length; i++) {
      a = Math.min(a, lo[i] * k - extraLo[i]);
      b = Math.max(b, hi[i] * k + extraHi[i]);
    }
    return b - a;
  };
  if (span(1e-9) > room) return 0;
  let ok = 1e-9;
  let bad = 1;
  while (span(bad) <= room && bad < 1e6) {
    ok = bad;
    bad *= 2;
  }
  for (let i = 0; i < 40; i++) {
    const mid = (ok + bad) / 2;
    if (span(mid) <= room) ok = mid;
    else bad = mid;
  }
  return ok;
}

type Placed = Fit & { boxes: Rect[] };

/** Enquadra os itens em `area` (px do canvas); devolve também a caixa de cada item na tela. */
function fitInto(items: FitItem[], width: number, height: number, area: Rect): Placed | null {
  const w = area.right - area.left;
  const h = area.bottom - area.top;
  if (items.length === 0 || w <= 0 || h <= 0) return null;
  const k = Math.min(
    maxScale(items.map((n) => n.x - n.r), items.map((n) => n.x + n.r), items.map((n) => n.labelHalfW), items.map((n) => n.labelHalfW), w),
    maxScale(items.map((n) => n.y - n.r), items.map((n) => n.y + n.r), items.map(() => 0), items.map((n) => n.labelBelow), h),
  );
  if (!(k > 0)) return null;

  // Caixa de cada item relativa à origem do grafo; depois, o deslocamento que
  // centra o conjunto na área.
  const rel = items.map((n) => ({
    left: Math.min((n.x - n.r) * k, n.x * k - n.labelHalfW),
    right: Math.max((n.x + n.r) * k, n.x * k + n.labelHalfW),
    top: (n.y - n.r) * k,
    bottom: (n.y + n.r) * k + n.labelBelow,
  }));
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const b of rel) {
    minX = Math.min(minX, b.left);
    maxX = Math.max(maxX, b.right);
    minY = Math.min(minY, b.top);
    maxY = Math.max(maxY, b.bottom);
  }
  const offX = (area.left + area.right) / 2 - (minX + maxX) / 2;
  const offY = (area.top + area.bottom) / 2 - (minY + maxY) / 2;
  const boxes = rel.map((b) => ({ left: b.left + offX, right: b.right + offX, top: b.top + offY, bottom: b.bottom + offY }));
  // Tela = grafo·k + deslocamento = (grafo − c)·k + tamanho/2  ⇒  c = (tamanho/2 − deslocamento) / k
  return { k, cx: (width / 2 - offX) / k, cy: (height / 2 - offY) / k, boxes };
}

/**
 * @param items     nós (ver FitItem)
 * @param width     largura do canvas (px)
 * @param height    altura do canvas (px)
 * @param overlays  painéis sobre o canvas, em px relativos a ele
 * @param padding   margem (px) entre a teia e a borda da área
 */
export function fitToView(items: FitItem[], width: number, height: number, overlays: Rect[], padding: number): Fit | null {
  let area: Rect = { left: padding, top: padding, right: width - padding, bottom: height - padding };
  const panels = overlays.map((o) => ({
    left: o.left - PANEL_GAP,
    top: o.top - PANEL_GAP,
    right: o.right + PANEL_GAP,
    bottom: o.bottom + PANEL_GAP,
  }));
  const bigEnough = (a: Rect) => a.right - a.left >= width * MIN_SHARE && a.bottom - a.top >= height * MIN_SHARE;

  let fit = fitInto(items, width, height, area);
  // Cada volta resolve (ou desiste de) um painel, então termina.
  while (fit && panels.length > 0) {
    const boxes = fit.boxes;
    const covering = panels.filter((p) => boxes.some((b) => intersects(b, p)));
    if (covering.length === 0) break;
    const p = covering.reduce((a, b) => (rectArea(b) > rectArea(a) ? b : a)); // maior primeiro
    panels.splice(panels.indexOf(p), 1);

    let best: { area: Rect; fit: Placed } | null = null;
    for (const a of [
      { ...area, left: Math.max(area.left, p.right) },
      { ...area, right: Math.min(area.right, p.left) },
      { ...area, top: Math.max(area.top, p.bottom) },
      { ...area, bottom: Math.min(area.bottom, p.top) },
    ]) {
      if (!bigEnough(a)) continue;
      const f = fitInto(items, width, height, a);
      if (f && (!best || f.k > best.fit.k)) best = { area: a, fit: f };
    }
    // Sem corte possível (ou caro demais), o painel fica por cima de um pedaço da teia.
    if (best && best.fit.k >= fit.k * (1 - MAX_SHRINK_PER_PANEL)) {
      area = best.area;
      fit = best.fit;
    }
  }
  return fit ? { k: fit.k, cx: fit.cx, cy: fit.cy } : null;
}
