import { describe, expect, it } from 'vitest';
import { claimDailyReward, getDailyRewardStatus } from './dailyReward';

describe('daily reward engine', () => {
  it('allows the first claim', () => {
    const status = getDailyRewardStatus({ lastClaimDate: null, streak: 0 }, new Date('2026-01-01T10:00:00.000Z'));
    expect(status.canClaim).toBe(true);
    expect(status.nextStreak).toBe(1);
    expect(status.reward).toBe(25);
  });

  it('blocks duplicate claims on the same day', () => {
    const status = getDailyRewardStatus({ lastClaimDate: '2026-01-01', streak: 1 }, new Date('2026-01-01T22:00:00.000Z'));
    expect(status.canClaim).toBe(false);
    expect(status.reward).toBe(0);
  });

  it('increments streak on consecutive days', () => {
    const result = claimDailyReward({ lastClaimDate: '2026-01-01', streak: 1 }, new Date('2026-01-02T10:00:00.000Z'));
    expect(result.status.canClaim).toBe(true);
    expect(result.nextState.streak).toBe(2);
    expect(result.status.reward).toBe(30);
  });

  it('resets streak after a missed day', () => {
    const result = claimDailyReward({ lastClaimDate: '2026-01-01', streak: 3 }, new Date('2026-01-04T10:00:00.000Z'));
    expect(result.nextState.streak).toBe(1);
    expect(result.status.reward).toBe(25);
  });

  it('caps daily reward at 100 coins', () => {
    const result = claimDailyReward({ lastClaimDate: '2026-01-01', streak: 99 }, new Date('2026-01-02T10:00:00.000Z'));
    expect(result.status.reward).toBe(100);
    expect(result.nextState.streak).toBe(100);
  });
});
