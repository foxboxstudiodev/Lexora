export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

let deferredInstallPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<(available: boolean) => void>();

function notify(): void {
  listeners.forEach((listener) => listener(deferredInstallPrompt !== null));
}

export function setupInstallPromptListener(): void {
  if (typeof window === 'undefined') return;

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredInstallPrompt = event as BeforeInstallPromptEvent;
    notify();
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    notify();
  });
}

export function subscribeInstallPrompt(listener: (available: boolean) => void): () => void {
  listeners.add(listener);
  listener(deferredInstallPrompt !== null);

  return () => {
    listeners.delete(listener);
  };
}

export async function triggerInstallPrompt(): Promise<boolean> {
  if (!deferredInstallPrompt) return false;

  const promptEvent = deferredInstallPrompt;
  deferredInstallPrompt = null;
  notify();

  await promptEvent.prompt();
  const choice = await promptEvent.userChoice;
  return choice.outcome === 'accepted';
}
