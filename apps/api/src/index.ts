import express, { json } from 'express';
import { healthRouter } from './routes/health.router.ts';
import { authRouter } from './users/index.ts';
import { productsRouter } from './products/index.ts';
import { categoriesRouter } from './categories/index.ts';
import { ordersRouter } from './orders/index.ts';
import { errorHandler, notFoundHandler } from './shared/middlewares/error.middleware.ts';
import { initializeDatabase } from './init-db.ts';

export const app = express();

// Initialize database schema and seeds
initializeDatabase().catch((err) => {
  console.warn('[DB Init] Async initialization notice:', err?.message || err);
});

// Parse JSON request body
app.use(json());

// API Info endpoint
app.get('/api/info', (_req, res) => {
  res.json({
    name: 'ecommerce-api',
    version: '1.0.0',
    phase: 'Phase 5: Hoàn thiện & Vận hành (Error Handling, Zod Validation & Production Ready)',
    status: 'operational',
    timestamp: new Date().toISOString(),
  });
});

// Health check routes (/health and /api/health)
app.use(healthRouter);
app.use('/api', healthRouter);

// Auth & Users routes (/auth and /api/auth)
app.use('/auth', authRouter);
app.use('/api/auth', authRouter);

// Products catalog routes (/products and /api/products)
app.use('/products', productsRouter);
app.use('/api/products', productsRouter);

// Categories routes (/categories and /api/categories)
app.use('/categories', categoriesRouter);
app.use('/api/categories', categoriesRouter);

// Orders & Checkout routes (/orders and /api/orders)
app.use('/orders', ordersRouter);
app.use('/api/orders', ordersRouter);

// 404 Not Found handler for unknown API routes
app.use('/api/*', notFoundHandler);

// Centralized Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

if (process.env.STANDALONE_API === 'true') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[apps/api] listening on http://0.0.0.0:${PORT}`);
  });
}

export default app;
