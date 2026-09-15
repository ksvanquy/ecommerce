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
}

export const brandsRepository = new BrandsRepository();
