import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Register the service worker for offline support and PWA install prompt.
// Only runs in production — Vite sets import.meta.env.PROD to true on build.
// In development (npm run dev) we skip it so HMR works without interference.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        console.log('[SW] Registered, scope:', registration.scope);

        // Check if a new service worker is waiting to activate.
        // This happens when the user has the app open and a new version
        // was deployed. The new SW installs but waits for the tab to close.
        // Here we activate it immediately so the user always gets the latest.
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;
          newWorker.addEventListener('statechange', () => {
            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              // New version is ready — activate it immediately.
              // In a real app you'd show a "Update available" toast here
              // and let the user decide when to reload.
              newWorker.postMessage({ type: 'SKIP_WAITING' });
            }
          });
        });
      })
      .catch((err) => console.error('[SW] Registration failed:', err));
  });
}
