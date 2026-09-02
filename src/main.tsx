import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ProfileProvider } from './context/ProfileContext';
import { InstrumentProvider } from './contexts/InstrumentContext';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ProfileProvider>
        <InstrumentProvider>
          <App />
        </InstrumentProvider>
      </ProfileProvider>
    </ErrorBoundary>
  </StrictMode>,
);
