import { useMemo, useState } from 'react';
import { playSound } from '../feedback/audio';
import { triggerHaptic } from '../feedback/haptics';
import { Labels } from '../i18n/translations';
import { Level } from '../levels/types';
import { bonusWordReward, getHintPrice } from '../economy/economy';
import { getWorldById } from '../worlds/worlds';
import { buildGrid, gridBounds, isLevelComplete, normalizeWord, shuffleLetters, validateGuess } from './engine';
import { getNextHiddenLetter, isCellRevealedByHint, RevealedLetter } from './hints';

export type LevelCompleteStats = { foundWords: number; bonusWords: number };

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

export function GameScreen({ level, labels, coins, soundEnabled, vibrationEnabled, onBackToMap, onSpendCoins, onEarnCoins, onComplete }: GameScreenProps) {
  const [letters, setLetters] = useState(level.letters);
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [foundBonusWords, setFoundBonusWords] = useState<Set<string>>(new Set());
  const [revealedLetters, setRevealedLetters] = useState<RevealedLetter[]>([]);
  const [message, setMessage] = useState('');
  const [completed, setCompleted] = useState(false);

  const world = getWorldById(level.themeId);
  const cells = useMemo(() => buildGrid(level.mainWords), [level.mainWords]);
  const bounds = useMemo(() => gridBounds(cells), [cells]);
  const validWords = useMemo(
    () => [...level.mainWords.map((item) => normalizeWord(item.word)), ...level.bonusWords.map(normalizeWord)],
    [level.mainWords, level.bonusWords],
  );
  const currentWord = selectedIndexes.map((index) => letters[index]).join('');

  const isCellFound = (cellWords: string[]) => cellWords.some((word) => foundWords.has(normalizeWord(word)));
  const isCellHinted = (cellWords: string[], letter: string) => isCellRevealedByHint(cellWords, letter, revealedLetters);
  const isCellVisible = (cellWords: string[], letter: string) => isCellFound(cellWords) || isCellHinted(cellWords, letter);

  const canAutoSubmit = (word: string): boolean => {
    const normalized = normalizeWord(word);
    if (!validWords.includes(normalized)) return false;
    if (foundWords.has(normalized) || foundBonusWords.has(normalized)) return false;
    return !validWords.some((candidate) => candidate !== normalized && candidate.startsWith(normalized));
  };

  const submitSelection = (indexes = selectedIndexes, silentInvalid = false) => {
    const guess = indexes.map((index) => letters[index]).join('');
    if (!guess || completed) return;

    const result = validateGuess(level, guess, foundWords, foundBonusWords);
    if (result.status === 'main') {
      const nextFound = new Set(foundWords).add(result.word);
      triggerHaptic('success', vibrationEnabled);
      playSound('success', soundEnabled);
      setFoundWords(nextFound);
      setMessage(`${labels.found}: ${result.word}`);
      if (isLevelComplete(level, nextFound)) {
        setCompleted(true);
        window.setTimeout(() => onComplete({ foundWords: nextFound.size, bonusWords: foundBonusWords.size }), 700);
      }
      setSelectedIndexes([]);
      return;
    }

    if (result.status === 'bonus') {
      const reward = bonusWordReward(result.word.length);
      const nextBonus = new Set(foundBonusWords).add(result.word);
      triggerHaptic('reward', vibrationEnabled);
      playSound('reward', soundEnabled);
      setFoundBonusWords(nextBonus);
      onEarnCoins(reward);
      setMessage(`${labels.bonus}: ${result.word} +${reward}`);
      setSelectedIndexes([]);
      return;
    }

    if (!silentInvalid) {
      triggerHaptic('error', vibrationEnabled);
      playSound('error', soundEnabled);
      setMessage(result.status === 'already-found' ? labels.alreadyFound : labels.invalid);
      setSelectedIndexes([]);
    }
  };

  const selectLetter = (index: number) => {
    if (completed) return;
    setSelectedIndexes((current) => {
      if (current.includes(index)) return current;
      const next = [...current, index];
      const word = next.map((letterIndex) => letters[letterIndex]).join('');
      triggerHaptic('select', vibrationEnabled);
      playSound('select', soundEnabled);
      if (canAutoSubmit(word)) {
        window.setTimeout(() => submitSelection(next, true), 90);
      }
      return next;
    });
  };

  const clearSelection = () => {
    setSelectedIndexes([]);
    setMessage('');
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
    triggerHaptic('reward', vibrationEnabled);
    playSound('hint', soundEnabled);
    setRevealedLetters((current) => [...current, hint]);
    setMessage(`${labels.hintPrice}: ${revealLetterPrice}`);
  };

  return (
    <section className={`game-card theme-${level.themeId}`} aria-label={`${labels.level} ${level.id}, ${world.name}`}>
      <div className="game-topbar">
        <button className="icon-button" type="button" onClick={onBackToMap} aria-label={labels.back}>←</button>
        <div><span>{labels.level}</span><strong>{level.id}</strong></div>
        <div><span>{labels.coins}</span><strong>{coins}</strong></div>
      </div>

      <div className="world-ribbon" title={world.description}>
        <span>{world.name}</span><strong>{level.difficulty}</strong>
      </div>

      <div className="crossword" aria-label="Crossword grid" style={{ gridTemplateColumns: `repeat(${bounds.cols}, minmax(34px, 1fr))` }}>
        {Array.from({ length: bounds.rows * bounds.cols }).map((_, index) => {
          const row = Math.floor(index / bounds.cols);
          const col = index % bounds.cols;
          const cell = cells.find((item) => item.row === row && item.col === col);
          const visible = cell ? isCellVisible(cell.words, cell.letter) : false;
          const found = cell ? isCellFound(cell.words) : false;
          const hinted = cell ? isCellHinted(cell.words, cell.letter) : false;
          return (
            <div key={`${row}:${col}`} className={cell ? ['grid-cell', found ? 'found' : '', hinted && !found ? 'hinted' : ''].join(' ') : 'grid-empty'}>
              {cell && visible ? cell.letter : ''}
            </div>
          );
        })}
      </div>

      <div className={currentWord ? 'word-preview active' : 'word-preview'} aria-live="polite">
        {currentWord || message || ' '}
      </div>

      <div className="letter-wheel stable-wheel" aria-label="Letter wheel">
        {letters.map((letter, index) => (
          <button key={`${letter}-${index}`} type="button" className={selectedIndexes.includes(index) ? 'letter active' : 'letter'} onClick={() => selectLetter(index)}>
            {letter}
          </button>
        ))}
      </div>

      <div className="action-row">
        <button type="button" onClick={() => submitSelection()}>{labels.submit}</button>
        <button type="button" onClick={clearSelection}>{labels.clear}</button>
        <button type="button" onClick={() => setLetters(shuffleLetters(letters))}>{labels.shuffle}</button>
        <button type="button" onClick={useHint}>{labels.hint} · {revealLetterPrice}</button>
      </div>

      <div className="status-row" aria-live="polite">
        {labels.found}: {foundWords.size}/{level.mainWords.length} · {labels.bonus}: {foundBonusWords.size}
      </div>

      {completed && <div className="complete-banner" role="status">{labels.complete}</div>}
    </section>
  );
}
