import { claimDailyReward, getDailyRewardStatus } from './dailyReward';
import { Labels } from '../i18n/translations';
import { DailyRewardState } from '../progress/saveState';

type DailyRewardScreenProps = {
  labels: Labels;
  dailyReward: DailyRewardState;
  onBack: () => void;
  onClaim: (reward: number, nextState: DailyRewardState) => void;
};

export function DailyRewardScreen({ labels, dailyReward, onBack, onClaim }: DailyRewardScreenProps) {
  const status = getDailyRewardStatus(dailyReward);

  const handleClaim = () => {
    const result = claimDailyReward(dailyReward);
    if (!result.status.canClaim) return;
    onClaim(result.status.reward, result.nextState);
  };

  return (
    <section className="screen-panel daily-screen">
      <div className="screen-header">
        <div>
          <p className="eyebrow">LEXORA</p>
          <h2>{labels.dailyReward}</h2>
        </div>
        <button className="secondary-button compact" onClick={onBack}>{labels.back}</button>
      </div>

      <div className="daily-card">
        <span>{labels.streak}</span>
        <strong>{status.nextStreak}</strong>
        <p>+{status.reward || 0} {labels.coins}</p>
      </div>

      <button className="primary-button daily-claim" disabled={!status.canClaim} onClick={handleClaim}>
        {status.canClaim ? labels.claim : labels.claimedToday}
      </button>
    </section>
  );
}
