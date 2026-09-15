import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { db } from '../db.ts';
import { checkDatabaseConnection } from '../connection.ts';
import { usersTable, UserDb, NewUserDb } from './users.schema.ts';

// In-memory persistent fallback store if PostgreSQL database is not connected
const inMemoryUsers: Map<string, UserDb> = new Map();

// Seed initial default test users into memory (hashed password: 'password123')
const DEFAULT_PASSWORD_HASH = bcrypt.hashSync('password123', 10);

const initialAdmin: UserDb = {
  id: 'usr_admin_default_01',
  email: 'admin@ecommerce.com',
  passwordHash: DEFAULT_PASSWORD_HASH,
  fullName: 'Quản trị viên Hệ thống',
  role: 'admin',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

const initialCustomer: UserDb = {
  id: 'usr_customer_demo_02',
  email: 'customer@ecommerce.com',
  passwordHash: DEFAULT_PASSWORD_HASH,
  fullName: 'Nguyễn Văn Khách Hàng',
  role: 'customer',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

inMemoryUsers.set(initialAdmin.id, initialAdmin);
inMemoryUsers.set(initialCustomer.id, initialCustomer);

export class UsersRepository {
  private async isDbAvailable(): Promise<boolean> {
    try {
      const conn = await checkDatabaseConnection();
      return conn.connected;
    } catch {
      return false;
    }
  }

  async findByEmail(email: string): Promise<UserDb | null> {
    const normalizedEmail = email.trim().toLowerCase();

    if (await this.isDbAvailable()) {
      try {
        const results = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.email, normalizedEmail))
          .limit(1);

        if (results.length > 0) {
          return results[0];
        }
      } catch (err) {
        console.warn('[UsersRepository] Postgres query failed, using memory store:', err);
      }
    }

    // Fallback: search in-memory
    for (const user of inMemoryUsers.values()) {
      if (user.email.toLowerCase() === normalizedEmail) {
        return user;
      }
    }
    return null;
  }

  async findById(id: string): Promise<UserDb | null> {
    if (await this.isDbAvailable()) {
      try {
        const results = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.id, id))
          .limit(1);

        if (results.length > 0) {
          return results[0];
        }
      } catch (err) {
        console.warn('[UsersRepository] Postgres query failed, using memory store:', err);
      }
    }

    return inMemoryUsers.get(id) || null;
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

    if (await this.isDbAvailable()) {
      try {
        const inserted = await db.insert(usersTable).values(userToSave).returning();
        if (inserted.length > 0) {
          inMemoryUsers.set(userToSave.id, userToSave);
          return inserted[0];
        }
      } catch (err) {
        console.warn('[UsersRepository] Postgres insert failed, saving to memory:', err);
      }
    }

    inMemoryUsers.set(userToSave.id, userToSave);
    return userToSave;
  }

  async listAll(): Promise<UserDb[]> {
    if (await this.isDbAvailable()) {
      try {
        const results = await db.select().from(usersTable);
        if (results.length > 0) return results;
      } catch (err) {
        console.warn('[UsersRepository] Postgres list failed, using memory store:', err);
      }
    }
    return Array.from(inMemoryUsers.values());
  }
}

export const usersRepository = new UsersRepository();
