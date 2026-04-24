import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { warmupCache } from './lib/cachePreload';
import { InitialSkeleton } from './components/InitialSkeleton';

// Render skeleton IMMEDIATELY before JS loads (prevents white flash)
const root = document.getElementById('root')!;
const skeletonRoot = createRoot(root);
skeletonRoot.render(<InitialSkeleton />);

// Warm up cache BEFORE React renders for instant data availability
warmupCache();

// Register Service Worker for faster subsequent loads
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      (registration) => {
        console.log('ServiceWorker registration successful:', registration.scope);
      },
      (err) => {
        console.log('ServiceWorker registration failed:', err);
      }
    );
  });
}

// Dynamic import App to let skeleton show first
async function renderApp() {
  const { createRoot: createReactRoot } = await import('react-dom/client');
  
  // Replace skeleton with actual app
  createReactRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

// Start app rendering after a brief delay to show skeleton
requestAnimationFrame(() => {
  requestIdleCallback(() => renderApp(), { timeout: 100 });
});
