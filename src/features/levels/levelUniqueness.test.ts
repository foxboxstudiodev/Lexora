import { describe, expect, it } from 'vitest';
import { ALL_LANGUAGES } from '../i18n/languages';
import { normalizeLevelWord } from '../game/engine';
import { getLevelsByLanguage } from './levels';

const releaseGateEnabled = process.env.LEXORA_RELEASE_GATE === 'true';
const describeReleaseGate = releaseGateEnabled ? describe : describe.skip;

describeReleaseGate('level uniqueness gate', () => {
  it('rejects exact repeated level word and wheel signatures per language', () => {
    for (const language of ALL_LANGUAGES) {
      const seen = new Set<string>();

      for (const level of getLevelsByLanguage(language)) {
        const wheel = level.letters.map((letter) => normalizeLevelWord(letter, level)).sort().join('|');
        const words = level.mainWords.map((item) => normalizeLevelWord(item.word, level)).sort().join('|');
        const signature = `${wheel}::${words}`;

        expect(seen.has(signature)).toBe(false);
        seen.add(signature);
      }
    }
  });
});
