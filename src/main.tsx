import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app/App';
import { SessionProvider } from './context/SessionContext';
import { ThemeProvider } from './context/ThemeContext';
import './styles/styles.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find root element to mount React application.');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <SessionProvider>
        <App />
      </SessionProvider>
    </ThemeProvider>
  </React.StrictMode>
);
