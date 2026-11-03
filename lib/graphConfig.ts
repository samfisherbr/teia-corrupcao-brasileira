import type { GraphLink, GraphNode, LinkStatus, LinkType, NodeType } from '@/types/graph';

/**
 * Single source of truth for visual config. Before this file existed, colors
 * lived in three places (SidebarControls, NetworkGraph, the legend JSX) and
 * had drifted apart.
 */
export const NODE_STYLE: Record<NodeType, { label: string; color: string; radius: number; labelColor: string }> = {
  scheme:     { label: 'Esquema de Corrupção', color: '#ff00c8', radius: 100, labelColor: '#ff00c8' },
  party:      { label: 'Partido',              color: '#3b38ff', radius: 70,  labelColor: '#8f8dff' },
  company:    { label: 'Empresa',              color: '#878787', radius: 70,  labelColor: '#a3a3a3' },
  politician: { label: 'Político',             color: '#00eeff', radius: 40,  labelColor: '#a5f3fc' },
  operator:   { label: 'Operador',             color: '#ffffff', radius: 40,  labelColor: '#cdcdcd' },
};

export const DEFAULT_NODE_RADIUS = 20;

export const getNodeRadius = (type: string | undefined): number =>
  NODE_STYLE[type as NodeType]?.radius ?? DEFAULT_NODE_RADIUS;

export const STATUS_STYLE: Record<LinkStatus, { label: string; color: string }> = {
  confirmed:           { label: 'Condenado / Confirmado', color: '#e11d48' },
  under_investigation: { label: 'Sob Investigação',       color: '#f59e0b' },
  acquitted:           { label: 'Absolvido / Arquivado',  color: '#10b981' },
};

export const LINK_TYPE_STYLE: Record<LinkType, { label: string; color: string }> = {
  transaction: { label: 'Transação Financeira', color: '#f59e0b' },
  contract:    { label: 'Contrato Público',     color: '#3b82f6' },
  process:     { label: 'Processo / Dossiê',    color: '#a855f7' },
};

export const FALLBACK_COLOR = '#9ca3af';

/** Link endpoints are strings from the API but become node objects once d3 resolves them. */
export const getNodeId = (endpoint: string | GraphNode | null | undefined): string =>
  endpoint && typeof endpoint === 'object' ? endpoint.id : String(endpoint ?? '');

export const getLinkEnds = (link: GraphLink) => ({
  sourceId: getNodeId(link.source),
  targetId: getNodeId(link.target),
});

/** Stable key for a link even when the D1 table has no `id` column. */
export const getLinkKey = (link: GraphLink): string => {
  if (link.id !== undefined && link.id !== null) return String(link.id);
  const { sourceId, targetId } = getLinkEnds(link);
  return `${sourceId}->${targetId}:${link.type ?? ''}:${link.year ?? ''}`;
};

/** Lower-case and strip accents so "joao" matches "João". */
export const normalizeText = (s: string | null | undefined): string =>
  (s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
