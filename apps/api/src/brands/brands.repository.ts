import { eq } from 'drizzle-orm';
import { db } from '../db/index.ts';
import { brandsTable } from '../db/schema/index.ts';
import type { Brand } from '@repo/shared-types';

export class BrandsRepository {
  async findAll(): Promise<Brand[]> {
    const rows = await db
      .select()
      .from(brandsTable)
      .where(eq(brandsTable.isActive, true));

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      logoUrl: r.logoUrl || undefined,
      description: r.description || undefined,
      website: r.website || undefined,
      country: r.country || undefined,
      isActive: r.isActive,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
  }

  async findById(id: string): Promise<Brand | null> {
    const rows = await db
      .select()
      .from(brandsTable)
      .where(eq(brandsTable.id, id))
      .limit(1);

    if (!rows[0]) return null;
    const r = rows[0];

    return {
      id: r.id,
      name: r.name,
      slug: r.slug,
      logoUrl: r.logoUrl || undefined,
      description: r.description || undefined,
      website: r.website || undefined,
      country: r.country || undefined,
      isActive: r.isActive,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    };
  }

  async create(data: { name: string; slug: string; logoUrl?: string; description?: string; website?: string; country?: string; isActive?: boolean }): Promise<Brand> {
    const newId = `brand_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date();

    const [inserted] = await db
      .insert(brandsTable)
      .values({
        id: newId,
        name: data.name.trim(),
        slug: data.slug.trim().toLowerCase(),
        logoUrl: data.logoUrl || null,
        description: data.description || null,
        website: data.website || null,
        country: data.country || null,
        isActive: data.isActive !== undefined ? data.isActive : true,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return {
      id: inserted.id,
      name: inserted.name,
      slug: inserted.slug,
      logoUrl: inserted.logoUrl || undefined,
      description: inserted.description || undefined,
      website: inserted.website || undefined,
      country: inserted.country || undefined,
      isActive: inserted.isActive,
      createdAt: inserted.createdAt.toISOString(),
      updatedAt: inserted.updatedAt.toISOString(),
    };
  }

  async update(id: string, data: Partial<{ name: string; slug: string; logoUrl: string; description: string; website: string; country: string; isActive: boolean }>): Promise<Brand | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const now = new Date();
    const [updated] = await db
      .update(brandsTable)
      .set({
        name: data.name !== undefined ? data.name.trim() : existing.name,
        slug: data.slug !== undefined ? data.slug.trim().toLowerCase() : existing.slug,
        logoUrl: data.logoUrl !== undefined ? data.logoUrl : existing.logoUrl,
        description: data.description !== undefined ? data.description : existing.description,
        website: data.website !== undefined ? data.website : existing.website,
        country: data.country !== undefined ? data.country : existing.country,
        isActive: data.isActive !== undefined ? data.isActive : existing.isActive,
        updatedAt: now,
      })
      .where(eq(brandsTable.id, id))
      .returning();

    if (!updated) return null;

    return {
      id: updated.id,
      name: updated.name,
      slug: updated.slug,
      logoUrl: updated.logoUrl || undefined,
      description: updated.description || undefined,
      website: updated.website || undefined,
      country: updated.country || undefined,
      isActive: updated.isActive,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await db
      .delete(brandsTable)
      .where(eq(brandsTable.id, id))
      .returning();

    return deleted.length > 0;
  }
}

export const brandsRepository = new BrandsRepository();
