import { eq, asc } from 'drizzle-orm';
import { db } from '../db/index.ts';
import { categoriesTable, type CategoryRow } from '../db/schema/index.ts';

export class CategoriesRepository {
  async findAll(): Promise<CategoryRow[]> {
    return await db
      .select()
      .from(categoriesTable)
      .orderBy(asc(categoriesTable.sortOrder), asc(categoriesTable.name));
  }

  async findById(id: string): Promise<CategoryRow | null> {
    const rows = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.id, id))
      .limit(1);

    return rows[0] || null;
  }

  async findBySlug(slug: string): Promise<CategoryRow | null> {
    const rows = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.slug, slug.toLowerCase()))
      .limit(1);

    return rows[0] || null;
  }

  async create(data: CategoryRow): Promise<CategoryRow> {
    const inserted = await db.insert(categoriesTable).values(data).returning();
    return inserted[0] || data;
  }

  async update(id: string, data: Partial<CategoryRow>): Promise<CategoryRow | null> {
    const updated = await db
      .update(categoriesTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(categoriesTable.id, id))
      .returning();

    return updated[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await db
      .delete(categoriesTable)
      .where(eq(categoriesTable.id, id))
      .returning();

    return deleted.length > 0;
  }

  /**
   * Helper: Lấy tất cả category IDs bao gồm cả ID danh mục hiện tại và các danh mục con cháu
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
