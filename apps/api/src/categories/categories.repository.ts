import { eq, asc, desc, isNull } from 'drizzle-orm';
import { db } from '../db.ts';
import { checkDatabaseConnection } from '../connection.ts';
import { categoriesTable, type CategoryRow } from './categories.schema.ts';

// Initial in-memory categories fallback
const IN_MEMORY_CATEGORIES: CategoryRow[] = [
  // Root Level (Level 1)
  {
    id: 'cat_electronics',
    name: 'Điện tử & Máy tính',
    slug: 'electronics',
    description: 'Thiết bị công nghệ, máy tính và linh kiện cao cấp',
    parentId: null,
    icon: 'laptop',
    level: 1,
    sortOrder: 1,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  },
  {
    id: 'cat_audio',
    name: 'Âm thanh & Tai nghe',
    slug: 'audio',
    description: 'Tai nghe chống ồn, loa không dây và thiết bị âm thanh chuyên nghiệp',
    parentId: null,
    icon: 'headphones',
    level: 1,
    sortOrder: 2,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  },
  {
    id: 'cat_wearables',
    name: 'Đồng hồ & Thiết bị đeo',
    slug: 'wearables',
    description: 'Smartwatch và vòng tay theo dõi sức khỏe',
    parentId: null,
    icon: 'watch',
    level: 1,
    sortOrder: 3,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  },
  {
    id: 'cat_accessories',
    name: 'Phụ kiện & Gaming Gear',
    slug: 'accessories',
    description: 'Bàn phím cơ, chuột công thái học và phụ kiện bàn làm việc',
    parentId: null,
    icon: 'keyboard',
    level: 1,
    sortOrder: 4,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  },
  {
    id: 'cat_displays',
    name: 'Màn hình hiển thị',
    slug: 'displays',
    description: 'Màn hình đồ họa 4K, màn hình gaming tần số quét cao',
    parentId: null,
    icon: 'monitor',
    level: 1,
    sortOrder: 5,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  },
  {
    id: 'cat_phones',
    name: 'Điện thoại & Tablet',
    slug: 'phones',
    description: 'Smartphone cao cấp và máy tính bảng thế hệ mới',
    parentId: null,
    icon: 'smartphone',
    level: 1,
    sortOrder: 6,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  },

  // Subcategories (Level 2 - Con)
  {
    id: 'cat_sub_laptops',
    name: 'Laptop & Macbook',
    slug: 'laptops',
    description: 'Laptop mỏng nhẹ, laptop đồ họa và gaming',
    parentId: 'cat_electronics',
    icon: 'laptop',
    level: 2,
    sortOrder: 1,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  },
  {
    id: 'cat_sub_headphones',
    name: 'Tai nghe Over-ear',
    slug: 'over-ear-headphones',
    description: 'Tai nghe trùm đầu chống ồn cao cấp',
    parentId: 'cat_audio',
    icon: 'headphones',
    level: 2,
    sortOrder: 1,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  },
  {
    id: 'cat_sub_earbuds',
    name: 'Tai nghe True Wireless (Earbuds)',
    slug: 'earbuds',
    description: 'Tai nghe nhét tai không dây nhỏ gọn',
    parentId: 'cat_audio',
    icon: 'radio',
    level: 2,
    sortOrder: 2,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  },
  {
    id: 'cat_sub_keyboards',
    name: 'Bàn phím cơ',
    slug: 'keyboards',
    description: 'Bàn phím cơ Custom, Switch cơ học và Keycaps',
    parentId: 'cat_accessories',
    icon: 'keyboard',
    level: 2,
    sortOrder: 1,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  },
  {
    id: 'cat_sub_mice',
    name: 'Chuột & Lót chuột',
    slug: 'mice',
    description: 'Chuột công thái học và chuột gaming siêu nhẹ',
    parentId: 'cat_accessories',
    icon: 'mouse',
    level: 2,
    sortOrder: 2,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  },
];

let inMemoryCategories = [...IN_MEMORY_CATEGORIES];

export class CategoriesRepository {
  async findAll(): Promise<CategoryRow[]> {
    const isConn = await checkDatabaseConnection();
    if (isConn.connected) {
      try {
        const rows = await db
          .select()
          .from(categoriesTable)
          .orderBy(asc(categoriesTable.sortOrder), asc(categoriesTable.name));
        if (rows.length > 0) return rows;
      } catch (err) {
        console.warn('[CategoriesRepo] Falling back to memory:', err);
      }
    }
    return [...inMemoryCategories].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async findById(id: string): Promise<CategoryRow | null> {
    const isConn = await checkDatabaseConnection();
    if (isConn.connected) {
      try {
        const rows = await db
          .select()
          .from(categoriesTable)
          .where(eq(categoriesTable.id, id))
          .limit(1);
        if (rows.length > 0) return rows[0];
      } catch (err) {
        console.warn('[CategoriesRepo] FindById DB error:', err);
      }
    }
    return inMemoryCategories.find((c) => c.id === id) || null;
  }

  async findBySlug(slug: string): Promise<CategoryRow | null> {
    const isConn = await checkDatabaseConnection();
    if (isConn.connected) {
      try {
        const rows = await db
          .select()
          .from(categoriesTable)
          .where(eq(categoriesTable.slug, slug))
          .limit(1);
        if (rows.length > 0) return rows[0];
      } catch (err) {
        console.warn('[CategoriesRepo] FindBySlug DB error:', err);
      }
    }
    return inMemoryCategories.find((c) => c.slug === slug.toLowerCase()) || null;
  }

  async create(data: CategoryRow): Promise<CategoryRow> {
    const isConn = await checkDatabaseConnection();
    if (isConn.connected) {
      try {
        await db.insert(categoriesTable).values(data);
      } catch (err) {
        console.warn('[CategoriesRepo] Create DB error:', err);
      }
    }
    inMemoryCategories.push(data);
    return data;
  }

  async update(id: string, data: Partial<CategoryRow>): Promise<CategoryRow | null> {
    const isConn = await checkDatabaseConnection();
    if (isConn.connected) {
      try {
        await db
          .update(categoriesTable)
          .set({ ...data, updatedAt: new Date() })
          .where(eq(categoriesTable.id, id));
      } catch (err) {
        console.warn('[CategoriesRepo] Update DB error:', err);
      }
    }

    const index = inMemoryCategories.findIndex((c) => c.id === id);
    if (index !== -1) {
      inMemoryCategories[index] = {
        ...inMemoryCategories[index],
        ...data,
        updatedAt: new Date(),
      };
      return inMemoryCategories[index];
    }
    return null;
  }

  async delete(id: string): Promise<boolean> {
    const isConn = await checkDatabaseConnection();
    if (isConn.connected) {
      try {
        await db.delete(categoriesTable).where(eq(categoriesTable.id, id));
      } catch (err) {
        console.warn('[CategoriesRepo] Delete DB error:', err);
      }
    }

    const initialLength = inMemoryCategories.length;
    inMemoryCategories = inMemoryCategories.filter((c) => c.id !== id && c.parentId !== id);
    return inMemoryCategories.length < initialLength;
  }

  /**
   * Helper: Get all category IDs including the category itself and all its descendant subcategories
   */
  async getAllDescendantCategoryIds(identifier: string): Promise<string[]> {
    const all = await this.findAll();
    const root = all.find((c) => c.id === identifier || c.slug === identifier);
    if (!root) return [identifier];

    const resultIds = [root.id];
    const queue = [root.id];

    while (queue.length > 0) {
      const currentParentId = queue.shift()!;
      const children = all.filter((c) => c.parentId === currentParentId);
      for (const child of children) {
        resultIds.push(child.id);
        queue.push(child.id);
      }
    }

    return resultIds;
  }
}

export const categoriesRepository = new CategoriesRepository();
