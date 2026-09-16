import React, { useState, useEffect } from 'react';
import { useCartStore } from '../store/cartStore.ts';
import { useCreateOrder } from '../api/useCreateOrder.ts';
import { useAuthStore } from '../../auth/store/authStore.ts';
import { Modal, Button } from '@repo/ui';
import { formatCurrency } from '../../../utils/currency.ts';
import { createOrderSchema } from '@repo/shared-types';
import {
  ShoppingBag,
  Truck,
  CreditCard,
  Banknote,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Building,
  User,
  Phone,
  MapPin,
  FileText,
  Tag,
} from 'lucide-react';
import type { Order, PaymentMethod } from '../types.ts';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
}) => {
  const user = useAuthStore((state) => state.user);
  const items = useCartStore((state) => state.items);
  const couponCode = useCartStore((state) => state.couponCode);
  const subtotal = useCartStore((state) => state.subtotalPrice)();
  const discount = useCartStore((state) => state.discountAmount)();
  const shipping = useCartStore((state) => state.shippingFee)();
  const total = useCartStore((state) => state.totalPrice)();
  const clearCart = useCartStore((state) => state.clearCart);

  const { mutate: createOrder, isPending, error } = useCreateOrder();

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Pre-fill user information if logged in
  useEffect(() => {
    if (user) {
      if (!customerName) setCustomerName(user.fullName || '');
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const payload = {
      items: items.map((i) => ({
        productId: i.product.id,
        quantity: i.quantity,
      })),
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      shippingAddress: shippingAddress.trim(),
      customerNote: customerNote.trim() || undefined,
      couponCode: couponCode || undefined,
      paymentMethod,
    };

    // Client-side validation using shared Zod schema
    const validationResult = createOrderSchema.safeParse(payload);
    if (!validationResult.success) {
      const firstIssue = validationResult.error.issues[0];
      setValidationError(firstIssue?.message || 'Thông tin đơn hàng chưa đầy đủ hoặc không hợp lệ.');
      return;
    }

    createOrder(validationResult.data, {
      onSuccess: (newOrder) => {
        clearCart();
        onClose();
        onOrderSuccess(newOrder);
      },
      onError: (err: any) => {
        const errorMsg =
          err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.';
        setValidationError(errorMsg);
      },
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Xác nhận & Hoàn tất Đặt hàng"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6 text-slate-800">
        {/* Step Banner */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-xl p-3.5 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <p className="font-semibold text-blue-950">
              Kiểm tra tồn kho & Tính giá phía máy chủ (Server-side Transaction)
            </p>
            <p className="text-blue-800/80 mt-0.5">
              Hệ thống sẽ thực thi transaction nguyên tử trong CSDL PostgreSQL, khóa và trừ số lượng kho thật, tính lại chiết khấu & tổng tiền chính xác để bảo vệ tính toàn vẹn.
            </p>
          </div>
        </div>

        {/* Validation or API Error Alert */}
        {(validationError || error) && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Không thể hoàn tất đơn hàng:</p>
              <p className="mt-0.5">
                {validationError || (error as any)?.response?.data?.message || (error as any)?.message}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Customer and Shipping Information */}
          <div className="md:col-span-7 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                Thông tin người nhận hàng
              </h4>
              {user && (
                <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-700 font-medium rounded-md border border-blue-200">
                  Tài khoản: {user.email}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Họ và tên người nhận <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Văn An"
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Số điện thoại <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Ví dụ: 0901234567"
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Địa chỉ giao hàng chi tiết <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/TP"
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Ghi chú đơn hàng (Tùy chọn)
              </label>
              <div className="relative">
                <FileText className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <textarea
                  rows={2}
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                  placeholder="Chỉ dẫn giao hàng, giao giờ hành chính, gọi trước..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition resize-none"
                />
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                Phương thức thanh toán
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <label
                  className={`border rounded-xl p-3 flex items-start gap-2.5 cursor-pointer transition ${
                    paymentMethod === 'cod'
                      ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="mt-0.5 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-xs font-semibold text-slate-900">COD (Tiền mặt)</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Thanh toán tiền mặt khi nhân viên giao hàng tới tận nhà.
                    </p>
                  </div>
                </label>

                <label
                  className={`border rounded-xl p-3 flex items-start gap-2.5 cursor-pointer transition ${
                    paymentMethod === 'bank_transfer'
                      ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank_transfer"
                    checked={paymentMethod === 'bank_transfer'}
                    onChange={() => setPaymentMethod('bank_transfer')}
                    className="mt-0.5 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-blue-600" />
                      <span className="text-xs font-semibold text-slate-900">Chuyển khoản QR</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Quét mã QR qua app ngân hàng (Vietcombank, Techcombank).
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary Review */}
          <div className="md:col-span-5 bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between">
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
                  Sản phẩm đặt ({items.reduce((acc, i) => acc + i.quantity, 0)})
                </span>
                <span className="text-[11px] font-mono text-slate-500 font-normal">
                  {items.length} món
                </span>
              </h4>

              {/* Items scroll list */}
              <div className="max-h-48 overflow-y-auto divide-y divide-slate-200/60 pr-1 space-y-1.5">
                {items.map((item) => (
                  <div key={item.product.id} className="pt-2 first:pt-0 flex items-center gap-2.5">
                    <img
                      src={item.product.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                      alt={item.product.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 object-cover rounded-lg border border-slate-200 shrink-0 bg-white"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-900 truncate">
                        {item.product.name}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {formatCurrency(item.product.price)} × {item.quantity}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-semibold text-slate-900 font-mono">
                        {formatCurrency(item.product.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Calculation Breakdown */}
              <div className="pt-3 border-t border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Tạm tính:</span>
                  <span className="font-mono font-medium text-slate-900">{formatCurrency(subtotal)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      Giảm giá ({couponCode}):
                    </span>
                    <span className="font-mono font-medium">-{formatCurrency(discount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3 h-3" />
                    Phí giao hàng:
                  </span>
                  <span className="font-mono font-medium text-slate-900">
                    {shipping === 0 ? (
                      <span className="text-emerald-600 font-semibold">Miễn phí</span>
                    ) : (
                      formatCurrency(shipping)
                    )}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-slate-900">Tổng thanh toán:</span>
                  <span className="text-lg font-bold text-blue-600 font-mono">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 space-y-2">
              <Button
                id="btn-confirm-place-order"
                type="submit"
                variant="primary"
                size="md"
                disabled={isPending || items.length === 0}
                className="w-full justify-center text-sm font-bold shadow-sm"
              >
                {isPending ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Đang xử lý Transaction CSDL...
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Xác nhận Đặt hàng ({formatCurrency(total)})
                  </span>
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={isPending}
                className="w-full text-center py-1.5 text-xs text-slate-500 hover:text-slate-800 transition"
              >
                Quay lại giỏ hàng
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
};
