import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../api/useProducts.ts';
import { useCategories } from '../api/useCategories.ts';
import { ProductList } from './ProductList.tsx';
import { ProductFiltersBar } from './ProductFiltersBar.tsx';
import { Pagination } from './Pagination.tsx';
import { Modal } from '../../../components/ui/Modal.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { Badge } from '../../../components/ui/Badge.tsx';
import { useCartStore } from '../../checkout/store/cartStore.ts';
import type { Product, ProductFilters } from '../types.ts';
import {
  Package,
  Sparkles,
  Layers,
  Database,
  RefreshCw,
  Eye,
  ShoppingCart,
  CheckCircle2,
  Filter,
  Check,
  ArrowRight,
} from 'lucide-react';

export const ProductsView: React.FC = () => {
  const [filters, setFilters] = useState<ProductFilters>({
    page: 1,
    limit: 8,
    category: 'all',
    search: '',
    sortBy: 'newest',
  });

  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [cartToast, setCartToast] = useState<{ visible: boolean; name: string }>({
    visible: false,
    name: '',
  });

  const addItem = useCartStore((state) => state.addItem);
  const setOpenCart = useCartStore((state) => state.setOpen);

  const { data: categories = [] } = useCategories();
  const {
    data: productsData,
    isLoading,
    isFetching,
    refetch,
    dataUpdatedAt,
  } = useProducts(filters);

  const products = productsData?.data || [];
  const pagination = productsData?.pagination || {
    page: 1,
    limit: 8,
    total: 0,
    totalPages: 1,
  };

  const handleFilterChange = (newFilters: Partial<ProductFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: 8,
      category: 'all',
      search: '',
      sortBy: 'newest',
    });
  };

  const handleAddToCart = (product: Product) => {
    addItem(product, 1);
    setCartToast({ visible: true, name: product.name });
    setTimeout(() => {
      setCartToast({ visible: false, name: '' });
    }, 3500);
  };

  return (
    <div className="space-y-6">
      {/* Phase 2 Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-blue-500/20 text-blue-300 text-[11px] font-bold px-2 py-0.5 rounded font-mono uppercase tracking-wider border border-blue-400/30">
                Giai đoạn 2 Hoàn thiện
              </span>
              <span className="text-slate-300 text-xs font-medium">
                Module Products • Đọc dữ liệu, Caching &amp; Pagination
              </span>
            </div>
            <h2 className="text-xl font-bold mt-2 tracking-tight">
              Danh mục &amp; Chi tiết Sản phẩm (Product Catalog)
            </h2>
            <p className="text-slate-300 text-xs mt-1 max-w-2xl leading-relaxed">
              Triển khai luồng đọc dữ liệu hoàn chỉnh: API phân trang + lọc danh mục &amp; tìm kiếm &rarr; React Query Cache &rarr; Grid danh sách &rarr; Trang chi tiết từng sản phẩm.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              isLoading={isFetching}
              className="bg-white/10 text-white hover:bg-white/20 border-white/20"
              id="btn-refresh-products"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isFetching ? 'animate-spin' : ''}`} />
              Làm mới cache
            </Button>
          </div>
        </div>
      </div>

      {/* Quick stats and active status */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 bg-white p-3 rounded-lg border border-slate-200">
        <div className="flex items-center space-x-3">
          <span className="flex items-center gap-1.5 text-slate-700 font-medium">
            <Package className="w-4 h-4 text-blue-600" />
            Tổng sản phẩm: <strong className="text-slate-900">{pagination.total}</strong>
          </span>
          <span className="text-slate-300">•</span>
          <span>Trang {pagination.page} / {pagination.totalPages}</span>
          <span className="text-slate-300">•</span>
          <span className="flex items-center gap-1 text-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            React Query Cache (2 phút)
          </span>
        </div>

        <div className="text-[11px] font-mono text-slate-400">
          Cập nhật: {dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString() : '...'}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <ProductFiltersBar
        filters={filters}
        categories={categories}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        totalProducts={pagination.total}
      />

      {/* Product List Grid */}
      <div className="space-y-6">
        <ProductList
          products={products}
          isLoading={isLoading}
          onAddToCart={handleAddToCart}
          onQuickView={(p) => setQuickViewProduct(p)}
        />

        {/* Pagination */}
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          limit={pagination.limit}
          onPageChange={(page) => handleFilterChange({ page })}
        />
      </div>

      {/* Toast Notification when item added to cart */}
      {cartToast.visible && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center space-x-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
            <Check className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <p className="font-semibold text-emerald-400">Đã thêm vào giỏ hàng!</p>
            <p className="text-slate-300 truncate max-w-[180px]">{cartToast.name}</p>
          </div>
          <button
            type="button"
            onClick={() => setOpenCart(true)}
            className="ml-2 px-2.5 py-1 text-xs bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition inline-flex items-center gap-1 shadow-xs"
          >
            <span>Xem giỏ</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Quick View Modal */}
      <Modal
        isOpen={Boolean(quickViewProduct)}
        onClose={() => setQuickViewProduct(null)}
        title="Xem nhanh thông tin sản phẩm"
      >
        {quickViewProduct && (
          <div className="space-y-4">
            <div className="h-48 bg-slate-50 rounded-xl flex items-center justify-center p-4 border border-slate-100">
              {quickViewProduct.imageUrl ? (
                <img
                  src={quickViewProduct.imageUrl}
                  alt={quickViewProduct.name}
                  className="max-h-full max-w-full object-contain"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-2xl">
                  {quickViewProduct.name.charAt(0)}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <Badge variant="info">{quickViewProduct.category}</Badge>
                <span className="text-xs text-slate-500 font-mono">
                  Kho: {quickViewProduct.inventory} cái
                </span>
              </div>
              <h3 className="font-bold text-base text-slate-900">{quickViewProduct.name}</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {quickViewProduct.description}
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-2xl font-extrabold text-blue-600">
                ${quickViewProduct.price.toLocaleString()}
              </span>

              <div className="flex gap-2">
                <Link
                  to={`/products/${quickViewProduct.id}`}
                  onClick={() => setQuickViewProduct(null)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Xem chi tiết đầy đủ
                </Link>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => {
                    handleAddToCart(quickViewProduct);
                    setQuickViewProduct(null);
                  }}
                >
                  <ShoppingCart className="w-3.5 h-3.5 mr-1" />
                  Thêm giỏ
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
