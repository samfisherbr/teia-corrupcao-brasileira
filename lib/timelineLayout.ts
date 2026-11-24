/**
 * ============================================================================
 * LAYOUT "LINHA DO TEMPO" (alternativa à teia; ver NetworkGraph, interruptor
 * "Linha do tempo")
 * ============================================================================
 *
 * Função pura: dados (nós + ligações + quais esquemas estão abertos) → posição
 * de cada nó. Não mexe na física: o NetworkGraph só mistura, a cada quadro, a
 * posição da teia com esta (a mesma ideia do 2.5D), então voltar à teia deixa
 * cada nó exatamente onde estava.
 *
 *   • Eixo horizontal = anos (YEAR_PX unidades do grafo por ano), em y = 0.
 *   • Cada ESQUEMA é um círculo no MEIO do seu período (scheme_timelines:
 *     início → fim), acima ou abaixo do eixo, em "níveis" que nunca se
 *     sobrepõem. A faixa do período aparece sobre o eixo (`bars`).
 *   • As demais entidades ficam RECOLHIDAS dentro do círculo do seu esquema
 *     (`visible: false`). Clicar num esquema o ABRE (`expanded`): as entidades
 *     dele se abrem em leque, em anéis, no lado oposto ao eixo.
 *   • Entidade em vários esquemas: um só nó (no 1º esquema aberto, ou no 1º
 *     esquema de todos se nenhum estiver aberto) e uma cópia "fantasma" em
 *     cada outro esquema aberto, ligada por uma linha pontilhada (`twins`).
 *   • Esquema sem datas (nem em scheme_timelines, nem nos anos das ligações)
 *     vai para uma faixa "sem data" depois do último ano.
 *
 * Determinístico: mesmos dados e mesmos esquemas abertos → mesmo layout.
 * ============================================================================
 */
import type { GraphLink, GraphNode } from '@/types/graph';
import { getLinkEnds, getNodeRadius } from '@/lib/graphConfig';

/* ---------------------------------------------------------------------------
 * PARÂMETROS AJUSTÁVEIS (unidades do grafo)
 * ------------------------------------------------------------------------- */

/** Largura de um ano no eixo. ↑ = esquemas mais afastados. */
export const YEAR_PX = 420;
/** Distância do eixo ao centro do nível 0. */
export const AXIS_GAP = 620;
/** Folga entre níveis, além do diâmetro do maior esquema. */
export const LEVEL_PAD = 220;
/** Quantos níveis de cada lado antes de empilhar o excedente. */
export const MAX_LEVELS = 8;
/** Folga horizontal em volta de cada esquema fechado. */
export const SCHEME_PAD = 90;
/** Leque de um esquema aberto: 1º anel (além do círculo), passo entre anéis, ângulo (± graus). */
export const FAN_FIRST = 110;
export const FAN_STEP = 190;
export const FAN_SPREAD_DEG = 80;
/** Espaço extra entre entidades no anel. */
export const FAN_ITEM_PAD = 36;
/** Anos de folga antes do 1º e depois do último, e largura da faixa "sem data". */
export const YEAR_MARGIN = 1;
export const UNDATED_YEARS = 2;

const TYPE_ORDER: Record<string, number> = { party: 0, politician: 1, operator: 2, company: 3 };

/* ---------------------------------------------------------------------------
 * TIPOS
 * ------------------------------------------------------------------------- */

export interface TimelinePos {
  x: number;
  y: number;
  /** false = recolhido dentro do círculo do esquema (some). */
  visible: boolean;
}

export interface TimelineLayout {
  pos: Map<string, TimelinePos>;
  /** Entidade → esquema onde ela está (aberto, se houver; senão o 1º dela). */
  host: Map<string, string>;
  /** Faixa do período de cada esquema sobre o eixo. */
  bars: { id: string; x0: number; x1: number; startYear: number; endYear: number }[];
  /** Cópias de uma entidade em outros esquemas abertos + a linha até o nó real. */
  twins: { entityId: string; type: string; x: number; y: number; hostX: number; hostY: number }[];
  axis: { y: number; x0: number; x1: number; minYear: number; maxYear: number };
  /** Caixa que contém tudo que está visível (para enquadrar a câmera). */
  bounds: { minX: number; maxX: number; minY: number; maxY: number };
}

/* ---------------------------------------------------------------------------
 * DATAS
 * ------------------------------------------------------------------------- */

/** 'AAAA', 'AAAA-MM' ou 'AAAA-MM-DD' → ano com fração; `end` soma 1 unidade da precisão (fim inclusivo). */
export function dateToYear(date: string, end = false): number {
  const [y, m, d] = date.split('-').map(Number);
  if (m == null || Number.isNaN(m)) return y + (end ? 1 : 0);
  if (d == null || Number.isNaN(d)) return y + (m - 1) / 12 + (end ? 1 / 12 : 0);
  return y + (m - 1) / 12 + (d - 1) / 365 + (end ? 1 / 365 : 0);
}

/** Período do esquema em anos: scheme_timelines, senão min/max dos anos das ligações; null se nada. */
function schemePeriod(s: GraphNode, linkYears: number[] | undefined): [number, number] | null {
  if (s.timeline?.start && s.timeline?.end) {
    const a = dateToYear(s.timeline.start.date);
    const b = dateToYear(s.timeline.end.date, true);
    return [a, Math.max(b, a + 1 / 12)];
  }
  if (linkYears && linkYears.length) {
    const a = Math.min(...linkYears);
    return [a, Math.max(...linkYears) + 1];
  }
  return null;
}

/* ---------------------------------------------------------------------------
 * CÁLCULO
 * ------------------------------------------------------------------------- */

export function computeTimelineLayout(
  nodes: GraphNode[],
  links: GraphLink[],
  expanded: ReadonlySet<string>
): TimelineLayout {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const nb = new Map<string, Set<string>>(nodes.map((n) => [n.id, new Set()]));
  const linkYears = new Map<string, number[]>();
  for (const l of links) {
    const { sourceId, targetId } = getLinkEnds(l);
    if (!byId.has(sourceId) || !byId.has(targetId)) continue;
    nb.get(sourceId)!.add(targetId);
    nb.get(targetId)!.add(sourceId);
    const y = Number(l.year);
    if (Number.isFinite(y) && y > 0) {
      for (const id of [sourceId, targetId]) {
        const arr = linkYears.get(id) ?? [];
        arr.push(y);
        linkYears.set(id, arr);
      }
    }
  }
  const type = (id: string) => byId.get(id)?.type;

  /* 1. Períodos e eixo. */
  const schemes = nodes.filter((n) => n.type === 'scheme').sort((a, b) => a.id.localeCompare(b.id));
  const period = new Map<string, [number, number] | null>(
    schemes.map((s) => {
      // Ligações do esquema e dos vizinhos dele (ex.: o ano de uma doação) dão o período de reserva.
      const ys = [...(linkYears.get(s.id) ?? [])];
      return [s.id, schemePeriod(s, ys)];
    })
  );
  const dated = [...period.values()].filter((p): p is [number, number] => !!p);
  const minYear = dated.length ? Math.floor(Math.min(...dated.map((p) => p[0]))) - YEAR_MARGIN : 1989;
  const maxDated = dated.length ? Math.ceil(Math.max(...dated.map((p) => p[1]))) + YEAR_MARGIN : 2026;
  const undatedAt = maxDated + UNDATED_YEARS / 2;
  const xOf = (year: number) => (year - minYear) * YEAR_PX;
  const mid = (id: string) => {
    const p = period.get(id);
    return p ? (p[0] + p[1]) / 2 : undatedAt;
  };
  const maxYear = schemes.some((s) => !period.get(s.id)) ? maxDated + UNDATED_YEARS : maxDated;

  /* 2. Esquemas de cada entidade (ordem: início do esquema). */
  const startOf = (id: string) => period.get(id)?.[0] ?? Infinity;
  const schemeOrder = (ids: Iterable<string>) => [...new Set(ids)].sort((a, b) => startOf(a) - startOf(b) || a.localeCompare(b));
  const homes = new Map<string, string[]>();
  for (const n of nodes) {
    if (n.type === 'scheme') continue;
    const direct = [...nb.get(n.id)!].filter((x) => type(x) === 'scheme');
    homes.set(n.id, direct);
  }
  for (const n of nodes) {
    if (n.type === 'scheme' || homes.get(n.id)!.length) continue;
    // Sem esquema direto (ex.: partido, operador → empresa → esquema): herda dos vizinhos.
    const inherited = new Set<string>();
    nb.get(n.id)!.forEach((x) => (homes.get(x) ?? []).forEach((s) => inherited.add(s)));
    homes.set(n.id, [...inherited]);
  }
  for (const [id, hs] of homes) homes.set(id, schemeOrder(hs));

  /* 3. Posição dos esquemas: níveis acima/abaixo do eixo, sem sobreposição. */
  const radius = (s: GraphNode) => getNodeRadius('scheme', s as any);
  const maxR = schemes.length ? Math.max(...schemes.map(radius)) : 100;
  const levelGap = 2 * maxR + LEVEL_PAD;

  // Membros de cada esquema, em ordem estável (tipo, rótulo) — o leque os distribui nessa ordem.
  const members = new Map<string, string[]>(schemes.map((s) => [s.id, []]));
  for (const [id, hs] of homes) for (const h of hs) members.get(h)?.push(id);
  members.forEach((ids) =>
    ids.sort(
      (a, b) =>
        (TYPE_ORDER[type(a) ?? ''] ?? 9) - (TYPE_ORDER[type(b) ?? ''] ?? 9) ||
        byId.get(a)!.label.localeCompare(byId.get(b)!.label, 'pt-BR')
    )
  );

  /** Leque: posições relativas ao centro do esquema, para `count` itens, no sentido `dir` (-1 = para cima, 1 = para baixo). */
  const fanSlots = (s: GraphNode, ids: string[], dir: number) => {
    const slots: { id: string; dx: number; dy: number }[] = [];
    const r0 = radius(s);
    const spread = (FAN_SPREAD_DEG * Math.PI) / 180;
    let i = 0;
    let ring = 0;
    let outer = r0 + FAN_FIRST;
    while (i < ids.length) {
      const rho = r0 + FAN_FIRST + ring * FAN_STEP;
      const arc = 2 * spread * rho;
      const width = (id: string) => 2 * getNodeRadius(type(id) ?? 'company') + FAN_ITEM_PAD;
      // Quantos cabem neste anel: soma das larguras (cada tipo tem o seu raio) até esgotar o arco.
      let used = 0;
      let take = 0;
      while (i + take < ids.length && (take === 0 || used + width(ids[i + take]) <= arc + width(ids[i + take]) * 0.5)) {
        used += width(ids[i + take]);
        take++;
      }
      // Distribui pelo arco proporcionalmente à largura de cada um.
      const span = Math.min(arc, used);
      let acc = 0;
      for (let k = 0; k < take; k++) {
        const w = width(ids[i + k]);
        const th = take === 1 ? 0 : -spread + ((acc + w / 2) / used) * (2 * spread * (span / arc)) + spread * (1 - span / arc);
        slots.push({ id: ids[i + k], dx: rho * Math.sin(th), dy: dir * rho * Math.cos(th) });
        acc += w;
      }
      outer = rho;
      i += take;
      ring++;
    }
    return { slots, outer };
  };

  const occ: Record<string, [number, number][][]> = { '-1': [], '1': [] };
  for (const sd of ['-1', '1']) for (let l = 0; l < MAX_LEVELS; l++) occ[sd].push([]);
  const free = (sd: number, lv: number, a: number, b: number) => !occ[String(sd)][lv].some(([p, q]) => a < q && b > p);
  const placed = new Map<string, { x: number; y: number; sd: number; lv: number }>();
  const sorted = [...schemes].sort((a, b) => mid(a.id) - mid(b.id) || a.id.localeCompare(b.id));
  const prefSide = new Map(sorted.map((s, i) => [s.id, i % 2 ? 1 : -1]));
  const spill = { '-1': 0, '1': 0 } as Record<string, number>;
  const put = (s: GraphNode, sd: number, lv: number) =>
    placed.set(s.id, { x: xOf(mid(s.id)), y: sd * (AXIS_GAP + lv * levelGap), sd, lv });

  // Abertos primeiro: cada um reserva a coluna inteira do seu lado (o leque ocupa vários níveis).
  for (const s of sorted.filter((s) => expanded.has(s.id))) {
    const x = xOf(mid(s.id));
    const sd0 = prefSide.get(s.id)!;
    const hw = fanSlots(s, members.get(s.id)!, sd0).outer * Math.sin((FAN_SPREAD_DEG * Math.PI) / 180) + 140;
    let done = false;
    for (const sd of [sd0, -sd0]) {
      if (Array.from({ length: MAX_LEVELS }, (_, l) => l).every((l) => free(sd, l, x - hw, x + hw))) {
        for (let l = 0; l < MAX_LEVELS; l++) occ[String(sd)][l].push([x - hw, x + hw]);
        put(s, sd, 0);
        done = true;
        break;
      }
    }
    if (!done) put(s, sd0, MAX_LEVELS + spill[String(sd0)]++);
  }
  // Fechados: o primeiro nível livre (a haste até a faixa passa por trás dos círculos dos níveis abaixo).
  for (const s of sorted.filter((s) => !expanded.has(s.id))) {
    const x = xOf(mid(s.id));
    const hw = radius(s) + SCHEME_PAD;
    let done = false;
    for (let lv = 0; lv < MAX_LEVELS && !done; lv++) {
      for (const sd of [prefSide.get(s.id)!, -prefSide.get(s.id)!]) {
        if (free(sd, lv, x - hw, x + hw)) {
          occ[String(sd)][lv].push([x - hw, x + hw]);
          put(s, sd, lv);
          done = true;
          break;
        }
      }
    }
    if (!done) {
      const sd = prefSide.get(s.id)!;
      put(s, sd, MAX_LEVELS + spill[String(sd)]++);
    }
  }

  /* 4. Entidades: leque nos esquemas abertos; recolhidas nos fechados. */
  const pos = new Map<string, TimelinePos>();
  const bounds = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity };
  const grow = (x: number, y: number, r: number) => {
    bounds.minX = Math.min(bounds.minX, x - r);
    bounds.maxX = Math.max(bounds.maxX, x + r);
    bounds.minY = Math.min(bounds.minY, y - r);
    bounds.maxY = Math.max(bounds.maxY, y + r);
  };
  const bars: TimelineLayout['bars'] = [];
  const slotOf = new Map<string, Map<string, { x: number; y: number }>>(); // esquema → entidade → posição no leque
  for (const s of schemes) {
    const p = placed.get(s.id)!;
    pos.set(s.id, { x: p.x, y: p.y, visible: true });
    grow(p.x, p.y, radius(s));
    const per = period.get(s.id);
    // endYear: o período termina no ÚLTIMO ano coberto (o fim é inclusivo: 2005 vira 2006 no cálculo).
    if (per) bars.push({ id: s.id, x0: xOf(per[0]), x1: xOf(per[1]), startYear: Math.floor(per[0] + 1e-9), endYear: Math.floor(per[1] - 1e-4) });
    if (expanded.has(s.id)) {
      const { slots } = fanSlots(s, members.get(s.id)!, p.sd);
      const m = new Map<string, { x: number; y: number }>();
      for (const sl of slots) {
        m.set(sl.id, { x: p.x + sl.dx, y: p.y + sl.dy });
        grow(p.x + sl.dx, p.y + sl.dy, getNodeRadius(type(sl.id) ?? 'company'));
      }
      slotOf.set(s.id, m);
    }
  }

  const twins: TimelineLayout['twins'] = [];
  const hostOf = new Map<string, string>();
  for (const n of nodes) {
    if (n.type === 'scheme') continue;
    const hs = homes.get(n.id) ?? [];
    if (!hs.length) {
      // Sem esquema na tela (filtro): fica onde está, apagado (o chamador usa a posição da teia).
      continue;
    }
    const host = hs.find((h) => expanded.has(h));
    hostOf.set(n.id, host ?? hs[0]);
    if (host) {
      const slot = slotOf.get(host)!.get(n.id)!;
      pos.set(n.id, { x: slot.x, y: slot.y, visible: true });
      for (const other of hs) {
        if (other === host || !expanded.has(other)) continue;
        const g = slotOf.get(other)!.get(n.id);
        if (g) twins.push({ entityId: n.id, type: n.type, x: g.x, y: g.y, hostX: slot.x, hostY: slot.y });
      }
    } else {
      const c = placed.get(hs[0])!;
      pos.set(n.id, { x: c.x, y: c.y, visible: false });
    }
  }

  if (!Number.isFinite(bounds.minX)) Object.assign(bounds, { minX: 0, maxX: 1, minY: -1, maxY: 1 });
  bounds.minX = Math.min(bounds.minX, xOf(minYear));
  bounds.maxX = Math.max(bounds.maxX, xOf(maxYear));
  bounds.minY = Math.min(bounds.minY, 0);
  bounds.maxY = Math.max(bounds.maxY, 0);

  return { pos, host: hostOf, bars, twins, axis: { y: 0, x0: xOf(minYear), x1: xOf(maxYear), minYear, maxYear }, bounds };
}
