import { brandsRepository } from './brands.repository.ts';
import type { Brand } from '@repo/shared-types';

export class BrandsService {
  async getAllBrands(): Promise<Brand[]> {
    return brandsRepository.findAll();
  }

  async getBrandById(id: string): Promise<Brand | null> {
    return brandsRepository.findById(id);
  }
}

export const brandsService = new BrandsService();
