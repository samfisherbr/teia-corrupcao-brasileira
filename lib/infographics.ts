/**
 * Cálculos puros dos Infográficos (sem React): funil, linha do tempo, composição
 * dos esquemas, presidentes e treemap. Os componentes ficam em
 * components/infographics/. Tudo é calculado a partir dos dados completos do
 * grafo; nada é fixo no código, exceto a lista de presidentes.
 */
import { getLinkEnds } from '@/lib/graphConfig';
import { type EndBasis, type GraphData, type GraphNode, type LinkStatus, type NodeType, type SchemeTimeline } from '@/types/graph';

/* ------------------------------------------------------------------ */
/* Presidentes                                                         */
/* ------------------------------------------------------------------ */

export interface President {
  id: string;
  name: string;
  /** Sigla do partido na posse. */
  party: string;
  /** Ano fracionário (2003.0 = 1º de janeiro de 2003). */
  from: number;
  to: number | null; // null = no cargo
}

/** Fração do ano para 'AAAA-MM-DD'. */
const yf = (y: number, m = 1, d = 1) => y + (m - 1) / 12 + (d - 1) / 365;

/** Presidentes do Brasil desde 1985 (mandatos). Temer assume em definitivo em 31/08/2016. */
export const PRESIDENTS: President[] = [
  { id: 'sarney', name: 'Sarney', party: 'PMDB', from: yf(1985, 3, 15), to: yf(1990, 3, 15) },
  { id: 'collor', name: 'Collor', party: 'PRN', from: yf(1990, 3, 15), to: yf(1992, 12, 29) },
  { id: 'itamar', name: 'Itamar', party: 'PMDB', from: yf(1992, 12, 29), to: yf(1995) },
  { id: 'fhc', name: 'FHC', party: 'PSDB', from: yf(1995), to: yf(2003) },
  { id: 'lula1', name: 'Lula', party: 'PT', from: yf(2003), to: yf(2011) },
  { id: 'dilma', name: 'Dilma', party: 'PT', from: yf(2011), to: yf(2016, 8, 31) },
  { id: 'temer', name: 'Temer', party: 'MDB', from: yf(2016, 8, 31), to: yf(2019) },
  { id: 'bolsonaro', name: 'Bolsonaro', party: 'PSL', from: yf(2019), to: yf(2023) },
  { id: 'lula2', name: 'Lula', party: 'PT', from: yf(2023), to: null },
];

/** Presidentes no cargo entre dois anos fracionários. */
export const presidentsBetween = (a: number, b: number, now: number): President[] =>
  PRESIDENTS.filter((p) => p.from < Math.max(a, b) && (p.to ?? now) > Math.min(a, b));

/* ------------------------------------------------------------------ */
/* Datas                                                               */
/* ------------------------------------------------------------------ */

/** 'AAAA' → meio do ano; 'AAAA-MM' → meio do mês; 'AAAA-MM-DD' → o dia. */
export function dateToYear(date: string): number {
  const [y, m, d] = date.split('-').map(Number);
  if (!m) return y + 0.5;
  if (!d) return y + (m - 1) / 12 + 1 / 24;
  return yf(y, m, d);
}

/* ------------------------------------------------------------------ */
/* Linha do tempo (Gantt)                                              */
/* ------------------------------------------------------------------ */

export interface GanttRow {
  id: string;
  label: string;
  start: number;
  end: number;
  exposed: number | null;
  startBasis: SchemeTimeline['start']['basis'];
  endBasis: EndBasis;
  startDate: string;
  endDate: string;
  exposedDate: string | null;
  exposedBasis: EndBasis | null;
  /** Anos entre início e fim. */
  duration: number;
}

export function buildGantt(nodes: GraphNode[], fallback: (id: string) => SchemeTimeline | null): GanttRow[] {
  const rows: GanttRow[] = [];
  for (const n of nodes) {
    if (n.type !== 'scheme') continue;
    const tl = n.timeline ?? fallback(n.id);
    if (!tl) continue;
    const start = dateToYear(tl.start.date);
    const end = Math.max(start, dateToYear(tl.end.date));
    rows.push({
      id: n.id,
      label: n.label,
      start,
      end,
      exposed: tl.exposed ? dateToYear(tl.exposed.date) : null,
      startBasis: tl.start.basis,
      endBasis: tl.end.basis,
      startDate: tl.start.date,
      endDate: tl.end.date,
      exposedDate: tl.exposed?.date ?? null,
      exposedBasis: tl.exposed?.basis ?? null,
      duration: end - start,
    });
  }
  return rows;
}

/* ------------------------------------------------------------------ */
/* Funil: do nome à condenação                                         */
/* ------------------------------------------------------------------ */

export const FUNNEL_GROUPS = ['politician', 'operator', 'company'] as const;
export type FunnelGroup = (typeof FUNNEL_GROUPS)[number];

export interface FunnelEntry {
  entityId: string;
  schemeId: string;
  group: FunnelGroup;
  /** Status do registro datado mais recente (empate → o mais grave). */
  current: LinkStatus;
  investigated: boolean;
  convictedEver: boolean;
  final: boolean;
}

export type FunnelStageKey = 'named' | 'investigated' | 'convicted' | 'standing' | 'final';
export type FunnelRestKey = 'under_investigation' | 'acquitted' | 'annulled';

type GroupCounts = Record<FunnelGroup, number>;
const zero = (): GroupCounts => ({ politician: 0, operator: 0, company: 0 });

export interface FunnelResult {
  total: number;
  distinct: number;
  stages: { key: FunnelStageKey; counts: GroupCounts; total: number; distinct: number; entries: FunnelEntry[] }[];
  rest: { key: FunnelRestKey; counts: GroupCounts; total: number; entries: FunnelEntry[] }[];
}

const SEVERITY: Record<LinkStatus, number> = {
  confirmed: 0,
  under_investigation: 1,
  convicted_appealing: 2,
  annulled: 3,
  acquitted: 4,
  convicted_final: 5,
};

/**
 * Unidade = uma pessoa ou empresa em UM caso (par entidade × esquema, só
 * vínculos diretos). Estágios: citado → investigado/denunciado/julgado
 * (qualquer status além de "fatos documentados") → condenado em algum momento
 * → condenação ainda de pé (status atual condenado) → trânsito em julgado.
 * "Resto": quem está hoje sob investigação, absolvido ou com condenação anulada.
 */
export function buildFunnel(data: GraphData): FunnelResult {
  const byId = new Map(data.nodes.map((n) => [n.id, n]));
  const pairs = new Map<string, { entityId: string; schemeId: string; group: FunnelGroup; links: GraphData['links'] }>();
  for (const l of data.links) {
    const { sourceId, targetId } = getLinkEnds(l);
    const a = byId.get(sourceId);
    const b = byId.get(targetId);
    if (!a || !b) continue;
    const [scheme, ent] = a.type === 'scheme' ? [a, b] : b.type === 'scheme' ? [b, a] : [null, null];
    if (!scheme || !ent || !(FUNNEL_GROUPS as readonly string[]).includes(ent.type)) continue;
    const key = `${ent.id}|${scheme.id}`;
    const cur = pairs.get(key) ?? { entityId: ent.id, schemeId: scheme.id, group: ent.type as FunnelGroup, links: [] };
    cur.links.push(l);
    pairs.set(key, cur);
  }

  const entries: FunnelEntry[] = [];
  for (const p of pairs.values()) {
    const last = p.links.reduce((best, l) => {
      const by = best.year ?? 0;
      const ly = l.year ?? 0;
      return ly > by || (ly === by && SEVERITY[l.status] > SEVERITY[best.status]) ? l : best;
    });
    const statuses = new Set(p.links.map((l) => l.status));
    entries.push({
      entityId: p.entityId,
      schemeId: p.schemeId,
      group: p.group,
      current: last.status,
      investigated: [...statuses].some((s) => s !== 'confirmed'),
      convictedEver: statuses.has('convicted_appealing') || statuses.has('convicted_final'),
      final: statuses.has('convicted_final'),
    });
  }

  const pack = (list: FunnelEntry[]) => {
    const counts = zero();
    list.forEach((e) => (counts[e.group] += 1));
    return { counts, total: list.length, entries: list };
  };
  const distinct = (list: FunnelEntry[]) => new Set(list.map((e) => e.entityId)).size;
  const stage = (key: FunnelStageKey, list: FunnelEntry[]) => ({ key, ...pack(list), distinct: distinct(list) });

  return {
    total: entries.length,
    distinct: distinct(entries),
    stages: [
      stage('named', entries),
      stage('investigated', entries.filter((e) => e.investigated)),
      stage('convicted', entries.filter((e) => e.convictedEver)),
      stage('standing', entries.filter((e) => e.current === 'convicted_appealing' || e.current === 'convicted_final')),
      stage('final', entries.filter((e) => e.final)),
    ],
    rest: (['under_investigation', 'acquitted', 'annulled'] as const).map((key) => ({
      key,
      ...pack(entries.filter((e) => e.current === key)),
    })),
  };
}

/* ------------------------------------------------------------------ */
/* Quem está em cada esquema                                           */
/* ------------------------------------------------------------------ */

export const COMPOSITION_TYPES = ['politician', 'party', 'company', 'operator'] as const satisfies readonly NodeType[];
export type CompositionType = (typeof COMPOSITION_TYPES)[number];

export interface CompositionRow {
  id: string;
  label: string;
  counts: Record<CompositionType, number>;
  total: number;
  members: Record<CompositionType, GraphNode[]>;
}

/** Entidades distintas ligadas diretamente a cada esquema, por tipo. */
export function buildComposition(data: GraphData): CompositionRow[] {
  const byId = new Map(data.nodes.map((n) => [n.id, n]));
  const sets = new Map<string, Set<string>>();
  for (const l of data.links) {
    const { sourceId, targetId } = getLinkEnds(l);
    const a = byId.get(sourceId);
    const b = byId.get(targetId);
    if (!a || !b) continue;
    if (a.type === 'scheme') (sets.get(a.id) ?? sets.set(a.id, new Set()).get(a.id)!).add(b.id);
    if (b.type === 'scheme') (sets.get(b.id) ?? sets.set(b.id, new Set()).get(b.id)!).add(a.id);
  }
  return data.nodes
    .filter((n) => n.type === 'scheme')
    .map((s) => {
      const members = { politician: [], party: [], company: [], operator: [] } as Record<CompositionType, GraphNode[]>;
      for (const id of sets.get(s.id) ?? []) {
        const n = byId.get(id);
        if (n && (COMPOSITION_TYPES as readonly string[]).includes(n.type)) members[n.type as CompositionType].push(n);
      }
      const counts = Object.fromEntries(COMPOSITION_TYPES.map((t) => [t, members[t].length])) as Record<CompositionType, number>;
      return { id: s.id, label: s.label, counts, total: COMPOSITION_TYPES.reduce((a, t) => a + counts[t], 0), members };
    });
}

/* ------------------------------------------------------------------ */
/* Treemap (squarified)                                                */
/* ------------------------------------------------------------------ */

export interface TreemapRect<T> {
  item: T;
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Treemap "squarified" (Bruls et al.) em um retângulo W×H. `weight` precisa ser
 * > 0; ordene antes do maior para o menor. Devolve retângulos em unidades W/H.
 */
export function squarify<T>(items: T[], weight: (t: T) => number, W: number, H: number): TreemapRect<T>[] {
  const total = items.reduce((a, i) => a + weight(i), 0);
  if (!total || !items.length) return [];
  const scale = (W * H) / total;
  const out: TreemapRect<T>[] = [];
  let x = 0;
  let y = 0;
  let w = W;
  let h = H;
  let row: T[] = [];
  const area = (t: T) => weight(t) * scale;
  const worst = (r: T[], side: number) => {
    const s = r.reduce((a, i) => a + area(i), 0);
    const mx = Math.max(...r.map(area));
    const mn = Math.min(...r.map(area));
    return Math.max((side * side * mx) / (s * s), (s * s) / (side * side * mn));
  };
  const layout = (r: T[]) => {
    const s = r.reduce((a, i) => a + area(i), 0);
    if (w >= h) {
      const rw = s / h;
      let yy = y;
      r.forEach((i) => {
        const rh = area(i) / rw;
        out.push({ item: i, x, y: yy, w: rw, h: rh });
        yy += rh;
      });
      x += rw;
      w -= rw;
    } else {
      const rh = s / w;
      let xx = x;
      r.forEach((i) => {
        const rw = area(i) / rh;
        out.push({ item: i, x: xx, y, w: rw, h: rh });
        xx += rw;
      });
      y += rh;
      h -= rh;
    }
  };
  for (const it of items) {
    const side = Math.min(w, h);
    if (!row.length || worst([...row, it], side) <= worst(row, side)) row.push(it);
    else {
      layout(row);
      row = [it];
    }
  }
  if (row.length) layout(row);
  return out;
}

