import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App';
import './styles/global.css';

// Get the root element
const rootElement = document.getElementById('root');

// Create a root
if (rootElement) {
  const root = createRoot(rootElement);
  
  // Render the React application
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error('Root element not found');
}
