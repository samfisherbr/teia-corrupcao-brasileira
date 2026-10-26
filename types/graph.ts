export type NodeType = 'politician' | 'party' | 'scheme' | 'company';
export type LinkStatus = 'confirmed' | 'under_investigation' | 'acquitted';
export type LinkType = 'direct_financing' | 'suspect_transactions';

export interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  party?: string;
  image_url: string;
  summary: string;
  status?: LinkStatus;
  estimatedImpact?: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface GraphLink {
  id: number | string;
  source: string | GraphNode;
  target: string | GraphNode;
  relation: string;
  type?: LinkType;
  status: LinkStatus;
  amount: string;
  year: number;
  source_url?: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface FilterState {
  searchQuery: string;
  startYearFilter: number;
  typeFilters: Record<NodeType, boolean>;
  statusFilters: Record<LinkStatus, boolean>;
  activeCategory: 'all' | 'transactions' | 'contracts' | 'processes';
}