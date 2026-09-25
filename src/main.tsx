import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from './context/AuthContext';
import './index.css';

// In AI Studio / preview iframe environments, HMR WebSockets may close or be blocked.
// Filter out spurious WebSocket connection closures so they do not trigger unhandled error overlays.
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event?.reason;
    const msg = typeof reason === 'string' ? reason : reason?.message || '';
    if (msg.includes('WebSocket') || msg.includes('ws') || msg.includes('closed without opened')) {
      event.preventDefault();
      event.stopPropagation();
    }
  });

  window.addEventListener('error', (event) => {
    const msg = event?.message || '';
    if (msg.includes('WebSocket') || msg.includes('failed to connect to websocket')) {
      event.preventDefault();
      event.stopPropagation();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
);
