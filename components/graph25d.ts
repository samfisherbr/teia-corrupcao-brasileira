/**
 * ============================================================================
 * MODO 2.5D — desenho (chão quadriculado, linhas de construção, sombras e
 * esferas). A matemática da projeção fica em lib/iso.ts.
 * ============================================================================
 * Desempenho: tudo o que tem gradiente é pintado UMA vez num canvas auxiliar
 * (sprite) e depois só carimbado com drawImage — igual ao vidro fosco e às
 * fotos do modo 2D. Por quadro, o 2.5D acrescenta: ~30 linhas do chão,
 * 1 sombra + 1 haste por entidade e a ordenação por profundidade (~300 nós).
 * ============================================================================
 */
import { IsoState, project, unprojectGround, groundSquashFor } from '@/lib/iso';
import { CORE_RADIUS, LANE_NEAR, LANE_FAR } from '@/lib/layout';

/** Lado (px) dos sprites de esfera. ↑ = mais nitidez com zoom alto, mais memória. */
const SPHERE_SPRITE_PX = 256;
/** Foto dentro da esfera: raio relativo à esfera (o resto é o vidro em volta). */
export const SPHERE_PHOTO_INSET = 0.72;

/** Chão: espaço entre linhas (unidades do grafo) e cada quantas linhas vem uma "principal". */
const GRID_STEP = 200;
const GRID_MAJOR_EVERY = 4;
/** No máximo tantas linhas por direção (com a câmera afastada o passo dobra). */
const GRID_MAX_LINES = 48;
const GRID_MINOR = 'rgba(148, 163, 184, 0.10)';
const GRID_MAJOR = 'rgba(255, 0, 200, 0.20)';
/** Linhas de construção (diagonais e órbitas do núcleo), no rosa do desenho de referência. */
const CONSTRUCTION = 'rgba(255, 92, 224, 0.16)';
const CONSTRUCTION_FAINT = 'rgba(255, 255, 255, 0.06)';

/* ------------------------------------------------------------------------- */

const hexToRgb = (hex: string): [number, number, number] => {
  const n = parseInt(hex.slice(1, 7), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const mix = (hex: string, to: [number, number, number], t: number) => {
  const [r, g, b] = hexToRgb(hex);
  return `rgb(${Math.round(r + (to[0] - r) * t)}, ${Math.round(g + (to[1] - g) * t)}, ${Math.round(b + (to[2] - b) * t)})`;
};

const sphereSprites = new Map<string, HTMLCanvasElement>();

/**
 * Esfera iluminada do alto à esquerda (luz igual à do reflexo do vidro 2D).
 *   solid — esquemas: corpo sólido na cor do tipo;
 *   glass — demais: casca de vidro escura tingida na cor do tipo.
 * Meridianos e paralelos bem fracos lembram o desenho de referência.
 */
export function getSphereSprite(color: string, kind: 'solid' | 'glass'): HTMLCanvasElement | null {
  const key = `${color}|${kind}`;
  const cached = sphereSprites.get(key);
  if (cached) return cached;
  if (sphereSprites.size >= 32) return null;
  const S = SPHERE_SPRITE_PX;
  const R = S / 2;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = S;
  const g = canvas.getContext('2d');
  if (!g) return null;
  g.beginPath();
  g.arc(R, R, R, 0, 2 * Math.PI);
  g.clip();

  if (kind === 'solid') {
    const body = g.createRadialGradient(R * 0.65, R * 0.55, R * 0.05, R, R, R);
    body.addColorStop(0, mix(color, [255, 255, 255], 0.75));
    body.addColorStop(0.3, color);
    body.addColorStop(1, mix(color, [0, 0, 0], 0.78));
    g.fillStyle = body;
  } else {
    g.fillStyle = '#05080f';
    g.fillRect(0, 0, S, S);
    const tint = g.createRadialGradient(R * 0.7, R * 0.6, R * 0.1, R, R, R);
    tint.addColorStop(0, `${color}70`);
    tint.addColorStop(0.7, `${color}22`);
    tint.addColorStop(1, `${color}55`);
    g.fillStyle = tint;
  }
  g.fillRect(0, 0, S, S);

  g.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  g.lineWidth = 1.6;
  for (let i = 1; i < 6; i++) {
    g.beginPath();
    g.ellipse(R, R, Math.abs(R * Math.sin((i / 6) * Math.PI)), R, 0, 0, 2 * Math.PI);
    g.stroke();
    const y = R - R * Math.cos((i / 6) * Math.PI);
    g.beginPath();
    g.ellipse(R, y, Math.sqrt(Math.max(0, R * R - (y - R) ** 2)), R * 0.12, 0, 0, 2 * Math.PI);
    g.stroke();
  }

  const spec = g.createRadialGradient(R * 0.62, R * 0.5, 0, R * 0.62, R * 0.5, R * 0.55);
  spec.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
  spec.addColorStop(1, 'rgba(255, 255, 255, 0)');
  g.fillStyle = spec;
  g.fillRect(0, 0, S, S);
  const shade = g.createRadialGradient(R * 0.7, R * 0.6, R * 0.6, R, R, R * 1.05);
  shade.addColorStop(0, 'rgba(0, 0, 0, 0)');
  shade.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
  g.fillStyle = shade;
  g.fillRect(0, 0, S, S);

  sphereSprites.set(key, canvas);
  return canvas;
}

let glossSprite: HTMLCanvasElement | null = null;
/** Reflexo de vidro por cima da foto (a foto fica "dentro" da esfera). */
export function getGlossSprite(): HTMLCanvasElement | null {
  if (glossSprite) return glossSprite;
  const S = SPHERE_SPRITE_PX;
  const R = S / 2;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = S;
  const g = canvas.getContext('2d');
  if (!g) return null;
  const sp = g.createRadialGradient(R * 0.65, R * 0.55, 0, R * 0.65, R * 0.55, R * 0.7);
  sp.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
  sp.addColorStop(1, 'rgba(255, 255, 255, 0)');
  g.fillStyle = sp;
  g.beginPath();
  g.arc(R, R, R, 0, 2 * Math.PI);
  g.fill();
  glossSprite = canvas;
  return canvas;
}

const shadowSprites = new Map<string, HTMLCanvasElement>();
/** Sombra/reflexo no chão: mancha suave na cor do tipo. */
function getShadowSprite(color: string): HTMLCanvasElement | null {
  const cached = shadowSprites.get(color);
  if (cached) return cached;
  if (shadowSprites.size >= 32) return null;
  const S = 64;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = S;
  const g = canvas.getContext('2d');
  if (!g) return null;
  const grad = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  grad.addColorStop(0, `${color}40`);
  grad.addColorStop(1, `${color}00`);
  g.fillStyle = grad;
  g.fillRect(0, 0, S, S);
  shadowSprites.set(color, canvas);
  return canvas;
}

/* ------------------------------------------------------------------------- */

/** Projeta um círculo deitado no chão (centro cx, cy) como polilinha. */
function groundCircle(ctx: CanvasRenderingContext2D, st: IsoState, cx: number, cy: number, r: number, segments = 96) {
  ctx.beginPath();
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * 2 * Math.PI;
    const [x, y] = project(st, cx + r * Math.cos(a), cy + r * Math.sin(a), 0);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
}

/**
 * Chão quadriculado + linhas de construção (diagonais pelo centro do núcleo
 * de partidos e as órbitas CORE_RADIUS / LANE_NEAR / LANE_FAR). Desenhado no
 * início do quadro, por baixo de tudo, com opacidade = m.
 * `ctx` já vem com a transformação de zoom/arrasto da biblioteca.
 */
export function drawFloor(
  ctx: CanvasRenderingContext2D,
  st: IsoState,
  globalScale: number,
  /** Afastamento dos grupos (SPREAD_25D): as linhas de construção acompanham — ponto p → p + k·(p − centro). */
  spread: { x: number; y: number; k: number } = { x: 0, y: 0, k: 0 },
) {
  if (st.m <= 0) return;
  // Área visível no chão: os 4 cantos da tela "desprojetados".
  const inv = ctx.getTransform().inverse();
  const { width, height } = ctx.canvas;
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const [sx, sy] of [[0, 0], [width, 0], [0, height], [width, height]]) {
    const p = inv.transformPoint({ x: sx, y: sy });
    const [gx, gy] = unprojectGround(st, p.x, p.y);
    minX = Math.min(minX, gx); maxX = Math.max(maxX, gx);
    minY = Math.min(minY, gy); maxY = Math.max(maxY, gy);
  }
  // Projeção degenerada (não deveria acontecer): não desenha, em vez de laçar sem fim.
  if (![minX, maxX, minY, maxY].every(Number.isFinite)) return;
  let step = GRID_STEP;
  while ((maxX - minX) / step > GRID_MAX_LINES || (maxY - minY) / step > GRID_MAX_LINES) step *= 2;
  const major = step * GRID_MAJOR_EVERY;
  const x0 = Math.floor(minX / step) * step, x1 = Math.ceil(maxX / step) * step;
  const y0 = Math.floor(minY / step) * step, y1 = Math.ceil(maxY / step) * step;
  const px = 1 / (globalScale || 1); // 1px de tela em unidades do grafo

  ctx.save();
  ctx.globalAlpha = st.m;
  ctx.lineWidth = px;
  for (const isMajor of [false, true]) {
    ctx.beginPath();
    for (let x = x0; x <= x1; x += step) {
      if ((Math.abs(x % major) < 1e-6) !== isMajor) continue;
      const [ax, ay] = project(st, x, y0, 0);
      const [bx, by] = project(st, x, y1, 0);
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
    }
    for (let y = y0; y <= y1; y += step) {
      if ((Math.abs(y % major) < 1e-6) !== isMajor) continue;
      const [ax, ay] = project(st, x0, y, 0);
      const [bx, by] = project(st, x1, y, 0);
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
    }
    ctx.strokeStyle = isMajor ? GRID_MAJOR : GRID_MINOR;
    ctx.stroke();
  }

  // Linhas de construção: diagonais pelo núcleo + órbitas (com o núcleo e
  // os raios afastados junto com os grupos).
  const ox = -spread.k * spread.x;
  const oy = -spread.k * spread.y;
  const grow = 1 + spread.k;
  const ext = Math.max(Math.abs(x0), Math.abs(x1), Math.abs(y0), Math.abs(y1), LANE_FAR * 1.4) * grow + Math.hypot(ox, oy);
  ctx.beginPath();
  for (const [dx, dy] of [[1, 1], [1, -1]]) {
    const [ax, ay] = project(st, ox - ext * dx, oy - ext * dy, 0);
    const [bx, by] = project(st, ox + ext * dx, oy + ext * dy, 0);
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
  }
  ctx.strokeStyle = CONSTRUCTION_FAINT;
  ctx.stroke();
  ctx.strokeStyle = CONSTRUCTION;
  ctx.setLineDash([6 * px, 6 * px]);
  for (const r of [CORE_RADIUS, LANE_NEAR, LANE_FAR]) {
    groundCircle(ctx, st, ox, oy, r * grow);
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Sombra no chão + haste tracejada até a esfera, para cada entidade que
 * flutua (lift > 0). Pintado depois do chão e antes das linhas.
 */
export function drawGroundMarks(
  ctx: CanvasRenderingContext2D,
  st: IsoState,
  globalScale: number,
  items: { x: number; y: number; z: number; r: number; color: string; alpha: number }[],
) {
  if (st.m <= 0) return;
  const squash = groundSquashFor(st.m);
  const px = 1 / (globalScale || 1);
  ctx.save();
  ctx.lineWidth = px;
  ctx.setLineDash([3 * px, 4 * px]);
  for (const it of items) {
    if (it.z <= 0) continue;
    const [gx, gy] = project(st, it.x, it.y, 0);
    const [sx, sy] = project(st, it.x, it.y, it.z);
    ctx.globalAlpha = st.m * it.alpha;
    const sh = getShadowSprite(it.color);
    if (sh) ctx.drawImage(sh, gx - it.r, gy - it.r * squash, it.r * 2, it.r * 2 * squash);
    ctx.beginPath();
    ctx.moveTo(gx, gy);
    ctx.lineTo(sx, sy + it.r);
    ctx.strokeStyle = `${it.color}55`;
    ctx.stroke();
  }
  ctx.restore();
}
