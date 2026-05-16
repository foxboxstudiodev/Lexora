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
import './styles/accessibility.css';

setupInstallPromptListener();

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

registerServiceWorker();
