import { eq, and, sql, inArray } from 'drizzle-orm';
import { db } from '../db/index.ts';
import {
  cartsTable,
  cartItemsTable,
  productsTable,
  productVariantsTable,
  productImagesTable,
  brandsTable,
} from '../db/schema/index.ts';
import type { Cart, CartItem, Product, ProductVariant, Brand } from '@repo/shared-types';

export class CartRepository {
  async findCartByUserId(userId: string) {
    const carts = await db
      .select()
      .from(cartsTable)
      .where(eq(cartsTable.userId, userId))
      .limit(1);
    return carts[0] || null;
  }

  async findCartBySessionId(sessionId: string) {
    const carts = await db
      .select()
      .from(cartsTable)
      .where(eq(cartsTable.sessionId, sessionId))
      .limit(1);
    return carts[0] || null;
  }

  async createCart(userId?: string | null, sessionId?: string | null) {
    const id = `cart_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date();

    const [created] = await db
      .insert(cartsTable)
      .values({
        id,
        userId: userId || null,
        sessionId: sessionId || null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return created;
  }

  async getOrCreateCart(userId?: string | null, sessionId?: string | null) {
    if (userId) {
      const existingUserCart = await this.findCartByUserId(userId);
      if (existingUserCart) return existingUserCart;
    } else if (sessionId) {
      const existingSessionCart = await this.findCartBySessionId(sessionId);
      if (existingSessionCart) return existingSessionCart;
    }

    return await this.createCart(userId, sessionId);
  }

  async getPopulatedCart(cartId: string): Promise<Cart | null> {
    const [dbCart] = await db
      .select()
      .from(cartsTable)
      .where(eq(cartsTable.id, cartId))
      .limit(1);

    if (!dbCart) return null;

    const dbItems = await db
      .select()
      .from(cartItemsTable)
      .where(eq(cartItemsTable.cartId, cartId))
      .orderBy(cartItemsTable.createdAt);

    if (dbItems.length === 0) {
      return {
        id: dbCart.id,
        userId: dbCart.userId,
        sessionId: dbCart.sessionId,
        items: [],
        totalQuantity: 0,
        selectedSubtotal: 0,
        createdAt: dbCart.createdAt.toISOString(),
        updatedAt: dbCart.updatedAt.toISOString(),
      };
    }

    const productIds: string[] = Array.from(new Set(dbItems.map((i) => i.productId)));
    const variantIds: string[] = Array.from(
      new Set(
        dbItems
          .map((i) => i.variantId)
          .filter((v): v is string => typeof v === 'string' && v.length > 0)
      )
    );

    // Fetch Products
    const dbProducts = productIds.length > 0
      ? await db.select().from(productsTable).where(inArray(productsTable.id, productIds))
      : [];

    // Fetch Brands
    const brandIds: string[] = Array.from(
      new Set(
        dbProducts
          .map((p) => p.brandId)
          .filter((b): b is string => typeof b === 'string' && b.length > 0)
      )
    );
    const brandsMap = new Map<string, Brand>();
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
    const dbImages = productIds.length > 0
      ? await db
          .select()
          .from(productImagesTable)
          .where(inArray(productImagesTable.productId, productIds))
      : [];

    const imagesByProduct = new Map<string, any[]>();
    for (const img of dbImages) {
      const list = imagesByProduct.get(img.productId) || [];
      list.push({
        id: img.id,
        productId: img.productId,
        imageUrl: img.imageUrl,
        altText: img.altText || undefined,
        isThumbnail: img.isThumbnail,
        sortOrder: img.sortOrder,
        createdAt: img.createdAt.toISOString(),
      });
      imagesByProduct.set(img.productId, list);
    }

    const productsMap = new Map<string, Product>();
    for (const p of dbProducts) {
      productsMap.set(p.id, {
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        inventory: p.inventory,
        category: p.category,
        categoryId: p.categoryId,
        brandId: p.brandId,
        brand: p.brandId ? brandsMap.get(p.brandId) : undefined,
        imageUrl: p.imageUrl || undefined,
        images: imagesByProduct.get(p.id) || [],
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      });
    }

    // Fetch Variants if any
    const variantsMap = new Map<string, ProductVariant>();
    if (variantIds.length > 0) {
      const dbVariants = await db
        .select()
        .from(productVariantsTable)
        .where(inArray(productVariantsTable.id, variantIds));

      for (const v of dbVariants) {
        variantsMap.set(v.id, {
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
        });
      }
    }

    let totalQuantity = 0;
    let selectedSubtotal = 0;

    const items: CartItem[] = [];
    for (const item of dbItems) {
      const product = productsMap.get(item.productId);
      if (!product) continue;

      const variant = item.variantId ? variantsMap.get(item.variantId) || null : null;
      const itemPrice = variant ? variant.price : product.price;

      totalQuantity += item.quantity;
      if (item.isSelected) {
        selectedSubtotal += itemPrice * item.quantity;
      }

      items.push({
        id: item.id,
        cartId: item.cartId,
        productId: item.productId,
        variantId: item.variantId,
        product,
        variant,
        quantity: item.quantity,
        isSelected: item.isSelected,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      });
    }

    return {
      id: dbCart.id,
      userId: dbCart.userId,
      sessionId: dbCart.sessionId,
      items,
      totalQuantity,
      selectedSubtotal,
      createdAt: dbCart.createdAt.toISOString(),
      updatedAt: dbCart.updatedAt.toISOString(),
    };
  }

  async findCartItem(cartId: string, productId: string, variantId?: string | null) {
    const query = variantId
      ? and(
          eq(cartItemsTable.cartId, cartId),
          eq(cartItemsTable.productId, productId),
          eq(cartItemsTable.variantId, variantId)
        )
      : and(
          eq(cartItemsTable.cartId, cartId),
          eq(cartItemsTable.productId, productId),
          sql`${cartItemsTable.variantId} IS NULL`
        );

    const [item] = await db.select().from(cartItemsTable).where(query).limit(1);
    return item || null;
  }

  async findCartItemById(itemId: string) {
    const [item] = await db
      .select()
      .from(cartItemsTable)
      .where(eq(cartItemsTable.id, itemId))
      .limit(1);
    return item || null;
  }

  async addItem(cartId: string, productId: string, variantId?: string | null, quantity: number = 1, isSelected: boolean = true) {
    const existing = await this.findCartItem(cartId, productId, variantId);

    if (existing) {
      const newQty = existing.quantity + quantity;
      const [updated] = await db
        .update(cartItemsTable)
        .set({
          quantity: newQty,
          isSelected,
          updatedAt: new Date(),
        })
        .where(eq(cartItemsTable.id, existing.id))
        .returning();
      return updated;
    }

    const id = `item_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date();

    const [created] = await db
      .insert(cartItemsTable)
      .values({
        id,
        cartId,
        productId,
        variantId: variantId || null,
        quantity,
        isSelected,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return created;
  }

  async updateItem(itemId: string, quantity?: number, isSelected?: boolean) {
    const updateData: Record<string, any> = { updatedAt: new Date() };
    if (typeof quantity === 'number') updateData.quantity = quantity;
    if (typeof isSelected === 'boolean') updateData.isSelected = isSelected;

    const [updated] = await db
      .update(cartItemsTable)
      .set(updateData)
      .where(eq(cartItemsTable.id, itemId))
      .returning();

    return updated || null;
  }

  async removeItem(itemId: string) {
    const [deleted] = await db
      .delete(cartItemsTable)
      .where(eq(cartItemsTable.id, itemId))
      .returning();
    return deleted || null;
  }

  async clearCart(cartId: string) {
    await db.delete(cartItemsTable).where(eq(cartItemsTable.cartId, cartId));
  }

  async mergeSessionCartIntoUserCart(sessionId: string, userId: string) {
    const sessionCart = await this.findCartBySessionId(sessionId);
    if (!sessionCart) return;

    const userCart = await this.getOrCreateCart(userId);
    const sessionItems = await db
      .select()
      .from(cartItemsTable)
      .where(eq(cartItemsTable.cartId, sessionCart.id));

    for (const item of sessionItems) {
      await this.addItem(
        userCart.id,
        item.productId,
        item.variantId,
        item.quantity,
        item.isSelected
      );
    }

    // Clean up session cart
    await db.delete(cartItemsTable).where(eq(cartItemsTable.cartId, sessionCart.id));
    await db.delete(cartsTable).where(eq(cartsTable.id, sessionCart.id));
  }
}

export const cartRepository = new CartRepository();
