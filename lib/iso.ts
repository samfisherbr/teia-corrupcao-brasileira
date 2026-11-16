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
  // Contêiner sem tamanho (oculto) ou zoom inválido: fica no 2D (evita NaN).
  if (!(viewMin > 0) || !(k > 0)) return 0;
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
  const m = !Number.isFinite(mRaw) || mRaw < M_EPS ? 0 : Math.min(1, mRaw);
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

/* ---------------------------------------------------------------------------
 * ALTURAS AUTOMÁTICAS — para nenhuma esfera ficar escondida atrás de outra
 * ---------------------------------------------------------------------------
 * No isométrico o chão é achatado (×0,577), então entidades que não se
 * encostam no plano podem se sobrepor na tela — sobretudo as "luas" atrás da
 * esfera grande do esquema. Mudar a altura de uma entidade só a move na
 * VERTICAL da tela, então dá para separar os pares sobrepostos subindo a de
 * cima e descendo a de baixo, sempre perto da altura do tipo (NODE_STYLE.lift).
 *
 * Como no 2.5D completo tudo escala junto com o zoom, a sobreposição não
 * depende do zoom: o cálculo é feito UMA vez quando a física se acomoda
 * (~335 entidades: poucos milissegundos), não a cada quadro.
 *
 *   LIFT_MAX     — altura máxima permitida (unidades do grafo).
 *   LIFT_GAP     — folga mínima entre duas esferas na tela (inclui o brilho).
 *   LIFT_SPRING  — quanto cada passo puxa de volta para a altura do tipo.
 * Sem solução dentro de LIFT_MAX (aglomerado muito denso), sobra a menor
 * sobreposição possível — e a esfera da frente continua por cima, como antes.
 * ------------------------------------------------------------------------- */
const LIFT_MAX = 720;
const LIFT_GAP = 12;
const LIFT_SPRING = 0.04;
const LIFT_ITERATIONS = 80;
/** Últimos passos sem a "mola", para fechar as sobreposições que restarem. */
const LIFT_FINAL_ITERATIONS = 20;

export function resolveLifts(items: { x: number; y: number; r: number; base: number }[]): { lifts: number[]; overlapsBefore: number; overlapsAfter: number } {
  const n = items.length;
  const M = matrixFor(1);
  const sx = items.map((it) => M.a * it.x + M.b * it.y);
  const gy = items.map((it) => M.c * it.x + M.d * it.y);
  const z = items.map((it) => it.base);

  // Pares que PODEM se sobrepor: a distância horizontal não muda com a altura.
  const pairs: { i: number; j: number; need: number }[] = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const reach = items[i].r + items[j].r + LIFT_GAP;
      const dx = Math.abs(sx[i] - sx[j]);
      if (dx >= reach) continue;
      pairs.push({ i, j, need: Math.sqrt(reach * reach - dx * dx) });
    }
  }
  const countOverlaps = () => {
    let c = 0;
    for (const { i, j, need } of pairs) if (Math.abs(gy[j] - M.lift * z[j] - (gy[i] - M.lift * z[i])) < need - 0.5) c++;
    return c;
  };
  const overlapsBefore = countOverlaps();

  for (let it = 0; it < LIFT_ITERATIONS; it++) {
    for (const { i, j, need } of pairs) {
      const yi = gy[i] - M.lift * z[i];
      const yj = gy[j] - M.lift * z[j];
      const gap = Math.abs(yj - yi);
      if (gap >= need) continue;
      // "upper" = mais alto na tela (y menor): sobe; "lower": desce.
      const [up, lo] = yi < yj || (yi === yj && i < j) ? [i, j] : [j, i];
      let push = (need - gap) / M.lift; // em unidades de altura
      // Divide o empurrão; o que bater no chão ou no teto passa o resto ao outro.
      const down = Math.min(push / 2, z[lo]);
      z[lo] -= down;
      push -= down;
      const upMove = Math.min(push, LIFT_MAX - z[up]);
      z[up] += upMove;
      push -= upMove;
      if (push > 0) z[lo] = Math.max(0, z[lo] - push);
    }
    if (it < LIFT_ITERATIONS - LIFT_FINAL_ITERATIONS) {
      for (let k = 0; k < n; k++) z[k] += (items[k].base - z[k]) * LIFT_SPRING;
    }
  }
  return { lifts: z, overlapsBefore, overlapsAfter: countOverlaps() };
}
