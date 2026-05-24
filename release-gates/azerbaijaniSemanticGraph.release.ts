import { describe, expect, it } from 'vitest';
import {
  buildAzerbaijaniSemanticGraph,
  getAzerbaijaniSemanticDistance,
  hasAzerbaijaniSemanticOverload,
} from '../src/features/i18n/azerbaijaniSemanticGraph';

describe('Azerbaijani semantic graph release gate', () => {
  it('builds Azerbaijani semantic graphs with stable nodes and edges', () => {
    const graph = buildAzerbaijaniSemanticGraph(['ev', 'mənzil', 'çörək']);

    expect(graph.nodes).toContain('ev');
    expect(graph.edges.length).toBeGreaterThan(0);
  });

  it('detects close Azerbaijani semantic neighbors', () => {
    const closeDistance = getAzerbaijaniSemanticDistance('ev', 'mənzil');
    const distantDistance = getAzerbaijaniSemanticDistance('ev', 'dəniz');

    expect(closeDistance).toBeLessThan(distantDistance);
  });

  it('detects Azerbaijani semantic overload situations', () => {
    expect(hasAzerbaijaniSemanticOverload([
      'ev',
      'mənzil',
      'bina',
      'şəhər',
      'kənd',
    ])).toBe(true);
  });
});
