/**
 * ============================================================================
 * DESENHO DO EIXO DA LINHA DO TEMPO (canvas)
 * ============================================================================
 * Eixo dos anos, faixa do período de cada esquema e as cópias "fantasma" das
 * entidades que aparecem em mais de um esquema aberto. Pintado no
 * renderFramePre do NetworkGraph (atrás das linhas e dos nós), em unidades do
 * grafo; tamanhos de traço e de letra em px de tela dividem por `scale`.
 * As posições vêm de lib/timelineLayout.ts (computeTimelineLayout).
 * ============================================================================
 */
import type { TimelineLayout } from '@/lib/timelineLayout';
import { getNodeRadius, NODE_STYLE } from '@/lib/graphConfig';
import type { NodeType } from '@/types/graph';

const AXIS = '#ffffff';
const BAR_ON = '#ff00c8';
const BAR_LABEL = '#ff9cec';
const STEM_ON = 'rgba(255, 92, 224, 0.9)';
const LABEL_BG = '#080d16';

/** Passo (anos) entre rótulos, conforme quantos px cada ano ocupa na tela. */
function yearStep(pxPerYear: number): number {
  if (pxPerYear >= 38) return 1;
  if (pxPerYear >= 17) return 2;
  if (pxPerYear >= 8) return 5;
  return 10;
}

/**
 * `highlight` = esquemas em foco (passar o mouse / selecionar). Sem foco, todas
 * as faixas ficam apagadas; as em foco acendem, ficam mais grossas e mostram o
 * ano de início e o de fim.
 */
export function drawTimelineAxis(
  ctx: CanvasRenderingContext2D,
  L: TimelineLayout,
  scale: number,
  alpha: number,
  yearPx: number,
  schemeY: (id: string) => number | null,
  highlight: ReadonlySet<string>
) {
  if (alpha <= 0.01) return;
  const px = 1 / (scale || 1);
  const { x0, x1, y, minYear, maxYear } = L.axis;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.lineCap = 'round';

  // Só as faixas em foco são desenhadas; sem foco, fica apenas o eixo.
  const stem = (b: TimelineLayout['bars'][number], color: string, width: number) => {
    const sy = schemeY(b.id);
    if (sy == null) return;
    ctx.beginPath();
    ctx.moveTo((b.x0 + b.x1) / 2, y);
    ctx.lineTo((b.x0 + b.x1) / 2, sy);
    ctx.strokeStyle = color;
    ctx.lineWidth = width * px;
    ctx.stroke();
  };
  // Barra e linha do eixo partilham o mesmo centro, alinhado à grade de pixels do
  // aparelho, e têm espessura em pixels PARES: assim as bordas caem em pixels
  // inteiros e a linha fica exatamente no meio da barra (sem meio-pixel de desvio).
  const T = ctx.getTransform();
  const dev = Math.abs(T.d) * px; // pixels do aparelho por pixel CSS
  const yc = dev > 0 ? (Math.round(T.d * y + T.f) - T.f) / T.d : y;
  const evenPx = (css: number) => (dev > 0 ? (2 * Math.max(1, Math.round((css * dev) / 2))) / Math.abs(T.d) : css * px);
  const bar = (b: TimelineLayout['bars'][number], h: number) => {
    const hw = evenPx(h);
    ctx.beginPath();
    ctx.roundRect(b.x0, yc - hw / 2, Math.max(b.x1 - b.x0, 8 * px), hw, hw / 2);
    ctx.fill();
  };
  const on = L.bars.filter((b) => highlight.has(b.id));
  ctx.fillStyle = BAR_ON;
  for (const b of on) {
    // Brilho padrão do site (0 0 10px na cor da faixa) no lugar do contorno branco.
    // shadowBlur é em pixels do canvas e ignora a transformação → usa o DPR.
    ctx.shadowColor = BAR_ON;
    ctx.shadowBlur = 10 * (typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1);
    bar(b, 10);
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    stem(b, STEM_ON, 1.5);
  }

  // Eixo e extremidades.
  ctx.strokeStyle = AXIS;
  ctx.lineWidth = evenPx(1.5);
  ctx.beginPath();
  ctx.moveTo(x0, yc);
  ctx.lineTo(x1, yc);
  ctx.stroke();
  ctx.lineWidth = 2 * px;
  for (const x of [x0, x1]) {
    ctx.beginPath();
    ctx.moveTo(x, y - 12 * px);
    ctx.lineTo(x, y + 12 * px);
    ctx.stroke();
  }

  // Marcas e anos.
  const step = yearStep(yearPx * scale);
  ctx.font = `500 ${11 * px}px ui-monospace, SFMono-Regular, Menlo, monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.lineJoin = 'round';
  ctx.lineWidth = 3 * px;
  for (let yr = minYear; yr <= maxYear; yr++) {
    const x = x0 + (yr - minYear) * yearPx;
    const big = yr % step === 0;
    ctx.strokeStyle = AXIS;
    ctx.globalAlpha = alpha * (big ? 1 : 0.55);
    ctx.lineWidth = px;
    ctx.beginPath();
    ctx.moveTo(x, y - (big ? 6 : 3) * px);
    ctx.lineTo(x, y + (big ? 6 : 3) * px);
    ctx.stroke();
    if (big) {
      ctx.globalAlpha = alpha;
      ctx.lineWidth = 3 * px;
      ctx.strokeStyle = LABEL_BG;
      ctx.strokeText(String(yr), x, y + 11 * px);
      ctx.fillStyle = AXIS;
      ctx.fillText(String(yr), x, y + 11 * px);
    }
  }

  // Início e fim dos esquemas em foco, acima do eixo.
  if (on.length) {
    ctx.font = `700 ${12 * px}px ui-monospace, SFMono-Regular, Menlo, monospace`;
    ctx.textBaseline = 'bottom';
    ctx.globalAlpha = alpha;
    ctx.lineWidth = 3.5 * px;
    for (const b of on) {
      const same = b.startYear === b.endYear;
      const ends: [number, number, string][] = same
        ? [[(b.x0 + b.x1) / 2, 0, String(b.startYear)]]
        : [[b.x0, -1, String(b.startYear)], [b.x1, 1, String(b.endYear)]];
      for (const [x, side, text] of ends) {
        ctx.textAlign = side < 0 ? 'right' : side > 0 ? 'left' : 'center';
        const tx = x + side * 4 * px;
        ctx.strokeStyle = LABEL_BG;
        ctx.strokeText(text, tx, y - 9 * px);
        ctx.fillStyle = BAR_LABEL;
        ctx.fillText(text, tx, y - 9 * px);
      }
    }
  }
  ctx.restore();
}

/** Cópias de uma entidade em outros esquemas abertos, ligadas ao nó real por uma linha pontilhada. */
export function drawTimelineTwins(ctx: CanvasRenderingContext2D, L: TimelineLayout, scale: number, alpha: number) {
  if (alpha <= 0.01 || !L.twins.length) return;
  const px = 1 / (scale || 1);
  ctx.save();
  ctx.setLineDash([4 * px, 4 * px]);
  ctx.lineWidth = 1.4 * px;
  for (const t of L.twins) {
    const color = NODE_STYLE[t.type as NodeType]?.color ?? '#94a3b8';
    ctx.globalAlpha = alpha * 0.5;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(t.hostX, t.hostY);
    ctx.quadraticCurveTo((t.hostX + t.x) / 2, L.axis.y, t.x, t.y);
    ctx.stroke();
    ctx.globalAlpha = alpha * 0.7;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(t.x, t.y, getNodeRadius(t.type), 0, 2 * Math.PI);
    ctx.stroke();
    ctx.setLineDash([4 * px, 4 * px]);
  }
  ctx.restore();
}
