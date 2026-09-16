import { eq, and, not } from 'drizzle-orm';
import { db } from '../db/index.ts';
import { userAddressesTable } from '../db/schema/index.ts';
import type { UserAddress, CreateAddressPayload, UpdateAddressPayload } from '@repo/shared-types';

export class AddressesRepository {
  private formatAddress(dbAddr: any): UserAddress {
    return {
      id: dbAddr.id,
      userId: dbAddr.userId,
      receiverName: dbAddr.receiverName,
      receiverPhone: dbAddr.receiverPhone,
      province: dbAddr.province,
      district: dbAddr.district,
      ward: dbAddr.ward,
      streetAddress: dbAddr.streetAddress,
      addressType: dbAddr.addressType as any,
      isDefault: dbAddr.isDefault,
      createdAt: dbAddr.createdAt.toISOString(),
      updatedAt: dbAddr.updatedAt.toISOString(),
    };
  }

  async findByUserId(userId: string): Promise<UserAddress[]> {
    const list = await db
      .select()
      .from(userAddressesTable)
      .where(eq(userAddressesTable.userId, userId))
      .orderBy(userAddressesTable.isDefault ? sql`is_default DESC` : userAddressesTable.createdAt);
    
    // Fallback order since we want isDefault to be first
    return list
      .map(item => this.formatAddress(item))
      .sort((a, b) => {
        if (a.isDefault && !b.isDefault) return -1;
        if (!a.isDefault && b.isDefault) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }

  async findDefaultByUserId(userId: string): Promise<UserAddress | null> {
    const [addr] = await db
      .select()
      .from(userAddressesTable)
      .where(and(eq(userAddressesTable.userId, userId), eq(userAddressesTable.isDefault, true)))
      .limit(1);

    return addr ? this.formatAddress(addr) : null;
  }

  async findById(id: string): Promise<UserAddress | null> {
    const [addr] = await db
      .select()
      .from(userAddressesTable)
      .where(eq(userAddressesTable.id, id))
      .limit(1);

    return addr ? this.formatAddress(addr) : null;
  }

  async createAddress(userId: string, data: CreateAddressPayload): Promise<UserAddress> {
    const id = `addr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date();

    // If this is set as default, we need to reset other default addresses for this user
    if (data.isDefault) {
      await db
        .update(userAddressesTable)
        .set({ isDefault: false, updatedAt: now })
        .where(eq(userAddressesTable.userId, userId));
    } else {
      // If user has no addresses yet, make this one default
      const existing = await this.findByUserId(userId);
      if (existing.length === 0) {
        data.isDefault = true;
      }
    }

    const [created] = await db
      .insert(userAddressesTable)
      .values({
        id,
        userId,
        receiverName: data.receiverName,
        receiverPhone: data.receiverPhone,
        province: data.province,
        district: data.district,
        ward: data.ward,
        streetAddress: data.streetAddress,
        addressType: data.addressType || 'home',
        isDefault: data.isDefault || false,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return this.formatAddress(created);
  }

  async updateAddress(id: string, userId: string, data: UpdateAddressPayload): Promise<UserAddress> {
    const now = new Date();

    // If we are setting this address as default, reset others first
    if (data.isDefault) {
      await db
        .update(userAddressesTable)
        .set({ isDefault: false, updatedAt: now })
        .where(and(eq(userAddressesTable.userId, userId), not(eq(userAddressesTable.id, id))));
    }

    const [updated] = await db
      .update(userAddressesTable)
      .set({
        ...data,
        updatedAt: now,
      })
      .where(eq(userAddressesTable.id, id))
      .returning();

    if (!updated) {
      throw new Error('Address not found or could not be updated');
    }

    return this.formatAddress(updated);
  }

  async deleteAddress(id: string, userId: string): Promise<boolean> {
    // Check if the address to delete is default
    const addr = await this.findById(id);
    if (!addr) return false;

    await db.delete(userAddressesTable).where(eq(userAddressesTable.id, id));

    // If we deleted the default address, make the next oldest address default (if exists)
    if (addr.isDefault) {
      const remaining = await this.findByUserId(userId);
      if (remaining.length > 0) {
        await db
          .update(userAddressesTable)
          .set({ isDefault: true, updatedAt: new Date() })
          .where(eq(userAddressesTable.id, remaining[0].id));
      }
    }

    return true;
  }

  async setDefaultAddress(userId: string, addressId: string): Promise<UserAddress> {
    const now = new Date();

    // Reset all others
    await db
      .update(userAddressesTable)
      .set({ isDefault: false, updatedAt: now })
      .where(and(eq(userAddressesTable.userId, userId), not(eq(userAddressesTable.id, addressId))));

    // Set this one as default
    const [updated] = await db
      .update(userAddressesTable)
      .set({ isDefault: true, updatedAt: now })
      .where(eq(userAddressesTable.id, addressId))
      .returning();

    if (!updated) {
      throw new Error('Address not found or could not be set to default');
    }

    return this.formatAddress(updated);
  }
}

// Ensure sql tag helper works in order list
import { sql } from 'drizzle-orm';
export const addressesRepository = new AddressesRepository();
