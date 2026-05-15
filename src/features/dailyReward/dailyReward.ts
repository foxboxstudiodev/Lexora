import { DailyRewardState } from '../progress/saveState';

export type DailyRewardStatus = {
  canClaim: boolean;
  reward: number;
  nextStreak: number;
  today: string;
};

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function daysBetween(previousDateKey: string, nextDateKey: string): number {
  const previous = new Date(`${previousDateKey}T00:00:00.000Z`).getTime();
  const next = new Date(`${nextDateKey}T00:00:00.000Z`).getTime();
  return Math.round((next - previous) / 86_400_000);
}

export function getDailyRewardStatus(state: DailyRewardState, now = new Date()): DailyRewardStatus {
  const today = toDateKey(now);

  if (state.lastClaimDate === today) {
    return {
      canClaim: false,
      reward: 0,
      nextStreak: state.streak,
      today,
    };
  }

  const gap = state.lastClaimDate ? daysBetween(state.lastClaimDate, today) : 0;
  const nextStreak = gap === 1 ? state.streak + 1 : 1;
  const reward = Math.min(100, 20 + nextStreak * 5);

  return {
    canClaim: true,
    reward,
    nextStreak,
    today,
  };
}

export function claimDailyReward(state: DailyRewardState, now = new Date()) {
  const status = getDailyRewardStatus(state, now);
  if (!status.canClaim) {
    return { status, nextState: state };
  }

  return {
    status,
    nextState: {
      lastClaimDate: status.today,
      streak: status.nextStreak,
    },
  };
}
