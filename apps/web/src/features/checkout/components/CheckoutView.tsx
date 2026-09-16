import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore.ts';
import { useCreateOrder } from '../api/useCreateOrder.ts';
import { useAuthStore } from '../../auth/store/authStore.ts';
import { Card, Button, Badge } from '@repo/ui';
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
  ArrowLeft,
  Check,
  Copy,
  Calendar,
  Sparkles,
} from 'lucide-react';
import type { Order, PaymentMethod } from '../types.ts';

interface CheckoutViewProps {
  onBackToCart?: () => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({ onBackToCart }) => {
  const navigate = useNavigate();
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

  // Success state
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [copied, setCopied] = useState(false);

  // Pre-fill user information if logged in
  useEffect(() => {
    if (user) {
      if (!customerName) setCustomerName(user.fullName || '');
    }
  }, [user]);

  const handleCopyId = () => {
    if (!createdOrder) return;
    navigator.clipboard.writeText(createdOrder.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBack = () => {
    if (onBackToCart) {
      onBackToCart();
    } else {
      navigate('/cart');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const payload = {
      items: items.map((i) => ({
        productId: i.product.id,
        quantity: i.quantity,
        variantId: i.variantId || undefined,
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
        setCreatedOrder(newOrder);
      },
      onError: (err: any) => {
        const errorMsg =
          err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.';
        setValidationError(errorMsg);
      },
    });
  };

  // 1. Success State View
  if (createdOrder) {
    return (
      <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6">
        {/* Stepper */}
        <div className="flex items-center justify-center mb-8 text-xs font-semibold text-slate-400">
          <span className="text-slate-500">1. Giỏ hàng</span>
          <span className="mx-2">/</span>
          <span className="text-slate-500">2. Xác nhận đặt hàng</span>
          <span className="mx-2">/</span>
          <span className="text-emerald-600 flex items-center gap-1 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            3. Hoàn tất đặt hàng
          </span>
        </div>

        <Card className="border-t-4 border-t-emerald-500 border border-slate-200">
          <div className="text-center py-6 border-b border-slate-100">
            <div className="mx-auto w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Đặt Hàng Thành Công!</h1>
            <p className="text-xs text-slate-500 mt-1">
              Cảm ơn bạn đã mua sắm tại TechStore. Hệ thống đã khóa kho và ghi nhận đơn hàng của bạn.
            </p>
          </div>

          <div className="p-4 sm:p-6 space-y-6">
            {/* Order Identity Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Mã số đơn hàng</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-base font-mono font-bold text-blue-600">
                    #{createdOrder.id}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleCopyId}
                    className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 transition min-w-0 min-h-0"
                    title="Sao chép mã đơn"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="success">Đã xác nhận (Pending)</Badge>
                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Vừa xong</span>
                </div>
              </div>
            </div>

            {/* Delivery details and summaries */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 pb-1.5 border-b border-slate-100">
                  Thông tin bàn giao
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-800">{createdOrder.customerName}</p>
                      <p className="text-slate-500">Người nhận hàng</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-800">{createdOrder.customerPhone}</p>
                      <p className="text-slate-500">Số điện thoại</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-800">{createdOrder.shippingAddress}</p>
                      <p className="text-slate-500">Địa chỉ giao nhận</p>
                    </div>
                  </div>

                  {createdOrder.customerNote && (
                    <div className="flex items-start gap-2 pt-1 border-t border-slate-100/50">
                      <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-slate-700 italic">"{createdOrder.customerNote}"</p>
                        <p className="text-[10px] text-slate-400">Ghi chú vận chuyển</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 pb-1.5 border-b border-slate-100">
                  Giao dịch &amp; Thanh toán
                </h4>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Phương thức:</span>
                    <span className="font-semibold text-slate-800">
                      {createdOrder.paymentMethod === 'cod' ? 'COD (Tiền mặt khi nhận)' : 'Chuyển khoản Ngân hàng QR'}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Trạng thái thanh toán:</span>
                    <Badge variant="warning">Chờ thanh toán (Unpaid)</Badge>
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Cộng tiền hàng:</span>
                      <span className="font-mono">{formatCurrency(createdOrder.subtotal)}</span>
                    </div>
                    {createdOrder.discountAmount > 0 && (
                      <div className="flex justify-between text-[11px] text-emerald-600">
                        <span>Khuyến mại ({createdOrder.couponCode}):</span>
                        <span className="font-mono">-{formatCurrency(createdOrder.discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Phí giao nhận:</span>
                      <span className="font-mono">
                        {createdOrder.shippingFee === 0 ? 'Miễn phí' : formatCurrency(createdOrder.shippingFee)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-slate-900 pt-1.5">
                      <span>Tổng phải trả:</span>
                      <span className="font-mono text-blue-600">{formatCurrency(createdOrder.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Note about next step */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex gap-2.5 items-start text-xs text-blue-800">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Bao giờ bạn nhận được hàng?</p>
                <p className="mt-0.5 text-blue-800/80">
                  Nhân viên TechStore sẽ liên hệ xác nhận cuộc gọi qua SĐT <strong className="text-blue-950">{createdOrder.customerPhone}</strong> trong vòng 15-30 phút. Đơn hàng dự kiến được giao trong vòng 1-3 ngày làm việc.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <Button
                variant="primary"
                onClick={() => navigate('/products')}
                className="flex-1 justify-center py-2.5 font-bold"
              >
                Tiếp tục Mua sắm
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/orders')}
                className="flex-1 justify-center py-2.5 font-semibold text-slate-700"
              >
                Xem Lịch sử Đơn hàng
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // 2. Empty State View
  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Giỏ hàng của bạn đang trống</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Bạn cần có ít nhất một sản phẩm trong giỏ hàng để thực hiện quy trình Xác nhận &amp; Thanh toán đơn hàng.
        </p>
        <div className="mt-6">
          <Button variant="primary" onClick={() => navigate('/products')} className="font-semibold">
            Quay lại Cửa hàng
          </Button>
        </div>
      </div>
    );
  }

  // 3. Normal Form View
  return (
    <div className="space-y-6 w-full py-2">
      {/* Back Link and Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Button
            type="button"
            variant="ghost"
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 p-0 hover:bg-transparent text-xs text-slate-500 hover:text-slate-800 font-semibold mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại Giỏ hàng của bạn</span>
          </Button>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Xác nhận &amp; Hoàn tất Đặt hàng
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Vui lòng rà soát lại thông tin nhận hàng và sản phẩm trước khi xác nhận đặt hàng.
          </p>
        </div>

        {/* Breadcrumb / Stepper */}
        <div className="flex items-center text-xs font-semibold text-slate-400 bg-white border border-slate-200 px-3.5 py-2 rounded-xl">
          <span className="text-slate-500 cursor-pointer hover:underline" onClick={handleBack}>
            1. Giỏ hàng
          </span>
          <span className="mx-2 text-slate-300">/</span>
          <span className="text-blue-600 flex items-center gap-1 font-bold">
            <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px]">2</span>
            2. Xác nhận đặt hàng
          </span>
          <span className="mx-2 text-slate-300">/</span>
          <span className="text-slate-400">3. Hoàn tất</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="text-xs">
            <p className="font-bold text-blue-950">
              Thanh toán An toàn &amp; Bảo mật Đơn hàng
            </p>
            <p className="text-blue-800/80 mt-1 leading-relaxed">
              Thông tin giao dịch của bạn được mã hóa và bảo mật tuyệt đối. Tất cả giá trị đơn hàng và mã ưu đãi sẽ được hệ thống kiểm tra chính xác trước khi khởi tạo đơn hàng.
            </p>
          </div>
        </div>

        {/* Validation or API Error Alert */}
        {(validationError || error) && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-xs text-rose-800">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Không thể khởi tạo đơn hàng:</p>
              <p className="mt-1">
                {validationError || (error as any)?.response?.data?.message || (error as any)?.message}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form Info */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="p-4 sm:p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  Thông tin khách nhận hàng
                </h3>
                {user && (
                  <Badge variant="info">
                    Tài khoản khách: {user.email}
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Họ và tên người nhận <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Ví dụ: Nguyễn Văn An"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Số điện thoại liên hệ <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Ví dụ: 0901234567"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Địa chỉ nhận hàng chi tiết <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Số nhà, tên ngõ/đường, phường/xã, quận/huyện, tỉnh/TP"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Ghi chú đơn hàng (Tùy chọn)
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <textarea
                    rows={3}
                    value={customerNote}
                    onChange={(e) => setCustomerNote(e.target.value)}
                    placeholder="Chỉ dẫn giao nhận cụ thể (Ví dụ: Giao giờ hành chính, gọi trước khi đến 15 phút, gửi bảo vệ nếu không nghe máy...)"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition resize-none placeholder:text-slate-400"
                  />
                </div>
              </div>
            </Card>

            <Card className="p-4 sm:p-6 space-y-4">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 pb-3 border-b border-slate-100 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-600" />
                Phương thức thanh toán
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  className={`border rounded-xl p-4 flex items-start gap-3 cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-600'
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
                      <Banknote className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-slate-900">COD (Tiền mặt khi nhận)</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      Bạn thanh toán bằng tiền mặt trực tiếp cho nhân viên vận chuyển khi nhận hàng tại nhà.
                    </p>
                  </div>
                </label>

                <label
                  className={`border rounded-xl p-4 flex items-start gap-3 cursor-pointer transition-all ${
                    paymentMethod === 'bank_transfer'
                      ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-600'
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
                      <Building className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-bold text-slate-900">Chuyển khoản QR</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      Hệ thống tự động tạo mã QR giao dịch. Bạn dùng ứng dụng Ngân hàng (Mobile Banking) quét mã để chuyển khoản.
                    </p>
                  </div>
                </label>
              </div>
            </Card>
          </div>

          {/* Right Column: Order Summaries Card */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
            <Card className="p-4 sm:p-5 bg-white space-y-4 border border-slate-200">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-blue-600" />
                  Danh mục đặt ({items.reduce((acc, i) => acc + i.quantity, 0)} sản phẩm)
                </span>
                <span className="text-[11px] font-mono text-slate-500 font-normal">
                  {items.length} mặt hàng
                </span>
              </h3>

              {/* Items scroll list */}
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 pr-1 space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="pt-3 first:pt-0 flex items-center gap-3">
                    <img
                      src={item.product.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                      alt={item.product.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 object-cover rounded-lg border border-slate-200 shrink-0 bg-slate-50"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate">
                        {item.product.name}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {formatCurrency(item.product.price)} × {item.quantity}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-slate-900 font-mono">
                        {formatCurrency(item.product.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing Breakdown */}
              <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Tạm tính giá trị hàng:</span>
                  <span className="font-mono font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 animate-pulse" />
                      Giảm giá coupon ({couponCode}):
                    </span>
                    <span className="font-mono font-bold">-{formatCurrency(discount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-slate-400" />
                    Cước phí vận chuyển:
                  </span>
                  <span className="font-mono font-semibold text-slate-900">
                    {shipping === 0 ? (
                      <span className="text-emerald-600 font-bold">Miễn phí</span>
                    ) : (
                      formatCurrency(shipping)
                    )}
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                  <span className="text-sm font-extrabold text-slate-900">Thanh toán cuối cùng:</span>
                  <span className="text-xl font-black text-blue-600 font-mono">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>

              {/* Security info */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex gap-2 items-start text-[10px] text-slate-500 leading-relaxed">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>Bạn hoàn toàn yên tâm. TechStore mã hóa bảo mật SSL mọi thông tin và thực hiện trừ kho tự động để ngăn lỗi quá tải đơn hàng.</span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2.5">
                <Button
                  id="btn-confirm-place-order"
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isPending || items.length === 0}
                  className="w-full justify-center text-sm font-extrabold py-3 active:scale-[0.98] transition-transform"
                >
                  {isPending ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Đang thực thi Transaction kho...
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5">
                      <CheckCircle2 className="w-4.5 h-4.5" />
                      Xác nhận Đặt hàng ({formatCurrency(total)})
                    </span>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={isPending}
                  className="w-full justify-center text-xs text-slate-600 hover:text-slate-900 font-bold py-2 border-slate-200"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                  Quay lại Sửa Giỏ hàng
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};
