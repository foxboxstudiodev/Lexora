import { describe, expect, it } from 'vitest';
import {
  getAzerbaijaniUsageContext,
  getAzerbaijaniUsageContextEntry,
  groupAzerbaijaniWordsByUsageContext,
} from '../src/features/i18n/azerbaijaniUsageContext';

describe('Azerbaijani usage context release gate', () => {
  it('classifies Azerbaijani words into natural contexts', () => {
    expect(getAzerbaijaniUsageContext('ev')).toBe('home');
    expect(getAzerbaijaniUsageContext('çörək')).toBe('food');
    expect(getAzerbaijaniUsageContext('məktəb')).toBe('city');
  });

  it('preserves Azerbaijani frequency metadata in usage context entries', () => {
    const entry = getAzerbaijaniUsageContextEntry('ev');

    expect(entry.context).toBe('home');
    expect(entry.frequencyBand).toBe(1);
  });

  it('groups Azerbaijani words by semantic usage contexts', () => {
    const grouped = groupAzerbaijaniWordsByUsageContext([
      'ev',
      'qapı',
      'çörək',
      'alma',
      'göz',
    ]);

    expect(grouped.home).toContain('ev');
    expect(grouped.food).toContain('çörək');
    expect(grouped.body).toContain('göz');
  });
});
