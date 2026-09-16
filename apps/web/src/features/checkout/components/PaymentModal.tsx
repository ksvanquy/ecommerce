import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, toast } from '@repo/ui';
import { formatCurrency } from '../../../utils/currency.ts';
import { paymentsApi, type PaymentIntentResponse } from '../api/paymentsApi.ts';
import {
  QrCode,
  CheckCircle2,
  Copy,
  Check,
  Building,
  AlertCircle,
  Loader2,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  X,
} from 'lucide-react';
import type { Order } from '../types.ts';

interface PaymentModalProps {
  order: Order;
  provider: 'vietqr' | 'vnpay' | 'momo' | 'bank_transfer';
  onPaymentSuccess: () => void;
  onClose: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  order,
  provider,
  onPaymentSuccess,
  onClose,
}) => {
  const [paymentData, setPaymentData] = useState<PaymentIntentResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [isReported, setIsReported] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Initialize payment intent
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setErrorMessage(null);

    paymentsApi
      .createIntent({
        orderId: order.id,
        provider: provider === 'bank_transfer' ? 'vietqr' : provider,
      })
      .then((data) => {
        if (isMounted) {
          setPaymentData(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setIsLoading(false);
          setErrorMessage(
            err?.response?.data?.message || 'Không thể khởi tạo phiên thanh toán trực tuyến.'
          );
        }
      });

    return () => {
      isMounted = false;
    };
  }, [order.id, provider]);

  const handleCopy = (text: string, fieldName: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`Đã sao chép ${label}`, {
      description: text,
      duration: 1500,
    });
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleManualConfirm = async () => {
    if (!paymentData?.transaction?.transactionCode) return;
    setIsConfirming(true);
    try {
      await paymentsApi.confirmPayment(paymentData.transaction.transactionCode, undefined, true);
      setIsReported(true);
      toast.success('Gửi yêu cầu xác nhận thành công!', {
        description: 'Thông tin thanh toán đã được gửi tới Ban quản trị để kiểm tra thủ công.',
      });
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Không thể xác nhận giao dịch lúc này. Vui lòng kiểm tra lại.';
      setErrorMessage(msg);
      toast.error('Chưa thể gửi yêu cầu', {
        description: msg,
      });
    } finally {
      setIsConfirming(false);
    }
  };

  const handleSimulateAutoSuccess = async () => {
    if (!paymentData?.transaction?.transactionCode) return;
    setIsConfirming(true);
    try {
      await paymentsApi.confirmPayment(
        paymentData.transaction.transactionCode,
        `SIM-GW-${Date.now()}`,
        false
      );
      setIsPaid(true);
      toast.success('Mô phỏng Webhook thanh toán thành công!', {
        description: 'Cổng thanh toán đã tự động duyệt đơn hàng của bạn sang Đang xử lý.',
      });
      if (onPaymentSuccess) {
        onPaymentSuccess();
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Không thể mô phỏng giao dịch lúc này.';
      setErrorMessage(msg);
      toast.error('Mô phỏng thất bại', {
        description: msg,
      });
    } finally {
      setIsConfirming(false);
    }
  };

  const transferInfo = paymentData?.transferInfo;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 leading-tight">
                Thanh toán trực tuyến đơn hàng
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                Mã đơn: #{order.id.slice(0, 8)} • {formatCurrency(order.totalAmount)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {isLoading ? (
            <div className="py-12 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
              <p className="text-xs text-slate-600 font-medium">
                Đang khởi tạo mã thanh toán VietQR an toàn...
              </p>
            </div>
          ) : isPaid ? (
            <div className="py-10 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-base text-slate-900">
                Thanh toán thành công!
              </h4>
              <p className="text-xs text-slate-500">
                Hệ thống đã ghi nhận thanh toán cho đơn hàng #{order.id.slice(0, 8)}. Đang chuyển hướng...
              </p>
            </div>
          ) : isReported ? (
            <div className="py-10 text-center space-y-4 max-w-sm mx-auto">
              <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-base text-slate-900">
                Gửi yêu cầu xác nhận thành công!
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Thông tin chuyển khoản của bạn đã được chuyển tới Ban quản trị. Đơn hàng của bạn đang ở trạng thái <strong className="text-amber-600">Chờ duyệt thanh toán</strong>.
              </p>
              <p className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
                Admin sẽ đối soát giao dịch thực tế trên tài khoản ngân hàng và kích hoạt đơn hàng trong vòng ít phút. Bạn có thể kiểm tra trạng thái trong mục <strong>Lịch sử đơn hàng</strong>.
              </p>
            </div>
          ) : errorMessage ? (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>Có lỗi xảy ra:</span>
              </div>
              <p>{errorMessage}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setErrorMessage(null)}
                className="mt-2 text-xs"
              >
                Thử lại
              </Button>
            </div>
          ) : (
            <>
              {/* QR Code section */}
              {paymentData?.qrCodeUrl && (
                <div className="text-center space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <p className="text-xs font-semibold text-slate-700">
                    Mở ứng dụng Ngân hàng (App Banking) hoặc MoMo để quét mã:
                  </p>
                  <div className="bg-white p-3 rounded-xl inline-block shadow-xs border border-slate-200 mx-auto">
                    <img
                      src={paymentData.qrCodeUrl}
                      alt="VietQR Code"
                      className="w-52 h-52 object-contain mx-auto rounded-lg"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Cú pháp tự động điền sẵn &amp; xác thực tự động</span>
                  </p>
                </div>
              )}

              {/* Transfer Details Card */}
              {transferInfo && (
                <div className="space-y-2 text-xs">
                  <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-blue-600" />
                    <span>Hoặc chuyển khoản thủ công theo thông tin:</span>
                  </h4>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                    <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Ngân hàng:</span>
                      <span className="font-bold text-slate-900">{transferInfo.bankName}</span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Số tài khoản:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-blue-600 text-sm">
                          {transferInfo.accountNo}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(transferInfo.accountNo, 'acc', 'số tài khoản')}
                          className="p-1 hover:bg-slate-200 rounded text-slate-500 cursor-pointer"
                          title="Sao chép số tài khoản"
                        >
                          {copiedField === 'acc' ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Chủ tài khoản:</span>
                      <span className="font-semibold text-slate-800">{transferInfo.accountName}</span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Số tiền:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          {formatCurrency(transferInfo.amount)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(transferInfo.amount.toString(), 'amount', 'số tiền')}
                          className="p-1 hover:bg-slate-200 rounded text-slate-500 cursor-pointer"
                          title="Sao chép số tiền"
                        >
                          {copiedField === 'amount' ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-500">Nội dung chuyển:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          {transferInfo.transferContent}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(transferInfo.transferContent, 'content', 'nội dung chuyển khoản')}
                          className="p-1 hover:bg-slate-200 rounded text-slate-500 cursor-pointer"
                          title="Sao chép nội dung chuyển khoản"
                        >
                          {copiedField === 'content' ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Sandbox Developer Testing Tools */}
              <div className="p-3.5 bg-amber-50/50 border border-amber-200/60 rounded-xl space-y-2 mt-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  <span>Môi trường thử nghiệm Sandbox</span>
                </div>
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  Để bạn dễ dàng kiểm thử 2 luồng xử lý nghiệp vụ của TechStore, hãy nhấn chọn:
                </p>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    disabled={isConfirming}
                    onClick={handleManualConfirm}
                    className="border-amber-300 text-amber-900 bg-white hover:bg-amber-100 text-[11px] font-semibold flex items-center justify-center py-1.5 cursor-pointer"
                  >
                    1. Báo cáo thủ công (Cần duyệt)
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="xs"
                    disabled={isConfirming}
                    onClick={handleSimulateAutoSuccess}
                    className="bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-semibold flex items-center justify-center py-1.5 cursor-pointer border-none"
                  >
                    2. Webhook tự động (Duyệt ngay)
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row gap-2">
          {!isPaid && !isReported && (
            <Button
              variant="primary"
              size="md"
              disabled={isLoading || isConfirming}
              onClick={handleManualConfirm}
              className="flex-1 justify-center text-xs font-bold"
            >
              {isConfirming ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  <span>Đang gửi yêu cầu...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                  <span>Tôi đã chuyển khoản thành công</span>
                </>
              )}
            </Button>
          )}

          <Button
            variant="outline"
            size="md"
            onClick={onClose}
            className="text-xs justify-center flex-1"
          >
            {isPaid || isReported ? 'Đóng cửa sổ' : 'Thanh toán sau / Đóng'}
          </Button>
        </div>
      </div>
    </div>
  );
};
