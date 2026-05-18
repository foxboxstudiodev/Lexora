import { describe, expect, it } from 'vitest';
import { auditContentPackSources } from './contentSourceAudit';

describe('content source audit', () => {
  it('reports manual and seed-expanded content separately', () => {
    const audit = auditContentPackSources();

    expect(audit.length).toBeGreaterThan(0);
    expect(audit.every((item) => item.totalEntries === item.manualEntries + item.seedExpandedEntries)).toBe(true);
  });
});
