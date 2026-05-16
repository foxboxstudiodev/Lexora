import { describe, expect, it } from 'vitest';
import { ExpansionLevel } from './expansionLevelTypes';
import { expansionLevelToRuntimeLevel } from './expansionLevelAdapter';

function makeExpansionLevel(language: ExpansionLevel['language']): ExpansionLevel {
  return {
    id: 100001,
    packLevelNumber: 1,
    language,
    letters: ['S', 'T', 'O', 'N', 'E'],
    mainWords: [
      { word: 'STONE', row: 0, col: 0, direction: 'across', order: 1 },
      { word: 'TONE', row: 0, col: 1, direction: 'down', order: 2 },
    ],
    bonusWords: ['ONE'],
    difficultyBand: 'easy',
    location: {
      countryCode: 'EG',
      countryName: 'Egypt',
      locationName: 'Pyramids of Giza',
      chapterName: 'Desert Wonders',
      backgroundPrompt: 'Original cartoon travel background inspired by Egypt.',
      backgroundStyle: 'cartoon-landmark',
    },
    rewardCoins: 12,
    minRequiredIntersections: 1,
  };
}

describe('expansion level adapter', () => {
  it('converts active-language expansion levels to runtime levels', () => {
    const runtime = expansionLevelToRuntimeLevel(makeExpansionLevel('en'));

    expect(runtime.id).toBe(1);
    expect(runtime.language).toBe('en');
    expect(runtime.difficulty).toBe('easy');
    expect(runtime.mainWords[0]).toEqual({ word: 'STONE', row: 0, col: 0, direction: 'across' });
  });

  it('blocks planned languages until they are activated in runtime translations', () => {
    expect(() => expansionLevelToRuntimeLevel(makeExpansionLevel('de'))).toThrow('planned language');
  });
});
