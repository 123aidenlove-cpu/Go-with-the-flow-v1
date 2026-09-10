import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ProfileProvider } from './context/ProfileContext';
import { InstrumentProvider } from './contexts/InstrumentContext';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import { AutoScaler } from './components/AutoScaler.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ProfileProvider>
        <InstrumentProvider>
          <AutoScaler>
            <App />
          </AutoScaler>
        </InstrumentProvider>
      </ProfileProvider>
    </ErrorBoundary>
  </StrictMode>,
);
