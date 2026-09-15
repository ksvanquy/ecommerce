import { ordersRepository } from './orders.repository.ts';
import { productsRepository } from '../products/index.ts';
import type {
  Order,
  OrderItem,
  CreateOrderPayload,
  OrderFilters,
  OrderStatus,
  PaymentMethod,
} from '@repo/shared-types';

export class OrdersService {
  /**
   * Tạo đơn hàng mới với tính toán giá phía máy chủ (Server-side price calculation)
   */
  async createOrder(payload: CreateOrderPayload, userId?: string): Promise<Order> {
    if (!payload.items || !Array.isArray(payload.items) || payload.items.length === 0) {
      throw new Error('Đơn hàng phải chứa ít nhất một sản phẩm.');
    }

    if (!payload.customerName || payload.customerName.trim().length < 2) {
      throw new Error('Vui lòng nhập họ tên người nhận hợp lệ.');
    }

    if (!payload.customerPhone || payload.customerPhone.trim().length < 8) {
      throw new Error('Vui lòng nhập số điện thoại liên hệ hợp lệ.');
    }

    if (!payload.shippingAddress || payload.shippingAddress.trim().length < 5) {
      throw new Error('Vui lòng cung cấp địa chỉ giao hàng chi tiết.');
    }

    // 1. Fetch real products from repository & calculate totals at server
    const orderItems: OrderItem[] = [];
    let calculatedSubtotal = 0;

    const orderId = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    for (const reqItem of payload.items) {
      if (!reqItem.quantity || reqItem.quantity <= 0) {
        throw new Error(`Số lượng đặt cho sản phẩm không hợp lệ.`);
      }

      const product = await productsRepository.findById(reqItem.productId);
      if (!product) {
        throw new Error(`Sản phẩm mã ${reqItem.productId} không tồn tại trong hệ thống.`);
      }

      // Check stock availability
      if (product.inventory < reqItem.quantity) {
        throw new Error(
          `Sản phẩm "${product.name}" không đủ tồn kho (còn ${product.inventory}, bạn yêu cầu ${reqItem.quantity}).`,
        );
      }

      const itemSubtotal = product.price * reqItem.quantity;
      calculatedSubtotal += itemSubtotal;

      orderItems.push({
        id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        orderId,
        productId: product.id,
        productName: product.name,
        productImage: product.imageUrl,
        price: product.price,
        quantity: reqItem.quantity,
        subtotal: itemSubtotal,
      });
    }

    // 2. Calculate Server-side discount & shipping
    let discountAmount = 0;
    const cleanCoupon = payload.couponCode ? payload.couponCode.trim().toUpperCase() : null;

    if (cleanCoupon) {
      if (cleanCoupon === 'GIAM10' || cleanCoupon === 'WELCOME10') {
        discountAmount = Math.round(calculatedSubtotal * 0.1);
      } else if (cleanCoupon === 'VIP20') {
        discountAmount = Math.round(calculatedSubtotal * 0.2);
      } else if (cleanCoupon === 'FREESHIP') {
        // Handled in shipping fee
      }
    }

    // Free shipping if subtotal >= $200 or FREESHIP coupon used
    let shippingFee = 15;
    if (calculatedSubtotal >= 200 || cleanCoupon === 'FREESHIP') {
      shippingFee = 0;
    }

    const totalAmount = Math.max(0, calculatedSubtotal - discountAmount + shippingFee);

    const now = new Date().toISOString();
    const newOrder: Order = {
      id: orderId,
      userId: userId || 'guest_' + Math.random().toString(36).substring(2, 8),
      customerName: payload.customerName.trim(),
      customerPhone: payload.customerPhone.trim(),
      shippingAddress: payload.shippingAddress.trim(),
      customerNote: payload.customerNote?.trim() || undefined,
      items: orderItems,
      subtotal: calculatedSubtotal,
      discountAmount,
      shippingFee,
      couponCode: cleanCoupon,
      totalAmount,
      status: 'pending',
      paymentMethod: (payload.paymentMethod as PaymentMethod) || 'cod',
      paymentStatus: 'unpaid',
      createdAt: now,
      updatedAt: now,
    };

    // 3. Delegate to repository with atomic transaction
    return await ordersRepository.createWithTransaction(newOrder, orderItems);
  }

  async getOrders(filters: OrderFilters = {}): Promise<{ orders: Order[]; total: number }> {
    return await ordersRepository.findAll(filters);
  }

  async getOrderById(id: string): Promise<Order | null> {
    return await ordersRepository.findById(id);
  }

  async cancelOrder(id: string, userId?: string, userRole?: string): Promise<Order> {
    const existing = await ordersRepository.findById(id);
    if (!existing) {
      throw new Error(`Không tìm thấy đơn hàng với mã ${id}.`);
    }

    // Permission check: admin or the user who created it
    if (userRole !== 'admin' && userId && existing.userId !== userId && !existing.userId.startsWith('guest_')) {
      throw new Error('Bạn không có quyền hủy đơn hàng này.');
    }

    if (existing.status !== 'pending') {
      throw new Error(
        `Không thể hủy đơn hàng này vì đơn đang ở trạng thái "${existing.status}". Chỉ có thể hủy đơn hàng đang chờ xử lý (pending).`,
      );
    }

    const updated = await ordersRepository.updateStatus(id, 'cancelled');
    if (!updated) {
      throw new Error('Không thể cập nhật trạng thái đơn hàng.');
    }

    return updated;
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const existing = await ordersRepository.findById(id);
    if (!existing) {
      throw new Error(`Không tìm thấy đơn hàng với mã ${id}.`);
    }

    const updated = await ordersRepository.updateStatus(id, status);
    if (!updated) {
      throw new Error('Không thể cập nhật trạng thái đơn hàng.');
    }
    return updated;
  }
}

export const ordersService = new OrdersService();
