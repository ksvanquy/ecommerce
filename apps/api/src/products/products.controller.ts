import { Router, Request, Response } from 'express';
import { productsService } from './products.service.ts';
import { authMiddleware, requireRole, AuthenticatedRequest } from '../shared/middlewares/auth.middleware.ts';
import type { ProductFilters, CreateProductPayload, UpdateProductPayload } from '@repo/shared-types';

export const productsRouter = Router();

/**
 * GET /api/products
 * Fetch paginated list of products with optional category, search, price range, and sort
 */
productsRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const filters: ProductFilters = {
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 8,
      category: (req.query.category as string) || undefined,
      search: (req.query.search as string) || undefined,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
      sortBy: (req.query.sortBy as any) || undefined,
    };

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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi tải danh sách sản phẩm.',
      error: {
        code: 'GET_PRODUCTS_ERROR',
        message: error.message,
      },
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/products/categories
 * Returns list of distinct categories
 */
productsRouter.get('/categories', async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await productsService.getCategories();
    res.json({
      success: true,
      data: categories,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy danh mục sản phẩm.',
      error: {
        code: 'GET_CATEGORIES_ERROR',
        message: error.message,
      },
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/products/:id
 * Retrieve single product detail
 */
productsRouter.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await productsService.getProductById(req.params.id);
    res.json({
      success: true,
      data: product,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Lỗi khi lấy chi tiết sản phẩm.',
      error: {
        code: error.code || 'GET_PRODUCT_ERROR',
        message: error.message,
      },
      timestamp: new Date().toISOString(),
    });
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
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const payload: CreateProductPayload = req.body;
      const created = await productsService.createProduct(payload);

      res.status(201).json({
        success: true,
        message: 'Tạo sản phẩm mới thành công.',
        data: created,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Dữ liệu sản phẩm không hợp lệ.',
        error: {
          code: 'CREATE_PRODUCT_ERROR',
          message: error.message,
        },
        timestamp: new Date().toISOString(),
      });
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
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const payload: UpdateProductPayload = req.body;
      const updated = await productsService.updateProduct(req.params.id, payload);

      res.json({
        success: true,
        message: 'Cập nhật sản phẩm thành công.',
        data: updated,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      const statusCode = error.statusCode || 400;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Cập nhật sản phẩm thất bại.',
        error: {
          code: error.code || 'UPDATE_PRODUCT_ERROR',
          message: error.message,
        },
        timestamp: new Date().toISOString(),
      });
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
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      await productsService.deleteProduct(req.params.id);

      res.json({
        success: true,
        message: 'Xóa sản phẩm thành công.',
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      const statusCode = error.statusCode || 400;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Xóa sản phẩm thất bại.',
        error: {
          code: error.code || 'DELETE_PRODUCT_ERROR',
          message: error.message,
        },
        timestamp: new Date().toISOString(),
      });
    }
  }
);
