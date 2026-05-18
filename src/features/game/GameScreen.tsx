import { useCallback, useMemo, useRef, useState } from 'react';
import { getHintPrice, bonusWordRewardByLanguage } from '../economy/economy';
import { playSound } from '../feedback/audio';
import { triggerHaptic } from '../feedback/haptics';
import { Labels } from '../i18n/translations';
import { splitWordIntoUnits } from '../i18n/wordUnits';
import { Level } from '../levels/types';
import { getTravelLocationById } from '../worlds/travelLocations';
import { getWorldById } from '../worlds/worlds';
import { buildGrid, gridBounds, isLevelComplete, normalizeLevelWord, shuffleLetters, validateGuess } from './engine';
import { getNextHiddenLetter, getRemainingHiddenLetterCount, isCellRevealedByHint, RevealedLetter } from './hints';
import { createCircularWheelLayout, createPolylinePoints } from './wheelLayout';

export type LevelCompleteStats = { foundWords: number; bonusWords: number; usedHint?: boolean };

type GameScreenProps = {
  level: Level;
  labels: Labels;
  coins: number;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  onBackToMap: () => void;
  onSpendCoins: (amount: number) => boolean;
  onEarnCoins: (amount: number) => void;
  onComplete: (stats: LevelCompleteStats) => void;
};

const revealLetterPrice = getHintPrice('reveal_letter');

function isWordFullyRevealed(word: string, level: Level, revealedLetters: RevealedLetter[]): boolean {
  const normalized = normalizeLevelWord(word, level);
  const indexes = new Set(revealedLetters.filter((item) => item.word === normalized).map((item) => item.index));
  return splitWordIntoUnits(normalized, level.language).every((_, index) => indexes.has(index));
}

export function GameScreen({ level, labels, coins, soundEnabled, vibrationEnabled, onBackToMap, onSpendCoins, onEarnCoins, onComplete }: GameScreenProps) {
  const [letters, setLetters] = useState(level.letters);
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [foundBonusWords, setFoundBonusWords] = useState<Set<string>>(new Set());
  const [revealedLetters, setRevealedLetters] = useState<RevealedLetter[]>([]);
  const [message, setMessage] = useState('');
  const [completed, setCompleted] = useState(false);
  const selectedRef = useRef<number[]>([]);
  const draggingRef = useRef(false);
  const usedHintRef = useRef(false);

  const world = getWorldById(level.themeId);
  const travelLocation = level.locationId ? getTravelLocationById(level.locationId) : null;
  const gameplayPlaceName = travelLocation ? travelLocation.locationName : world.name;
  const gameplayChapterName = travelLocation ? `${travelLocation.countryName} · ${travelLocation.chapterName}` : world.description;
  const gameplayThemeClass = travelLocation ? `location-${travelLocation.kind}` : `theme-${level.themeId}`;
  const cells = useMemo(() => buildGrid(level.mainWords, level.language), [level.mainWords, level.language]);
  const bounds = useMemo(() => gridBounds(cells), [cells]);
  const wheelPoints = useMemo(() => createCircularWheelLayout(letters.length), [letters.length]);
  const polylinePoints = useMemo(() => createPolylinePoints(selectedIndexes, wheelPoints), [selectedIndexes, wheelPoints]);
  const currentWord = selectedIndexes.map((index) => letters[index]).join('');
  const remainingHiddenLetters = getRemainingHiddenLetterCount(level, foundWords, revealedLetters);
  const canUseHint = !completed && remainingHiddenLetters > 0 && coins >= revealLetterPrice;

  const setSelection = (indexes: number[]) => {
    selectedRef.current = indexes;
    setSelectedIndexes(indexes);
  };

  const completeWithFoundWords = (nextFound: Set<string>) => {
    if (!isLevelComplete(level, nextFound)) return;
    setCompleted(true);
    window.setTimeout(() => onComplete({ foundWords: nextFound.size, bonusWords: foundBonusWords.size, usedHint: usedHintRef.current }), 700);
  };

  const isCellFound = (cellWords: string[]) => cellWords.some((word) => foundWords.has(normalizeLevelWord(word, level)));
  const isCellHinted = (cellWords: string[], letter: string) => isCellRevealedByHint(cellWords, letter, revealedLetters, level);
  const isCellVisible = (cellWords: string[], letter: string) => isCellFound(cellWords) || isCellHinted(cellWords, letter);

  const resolveSelection = useCallback((indexes: number[]) => {
    const guess = indexes.map((index) => letters[index]).join('');
    if (!guess || completed) {
      setSelection([]);
      return;
    }

    const result = validateGuess(level, guess, foundWords, foundBonusWords);
    if (result.status === 'main') {
      const nextFound = new Set(foundWords).add(result.word);
      triggerHaptic('success', vibrationEnabled);
      playSound('success', soundEnabled);
      setFoundWords(nextFound);
      setMessage(`${labels.found}: ${result.word}`);
      setSelection([]);
      completeWithFoundWords(nextFound);
      return;
    }

    if (result.status === 'bonus') {
      const reward = bonusWordRewardByLanguage(result.word, level.language);
      setFoundBonusWords(new Set(foundBonusWords).add(result.word));
      triggerHaptic('reward', vibrationEnabled);
      playSound('reward', soundEnabled);
      onEarnCoins(reward);
      setMessage(`${labels.bonus}: ${result.word} +${reward}`);
      setSelection([]);
      return;
    }

    triggerHaptic('error', vibrationEnabled);
    playSound('error', soundEnabled);
    setMessage(result.status === 'already-found' ? labels.alreadyFound : labels.invalid);
    setSelection([]);
  }, [completed, foundBonusWords, foundWords, labels, letters, level, onEarnCoins, soundEnabled, vibrationEnabled]);

  const addLetterByIndex = (index: number) => {
    if (completed || selectedRef.current.includes(index)) return;
    triggerHaptic('select', vibrationEnabled);
    playSound('select', soundEnabled);
    setSelection([...selectedRef.current, index]);
  };

  const getLetterIndexFromPoint = (clientX: number, clientY: number): number | null => {
    const target = document.elementFromPoint(clientX, clientY) as HTMLElement | null;
    const rawIndex = (target?.closest('[data-letter-index]') as HTMLElement | null)?.dataset.letterIndex;
    const index = rawIndex === undefined ? NaN : Number(rawIndex);
    return Number.isInteger(index) ? index : null;
  };

  const finishSwipe = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    resolveSelection(selectedRef.current);
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
      playSound('error', soundEnabled);
      setMessage(labels.notEnoughCoins);
      return;
    }

    usedHintRef.current = true;
    const nextRevealedLetters = [...revealedLetters, hint];
    const nextFoundWords = new Set(foundWords);
    const completedByHint = isWordFullyRevealed(hint.word, level, nextRevealedLetters);

    if (completedByHint) {
      nextFoundWords.add(hint.word);
      setFoundWords(nextFoundWords);
    }

    triggerHaptic('reward', vibrationEnabled);
    playSound(completedByHint ? 'success' : 'hint', soundEnabled);
    setRevealedLetters(nextRevealedLetters);
    setMessage(completedByHint ? `${labels.found}: ${hint.word}` : `${labels.hintPrice}: ${revealLetterPrice}`);
    if (completedByHint) completeWithFoundWords(nextFoundWords);
  };

  const clearSelection = () => {
    draggingRef.current = false;
    setSelection([]);
    setMessage('');
  };

  return (
    <section className={`game-card ${gameplayThemeClass}`} aria-label={`${labels.level} ${level.id}, ${gameplayPlaceName}`} data-location-id={level.locationId ?? ''}>
      <div className="game-topbar">
        <button className="icon-button" type="button" onClick={onBackToMap} aria-label={labels.back}>←</button>
        <div><span>{labels.level}</span><strong>{level.id}</strong></div>
        <div><span>{labels.coins}</span><strong>{coins}</strong></div>
      </div>

      <div className="world-ribbon" title={gameplayChapterName}><span>{gameplayPlaceName}</span><strong>{level.difficulty}</strong></div>

      <div className="crossword" aria-label="Crossword grid" style={{ gridTemplateColumns: `repeat(${bounds.cols}, minmax(34px, 1fr))` }}>
        {Array.from({ length: bounds.rows * bounds.cols }).map((_, index) => {
          const row = Math.floor(index / bounds.cols);
          const col = index % bounds.cols;
          const cell = cells.find((item) => item.row === row && item.col === col);
          const visible = cell ? isCellVisible(cell.words, cell.letter) : false;
          const found = cell ? isCellFound(cell.words) : false;
          const hinted = cell ? isCellHinted(cell.words, cell.letter) : false;
          return <div key={`${row}:${col}`} className={cell ? ['grid-cell', found ? 'found' : '', hinted && !found ? 'hinted' : ''].join(' ') : 'grid-empty'}>{cell && visible ? cell.letter : ''}</div>;
        })}
      </div>

      <div className={currentWord ? 'word-preview active' : 'word-preview'} aria-live="polite">{currentWord || message || ' '}</div>

      <div className="letter-wheel swipe-wheel circular-wheel" aria-label="Letter wheel" onPointerMove={(event) => {
        if (!draggingRef.current) return;
        const index = getLetterIndexFromPoint(event.clientX, event.clientY);
        if (index !== null) addLetterByIndex(index);
      }} onPointerUp={finishSwipe} onPointerCancel={finishSwipe} onPointerLeave={(event) => {
        if (event.pointerType === 'mouse') finishSwipe();
      }}>
        <svg className="connection-svg" aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none"><polyline points={polylinePoints} /></svg>
        {letters.map((letter, index) => {
          const point = wheelPoints[index];
          return (
            <button key={`${letter}-${index}`} type="button" data-letter-index={index} className={selectedIndexes.includes(index) ? 'letter active' : 'letter'} style={point ? { left: `${point.x}%`, top: `${point.y}%` } : undefined} onPointerDown={(event) => {
              event.preventDefault();
              draggingRef.current = true;
              setMessage('');
              setSelection([index]);
              triggerHaptic('select', vibrationEnabled);
              playSound('select', soundEnabled);
            }}>{letter}</button>
          );
        })}
      </div>

      <div className="action-row">
        <button type="button" onClick={clearSelection}>{labels.clear}</button>
        <button type="button" onClick={() => { clearSelection(); setLetters(shuffleLetters(letters)); }}>{labels.shuffle}</button>
        <button type="button" onClick={useHint} disabled={!canUseHint} aria-disabled={!canUseHint}>{labels.hint} · {revealLetterPrice}</button>
      </div>

      <div className="status-row" aria-live="polite">{labels.found}: {foundWords.size}/{level.mainWords.length} · {labels.bonus}: {foundBonusWords.size}</div>
      {completed && <div className="complete-banner" role="status">{labels.complete}</div>}
    </section>
  );
}
