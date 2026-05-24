import { describe, expect, it } from 'vitest';
import {
  createJapaneseDisplayToken,
  createJapaneseDisplayTokens,
  getJapaneseDisplayLabel,
  getJapaneseDisplayLabels,
} from '../src/features/i18n/japaneseDisplayText';

describe('Japanese display rendering release gate', () => {
  it('creates display tokens with normalized readings', () => {
    const mountain = createJapaneseDisplayToken('山');

    expect(mountain.surface).toBe('山');
    expect(mountain.normalizedReading).toBe('やま');
    expect(mountain.furigana?.reading).toBe('やま');

    const hiragana = createJapaneseDisplayToken('ねこ');
    expect(hiragana.normalizedReading).toBe('ねこ');
  });

  it('supports assisted furigana labels', () => {
    const mountain = createJapaneseDisplayToken('山');

    expect(getJapaneseDisplayLabel(mountain, 'plain')).toBe('山');
    expect(getJapaneseDisplayLabel(mountain, 'furigana-assisted')).toBe('山（やま）');
  });

  it('supports batch display rendering', () => {
    const labels = getJapaneseDisplayLabels(['山', '猫', 'ゲーム'], 'furigana-assisted');

    expect(labels).toContain('山（やま）');
    expect(labels).toContain('猫（ねこ）');
    expect(labels).toContain('ゲーム');
  });

  it('supports batch display token creation', () => {
    const tokens = createJapaneseDisplayTokens(['山', '川', '水']);

    expect(tokens.length).toBe(3);
    expect(tokens.map((token) => token.normalizedReading)).toEqual(['やま', 'かわ', 'みず']);
  });
});
