import React from 'react';
import { createRoot } from 'react-dom/client';
import { ScoreRouter } from './ScoreRouter.js';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<ScoreRouter />);