import { PointerEvent, useMemo, useState } from 'react';
import { Labels } from '../i18n/translations';
import { Level } from '../levels/types';
import { buildGrid, gridBounds, isLevelComplete, normalizeWord, shuffleLetters, validateGuess } from './engine';

type GameScreenProps = {
  level: Level;
  labels: Labels;
  coins: number;
  onComplete: () => void;
};

export function GameScreen({ level, labels, coins, onComplete }: GameScreenProps) {
  const [letters, setLetters] = useState(level.letters);
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [foundBonusWords, setFoundBonusWords] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState('');
  const [completed, setCompleted] = useState(false);

  const cells = useMemo(() => buildGrid(level.mainWords), [level]);
  const bounds = useMemo(() => gridBounds(cells), [cells]);
  const currentWord = selectedIndexes.map((index) => letters[index]).join('');

  const revealableCells = cells.filter((cell) => cell.words.some((word) => foundWords.has(normalizeWord(word))));

  const selectLetter = (index: number) => {
    setSelectedIndexes((current) => (current.includes(index) ? current : [...current, index]));
  };

  const resetSelection = () => {
    const guess = selectedIndexes.map((index) => letters[index]).join('');
    if (!guess) return;

    const result = validateGuess(level, guess, foundWords, foundBonusWords);
    if (result.status === 'main') {
      const nextFound = new Set(foundWords).add(result.word);
      setFoundWords(nextFound);
      setMessage(`${labels.found}: ${result.word}`);
      if (isLevelComplete(level, nextFound)) {
        setCompleted(true);
        setTimeout(onComplete, 900);
      }
    } else if (result.status === 'bonus') {
      setFoundBonusWords(new Set(foundBonusWords).add(result.word));
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
          const visible = cell ? revealableCells.some((item) => item.key === cell.key) : false;
          return (
            <div key={`${row}:${col}`} className={cell ? 'grid-cell' : 'grid-empty'}>
              {cell && visible ? cell.letter : ''}
            </div>
          );
        })}
      </div>

      <div className="word-preview" aria-live="polite">
        {currentWord || message || ' '}
      </div>

      <div
        className="letter-wheel"
        onPointerMove={onPointerMove}
        onPointerUp={resetSelection}
        onPointerCancel={() => setSelectedIndexes([])}
      >
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
        <button onClick={() => setMessage(labels.hint)}>{labels.hint}</button>
      </div>

      <div className="status-row">
        {labels.found}: {foundWords.size}/{level.mainWords.length} · {labels.bonus}: {foundBonusWords.size}
      </div>

      {completed && <div className="complete-banner">{labels.complete}</div>}
    </section>
  );
}
