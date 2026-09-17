import { brandsRepository } from './brands.repository.ts';
import type { Brand } from '@repo/shared-types';

export class BrandsService {
  async getAllBrands(): Promise<Brand[]> {
    return brandsRepository.findAll();
  }

  async getBrandById(id: string): Promise<Brand | null> {
    return brandsRepository.findById(id);
  }

  async createBrand(data: { name: string; slug: string; logoUrl?: string; description?: string; website?: string; country?: string; isActive?: boolean }): Promise<Brand> {
    if (!data.name || data.name.trim().length < 2) {
      throw new Error('Tên thương hiệu phải có ít nhất 2 ký tự.');
    }
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return brandsRepository.create({ ...data, slug });
  }

  async updateBrand(id: string, data: Partial<{ name: string; slug: string; logoUrl: string; description: string; website: string; country: string; isActive: boolean }>): Promise<Brand> {
    const existing = await this.getBrandById(id);
    if (!existing) {
      const error: any = new Error('Không tìm thấy thương hiệu');
      error.statusCode = 404;
      throw error;
    }
    const updated = await brandsRepository.update(id, data);
    if (!updated) {
      throw new Error('Cập nhật thương hiệu thất bại');
    }
    return updated;
  }

  async deleteBrand(id: string): Promise<boolean> {
    const existing = await this.getBrandById(id);
    if (!existing) {
      const error: any = new Error('Không tìm thấy thương hiệu');
      error.statusCode = 404;
      throw error;
    }
    return brandsRepository.delete(id);
  }
}

export const brandsService = new BrandsService();
