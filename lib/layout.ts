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
 * coloca o nó nessa posição.
 *   • ESQUEMAS ficam FIXOS no anel (fx/fy) — são a moldura da teia. Arrastados,
 *     ficam onde forem soltos.
 *   • Todos os OUTROS nós flutuam: a posição-alvo é só o ponto de partida.
 *     Depois, quem os organiza são as molas dos links (comprimento por tipo de
 *     ligação), a repulsão entre TODOS os nós e a colisão. Arrastados, voltam
 *     a se acomodar na teia quando soltos.
 *   • No desktop, uma deriva suave (forceDrift) mantém a teia "respirando".
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
 * Âncora de segurança dos nós que flutuam (0..1). É bem fraca de propósito:
 * só impede que um nó sem ligações visíveis (ex.: depois de um filtro) se
 * afaste para sempre. Quem organiza de fato são os links e a repulsão.
 *   ↑ aumentar (ex. 0.05) → nós ficam mais perto da posição inicial calculada
 *   ↓ diminuir (ex. 0.005) → mais livres; 0 desliga
 */
export const FREE_ANCHOR_STRENGTH = 0.02;

/**
 * Repulsão entre nós (negativo = repelir). Vale entre TODOS os pares de nós,
 * de qualquer tipo, a qualquer distância (sem distanceMax).
 * Os esquemas repelem mais forte; como estão fixos, a repulsão deles só
 * empurra os nós ao redor, abrindo espaço em volta de cada caso.
 *   ↑ (mais negativo) → teia mais espaçada; ↓ → mais compacta
 */
export const REPULSION: Record<NodeType, number> = {
  scheme: -1500,
  party: -700,
  company: -450,
  politician: -450,
  operator: -400,
};

/**
 * Folga extra no raio de colisão (unidades do grafo) para sobrar espaço para
 * o rótulo embaixo do círculo. ↑ aumentar se rótulos se sobrepuserem.
 */
export const COLLIDE_PADDING = 30;

/**
 * Comprimento de repouso de cada tipo de ligação (unidades do grafo).
 * É a "tensão" que impede a teia de se amassar: a mola empurra quando a
 * ligação fica mais curta que isso e puxa quando fica mais longa.
 * A chave é a dupla de tipos em ordem alfabética, unida por "-".
 *   ↑ aumentar um valor → aquele tipo de ligação fica mais comprido
 */
export const LINK_LENGTH: Record<string, number> = {
  'party-politician': 180,
  'company-operator': 200,
  'company-scheme': 260,
  'operator-scheme': 260,
  'operator-politician': 240,
  'company-politician': 260,
  'politician-scheme': 320,
  'party-scheme': 380,
  'politician-politician': 220,
};
/** Comprimento para duplas de tipos que não estão na tabela acima. */
export const DEFAULT_LINK_LENGTH = 260;

/**
 * Rigidez das molas dos links (0..1). Dividida pela raiz do número de ligações
 * do nó mais conectado da dupla, para que "hubs" (ex.: um partido presente em
 * muitos casos) não tremam puxados para todos os lados.
 *   ↑ aumentar → ligações mantêm o comprimento com mais firmeza
 *   ↓ diminuir → teia mais elástica
 */
export const LINK_STRENGTH = 0.5;

/**
 * Deriva suave ("respiração") dos nós livres, só no desktop. Cada nó oscila
 * devagar em torno da sua posição, com fase própria, sem sair do lugar.
 *   - DRIFT_AMPLITUDE ↑ → movimento mais amplo (0.008 ≈ 10–15 unidades)
 *   - DRIFT_SPEED     ↑ → movimento mais rápido (radianos por segundo)
 * Para desligar no desktop também, use DRIFT_AMPLITUDE = 0.
 */
export const DRIFT_AMPLITUDE = 0.008;
export const DRIFT_SPEED = 0.45;

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
 * Coloca na posição-alvo os nós que ainda não têm posição (primeira carga) e
 * FIXA os esquemas no anel (fx/fy).
 * Nós que já têm posição (o usuário filtrou ou arrastou) ficam onde estão;
 * um esquema que o usuário arrastou continua no lugar em que foi solto.
 */
export function seedPositions(nodes: GraphNode[], targets: Map<string, LayoutTarget>) {
  for (const n of nodes) {
    const t = targets.get(n.id);
    if (!t) continue;
    if (typeof n.x !== 'number' || typeof n.y !== 'number') {
      n.x = t.x;
      n.y = t.y;
    }
    if (n.type === 'scheme' && typeof n.fx !== 'number') {
      n.fx = n.x;
      n.fy = n.y;
    }
  }
}

/**
 * Força de deriva: empurrão senoidal suave, com fase própria por nó. Não
 * depende da energia (alpha) da simulação — de propósito: a biblioteca zera
 * essa energia a cada arraste, e a deriva precisa continuar mesmo assim.
 * Média zero → o nó oscila em torno do lugar, não se afasta. Nós fixos (fx)
 * não são afetados.
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
      const p = phases[i];
      n.vx += amplitude * Math.sin(t * speed + p);
      n.vy += amplitude * Math.cos(t * speed * 0.83 + p * 1.7);
    }
  };
  force.initialize = (ns: any[]) => {
    nodes = ns;
    phases = ns.map((n) => hashUnit(String(n.id)) * 2 * Math.PI);
  };
  return force;
}

/** Chave da tabela LINK_LENGTH para uma ligação (tipos em ordem alfabética). */
const linkKey = (l: any) =>
  [String(l.source?.type ?? ''), String(l.target?.type ?? '')].sort().join('-');

/**
 * Aplica as forças do layout em qualquer objeto com a API `d3Force(nome, força)`
 * (o ref do react-force-graph) — ou numa simulação d3 pura, via adaptador.
 *
 * @param drift  true = liga a deriva suave (desktop); false = teia em repouso (celular)
 */
export function applyLayoutForces(
  setForce: (name: string, force?: unknown) => any,
  targets: Map<string, LayoutTarget>,
  drift = false
) {
  // Âncora de segurança, fraca, só para os nós livres (esquemas já estão fixos).
  // Substitui a força "center" padrão da biblioteca.
  setForce('center', null);
  setForce('x', forceX((n: any) => targets.get(n.id)?.x ?? 0).strength(FREE_ANCHOR_STRENGTH));
  setForce('y', forceY((n: any) => targets.get(n.id)?.y ?? 0).strength(FREE_ANCHOR_STRENGTH));

  // Repulsão entre TODOS os nós (sem limite de distância).
  setForce('charge', forceManyBody().strength((n: any) => REPULSION[n.type as NodeType] ?? -450));

  // Colisão: círculo desenhado + folga para o rótulo. 2 iterações = mais firme.
  setForce(
    'collide',
    forceCollide((n: any) => getNodeRadius(n.type) + COLLIDE_PADDING * (n.type === 'party' ? 2 : 1))
      .strength(0.9)
      .iterations(2)
  );

  // Links com tensão: comprimento por tipo de ligação e rigidez ajustada a hubs.
  // (A força "link" é criada pela própria biblioteca; aqui só a configuramos.)
  const link = setForce('link');
  if (link?.distance) {
    // O d3 chama o acessor com (link, índice, todosOsLinks) sempre que o
    // conjunto de links muda; o grau de cada nó é recalculado nesse momento.
    let cachedFor: unknown = null;
    let degree = new Map<string, number>();
    const idOf = (end: any) => (typeof end === 'object' && end ? end.id : end);
    const degreeOf = (end: any, all: any[]) => {
      if (cachedFor !== all) {
        cachedFor = all;
        degree = new Map();
        for (const l of all) {
          for (const e of [l.source, l.target]) degree.set(idOf(e), (degree.get(idOf(e)) ?? 0) + 1);
        }
      }
      return degree.get(idOf(end)) ?? 1;
    };
    link
      .distance((l: any) => LINK_LENGTH[linkKey(l)] ?? DEFAULT_LINK_LENGTH)
      .strength((l: any, _i: number, all: any[]) =>
        LINK_STRENGTH / Math.sqrt(Math.max(degreeOf(l.source, all), degreeOf(l.target, all)))
      );
  }

  // Deriva suave (só quando pedida).
  setForce('drift', drift ? forceDrift() : null);
}
