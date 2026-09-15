import { eq, desc } from 'drizzle-orm';
import { db } from '../db.ts';
import { checkDatabaseConnection } from '../connection.ts';
import { ordersTable, orderItemsTable } from './orders.schema.ts';
import { productsTable } from '../products/products.schema.ts';
import { productsRepository } from '../products/products.repository.ts';
import type { Order, OrderItem, OrderFilters, OrderStatus } from '@repo/shared-types';

// In-memory fallback orders
const inMemoryOrders: Map<string, Order> = new Map();

// Initial sample orders for demonstration
const INITIAL_DEMO_ORDERS: Order[] = [
  {
    id: 'ORD-2026-8801',
    userId: 'usr_customer_01',
    customerName: 'Nguyễn Văn An',
    customerPhone: '0901234567',
    shippingAddress: '45 Lê Duẩn, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    customerNote: 'Giao hàng trong giờ hành chính giúp mình',
    items: [
      {
        id: 'item_demo_01',
        orderId: 'ORD-2026-8801',
        productId: 'prod_01',
        productName: 'Sony WH-1000XM5 Wireless Headphones',
        productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
        price: 349,
        quantity: 1,
        subtotal: 349,
      },
    ],
    subtotal: 349,
    discountAmount: 35,
    shippingFee: 0,
    couponCode: 'GIAM10',
    totalAmount: 314,
    status: 'delivered',
    paymentMethod: 'cod',
    paymentStatus: 'paid',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ORD-2026-8802',
    userId: 'usr_customer_01',
    customerName: 'Nguyễn Văn An',
    customerPhone: '0901234567',
    shippingAddress: 'Tòa nhà Bitexco, Số 2 Hải Triều, Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    customerNote: 'Gọi điện trước khi giao 15 phút',
    items: [
      {
        id: 'item_demo_02',
        orderId: 'ORD-2026-8802',
        productId: 'prod_04',
        productName: 'Keychron Q1 Pro Custom Mechanical Keyboard',
        productImage: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
        price: 199,
        quantity: 1,
        subtotal: 199,
      },
      {
        id: 'item_demo_03',
        orderId: 'ORD-2026-8802',
        productId: 'prod_05',
        productName: 'Logitech MX Master 3S Ergonomic Mouse',
        productImage: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80',
        price: 99,
        quantity: 1,
        subtotal: 99,
      },
    ],
    subtotal: 298,
    discountAmount: 0,
    shippingFee: 0,
    couponCode: null,
    totalAmount: 298,
    status: 'processing',
    paymentMethod: 'bank_transfer',
    paymentStatus: 'paid',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
];

for (const o of INITIAL_DEMO_ORDERS) {
  inMemoryOrders.set(o.id, o);
}

export class OrdersRepository {
  private async isDbAvailable(): Promise<boolean> {
    const health = await checkDatabaseConnection();
    return health.connected;
  }

  /**
   * Tạo đơn hàng với Transaction (Atomic check and deduct inventory)
   */
  async createWithTransaction(order: Order, items: OrderItem[]): Promise<Order> {
    const useDb = await this.isDbAvailable();

    if (useDb) {
      try {
        // Run database transaction
        await db.transaction(async (tx) => {
          // 1. Check and deduct inventory for each product
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

            // Deduct inventory
            await tx
              .update(productsTable)
              .set({
                inventory: productRow.inventory - item.quantity,
                updatedAt: new Date(),
              })
              .where(eq(productsTable.id, item.productId));
          }

          // 2. Insert order
          await tx.insert(ordersTable).values({
            id: order.id,
            userId: order.userId,
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

          // 3. Insert order items
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
      } catch (err: unknown) {
        console.warn('[OrdersRepository] DB transaction failed, falling back to memory transaction:', err);
        // Rethrow if inventory insufficiency error
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes('không tồn tại') || msg.includes('chỉ còn lại')) {
          throw err;
        }
      }
    }

    // In-Memory transaction & inventory deduction
    // Step A: Verify all items have enough inventory
    for (const item of items) {
      const product = await productsRepository.findById(item.productId);
      if (!product) {
        throw new Error(`Sản phẩm với ID ${item.productId} không tồn tại trong hệ thống.`);
      }
      if (product.inventory < item.quantity) {
        throw new Error(
          `Sản phẩm "${product.name}" chỉ còn lại ${product.inventory} chiếc trong kho (bạn đặt ${item.quantity}).`,
        );
      }
    }

    // Step B: Atomically deduct inventory
    for (const item of items) {
      const product = await productsRepository.findById(item.productId);
      if (product) {
        await productsRepository.update(product.id, {
          inventory: Math.max(0, product.inventory - item.quantity),
        });
      }
    }

    // Step C: Save order in memory
    const fullOrder: Order = {
      ...order,
      items,
    };
    inMemoryOrders.set(fullOrder.id, fullOrder);
    return fullOrder;
  }

  async findAll(filters: OrderFilters = {}): Promise<{ orders: Order[]; total: number }> {
    const useDb = await this.isDbAvailable();

    if (useDb) {
      try {
        const rows = await db
          .select()
          .from(ordersTable)
          .orderBy(desc(ordersTable.createdAt));

        const mappedOrders: Order[] = [];
        for (const row of rows) {
          if (filters.userId && row.userId !== filters.userId) continue;
          if (filters.status && row.status !== filters.status) continue;

          // Fetch items for this order
          const itemRows = await db
            .select()
            .from(orderItemsTable)
            .where(eq(orderItemsTable.orderId, row.id));

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
          });
        }

        return {
          orders: mappedOrders,
          total: mappedOrders.length,
        };
      } catch (err) {
        console.warn('[OrdersRepository] DB findAll failed, falling back to memory:', err);
      }
    }

    // Memory query
    let result = Array.from(inMemoryOrders.values());

    if (filters.userId) {
      result = result.filter((o) => o.userId === filters.userId);
    }

    if (filters.status) {
      result = result.filter((o) => o.status === filters.status);
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerPhone.includes(q) ||
          o.items.some((item) => item.productName.toLowerCase().includes(q)),
      );
    }

    // Sort newest first
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const startIndex = (page - 1) * limit;
    const paged = result.slice(startIndex, startIndex + limit);

    return {
      orders: paged,
      total: result.length,
    };
  }

  async findById(id: string): Promise<Order | null> {
    const useDb = await this.isDbAvailable();

    if (useDb) {
      try {
        const [row] = await db
          .select()
          .from(ordersTable)
          .where(eq(ordersTable.id, id));

        if (row) {
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
      } catch (err) {
        console.warn('[OrdersRepository] DB findById failed, falling back to memory:', err);
      }
    }

    return inMemoryOrders.get(id) || null;
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order | null> {
    const order = await this.findById(id);
    if (!order) return null;

    const previousStatus = order.status;
    const now = new Date();

    // If order is cancelled, restore inventory for each product
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

    const updated: Order = {
      ...order,
      status,
      updatedAt: now.toISOString(),
    };

    const useDb = await this.isDbAvailable();
    if (useDb) {
      try {
        await db
          .update(ordersTable)
          .set({
            status,
            updatedAt: now,
          })
          .where(eq(ordersTable.id, id));
      } catch (err) {
        console.warn('[OrdersRepository] DB updateStatus failed:', err);
      }
    }

    inMemoryOrders.set(id, updated);
    return updated;
  }
}

export const ordersRepository = new OrdersRepository();
