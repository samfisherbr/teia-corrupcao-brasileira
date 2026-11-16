/**
 * ============================================================================
 * MODO 2.5D — projeção isométrica do grafo (só matemática, sem desenho)
 * ============================================================================
 * Ao aproximar a câmera (com o interruptor "2.5D" ligado), a teia gira 45° e
 * inclina até o ângulo isométrico; cada entidade sobe a uma altura conforme o
 * tipo (NODE_STYLE.lift em lib/graphConfig.ts) e vira uma esfera.
 *
 * A física e a câmera da biblioteca continuam em 2D: o d3 calcula x/y no
 * plano, e o zoom/arrasto da biblioteca agem sobre o espaço JÁ PROJETADO.
 * Aqui só convertemos (x, y, altura) → posição projetada, que é onde tudo é
 * desenhado e clicado.
 *
 *   m = "quanto 2.5D" (0 = plano, 1 = isométrico completo), função do zoom.
 *   P(v) = A + M·(v − A) − (0, LIFT·z)
 *     M = achatamento vertical × rotação (os dois crescem com m);
 *     A = âncora, recalculada sempre que m muda para que o ponto do chão no
 *         CENTRO DA TELA fique parado — a teia gira/inclina em volta do que o
 *         usuário está olhando, sem mexer na câmera da biblioteca (o zoom
 *         por roda, pinça e animações continuam funcionando sozinhos).
 * ============================================================================
 */

/** Inclinação isométrica verdadeira: 35,264° (arcsin(tan 30°)). */
const ISO_PITCH = Math.asin(Math.tan(Math.PI / 6));
/** Rotação no plano ao chegar no isométrico completo (−45° = losango, como na referência). */
const ISO_YAW = -Math.PI / 4;
/** Escala vertical do chão no isométrico completo (sen 35,264° ≈ 0,577). */
export const ISO_GROUND_SQUASH = Math.sin(ISO_PITCH);
/** Quanto uma unidade de altura sobe na tela no isométrico completo (cos 35,264° ≈ 0,816). */
const ISO_LIFT = Math.cos(ISO_PITCH);

/**
 * Quando a transição acontece, medido em "quantas unidades do grafo cabem no
 * menor lado da tela" (e não em zoom absoluto): assim celular e desktop
 * entram no 2.5D vendo a mesma porção da teia.
 *   SPAN_FLAT  — vendo isto ou mais → 2D puro.
 *   SPAN_FULL  — vendo isto ou menos → 2.5D completo.
 * Ex.: tela de 760px de altura → 2D até zoom 0,47; 2.5D completo a partir de 0,76.
 *      celular de 390px de largura → 0,24 e 0,39.
 */
const SPAN_FLAT = 1600;
const SPAN_FULL = 1000;

export const zoomForFull25D = (viewMin: number) => viewMin / SPAN_FULL;

/** m (0..1) para um zoom e o menor lado da tela, com curva suave nas pontas. */
export function morphForZoom(k: number, viewMin: number): number {
  const k0 = viewMin / SPAN_FLAT;
  const k1 = viewMin / SPAN_FULL;
  const t = Math.min(1, Math.max(0, (k - k0) / (k1 - k0)));
  return t * t * (3 - 2 * t);
}

/** Abaixo disto, m conta como 0 (a âncora fica mal condicionada perto de m = 0). */
const M_EPS = 1e-3;

export interface IsoState {
  m: number;
  /** M = [[a, b], [c, d]] */
  a: number; b: number; c: number; d: number;
  /** altura → deslocamento para cima (unidades do grafo) */
  lift: number;
  /** âncora A */
  ax: number; ay: number;
}

export const createIsoState = (): IsoState => ({ m: 0, a: 1, b: 0, c: 0, d: 1, lift: 0, ax: 0, ay: 0 });

function matrixFor(m: number) {
  const yaw = ISO_YAW * m;
  const s = 1 - m * (1 - ISO_GROUND_SQUASH);
  const cos = Math.cos(yaw);
  const sin = Math.sin(yaw);
  return { a: cos, b: -sin, c: s * sin, d: s * cos, lift: m * ISO_LIFT };
}

/** Ponto do chão (altura 0) que está em (px, py) no espaço projetado. */
export function unprojectGround(st: IsoState, px: number, py: number): [number, number] {
  if (st.m === 0) return [px, py];
  const det = st.a * st.d - st.b * st.c;
  const rx = px - st.ax;
  const ry = py - st.ay;
  return [st.ax + (st.d * rx - st.b * ry) / det, st.ay + (-st.c * rx + st.a * ry) / det];
}

/**
 * Atualiza m mantendo parado o ponto do chão em (cx, cy) — o centro da tela,
 * em coordenadas do espaço projetado (as da biblioteca). Devolve true se mudou.
 */
export function setMorph(st: IsoState, mRaw: number, cx: number, cy: number): boolean {
  const m = mRaw < M_EPS ? 0 : mRaw;
  if (m === st.m) return false;
  const [vx, vy] = unprojectGround(st, cx, cy);
  const M = matrixFor(m);
  st.m = m;
  st.a = M.a; st.b = M.b; st.c = M.c; st.d = M.d; st.lift = M.lift;
  if (m === 0) {
    st.ax = 0;
    st.ay = 0;
    return true;
  }
  // A = (I − M)⁻¹ · (c − M·v), para que P(v) = c.
  const rx = cx - (M.a * vx + M.b * vy);
  const ry = cy - (M.c * vx + M.d * vy);
  const ia = 1 - M.a, ib = -M.b, ic = -M.c, id = 1 - M.d;
  const det = ia * id - ib * ic;
  st.ax = (id * rx - ib * ry) / det;
  st.ay = (-ic * rx + ia * ry) / det;
  return true;
}

/** Posição projetada de (x, y) à altura z. Com m = 0, devolve (x, y). */
export function project(st: IsoState, x: number, y: number, z: number): [number, number] {
  if (st.m === 0) return [x, y];
  const rx = x - st.ax;
  const ry = y - st.ay;
  return [st.ax + st.a * rx + st.b * ry, st.ay + st.c * rx + st.d * ry - st.lift * z];
}

/** Profundidade para a ordem de pintura (maior = mais perto da câmera = pintado depois). */
export function depthOf(st: IsoState, x: number, y: number, z: number): number {
  // Coordenada "para frente" após a rotação; a altura desempata (mais alto na frente).
  const yaw = ISO_YAW * st.m;
  return x * Math.sin(yaw) + y * Math.cos(yaw) + z * 0.01;
}

/**
 * Deslocamento projetado (no 2.5D completo, m = 1) de um ponto em relação a
 * outro — usado para enquadrar a seleção ANTES da animação começar.
 */
export function fullIsoOffset(dx: number, dy: number, dz: number): [number, number] {
  const M = matrixFor(1);
  return [M.a * dx + M.b * dy, M.c * dx + M.d * dy - M.lift * dz];
}

/** Escala vertical de um círculo deitado no chão para um dado m (o círculo vira elipse). */
export const groundSquashFor = (m: number) => 1 - m * (1 - ISO_GROUND_SQUASH);
