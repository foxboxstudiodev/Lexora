import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { translations } from '../i18n/translations';
import { Level } from '../levels/types';
import { GameScreen } from './GameScreen';

const baseLevel: Level = {
  id: 1,
  language: 'en',
  letters: ['C', 'A', 'T', 'R'],
  mainWords: [{ word: 'CAT', row: 0, col: 0, direction: 'across' }],
  bonusWords: [],
  difficulty: 'easy',
  themeId: 'dawn-garden',
  rewardCoins: 10,
};

function renderGame(level: Level, onComplete = vi.fn()) {
  render(
    <GameScreen
      level={level}
      labels={translations.en}
      coins={500}
      soundEnabled={false}
      vibrationEnabled={false}
      onBackToMap={vi.fn()}
      onSpendCoins={vi.fn(() => true)}
      onEarnCoins={vi.fn()}
      onComplete={onComplete}
    />,
  );

  return { onComplete };
}

function expectStatus(text: string) {
  expect(screen.getByText((content) => content.includes(text))).toBeTruthy();
}

describe('GameScreen hint completion behavior', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('counts a word as found when hints reveal every unit of that word and completes if it is the final word', () => {
    vi.useFakeTimers();
    const { onComplete } = renderGame(baseLevel);
    const hintButton = screen.getByRole('button', { name: /hint/i });

    fireEvent.click(hintButton);
    expectStatus('Found: 0/1');

    fireEvent.click(hintButton);
    expectStatus('Found: 0/1');

    fireEvent.click(hintButton);
    expectStatus('Found: 1/1');

    vi.advanceTimersByTime(700);
    expect(onComplete).toHaveBeenCalledWith({ foundWords: 1, bonusWords: 0 });
  });

  it('does not complete the level until every main word is found', () => {
    vi.useFakeTimers();
    const level: Level = {
      ...baseLevel,
      letters: ['C', 'A', 'T', 'R'],
      mainWords: [
        { word: 'CAT', row: 0, col: 0, direction: 'across' },
        { word: 'CAR', row: 1, col: 0, direction: 'across' },
      ],
    };
    const { onComplete } = renderGame(level);
    const hintButton = screen.getByRole('button', { name: /hint/i });

    fireEvent.click(hintButton);
    fireEvent.click(hintButton);
    fireEvent.click(hintButton);

    expectStatus('Found: 1/2');
    vi.advanceTimersByTime(700);
    expect(onComplete).not.toHaveBeenCalled();
  });
});
