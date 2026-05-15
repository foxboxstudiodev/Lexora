import { describe, expect, it } from 'vitest';
import { getKnownWorldIds } from '../worlds/worlds';
import { wordSeeds } from './wordBanks';

describe('word seed themes', () => {
  it('uses only registered world ids', () => {
    const knownWorldIds = getKnownWorldIds();
    const usedWorldIds = new Set(wordSeeds.map((seed) => seed.themeId));

    for (const themeId of usedWorldIds) {
      expect(knownWorldIds.has(themeId)).toBe(true);
    }
  });
});
