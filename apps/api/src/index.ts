import express, { json } from 'express';
import { healthRouter } from './routes/health.router.ts';
import { authRouter } from './users/users.controller.ts';
import { productsRouter } from './products/products.controller.ts';
import { ordersRouter } from './orders/orders.controller.ts';

export const app = express();

app.use(json());

// Support both /health and /api/health
app.use(healthRouter);
app.use('/api', healthRouter);

// Support both /auth and /api/auth
app.use('/auth', authRouter);
app.use('/api/auth', authRouter);

// Support both /products and /api/products
app.use('/products', productsRouter);
app.use('/api/products', productsRouter);

// Support both /orders and /api/orders
app.use('/orders', ordersRouter);
app.use('/api/orders', ordersRouter);

// Root greeting & status
app.get('/api/info', (_req, res) => {
  res.json({
    name: 'ecommerce-api',
    phase: 'Phase 4 - Module Orders (Transaction & Inventory)',
    status: 'operational',
    timestamp: new Date().toISOString(),
  });
});

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

if (process.env.STANDALONE_API === 'true') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[apps/api] listening on http://0.0.0.0:${PORT}`);
  });
}

export default app;
