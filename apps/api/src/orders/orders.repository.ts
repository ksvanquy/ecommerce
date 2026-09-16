import { eq, desc } from 'drizzle-orm';
import { db } from '../db/index.ts';
import { ordersTable, orderItemsTable, productsTable } from '../db/schema/index.ts';
import { productsRepository } from '../products/index.ts';
import type { Order, OrderItem, OrderFilters, OrderStatus } from '@repo/shared-types';

export class OrdersRepository {
  /**
   * Tạo đơn hàng với Database Transaction (Atomic check and deduct inventory)
   */
  async createWithTransaction(order: Order, items: OrderItem[]): Promise<Order> {
    await db.transaction(async (tx) => {
      // 1. Kiểm tra tồn kho và trừ kho cho từng sản phẩm
      for (const item of items) {
        const [productRow] = await tx
          .select()
          .from(productsTable)
          .where(eq(productsTable.id, item.productId));

        if (!productRow) {
          throw new Error(`Sản phẩm với ID ${item.productId} không tồn tại trong hệ thống.`);
        }

        if (productRow.inventory < item.quantity) {
          throw new Error(
            `Sản phẩm "${productRow.name}" chỉ còn lại ${productRow.inventory} chiếc trong kho (bạn đặt ${item.quantity}). Vui lòng giảm số lượng.`,
          );
        }

        // Trừ tồn kho
        await tx
          .update(productsTable)
          .set({
            inventory: productRow.inventory - item.quantity,
            updatedAt: new Date(),
          })
          .where(eq(productsTable.id, item.productId));
      }

      // 2. Lưu thông tin đơn hàng chính
      // Khách vãng lai (guest) hoặc không đăng nhập -> user_id trong database là null để thỏa mãn Foreign Key
      const dbUserId = order.userId && !order.userId.startsWith('guest') ? order.userId : null;

      await tx.insert(ordersTable).values({
        id: order.id,
        userId: dbUserId,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        shippingAddress: order.shippingAddress,
        customerNote: order.customerNote || null,
        subtotal: order.subtotal,
        discountAmount: order.discountAmount,
        shippingFee: order.shippingFee,
        couponCode: order.couponCode || null,
        totalAmount: order.totalAmount,
        status: order.status,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        createdAt: new Date(order.createdAt),
        updatedAt: new Date(order.updatedAt),
      });

      // 3. Lưu chi tiết các mặt hàng của đơn
      for (const item of items) {
        await tx.insert(orderItemsTable).values({
          id: item.id,
          orderId: order.id,
          productId: item.productId,
          productName: item.productName,
          productImage: item.productImage || null,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.subtotal,
          createdAt: new Date(order.createdAt),
        });
      }
    });

    return {
      ...order,
      items,
    };
  }

  async findAll(filters: OrderFilters = {}): Promise<{ orders: Order[]; total: number }> {
    const rows = await db
      .select()
      .from(ordersTable)
      .orderBy(desc(ordersTable.createdAt));

    const mappedOrders: Order[] = [];
    for (const row of rows) {
      if (filters.userId && row.userId !== filters.userId) continue;
      if (filters.status && row.status !== filters.status) continue;

      // Lấy danh sách item cho order này
      const itemRows = await db
        .select()
        .from(orderItemsTable)
        .where(eq(orderItemsTable.orderId, row.id));

      const items = itemRows.map((ir) => ({
        id: ir.id,
        orderId: ir.orderId,
        productId: ir.productId,
        productName: ir.productName,
        productImage: ir.productImage || undefined,
        price: ir.price,
        quantity: ir.quantity,
        subtotal: ir.subtotal,
      }));

      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matches =
          row.id.toLowerCase().includes(q) ||
          row.customerName.toLowerCase().includes(q) ||
          row.customerPhone.includes(q) ||
          items.some((item) => item.productName.toLowerCase().includes(q));

        if (!matches) continue;
      }

      mappedOrders.push({
        id: row.id,
        userId: row.userId || 'guest',
        customerName: row.customerName,
        customerPhone: row.customerPhone,
        shippingAddress: row.shippingAddress,
        customerNote: row.customerNote || undefined,
        subtotal: row.subtotal,
        discountAmount: row.discountAmount,
        shippingFee: row.shippingFee,
        couponCode: row.couponCode || null,
        totalAmount: row.totalAmount,
        status: row.status as OrderStatus,
        paymentMethod: row.paymentMethod as any,
        paymentStatus: row.paymentStatus as any,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
        items,
      });
    }

    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.max(1, Number(filters.limit) || 50);
    const startIndex = (page - 1) * limit;
    const paged = mappedOrders.slice(startIndex, startIndex + limit);

    return {
      orders: paged,
      total: mappedOrders.length,
    };
  }

  async findById(id: string): Promise<Order | null> {
    const [row] = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.id, id));

    if (!row) return null;

    const itemRows = await db
      .select()
      .from(orderItemsTable)
      .where(eq(orderItemsTable.orderId, row.id));

    return {
      id: row.id,
      userId: row.userId || 'guest',
      customerName: row.customerName,
      customerPhone: row.customerPhone,
      shippingAddress: row.shippingAddress,
      customerNote: row.customerNote || undefined,
      subtotal: row.subtotal,
      discountAmount: row.discountAmount,
      shippingFee: row.shippingFee,
      couponCode: row.couponCode || null,
      totalAmount: row.totalAmount,
      status: row.status as OrderStatus,
      paymentMethod: row.paymentMethod as any,
      paymentStatus: row.paymentStatus as any,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      items: itemRows.map((ir) => ({
        id: ir.id,
        orderId: ir.orderId,
        productId: ir.productId,
        productName: ir.productName,
        productImage: ir.productImage || undefined,
        price: ir.price,
        quantity: ir.quantity,
        subtotal: ir.subtotal,
      })),
    };
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order | null> {
    const order = await this.findById(id);
    if (!order) return null;

    const previousStatus = order.status;
    const now = new Date();

    // Nếu đơn hàng bị hủy, hoàn trả lại tồn kho
    if (status === 'cancelled' && previousStatus !== 'cancelled') {
      for (const item of order.items) {
        const prod = await productsRepository.findById(item.productId);
        if (prod) {
          await productsRepository.update(prod.id, {
            inventory: prod.inventory + item.quantity,
          });
        }
      }
    }

    const [updated] = await db
      .update(ordersTable)
      .set({
        status,
        updatedAt: now,
      })
      .where(eq(ordersTable.id, id))
      .returning();

    if (!updated) return null;

    return {
      ...order,
      status: updated.status as OrderStatus,
      updatedAt: updated.updatedAt.toISOString(),
    };
  }

  async updatePaymentStatus(id: string, paymentStatus: 'paid' | 'unpaid' | 'refunded', advanceStatus: boolean = true): Promise<Order | null> {
    const order = await this.findById(id);
    if (!order) return null;

    const now = new Date();
    const updateData: Record<string, any> = {
      paymentStatus,
      updatedAt: now,
    };

    if (paymentStatus === 'paid' && advanceStatus && order.status === 'pending') {
      updateData.status = 'processing';
    }

    const [updated] = await db
      .update(ordersTable)
      .set(updateData)
      .where(eq(ordersTable.id, id))
      .returning();

    if (!updated) return null;

    return {
      ...order,
      status: updated.status as OrderStatus,
      paymentStatus: updated.paymentStatus as any,
      updatedAt: updated.updatedAt.toISOString(),
    };
  }
}

export const ordersRepository = new OrdersRepository();
