import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { CMSProvider } from './context/CMSContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <CMSProvider>
    <App />
  </CMSProvider>
);
