import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProduct } from '../api/useProduct.ts';
import { useCartStore } from '../../checkout/store/cartStore.ts';
import { Button, Badge, Card } from '@repo/ui';
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
import { formatCurrency } from '../../../utils/currency.ts';

export const ProductDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading, error, refetch } = useProduct(id || '');

  const [quantity, setQuantity] = useState(1);
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Variant & Gallery Image selection state
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const addItem = useCartStore((state) => state.addItem);

  // Derive current active variant or fallback to base product
  const activeVariant = React.useMemo(() => {
    if (!product?.variants || product.variants.length === 0) return null;
    if (selectedVariantId) {
      return product.variants.find((v) => v.id === selectedVariantId) || product.variants[0];
    }
    return product.variants.find((v) => v.isDefault) || product.variants[0];
  }, [product, selectedVariantId]);

  // Derive display price, image, inventory, and SKU
  const currentPrice = activeVariant ? activeVariant.price : (product?.price ?? 0);
  const currentInventory = activeVariant ? activeVariant.inventory : (product?.inventory ?? 0);
  const currentImageUrl = activeImage || activeVariant?.imageUrl || product?.imageUrl;

  const isOutOfStock = currentInventory <= 0;
  const isLowStock = currentInventory > 0 && currentInventory <= 10;

  // Auto-set initial active image when product loads
  React.useEffect(() => {
    if (product) {
      const thumbnailObj = product.images?.find((img) => img.isThumbnail);
      setActiveImage(thumbnailObj?.imageUrl || product.imageUrl || null);
    }
  }, [product]);

  if (isLoading) {
    return (
      <div className="space-y-6 w-full py-6">
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

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    // Pass product with variant info override for cart
    const itemToAdd = {
      ...product,
      price: currentPrice,
      inventory: currentInventory,
      imageUrl: currentImageUrl || product.imageUrl,
      name: activeVariant ? `${product.name} (${activeVariant.name})` : product.name,
    };
    addItem(itemToAdd, quantity, activeVariant?.id);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2500);
  };

  const galleryImages = product.images && product.images.length > 0
    ? product.images
    : product.imageUrl
    ? [{ id: 'default', productId: product.id, imageUrl: product.imageUrl, isThumbnail: true, sortOrder: 0 }]
    : [];

  return (
    <div className="space-y-6 w-full py-2">
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
          {/* Left Column: Product Image Showcase & Gallery */}
          <div className="md:col-span-6 flex flex-col items-center justify-between">
            <div className="w-full h-80 sm:h-96 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-6 relative overflow-hidden group">
              {currentImageUrl ? (
                <img
                  src={currentImageUrl}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-4xl border border-blue-100">
                  {product.name.charAt(0)}
                </div>
              )}

              <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
                {product.brand && (
                  <Badge variant="info" className="text-[11px] font-bold bg-blue-600 text-white">
                    {product.brand.name}
                  </Badge>
                )}
                <Badge variant="neutral" className="text-[11px] font-semibold bg-white/90 text-slate-700">
                  {product.category}
                </Badge>
              </div>

              {isOutOfStock ? (
                <div className="absolute top-3 right-3 bg-rose-600 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-xs">
                  Hết hàng
                </div>
              ) : isLowStock ? (
                <div className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-xs">
                  Còn lại {currentInventory} cái
                </div>
              ) : (
                <div className="absolute top-3 right-3 bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-xs">
                  Sẵn sàng giao ngay
                </div>
              )}
            </div>

            {/* Gallery Thumbnails */}
            {galleryImages.length > 1 && (
              <div className="w-full mt-3 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {galleryImages.map((img) => (
                  <Button
                    key={img.id}
                    type="button"
                    variant="ghost"
                    onClick={() => setActiveImage(img.imageUrl)}
                    className={`relative w-16 h-16 rounded-lg border-2 overflow-hidden shrink-0 transition bg-slate-50 p-0 ${
                      currentImageUrl === img.imageUrl
                        ? 'border-blue-600 ring-2 ring-blue-500/20'
                        : 'border-slate-200 opacity-70 hover:opacity-100 hover:border-slate-300'
                    }`}
                  >
                    <img
                      src={img.imageUrl}
                      alt={img.altText || product.name}
                      className="w-full h-full object-contain p-1"
                      referrerPolicy="no-referrer"
                    />
                    {img.isThumbnail && (
                      <span className="absolute bottom-0 inset-x-0 bg-blue-600/90 text-white text-[8px] font-bold text-center py-0.5">
                        Ảnh bìa
                      </span>
                    )}
                  </Button>
                ))}
              </div>
            )}

          </div>

          {/* Right Column: Product Meta & Purchase Controls */}
          <div className="md:col-span-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-[11px] font-mono text-slate-400">ID: {product.id}</span>
                  {activeVariant?.sku && (
                    <>
                      <span className="text-slate-300">•</span>
                      <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        SKU: {activeVariant.sku}
                      </span>
                    </>
                  )}
                  {product.brand && (
                    <>
                      <span className="text-slate-300">•</span>
                      <span className="text-[11px] text-blue-600 font-semibold">
                        Thương hiệu: {product.brand.name} ({product.brand.country})
                      </span>
                    </>
                  )}
                </div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-snug">
                  {product.name}
                </h1>
              </div>

              {/* Price & Inventory */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-slate-500 block mb-0.5 font-medium">Giá bán niêm yết:</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-extrabold text-blue-600 tracking-tight">
                      {formatCurrency(currentPrice)}
                    </span>
                    {activeVariant?.originalPrice && activeVariant.originalPrice > currentPrice && (
                      <span className="text-sm text-slate-400 line-through">
                        {formatCurrency(activeVariant.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 block mb-0.5 font-medium font-mono">Trạng thái kho:</span>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded ${
                      isOutOfStock
                        ? 'bg-rose-100 text-rose-700'
                        : isLowStock
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {currentInventory} sản phẩm có sẵn
                  </span>
                </div>
              </div>

              {/* Product Variants Selection (Color / Specs) */}
              {product.variants && product.variants.length > 0 && (
                <div className="space-y-2 p-3 bg-blue-50/50 border border-blue-100 rounded-xl">
                  <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    <span>Chọn phiên bản ({product.variants.length} tùy chọn):</span>
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {product.variants.map((v) => {
                      const isSelected = activeVariant?.id === v.id;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => {
                            setSelectedVariantId(v.id);
                            if (v.imageUrl) setActiveImage(v.imageUrl);
                          }}
                          className={`p-3 rounded-xl border text-left transition-all duration-200 flex items-center justify-between gap-3 cursor-pointer w-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                            isSelected
                              ? 'bg-white border-blue-600 ring-2 ring-blue-500/10 shadow-xs'
                              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {v.colorCode && (
                              <span
                                className="w-4 h-4 rounded-full border border-slate-300/80 shrink-0"
                                style={{ backgroundColor: v.colorCode }}
                              />
                            )}
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-800 leading-tight">{v.name}</p>
                              {v.specSummary && (
                                <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">{v.specSummary}</p>
                              )}
                            </div>
                          </div>
                          <span className="text-xs font-bold text-blue-600 shrink-0 ml-2 whitespace-nowrap">
                            {formatCurrency(v.price)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>

            {/* Quantity Selector & Action Buttons */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-slate-700">Số lượng:</span>
                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-200 disabled:opacity-40 transition font-bold"
                  >
                    -
                  </Button>
                  <span className="w-10 text-center text-xs font-semibold text-slate-800 font-mono">
                    {quantity}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={() => setQuantity((q) => Math.min(currentInventory, q + 1))}
                    disabled={quantity >= currentInventory || isOutOfStock}
                    className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-200 disabled:opacity-40 transition font-bold"
                  >
                    +
                  </Button>
                </div>
                <span className="text-[11px] text-slate-400">
                  (Tổng: {formatCurrency(currentPrice * quantity)})
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

      {/* Detailed Info Section Below (Option B) */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Card: Detailed Description & Highlights */}
        <div className="md:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-8">
          {/* Description */}
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-3">
              Mô tả chi tiết sản phẩm
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>

          {/* Highlights */}
          <div className="space-y-4 pt-6 border-t border-slate-100">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Đặc điểm nổi bật của sản phẩm</span>
            </h3>
            <ul className="text-sm text-slate-600 space-y-3 list-disc list-inside">
              <li className="leading-relaxed">Thiết kế tiêu chuẩn cao cấp, độ hoàn thiện tinh xảo từng chi tiết nhỏ nhất.</li>
              <li className="leading-relaxed">Phù hợp hoàn hảo cho hệ sinh thái công nghệ, hỗ trợ tối đa công việc và giải trí hiện đại.</li>
              <li className="leading-relaxed">Tích hợp đầy đủ các tiêu chuẩn an toàn quốc tế và công nghệ tiết kiệm năng lượng thông minh.</li>
            </ul>
          </div>
        </div>

        {/* Right Card: Brand Information & Trust badges */}
        <div className="md:col-span-4 space-y-6">
          {product.brand && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Thương hiệu phân phối
              </h3>
              <div className="flex items-center gap-3">
                {product.brand.logoUrl ? (
                  <img
                    src={product.brand.logoUrl}
                    alt={product.brand.name}
                    className="w-12 h-12 object-cover rounded-xl border border-slate-200 bg-white shadow-3xs"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-blue-600 text-lg shadow-3xs">
                    {product.brand.name.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-extrabold text-slate-900">{product.brand.name}</h4>
                    <span className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded-full font-bold">
                      {product.brand.country}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">Thương hiệu quốc tế uy tín</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed border-t border-slate-50 pt-3">
                {product.brand.description}
              </p>
            </div>
          )}

          {/* Premium trust badge list */}
          <div className="bg-gradient-to-br from-blue-50/40 to-slate-50/60 border border-blue-100/50 rounded-2xl p-6 shadow-3xs space-y-4">
            <h4 className="text-xs font-extrabold text-blue-800 uppercase tracking-wider">
              An tâm mua sắm tại TechStore
            </h4>
            <div className="space-y-4">
              <div className="flex gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-slate-800">Cam kết chính hãng</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">Hoàn tiền 200% nếu phát hiện hàng giả, hàng nhái.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Truck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-slate-800">Giao hàng hỏa tốc</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">Đóng gói cẩn thận, miễn phí vận chuyển toàn quốc.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <RotateCcw className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-slate-800">Đổi trả dễ dàng</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">Hỗ trợ đổi mới trong vòng 30 ngày nếu có lỗi NSX.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
