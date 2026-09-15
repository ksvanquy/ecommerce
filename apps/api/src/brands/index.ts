import { Router } from 'express';
import { brandsController } from './brands.controller.ts';

export const brandsRouter = Router();

brandsRouter.get('/', (req, res, next) => brandsController.getAll(req, res, next));
brandsRouter.get('/:id', (req, res, next) => brandsController.getById(req, res, next));

export * from './brands.repository.ts';
export * from './brands.service.ts';
export * from './brands.controller.ts';
