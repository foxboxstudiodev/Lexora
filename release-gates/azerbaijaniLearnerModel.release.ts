import { describe, expect, it } from 'vitest';
import { AZERBAIJANI_STARTER_PROFILE } from '../src/features/i18n/azerbaijaniAdaptiveProgression';
import {
  createAzerbaijaniLearnerMemory,
  recommendAzerbaijaniLearnerSequence,
  updateAzerbaijaniLearnerMemory,
} from '../src/features/i18n/azerbaijaniLearnerModel';

describe('Azerbaijani learner model release gate', () => {
  it('tracks Azerbaijani weak words after failed recall', () => {
    const memory = createAzerbaijaniLearnerMemory();
    const updated = updateAzerbaijaniLearnerMemory(memory, 'kitab', 'again', 1000);

    expect(updated.weakWords).toContain('kitab');
  });

  it('tracks Azerbaijani mastered words after repeated success', () => {
    let memory = createAzerbaijaniLearnerMemory();

    memory = updateAzerbaijaniLearnerMemory(memory, 'ev', 'easy', 1000);
    memory = updateAzerbaijaniLearnerMemory(memory, 'ev', 'easy', 2000);
    memory = updateAzerbaijaniLearnerMemory(memory, 'ev', 'easy', 3000);

    expect(memory.masteredWords).toContain('ev');
  });

  it('recommends Azerbaijani review and introduction sequences', () => {
    const memory = createAzerbaijaniLearnerMemory();

    const recommendation = recommendAzerbaijaniLearnerSequence(
      memory,
      ['ev', 'kitab', 'məktəb', 'şəhər', 'çörək'],
      AZERBAIJANI_STARTER_PROFILE,
      1000,
    );

    expect(recommendation.introduceNext.length).toBeGreaterThan(0);
  });
});
