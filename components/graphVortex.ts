/**
 * ============================================================================
 * VÓRTICE DO NÚCLEO — funil de anéis e partículas no meio do círculo de partidos
 * ============================================================================
 * Um funil 3D de verdade, afundando ABAIXO do chão (altura negativa), no centro
 * do núcleo partidário. É projetado com a mesma projeção do grafo (lib/iso.ts),
 * então responde sozinho à inclinação do zoom:
 *   2D (m = 0)   — visto de cima: anéis concêntricos, olhando para dentro do poço
 *                  (uma perspectiva leve encolhe os anéis mais fundos);
 *   2.5D (m = 1) — o funil inclinado, com o tubo descendo abaixo do chão.
 *
 * Fica num canvas PRÓPRIO, atrás do canvas do grafo (ver NetworkGraph): só
 * este canvas pequeno é redesenhado a cada quadro, não o grafo inteiro.
 * ============================================================================
 */
import { IsoState, project } from '@/lib/iso';
import { CORE_RADIUS } from '@/lib/layout';

/** Raio da boca do funil (unidades do grafo): por dentro dos partidos (raio 70 em CORE_RADIUS). */
const MOUTH_RADIUS = CORE_RADIUS * 0.72;
/** Raio da garganta ÷ raio da boca. */
const THROAT = 0.18;
/** ↑ = o raio cai mais rápido (mais anéis no tubo, menos na boca). */
const FLARE = 2.8;
/** Profundidade do tubo ÷ raio da boca. */
const DEPTH = 0.9;
/** Perspectiva de cima (só no 2D): ↑ = anéis fundos encolhem mais. */
const TOP_PERSPECTIVE = 1.1;

const DISC_COUNT = 40;
const PARTICLE_COUNT = 6000;
/** Voltas do loop por segundo (anéis entrando no funil). */
const FLOW_SPEED = 0.03;
/**
 * GIRO KEPLERIANO (como nas simulações de buraco negro): a velocidade angular
 * cai com a distância ao centro, ω = OMEGA_MOUTH · (raio da boca ÷ r)^1,5.
 * A borda gira devagar e a garganta muito mais rápido (≈ 13× com THROAT = 0,18).
 *   OMEGA_MOUTH — rad/s na boca (0,12 ≈ uma volta a cada 52 s);
 *   OMEGA_MAX   — teto, para a garganta não virar borrão.
 */
const OMEGA_MOUTH = 0.12;
const OMEGA_MAX = 2.5;
/** 1 = anti-horário na tela vista de cima, −1 = horário. */
const SPIN_DIRECTION = 1;
const FADE_IN = 0.03;
const FADE_OUT = 0.4;
/** Cores: anéis cinza-claro translúcidos e partículas brancas. */
const DISC_COLOR = 'rgba(200, 200, 200, 0.15)';
const PARTICLE_COLOR = '#ffffff';
/** Lado da partícula em px de tela. */
const PARTICLE_PX = 1.2;
/** Segmentos de cada anel (polilinha projetada). */
const RING_SEGMENTS = 72;

const TAU = Math.PI * 2;

export interface VortexState {
  pDisc: Uint16Array;
  pAng: Float32Array;
  pJit: Float32Array;
  pBright: Float32Array;
  /** Por anel, recalculado a cada quadro. */
  r: Float32Array;
  /** Velocidade angular (rad/s) do anel, pelo raio físico (sem a perspectiva do 2D). */
  w: Float32Array;
  z: Float32Array;
  a: Float32Array;
  t: Float32Array;
  /** Tempo (s) do último quadro: os ângulos avançam por passo (ω · dt). */
  lastTime: number;
}

export function createVortex(): VortexState {
  const pDisc = new Uint16Array(PARTICLE_COUNT);
  const pAng = new Float32Array(PARTICLE_COUNT);
  const pJit = new Float32Array(PARTICLE_COUNT);
  const pBright = new Float32Array(PARTICLE_COUNT);
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    pDisc[i] = Math.floor(Math.random() * DISC_COUNT);
    pAng[i] = Math.random() * TAU;
    pJit[i] = 1 + (Math.random() - 0.5) * 0.015;
    pBright[i] = Math.random() ** 2;
  }
  return {
    pDisc, pAng, pJit, pBright,
    r: new Float32Array(DISC_COUNT),
    w: new Float32Array(DISC_COUNT),
    z: new Float32Array(DISC_COUNT),
    a: new Float32Array(DISC_COUNT),
    t: new Float32Array(DISC_COUNT),
    lastTime: -1,
  };
}

/**
 * Desenha o vórtice. `transform` é a transformação de zoom/arrasto do canvas do
 * grafo (em px do dispositivo); `cx, cy` é o centro do núcleo no chão (já com o
 * afastamento dos grupos); `time` em segundos; `alpha` = opacidade do
 * conjunto (a mesma dos partidos: brilho por zoom e foco).
 */
export function drawVortex(
  ctx: CanvasRenderingContext2D,
  vs: VortexState,
  st: IsoState,
  transform: DOMMatrix,
  globalScale: number,
  cx: number,
  cy: number,
  time: number,
  alpha: number,
) {
  const { width, height } = ctx.canvas;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, width, height);
  // Passo de tempo (limitado: aba que volta do segundo plano não dá um salto).
  const dt = vs.lastTime < 0 ? 0 : Math.min(0.1, Math.max(0, time - vs.lastTime));
  vs.lastTime = time;
  if (alpha <= 0.01) return;

  // Fora da tela (ou pequeno demais para ver): não desenha.
  const [sx, sy] = project(st, cx, cy, 0);
  const c = transform.transformPoint({ x: sx, y: sy });
  const reach = (MOUTH_RADIUS + MOUTH_RADIUS * DEPTH) * transform.a;
  if (reach < 6 || c.x < -reach || c.y < -reach || c.x > width + reach || c.y > height + reach) return;

  ctx.setTransform(transform);
  const px = 1 / (globalScale || 1);
  const phase = (time * FLOW_SPEED) % 1;
  const persp = (1 - st.m) * TOP_PERSPECTIVE;

  // Anéis: t = 0 na boca, 1 no fundo.
  ctx.lineWidth = px;
  ctx.strokeStyle = DISC_COLOR;
  for (let d = 0; d < DISC_COUNT; d++) {
    const t = (d / DISC_COUNT + phase) % 1;
    const depth = t * t * MOUTH_RADIUS * DEPTH;
    const rPhys = MOUTH_RADIUS * (THROAT + ((1 - THROAT) * (1 - t)) / (1 + FLARE * t));
    const r = rPhys / (1 + (persp * depth) / MOUTH_RADIUS);
    const a = Math.max(0, Math.min(1, t / FADE_IN, (1 - t) / FADE_OUT));
    vs.t[d] = t;
    vs.r[d] = r;
    vs.w[d] = Math.min(OMEGA_MAX, OMEGA_MOUTH * (MOUTH_RADIUS / rPhys) ** 1.5) * SPIN_DIRECTION;
    vs.z[d] = -depth;
    vs.a[d] = a;
    if (a <= 0.01) continue;
    ctx.globalAlpha = a * alpha;
    ctx.beginPath();
    for (let i = 0; i <= RING_SEGMENTS; i++) {
      const ang = (i / RING_SEGMENTS) * TAU;
      const [x, y] = project(st, cx + r * Math.cos(ang), cy + r * Math.sin(ang), -depth);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Partículas em órbita kepleriana: cada uma avança ω·dt do seu anel.
  ctx.fillStyle = PARTICLE_COLOR;
  const s = PARTICLE_PX * px;
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const d = vs.pDisc[i];
    const ang = (vs.pAng[i] = (vs.pAng[i] + vs.w[d] * dt) % TAU);
    const a = vs.a[d];
    if (a <= 0.01) continue;
    const r = vs.r[d] * vs.pJit[i];
    const [x, y] = project(st, cx + r * Math.cos(ang), cy + r * Math.sin(ang), vs.z[d]);
    ctx.globalAlpha = a * vs.pBright[i] * alpha;
    ctx.fillRect(x - s / 2, y - s / 2, s, s);
  }
  ctx.globalAlpha = 1;
}
