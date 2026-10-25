export type NodeType = 'politician' | 'party' | 'scheme' | 'company';

export type LinkStatus = 'confirmed' | 'under_investigation' | 'acquitted';

export interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  party: string;
  image_url: string;
  summary: string;
  x?: number;
  y?: number;
}

export interface GraphLink {
  id: number;
  source: string | GraphNode;
  target: string | GraphNode;
  relation: string;
  status: LinkStatus;
  amount: string;
  year: number;
  source_url: string;
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
}
