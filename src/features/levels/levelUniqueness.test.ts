import { describe, expect, it } from 'vitest';
import { ALL_LANGUAGES } from '../i18n/languages';
import { normalizeLevelWord } from '../game/engine';
import { getAllPlayableLevels, getLevelsByLanguage } from './levels';

const releaseGateEnabled = process.env.LEXORA_RELEASE_GATE === 'true';
const describeReleaseGate = releaseGateEnabled ? describe : describe.skip;

function levelSignature(level: ReturnType<typeof getAllPlayableLevels>[number]): string {
  const wheel = level.letters.map((letter) => normalizeLevelWord(letter, level)).sort().join('|');
  const words = level.mainWords.map((item) => normalizeLevelWord(item.word, level)).sort().join('|');
  return `${level.language}::${wheel}::${words}`;
}

function sampledDevelopmentLevels(): ReturnType<typeof getAllPlayableLevels> {
  return ALL_LANGUAGES.flatMap((language) => {
    const levels = getLevelsByLanguage(language);
    return [levels[0], levels[49], levels[499], levels[999]].filter(Boolean);
  });
}

describe('development level uniqueness gate', () => {
  it('rejects exact repeated runtime gameplay signatures in deterministic samples', () => {
    const seen = new Set<string>();

    for (const level of sampledDevelopmentLevels()) {
      const signature = levelSignature(level);
      expect(seen.has(signature)).toBe(false);
      seen.add(signature);
    }
  });
});

describeReleaseGate('release level uniqueness gate', () => {
  it('rejects exact repeated level word and wheel signatures per language', () => {
    for (const language of ALL_LANGUAGES) {
      const seen = new Set<string>();

      for (const level of getLevelsByLanguage(language)) {
        const signature = levelSignature(level);
        expect(seen.has(signature)).toBe(false);
        seen.add(signature);
      }
    }
  });
});
