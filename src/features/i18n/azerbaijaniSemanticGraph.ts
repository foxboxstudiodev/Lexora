import { getAzerbaijaniFrequencyEntry } from './azerbaijaniFrequency';
import { getAzerbaijaniSemanticGroup } from './azerbaijaniSemanticDuplicates';
import { getAzerbaijaniUsageContext } from './azerbaijaniUsageContext';
import { normalizeAzerbaijaniWord } from './azerbaijaniWordPolicy';

export type AzerbaijaniSemanticRelation = 'same-context' | 'same-semantic-group' | 'frequency-neighbor' | 'distant';

export type AzerbaijaniSemanticEdge = {
  from: string;
  to: string;
  relation: AzerbaijaniSemanticRelation;
  weight: number;
};

export type AzerbaijaniSemanticGraph = {
  nodes: string[];
  edges: AzerbaijaniSemanticEdge[];
};

function getRelation(left: string, right: string): AzerbaijaniSemanticRelation {
  const leftGroup = getAzerbaijaniSemanticGroup(left)?.id;
  const rightGroup = getAzerbaijaniSemanticGroup(right)?.id;
  if (leftGroup && leftGroup === rightGroup) return 'same-semantic-group';

  const leftContext = getAzerbaijaniUsageContext(left);
  const rightContext = getAzerbaijaniUsageContext(right);
  if (leftContext !== 'general' && leftContext === rightContext) return 'same-context';

  const leftFrequency = getAzerbaijaniFrequencyEntry(left).band;
  const rightFrequency = getAzerbaijaniFrequencyEntry(right).band;
  if (Math.abs(leftFrequency - rightFrequency) <= 1) return 'frequency-neighbor';

  return 'distant';
}

function getWeight(relation: AzerbaijaniSemanticRelation): number {
  if (relation === 'same-semantic-group') return 1;
  if (relation === 'same-context') return 0.75;
  if (relation === 'frequency-neighbor') return 0.45;
  return 0.15;
}

export function buildAzerbaijaniSemanticGraph(words: string[]): AzerbaijaniSemanticGraph {
  const nodes = Array.from(new Set(words.map(normalizeAzerbaijaniWord).filter(Boolean)));
  const edges: AzerbaijaniSemanticEdge[] = [];

  for (let leftIndex = 0; leftIndex < nodes.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < nodes.length; rightIndex += 1) {
      const from = nodes[leftIndex];
      const to = nodes[rightIndex];
      const relation = getRelation(from, to);

      edges.push({
        from,
        to,
        relation,
        weight: getWeight(relation),
      });
    }
  }

  return { nodes, edges };
}

export function getAzerbaijaniSemanticDistance(left: string, right: string): number {
  const relation = getRelation(normalizeAzerbaijaniWord(left), normalizeAzerbaijaniWord(right));
  return 1 - getWeight(relation);
}

export function hasAzerbaijaniSemanticOverload(words: string[], maxStrongEdges = 2): boolean {
  const graph = buildAzerbaijaniSemanticGraph(words);
  return graph.edges.filter((edge) => edge.weight >= 0.75).length > maxStrongEdges;
}
