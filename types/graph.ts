export type NodeType = 'politician' | 'party' | 'scheme' | 'company' | 'operator';
export type LinkStatus = 'confirmed' | 'under_investigation' | 'acquitted';
/** Matches the values the dossier prompt and the D1 data actually use. */
export type LinkType = 'transaction' | 'contract' | 'process';

/** Mirrors the `nodes` table. D1 returns SQL NULL as `null`. */
export interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  party: string | null;
  summary: string | null;
  image_url: string | null;
  // Coordinates injected by d3-force at runtime
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

/** Mirrors the `links` table. `source`/`target` become node objects after d3 resolves them. */
export interface GraphLink {
  id?: number | string;
  source: string | GraphNode;
  target: string | GraphNode;
  relation: string;
  type: LinkType | null;
  status: LinkStatus;
  amount: string | null;
  year: number | null;
  source_url: string | null;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}
