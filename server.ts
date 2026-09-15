import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import app from './apps/api/src/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const distPath = path.resolve(__dirname, 'dist');

// Serve static assets from production build
app.use(express.static(distPath));

// Fallback to index.html for SPA routes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path === '/health') {
    return next();
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Ecommerce Monorepo] Server running on http://0.0.0.0:${PORT}`);
});
