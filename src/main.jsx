import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const rootEl = document.getElementById('root');
const initialPath = typeof window !== 'undefined' ? window.location.pathname : '/';

// Hydrate only when pre-rendered HTML elements are present (SSG production)
const hasPrerenderedChildren = Array.from(rootEl.childNodes).some(
  (node) => node.nodeType === 1
);

if (hasPrerenderedChildren) {
  ReactDOM.hydrateRoot(
    rootEl,
    <React.StrictMode>
      <App initialPath={initialPath} />
    </React.StrictMode>
  );
} else {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <App initialPath={initialPath} />
    </React.StrictMode>
  );
}
