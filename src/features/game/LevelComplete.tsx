import { Labels } from '../i18n/translations';

type LevelCompleteProps = {
  labels: Labels;
  levelId: number;
  rewardCoins: number;
  foundWords: number;
  bonusWords: number;
  onNext: () => void;
  onMap: () => void;
};

export function LevelComplete({ labels, levelId, rewardCoins, foundWords, bonusWords, onNext, onMap }: LevelCompleteProps) {
  return (
    <section className="screen-panel complete-screen">
      <p className="eyebrow">LEXORA</p>
      <h2>{labels.complete}</h2>
      <p className="subtitle">{labels.level} {levelId}</p>

      <div className="reward-card">
        <span>Reward</span>
        <strong>+{rewardCoins}</strong>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <span>{labels.found}</span>
          <strong>{foundWords}</strong>
        </div>
        <div className="stat-card">
          <span>{labels.bonus}</span>
          <strong>{bonusWords}</strong>
        </div>
      </div>

      <div className="primary-actions">
        <button className="primary-button" onClick={onNext}>{labels.next}</button>
        <button className="secondary-button" onClick={onMap}>Levels</button>
      </div>
    </section>
  );
}
