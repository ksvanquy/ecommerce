import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProduct } from '../api/useProduct.ts';
import { useCartStore } from '../../checkout/store/cartStore.ts';
import { Button } from '../../../components/ui/Button.tsx';
import { Badge } from '../../../components/ui/Badge.tsx';
import { Card } from '../../../components/ui/Card.tsx';
import {
  ArrowLeft,
  ShoppingCart,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Layers,
  Calendar,
  Package,
} from 'lucide-react';

export const ProductDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading, error, refetch } = useProduct(id || '');

  const [quantity, setQuantity] = useState(1);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const addItem = useCartStore((state) => state.addItem);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto py-6">
        <div className="h-6 w-32 bg-slate-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-6 rounded-2xl border border-slate-200">
          <div className="h-80 bg-slate-100 rounded-xl animate-pulse" />
          <div className="space-y-4">
            <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
            <div className="h-8 w-3/4 bg-slate-200 rounded animate-pulse" />
            <div className="h-6 w-28 bg-slate-200 rounded animate-pulse" />
            <div className="h-20 w-full bg-slate-100 rounded animate-pulse" />
            <div className="h-10 w-40 bg-slate-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-2xl font-bold">
          !
        </div>
        <h2 className="text-xl font-bold text-slate-900">Không tìm thấy sản phẩm</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Sản phẩm có mã ID <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">{id}</code> không tồn tại hoặc đã bị xóa.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate('/products')}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Về danh sách sản phẩm
          </Button>
          <Button variant="primary" size="sm" onClick={() => refetch()}>
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.inventory <= 0;
  const isLowStock = product.inventory > 0 && product.inventory <= 10;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(product, quantity);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center space-x-2 text-slate-500">
          <Link to="/" className="hover:text-blue-600 transition">
            Trang chủ
          </Link>
          <span>/</span>
          <Link to="/products" className="hover:text-blue-600 transition">
            Sản phẩm
          </Link>
          <span>/</span>
          <span className="text-slate-400">{product.category}</span>
          <span>/</span>
          <span className="font-medium text-slate-800 truncate max-w-[200px] sm:max-w-xs">
            {product.name}
          </span>
        </div>

        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Về danh mục sản phẩm</span>
        </Link>
      </div>

      {/* Main Detail Card */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 p-6 lg:p-8">
          {/* Left Column: Product Image Showcase */}
          <div className="md:col-span-6 flex flex-col items-center justify-center">
            <div className="w-full h-80 sm:h-96 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-6 relative overflow-hidden group">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-4xl border border-blue-100">
                  {product.name.charAt(0)}
                </div>
              )}

              <div className="absolute top-3 left-3">
                <Badge variant="info" className="text-[11px] font-semibold">
                  {product.category}
                </Badge>
              </div>

              {isOutOfStock ? (
                <div className="absolute top-3 right-3 bg-rose-600 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-xs">
                  Hết hàng
                </div>
              ) : isLowStock ? (
                <div className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-xs">
                  Còn lại {product.inventory} cái
                </div>
              ) : (
                <div className="absolute top-3 right-3 bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-xs">
                  Sẵn sàng giao ngay
                </div>
              )}
            </div>

            {/* Micro badges below image */}
            <div className="grid grid-cols-3 gap-2 w-full mt-4 text-[11px] text-slate-500">
              <div className="flex items-center gap-1.5 p-2 bg-slate-50 rounded-lg border border-slate-100">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="truncate">Chính hãng 100%</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 bg-slate-50 rounded-lg border border-slate-100">
                <Truck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">Miễn phí ship</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 bg-slate-50 rounded-lg border border-slate-100">
                <RotateCcw className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span className="truncate">Đổi trả 30 ngày</span>
              </div>
            </div>
          </div>

          {/* Right Column: Product Meta & Purchase Controls */}
          <div className="md:col-span-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-mono text-slate-400">ID: {product.id}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(product.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-snug">
                  {product.name}
                </h1>
              </div>

              {/* Price & Inventory */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-slate-500 block mb-0.5 font-medium">Giá bán niêm yết:</span>
                  <span className="text-3xl font-extrabold text-blue-600 tracking-tight">
                    ${product.price.toLocaleString()}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 block mb-0.5 font-medium">Kho hàng:</span>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded ${
                      isOutOfStock
                        ? 'bg-rose-100 text-rose-700'
                        : isLowStock
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {product.inventory} sản phẩm có sẵn
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                  Mô tả sản phẩm
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Highlights */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Đặc điểm nổi bật:</span>
                </h3>
                <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                  <li>Thiết kế tiêu chuẩn cao cấp, độ hoàn thiện tinh xảo từng chi tiết.</li>
                  <li>Phù hợp hoàn hảo cho hệ sinh thái công nghệ và làm việc hiện đại.</li>
                  <li>Tích hợp đầy đủ tiêu chuẩn an toàn và tiết kiệm năng lượng.</li>
                </ul>
              </div>
            </div>

            {/* Quantity Selector & Action Buttons */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-slate-700">Số lượng:</span>
                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-200 disabled:opacity-40 transition font-bold"
                  >
                    -
                  </button>
                  <span className="w-10 text-center text-xs font-semibold text-slate-800 font-mono">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(product.inventory, q + 1))}
                    disabled={quantity >= product.inventory || isOutOfStock}
                    className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-200 disabled:opacity-40 transition font-bold"
                  >
                    +
                  </button>
                </div>
                <span className="text-[11px] text-slate-400">
                  (Tổng: ${(product.price * quantity).toLocaleString()})
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  id="btn-detail-add-cart"
                  variant={addedSuccess ? 'primary' : 'primary'}
                  size="md"
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                  className={`flex-1 ${
                    addedSuccess ? 'bg-emerald-600 hover:bg-emerald-700' : ''
                  }`}
                >
                  {addedSuccess ? (
                    <>
                      <Check className="w-4 h-4 mr-1.5" />
                      Đã thêm vào giỏ ({quantity})
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 mr-1.5" />
                      Thêm vào giỏ hàng
                    </>
                  )}
                </Button>

                {addedSuccess && (
                  <Button
                    id="btn-detail-go-cart"
                    variant="outline"
                    size="md"
                    onClick={() => navigate('/cart')}
                    className="border-emerald-300 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 font-semibold"
                  >
                    Xem giỏ hàng &rarr;
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
