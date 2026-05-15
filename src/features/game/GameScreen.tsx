import { PointerEvent, useMemo, useState } from 'react';
import { Labels } from '../i18n/translations';
import { Level } from '../levels/types';
import { getHintPrice } from '../economy/economy';
import { buildGrid, gridBounds, isLevelComplete, normalizeWord, shuffleLetters, validateGuess } from './engine';
import { getNextHiddenLetter, isCellRevealedByHint, RevealedLetter } from './hints';

export type LevelCompleteStats = {
  foundWords: number;
  bonusWords: number;
};

type GameScreenProps = {
  level: Level;
  labels: Labels;
  coins: number;
  onBackToMap: () => void;
  onSpendCoins: (amount: number) => boolean;
  onComplete: (stats: LevelCompleteStats) => void;
};

const revealLetterPrice = getHintPrice('reveal_letter');

export function GameScreen({ level, labels, coins, onBackToMap, onSpendCoins, onComplete }: GameScreenProps) {
  const [letters, setLetters] = useState(level.letters);
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [foundBonusWords, setFoundBonusWords] = useState<Set<string>>(new Set());
  const [revealedLetters, setRevealedLetters] = useState<RevealedLetter[]>([]);
  const [message, setMessage] = useState('');
  const [completed, setCompleted] = useState(false);

  const cells = useMemo(() => buildGrid(level.mainWords), [level]);
  const bounds = useMemo(() => gridBounds(cells), [cells]);
  const currentWord = selectedIndexes.map((index) => letters[index]).join('');

  const isCellFound = (cellWords: string[]) => cellWords.some((word) => foundWords.has(normalizeWord(word)));
  const isCellHinted = (cellWords: string[], cellLetter: string) => isCellRevealedByHint(cellWords, cellLetter, revealedLetters);
  const isCellVisible = (cellWords: string[], cellLetter: string) => isCellFound(cellWords) || isCellHinted(cellWords, cellLetter);

  const selectLetter = (index: number) => {
    if (completed) return;
    setSelectedIndexes((current) => (current.includes(index) ? current : [...current, index]));
  };

  const useHint = () => {
    if (completed) return;
    const hint = getNextHiddenLetter(level, foundWords, revealedLetters);
    if (!hint) {
      setMessage(labels.complete);
      return;
    }
    if (coins < revealLetterPrice || !onSpendCoins(revealLetterPrice)) {
      setMessage(labels.notEnoughCoins);
      return;
    }
    setRevealedLetters((current) => [...current, hint]);
    setMessage(`${labels.hintPrice}: ${revealLetterPrice}`);
  };

  const resetSelection = () => {
    const guess = selectedIndexes.map((index) => letters[index]).join('');
    if (!guess || completed) return;

    const result = validateGuess(level, guess, foundWords, foundBonusWords);
    if (result.status === 'main') {
      const nextFound = new Set(foundWords).add(result.word);
      setFoundWords(nextFound);
      setMessage(`${labels.found}: ${result.word}`);
      if (isLevelComplete(level, nextFound)) {
        setCompleted(true);
        setTimeout(() => onComplete({ foundWords: nextFound.size, bonusWords: foundBonusWords.size }), 700);
      }
    } else if (result.status === 'bonus') {
      const nextBonus = new Set(foundBonusWords).add(result.word);
      setFoundBonusWords(nextBonus);
      setMessage(`${labels.bonus}: ${result.word}`);
    } else if (result.status === 'already-found') {
      setMessage(labels.alreadyFound);
    } else {
      setMessage(labels.invalid);
    }
    setSelectedIndexes([]);
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    const index = target.dataset.letterIndex;
    if (index !== undefined && selectedIndexes.length > 0) selectLetter(Number(index));
  };

  return (
    <section className={`game-card theme-${level.themeId}`}>
      <div className="game-topbar">
        <button className="icon-button" onClick={onBackToMap} aria-label="Back to levels">←</button>
        <div>
          <span>{labels.level}</span>
          <strong>{level.id}</strong>
        </div>
        <div>
          <span>{labels.coins}</span>
          <strong>{coins}</strong>
        </div>
      </div>

      <div className="crossword" style={{ gridTemplateColumns: `repeat(${bounds.cols}, minmax(34px, 1fr))` }}>
        {Array.from({ length: bounds.rows * bounds.cols }).map((_, index) => {
          const row = Math.floor(index / bounds.cols);
          const col = index % bounds.cols;
          const cell = cells.find((item) => item.row === row && item.col === col);
          const found = cell ? isCellFound(cell.words) : false;
          const hinted = cell ? isCellHinted(cell.words, cell.letter) : false;
          const visible = cell ? isCellVisible(cell.words, cell.letter) : false;
          const className = cell ? ['grid-cell', found ? 'found' : '', hinted && !found ? 'hinted' : ''].join(' ') : 'grid-empty';
          return (
            <div key={`${row}:${col}`} className={className}>
              {cell && visible ? cell.letter : ''}
            </div>
          );
        })}
      </div>

      <div className={currentWord ? 'word-preview active' : 'word-preview'} aria-live="polite">
        {currentWord || message || ' '}
      </div>

      <div className="letter-wheel" onPointerMove={onPointerMove} onPointerUp={resetSelection} onPointerCancel={() => setSelectedIndexes([])}>
        <div className="connection-line" style={{ width: `${Math.max(0, selectedIndexes.length - 1) * 42}px` }} />
        {letters.map((letter, index) => (
          <button
            key={`${letter}-${index}`}
            data-letter-index={index}
            className={selectedIndexes.includes(index) ? 'letter active' : 'letter'}
            onPointerDown={() => selectLetter(index)}
          >
            {letter}
          </button>
        ))}
      </div>

      <div className="action-row">
        <button onClick={() => setLetters(shuffleLetters(letters))}>{labels.shuffle}</button>
        <button onClick={useHint}>{labels.hint} · {revealLetterPrice}</button>
      </div>

      <div className="status-row">
        {labels.found}: {foundWords.size}/{level.mainWords.length} · {labels.bonus}: {foundBonusWords.size}
      </div>

      {completed && <div className="complete-banner">{labels.complete}</div>}
    </section>
  );
}
