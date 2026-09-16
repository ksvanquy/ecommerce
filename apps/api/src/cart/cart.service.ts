import { cartRepository } from './cart.repository.ts';
import { productsRepository } from '../products/index.ts';
import { AppError } from '../shared/errors/AppError.ts';
import type { AddToCartPayload, UpdateCartItemPayload, Cart } from '@repo/shared-types';

export class CartService {
  async getCart(userId?: string | null, sessionId?: string | null): Promise<Cart> {
    if (!userId && !sessionId) {
      throw new AppError('Cần cung cấp thông tin người dùng hoặc session ID để xem giỏ hàng', 400, 'MISSING_IDENTIFIER');
    }

    const cartRecord = await cartRepository.getOrCreateCart(userId, sessionId);
    const populated = await cartRepository.getPopulatedCart(cartRecord.id);

    if (!populated) {
      throw new AppError('Không thể tải thông tin giỏ hàng', 500, 'CART_FETCH_ERROR');
    }

    return populated;
  }

  async addItem(payload: AddToCartPayload, userId?: string | null, sessionId?: string | null): Promise<Cart> {
    if (!userId && !sessionId) {
      throw new AppError('Cần cung cấp thông tin người dùng hoặc session ID để thêm vào giỏ hàng', 400, 'MISSING_IDENTIFIER');
    }

    // Verify product exists
    const product = await productsRepository.findById(payload.productId);
    if (!product) {
      throw new AppError(`Sản phẩm không tồn tại (ID: ${payload.productId})`, 404, 'PRODUCT_NOT_FOUND');
    }

    // Verify variant if provided
    if (payload.variantId) {
      const variant = product.variants?.find((v) => v.id === payload.variantId);
      if (!variant) {
        throw new AppError(`Phiên bản sản phẩm không tồn tại (ID: ${payload.variantId})`, 404, 'VARIANT_NOT_FOUND');
      }
      if (variant.inventory <= 0) {
        throw new AppError(`Phiên bản ${variant.name} hiện đã hết hàng`, 400, 'OUT_OF_STOCK');
      }
    } else if (product.inventory <= 0) {
      throw new AppError(`Sản phẩm ${product.name} hiện đã hết hàng`, 400, 'OUT_OF_STOCK');
    }

    const cartRecord = await cartRepository.getOrCreateCart(userId, sessionId);
    await cartRepository.addItem(
      cartRecord.id,
      payload.productId,
      payload.variantId,
      payload.quantity || 1,
      payload.isSelected !== false
    );

    return (await cartRepository.getPopulatedCart(cartRecord.id))!;
  }

  async updateItem(itemId: string, payload: UpdateCartItemPayload, userId?: string | null, sessionId?: string | null): Promise<Cart> {
    const item = await cartRepository.findCartItemById(itemId);
    if (!item) {
      throw new AppError('Mục giỏ hàng không tồn tại', 404, 'CART_ITEM_NOT_FOUND');
    }

    const cart = await this.getCart(userId, sessionId);
    if (item.cartId !== cart.id) {
      throw new AppError('Không có quyền chỉnh sửa mục giỏ hàng này', 403, 'FORBIDDEN');
    }

    if (payload.quantity !== undefined && payload.quantity <= 0) {
      await cartRepository.removeItem(itemId);
    } else {
      await cartRepository.updateItem(itemId, payload.quantity, payload.isSelected);
    }

    return (await cartRepository.getPopulatedCart(cart.id))!;
  }

  async removeItem(itemId: string, userId?: string | null, sessionId?: string | null): Promise<Cart> {
    const item = await cartRepository.findCartItemById(itemId);
    if (!item) {
      throw new AppError('Mục giỏ hàng không tồn tại', 404, 'CART_ITEM_NOT_FOUND');
    }

    const cart = await this.getCart(userId, sessionId);
    if (item.cartId !== cart.id) {
      throw new AppError('Không có quyền xóa mục giỏ hàng này', 403, 'FORBIDDEN');
    }

    await cartRepository.removeItem(itemId);
    return (await cartRepository.getPopulatedCart(cart.id))!;
  }

  async clearCart(userId?: string | null, sessionId?: string | null): Promise<Cart> {
    const cart = await this.getCart(userId, sessionId);
    await cartRepository.clearCart(cart.id);
    return (await cartRepository.getPopulatedCart(cart.id))!;
  }

  async mergeSessionCart(sessionId: string, userId: string): Promise<Cart> {
    if (!sessionId || !userId) {
      throw new AppError('Thiếu sessionId hoặc userId để hợp nhất giỏ hàng', 400, 'INVALID_PAYLOAD');
    }
    await cartRepository.mergeSessionCartIntoUserCart(sessionId, userId);
    return await this.getCart(userId);
  }
}

export const cartService = new CartService();
