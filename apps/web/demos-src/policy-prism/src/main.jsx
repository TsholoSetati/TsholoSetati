import React from 'react';
import { createRoot } from 'react-dom/client';
import PolicyPrism from './PolicyPrism.jsx';

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <PolicyPrism />
  </React.StrictMode>,
);
