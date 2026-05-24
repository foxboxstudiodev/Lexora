import { describe, expect, it } from 'vitest';
import {
  isAzerbaijaniDictionaryKnownWord,
  lookupAzerbaijaniDictionaryEntries,
  lookupAzerbaijaniDictionaryEntry,
} from '../src/features/i18n/azerbaijaniDictionary';

describe('Azerbaijani dictionary release gate', () => {
  it('looks up core Azerbaijani dictionary entries safely', () => {
    const home = lookupAzerbaijaniDictionaryEntry('ev');
    const book = lookupAzerbaijaniDictionaryEntry('kitab');
    const school = lookupAzerbaijaniDictionaryEntry('məktəb');

    expect(home?.lemma).toBe('ev');
    expect(home?.meaningHint).toBe('house, home');
    expect(book?.meaningHint).toBe('book');
    expect(school?.meaningHint).toBe('school');
  });

  it('preserves semantic and frequency metadata in dictionary results', () => {
    const entry = lookupAzerbaijaniDictionaryEntry('şəhər');

    expect(entry?.lexicalClass).toBe('noun');
    expect(entry?.semanticGroupId).toBe('settlement');
    expect(entry?.frequencyBand).toBe(1);
  });

  it('rejects fake Azerbaijani dictionary words', () => {
    expect(isAzerbaijaniDictionaryKnownWord('qip')).toBe(false);
    expect(isAzerbaijaniDictionaryKnownWord('paq')).toBe(false);
    expect(isAzerbaijaniDictionaryKnownWord('loyal')).toBe(false);
  });

  it('supports batch Azerbaijani dictionary lookups', () => {
    const entries = lookupAzerbaijaniDictionaryEntries(['ev', 'kitab', 'qip', 'məktəb']);

    expect(entries.map((entry) => entry.lemma)).toContain('ev');
    expect(entries.map((entry) => entry.lemma)).toContain('kitab');
    expect(entries.map((entry) => entry.lemma)).toContain('məktəb');
    expect(entries.map((entry) => entry.lemma)).not.toContain('qip');
  });
});
