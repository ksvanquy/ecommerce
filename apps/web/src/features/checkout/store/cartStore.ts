import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartState, CartItem } from '../types.ts';
import type { Product } from '../../products/types.ts';
import { cartApi } from '../api/cartApi.ts';
import { couponsApi } from '../api/couponsApi.ts';

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      isLoading: false,
      couponCode: null,
      appliedCoupon: null,
      discountPercent: 0,
      discountCalculatedAmount: 0,

      syncWithServer: async () => {
        try {
          set({ isLoading: true });
          const serverCart = await cartApi.getCart();
          if (serverCart && Array.isArray(serverCart.items)) {
            const mappedItems: CartItem[] = serverCart.items.map((item) => ({
              id: item.variantId ? `${item.productId}-${item.variantId}` : item.productId,
              serverItemId: item.id,
              productId: item.productId,
              product: item.product as Product,
              quantity: item.quantity,
              variantId: item.variantId || null,
              isSelected: item.isSelected !== false,
            }));
            set({ items: mappedItems, isLoading: false });
          } else {
            set({ isLoading: false });
          }
        } catch {
          // If network error, preserve local storage items
          set({ isLoading: false });
        }
      },

      addItem: async (product: Product, quantity = 1, variantId?: string | null) => {
        if (quantity <= 0) return;

        const cartItemId = variantId ? `${product.id}-${variantId}` : product.id;
        const maxStock = product.inventory > 0 ? product.inventory : 999;

        // Optimistic local state update
        set((state) => {
          const existingIndex = state.items.findIndex((i) => i.id === cartItemId);
          if (existingIndex > -1) {
            const updated = [...state.items];
            const currentQty = updated[existingIndex].quantity;
            const newQty = Math.min(maxStock, currentQty + quantity);
            updated[existingIndex] = {
              ...updated[existingIndex],
              quantity: newQty,
            };
            return { items: updated };
          }

          const initialQty = Math.min(maxStock, quantity);
          return {
            items: [
              ...state.items,
              {
                id: cartItemId,
                productId: product.id,
                product,
                quantity: initialQty,
                variantId: variantId || null,
                isSelected: true,
              },
            ],
          };
        });

        // Server sync in background
        try {
          const serverCart = await cartApi.addItem({
            productId: product.id,
            variantId: variantId || null,
            quantity,
            isSelected: true,
          });

          if (serverCart?.items) {
            const mappedItems: CartItem[] = serverCart.items.map((item) => ({
              id: item.variantId ? `${item.productId}-${item.variantId}` : item.productId,
              serverItemId: item.id,
              productId: item.productId,
              product: item.product as Product,
              quantity: item.quantity,
              variantId: item.variantId || null,
              isSelected: item.isSelected !== false,
            }));
            set({ items: mappedItems });
          }
        } catch (err) {
          console.warn('[CartStore] Background server sync error:', err);
        }
      },

      removeItem: async (id: string) => {
        const itemToRemove = get().items.find((i) => i.id === id);

        // Optimistic local state update
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        }));

        // Server sync
        if (itemToRemove?.serverItemId) {
          try {
            await cartApi.removeItem(itemToRemove.serverItemId);
          } catch (err) {
            console.warn('[CartStore] Remove item sync error:', err);
          }
        }
      },

      updateQuantity: async (id: string, quantity: number) => {
        if (quantity <= 0) {
          await get().removeItem(id);
          return;
        }

        const item = get().items.find((i) => i.id === id);
        const maxStock = item && item.product.inventory > 0 ? item.product.inventory : 999;
        const clampedQty = Math.min(maxStock, quantity);

        // Optimistic update
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, quantity: clampedQty } : i
          ),
        }));

        // Server sync
        if (item?.serverItemId) {
          try {
            await cartApi.updateItem(item.serverItemId, { quantity: clampedQty });
          } catch (err) {
            console.warn('[CartStore] Update quantity sync error:', err);
          }
        }
      },

      toggleSelectItem: async (id: string, isSelected?: boolean) => {
        const currentItem = get().items.find((i) => i.id === id);
        if (!currentItem) return;

        const nextVal = isSelected !== undefined ? isSelected : !currentItem.isSelected;

        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, isSelected: nextVal } : i
          ),
        }));

        if (currentItem.serverItemId) {
          try {
            await cartApi.updateItem(currentItem.serverItemId, { isSelected: nextVal });
          } catch (err) {
            console.warn('[CartStore] Toggle select sync error:', err);
          }
        }
      },

      toggleSelectAll: async (select: boolean) => {
        set((state) => ({
          items: state.items.map((i) => ({ ...i, isSelected: select })),
        }));

        // Sync items
        const items = get().items;
        for (const item of items) {
          if (item.serverItemId) {
            cartApi.updateItem(item.serverItemId, { isSelected: select }).catch(() => {});
          }
        }
      },

      clearCart: async () => {
        set({
          items: [],
          couponCode: null,
          appliedCoupon: null,
          discountPercent: 0,
          discountCalculatedAmount: 0,
        });
        try {
          await cartApi.clearCart();
        } catch (err) {
          console.warn('[CartStore] Clear cart sync error:', err);
        }
      },

      setOpen: (isOpen: boolean) => set({ isOpen }),

      applyCoupon: async (code: string) => {
        const cleanCode = code.trim().toUpperCase();
        if (!cleanCode) {
          return { success: false, message: 'Vui lòng nhập mã giảm giá' };
        }

        const subtotal = get().subtotalPrice();
        try {
          const result = await couponsApi.validateCoupon({
            code: cleanCode,
            orderSubtotal: subtotal,
          });

          if (result.valid && result.coupon) {
            set({
              couponCode: cleanCode,
              appliedCoupon: result.coupon,
              discountCalculatedAmount: result.discountAmount,
              discountPercent:
                result.coupon.discountType === 'percentage'
                  ? result.coupon.discountValue
                  : 0,
            });
            return {
              success: true,
              message: result.message || `Áp dụng mã ${cleanCode} thành công!`,
            };
          }
          return {
            success: false,
            message: result.message || 'Mã giảm giá không hợp lệ',
          };
        } catch (error: any) {
          const msg =
            error?.response?.data?.message ||
            error?.response?.data?.error?.message ||
            'Mã giảm giá không hợp lệ hoặc không đủ điều kiện';
          return {
            success: false,
            message: msg,
          };
        }
      },

      removeCoupon: () => {
        set({
          couponCode: null,
          appliedCoupon: null,
          discountPercent: 0,
          discountCalculatedAmount: 0,
        });
      },

      totalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

      selectedItemsCount: () =>
        get().items.filter((i) => i.isSelected).reduce((sum, item) => sum + item.quantity, 0),

      allSubtotalPrice: () =>
        get().items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),

      subtotalPrice: () =>
        get()
          .items.filter((i) => i.isSelected)
          .reduce((sum, item) => sum + item.product.price * item.quantity, 0),

      shippingFee: () => {
        const subtotal = get().subtotalPrice();
        if (subtotal === 0) return 0;
        if (get().couponCode === 'FREESHIP' || subtotal >= 500000) return 0;
        return 30000; // Standard flat shipping fee: 30.000 VNĐ
      },

      discountAmount: () => {
        const subtotal = get().subtotalPrice();
        if (subtotal === 0) return 0;

        const fixedDiscount = get().discountCalculatedAmount;
        if (fixedDiscount > 0) {
          return Math.min(fixedDiscount, subtotal);
        }

        const percent = get().discountPercent;
        if (percent > 0) {
          return Math.round((subtotal * percent) / 100);
        }
        return 0;
      },

      totalPrice: () => {
        const subtotal = get().subtotalPrice();
        if (subtotal === 0) return 0;
        const discount = get().discountAmount();
        const shipping = get().shippingFee();
        return Math.max(0, subtotal - discount + shipping);
      },
    }),
    {
      name: 'ecommerce-cart-storage',
      partialize: (state) => ({
        items: state.items,
        couponCode: state.couponCode,
        appliedCoupon: state.appliedCoupon,
        discountPercent: state.discountPercent,
        discountCalculatedAmount: state.discountCalculatedAmount,
      }),
    }
  )
);
