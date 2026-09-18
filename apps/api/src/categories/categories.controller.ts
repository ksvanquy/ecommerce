import { Router, Request, Response, NextFunction } from 'express';
import {
  createCategorySchema,
  updateCategorySchema,
} from '@repo/shared-types';
import { categoriesService } from './categories.service.ts';
import { authMiddleware, requireRole } from '../shared/middlewares/auth.middleware.ts';
import { validateBody } from '../shared/middlewares/validation.middleware.ts';

export const categoriesRouter = Router();

/**
 * GET /api/categories/tree
 * Returns nested category tree for MegaMenu & Navigation
 */
categoriesRouter.get('/tree', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const tree = await categoriesService.getCategoryTree();
    res.json({
      success: true,
      data: tree,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/categories
 * Returns flat list of all categories
 */
categoriesRouter.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await categoriesService.getAllCategories();
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
 * GET /api/categories/:idOrSlug
 * Returns single category by ID or slug
 */
categoriesRouter.get('/:idOrSlug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await categoriesService.getCategoryByIdOrSlug(req.params.idOrSlug);
    res.json({
      success: true,
      data: category,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/categories (Admin only)
 * Creates a new category
 */
categoriesRouter.post(
  '/',
  authMiddleware,
  requireRole(['admin']),
  validateBody(createCategorySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const created = await categoriesService.createCategory(req.body);
      res.status(201).json({
        success: true,
        message: 'Tạo danh mục thành công',
        data: created,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * PUT /api/categories/:id (Admin only)
 * Updates an existing category
 */
categoriesRouter.put(
  '/:id',
  authMiddleware,
  requireRole(['admin']),
  validateBody(updateCategorySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updated = await categoriesService.updateCategory(req.params.id, req.body);
      res.json({
        success: true,
        message: 'Cập nhật danh mục thành công',
        data: updated,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * DELETE /api/categories/:id (Admin only)
 * Deletes a category
 */
categoriesRouter.delete(
  '/:id',
  authMiddleware,
  requireRole(['admin']),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await categoriesService.deleteCategory(req.params.id);
      res.json({
        success: true,
        message: 'Đã xóa danh mục thành công',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  },
);
