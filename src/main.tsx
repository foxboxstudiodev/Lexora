import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import { ErrorBoundary } from './app/ErrorBoundary';
import { setupInstallPromptListener } from './features/pwa/installPrompt';
import { registerServiceWorker } from './features/pwa/registerServiceWorker';
import './styles/global.css';
import './styles/themes.css';
import './styles/wheel.css';
import './styles/exploration.css';
import './styles/languageSelector.css';
import './styles/accessibility.css';
import './styles/japaneseTypography.css';

async function clearRuntimeState(): Promise<void> {
  try {
    window.localStorage.removeItem('lexora.save.v1');
  } catch {
    // Ignore storage cleanup failures.
  }

  try {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
    }
  } catch {
    // Ignore service worker cleanup failures.
  }

  try {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
    }
  } catch {
    // Ignore cache cleanup failures.
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function showRecoveryScreen(reason: string): void {
  const root = document.getElementById('root');
  if (!root) return;

  root.innerHTML = `
    <main style="min-height:100vh;display:grid;place-items:center;background:#0d1528;color:#fff;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;padding:24px;">
      <section style="width:min(520px,100%);border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.08);border-radius:24px;padding:24px;box-shadow:0 24px 80px rgba(0,0,0,.35);">
        <p style="margin:0 0 8px;letter-spacing:.18em;text-transform:uppercase;color:#9fb3ff;font-size:12px;font-weight:800;">LEXORA</p>
        <h1 style="margin:0 0 12px;font-size:30px;line-height:1.1;">Recovery mode</h1>
        <p style="margin:0 0 18px;color:#d8e0ff;font-size:15px;line-height:1.5;">The app detected a startup problem. Reset local cache and reopen the game.</p>
        <p style="margin:0 0 18px;color:#91a1c7;font-size:12px;line-height:1.4;">Reason: ${escapeHtml(reason)}</p>
        <button id="lexora-recovery-reset" style="width:100%;border:0;border-radius:16px;background:#8ea2ff;color:#081126;font-size:16px;font-weight:800;padding:14px 18px;">Reset and open Lexora</button>
      </section>
    </main>
  `;

  document.getElementById('lexora-recovery-reset')?.addEventListener('click', () => {
    void clearRuntimeState().then(() => {
      window.location.replace('/?fresh=' + Date.now());
    });
  });
}

function rootHasVisibleContent(): boolean {
  const visibleText = document.getElementById('root')?.textContent?.trim() ?? '';
  return visibleText.length > 0;
}

window.addEventListener('error', (event) => {
  console.error('Lexora global runtime error:', event.error ?? event.message);

  window.setTimeout(() => {
    if (!rootHasVisibleContent()) {
      showRecoveryScreen(event.message || 'runtime-error');
    }
  }, 0);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Lexora unhandled promise rejection:', event.reason);

  window.setTimeout(() => {
    if (!rootHasVisibleContent()) {
      showRecoveryScreen(String(event.reason ?? 'unhandled-rejection'));
    }
  }, 0);
});

if (new URLSearchParams(window.location.search).has('reset')) {
  void clearRuntimeState().then(() => {
    window.location.replace('/?fresh=' + Date.now());
  });
}

setupInstallPromptListener();

const root = document.getElementById('root');

if (!root) {
  showRecoveryScreen('missing-root');
} else {
  createRoot(root).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );

  window.setTimeout(() => {
    if (!rootHasVisibleContent()) showRecoveryScreen('empty-render');
  }, 4500);
}

registerServiceWorker();
