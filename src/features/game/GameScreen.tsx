import { PointerEvent, useMemo, useRef, useState } from 'react';
import { triggerHaptic } from '../feedback/haptics';
import { Labels } from '../i18n/translations';
import { Level } from '../levels/types';
import { bonusWordReward, getHintPrice } from '../economy/economy';
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
  vibrationEnabled: boolean;
  onBackToMap: () => void;
  onSpendCoins: (amount: number) => boolean;
  onEarnCoins: (amount: number) => void;
  onComplete: (stats: LevelCompleteStats) => void;
};

type Point = {
  x: number;
  y: number;
};

const revealLetterPrice = getHintPrice('reveal_letter');

export function GameScreen({ level, labels, coins, vibrationEnabled, onBackToMap, onSpendCoins, onEarnCoins, onComplete }: GameScreenProps) {
  const wheelRef = useRef<HTMLDivElement | null>(null);
  const letterRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [letters, setLetters] = useState(level.letters);
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
  const [dragPoint, setDragPoint] = useState<Point | null>(null);
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [foundBonusWords, setFoundBonusWords] = useState<Set<string>>(new Set());
  const [revealedLetters, setRevealedLetters] = useState<RevealedLetter[]>([]);
  const [message, setMessage] = useState('');
  const [completed, setCompleted] = useState(false);

  const cells = useMemo(() => buildGrid(level.mainWords), [level]);
  const bounds = useMemo(() => gridBounds(cells), [cells]);
  const currentWord = selectedIndexes.map((index) => letters[index]).join('');

  const selectedPoints = selectedIndexes
    .map((index) => {
      const wheelRect = wheelRef.current?.getBoundingClientRect();
      const letterRect = letterRefs.current[index]?.getBoundingClientRect();
      if (!wheelRect || !letterRect) return null;
      return {
        x: letterRect.left + letterRect.width / 2 - wheelRect.left,
        y: letterRect.top + letterRect.height / 2 - wheelRect.top,
      };
    })
    .filter((point): point is Point => point !== null);

  const linePoints = dragPoint && selectedPoints.length > 0 ? [...selectedPoints, dragPoint] : selectedPoints;
  const polylinePoints = linePoints.map((point) => `${point.x},${point.y}`).join(' ');

  const isCellFound = (cellWords: string[]) => cellWords.some((word) => foundWords.has(normalizeWord(word)));
  const isCellHinted = (cellWords: string[], cellLetter: string) => isCellRevealedByHint(cellWords, cellLetter, revealedLetters);
  const isCellVisible = (cellWords: string[], cellLetter: string) => isCellFound(cellWords) || isCellHinted(cellWords, cellLetter);

  const selectLetter = (index: number) => {
    if (completed) return;
    setSelectedIndexes((current) => {
      if (current.includes(index)) return current;
      triggerHaptic('select', vibrationEnabled);
      return [...current, index];
    });
  };

  const useHint = () => {
    if (completed) return;
    const hint = getNextHiddenLetter(level, foundWords, revealedLetters);
    if (!hint) {
      setMessage(labels.complete);
      return;
    }
    if (coins < revealLetterPrice || !onSpendCoins(revealLetterPrice)) {
      triggerHaptic('error', vibrationEnabled);
      setMessage(labels.notEnoughCoins);
      return;
    }
    triggerHaptic('reward', vibrationEnabled);
    setRevealedLetters((current) => [...current, hint]);
    setMessage(`${labels.hintPrice}: ${revealLetterPrice}`);
  };

  const resetSelection = () => {
    const guess = selectedIndexes.map((index) => letters[index]).join('');
    setDragPoint(null);
    if (!guess || completed) return;

    const result = validateGuess(level, guess, foundWords, foundBonusWords);
    if (result.status === 'main') {
      triggerHaptic('success', vibrationEnabled);
      const nextFound = new Set(foundWords).add(result.word);
      setFoundWords(nextFound);
      setMessage(`${labels.found}: ${result.word}`);
      if (isLevelComplete(level, nextFound)) {
        setCompleted(true);
        setTimeout(() => onComplete({ foundWords: nextFound.size, bonusWords: foundBonusWords.size }), 700);
      }
    } else if (result.status === 'bonus') {
      triggerHaptic('reward', vibrationEnabled);
      const reward = bonusWordReward(result.word.length);
      const nextBonus = new Set(foundBonusWords).add(result.word);
      setFoundBonusWords(nextBonus);
      onEarnCoins(reward);
      setMessage(`${labels.bonus}: ${result.word} +${reward}`);
    } else if (result.status === 'already-found') {
      triggerHaptic('error', vibrationEnabled);
      setMessage(labels.alreadyFound);
    } else {
      triggerHaptic('error', vibrationEnabled);
      setMessage(labels.invalid);
    }
    setSelectedIndexes([]);
  };

  const updateDragPoint = (event: PointerEvent<HTMLDivElement>) => {
    const wheelRect = wheelRef.current?.getBoundingClientRect();
    if (!wheelRect) return;
    setDragPoint({ x: event.clientX - wheelRect.left, y: event.clientY - wheelRect.top });
  };

  const detectLetterUnderPointer = (event: PointerEvent<HTMLDivElement>) => {
    const element = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null;
    const index = element?.dataset.letterIndex;
    if (index !== undefined && selectedIndexes.length > 0) selectLetter(Number(index));
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (selectedIndexes.length === 0) return;
    updateDragPoint(event);
    detectLetterUnderPointer(event);
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

      <div
        ref={wheelRef}
        className="letter-wheel"
        onPointerMove={onPointerMove}
        onPointerUp={resetSelection}
        onPointerLeave={() => setDragPoint(null)}
        onPointerCancel={() => {
          setDragPoint(null);
          setSelectedIndexes([]);
        }}
      >
        <svg className="connection-svg" aria-hidden="true">
          <polyline points={polylinePoints} />
        </svg>
        {letters.map((letter, index) => (
          <button
            ref={(node) => {
              letterRefs.current[index] = node;
            }}
            key={`${letter}-${index}`}
            data-letter-index={index}
            className={selectedIndexes.includes(index) ? 'letter active' : 'letter'}
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture(event.pointerId);
              selectLetter(index);
              updateDragPoint(event as unknown as PointerEvent<HTMLDivElement>);
            }}
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
