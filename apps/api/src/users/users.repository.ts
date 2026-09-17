import { eq } from 'drizzle-orm';
import { db } from '../db/index.ts';
import { usersTable, UserDb, NewUserDb } from '../db/schema/index.ts';

export class UsersRepository {
  async findByEmail(email: string): Promise<UserDb | null> {
    const normalizedEmail = email.trim().toLowerCase();
    const results = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, normalizedEmail))
      .limit(1);

    return results[0] || null;
  }

  async findById(id: string): Promise<UserDb | null> {
    const results = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1);

    return results[0] || null;
  }

  async create(data: NewUserDb): Promise<UserDb> {
    const userToSave: UserDb = {
      id: data.id,
      email: data.email.trim().toLowerCase(),
      passwordHash: data.passwordHash,
      fullName: data.fullName.trim(),
      role: data.role || 'customer',
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
    };

    const inserted = await db.insert(usersTable).values(userToSave).returning();
    return inserted[0] || userToSave;
  }

  async listAll(): Promise<UserDb[]> {
    return await db.select().from(usersTable);
  }

  async updateRole(id: string, role: string): Promise<UserDb | null> {
    const [updated] = await db
      .update(usersTable)
      .set({ role, updatedAt: new Date() })
      .where(eq(usersTable.id, id))
      .returning();

    return updated || null;
  }

  async deleteUser(id: string): Promise<boolean> {
    const deleted = await db
      .delete(usersTable)
      .where(eq(usersTable.id, id))
      .returning();

    return deleted.length > 0;
  }
}

export const usersRepository = new UsersRepository();
