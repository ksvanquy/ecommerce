import { Router } from 'express';
import { brandsController } from './brands.controller.ts';
import { authMiddleware, requireRole } from '../shared/middlewares/auth.middleware.ts';

export const brandsRouter = Router();

brandsRouter.get('/', (req, res, next) => brandsController.getAll(req, res, next));
brandsRouter.get('/:id', (req, res, next) => brandsController.getById(req, res, next));

brandsRouter.post('/', authMiddleware, requireRole(['admin']), (req, res, next) => brandsController.create(req, res, next));
brandsRouter.put('/:id', authMiddleware, requireRole(['admin']), (req, res, next) => brandsController.update(req, res, next));
brandsRouter.delete('/:id', authMiddleware, requireRole(['admin']), (req, res, next) => brandsController.delete(req, res, next));

export * from './brands.repository.ts';
export * from './brands.service.ts';
export * from './brands.controller.ts';
