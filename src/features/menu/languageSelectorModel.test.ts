import { describe, expect, it } from 'vitest';
import { ALL_LANGUAGES } from '../i18n/languages';
import { getLanguageSelectorColumnCount, getLanguageSelectorItems } from './languageSelectorModel';

describe('language selector model', () => {
  it('returns all playable languages', () => {
    const items = getLanguageSelectorItems();

    expect(items.map((item) => item.code)).toEqual(ALL_LANGUAGES);
    expect(items).toHaveLength(13);
    expect(items.every((item) => item.label.length > 0)).toBe(true);
  });

  it('uses compact column counts for many languages', () => {
    expect(getLanguageSelectorColumnCount(3)).toBe(3);
    expect(getLanguageSelectorColumnCount(8)).toBe(4);
    expect(getLanguageSelectorColumnCount(13)).toBe(5);
  });
});
