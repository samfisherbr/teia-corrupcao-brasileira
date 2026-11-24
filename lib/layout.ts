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
 * ESCALA AUTOMÁTICA: CORE_RADIUS, LANE_NEAR e LANE_FAR são PISOS. O raio do
 * núcleo cresce com o nº de partidos (cabem lado a lado no círculo) e a faixa
 * de órbita cresce com a área total dos esquemas (+ "pontes", abaixo), para
 * que novos casos ganhem espaço em vez de se espremer. Os valores efetivos
 * ficam em `layoutGeometry` (lidos pelo desenho do chão 2.5D e do funil).
 *
 * PONTES: entidades compartilhadas pelo MESMO conjunto de esquemas (≥ 2)
 * ganham uma área reservada própria, que entra na mesma relaxação das áreas
 * dos esquemas: nenhuma área (esquema ou ponte) invade outra.
 *
 * ESQUEMAS FLUTUAM: o alvo calculado aqui é só a âncora de uma mola
 * (forceSchemeAreas); só os partidos ficam fixos. Arrastar um esquema o deixa
 * fixo onde foi solto até os dados mudarem (ver seedPositions).
 *
 * Custo: só os ~30 esquemas e os partidos têm posição calculada aqui
 * (geometria pura, poucos milissegundos). As demais entidades se acomodam
 * na animação normal da biblioteca, guiadas pelas forças de applyLayoutForces.
 * ============================================================================
 */
import { forceCollide, forceLink, forceManyBody, forceSimulation, forceX, forceY } from 'd3-force';
import type { GraphLink, GraphNode, NodeType } from '@/types/graph';
import { getLinkEnds, getNodeRadius } from '@/lib/graphConfig';

/* ---------------------------------------------------------------------------
 * PARÂMETROS AJUSTÁVEIS
 * ------------------------------------------------------------------------- */

/** Raio do círculo dos partidos no centro (unidades do grafo). */
export const CORE_RADIUS = 520;

/** Espaço mínimo entre dois partidos vizinhos no círculo do núcleo. */
export const PARTY_GAP = 60;

/** Fração da faixa de órbita que pode ser ocupada por áreas (empacotamento de círculos). */
export const PACKING = 0.4;

/** Área reservada de uma ponte = BRIDGE_BASE + AREA_PER_MEMBER × √(nº de entidades). */
export const BRIDGE_BASE = 60;

/**
 * Relaxação das áreas: passos COM puxão para a faixa (o layout de sempre),
 * depois passos SÓ de afastamento até não sobrar sobreposição (máximo), com
 * tolerância em unidades do grafo. Medir durante o puxão não serve: ele
 * reintroduz sobreposição a cada passo.
 */
const RELAX_PULL_ITERS = 300;
const RELAX_SETTLE_ITERS = 1000;
const RELAX_TOLERANCE = 1;
/** Se sobrar sobreposição, as faixas crescem por este fator (até RELAX_MAX_GROWTHS vezes). */
const RELAX_GROWTH = 1.1;
const RELAX_MAX_GROWTHS = 3;

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
export const AREA_GAP = 120;

/**
 * Folga extra (só na relaxação, não para as luas) reservada em volta de cada
 * esquema para o rótulo, que fica abaixo do círculo.
 */
export const AREA_LABEL_PAD = 90;

/**
 * Força que prende as luas na área do seu esquema (0..1) e que puxa as
 * entidades compartilhadas para o meio dos seus esquemas.
 */
export const TETHER_STRENGTH = 0.08;

/** Mola que prende cada esquema (flutuante) ao seu alvo: fração da distância por passo (0..1). */
export const SCHEME_ANCHOR_STRENGTH = 0.15;

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
  /**
   * Só entidades compartilhadas com ponte: raio da ponte e deslocamento do
   * centro dela em relação à média das posições dos seus esquemas.
   */
  bridge?: { r: number; dx: number; dy: number };
}

/**
 * Geometria EFETIVA do último layout calculado (os pisos acima, ampliados
 * conforme os dados). Lida pelo desenho do chão 2.5D e do funil.
 */
export const layoutGeometry = { coreR: CORE_RADIUS, laneNear: LANE_NEAR, laneFar: LANE_FAR };

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
  //    O círculo cresce se os partidos não couberem lado a lado.
  const partyR = getNodeRadius('party');
  const coreR = Math.max(CORE_RADIUS, (parties.length * (2 * partyR + PARTY_GAP)) / (2 * Math.PI));
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
  // A ordem é calculada uma vez e reaproveitada enquanto todos os partidos
  // visíveis já estiverem nela: filtros e o slider de ano não reembaralham o
  // núcleo (e não pagam a busca de novo a cada passo).
  const order = [...parties];
  const known = cachedPartyOrder && parties.every((p) => cachedPartyOrder!.includes(p.id));
  if (known) {
    const rank = new Map(cachedPartyOrder!.map((id, i) => [id, i]));
    order.sort((a, b) => rank.get(a.id)! - rank.get(b.id)!);
  } else if (order.length > 2) {
    // Busca local: troca dois partidos de lugar e mantém a troca se o custo
    // não piorar. São milhares de avaliações, então `searchCost` faz a mesma
    // conta de antes (direção de cada esquema, maior arco vazio + desequilíbrio) sem alocar nada: índices em vez de ids, senos e
    // cossenos das posições pré-calculados, e a posição de cada partido
    // atualizada só nas duas trocas. Mesmas operações, na mesma ordem: o
    // resultado é idêntico ao de `cost` (antes, ~70 ms por carga num PC rápido).
    const partyIndex = new Map(order.map((p, i) => [p.id, i]));
    const slotCos = order.map((_, i) => Math.cos(slot(i)));
    const slotSin = order.map((_, i) => Math.sin(slot(i)));
    const slotOf = Int32Array.from(order.keys()); // partido (índice original) → posição atual
    const schemePartyIdx = schemes.map((s) => schemeParties.get(s.id)!.map((p) => partyIndex.get(p)!));
    const fixedAng = schemes.map((s) => hashUnit(s.id) * 2 * Math.PI);
    const angles = new Float64Array(schemes.length);
    const searchCost = () => {
      for (let k = 0; k < schemes.length; k++) {
        const ps = schemePartyIdx[k];
        if (!ps.length) { angles[k] = fixedAng[k]; continue; }
        let vx = 0;
        let vy = 0;
        for (const p of ps) {
          vx += slotCos[slotOf[p]];
          vy += slotSin[slotOf[p]];
        }
        angles[k] = Math.atan2(vy, vx);
      }
      const a = angles.sort();
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
    const swap = (i: number, j: number) => {
      [order[i], order[j]] = [order[j], order[i]];
      slotOf[partyIndex.get(order[i].id)!] = i;
      slotOf[partyIndex.get(order[j].id)!] = j;
    };
    const rnd = seeded(order.length * 7919 + schemes.length);
    let best = searchCost();
    for (let it = 0; it < 4000; it++) {
      const i = Math.floor(rnd() * order.length);
      const j = Math.floor(rnd() * order.length);
      if (i === j) continue;
      swap(i, j);
      const c = searchCost();
      if (c <= best) best = c;
      else swap(i, j);
    }
    cachedPartyOrder = order.map((p) => p.id);
  }
  order.forEach((p, i) => targets.set(p.id, { x: coreR * Math.cos(slot(i)), y: coreR * Math.sin(slot(i)) }));

  // 5. Áreas (esquemas + pontes): alvo na faixa de órbita, depois afasta
  //    sobreposições entre áreas e do núcleo (geometria pura, barata).
  //    Pontes: entidades compartilhadas pelo mesmo conjunto de esquemas.
  const bridgeGroups = new Map<string, { homes: string[]; ids: string[] }>();
  for (const [id, hs] of home) {
    if (hs.length < 2) continue;
    const key = [...hs].sort().join('|');
    const g = bridgeGroups.get(key) ?? { homes: [...hs].sort(), ids: [] };
    g.ids.push(id);
    bridgeGroups.set(key, g);
  }
  const bridges = [...bridgeGroups.entries()]
    .filter(([, g]) => g.ids.length >= 2)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, g]) => ({ key, ...g, r: BRIDGE_BASE + AREA_PER_MEMBER * Math.sqrt(g.ids.length) }));

  const dirs = directions(order);
  const maxArea = Math.max(0, ...area.values());
  const laneNear = Math.max(LANE_NEAR, coreR + CORE_GAP + maxArea + AREA_LABEL_PAD);
  const areaSum = [...[...area.values()].map((a) => a + AREA_LABEL_PAD), ...bridges.map((b) => b.r)].reduce((a, r) => a + (r + AREA_GAP / 2) ** 2, 0);
  const laneFar = Math.max(LANE_FAR, laneNear + 1, Math.sqrt(laneNear ** 2 + areaSum / PACKING));
  layoutGeometry.coreR = coreR;
  layoutGeometry.laneNear = laneNear;
  layoutGeometry.laneFar = laneFar;

  interface Item { id: string; tx: number; ty: number; x: number; y: number; r: number; a?: number; homes?: string[] }
  const pos: Item[] = schemes.map((s, i) => {
    const lane = laneNear + (laneFar - laneNear) * dirs[i].focus;
    return { id: s.id, tx: lane * Math.cos(dirs[i].ang), ty: lane * Math.sin(dirs[i].ang), x: 0, y: 0, r: area.get(s.id)! + AREA_LABEL_PAD, a: area.get(s.id)! };
  });
  pos.forEach((p) => ((p.x = p.tx), (p.y = p.ty)));
  const schemeItems = new Map(pos.map((p) => [p.id, p]));
  const bridgeItems: Item[] = bridges.map((b) => {
    const hs = b.homes.map((h) => schemeItems.get(h)).filter(Boolean) as Item[];
    const cx = hs.reduce((a, h) => a + h.tx, 0) / hs.length;
    const cy = hs.reduce((a, h) => a + h.ty, 0) / hs.length;
    return { id: `bridge:${b.key}`, tx: cx, ty: cy, x: cx, y: cy, r: b.r, homes: b.homes };
  });
  const items = [...pos, ...bridgeItems];
  const relax = (iterations: number, pull: boolean): number => {
    let overlap = Infinity;
    for (let it = 0; it < iterations && !(!pull && overlap < RELAX_TOLERANCE); it++) {
      if (pull) for (const p of pos) {
        p.x += (p.tx - p.x) * 0.02;
        p.y += (p.ty - p.y) * 0.02;
      }
      // Pontes seguem a média dos seus esquemas (que se afastam uns dos outros).
      if (pull) for (const b of bridgeItems) {
        const hs = b.homes!.map((h) => schemeItems.get(h)!);
        b.x += (hs.reduce((a, h) => a + h.x, 0) / hs.length - b.x) * 0.1;
        b.y += (hs.reduce((a, h) => a + h.y, 0) / hs.length - b.y) * 0.1;
      }
      overlap = 0;
      for (let i = 0; i < items.length; i++) {
        for (let j = i + 1; j < items.length; j++) {
          const a = items[i];
          const b = items[j];
          const min = a.r + b.r + AREA_GAP;
          const dx = b.x - a.x || 0.01;
          if (dx > min || dx < -min) continue; // longe demais (barato; evita o hypot)
          const dy = b.y - a.y;
          if (dy > min || dy < -min) continue;
          const dist = Math.hypot(dx, dy);
          if (dist < min) {
            overlap = Math.max(overlap, min - dist);
            const k = ((min - dist) / dist) * 0.5;
            a.x -= dx * k;
            a.y -= dy * k;
            b.x += dx * k;
            b.y += dy * k;
          }
        }
      }
      for (const p of items) {
        const dist = Math.hypot(p.x, p.y) || 1;
        const min = coreR + CORE_GAP + p.r;
        if (dist < min) {
          overlap = Math.max(overlap, min - dist);
          p.x *= min / dist;
          p.y *= min / dist;
        }
      }
    }
    return overlap;
  };
  // Se o limite de passos não bastar, amplia as faixas e continua de onde parou.
  relax(RELAX_PULL_ITERS, true);
  let overlap = relax(RELAX_SETTLE_ITERS, false);
  for (let g = 0; g < RELAX_MAX_GROWTHS && overlap >= RELAX_TOLERANCE; g++) {
    pos.forEach((p) => ((p.tx *= RELAX_GROWTH), (p.ty *= RELAX_GROWTH)));
    layoutGeometry.laneFar *= RELAX_GROWTH;
    relax(RELAX_PULL_ITERS, true);
    overlap = relax(RELAX_SETTLE_ITERS, false);
  }
  pos.forEach((p) => targets.set(p.id, { x: p.x, y: p.y, area: p.a }));
  const bridgeOf = new Map<string, { item: Item; dx: number; dy: number }>();
  for (const b of bridgeItems) {
    const hs = b.homes!.map((h) => schemeItems.get(h)!);
    const dx = b.x - hs.reduce((a, h) => a + h.x, 0) / hs.length;
    const dy = b.y - hs.reduce((a, h) => a + h.y, 0) / hs.length;
    const g = bridgeGroups.get(b.id.slice('bridge:'.length))!;
    g.ids.forEach((id) => bridgeOf.set(id, { item: b, dx, dy }));
  }

  // 6. Demais entidades: luas espalhadas dentro da área do seu esquema;
  //    compartilhadas, no meio dos seus esquemas.
  for (const n of nodes) {
    if (targets.has(n.id)) continue;
    const hs = (home.get(n.id) ?? []).filter((h) => targets.has(h));
    if (!hs.length) {
      const a = hashUnit(n.id) * 2 * Math.PI;
      targets.set(n.id, { x: (coreR + 300) * Math.cos(a), y: (coreR + 300) * Math.sin(a), home: [] });
      continue;
    }
    if (hs.length === 1) {
      const s = targets.get(hs[0])!;
      const sr = getNodeRadius('scheme', byId.get(hs[0]) as any);
      const a = hashUnit(n.id) * 2 * Math.PI;
      const d = sr + 40 + (s.area! - sr - 60) * (0.35 + 0.5 * hashUnit(`${n.id}#r`));
      targets.set(n.id, { x: s.x + d * Math.cos(a), y: s.y + d * Math.sin(a), home: hs });
    } else {
      const br = bridgeOf.get(n.id);
      if (br && hs.length === (home.get(n.id) ?? []).length) {
        // Dentro da área reservada da ponte.
        const a = hashUnit(n.id) * 2 * Math.PI;
        const d = (br.item.r - 30) * 0.8 * Math.sqrt(hashUnit(`${n.id}#r`));
        targets.set(n.id, {
          x: br.item.x + d * Math.cos(a),
          y: br.item.y + d * Math.sin(a),
          home: hs,
          bridge: { r: br.item.r, dx: br.dx, dy: br.dy },
        });
        continue;
      }
      const cx = hs.reduce((acc, h) => acc + targets.get(h)!.x, 0) / hs.length;
      const cy = hs.reduce((acc, h) => acc + targets.get(h)!.y, 0) / hs.length;
      targets.set(n.id, { x: cx, y: cy, home: hs });
    }
  }
  return targets;
}

/**
 * Posiciona os nós: PARTIDOS FIXOS no alvo (fx/fy) — sempre, para acompanhar
 * mudanças de filtro. Esquemas FLUTUAM, presos ao alvo por uma mola
 * (forceSchemeAreas): nascem no alvo na 1ª vez e, depois, as forças os levam ao
 * novo lugar com animação; um esquema que ficou fixo por arraste é solto aqui.
 * Os demais nascem no alvo só na 1ª vez.
 */
export function seedPositions(nodes: GraphNode[], targets: Map<string, LayoutTarget>) {
  for (const n of nodes) {
    const t = targets.get(n.id);
    if (!t) continue;
    if (n.type === 'party') {
      n.x = n.fx = t.x;
      n.y = n.fy = t.y;
    } else if (n.type === 'scheme') {
      n.fx = n.fy = undefined;
      if (typeof n.x !== 'number' || typeof n.y !== 'number') {
        n.x = t.x;
        n.y = t.y;
      }
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
        let cx = hs.reduce((a: number, h: any) => a + h.x, 0) / hs.length;
        let cy = hs.reduce((a: number, h: any) => a + h.y, 0) / hs.length;
        const br = targets.get(n.id)?.bridge;
        if (br) {
          // Prende na área reservada da ponte (segue os esquemas se arrastados).
          cx += br.dx;
          cy += br.dy;
          const dx = n.x - cx;
          const dy = n.y - cy;
          const dist = Math.hypot(dx, dy) || 1;
          const max = br.r - getNodeRadius(n.type, n) - 10;
          if (dist > max) {
            const k = (dist - max) / dist;
            n.x -= dx * k;
            n.y -= dy * k;
          }
        }
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
 * Esquemas flutuantes: cada um é puxado ao seu alvo (direção dos partidos e
 * faixa de órbita; esquema sem partido tem ângulo estável, então não se solta)
 * e as áreas protegidas de dois esquemas, e do núcleo, nunca se sobrepõem —
 * calculado a cada passo, sobre as posições atuais. Ajusta x/y direto (como
 * forceTether), sem depender do alpha: o esquema chega ao alvo em ~20 passos.
 * Esquema fixo (arrastado pelo usuário) não é movido, mas empurra os outros.
 * As ligações e a repulsão não movem esquemas (velocidade zerada a cada passo).
 */
function forceSchemeAreas(targets: Map<string, LayoutTarget>) {
  let schemes: any[] = [];
  const force: any = () => {
    for (const s of schemes) {
      // Só a mola e a separação movem o esquema: o puxão das ligações e a
      // repulsão (que somam em dezenas de luas) são descartados. Esta força
      // roda depois das demais, antes da integração das velocidades.
      s.vx = 0;
      s.vy = 0;
      const t = targets.get(s.id);
      if (!t || typeof s.fx === 'number') continue;
      s.x += (t.x - s.x) * SCHEME_ANCHOR_STRENGTH;
      s.y += (t.y - s.y) * SCHEME_ANCHOR_STRENGTH;
    }
    const radius = (s: any) => (targets.get(s.id)?.area ?? 0) + AREA_LABEL_PAD;
    for (let i = 0; i < schemes.length; i++) {
      for (let j = i + 1; j < schemes.length; j++) {
        const a = schemes[i];
        const b = schemes[j];
        const min = radius(a) + radius(b) + AREA_GAP;
        const dx = b.x - a.x || 0.01;
        if (dx > min || dx < -min) continue;
        const dy = b.y - a.y;
        if (dy > min || dy < -min) continue;
        const dist = Math.hypot(dx, dy);
        if (dist >= min) continue;
        const aFixed = typeof a.fx === 'number';
        const bFixed = typeof b.fx === 'number';
        if (aFixed && bFixed) continue;
        const k = (min - dist) / dist;
        const wa = aFixed ? 0 : bFixed ? 1 : 0.5;
        const wb = bFixed ? 0 : aFixed ? 1 : 0.5;
        a.x -= dx * k * wa;
        a.y -= dy * k * wa;
        b.x += dx * k * wb;
        b.y += dy * k * wb;
      }
    }
    for (const s of schemes) {
      if (typeof s.fx === 'number') continue;
      const dist = Math.hypot(s.x, s.y) || 1;
      const min = layoutGeometry.coreR + CORE_GAP + radius(s);
      if (dist < min) {
        s.x *= min / dist;
        s.y *= min / dist;
      }
    }
  };
  force.initialize = (ns: any[]) => {
    schemes = ns.filter((n) => n.type === 'scheme');
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
      if (typeof n.fx === 'number' || n.type === 'scheme') continue;
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
      // 1 passada por passo: colisão e repulsão são ~metade do custo da física
      // cada; com 2 passadas o passo custava ~25% a mais e o resultado final
      // (dados de nov/2026) era o mesmo: nenhum círculo sobreposto.
      .iterations(targets.size > 800 ? 2 : 1)
  );
  setForce('tether', forceTether(targets));
  setForce('schemeAreas', forceSchemeAreas(targets));

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

/**
 * PRÉ-AQUECIMENTO — roda os primeiros passos da física numa simulação própria,
 * em pedaços de `chunk` passos com uma pausa entre eles (o navegador responde
 * a cliques e desenha no meio). Antes, a biblioteca rodava todos os passos de
 * aquecimento de uma vez, numa tarefa só (~100 ms num PC rápido, ~0,5 s num
 * celular). Mexe nos próprios nós (x, y, vx, vy): a biblioteca continua de onde
 * esta simulação parou. Mesmas forças de applyLayoutForces e o mesmo atrito.
 * Para no meio se `signal.aborted` (dados trocados antes de terminar).
 */
export async function prewarmLayout(
  nodes: GraphNode[],
  links: GraphLink[],
  targets: Map<string, LayoutTarget>,
  ticks: number,
  opts: { alphaDecay: number; velocityDecay: number; chunk?: number; signal?: { aborted: boolean } }
): Promise<void> {
  if (!nodes.length || ticks <= 0) return;
  const sim = forceSimulation(nodes as any)
    .force('link', forceLink(links as any).id((d: any) => d.id))
    .alphaDecay(opts.alphaDecay)
    .velocityDecay(opts.velocityDecay)
    .stop();
  applyLayoutForces((name, force) => (force === undefined ? sim.force(name) : sim.force(name, force as any)), targets, false);
  const chunk = opts.chunk ?? 4;
  for (let done = 0; done < ticks; done += chunk) {
    if (opts.signal?.aborted) break;
    sim.tick(Math.min(chunk, ticks - done));
    await new Promise((r) => setTimeout(r, 0));
  }
  sim.stop();
}

/** Ligação com um partido? (desenhadas só sob demanda; ver NetworkGraph) */
export const isPartyLink = (l: any) => isParty(l.source) || isParty(l.target);

