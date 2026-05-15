import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app/App';
import { ErrorBoundary } from './app/ErrorBoundary';
import { setupInstallPromptListener } from './features/pwa/installPrompt';
import { registerServiceWorker } from './features/pwa/registerServiceWorker';
import './styles/global.css';
import './styles/themes.css';
import './styles/accessibility.css';

setupInstallPromptListener();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);

registerServiceWorker();
