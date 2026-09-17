import type { Request, Response, NextFunction } from 'express';
import { brandsService } from './brands.service.ts';

export class BrandsController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const brands = await brandsService.getAllBrands();
      res.json({
        success: true,
        data: brands,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const brand = await brandsService.getBrandById(id);
      if (!brand) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Không tìm thấy thương hiệu' },
          timestamp: new Date().toISOString(),
        });
        return;
      }
      res.json({
        success: true,
        data: brand,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const created = await brandsService.createBrand(req.body);
      res.status(201).json({
        success: true,
        message: 'Tạo thương hiệu thành công',
        data: created,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updated = await brandsService.updateBrand(id, req.body);
      res.json({
        success: true,
        message: 'Cập nhật thương hiệu thành công',
        data: updated,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await brandsService.deleteBrand(id);
      res.json({
        success: true,
        message: 'Xóa thương hiệu thành công',
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }
}

export const brandsController = new BrandsController();
