import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore.ts';
import { useCreateOrder } from '../api/useCreateOrder.ts';
import { useAuthStore } from '../../auth/store/authStore.ts';
import { Card, Button, Badge, toast } from '@repo/ui';
import { formatCurrency } from '../../../utils/currency.ts';
import { createOrderSchema } from '@repo/shared-types';
import { PaymentModal } from './PaymentModal.tsx';
import { couponsApi } from '../api/couponsApi.ts';
import type { Coupon } from '@repo/shared-types';
import { AddressManager } from './AddressManager.tsx';
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
  QrCode,
  Smartphone,
  TicketPercent,
  Loader2,
} from 'lucide-react';
import type { Order, PaymentMethod } from '../types.ts';

interface CheckoutViewProps {
  onBackToCart?: () => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({ onBackToCart }) => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const allItems = useCartStore((state) => state.items);
  // Target items that are selected, or all if none specifically selected
  const selectedItems = allItems.filter((i) => i.isSelected);
  const checkoutItems = selectedItems.length > 0 ? selectedItems : allItems;

  const couponCode = useCartStore((state) => state.couponCode);
  const subtotal = useCartStore((state) => state.subtotalPrice)();
  const discount = useCartStore((state) => state.discountAmount)();
  const shipping = useCartStore((state) => state.shippingFee)();
  const total = useCartStore((state) => state.totalPrice)();
  const clearCart = useCartStore((state) => state.clearCart);
  const applyCoupon = useCartStore((state) => state.applyCoupon);
  const removeCoupon = useCartStore((state) => state.removeCoupon);

  const { mutate: createOrder, isPending, error } = useCreateOrder();

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Coupon state
  const [inputCoupon, setInputCoupon] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  const [couponFeedback, setCouponFeedback] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  // Payment Modal & Success states
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  // Pre-fill user information and default address if logged in
  useEffect(() => {
    if (user) {
      if (!customerName) setCustomerName(user.fullName || '');

      import('../api/addressesApi.ts').then(({ addressesApi }) => {
        addressesApi.getDefaultAddress()
          .then((addr) => {
            if (addr) {
              setCustomerName(addr.receiverName);
              setCustomerPhone(addr.receiverPhone);
              setShippingAddress(`${addr.streetAddress}, ${addr.ward}, ${addr.district}, ${addr.province}`);
              setSelectedAddressId(addr.id);
            }
          })
          .catch((err) => console.warn('Failed to load default address:', err));
      });
    }
  }, [user]);

  // Load available coupons
  useEffect(() => {
    couponsApi
      .getAvailableCoupons()
      .then((data) => setAvailableCoupons(data))
      .catch((err) => console.warn('Failed to load coupons:', err));
  }, []);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCoupon.trim()) return;

    setIsApplyingCoupon(true);
    setCouponFeedback({ type: null, message: '' });
    const result = await applyCoupon(inputCoupon);
    setIsApplyingCoupon(false);

    if (result.success) {
      setCouponFeedback({ type: 'success', message: result.message });
      toast.success('Áp dụng mã giảm giá thành công!', {
        description: result.message,
      });
      setInputCoupon('');
    } else {
      setCouponFeedback({ type: 'error', message: result.message });
      toast.error('Không thể áp dụng mã giảm giá', {
        description: result.message,
      });
    }
  };

  const handleQuickApply = async (code: string) => {
    setIsApplyingCoupon(true);
    setCouponFeedback({ type: null, message: '' });
    const result = await applyCoupon(code);
    setIsApplyingCoupon(false);

    if (result.success) {
      setCouponFeedback({ type: 'success', message: result.message });
      toast.success('Áp dụng mã giảm giá thành công!', {
        description: result.message,
      });
    } else {
      setCouponFeedback({ type: 'error', message: result.message });
      toast.error('Không thể áp dụng mã giảm giá', {
        description: result.message,
      });
    }
  };

  const handleCopyId = () => {
    if (!createdOrder) return;
    navigator.clipboard.writeText(createdOrder.id);
    setCopied(true);
    toast.success('Đã sao chép mã đơn hàng', {
      description: createdOrder.id,
      duration: 1500,
    });
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
      items: checkoutItems.map((i) => ({
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
        toast.success(`Đặt hàng thành công! Mã đơn: #${newOrder.id}`, {
          description: 'Đơn hàng của bạn đã được ghi nhận vào hệ thống.',
        });
        // If chosen method is an online payment, trigger the Payment Modal
        if (['vietqr', 'vnpay', 'momo', 'bank_transfer'].includes(paymentMethod)) {
          setShowPaymentModal(true);
        }
      },
      onError: (err: any) => {
        const errorMsg =
          err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.';
        setValidationError(errorMsg);
        toast.error('Đặt hàng không thành công', {
          description: errorMsg,
        });
      },
    });
  };

  // 1. Success State View
  if (createdOrder) {
    return (
      <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 space-y-6">
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
            <h2 className="text-xl font-bold text-slate-900">
              Đặt hàng thành công!
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Cảm ơn bạn đã tin tưởng mua sắm tại TechStore. Đơn hàng của bạn đã được ghi nhận vào hệ thống và đang được xử lý.
            </p>
          </div>

          <div className="p-6 space-y-6">
            {/* Order meta badge box */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-slate-500">Mã đơn hàng:</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono font-bold text-sm text-slate-900">
                    {createdOrder.id}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={handleCopyId}
                    className="h-6 px-1.5 text-[11px] text-blue-600 hover:bg-blue-50"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span className="ml-1">{copied ? 'Đã chép' : 'Sao chép'}</span>
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge variant={createdOrder.paymentStatus === 'paid' ? 'success' : 'warning'}>
                  {createdOrder.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chờ thanh toán'}
                </Badge>
                <Badge variant="info">
                  {createdOrder.status === 'pending' ? 'Chờ xác nhận' : createdOrder.status}
                </Badge>
              </div>
            </div>

            {/* Recipient Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  Thông tin người nhận
                </h4>
                <p className="text-slate-600">
                  <strong>Họ tên:</strong> {createdOrder.customerName}
                </p>
                <p className="text-slate-600">
                  <strong>Số điện thoại:</strong> {createdOrder.customerPhone}
                </p>
                <p className="text-slate-600">
                  <strong>Địa chỉ giao:</strong> {createdOrder.shippingAddress}
                </p>
                {createdOrder.customerNote && (
                  <p className="text-slate-600">
                    <strong>Ghi chú:</strong> {createdOrder.customerNote}
                  </p>
                )}
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                  Thanh toán &amp; Vận chuyển
                </h4>
                <p className="text-slate-600">
                  <strong>Phương thức:</strong>{' '}
                  {createdOrder.paymentMethod === 'cod'
                    ? 'Thanh toán tiền mặt khi nhận hàng (COD)'
                    : createdOrder.paymentMethod === 'vietqr'
                    ? 'Chuyển khoản VietQR 24/7'
                    : createdOrder.paymentMethod === 'vnpay'
                    ? 'Cổng VNPay'
                    : createdOrder.paymentMethod === 'momo'
                    ? 'Ví điện tử MoMo'
                    : 'Chuyển khoản Ngân hàng'}
                </p>
                <p className="text-slate-600">
                  <strong>Tổng thanh toán:</strong>{' '}
                  <span className="font-mono font-bold text-blue-600 text-sm">
                    {formatCurrency(createdOrder.totalAmount)}
                  </span>
                </p>

                {createdOrder.paymentMethod !== 'cod' && createdOrder.paymentStatus !== 'paid' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setShowPaymentModal(true)}
                    className="w-full mt-2 text-xs font-bold justify-center"
                  >
                    <QrCode className="w-3.5 h-3.5 mr-1.5" />
                    Mở lại mã QR thanh toán
                  </Button>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <Button
                variant="primary"
                onClick={() => navigate('/orders')}
                className="flex-1 justify-center text-xs font-bold"
              >
                Xem lịch sử đơn hàng của bạn
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/products')}
                className="flex-1 justify-center text-xs font-semibold"
              >
                Tiếp tục mua sắm
              </Button>
            </div>
          </div>
        </Card>

        {/* Payment Modal if open */}
        {showPaymentModal && (
          <PaymentModal
            order={createdOrder}
            provider={
              (createdOrder.paymentMethod as any) === 'cod'
                ? 'vietqr'
                : (createdOrder.paymentMethod as any)
            }
            onPaymentSuccess={() => {
              setCreatedOrder({
                ...createdOrder,
                paymentStatus: 'paid',
                status: 'processing',
              });
              setShowPaymentModal(false);
            }}
            onClose={() => setShowPaymentModal(false)}
          />
        )}
      </div>
    );
  }

  // 2. Empty Cart Check
  if (checkoutItems.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Chưa có sản phẩm nào được chọn</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Vui lòng vào giỏ hàng và chọn ít nhất một sản phẩm để tiến hành Đặt hàng.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button variant="outline" onClick={handleBack} className="font-semibold text-xs">
            Xem giỏ hàng
          </Button>
          <Button variant="primary" onClick={() => navigate('/products')} className="font-semibold text-xs">
            Khám phá sản phẩm
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
            className="inline-flex items-center gap-1.5 p-0 hover:bg-transparent text-xs text-slate-500 hover:text-slate-800 font-semibold mb-2 cursor-pointer"
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
            {user && (
              <Card className="p-4 sm:p-6 space-y-4">
                <AddressManager
                  isSelectionMode={true}
                  selectedAddressId={selectedAddressId || undefined}
                  onSelectAddress={(addr) => {
                    setCustomerName(addr.receiverName);
                    setCustomerPhone(addr.receiverPhone);
                    setShippingAddress(`${addr.streetAddress}, ${addr.ward}, ${addr.district}, ${addr.province}`);
                    setSelectedAddressId(addr.id);
                  }}
                />
              </Card>
            )}

            <Card className="p-4 sm:p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  Thông tin khách nhận hàng
                </h3>
                {user && (
                  <Badge variant="info">
                    Tài khoản: {user.email}
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
                {/* VietQR */}
                <label
                  className={`border rounded-xl p-3.5 flex items-start gap-3 cursor-pointer transition-all ${
                    paymentMethod === 'vietqr'
                      ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/30'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="vietqr"
                    checked={paymentMethod === 'vietqr'}
                    onChange={() => setPaymentMethod('vietqr')}
                    className="mt-0.5 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <QrCode className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-bold text-slate-900">Chuyển khoản VietQR (Khuyên dùng)</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      Quét mã QR qua mọi App Ngân hàng (MBBank, VCB, Techcombank, VPBank...) tự động xác nhận 24/7.
                    </p>
                  </div>
                </label>

                {/* COD */}
                <label
                  className={`border rounded-xl p-3.5 flex items-start gap-3 cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/30'
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
                      <span className="text-xs font-bold text-slate-900">COD (Tiền mặt khi nhận hàng)</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      Bạn thanh toán bằng tiền mặt trực tiếp cho nhân viên vận chuyển khi nhận hàng tại nhà.
                    </p>
                  </div>
                </label>

                {/* VNPay */}
                <label
                  className={`border rounded-xl p-3.5 flex items-start gap-3 cursor-pointer transition-all ${
                    paymentMethod === 'vnpay'
                      ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/30'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="vnpay"
                    checked={paymentMethod === 'vnpay'}
                    onChange={() => setPaymentMethod('vnpay')}
                    className="mt-0.5 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Building className="w-4 h-4 text-indigo-600" />
                      <span className="text-xs font-bold text-slate-900">Cổng thanh toán VNPay</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      Thanh toán qua thẻ ATM nội địa hoặc thẻ Quốc tế (Visa / MasterCard / JCB).
                    </p>
                  </div>
                </label>

                {/* MoMo */}
                <label
                  className={`border rounded-xl p-3.5 flex items-start gap-3 cursor-pointer transition-all ${
                    paymentMethod === 'momo'
                      ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/30'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="momo"
                    checked={paymentMethod === 'momo'}
                    onChange={() => setPaymentMethod('momo')}
                    className="mt-0.5 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-pink-600" />
                      <span className="text-xs font-bold text-slate-900">Ví điện tử MoMo</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      Quét mã QR thanh toán nhanh qua ứng dụng MoMo trên điện thoại.
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
                  Sản phẩm thanh toán ({checkoutItems.reduce((acc, i) => acc + i.quantity, 0)})
                </span>
                <span className="text-[11px] font-mono text-slate-500 font-normal">
                  {checkoutItems.length} mục
                </span>
              </h3>

              {/* Items scroll list */}
              <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 pr-1 space-y-2">
                {checkoutItems.map((item) => (
                  <div key={item.id} className="pt-2.5 first:pt-0 flex items-center gap-3">
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

              {/* Coupon Section on Checkout */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-blue-600" />
                    <span>Mã ưu đãi / Voucher:</span>
                  </span>
                  {couponCode && (
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-[11px] text-rose-500 hover:text-rose-700 underline font-medium cursor-pointer"
                    >
                      Bỏ mã
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    id="input-checkout-coupon"
                    value={inputCoupon}
                    onChange={(e) => setInputCoupon(e.target.value)}
                    placeholder="Nhập mã ưu đãi..."
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 uppercase font-mono"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isApplyingCoupon || !inputCoupon.trim()}
                    onClick={handleApplyCoupon}
                    className="text-xs font-medium"
                  >
                    {isApplyingCoupon ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Áp dụng'}
                  </Button>
                </div>

                {couponFeedback.message && (
                  <p
                    className={`text-[11px] ${
                      couponFeedback.type === 'success' ? 'text-emerald-600 font-medium' : 'text-rose-600'
                    }`}
                  >
                    {couponFeedback.message}
                  </p>
                )}

                {/* Voucher Pills */}
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {(availableCoupons.length > 0
                    ? availableCoupons
                    : [
                        { code: 'TECHSTORE10' },
                        { code: 'GIAM50K' },
                        { code: 'FREESHIP' },
                        { code: 'VIPTECH20' },
                      ]
                  ).map((c) => {
                    const code = typeof c === 'string' ? c : c.code;
                    const isApplied = couponCode === code;
                    return (
                      <button
                        key={code}
                        type="button"
                        onClick={() => handleQuickApply(code)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium border transition cursor-pointer flex items-center gap-1 ${
                          isApplied
                            ? 'bg-emerald-50 border-emerald-400 text-emerald-700'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-blue-400'
                        }`}
                      >
                        <span>{code}</span>
                        {isApplied && <Check className="w-2.5 h-2.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Tạm tính giá trị hàng:</span>
                  <span className="font-mono font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" />
                      Giảm giá voucher ({couponCode}):
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
                  <span className="text-sm font-extrabold text-slate-900">Tổng thanh toán:</span>
                  <span className="text-xl font-black text-blue-600 font-mono">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>

              {/* Security info */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex gap-2 items-start text-[10px] text-slate-500 leading-relaxed">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>TechStore mã hóa SSL giao dịch và thực hiện trừ kho tự động để bảo đảm quyền lợi khách hàng.</span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2.5">
                <Button
                  id="btn-confirm-place-order"
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isPending || checkoutItems.length === 0}
                  className="w-full justify-center text-sm font-extrabold py-3 active:scale-[0.98] transition-transform"
                >
                  {isPending ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Đang khởi tạo đơn hàng...
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
