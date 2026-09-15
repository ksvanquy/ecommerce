import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  X,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  PackageOpen,
  Sparkles,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';
import { useCartStore } from '../store/cartStore.ts';
import { Button } from '../../../components/ui/Button.tsx';
import { Badge } from '../../../components/ui/Badge.tsx';
import { CheckoutModal } from './CheckoutModal.tsx';
import { OrderSuccessModal } from './OrderSuccessModal.tsx';
import type { Order } from '../types.ts';

interface CartDrawerProps {
  onNavigateToCart?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onNavigateToCart }) => {
  const navigate = useNavigate();
  const {
    items,
    isOpen,
    setOpen,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    subtotalPrice,
    discountAmount,
    shippingFee,
    totalPrice,
    couponCode,
  } = useCartStore();

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isCheckoutOpen && !isSuccessOpen) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isCheckoutOpen, isSuccessOpen, setOpen]);

  if (!isOpen) return null;

  const count = totalItems();
  const subtotal = subtotalPrice();
  const discount = discountAmount();
  const shipping = shippingFee();
  const total = totalPrice();

  const handleGoToFullCart = () => {
    setOpen(false);
    if (onNavigateToCart) {
      onNavigateToCart();
    } else {
      navigate('/cart');
    }
  };

  const handleOpenCheckout = () => {
    setIsCheckoutOpen(true);
  };

  return (
    <>
      <div
        id="cart-drawer-backdrop"
        className="fixed inset-0 z-50 flex justify-end bg-slate-950/50 backdrop-blur-xs transition-opacity duration-300"
        onClick={() => setOpen(false)}
      >
        <div
          id="cart-drawer-panel"
          className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-out border-l border-slate-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drawer Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-slate-900 leading-tight">
                  Giỏ hàng của bạn
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  {count} {count === 1 ? 'sản phẩm' : 'sản phẩm'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              {items.length > 0 && (
                <button
                  type="button"
                  id="btn-drawer-clear"
                  onClick={clearCart}
                  className="text-[11px] text-slate-500 hover:text-rose-600 px-2 py-1 rounded hover:bg-rose-50 transition cursor-pointer"
                  title="Xóa tất cả sản phẩm"
                >
                  Xóa tất cả
                </button>
              )}
              <button
                type="button"
                id="btn-drawer-close"
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
                aria-label="Đóng giỏ hàng"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {items.length === 0 ? (
              <div className="text-center py-16 px-4 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <PackageOpen className="w-7 h-7" />
                </div>
                <h4 className="font-semibold text-slate-800 text-sm">Giỏ hàng đang trống</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Bạn chưa thêm sản phẩm nào vào giỏ. Hãy dạo qua danh mục sản phẩm và chọn món đồ yêu thích!
                </p>
                <div className="pt-2">
                  <Button
                    id="btn-drawer-explore"
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setOpen(false);
                      if (onNavigateToCart) {
                        onNavigateToCart();
                      } else {
                        navigate('/products');
                      }
                    }}
                  >
                    Khám phá sản phẩm
                  </Button>
                </div>
              </div>
            ) : (
              items.map(({ product, quantity }) => {
                const maxStock = product.inventory > 0 ? product.inventory : 999;
                const isMax = quantity >= maxStock;

                return (
                  <div
                    key={product.id}
                    id={`cart-drawer-item-${product.id}`}
                    className="flex items-start gap-3 p-3 bg-slate-50/70 hover:bg-slate-50 rounded-xl border border-slate-200/80 transition group"
                  >
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-lg bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 p-1">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">
                          {product.name.charAt(0)}
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h5 className="font-medium text-xs text-slate-900 truncate pr-1" title={product.name}>
                          {product.name}
                        </h5>
                        <button
                          type="button"
                          id={`btn-drawer-remove-${product.id}`}
                          onClick={() => removeItem(product.id)}
                          className="text-slate-400 hover:text-rose-600 p-0.5 rounded transition opacity-60 group-hover:opacity-100 cursor-pointer"
                          title="Xóa khỏi giỏ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="neutral" className="text-[9px] py-0 px-1.5">
                          {product.category}
                        </Badge>
                        <span className="text-[11px] text-slate-500 font-mono">
                          ${product.price.toLocaleString()} / cái
                        </span>
                      </div>

                      {/* Quantity controls & Line Total */}
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/50">
                        <div className="flex items-center border border-slate-200 rounded-md bg-white shadow-2xs">
                          <button
                            type="button"
                            id={`btn-drawer-dec-${product.id}`}
                            onClick={() => updateQuantity(product.id, quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition rounded-l cursor-pointer"
                            aria-label="Giảm số lượng"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-7 text-center font-mono text-xs font-semibold text-slate-800">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            id={`btn-drawer-inc-${product.id}`}
                            onClick={() => updateQuantity(product.id, quantity + 1)}
                            disabled={isMax}
                            className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition rounded-r cursor-pointer"
                            aria-label="Tăng số lượng"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="text-right font-mono font-bold text-xs text-slate-900">
                          ${(product.price * quantity).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Drawer Footer Summary */}
          {items.length > 0 && (
            <div className="p-4 border-t border-slate-200 bg-slate-50/90 space-y-3">
              {/* Free shipping progress hint */}
              {subtotal < 200 ? (
                <div className="p-2 bg-blue-50 border border-blue-100 rounded-xl text-[11px] text-blue-800 flex items-center justify-between">
                  <span>Mua thêm <strong>${(200 - subtotal).toLocaleString()}</strong> để nhận</span>
                  <span className="font-semibold text-blue-600">Miễn phí ship</span>
                </div>
              ) : (
                <div className="p-2 bg-emerald-50 border border-emerald-100 rounded-xl text-[11px] text-emerald-800 flex items-center gap-1.5 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Đơn hàng của bạn đã được <strong>Miễn phí vận chuyển</strong>!</span>
                </div>
              )}

              {/* Calculation summary breakdown */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Tạm tính ({count} món):</span>
                  <span className="font-mono font-medium">${subtotal.toLocaleString()}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Giảm giá ({couponCode}):
                    </span>
                    <span className="font-mono">-${discount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span>Phí vận chuyển:</span>
                  <span className="font-mono font-medium">
                    {shipping === 0 ? (
                      <span className="text-emerald-600 font-semibold">Miễn phí</span>
                    ) : (
                      `$${shipping}`
                    )}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                  <span className="text-xs font-semibold text-slate-900">Tổng cộng:</span>
                  <span className="text-lg font-bold text-blue-600 font-mono">
                    ${total.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-1">
                {/* Direct Checkout button */}
                <Button
                  id="btn-drawer-checkout"
                  variant="primary"
                  size="md"
                  className="w-full justify-center text-xs font-bold"
                  onClick={handleOpenCheckout}
                >
                  <CreditCard className="w-4 h-4 mr-1.5" />
                  <span>Đặt hàng ngay (${total.toLocaleString()})</span>
                </Button>

                {/* View Full Cart button */}
                <Button
                  id="btn-drawer-view-cart"
                  variant="outline"
                  size="md"
                  className="w-full justify-center text-xs font-semibold"
                  onClick={handleGoToFullCart}
                >
                  <span>Xem &amp; chỉnh sửa giỏ hàng</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Thanh toán an toàn, bảo mật &amp; nhanh chóng</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Direct Checkout Modal from Drawer */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={(order) => {
          setCreatedOrder(order);
          setIsSuccessOpen(true);
        }}
      />

      {/* Order Success Modal */}
      <OrderSuccessModal
        isOpen={isSuccessOpen}
        onClose={() => {
          setIsSuccessOpen(false);
          setCreatedOrder(null);
          setOpen(false);
        }}
        order={createdOrder}
      />
    </>
  );
};
