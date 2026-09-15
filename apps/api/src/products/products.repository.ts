import { eq, ilike, and, gte, lte, desc, asc, sql, inArray } from 'drizzle-orm';
import { db } from '../db/index.ts';
import { productsTable, brandsTable, productImagesTable, productVariantsTable } from '../db/schema/index.ts';
import { categoriesRepository } from '../categories/index.ts';
import type {
  Product,
  ProductFilters,
  CreateProductPayload,
  UpdateProductPayload,
  Brand,
  ProductImage,
  ProductVariant,
} from '@repo/shared-types';

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class ProductsRepository {
  private async attachRelations(dbProducts: any[]): Promise<Product[]> {
    if (dbProducts.length === 0) return [];

    const productIds = dbProducts.map((p) => p.id);
    const brandIds = dbProducts.map((p) => p.brandId).filter(Boolean);

    // Fetch Brands
    let brandsMap = new Map<string, Brand>();
    if (brandIds.length > 0) {
      const dbBrands = await db
        .select()
        .from(brandsTable)
        .where(inArray(brandsTable.id, brandIds));

      for (const b of dbBrands) {
        brandsMap.set(b.id, {
          id: b.id,
          name: b.name,
          slug: b.slug,
          logoUrl: b.logoUrl || undefined,
          description: b.description || undefined,
          website: b.website || undefined,
          country: b.country || undefined,
          isActive: b.isActive,
          createdAt: b.createdAt.toISOString(),
          updatedAt: b.updatedAt.toISOString(),
        });
      }
    }

    // Fetch Images
    const dbImages = await db
      .select()
      .from(productImagesTable)
      .where(inArray(productImagesTable.productId, productIds))
      .orderBy(asc(productImagesTable.sortOrder));

    const imagesByProduct = new Map<string, ProductImage[]>();
    for (const img of dbImages) {
      const item: ProductImage = {
        id: img.id,
        productId: img.productId,
        imageUrl: img.imageUrl,
        altText: img.altText || undefined,
        isThumbnail: img.isThumbnail,
        sortOrder: img.sortOrder,
        createdAt: img.createdAt.toISOString(),
      };
      const list = imagesByProduct.get(img.productId) || [];
      list.push(item);
      imagesByProduct.set(img.productId, list);
    }

    // Fetch Variants
    const dbVariants = await db
      .select()
      .from(productVariantsTable)
      .where(inArray(productVariantsTable.productId, productIds))
      .orderBy(desc(productVariantsTable.isDefault), asc(productVariantsTable.price));

    const variantsByProduct = new Map<string, ProductVariant[]>();
    for (const v of dbVariants) {
      const item: ProductVariant = {
        id: v.id,
        productId: v.productId,
        sku: v.sku,
        name: v.name,
        colorName: v.colorName || undefined,
        colorCode: v.colorCode || undefined,
        specSummary: v.specSummary || undefined,
        price: v.price,
        originalPrice: v.originalPrice || undefined,
        inventory: v.inventory,
        imageUrl: v.imageUrl || undefined,
        isDefault: v.isDefault,
        createdAt: v.createdAt.toISOString(),
        updatedAt: v.updatedAt.toISOString(),
      };
      const list = variantsByProduct.get(v.productId) || [];
      list.push(item);
      variantsByProduct.set(v.productId, list);
    }

    return dbProducts.map((row) => {
      const images = imagesByProduct.get(row.id) || [];
      const variants = variantsByProduct.get(row.id) || [];
      const brand = row.brandId ? brandsMap.get(row.brandId) : undefined;
      const thumb = images.find((i) => i.isThumbnail)?.imageUrl || images[0]?.imageUrl || row.imageUrl || undefined;

      return {
        id: row.id,
        name: row.name,
        description: row.description,
        price: row.price,
        inventory: row.inventory,
        category: row.category,
        categoryId: row.categoryId,
        brandId: row.brandId,
        brand,
        imageUrl: thumb,
        images,
        variants,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
      };
    });
  }

  async findMany(filters: ProductFilters = {}): Promise<PaginatedResult<Product>> {
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(filters.limit) || 8));
    const offset = (page - 1) * limit;

    const conditions = [];

    if (filters.category && filters.category !== 'all') {
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

    if (filters.brandId && filters.brandId !== 'all') {
      conditions.push(eq(productsTable.brandId, filters.brandId));
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

    const countQuery = db.select({ count: sql<number>`cast(count(*) as integer)` }).from(productsTable);
    if (whereClause) {
      countQuery.where(whereClause);
    }
    const countResult = await countQuery;
    const total = countResult[0]?.count || 0;

    const items = await this.attachRelations(dbItems);

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
    const items = await this.attachRelations(rows);
    return items[0] || null;
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
        brandId: (data as any).brandId || null,
        imageUrl: data.imageUrl?.trim() || null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    const result = await this.attachRelations([inserted]);
    return result[0];
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
        brandId: (data as any).brandId !== undefined ? (data as any).brandId : existing.brandId,
        imageUrl: data.imageUrl !== undefined ? data.imageUrl.trim() : existing.imageUrl,
        updatedAt: now,
      })
      .where(eq(productsTable.id, id))
      .returning();

    if (!updated) return null;
    const result = await this.attachRelations([updated]);
    return result[0] || null;
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
