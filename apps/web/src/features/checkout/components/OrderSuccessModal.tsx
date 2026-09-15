import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Button } from '@repo/ui';
import { formatCurrency } from '../../../utils/currency.ts';
import {
  CheckCircle,
  Package,
  Calendar,
  MapPin,
  CreditCard,
  ArrowRight,
  ShoppingBag,
  Clock,
  Sparkles,
  Copy,
  Check,
} from 'lucide-react';
import type { Order } from '../types.ts';

interface OrderSuccessModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const [copied, setCopied] = React.useState(false);

  if (!order) return null;

  const handleCopyId = () => {
    navigator.clipboard?.writeText(order.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Đặt hàng Thành công!"
      size="md"
    >
      <div className="text-center space-y-4">
        {/* Animated Celebration Icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner animate-bounce">
          <CheckCircle className="w-9 h-9" />
        </div>

        <div>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            Transaction Hoàn tất & Tồn kho đã trừ
          </span>
          <h3 className="text-xl font-bold text-slate-900 mt-2">
            Cảm ơn bạn đã mua hàng!
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Đơn hàng của bạn đã được ghi nhận vào hệ thống CSDL và đang được chuẩn bị để đóng gói.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 text-left space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Mã đơn hàng
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-sm font-mono font-bold text-blue-600">
                  #{order.id}
                </span>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 transition"
                  title="Sao chép mã đơn"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Tổng thanh toán
              </span>
              <span className="text-sm font-mono font-bold text-slate-900">
                {formatCurrency(order.totalAmount)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
            <div className="flex items-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <div className="truncate">
                <span className="block font-medium text-slate-800">Người nhận:</span>
                <span className="text-[11px] text-slate-500">{order.customerName} ({order.customerPhone})</span>
              </div>
            </div>

            <div className="flex items-start gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="block font-medium text-slate-800">Thanh toán:</span>
                <span className="text-[11px] text-slate-500 uppercase font-mono">
                  {order.paymentMethod === 'cod' ? 'Tiền mặt khi nhận (COD)' : 'Chuyển khoản QR'}
                </span>
              </div>
            </div>
          </div>

          {/* Simple Timeline */}
          <div className="pt-2 border-t border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Trạng thái đơn hàng
            </span>
            <div className="flex items-center justify-between text-[11px] font-medium text-slate-600">
              <div className="flex items-center gap-1 text-blue-600 font-semibold">
                <Clock className="w-3.5 h-3.5" />
                <span>Chờ xử lý (Pending)</span>
              </div>
              <span className="text-slate-400">→</span>
              <span className="text-slate-400">Đóng gói</span>
              <span className="text-slate-400">→</span>
              <span className="text-slate-400">Giao hàng</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row gap-2">
          <Button
            id="btn-view-order-history"
            variant="primary"
            size="md"
            className="flex-1 justify-center text-xs font-semibold"
            onClick={() => {
              onClose();
              navigate('/orders');
            }}
          >
            <Package className="w-3.5 h-3.5 mr-1.5" />
            <span>Xem lịch sử đơn hàng</span>
          </Button>

          <Button
            variant="outline"
            size="md"
            className="flex-1 justify-center text-xs font-semibold"
            onClick={() => {
              onClose();
              navigate('/products');
            }}
          >
            <ShoppingBag className="w-3.5 h-3.5 mr-1.5" />
            <span>Tiếp tục mua hàng</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
};
