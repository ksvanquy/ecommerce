import { Router, Request, Response, NextFunction } from 'express';
import { productsService } from './products.service.ts';
import { authMiddleware, requireRole, AuthenticatedRequest } from '../shared/middlewares/auth.middleware.ts';
import { validateBody, validateQuery } from '../shared/middlewares/validation.middleware.ts';
import {
  createProductSchema,
  updateProductSchema,
  productFiltersSchema,
  type ProductFilters,
  type CreateProductPayload,
  type UpdateProductPayload,
} from '@repo/shared-types';

export const productsRouter = Router();

/**
 * GET /api/products
 * Fetch paginated list of products with optional category, search, price range, and sort
 */
productsRouter.get(
  '/',
  validateQuery(productFiltersSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = req.query as unknown as ProductFilters;
      const result = await productsService.getProducts(filters);

      res.json({
        success: true,
        message: 'Lấy danh sách sản phẩm thành công.',
        data: result.items,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/products/categories
 * Returns list of distinct categories
 */
productsRouter.get('/categories', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const categories = await productsService.getCategories();
    res.json({
      success: true,
      data: categories,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/products/:id
 * Retrieve single product detail
 */
productsRouter.get('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const product = await productsService.getProductById(req.params.id);
    res.json({
      success: true,
      data: product,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/products
 * Create a new product (Protected: requires admin role)
 */
productsRouter.post(
  '/',
  authMiddleware,
  requireRole(['admin']),
  validateBody(createProductSchema),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const payload: CreateProductPayload = req.body;
      const created = await productsService.createProduct(payload);

      res.status(201).json({
        success: true,
        message: 'Tạo sản phẩm mới thành công.',
        data: created,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/products/:id
 * Update an existing product (Protected: requires admin role)
 */
productsRouter.put(
  '/:id',
  authMiddleware,
  requireRole(['admin']),
  validateBody(updateProductSchema),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const payload: UpdateProductPayload = req.body;
      const updated = await productsService.updateProduct(req.params.id, payload);

      res.json({
        success: true,
        message: 'Cập nhật sản phẩm thành công.',
        data: updated,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/products/:id
 * Delete a product (Protected: requires admin role)
 */
productsRouter.delete(
  '/:id',
  authMiddleware,
  requireRole(['admin']),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await productsService.deleteProduct(req.params.id);

      res.json({
        success: true,
        message: 'Xóa sản phẩm thành công.',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);
