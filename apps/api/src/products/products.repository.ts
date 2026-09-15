import { eq, ilike, and, gte, lte, desc, asc, sql, inArray } from 'drizzle-orm';
import { db } from '../db/index.ts';
import { productsTable } from '../db/schema/index.ts';
import { categoriesRepository } from '../categories/index.ts';
import type {
  Product,
  ProductFilters,
  CreateProductPayload,
  UpdateProductPayload,
} from '@repo/shared-types';

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class ProductsRepository {
  async findMany(filters: ProductFilters = {}): Promise<PaginatedResult<Product>> {
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(filters.limit) || 8));
    const offset = (page - 1) * limit;

    const conditions = [];

    if (filters.category && filters.category !== 'all') {
      // Lấy tất cả danh mục con cháu
      const allDescendantIds = await categoriesRepository.getAllDescendantCategoryIds(filters.category);
      const allCategories = await categoriesRepository.findAll();
      const targetCats = allCategories.filter((c) => allDescendantIds.includes(c.id));
      const allowedSlugs = targetCats.map((c) => c.slug.toLowerCase());
      const allowedNames = targetCats.map((c) => c.name.toLowerCase());
      const allowedIds = targetCats.map((c) => c.id);

      conditions.push(
        sql`(${inArray(productsTable.categoryId, allowedIds)} OR lower(${productsTable.category}) = ANY(ARRAY[${sql.raw(
          [...allowedSlugs, ...allowedNames, filters.category.toLowerCase()]
            .map((s) => `'${s.replace(/'/g, "''")}'`)
            .join(',')
        )}]))`
      );
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

    // Xác định thứ tự sắp xếp
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

    // Đếm tổng số lượng records khớp điều kiện
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
      categoryId: row.categoryId,
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
  }

  async findById(id: string): Promise<Product | null> {
    const rows = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, id))
      .limit(1);

    if (!rows[0]) return null;
    const row = rows[0];

    return {
      id: row.id,
      name: row.name,
      description: row.description,
      price: row.price,
      inventory: row.inventory,
      category: row.category,
      categoryId: row.categoryId,
      imageUrl: row.imageUrl || undefined,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  async getCategories(): Promise<string[]> {
    const rows = await db
      .selectDistinct({ category: productsTable.category })
      .from(productsTable);
    return rows.map((r) => r.category).filter(Boolean).sort();
  }

  async create(data: CreateProductPayload): Promise<Product> {
    const newId = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date();

    const [inserted] = await db
      .insert(productsTable)
      .values({
        id: newId,
        name: data.name.trim(),
        description: data.description.trim(),
        price: Math.max(0, Math.round(data.price)),
        inventory: Math.max(0, Math.round(data.inventory)),
        category: data.category.trim(),
        categoryId: (data as any).categoryId || null,
        imageUrl: data.imageUrl?.trim() || null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return {
      id: inserted.id,
      name: inserted.name,
      description: inserted.description,
      price: inserted.price,
      inventory: inserted.inventory,
      category: inserted.category,
      categoryId: inserted.categoryId,
      imageUrl: inserted.imageUrl || undefined,
      createdAt: inserted.createdAt.toISOString(),
      updatedAt: inserted.updatedAt.toISOString(),
    };
  }

  async update(id: string, data: UpdateProductPayload): Promise<Product | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const now = new Date();
    const [updated] = await db
      .update(productsTable)
      .set({
        name: data.name !== undefined ? data.name.trim() : existing.name,
        description: data.description !== undefined ? data.description.trim() : existing.description,
        price: data.price !== undefined ? Math.max(0, Math.round(data.price)) : existing.price,
        inventory: data.inventory !== undefined ? Math.max(0, Math.round(data.inventory)) : existing.inventory,
        category: data.category !== undefined ? data.category.trim() : existing.category,
        categoryId: (data as any).categoryId !== undefined ? (data as any).categoryId : existing.categoryId,
        imageUrl: data.imageUrl !== undefined ? data.imageUrl.trim() : existing.imageUrl,
        updatedAt: now,
      })
      .where(eq(productsTable.id, id))
      .returning();

    if (!updated) return null;

    return {
      id: updated.id,
      name: updated.name,
      description: updated.description,
      price: updated.price,
      inventory: updated.inventory,
      category: updated.category,
      categoryId: updated.categoryId,
      imageUrl: updated.imageUrl || undefined,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await db
      .delete(productsTable)
      .where(eq(productsTable.id, id))
      .returning();

    return deleted.length > 0;
  }
}

export const productsRepository = new ProductsRepository();
