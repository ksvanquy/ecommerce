import express, { json } from 'express';
import { healthRouter } from './routes/health.router.ts';
import { authRouter } from './users/index.ts';
import { productsRouter } from './products/index.ts';
import { categoriesRouter } from './categories/index.ts';
import { brandsRouter } from './brands/index.ts';
import { ordersRouter } from './orders/index.ts';
import { cartRouter } from './cart/index.ts';
import { couponsRouter } from './coupons/index.ts';
import { paymentsRouter } from './payments/index.ts';
import { reviewsRouter } from './reviews/index.ts';
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
    phase: 'Phase 6: E-Commerce Complete Suite (Cart, Coupons, Payments, Reviews)',
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

// Brands routes (/brands and /api/brands)
app.use('/brands', brandsRouter);
app.use('/api/brands', brandsRouter);

// Products catalog routes (/products and /api/products)
app.use('/products', productsRouter);
app.use('/api/products', productsRouter);

// Categories routes (/categories and /api/categories)
app.use('/categories', categoriesRouter);
app.use('/api/categories', categoriesRouter);

// Cart routes (/cart and /api/cart)
app.use('/cart', cartRouter);
app.use('/api/cart', cartRouter);

// Coupons routes (/coupons and /api/coupons)
app.use('/coupons', couponsRouter);
app.use('/api/coupons', couponsRouter);

// Payments routes (/payments and /api/payments)
app.use('/payments', paymentsRouter);
app.use('/api/payments', paymentsRouter);

// Reviews routes (/reviews and /api/reviews)
app.use('/reviews', reviewsRouter);
app.use('/api/reviews', reviewsRouter);

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
