import { describe, expect, it, vi } from 'vitest';
import { subscribeInstallPrompt } from './installPrompt';

describe('install prompt manager', () => {
  it('notifies subscribers with current availability', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeInstallPrompt(listener);

    expect(listener).toHaveBeenCalledWith(false);

    unsubscribe();
  });
});
