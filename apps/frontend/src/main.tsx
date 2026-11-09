import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import './shared/theme.css';

createRoot(document.getElementById('root')!).render(<App />);
