import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore.ts';
import { Button } from '../../../components/ui/Button.tsx';
import { Badge } from '../../../components/ui/Badge.tsx';
import { Card } from '../../../components/ui/Card.tsx';
import { Modal } from '../../../components/ui/Modal.tsx';
import { CheckoutModal } from './CheckoutModal.tsx';
import { OrderSuccessModal } from './OrderSuccessModal.tsx';
import type { Order } from '../types.ts';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Tag,
  Truck,
  CheckCircle2,
  PackageOpen,
  Code2,
  RotateCcw,
  Check,
  AlertCircle,
  Package,
} from 'lucide-react';

export const CartView: React.FC = () => {
  const navigate = useNavigate();
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    subtotalPrice,
    discountAmount,
    shippingFee,
    totalPrice,
    couponCode,
    discountPercent,
    applyCoupon,
    removeCoupon,
  } = useCartStore();

  const [inputCoupon, setInputCoupon] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const count = totalItems();
  const subtotal = subtotalPrice();
  const discount = discountAmount();
  const shipping = shippingFee();
  const total = totalPrice();

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCoupon.trim()) return;

    const result = applyCoupon(inputCoupon);
    if (result.success) {
      setCouponFeedback({ type: 'success', message: result.message });
      setInputCoupon('');
    } else {
      setCouponFeedback({ type: 'error', message: result.message });
    }
  };

  const handleQuickApplyCoupon = (code: string) => {
    const result = applyCoupon(code);
    if (result.success) {
      setCouponFeedback({ type: 'success', message: result.message });
    } else {
      setCouponFeedback({ type: 'error', message: result.message });
    }
  };

  // Sample order payload matching Phase 4 specifications
  const phase4Payload = {
    items: items.map((i) => ({
      productId: i.product.id,
      name: i.product.name,
      quantity: i.quantity,
      price: i.product.price,
      subtotal: i.product.price * i.quantity,
    })),
    subtotal,
    discount,
    couponCode,
    shipping,
    total,
    shippingAddress: '123 Đường Công Nghệ, Quận 1, TP. Hồ Chí Minh',
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2">
      {/* Phase 3 Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-blue-400/20 text-blue-300 text-[11px] font-bold px-2 py-0.5 rounded font-mono uppercase tracking-wider border border-blue-400/30">
                Giai đoạn 3 Hoàn thiện
              </span>
              <span className="text-slate-300 text-xs font-medium">
                Module Cart • Quản lý State Client (Zustand + LocalStorage)
              </span>
            </div>
            <h1 className="text-2xl font-bold mt-2 tracking-tight">
              Giỏ hàng Mua sắm (Shopping Cart)
            </h1>
            <p className="text-slate-300 text-xs mt-1 max-w-2xl leading-relaxed">
              Toàn bộ trạng thái giỏ hàng được quản lý bởi Zustand Store độc lập, tự động đồng bộ hóa vào LocalStorage. Người dùng có thể thêm/xóa/sửa số lượng, áp mã khuyến mãi và chuẩn bị dữ liệu sẵn sàng cho Giai đoạn 4 (Đặt hàng).
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <Link
              to="/products"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Tiếp tục mua hàng</span>
            </Link>
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        /* Empty Cart View */
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <PackageOpen className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Giỏ hàng của bạn đang trống</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Chưa có sản phẩm nào trong giỏ hàng. Hãy khám phá danh mục sản phẩm công nghệ chất lượng cao của chúng tôi.
            </p>
          </div>
          <div className="pt-2">
            <Button
              id="btn-empty-cart-explore"
              variant="primary"
              size="md"
              onClick={() => navigate('/products')}
            >
              <ShoppingBag className="w-4 h-4 mr-1.5" />
              Khám phá sản phẩm ngay
            </Button>
          </div>
        </div>
      ) : (
        /* Active Cart Layout: Items List + Order Summary */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Cart Items Table/List */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ShoppingBag className="w-5 h-5 text-blue-600" />
                  <h2 className="font-bold text-base text-slate-900">
                    Sản phẩm trong giỏ ({count} món)
                  </h2>
                </div>
                <button
                  type="button"
                  id="btn-cart-clear-all"
                  onClick={clearCart}
                  className="text-xs text-slate-500 hover:text-rose-600 font-medium transition flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa tất cả</span>
                </button>
              </div>

              {/* Items List */}
              <div className="divide-y divide-slate-100">
                {items.map(({ product, quantity }) => {
                  const maxStock = product.inventory > 0 ? product.inventory : 999;
                  const isMax = quantity >= maxStock;

                  return (
                    <div
                      key={product.id}
                      id={`cart-item-${product.id}`}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition"
                    >
                      {/* Product details & thumbnail */}
                      <div className="flex items-center space-x-4 min-w-0 flex-1">
                        <Link
                          to={`/products/${product.id}`}
                          className="w-20 h-20 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center p-2 shrink-0 overflow-hidden group/img hover:border-blue-300 transition"
                        >
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="max-h-full max-w-full object-contain group-hover/img:scale-105 transition"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-full h-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                              {product.name.charAt(0)}
                            </div>
                          )}
                        </Link>

                        <div className="min-w-0 flex-1 space-y-1">
                          <Badge variant="neutral" className="text-[10px] py-0 px-1.5 font-medium">
                            {product.category}
                          </Badge>
                          <Link
                            to={`/products/${product.id}`}
                            className="block font-semibold text-sm text-slate-900 hover:text-blue-600 truncate transition"
                          >
                            {product.name}
                          </Link>
                          <p className="text-xs text-slate-500">
                            Đơn giá:{' '}
                            <span className="font-mono font-semibold text-slate-800">
                              ${product.price.toLocaleString()}
                            </span>
                            {product.inventory > 0 && (
                              <span className="text-[11px] text-slate-400 ml-2">
                                (Kho: {product.inventory})
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Quantity stepper & Item Subtotal */}
                      <div className="flex items-center justify-between sm:justify-end space-x-6 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        {/* Stepper */}
                        <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 overflow-hidden shadow-2xs">
                          <button
                            type="button"
                            id={`btn-dec-qty-${product.id}`}
                            onClick={() => updateQuantity(product.id, quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition font-bold"
                            aria-label="Giảm số lượng"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-10 text-center font-mono text-xs font-semibold text-slate-900">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            id={`btn-inc-qty-${product.id}`}
                            onClick={() => updateQuantity(product.id, quantity + 1)}
                            disabled={isMax}
                            className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-transparent transition font-bold"
                            aria-label="Tăng số lượng"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Total per item */}
                        <div className="text-right min-w-[90px]">
                          <span className="text-[10px] text-slate-400 block sm:hidden">Thành tiền</span>
                          <span className="font-mono font-bold text-sm text-slate-900">
                            ${(product.price * quantity).toLocaleString()}
                          </span>
                        </div>

                        {/* Remove button */}
                        <button
                          type="button"
                          id={`btn-remove-item-${product.id}`}
                          onClick={() => removeItem(product.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Xóa sản phẩm này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom bar of table */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <Link
                  to="/products"
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                  Tiếp tục chọn thêm sản phẩm khác
                </Link>

                <div className="text-slate-500 text-[11px] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Dữ liệu giỏ hàng được đồng bộ tự động ở client</span>
                </div>
              </div>
            </div>

            {/* Micro Feature highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800">Miễn phí ship</p>
                  <p className="text-[11px] text-slate-400">Cho đơn hàng từ $200</p>
                </div>
              </div>
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800">Bảo hành chính hãng</p>
                  <p className="text-[11px] text-slate-400">12 tháng đổi mới 1-1</p>
                </div>
              </div>
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 flex items-center gap-2.5">
                <RotateCcw className="w-4 h-4 text-purple-600 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800">Đổi trả 30 ngày</p>
                  <p className="text-[11px] text-slate-400">Thủ tục nhanh chóng</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Order Summary Card */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 sticky top-20">
              <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-3">
                Tóm tắt đơn hàng
              </h3>

              {/* Price Breakdown */}
              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Tạm tính ({count} món):</span>
                  <span className="font-mono font-semibold text-slate-800">
                    ${subtotal.toLocaleString()}
                  </span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Giảm giá ({couponCode} - {discountPercent}%):
                    </span>
                    <span className="font-mono">-${discount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Phí vận chuyển dự kiến:</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {shipping === 0 ? (
                      <span className="text-emerald-600 font-bold">Miễn phí</span>
                    ) : (
                      `$${shipping}`
                    )}
                  </span>
                </div>

                {subtotal < 200 && shipping > 0 && (
                  <div className="p-2 bg-blue-50/70 border border-blue-100 rounded-lg text-[11px] text-blue-800">
                    Mua thêm ${(200 - subtotal).toLocaleString()} để được <strong>Miễn phí vận chuyển</strong>!
                  </div>
                )}

                <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-slate-900">Tổng thanh toán:</span>
                  <span className="text-2xl font-extrabold text-blue-600 font-mono">
                    ${total.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Coupon Code Input */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-blue-600" />
                    <span>Mã giảm giá (Coupon):</span>
                  </span>
                  {couponCode && (
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-[11px] text-rose-500 hover:text-rose-700 underline"
                    >
                      Bỏ mã
                    </button>
                  )}
                </div>

                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    id="input-cart-coupon"
                    value={inputCoupon}
                    onChange={(e) => setInputCoupon(e.target.value)}
                    placeholder="Nhập mã (ví dụ: GIAM10)"
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 uppercase font-mono"
                  />
                  <Button type="submit" variant="outline" size="sm">
                    Áp dụng
                  </Button>
                </form>

                {couponFeedback.message && (
                  <p
                    className={`text-[11px] ${
                      couponFeedback.type === 'success' ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {couponFeedback.message}
                  </p>
                )}

                {/* Quick Coupon Suggestions */}
                <div className="pt-1 flex flex-wrap gap-1 text-[10px]">
                  <span className="text-slate-400 mr-0.5">Gợi ý mã:</span>
                  {['GIAM10', 'WELCOME10', 'VIP20', 'FREESHIP'].map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => handleQuickApplyCoupon(code)}
                      className={`px-1.5 py-0.5 rounded font-mono font-medium border transition ${
                        couponCode === code
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200'
                      }`}
                    >
                      {code}
                    </button>
                  ))}
                </div>
              </div>

              {/* Checkout Action */}
              <div className="pt-3 space-y-2">
                <Button
                  id="btn-proceed-checkout"
                  variant="primary"
                  size="md"
                  className="w-full justify-center text-sm font-semibold"
                  onClick={() => setIsCheckoutModalOpen(true)}
                >
                  <span>Tiến hành Đặt hàng</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>

                <p className="text-[11px] text-center text-slate-400">
                  Thực hiện transaction kiểm tra tồn kho & tạo đơn hàng an toàn.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        onOrderSuccess={(order) => {
          setCreatedOrder(order);
          setIsSuccessModalOpen(true);
        }}
      />

      {/* Order Success Modal */}
      <OrderSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => {
          setIsSuccessModalOpen(false);
          setCreatedOrder(null);
        }}
        order={createdOrder}
      />
    </div>
  );
};
