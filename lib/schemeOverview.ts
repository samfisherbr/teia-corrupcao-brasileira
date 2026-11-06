/**
 * ============================================================================
 * VISÃO POR ESQUEMAS — transforma o grafo completo num grafo só de esquemas
 * ============================================================================
 * Nós: cada esquema visível. `entityCount` = quantas entidades diferentes
 *      (políticos, partidos, empresas, operadores) estão ligadas a ele
 *      diretamente — é o que define o tamanho do círculo.
 * Links: dois esquemas ficam ligados quando compartilham entidades. `shared`
 *      lista quem eles têm em comum; `weight` = quantos (define a espessura).
 *      Um link direto esquema–esquema no banco também conta (`direct`).
 *
 * Partidos ficam FORA da contagem de "em comum" por padrão (countParties):
 * siglas como PT e MDB aparecem na maioria dos casos e ligariam quase todos
 * os esquemas entre si, virando um novelo de novo. Eles continuam contando
 * no tamanho do círculo.
 *
 * Entrada: os dados JÁ FILTRADOS (ano, tipos, status, busca) da página, então
 * os filtros da barra lateral e da linha do tempo valem aqui também.
 * ============================================================================
 */
import type { GraphData, GraphNode, NodeType } from '@/types/graph';
import { getLinkEnds } from '@/lib/graphConfig';

export interface OverviewNode {
  id: string;
  scheme: GraphNode;
  entityCount: number;
  /** Quantos esquemas estão ligados a este na visão (grau). */
  degree: number;
  // Posições preenchidas pela simulação (d3-force).
  x?: number;
  y?: number;
}

export interface OverviewLink {
  source: string | OverviewNode;
  target: string | OverviewNode;
  shared: GraphNode[];
  weight: number;
  direct: boolean;
}

export interface OverviewOptions {
  /** Partidos contam como "em comum"? Padrão: não (ver cabeçalho). */
  countParties: boolean;
  /** Mínimo de entidades em comum para desenhar a ligação. */
  minShared: number;
}

const TYPE_ORDER: NodeType[] = ['politician', 'operator', 'company', 'party', 'scheme'];

export function computeSchemeOverview(data: GraphData, opts: OverviewOptions): { nodes: OverviewNode[]; links: OverviewLink[] } {
  const byId = new Map(data.nodes.map((n) => [n.id, n]));
  const schemes = data.nodes.filter((n) => n.type === 'scheme');
  const schemeIds = new Set(schemes.map((s) => s.id));

  // Entidades ligadas a cada esquema e esquemas ligados a cada entidade.
  const entitiesOf = new Map<string, Set<string>>(schemes.map((s) => [s.id, new Set()]));
  const schemesOf = new Map<string, Set<string>>();
  const directPairs = new Set<string>();
  const pairKey = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`);

  for (const l of data.links) {
    const { sourceId, targetId } = getLinkEnds(l);
    const sIsScheme = schemeIds.has(sourceId);
    const tIsScheme = schemeIds.has(targetId);
    if (sIsScheme && tIsScheme) {
      if (sourceId !== targetId) directPairs.add(pairKey(sourceId, targetId));
      continue;
    }
    const scheme = sIsScheme ? sourceId : tIsScheme ? targetId : null;
    if (!scheme) continue;
    const entity = scheme === sourceId ? targetId : sourceId;
    if (!byId.has(entity)) continue;
    entitiesOf.get(scheme)!.add(entity);
    if (!schemesOf.has(entity)) schemesOf.set(entity, new Set());
    schemesOf.get(entity)!.add(scheme);
  }

  // Pares de esquemas por entidade em comum.
  const pairs = new Map<string, { a: string; b: string; shared: GraphNode[] }>();
  schemesOf.forEach((set, entityId) => {
    const entity = byId.get(entityId)!;
    if (entity.type === 'party' && !opts.countParties) return;
    const list = Array.from(set);
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const key = pairKey(list[i], list[j]);
        if (!pairs.has(key)) {
          const [a, b] = list[i] < list[j] ? [list[i], list[j]] : [list[j], list[i]];
          pairs.set(key, { a, b, shared: [] });
        }
        pairs.get(key)!.shared.push(entity);
      }
    }
  });
  directPairs.forEach((key) => {
    if (!pairs.has(key)) {
      const [a, b] = key.split('|');
      pairs.set(key, { a, b, shared: [] });
    }
  });

  const links: OverviewLink[] = [];
  pairs.forEach(({ a, b, shared }, key) => {
    const direct = directPairs.has(key);
    if (shared.length < opts.minShared && !direct) return;
    shared.sort(
      (x, y) => TYPE_ORDER.indexOf(x.type) - TYPE_ORDER.indexOf(y.type) || x.label.localeCompare(y.label, 'pt-BR')
    );
    links.push({ source: a, target: b, shared, weight: Math.max(shared.length, direct ? 1 : 0), direct });
  });

  const degree = new Map<string, number>();
  links.forEach((l) => {
    for (const id of [l.source as string, l.target as string]) degree.set(id, (degree.get(id) ?? 0) + 1);
  });

  const nodes: OverviewNode[] = schemes.map((s) => ({
    id: s.id,
    scheme: s,
    entityCount: entitiesOf.get(s.id)?.size ?? 0,
    degree: degree.get(s.id) ?? 0,
  }));

  return { nodes, links };
}
