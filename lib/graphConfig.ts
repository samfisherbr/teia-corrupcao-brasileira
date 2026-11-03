/**
 * ============================================================================
 * CONFIGURAÇÃO VISUAL CENTRAL DO GRAFO
 * ============================================================================
 * Fonte única de cores, rótulos e tamanhos. O canvas do grafo, as legendas,
 * os filtros da barra lateral e o painel de detalhes leem daqui — então mudar
 * uma cor aqui muda em todo lugar ao mesmo tempo.
 *
 * Cores: use hexadecimal de 6 dígitos (#rrggbb). O código concatena sufixos de
 * transparência (ex.: `${cor}44`); um hex de 3 ou 4 dígitos vira outra cor.
 * ============================================================================
 */
import type { GraphLink, GraphNode, LinkStatus, LinkType, NodeType } from '@/types/graph';

/**
 * Aparência de cada tipo de entidade.
 *  - label      texto usado em legendas e filtros
 *  - color      borda/brilho do círculo
 *  - radius     raio do círculo em unidades do grafo (também define a área de
 *               clique e a colisão). ↑ maior = círculo maior e mais espaçado.
 *  - labelColor cor do texto do rótulo (quando não selecionado)
 *  - labelPx    tamanho do rótulo em PIXELS DE TELA (não muda com o zoom)
 *  - minZoom    zoom mínimo para o rótulo aparecer (0 = sempre). Valores menores
 *               mostram o rótulo mais cedo ao afastar a câmera.
 */
export const NODE_STYLE: Record<
  NodeType,
  { label: string; color: string; radius: number; labelColor: string; labelPx: number; minZoom: number }
> = {
  scheme:     { label: 'Esquema de Corrupção', color: '#ff00c8', radius: 100, labelColor: '#ff5ce0', labelPx: 13, minZoom: 0 },
  party:      { label: 'Partido',              color: '#3b38ff', radius: 70,  labelColor: '#a5a3ff', labelPx: 12, minZoom: 0.12 },
  company:    { label: 'Empresa',              color: '#878787', radius: 70,  labelColor: '#c4c4c4', labelPx: 11, minZoom: 0.3 },
  politician: { label: 'Político',             color: '#00eeff', radius: 40,  labelColor: '#a5f3fc', labelPx: 11, minZoom: 0.45 },
  operator:   { label: 'Operador',             color: '#ffffff', radius: 40,  labelColor: '#e2e8f0', labelPx: 11, minZoom: 0.45 },
};

/** Raio usado se aparecer um `type` desconhecido vindo do banco. */
export const DEFAULT_NODE_RADIUS = 20;

export const getNodeRadius = (type: string | undefined): number =>
  NODE_STYLE[type as NodeType]?.radius ?? DEFAULT_NODE_RADIUS;

/**
 * Aparência de cada status jurídico (linhas do grafo, legenda, filtros).
 *  - dashed  linha tracejada = caso ainda em aberto (sem decisão definitiva).
 *  - particles  quantidade de "partículas" animadas correndo na linha
 *               (0 desliga; muitos links com partículas pesam em celulares).
 * A ordem das chaves aqui é a ordem em que aparecem na legenda e nos filtros.
 */
export const STATUS_STYLE: Record<LinkStatus, { label: string; color: string; dashed: boolean; particles: number }> = {
  confirmed:           { label: 'Fato documentado',                color: '#60a5fa', dashed: false, particles: 0 },
  under_investigation: { label: 'Sob investigação',                color: '#f59e0b', dashed: true,  particles: 2 },
  convicted_appealing: { label: 'Condenado (cabe recurso)',        color: '#f97316', dashed: true,  particles: 0 },
  convicted_final:     { label: 'Condenado (trânsito em julgado)', color: '#e11d48', dashed: false, particles: 0 },
  annulled:            { label: 'Condenação anulada',              color: '#a78bfa', dashed: false, particles: 0 },
  acquitted:           { label: 'Absolvido',                       color: '#10b981', dashed: false, particles: 0 },
};

/** Categoria operacional do vínculo (painel de detalhes e infográficos). */
export const LINK_TYPE_STYLE: Record<LinkType, { label: string; color: string }> = {
  transaction: { label: 'Transação Financeira', color: '#f59e0b' },
  contract:    { label: 'Contrato / Vínculo',   color: '#3b82f6' },
  process:     { label: 'Processo / Político',  color: '#a855f7' },
};

/** Cor para valores desconhecidos (ex.: status antigo ainda no banco). */
export const FALLBACK_COLOR = '#9ca3af';

/** Lê o id de uma ponta do link, seja ela string ou objeto de nó do d3. */
export const getNodeId = (endpoint: string | GraphNode | null | undefined): string =>
  endpoint && typeof endpoint === 'object' ? endpoint.id : String(endpoint ?? '');

export const getLinkEnds = (link: GraphLink) => ({
  sourceId: getNodeId(link.source),
  targetId: getNodeId(link.target),
});

/**
 * Chave estável de um link (para `key` do React e para saber qual está
 * selecionado), mesmo se a tabela não tiver coluna `id`. Segue a mesma
 * combinação do índice único do banco: (source, target, type, year).
 */
export const getLinkKey = (link: GraphLink): string => {
  if (link.id !== undefined && link.id !== null) return String(link.id);
  const { sourceId, targetId } = getLinkEnds(link);
  return `${sourceId}->${targetId}:${link.type ?? ''}:${link.year ?? ''}`;
};

/** Minúsculas e sem acentos, para a busca: "joao" encontra "João". */
export const normalizeText = (s: string | null | undefined): string =>
  (s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
