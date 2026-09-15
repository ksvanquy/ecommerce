import { productsRepository, PaginatedResult } from './products.repository.ts';
import type {
  Product,
  ProductFilters,
  CreateProductPayload,
  UpdateProductPayload,
} from '@repo/shared-types';

export class ProductsService {
  async getProducts(filters: ProductFilters = {}): Promise<PaginatedResult<Product>> {
    return productsRepository.findMany(filters);
  }

  async getProductById(id: string): Promise<Product> {
    if (!id || typeof id !== 'string') {
      throw new Error('ID sản phẩm không hợp lệ.');
    }

    const product = await productsRepository.findById(id);
    if (!product) {
      const error: any = new Error(`Không tìm thấy sản phẩm với mã: ${id}`);
      error.statusCode = 404;
      error.code = 'PRODUCT_NOT_FOUND';
      throw error;
    }

    return product;
  }

  async getCategories(): Promise<string[]> {
    return productsRepository.getCategories();
  }

  async createProduct(data: CreateProductPayload): Promise<Product> {
    if (!data.name || data.name.trim().length < 2) {
      throw new Error('Tên sản phẩm phải có ít nhất 2 ký tự.');
    }
    if (typeof data.price !== 'number' || data.price < 0) {
      throw new Error('Giá sản phẩm phải là số không âm.');
    }
    if (!data.category || data.category.trim().length === 0) {
      throw new Error('Danh mục sản phẩm là bắt buộc.');
    }

    return productsRepository.create(data);
  }

  async updateProduct(id: string, data: UpdateProductPayload): Promise<Product> {
    const existing = await this.getProductById(id);
    if (!existing) {
      const error: any = new Error(`Không tìm thấy sản phẩm với mã: ${id}`);
      error.statusCode = 404;
      throw error;
    }

    const updated = await productsRepository.update(id, data);
    if (!updated) {
      throw new Error('Cập nhật sản phẩm thất bại.');
    }

    return updated;
  }

  async deleteProduct(id: string): Promise<boolean> {
    await this.getProductById(id);
    return productsRepository.delete(id);
  }
}

export const productsService = new ProductsService();
