// React entry point and root rendering
import React from 'react';
import ReactDOM from 'react-dom/client';

// Main application component
import App from './App.jsx';

// Global CSS entry
import './index.css';

// Render React app into root DOM node
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
