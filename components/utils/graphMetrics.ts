export interface GraphNode {
  id: string;
  type: string;
  [key: string]: unknown;
}

export interface GraphLink {
  source: string | { id: string };
  target: string | { id: string };
  [key: string]: unknown;
}

/**
 * Calculates the number of connected politicians and companies up to 2 hops away from a scheme node.
 */
export const getSchemeMetrics2Hop = (
  schemeId: string,
  nodes: GraphNode[],
  links: GraphLink[]
) => {
  // Helper to extract node ID whether link uses string IDs or D3 node objects
  const getNodeId = (val: string | { id: string }): string =>
    typeof val === 'object' && val !== null ? val.id : String(val);

  const visited = new Set<string>([schemeId]);
  let currentLevel = new Set<string>([schemeId]);

  // Traversal loop up to 4 hops (1-hop direct + 2-hop indirect)
  for (let depth = 0; depth < 4; depth++) {
    const nextLevel = new Set<string>();

    for (const link of links) {
      const sourceId = getNodeId(link.source);
      const targetId = getNodeId(link.target);

      if (currentLevel.has(sourceId) && !visited.has(targetId)) {
        nextLevel.add(targetId);
        visited.add(targetId);
      } else if (currentLevel.has(targetId) && !visited.has(sourceId)) {
        nextLevel.add(sourceId);
        visited.add(sourceId);
      }
    }

    currentLevel = nextLevel;
  }

  // Remove the scheme root node from counts
  visited.delete(schemeId);

  // Filter reachable nodes by type
  const connectedNodes = nodes.filter((node) => visited.has(node.id));

  const politiciansCount = connectedNodes.filter(
    (node) => node.type === 'politician'
  ).length;

  const companiesCount = connectedNodes.filter(
    (node) => node.type === 'company'
  ).length;

  return { politiciansCount, companiesCount };
};