export type HapticPattern = 'success' | 'error' | 'select' | 'reward';

const patterns: Record<HapticPattern, number | number[]> = {
  select: 8,
  success: [18, 30, 18],
  reward: [25, 40, 25],
  error: [40, 30, 40],
};

export function triggerHaptic(pattern: HapticPattern, enabled: boolean): void {
  try {
    if (!enabled) return;
    if (typeof window === 'undefined') return;
    if (!('navigator' in window)) return;

    const vibrate = window.navigator.vibrate;
    if (typeof vibrate !== 'function') return;

    vibrate(patterns[pattern]);
  } catch {
    // Haptic feedback must never crash gameplay.
  }
}
