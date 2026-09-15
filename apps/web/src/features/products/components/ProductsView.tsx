import React, { useState, useEffect } from 'react';
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
import { ShoppingCart, Check } from 'lucide-react';
import { formatCurrency } from '../../../utils/currency.ts';

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
  const { data: productsData, isLoading } = useProducts(filters);

  const products = productsData?.data || [];
  const pagination = productsData?.pagination || {
    page: 1,
    limit: 8,
    total: 0,
    totalPages: 1,
  };

  // Listen for custom category selection event from Header Mega Menu
  useEffect(() => {
    const handleCategoryEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ categorySlug: string }>;
      if (customEvent.detail?.categorySlug) {
        setFilters((prev) => ({
          ...prev,
          category: customEvent.detail.categorySlug,
          page: 1,
        }));
      }
    };

    window.addEventListener('techstore:select-category', handleCategoryEvent);
    return () => {
      window.removeEventListener('techstore:select-category', handleCategoryEvent);
    };
  }, []);

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
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold underline ml-2"
          >
            Xem giỏ
          </button>
        </div>
      )}

      {/* Quick View Product Modal */}
      {quickViewProduct && (
        <Modal
          isOpen={Boolean(quickViewProduct)}
          onClose={() => setQuickViewProduct(null)}
          title="Xem nhanh Sản phẩm"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
            <div className="aspect-square bg-slate-100 rounded-2xl overflow-hidden border border-slate-200">
              <img
                src={quickViewProduct.imageUrl}
                alt={quickViewProduct.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="neutral">{quickViewProduct.category}</Badge>
                  <span className="text-xs text-slate-500">Mã SP: {quickViewProduct.id}</span>
                </div>

                <h3 className="text-lg font-bold text-slate-900">{quickViewProduct.name}</h3>
                <p className="text-xl font-extrabold text-blue-600 mt-2">
                  {formatCurrency(quickViewProduct.price)}
                </p>

                <p className="text-xs text-slate-600 mt-3 line-clamp-4 leading-relaxed">
                  {quickViewProduct.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => {
                    handleAddToCart(quickViewProduct);
                    setQuickViewProduct(null);
                  }}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Thêm vào giỏ
                </Button>
                <Link
                  to={`/products/${quickViewProduct.id}`}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                  onClick={() => setQuickViewProduct(null)}
                >
                  Chi tiết
                </Link>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
