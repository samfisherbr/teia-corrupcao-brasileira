/**
 * ============================================================================
 * LAYOUT RADIAL "SEMEADO" (seeded radial layout)
 * ============================================================================
 *
 * Por que existe: num grafo force-directed puro, todos os nós nascem perto do
 * centro e são empurrados aleatoriamente até se acomodarem. Com ~20 esquemas
 * que compartilham partidos e empresas (PT, MDB, Petrobras, Odebrecht…), o
 * resultado é um "novelo" embolado no meio da tela na primeira abertura.
 *
 * O que faz: calcula, ANTES da simulação, uma posição-alvo para cada nó e já
 * coloca o nó nessa posição. A física (d3-force) só faz o ajuste fino.
 *
 *   • Os ESQUEMAS ficam num anel externo, em ordem cronológica no sentido
 *     horário a partir do topo (o mais antigo às 12h).
 *   • Cada outra entidade vai para o "setor" (ângulo) dos esquemas a que está
 *     ligada. Se está ligada a vários, fica no ângulo médio.
 *   • Quanto MAIS esquemas uma entidade conecta, mais perto do CENTRO ela fica.
 *     Partidos presentes em muitos casos (ex.: PT, MDB, PP) caem naturalmente
 *     no meio; uma empreiteira de um caso só fica na borda, junto ao esquema.
 *
 * Isso cria um "núcleo virtual" no centro sem precisar de um nó falso como
 * "Brasil" ou "Governo Brasileiro" (que distorceria o ranking de centralidade
 * e exigiria um link extra em todo dossiê).
 *
 * Matemática: para cada nó somamos vetores unitários apontando para os ângulos
 * dos seus esquemas. A média desses vetores tem:
 *   - direção  → ângulo do nó;
 *   - tamanho L (0..1) → 1 = todos os esquemas no mesmo lado; ~0 = espalhados.
 * O raio do nó é interpolado entre RADIUS_MIN (L=0) e RADIUS_MAX (L=1) do tipo.
 * ============================================================================
 */
import { forceCollide, forceManyBody, forceX, forceY } from 'd3-force';
import type { GraphLink, GraphNode, NodeType } from '@/types/graph';
import { getLinkEnds, getNodeRadius } from '@/lib/graphConfig';

/* ---------------------------------------------------------------------------
 * PARÂMETROS AJUSTÁVEIS
 * ------------------------------------------------------------------------- */

/**
 * Largura de "arco" reservada para cada esquema no anel externo, em unidades
 * do grafo. O raio do anel é calculado para que caibam todos os esquemas.
 *   ↑ aumentar → anel maior, setores mais largos, menos sobreposição entre casos.
 *   ↓ diminuir → teia mais compacta.
 */
export const ARC_PER_SCHEME = 620;

/** Raio mínimo do anel de esquemas (vale quando há poucos esquemas). */
export const MIN_SCHEME_RING = 1600;

/**
 * Raio de cada tipo como FRAÇÃO do anel de esquemas: [quando L=0, quando L=1].
 *   L=0 → entidade ligada a esquemas espalhados pelo círculo (vai p/ o centro)
 *   L=1 → entidade ligada a um único esquema (ou a esquemas vizinhos)
 *
 * Exemplos de ajuste:
 *   - Quer os partidos ainda mais no centro? Diminua o 2º valor de `party`.
 *   - Quer as empresas por FORA dos esquemas? Mantenha `company[1]` > 1.
 *   - Quer os políticos entre partido e esquema (padrão)? Deixe entre 0.4 e 0.8.
 */
export const RADIUS_FRACTION: Record<NodeType, [number, number]> = {
  party:      [0.14, 0.4],
  politician: [0.42, 0.68],
  scheme:     [1.0, 1.0],
  company:    [0.55, 1.32],
  operator:   [0.6, 1.55],
};

/**
 * Força com que cada nó é puxado para sua posição-alvo (0..1).
 *   ↑ aumentar → layout mais "rígido" e organizado, links podem esticar.
 *   ↓ diminuir → a física dos links tem mais influência (mais orgânico,
 *                 porém volta a embolar se ficar muito baixo, ex. < 0.03).
 */
export const ANCHOR_STRENGTH = 0.12;

/**
 * Âncora extra por tipo (multiplica ANCHOR_STRENGTH). Os esquemas são a
 * "moldura" da teia, então ficam mais presos ao seu lugar no anel; sem isso,
 * esquemas que compartilham partidos se atraem e se amontoam.
 */
export const ANCHOR_MULTIPLIER: Partial<Record<NodeType, number>> = {
  scheme: 3,
  party: 1.5,
};

/**
 * Repulsão entre nós (negativo = repelir). Atua só até `CHARGE_DISTANCE_MAX`,
 * para afastar vizinhos sem empurrar o grafo inteiro para fora.
 */
export const CHARGE_STRENGTH = -220;
export const CHARGE_DISTANCE_MAX = 900;

/**
 * Folga extra no raio de colisão (unidades do grafo) para sobrar espaço para
 * o rótulo embaixo do círculo. ↑ aumentar se rótulos se sobrepuserem.
 */
export const COLLIDE_PADDING = 30;

/**
 * Força das molas dos links. Fica baixa de propósito: quem organiza é a
 * posição-alvo; os links só aproximam levemente quem está conectado.
 */
export const LINK_STRENGTH = 0.04;
export const LINK_DISTANCE = 200;

/* ---------------------------------------------------------------------------
 * CÁLCULO DAS POSIÇÕES-ALVO
 * ------------------------------------------------------------------------- */

export interface LayoutTarget {
  x: number;
  y: number;
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

/**
 * Calcula a posição-alvo de cada nó visível.
 * Chamado sempre que o conjunto visível muda (filtros, busca).
 */
export function computeLayoutTargets(nodes: GraphNode[], links: GraphLink[]): Map<string, LayoutTarget> {
  const byId = new Map(nodes.map((n) => [n.id, n]));

  // Lista de vizinhos de cada nó.
  const neighbours = new Map<string, Set<string>>();
  const add = (a: string, b: string) => {
    if (!neighbours.has(a)) neighbours.set(a, new Set());
    neighbours.get(a)!.add(b);
  };
  // Ano mais antigo associado a cada nó (usado para ordenar os esquemas).
  const firstYear = new Map<string, number>();
  for (const l of links) {
    const { sourceId, targetId } = getLinkEnds(l);
    if (!byId.has(sourceId) || !byId.has(targetId)) continue;
    add(sourceId, targetId);
    add(targetId, sourceId);
    if (l.year) {
      for (const id of [sourceId, targetId]) {
        firstYear.set(id, Math.min(firstYear.get(id) ?? Infinity, l.year));
      }
    }
  }

  // 1. Esquemas em ordem cronológica (empate → ordem alfabética).
  const schemes = nodes
    .filter((n) => n.type === 'scheme')
    .sort((a, b) => (firstYear.get(a.id) ?? 9999) - (firstYear.get(b.id) ?? 9999) || a.label.localeCompare(b.label));

  const schemeRing = Math.max(MIN_SCHEME_RING, (schemes.length * ARC_PER_SCHEME) / (2 * Math.PI));

  // Ângulo de cada esquema. -π/2 = topo da tela; cresce no sentido horário.
  const schemeAngle = new Map<string, number>();
  schemes.forEach((s, i) => schemeAngle.set(s.id, -Math.PI / 2 + (2 * Math.PI * i) / Math.max(1, schemes.length)));

  // 2. Esquemas alcançáveis por cada nó: diretos; se não houver, a 2 saltos
  //    (ex.: operador → empresa → esquema; político → partido → esquema).
  const schemesOf = (id: string): string[] => {
    const direct = Array.from(neighbours.get(id) ?? []).filter((n) => schemeAngle.has(n));
    if (direct.length) return direct;
    const twoHop = new Set<string>();
    neighbours.get(id)?.forEach((n) => neighbours.get(n)?.forEach((m) => schemeAngle.has(m) && twoHop.add(m)));
    return Array.from(twoHop);
  };

  const targets = new Map<string, LayoutTarget>();
  nodes.forEach((node, index) => {
    const [rMin, rMax] = RADIUS_FRACTION[node.type] ?? [0.5, 1];

    let angle: number;
    let L: number; // 0..1, concentração dos esquemas do nó

    if (node.type === 'scheme') {
      angle = schemeAngle.get(node.id)!;
      L = 1;
    } else {
      const ss = schemesOf(node.id);
      if (ss.length === 0) {
        // Nó sem nenhum esquema alcançável (não deveria existir pela regra de
        // ouro do prompt). Espalha em espiral de ângulo áureo para não empilhar.
        angle = index * 2.39996;
        L = 0.5;
      } else {
        let cx = 0;
        let cy = 0;
        for (const s of ss) {
          cx += Math.cos(schemeAngle.get(s)!);
          cy += Math.sin(schemeAngle.get(s)!);
        }
        cx /= ss.length;
        cy /= ss.length;
        L = Math.hypot(cx, cy);
        angle = L > 1e-6 ? Math.atan2(cy, cx) : hashUnit(node.id) * 2 * Math.PI;
      }
    }

    // Pequeno desvio determinístico (±0.08 rad, ±6% do raio) para que nós com o
    // mesmo alvo (ex.: 8 políticos do mesmo esquema) não nasçam empilhados.
    const jitterA = node.type === 'scheme' ? 0 : (hashUnit(node.id) - 0.5) * 0.16;
    const jitterR = node.type === 'scheme' ? 1 : 0.94 + hashUnit(`${node.id}#r`) * 0.12;

    const r = schemeRing * (rMin + (rMax - rMin) * L) * jitterR;
    targets.set(node.id, { x: r * Math.cos(angle + jitterA), y: r * Math.sin(angle + jitterA) });
  });

  return targets;
}

/**
 * Coloca na posição-alvo os nós que ainda não têm posição (primeira carga).
 * Nós que já têm x/y (usuário filtrou ou arrastou) são mantidos onde estão;
 * a força de ancoragem os leva suavemente ao novo alvo.
 */
export function seedPositions(nodes: GraphNode[], targets: Map<string, LayoutTarget>) {
  for (const n of nodes) {
    const t = targets.get(n.id);
    if (t && (typeof n.x !== 'number' || typeof n.y !== 'number')) {
      n.x = t.x;
      n.y = t.y;
    }
  }
}

/**
 * Aplica as forças do layout em qualquer objeto com a API `d3Force(nome, força)`
 * (o ref do react-force-graph) — ou numa simulação d3 pura, via adaptador.
 */
export function applyLayoutForces(
  setForce: (name: string, force?: unknown) => any,
  targets: Map<string, LayoutTarget>
) {
  // Âncora: puxa cada nó para seu alvo (substitui a força "center" padrão).
  setForce('center', null);
  const anchor = (n: any) => ANCHOR_STRENGTH * (ANCHOR_MULTIPLIER[n.type as NodeType] ?? 1);
  setForce('x', forceX((n: any) => targets.get(n.id)?.x ?? 0).strength(anchor));
  setForce('y', forceY((n: any) => targets.get(n.id)?.y ?? 0).strength(anchor));

  // Repulsão local entre vizinhos.
  setForce('charge', forceManyBody().strength(CHARGE_STRENGTH).distanceMax(CHARGE_DISTANCE_MAX));

  // Colisão: círculo desenhado + folga para o rótulo. 2 iterações = mais firme.
  setForce(
    'collide',
    forceCollide((n: any) => getNodeRadius(n.type) + COLLIDE_PADDING * (n.type === 'party' ? 2 : 1))
      .strength(0.9)
      .iterations(2)
  );

  // Links: mola fraca (a força "link" é criada pela própria biblioteca).
  const link = setForce('link');
  link?.distance?.(LINK_DISTANCE).strength?.(LINK_STRENGTH);
}
