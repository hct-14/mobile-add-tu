import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import SeedUsers from './lib/SeedUsers.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SeedUsers />
    <App />
  </StrictMode>,
);
