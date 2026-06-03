import { useEffect, useMemo, useState } from 'react';
import { AchievementsScreen } from '../features/achievements/AchievementsScreen';
import { DailyRewardScreen } from '../features/dailyReward/DailyRewardScreen';
import { HintType } from '../features/economy/economy';
import { GameScreen, LevelCompleteStats } from '../features/game/GameScreen';
import { LevelComplete } from '../features/game/LevelComplete';
import { LanguagesScreen } from '../features/menu/LanguagesScreen';
import { MainMenu } from '../features/menu/MainMenu';
import { SettingsScreen } from '../features/settings/SettingsScreen';
import { LevelMap } from '../features/levels/LevelMap';
import { getLevelsByLanguageAsync } from '../features/levels/levels';
import { LanguageCode, translations } from '../features/i18n/translations';
import { subscribeInstallPrompt, triggerInstallPrompt } from '../features/pwa/installPrompt';
import { DailyRewardState, loadSave, SaveState, saveProgress, UserSettings } from '../features/progress/saveState';
import { buildExplorationProgressFromLevels } from '../features/worlds/explorationMap';
import { Level } from '../features/levels/types';
import { ExplorationMapScreen } from '../features/worlds/ExplorationMapScreen';

type Screen = 'menu' | 'languages' | 'map' | 'explore' | 'game' | 'complete' | 'settings' | 'achievements' | 'daily';

type CompletedLevelSummary = LevelCompleteStats & { levelId: number; rewardCoins: number };

function getShellClass(screen: Screen): string {
  return screen === 'game' ? 'app-shell full-shell gameplay-shell' : 'app-shell full-shell scroll-shell';
}

function screenNeedsLevels(screen: Screen): boolean {
  return screen === 'map' || screen === 'explore' || screen === 'game' || screen === 'complete';
}

export function App() {
  const [save, setSave] = useState(loadSave);
  const [language, setLanguage] = useState<LanguageCode>(save.selectedLanguage);
  const [screen, setScreen] = useState<Screen>('menu');
  const [selectedLevelId, setSelectedLevelId] = useState<number | null>(null);
  const [installAvailable, setInstallAvailable] = useState(false);
  const [isSwitchingLanguage, setIsSwitchingLanguage] = useState(false);
  const [levels, setLevels] = useState<Level[]>([]);
  const [levelsLoading, setLevelsLoading] = useState(false);
  const [completedSummary, setCompletedSummary] = useState<CompletedLevelSummary>({ levelId: 1, rewardCoins: 0, foundWords: 0, bonusWords: 0 });

  useEffect(() => subscribeInstallPrompt(setInstallAvailable), []);

  const labels = translations[language] ?? translations.en;
  const needsLevels = screenNeedsLevels(screen) && !isSwitchingLanguage;

  useEffect(() => {
    let cancelled = false;

    if (!needsLevels) {
      setLevels([]);
      setLevelsLoading(false);
      return () => {
        cancelled = true;
      };
    }

    setLevelsLoading(true);

    void getLevelsByLanguageAsync(language)
      .then((nextLevels) => {
        if (!cancelled) setLevels(nextLevels);
      })
      .finally(() => {
        if (!cancelled) setLevelsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [language, needsLevels]);

  const progress = save.progress[language] ?? { currentLevel: 1, completed: [] };
  const explorationProgress = useMemo(
    () => needsLevels ? buildExplorationProgressFromLevels(levels, progress.completed, progress.currentLevel) : undefined,
    [needsLevels, levels, progress.completed, progress.currentLevel],
  );
  const activeLevelId = selectedLevelId ?? progress.currentLevel;
  const activeLevel = needsLevels ? (levels.find((level) => level.id === activeLevelId) ?? levels[0]) : undefined;

  const updateSave = (producer: (current: SaveState) => SaveState) => {
    setSave((current) => {
      const nextSave = producer(current);
      saveProgress(nextSave);
      return nextSave;
    });
  };

  const handleLanguageChange = (next: LanguageCode) => {
    if (next === language || isSwitchingLanguage) return;

    setIsSwitchingLanguage(true);
    setSelectedLevelId(null);
    setScreen('menu');

    window.setTimeout(() => {
      setLanguage(next);
      updateSave((current) => ({ ...current, selectedLanguage: next }));
      setIsSwitchingLanguage(false);
    }, 80);
  };

  const updateSettings = (settings: UserSettings) => updateSave((current) => ({ ...current, settings }));

  const claimDaily = (reward: number, dailyReward: DailyRewardState) => {
    updateSave((current) => ({
      ...current,
      coins: current.coins + reward,
      dailyReward,
      stats: { ...current.stats, coinsEarned: current.stats.coinsEarned + reward },
    }));
  };

  const spendCoins = (amount: number, hintType?: HintType): boolean => {
    if (save.coins < amount) return false;
    updateSave((current) => current.coins < amount ? current : {
      ...current,
      coins: current.coins - amount,
      stats: {
        ...current.stats,
        hintsUsed: hintType ? current.stats.hintsUsed + 1 : current.stats.hintsUsed,
        hintsByType: hintType ? { ...current.stats.hintsByType, [hintType]: current.stats.hintsByType[hintType] + 1 } : current.stats.hintsByType,
        coinsSpent: current.stats.coinsSpent + amount,
      },
    });
    return true;
  };

  const earnCoins = (amount: number) => {
    updateSave((current) => ({
      ...current,
      coins: current.coins + amount,
      stats: { ...current.stats, bonusWordsFound: current.stats.bonusWordsFound + 1, coinsEarned: current.stats.coinsEarned + amount },
    }));
  };

  const selectLevel = (levelId: number) => {
    setSelectedLevelId(levelId);
    setScreen('game');
  };

  const completeLevel = (stats: LevelCompleteStats) => {
    if (!activeLevel) return;

    const completedLevel = activeLevel;
    const lastLevelId = levels[levels.length - 1]?.id ?? completedLevel.id;
    const nextLevelId = Math.min(completedLevel.id + 1, lastLevelId);

    setCompletedSummary({ levelId: completedLevel.id, rewardCoins: completedLevel.rewardCoins, foundWords: stats.foundWords, bonusWords: stats.bonusWords });
    setSelectedLevelId(nextLevelId);

    updateSave((currentSave) => {
      const current = currentSave.progress[language] ?? { currentLevel: 1, completed: [] };
      const completed = Array.from(new Set([...current.completed, completedLevel.id])).sort((a, b) => a - b);
      return {
        ...currentSave,
        coins: currentSave.coins + completedLevel.rewardCoins,
        progress: { ...currentSave.progress, [language]: { currentLevel: Math.max(current.currentLevel, nextLevelId), completed } },
        stats: {
          ...currentSave.stats,
          wordsFound: currentSave.stats.wordsFound + stats.foundWords,
          levelsCompleted: currentSave.stats.levelsCompleted + 1,
          noHintClears: currentSave.stats.noHintClears + (stats.usedHint ? 0 : 1),
          coinsEarned: currentSave.stats.coinsEarned + completedLevel.rewardCoins,
        },
      };
    });

    setScreen('complete');
  };

  if (isSwitchingLanguage) {
    return (
      <main className="app-shell full-shell scroll-shell">
        <section className="screen-panel menu-screen" aria-live="polite">
          <p className="eyebrow">LEXORA</p>
          <h1>{labels.languages}</h1>
          <p className="subtitle">Switching language...</p>
        </section>
      </main>
    );
  }

  if (needsLevels && levelsLoading) {
    return <main className="app-shell full-shell scroll-shell"><section className="screen-panel menu-screen" aria-live="polite"><p className="eyebrow">LEXORA</p><h1>{labels.title}</h1><p className="subtitle">Loading language pack...</p></section></main>;
  }

  if (needsLevels && !activeLevel) {
    return <main className="app-shell full-shell scroll-shell"><section className="screen-panel menu-screen" aria-labelledby="missing-levels-title"><p className="eyebrow">LEXORA</p><h1 id="missing-levels-title">{labels.title}</h1><p className="subtitle">No playable levels are available for this language pack yet.</p><button className="primary-button" onClick={() => setScreen('languages')}>{labels.languages}</button></section></main>;
  }

  return (
    <main className={getShellClass(screen)}>
      {screen === 'menu' && <MainMenu language={language} coins={save.coins} currentLevel={progress.currentLevel} installAvailable={installAvailable} onLanguages={() => setScreen('languages')} onPlay={() => setScreen('game')} onMap={() => setScreen('map')} onExplore={() => setScreen('explore')} onSettings={() => setScreen('settings')} onAchievements={() => setScreen('achievements')} onDailyReward={() => setScreen('daily')} onInstall={() => void triggerInstallPrompt()} />}
      {screen === 'languages' && <LanguagesScreen language={language} disabled={isSwitchingLanguage} onLanguageChange={handleLanguageChange} onBack={() => setScreen('menu')} />}
      {screen === 'daily' && <DailyRewardScreen labels={labels} dailyReward={save.dailyReward} onBack={() => setScreen('menu')} onClaim={claimDaily} />}
      {screen === 'achievements' && <AchievementsScreen labels={labels} stats={save.stats} onBack={() => setScreen('menu')} />}
      {screen === 'settings' && <SettingsScreen labels={labels} settings={save.settings} onBack={() => setScreen('menu')} onChange={updateSettings} />}
      {screen === 'explore' && <ExplorationMapScreen progress={explorationProgress} onBack={() => setScreen('menu')} />}
      {screen === 'map' && <LevelMap labels={labels} levels={levels} currentLevel={progress.currentLevel} completed={progress.completed} onBack={() => setScreen('menu')} onSelectLevel={selectLevel} />}
      {screen === 'game' && activeLevel && <GameScreen key={`${language}-${activeLevel.id}`} level={activeLevel} labels={labels} coins={save.coins} soundEnabled={save.settings.soundEnabled} vibrationEnabled={save.settings.vibrationEnabled} onBackToMap={() => setScreen('map')} onSpendCoins={spendCoins} onEarnCoins={earnCoins} onComplete={completeLevel} />}
      {screen === 'complete' && <LevelComplete labels={labels} levelId={completedSummary.levelId} rewardCoins={completedSummary.rewardCoins} foundWords={completedSummary.foundWords} bonusWords={completedSummary.bonusWords} onNext={() => setScreen('game')} onMap={() => setScreen('map')} />}
    </main>
  );
}
