import { describe, expect, it } from 'vitest';
import {
  annotateJapaneseFurigana,
  getJapaneseFuriganaDictionary,
  getJapaneseFuriganaToken,
  hasJapaneseFurigana,
} from '../src/features/i18n/japaneseFurigana';

describe('Japanese furigana release gate', () => {
  it('provides furigana tokens for all onboarding kanji seeds', () => {
    const dictionary = getJapaneseFuriganaDictionary();

    expect(dictionary.length).toBeGreaterThanOrEqual(20);

    const mountain = getJapaneseFuriganaToken('山');
    expect(mountain?.reading).toBe('やま');

    const water = getJapaneseFuriganaToken('水');
    expect(water?.reading).toBe('みず');

    const cat = getJapaneseFuriganaToken('猫');
    expect(cat?.reading).toBe('ねこ');
  });

  it('supports fast furigana existence checks', () => {
    expect(hasJapaneseFurigana('山')).toBe(true);
    expect(hasJapaneseFurigana('海')).toBe(true);
    expect(hasJapaneseFurigana('ゲーム')).toBe(false);
    expect(hasJapaneseFurigana('unknown')).toBe(false);
  });

  it('supports batch furigana annotation', () => {
    const annotated = annotateJapaneseFurigana(['山', '川', '猫', 'unknown']);

    expect(annotated.length).toBe(3);
    expect(annotated.map((item) => item.reading)).toEqual(['やま', 'かわ', 'ねこ']);
  });
});
