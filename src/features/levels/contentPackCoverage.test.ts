import { describe, expect, it } from 'vitest';
import { createContentPackCoverageReport, createContentPackCoverageRow } from './contentPackCoverage';

describe('content pack coverage report', () => {
  it('reports full coverage for active languages', () => {
    const en = createContentPackCoverageRow('en');
    expect(en.readyLevelCount).toBe(300);
    expect(en.missingLevelCount).toBe(0);
  });

  it('reports full coverage for planned languages', () => {
    const de = createContentPackCoverageRow('de');
    expect(de.readyLevelCount).toBe(300);
    expect(de.missingLevelCount).toBe(0);
  });

  it('builds complete coverage for all languages', () => {
    const report = createContentPackCoverageReport();
    expect(report.rows).toHaveLength(13);
    expect(report.totalTargetLevels).toBe(3900);
    expect(report.totalReadyLevels).toBe(3900);
    expect(report.totalMissingLevels).toBe(0);
  });
});
