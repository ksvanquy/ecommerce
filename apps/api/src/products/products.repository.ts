import { eq, ilike, and, gte, lte, desc, asc, sql } from 'drizzle-orm';
import { db } from '../db.ts';
import { checkDatabaseConnection } from '../connection.ts';
import { productsTable, ProductDb, NewProductDb } from './products.schema.ts';
import type {
  Product,
  ProductFilters,
  CreateProductPayload,
  UpdateProductPayload,
} from '@repo/shared-types';

// In-memory fallback product catalog
const inMemoryProducts: Map<string, Product> = new Map();

// Initial seed products for rich demo and testing
const INITIAL_SEEDS: Product[] = [
  {
    id: 'prod_01',
    name: 'Sony WH-1000XM5 Wireless Headphones',
    description: 'Tai nghe chống ồn chủ động hàng đầu ngành với công nghệ Auto NC Optimizer, thời lượng pin lên đến 30 giờ và âm thanh Hi-Res tuyệt hảo.',
    price: 349,
    inventory: 45,
    category: 'Audio',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date('2026-01-10T08:00:00.000Z').toISOString(),
    updatedAt: new Date('2026-01-10T08:00:00.000Z').toISOString(),
  },
  {
    id: 'prod_02',
    name: 'Apple Watch Ultra 2 Titanium Case',
    description: 'Đồng hồ thông minh siêu bền bỉ dành cho thể thao mạo hiểm với vỏ titan 49mm, định vị GPS tần số kép chuẩn xác và pin 72 giờ.',
    price: 799,
    inventory: 28,
    category: 'Wearables',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date('2026-01-12T09:30:00.000Z').toISOString(),
    updatedAt: new Date('2026-01-12T09:30:00.000Z').toISOString(),
  },
  {
    id: 'prod_03',
    name: 'MacBook Air 15-inch M3 Midnight',
    description: 'Thiết kế mỏng nhẹ siêu thực 11.5mm, màn hình Liquid Retina sắc nét, chip Apple M3 hiệu năng vượt trội và thời lượng pin 18 giờ.',
    price: 1299,
    inventory: 15,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date('2026-01-15T10:00:00.000Z').toISOString(),
    updatedAt: new Date('2026-01-15T10:00:00.000Z').toISOString(),
  },
  {
    id: 'prod_04',
    name: 'Keychron Q1 Pro Custom Mechanical Keyboard',
    description: 'Bàn phím cơ không dây layout 75%, vỏ nhôm CNC nguyên khối, switch Gateron Jupiter, hỗ trợ QMK/VIA và hot-swappable toàn diện.',
    price: 199,
    inventory: 60,
    category: 'Accessories',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date('2026-01-18T14:15:00.000Z').toISOString(),
    updatedAt: new Date('2026-01-18T14:15:00.000Z').toISOString(),
  },
  {
    id: 'prod_05',
    name: 'Logitech MX Master 3S Ergonomic Mouse',
    description: 'Chuột công thái học cao cấp với con lăn điện từ MagSpeed cực nhanh, cảm biến 8000 DPI theo dõi trên mọi bề mặt và switch click êm ái.',
    price: 99,
    inventory: 85,
    category: 'Accessories',
    imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date('2026-01-20T11:00:00.000Z').toISOString(),
    updatedAt: new Date('2026-01-20T11:00:00.000Z').toISOString(),
  },
  {
    id: 'prod_06',
    name: 'Bose SoundLink Revolve+ II Bluetooth Speaker',
    description: 'Loa Bluetooth âm thanh 360 độ chân thực, quai xách tiện lợi, kháng nước bụi IP55 và thời lượng pin liên tục lên đến 17 giờ.',
    price: 299,
    inventory: 34,
    category: 'Audio',
    imageUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date('2026-01-22T16:20:00.000Z').toISOString(),
    updatedAt: new Date('2026-01-22T16:20:00.000Z').toISOString(),
  },
  {
    id: 'prod_07',
    name: 'Philips Hue White & Color Ambiance Starter Kit',
    description: 'Bộ đèn thông minh 16 triệu màu, đồng bộ ánh sáng theo nhạc và phim, điều khiển giọng nói qua Alexa, Google Assistant và Apple Home.',
    price: 149,
    inventory: 20,
    category: 'Smart Home',
    imageUrl: 'https://images.unsplash.com/photo-1550985616-10810253b84d?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date('2026-01-25T13:45:00.000Z').toISOString(),
    updatedAt: new Date('2026-01-25T13:45:00.000Z').toISOString(),
  },
  {
    id: 'prod_08',
    name: 'Garmin Fenix 7 Pro Solar Edition',
    description: 'Đồng hồ GPS thể thao đa năng trang bị sạc năng lượng mặt trời Power Glass, đèn pin LED tích hợp và bản đồ Topo toàn cầu.',
    price: 699,
    inventory: 18,
    category: 'Wearables',
    imageUrl: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date('2026-01-28T10:10:00.000Z').toISOString(),
    updatedAt: new Date('2026-01-28T10:10:00.000Z').toISOString(),
  },
  {
    id: 'prod_09',
    name: 'Anker 737 Power Bank (PowerCore 24K)',
    description: 'Pin dự phòng dung lượng 24,000mAh công suất 140W Power Delivery 3.1, màn hình kỹ thuật số hiển thị công suất sạc chi tiết.',
    price: 139,
    inventory: 72,
    category: 'Accessories',
    imageUrl: 'https://images.unsplash.com/photo-1609592807963-c157297e6e58?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date('2026-02-01T09:00:00.000Z').toISOString(),
    updatedAt: new Date('2026-02-01T09:00:00.000Z').toISOString(),
  },
  {
    id: 'prod_10',
    name: 'Nest Cam Indoor/Outdoor Wired Security Camera',
    description: 'Camera an ninh thông minh 1080p HDR với góc nhìn 130 độ, nhận diện thông minh người, thú cưng, phương tiện và đàm thoại 2 chiều.',
    price: 99,
    inventory: 40,
    category: 'Smart Home',
    imageUrl: 'https://images.unsplash.com/photo-1557862921-37829c790f19?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date('2026-02-05T15:30:00.000Z').toISOString(),
    updatedAt: new Date('2026-02-05T15:30:00.000Z').toISOString(),
  },
  {
    id: 'prod_11',
    name: 'Dell UltraSharp 27 4K USB-C Hub Monitor (U2723QE)',
    description: 'Màn hình đồ họa 4K IPS Black độ tương phản 2000:1, độ phủ màu 98% DCI-P3, cổng kết nối USB-C sạc 90W và mạng RJ45 tích hợp.',
    price: 549,
    inventory: 22,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date('2026-02-08T11:45:00.000Z').toISOString(),
    updatedAt: new Date('2026-02-08T11:45:00.000Z').toISOString(),
  },
  {
    id: 'prod_12',
    name: 'AirPods Pro 2 with USB-C MagSafe Case',
    description: 'Chống ồn chủ động mạnh gấp đôi, chế độ Adaptive Audio thích ứng môi trường, cá nhân hóa âm thanh Spatial Audio và kháng nước IP54.',
    price: 249,
    inventory: 55,
    category: 'Audio',
    imageUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date('2026-02-12T14:00:00.000Z').toISOString(),
    updatedAt: new Date('2026-02-12T14:00:00.000Z').toISOString(),
  },
];

// Populate in-memory map
INITIAL_SEEDS.forEach((p) => inMemoryProducts.set(p.id, p));

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class ProductsRepository {
  private async isDbAvailable(): Promise<boolean> {
    try {
      const conn = await checkDatabaseConnection();
      return conn.connected;
    } catch {
      return false;
    }
  }

  async findMany(filters: ProductFilters = {}): Promise<PaginatedResult<Product>> {
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(filters.limit) || 8));
    const offset = (page - 1) * limit;

    const useDb = await this.isDbAvailable();

    if (useDb) {
      try {
        const conditions = [];

        if (filters.category && filters.category !== 'all') {
          conditions.push(eq(productsTable.category, filters.category));
        }

        if (filters.search && filters.search.trim() !== '') {
          const term = `%${filters.search.trim()}%`;
          conditions.push(
            sql`(${ilike(productsTable.name, term)} OR ${ilike(productsTable.description, term)})`
          );
        }

        if (filters.minPrice !== undefined && !isNaN(filters.minPrice)) {
          conditions.push(gte(productsTable.price, filters.minPrice));
        }

        if (filters.maxPrice !== undefined && !isNaN(filters.maxPrice)) {
          conditions.push(lte(productsTable.price, filters.maxPrice));
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        // Determine ordering
        let orderByClause = desc(productsTable.createdAt);
        if (filters.sortBy === 'price_asc') {
          orderByClause = asc(productsTable.price);
        } else if (filters.sortBy === 'price_desc') {
          orderByClause = desc(productsTable.price);
        } else if (filters.sortBy === 'name_asc') {
          orderByClause = asc(productsTable.name);
        }

        const query = db.select().from(productsTable);
        if (whereClause) {
          query.where(whereClause);
        }
        const dbItems = await query.orderBy(orderByClause).limit(limit).offset(offset);

        // Count total
        const countQuery = db.select({ count: sql<number>`cast(count(*) as integer)` }).from(productsTable);
        if (whereClause) {
          countQuery.where(whereClause);
        }
        const countResult = await countQuery;
        const total = countResult[0]?.count || 0;

        const items: Product[] = dbItems.map((row) => ({
          id: row.id,
          name: row.name,
          description: row.description,
          price: row.price,
          inventory: row.inventory,
          category: row.category,
          imageUrl: row.imageUrl || undefined,
          createdAt: row.createdAt.toISOString(),
          updatedAt: row.updatedAt.toISOString(),
        }));

        return {
          items,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 1,
        };
      } catch (err) {
        console.warn('[ProductsRepository] Drizzle query failed, falling back to memory:', err);
      }
    }

    // Memory Store Processing
    let all = Array.from(inMemoryProducts.values());

    // Filter by category
    if (filters.category && filters.category !== 'all') {
      const catLower = filters.category.toLowerCase();
      all = all.filter((p) => p.category.toLowerCase() === catLower);
    }

    // Filter by search term
    if (filters.search && filters.search.trim() !== '') {
      const q = filters.search.trim().toLowerCase();
      all = all.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    // Filter by price range
    if (filters.minPrice !== undefined && !isNaN(filters.minPrice)) {
      all = all.filter((p) => p.price >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined && !isNaN(filters.maxPrice)) {
      all = all.filter((p) => p.price <= filters.maxPrice!);
    }

    // Sort
    if (filters.sortBy === 'price_asc') {
      all.sort((a, b) => a.price - b.price);
    } else if (filters.sortBy === 'price_desc') {
      all.sort((a, b) => b.price - a.price);
    } else if (filters.sortBy === 'name_asc') {
      all.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // Default: newest
      all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const total = all.length;
    const items = all.slice(offset, offset + limit);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findById(id: string): Promise<Product | null> {
    const useDb = await this.isDbAvailable();

    if (useDb) {
      try {
        const rows = await db
          .select()
          .from(productsTable)
          .where(eq(productsTable.id, id))
          .limit(1);

        if (rows.length > 0) {
          const row = rows[0];
          return {
            id: row.id,
            name: row.name,
            description: row.description,
            price: row.price,
            inventory: row.inventory,
            category: row.category,
            imageUrl: row.imageUrl || undefined,
            createdAt: row.createdAt.toISOString(),
            updatedAt: row.updatedAt.toISOString(),
          };
        }
      } catch (err) {
        console.warn('[ProductsRepository] DB findById failed, falling back to memory:', err);
      }
    }

    return inMemoryProducts.get(id) || null;
  }

  async getCategories(): Promise<string[]> {
    const useDb = await this.isDbAvailable();

    if (useDb) {
      try {
        const rows = await db
          .selectDistinct({ category: productsTable.category })
          .from(productsTable);
        const cats = rows.map((r) => r.category).filter(Boolean);
        if (cats.length > 0) {
          return cats.sort();
        }
      } catch (err) {
        console.warn('[ProductsRepository] DB getCategories failed:', err);
      }
    }

    const cats = new Set<string>();
    inMemoryProducts.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats).sort();
  }

  async create(data: CreateProductPayload): Promise<Product> {
    const newId = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date();

    const newProduct: Product = {
      id: newId,
      name: data.name.trim(),
      description: data.description.trim(),
      price: Math.max(0, Math.round(data.price)),
      inventory: Math.max(0, Math.round(data.inventory)),
      category: data.category.trim(),
      imageUrl: data.imageUrl?.trim() || undefined,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    const useDb = await this.isDbAvailable();

    if (useDb) {
      try {
        await db.insert(productsTable).values({
          id: newProduct.id,
          name: newProduct.name,
          description: newProduct.description,
          price: newProduct.price,
          inventory: newProduct.inventory,
          category: newProduct.category,
          imageUrl: newProduct.imageUrl,
          createdAt: now,
          updatedAt: now,
        });
      } catch (err) {
        console.warn('[ProductsRepository] DB insert failed, writing to memory store:', err);
      }
    }

    inMemoryProducts.set(newProduct.id, newProduct);
    return newProduct;
  }

  async update(id: string, data: UpdateProductPayload): Promise<Product | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const now = new Date();
    const updated: Product = {
      ...existing,
      name: data.name !== undefined ? data.name.trim() : existing.name,
      description: data.description !== undefined ? data.description.trim() : existing.description,
      price: data.price !== undefined ? Math.max(0, Math.round(data.price)) : existing.price,
      inventory: data.inventory !== undefined ? Math.max(0, Math.round(data.inventory)) : existing.inventory,
      category: data.category !== undefined ? data.category.trim() : existing.category,
      imageUrl: data.imageUrl !== undefined ? data.imageUrl.trim() : existing.imageUrl,
      updatedAt: now.toISOString(),
    };

    const useDb = await this.isDbAvailable();

    if (useDb) {
      try {
        await db
          .update(productsTable)
          .set({
            name: updated.name,
            description: updated.description,
            price: updated.price,
            inventory: updated.inventory,
            category: updated.category,
            imageUrl: updated.imageUrl,
            updatedAt: now,
          })
          .where(eq(productsTable.id, id));
      } catch (err) {
        console.warn('[ProductsRepository] DB update failed, saving to memory store:', err);
      }
    }

    inMemoryProducts.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const useDb = await this.isDbAvailable();

    if (useDb) {
      try {
        await db.delete(productsTable).where(eq(productsTable.id, id));
      } catch (err) {
        console.warn('[ProductsRepository] DB delete failed:', err);
      }
    }

    return inMemoryProducts.delete(id);
  }
}

export const productsRepository = new ProductsRepository();
