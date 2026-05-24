import { describe, expect, it } from 'vitest';
import { buildRuntimeLevelsFromRegisteredContentPacks } from '../src/features/levels/contentPacks/runtimeContentLevels';

describe('Runtime duplicate level release gate', () => {
  it('does not allow excessive duplicate runtime fingerprints', () => {
    const result = buildRuntimeLevelsFromRegisteredContentPacks();

    const duplicateIssues = result.issues.filter((issue) =>
      issue.includes('Duplicate runtime level fingerprint'),
    );

    expect(duplicateIssues.length).toBeLessThanOrEqual(2);
  });
});
