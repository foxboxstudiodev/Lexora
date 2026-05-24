import { describe, expect, it } from 'vitest';
import {
  isJapaneseDictionaryKnownWord,
  lookupJapaneseDictionaryEntries,
  lookupJapaneseDictionaryEntry,
} from '../src/features/i18n/japaneseDictionary';

describe('Japanese dictionary release gate', () => {
  it('looks up core Japanese dictionary entries safely', () => {
    const cat = lookupJapaneseDictionaryEntry('ねこ');

    expect(cat?.reading).toBe('ねこ');
    expect(cat?.meaningHint).toBe('cat');
    expect(cat?.lexicalClass).toBe('noun');
  });

  it('supports kanji dictionary lookups', () => {
    const mountain = lookupJapaneseDictionaryEntry('山');

    expect(mountain?.reading).toBe('やま');
    expect(mountain?.semanticGroupId).toBe('mountain');
  });

  it('supports batch dictionary lookups', () => {
    const entries = lookupJapaneseDictionaryEntries(['ねこ', '山', 'ゲーム']);

    expect(entries.length).toBe(3);
    expect(entries.some((entry) => entry.surface === '山')).toBe(true);
  });

  it('detects known Japanese dictionary vocabulary', () => {
    expect(isJapaneseDictionaryKnownWord('ねこ')).toBe(true);
    expect(isJapaneseDictionaryKnownWord('山')).toBe(true);
    expect(isJapaneseDictionaryKnownWord('unknown')).toBe(false);
  });
});
