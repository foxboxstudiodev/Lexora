import { achievements, getAchievementProgress, isAchievementUnlocked } from './achievements';
import { Labels } from '../i18n/translations';
import { PlayerStats } from '../progress/saveState';

type AchievementsScreenProps = {
  labels: Labels;
  stats: PlayerStats;
  onBack: () => void;
};

export function AchievementsScreen({ labels, stats, onBack }: AchievementsScreenProps) {
  const achievementStats = {
    wordsFound: stats.wordsFound,
    levelsCompleted: stats.levelsCompleted,
    bonusWordsFound: stats.bonusWordsFound,
    noHintClears: stats.noHintClears,
  };

  return (
    <section className="screen-panel achievements-screen">
      <div className="screen-header">
        <div>
          <p className="eyebrow">LEXORA</p>
          <h2>{labels.achievements}</h2>
        </div>
        <button className="secondary-button compact" onClick={onBack}>{labels.back}</button>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><span>{labels.words}</span><strong>{stats.wordsFound}</strong></div>
        <div className="stat-card"><span>{labels.bonus}</span><strong>{stats.bonusWordsFound}</strong></div>
        <div className="stat-card"><span>{labels.levels}</span><strong>{stats.levelsCompleted}</strong></div>
        <div className="stat-card"><span>{labels.coinsEarned}</span><strong>{stats.coinsEarned}</strong></div>
        <div className="stat-card"><span>{labels.hintsUsed}</span><strong>{stats.hintsUsed}</strong></div>
        <div className="stat-card"><span>{labels.hintLetter}</span><strong>{stats.hintsByType.reveal_letter}</strong></div>
        <div className="stat-card"><span>{labels.hintStart}</span><strong>{stats.hintsByType.reveal_word_start}</strong></div>
        <div className="stat-card"><span>{labels.hintWord}</span><strong>{stats.hintsByType.reveal_word}</strong></div>
      </div>

      <div className="achievement-list">
        {achievements.map((achievement) => {
          const progress = getAchievementProgress(achievement.id, achievementStats);
          const unlocked = isAchievementUnlocked(achievement, achievementStats);
          const percent = Math.min(100, Math.round((progress / achievement.target) * 100));
          return (
            <article key={achievement.id} className={unlocked ? 'achievement-card unlocked' : 'achievement-card'}>
              <div>
                <strong>{achievement.title}</strong>
                <p>{achievement.description}</p>
              </div>
              <span>{progress}/{achievement.target}</span>
              <div className="achievement-progress" aria-hidden="true">
                <i style={{ width: `${percent}%` }} />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
