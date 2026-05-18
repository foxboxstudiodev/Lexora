import { describe, expect, it } from 'vitest';
import { getAllLevels } from '../src/features/levels/levels';
import { getBlockingLevelErrors } from '../src/features/levels/levelValidator';

describe('runtime level validity release gate', () => {
  it('requires every generated runtime level to have zero blocking validation errors before release', () => {
    for (const level of getAllLevels()) {
      expect(getBlockingLevelErrors(level), `${level.language} level ${level.id}`).toEqual([]);
    }
  });
});
