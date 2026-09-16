import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartState, CartItem } from '../types.ts';
import type { Product } from '../../products/types.ts';

// Valid promo codes for demo
const VALID_COUPONS: Record<string, number> = {
  GIAM10: 10,
  WELCOME10: 10,
  VIP20: 20,
  FREESHIP: 0, // Special flag
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      couponCode: null,
      discountPercent: 0,

      addItem: (product: Product, quantity = 1, variantId?: string | null) => {
        if (quantity <= 0) return;

        set((state) => {
          const cartItemId = variantId ? `${product.id}-${variantId}` : product.id;
          const existingIndex = state.items.findIndex((i) => i.id === cartItemId);
          const maxStock = product.inventory > 0 ? product.inventory : 999;

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
              { id: cartItemId, product, quantity: initialQty, variantId },
            ],
          };
        });
      },

      removeItem: (id: string) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        }));
      },

      updateQuantity: (id: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }

        set((state) => {
          const item = state.items.find((i) => i.id === id);
          const maxStock = item && item.product.inventory > 0 ? item.product.inventory : 999;
          const clampedQty = Math.min(maxStock, quantity);

          return {
            items: state.items.map((i) =>
              i.id === id ? { ...i, quantity: clampedQty } : i
            ),
          };
        });
      },

      clearCart: () => {
        set({ items: [], couponCode: null, discountPercent: 0 });
      },

      setOpen: (isOpen: boolean) => set({ isOpen }),

      applyCoupon: (code: string) => {
        const cleanCode = code.trim().toUpperCase();
        if (VALID_COUPONS[cleanCode] !== undefined) {
          const percent = VALID_COUPONS[cleanCode];
          set({ couponCode: cleanCode, discountPercent: percent });
          return {
            success: true,
            message:
              percent > 0
                ? `Áp dụng mã ${cleanCode} thành công: Giảm ${percent}%!`
                : `Áp dụng mã ${cleanCode} thành công: Miễn phí vận chuyển!`,
          };
        }
        return {
          success: false,
          message: 'Mã giảm giá không hợp lệ. Thử: GIAM10, WELCOME10, hoặc VIP20',
        };
      },

      removeCoupon: () => {
        set({ couponCode: null, discountPercent: 0 });
      },

      totalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

      subtotalPrice: () =>
        get().items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),

      shippingFee: () => {
        const subtotal = get().subtotalPrice();
        if (subtotal === 0) return 0;
        if (get().couponCode === 'FREESHIP' || subtotal >= 500000) return 0;
        return 30000; // Standard flat shipping fee: 30.000 VNĐ
      },

      discountAmount: () => {
        const subtotal = get().subtotalPrice();
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
        discountPercent: state.discountPercent,
      }),
    }
  )
);

