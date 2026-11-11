/**
 * ============================================================================
 * LAYOUT "NÚCLEO PARTIDÁRIO" (sistemas planetários em volta dos partidos)
 * ============================================================================
 *
 * Como fica:
 *   • PARTIDOS formam um NÚCLEO fixo no centro: todos do mesmo tamanho,
 *     igualmente espaçados num círculo (CORE_RADIUS).
 *   • Cada ESQUEMA é um "planeta" que orbita o núcleo, voltado para os
 *     partidos a que está ligado (direto ou por meio dos seus políticos). O
 *     puxão é dividido IGUALMENTE entre os partidos do esquema: um caso com 7
 *     partidos não é puxado 7 vezes mais forte. Esquemas ligados a partidos
 *     de vários lados ficam mais perto do núcleo; os de uma direção só, mais
 *     longe (faixas de órbita LANE_NEAR..LANE_FAR).
 *   • Cada esquema tem uma ÁREA PROTEGIDA (círculo) proporcional ao número de
 *     entidades dele. Áreas de esquemas NUNCA se sobrepõem (regra rígida),
 *     e não invadem o núcleo.
 *   • Entidades de um esquema só ("luas") ficam DENTRO da área dele; as que
 *     aparecem em vários esquemas flutuam entre eles.
 *   • TAMANHO dos esquemas: proporcional ao nº de entidades ligadas a ele
 *     (área do círculo ∝ conexões; SCHEME_RADIUS_MIN..MAX).
 *
 * Ordem dos partidos no núcleo: a que espalha os esquemas de forma mais
 * uniforme em volta do núcleo (menor "arco vazio"), achada por busca local.
 * Depende só de como os casos se sobrepõem — nunca do tamanho ou da
 * importância de um partido —, então a posição não carrega juízo editorial.
 *
 * Custo: só os ~30 esquemas e os partidos têm posição calculada aqui
 * (geometria pura, poucos milissegundos). As demais entidades se acomodam
 * na animação normal da biblioteca, guiadas pelas forças de applyLayoutForces.
 * ============================================================================
 */
import { forceCollide, forceManyBody, forceX, forceY } from 'd3-force';
import type { GraphLink, GraphNode, NodeType } from '@/types/graph';
import { NODE_STYLE, getLinkEnds, getNodeRadius } from '@/lib/graphConfig';

/* ---------------------------------------------------------------------------
 * PARÂMETROS AJUSTÁVEIS
 * ------------------------------------------------------------------------- */

/** Raio do círculo dos partidos no centro (unidades do grafo). */
export const CORE_RADIUS = 520;

/** Distância mínima entre a borda do núcleo e a área de qualquer esquema. */
export const CORE_GAP = 160;

/**
 * Faixas de órbita dos esquemas (distância do centro, antes de afastar
 * sobreposições). LANE_NEAR = esquema ligado a partidos de todos os lados;
 * LANE_FAR = esquema voltado para uma direção só.
 */
export const LANE_NEAR = 1500;
export const LANE_FAR = 2800;

/** Tamanho dos esquemas: raio mínimo e máximo (menos → mais conexões). */
export const SCHEME_RADIUS_MIN = 70;
export const SCHEME_RADIUS_MAX = 170;

/**
 * Área protegida de cada esquema = raio do esquema + AREA_BASE +
 * AREA_PER_MEMBER × √(nº de entidades só dele).
 *   ↑ aumentar → sistemas mais folgados (luas mais espalhadas)
 */
export const AREA_BASE = 90;
export const AREA_PER_MEMBER = 42;

/** Folga mínima entre as áreas de dois esquemas. */
export const AREA_GAP = 60;

/**
 * Força que prende as luas na área do seu esquema (0..1) e que puxa as
 * entidades compartilhadas para o meio dos seus esquemas.
 */
export const TETHER_STRENGTH = 0.08;

/**
 * Âncora fraca de todo nó livre à posição inicial calculada (0..1): impede
 * que um nó sem ligações visíveis se afaste para sempre.
 */
export const FREE_ANCHOR_STRENGTH = 0.015;

/** Repulsão entre nós livres (negativo = repelir) e seu alcance máximo. */
export const REPULSION: Record<NodeType, number> = {
  scheme: -900,
  party: -500,
  company: -300,
  politician: -260,
  operator: -260,
};
export const REPULSION_RANGE = 500;

/** Folga extra no raio de colisão (espaço para o rótulo). */
export const COLLIDE_PADDING = 18;

/** Comprimento das ligações: esquema–entidade (somado aos raios) e entidade–entidade. */
export const SCHEME_LINK_GAP = 90;
export const ENTITY_LINK_LENGTH = 110;

/** Rigidez das molas (ligações com partidos não puxam: o núcleo é fixo). */
export const LINK_STRENGTH = 0.2;

/** Deriva suave (desligada por padrão em NetworkGraph; ver DRIFT_ENABLED). */
export const DRIFT_AMPLITUDE = 0.008;
export const DRIFT_SPEED = 0.45;

/* ---------------------------------------------------------------------------
 * CÁLCULO
 * ------------------------------------------------------------------------- */

export interface LayoutTarget {
  x: number;
  y: number;
  /** Esquemas da entidade (luas); vazio para esquemas e partidos. */
  home?: string[];
  /** Raio da área protegida (só esquemas). */
  area?: number;
}

/** Hash determinístico simples: mesmo id → mesmo "ruído", layout reproduzível. */
function hashUnit(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 10000; // 0..1
}

/** Gerador pseudoaleatório determinístico (mesmos dados → mesmo layout). */
function seeded(seed: number) {
  let s = seed % 2147483647 || 1;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

/** Última ordem calculada dos partidos no núcleo (ids). */
let cachedPartyOrder: string[] | null = null;

/**
 * Calcula a posição-alvo de cada nó visível e o raio de cada esquema
 * (gravado em `node.__radius`). Chamado sempre que o conjunto visível muda.
 */
export function computeLayoutTargets(nodes: GraphNode[], links: GraphLink[]): Map<string, LayoutTarget> {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const nb = new Map<string, Set<string>>(nodes.map((n) => [n.id, new Set()]));
  for (const l of links) {
    const { sourceId, targetId } = getLinkEnds(l);
    if (!byId.has(sourceId) || !byId.has(targetId)) continue;
    nb.get(sourceId)!.add(targetId);
    nb.get(targetId)!.add(sourceId);
  }
  const type = (id: string) => byId.get(id)?.type;
  const schemes = nodes.filter((n) => n.type === 'scheme').sort((a, b) => a.id.localeCompare(b.id));
  const parties = nodes.filter((n) => n.type === 'party').sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'));
  const targets = new Map<string, LayoutTarget>();

  // 1. Esquemas de cada entidade: ligações diretas; sem nenhuma, herda dos
  //    vizinhos que não são partidos (ex.: operador → empresa → esquema).
  const home = new Map<string, string[]>();
  for (const n of nodes) {
    if (n.type === 'scheme' || n.type === 'party') continue;
    home.set(n.id, [...nb.get(n.id)!].filter((x) => type(x) === 'scheme'));
  }
  for (const n of nodes) {
    if (n.type === 'scheme' || n.type === 'party' || home.get(n.id)!.length) continue;
    const inherited = new Set<string>();
    nb.get(n.id)!.forEach((x) => (home.get(x) ?? []).forEach((s) => inherited.add(s)));
    home.set(n.id, [...inherited]);
  }

  // 2. Tamanho dos esquemas por nº de conexões (área ∝ conexões) e área protegida.
  const degree = new Map(schemes.map((s) => [s.id, nb.get(s.id)!.size]));
  const dMin = degree.size ? Math.min(...degree.values()) : 0;
  const dMax = degree.size ? Math.max(...degree.values()) : 1;
  const members = new Map(schemes.map((s) => [s.id, 0]));
  home.forEach((hs) => hs.length === 1 && members.set(hs[0], (members.get(hs[0]) ?? 0) + 1));
  const area = new Map<string, number>();
  for (const s of schemes) {
    const span = Math.sqrt(dMax) - Math.sqrt(dMin);
    const t = span > 0 ? (Math.sqrt(degree.get(s.id)!) - Math.sqrt(dMin)) / span : 0.5;
    (s as any).__radius = SCHEME_RADIUS_MIN + (SCHEME_RADIUS_MAX - SCHEME_RADIUS_MIN) * t;
    area.set(s.id, (s as any).__radius + AREA_BASE + AREA_PER_MEMBER * Math.sqrt(members.get(s.id) ?? 0));
  }

  // 3. Partidos de cada esquema (diretos ou via seus políticos).
  const schemeParties = new Map<string, string[]>();
  for (const s of schemes) {
    const ps = new Set([...nb.get(s.id)!].filter((x) => type(x) === 'party'));
    nb.get(s.id)!.forEach((x) => type(x) === 'politician' && nb.get(x)!.forEach((p) => type(p) === 'party' && ps.add(p)));
    schemeParties.set(s.id, [...ps]);
  }

  // 4. Ordem dos partidos no núcleo que espalha os esquemas por igual.
  const slot = (i: number) => (i / Math.max(1, parties.length)) * 2 * Math.PI - Math.PI / 2;
  const directions = (order: GraphNode[]) => {
    const pos = new Map(order.map((p, i) => [p.id, slot(i)]));
    return schemes.map((s) => {
      const ps = schemeParties.get(s.id)!.filter((p) => pos.has(p));
      if (!ps.length) return { ang: hashUnit(s.id) * 2 * Math.PI, focus: 1 };
      let vx = 0;
      let vy = 0;
      for (const p of ps) {
        vx += Math.cos(pos.get(p)!);
        vy += Math.sin(pos.get(p)!);
      }
      return { ang: Math.atan2(vy, vx), focus: Math.hypot(vx, vy) / ps.length };
    });
  };
  const cost = (order: GraphNode[]) => {
    const a = directions(order).map((d) => d.ang).sort((x, y) => x - y);
    if (a.length < 2) return 0;
    let gap = 2 * Math.PI - (a[a.length - 1] - a[0]);
    let sx = 0;
    let sy = 0;
    for (let i = 0; i < a.length; i++) {
      if (i) gap = Math.max(gap, a[i] - a[i - 1]);
      sx += Math.cos(a[i]);
      sy += Math.sin(a[i]);
    }
    return gap + (2 * Math.hypot(sx, sy)) / a.length; // maior arco vazio + desequilíbrio
  };
  // A ordem é calculada uma vez e reaproveitada enquanto todos os partidos
  // visíveis já estiverem nela: filtros e o slider de ano não reembaralham o
  // núcleo (e não pagam a busca de novo a cada passo).
  let order = [...parties];
  const known = cachedPartyOrder && parties.every((p) => cachedPartyOrder!.includes(p.id));
  if (known) {
    const rank = new Map(cachedPartyOrder!.map((id, i) => [id, i]));
    order.sort((a, b) => rank.get(a.id)! - rank.get(b.id)!);
  } else if (order.length > 2) {
    const rnd = seeded(order.length * 7919 + schemes.length);
    let best = cost(order);
    for (let it = 0; it < 4000; it++) {
      const i = Math.floor(rnd() * order.length);
      const j = Math.floor(rnd() * order.length);
      if (i === j) continue;
      [order[i], order[j]] = [order[j], order[i]];
      const c = cost(order);
      if (c <= best) best = c;
      else [order[i], order[j]] = [order[j], order[i]];
    }
    cachedPartyOrder = order.map((p) => p.id);
  }
  order.forEach((p, i) => targets.set(p.id, { x: CORE_RADIUS * Math.cos(slot(i)), y: CORE_RADIUS * Math.sin(slot(i)) }));

  // 5. Esquemas: alvo na faixa de órbita, depois afasta sobreposições de
  //    áreas e do núcleo (só 30 círculos — geometria pura, barata).
  const dirs = directions(order);
  const pos = schemes.map((s, i) => {
    const lane = LANE_NEAR + (LANE_FAR - LANE_NEAR) * dirs[i].focus;
    return { id: s.id, tx: lane * Math.cos(dirs[i].ang), ty: lane * Math.sin(dirs[i].ang), x: 0, y: 0, r: area.get(s.id)! };
  });
  pos.forEach((p) => ((p.x = p.tx), (p.y = p.ty)));
  for (let it = 0; it < 300; it++) {
    for (const p of pos) {
      p.x += (p.tx - p.x) * 0.02;
      p.y += (p.ty - p.y) * 0.02;
    }
    for (let i = 0; i < pos.length; i++) {
      for (let j = i + 1; j < pos.length; j++) {
        const a = pos[i];
        const b = pos[j];
        const dx = b.x - a.x || 0.01;
        const dy = b.y - a.y;
        const dist = Math.hypot(dx, dy);
        const min = a.r + b.r + AREA_GAP;
        if (dist < min) {
          const k = ((min - dist) / dist) * 0.5;
          a.x -= dx * k;
          a.y -= dy * k;
          b.x += dx * k;
          b.y += dy * k;
        }
      }
    }
    for (const p of pos) {
      const dist = Math.hypot(p.x, p.y) || 1;
      const min = CORE_RADIUS + CORE_GAP + p.r;
      if (dist < min) {
        p.x *= min / dist;
        p.y *= min / dist;
      }
    }
  }
  pos.forEach((p) => targets.set(p.id, { x: p.x, y: p.y, area: p.r }));

  // 6. Demais entidades: luas espalhadas dentro da área do seu esquema;
  //    compartilhadas, no meio dos seus esquemas.
  for (const n of nodes) {
    if (targets.has(n.id)) continue;
    const hs = (home.get(n.id) ?? []).filter((h) => targets.has(h));
    if (!hs.length) {
      const a = hashUnit(n.id) * 2 * Math.PI;
      targets.set(n.id, { x: (CORE_RADIUS + 300) * Math.cos(a), y: (CORE_RADIUS + 300) * Math.sin(a), home: [] });
      continue;
    }
    if (hs.length === 1) {
      const s = targets.get(hs[0])!;
      const sr = getNodeRadius('scheme', byId.get(hs[0]) as any);
      const a = hashUnit(n.id) * 2 * Math.PI;
      const d = sr + 40 + (s.area! - sr - 60) * (0.35 + 0.5 * hashUnit(`${n.id}#r`));
      targets.set(n.id, { x: s.x + d * Math.cos(a), y: s.y + d * Math.sin(a), home: hs });
    } else {
      const cx = hs.reduce((acc, h) => acc + targets.get(h)!.x, 0) / hs.length;
      const cy = hs.reduce((acc, h) => acc + targets.get(h)!.y, 0) / hs.length;
      targets.set(n.id, { x: cx, y: cy, home: hs });
    }
  }
  return targets;
}

/**
 * Posiciona os nós: esquemas e partidos FIXOS no alvo (fx/fy) — sempre, para
 * acompanhar mudanças de filtro; os demais nascem no alvo só na 1ª vez (depois
 * ficam onde estão e as forças os levam ao novo lugar, com animação).
 */
export function seedPositions(nodes: GraphNode[], targets: Map<string, LayoutTarget>) {
  for (const n of nodes) {
    const t = targets.get(n.id);
    if (!t) continue;
    if (n.type === 'scheme' || n.type === 'party') {
      n.x = n.fx = t.x;
      n.y = n.fy = t.y;
    } else if (typeof n.x !== 'number' || typeof n.y !== 'number') {
      n.x = t.x;
      n.y = t.y;
    }
  }
}

/**
 * Prende cada lua na área protegida do seu esquema (nem longe demais, nem
 * colada no círculo) e puxa as entidades compartilhadas para o meio dos seus
 * esquemas. Usa as posições ATUAIS dos esquemas (que podem ser arrastados).
 */
function forceTether(targets: Map<string, LayoutTarget>) {
  let moons: any[] = [];
  let byId = new Map<string, any>();
  const force: any = (alpha: number) => {
    for (const n of moons) {
      const hs = (targets.get(n.id)?.home ?? []).map((h) => byId.get(h)).filter(Boolean);
      if (!hs.length) continue;
      if (hs.length === 1) {
        const s = hs[0];
        const areaR = targets.get(s.id)?.area ?? 300;
        const dx = n.x - s.x;
        const dy = n.y - s.y;
        const dist = Math.hypot(dx, dy) || 1;
        const r = getNodeRadius(n.type, n);
        const max = areaR - r - 15;
        const min = getNodeRadius('scheme', s) + r + 30;
        if (dist > max) {
          const k = (dist - max) / dist;
          n.x -= dx * k;
          n.y -= dy * k;
        } else if (dist < min) {
          const k = (dist - min) / dist;
          n.x -= dx * k * 0.5;
          n.y -= dy * k * 0.5;
        }
      } else {
        const cx = hs.reduce((a: number, h: any) => a + h.x, 0) / hs.length;
        const cy = hs.reduce((a: number, h: any) => a + h.y, 0) / hs.length;
        n.vx += (cx - n.x) * TETHER_STRENGTH * alpha;
        n.vy += (cy - n.y) * TETHER_STRENGTH * alpha;
      }
    }
  };
  force.initialize = (ns: any[]) => {
    byId = new Map(ns.map((n) => [n.id, n]));
    moons = ns.filter((n) => n.type !== 'scheme' && n.type !== 'party');
  };
  return force;
}

/**
 * Força de deriva: empurrão senoidal suave, com fase própria por nó (média
 * zero → o nó oscila em torno do lugar). Nós fixos (fx) não são afetados.
 */
export function forceDrift(amplitude = DRIFT_AMPLITUDE, speed = DRIFT_SPEED) {
  let nodes: any[] = [];
  let phases: number[] = [];
  const force: any = () => {
    if (amplitude === 0) return;
    const t = (typeof performance !== 'undefined' ? performance.now() : Date.now()) / 1000;
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      if (typeof n.fx === 'number') continue;
      n.vx += amplitude * Math.sin(t * speed + phases[i]);
      n.vy += amplitude * Math.cos(t * speed * 0.83 + phases[i] * 1.7);
    }
  };
  force.initialize = (ns: any[]) => {
    nodes = ns;
    phases = ns.map((n) => hashUnit(String(n.id)) * 2 * Math.PI);
  };
  return force;
}

const isParty = (end: any) => typeof end === 'object' && end?.type === 'party';
const isScheme = (end: any) => typeof end === 'object' && end?.type === 'scheme';

/**
 * Aplica as forças do layout no ref do react-force-graph (API d3Force).
 * @param drift  true = liga a deriva suave
 */
export function applyLayoutForces(
  setForce: (name: string, force?: unknown) => any,
  targets: Map<string, LayoutTarget>,
  drift = false
) {
  setForce('center', null);
  setForce('x', forceX((n: any) => targets.get(n.id)?.x ?? 0).strength(FREE_ANCHOR_STRENGTH));
  setForce('y', forceY((n: any) => targets.get(n.id)?.y ?? 0).strength(FREE_ANCHOR_STRENGTH));
  setForce(
    'charge',
    forceManyBody()
      .strength((n: any) => REPULSION[n.type as NodeType] ?? -260)
      .distanceMax(REPULSION_RANGE)
  );
  setForce(
    'collide',
    forceCollide((n: any) => getNodeRadius(n.type, n) + COLLIDE_PADDING)
      .strength(0.9)
      .iterations(2)
  );
  setForce('tether', forceTether(targets));

  const link = setForce('link');
  if (link?.distance) {
    link
      .distance((l: any) =>
        isScheme(l.source) || isScheme(l.target)
          ? getNodeRadius(l.source?.type, l.source) + getNodeRadius(l.target?.type, l.target) + SCHEME_LINK_GAP
          : ENTITY_LINK_LENGTH
      )
      // Ligações com partidos não puxam ninguém: o núcleo é fixo e os
      // políticos ficam no sistema do seu esquema.
      .strength((l: any) => (isParty(l.source) || isParty(l.target) ? 0 : LINK_STRENGTH));
  }

  setForce('drift', drift ? forceDrift() : null);
}

/** Ligação com um partido? (desenhadas só sob demanda; ver NetworkGraph) */
export const isPartyLink = (l: any) => isParty(l.source) || isParty(l.target);

