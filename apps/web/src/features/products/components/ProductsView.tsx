import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../api/useProducts.ts';
import { useCategories, useCategoryTree } from '../api/useCategories.ts';
import { ProductList } from './ProductList.tsx';
import { ProductFiltersBar } from './ProductFiltersBar.tsx';
import { Pagination } from './Pagination.tsx';
import { useCartStore } from '../../checkout/store/cartStore.ts';
import type { Product, ProductFilters } from '../types.ts';
import { Check } from 'lucide-react';

export const ProductsView: React.FC = () => {
  const [filters, setFilters] = useState<ProductFilters>({
    page: 1,
    limit: 8,
    category: 'all',
    search: '',
    sortBy: 'newest',
  });

  const [cartToast, setCartToast] = useState<{ visible: boolean; name: string }>({
    visible: false,
    name: '',
  });

  const addItem = useCartStore((state) => state.addItem);

  const { data: categories = [] } = useCategories();
  const { data: categoryTree = [] } = useCategoryTree();
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

  // Listen for custom search event from Header
  useEffect(() => {
    const handleSearchEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ searchTerm: string }>;
      if (customEvent.detail !== undefined) {
        setFilters((prev) => ({
          ...prev,
          search: customEvent.detail.searchTerm,
          page: 1,
        }));
      }
    };

    window.addEventListener('techstore:search-changed', handleSearchEvent);
    return () => {
      window.removeEventListener('techstore:search-changed', handleSearchEvent);
    };
  }, []);

  // Synchronize category state outwards to the sticky global subheader
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('techstore:category-changed', {
        detail: { categorySlug: filters.category || 'all' },
      })
    );
  }, [filters.category]);

  // Synchronize search term outwards to the Header
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('techstore:search-sync', {
        detail: { searchTerm: filters.search || '' },
      })
    );
  }, [filters.search]);

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
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
      {/* Left Sidebar: Collapsible/Nested Category Tree (Desktop only) */}
      <aside className="hidden md:block md:col-span-3 space-y-6 sticky top-20">
        <div className="bg-white rounded-2xl p-5 border border-slate-100">
          <h3 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-4">
            Danh mục sản phẩm
          </h3>
          
          <div className="space-y-1">
            {/* All Products button */}
            <button
              type="button"
              onClick={() => handleFilterChange({ category: 'all', page: 1 })}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filters.category === 'all' || !filters.category
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span>Tất cả sản phẩm</span>
            </button>

            {categoryTree.map((cat) => {
              const isSelected = filters.category === cat.slug || filters.category === cat.id || filters.category === cat.name;
              const hasActiveChild = cat.children?.some(
                (child: any) => filters.category === child.slug || filters.category === child.id || filters.category === child.name
              );
              const isExpanded = isSelected || hasActiveChild;

              return (
                <div key={cat.id} className="space-y-0.5">
                  <button
                    type="button"
                    onClick={() => handleFilterChange({ category: cat.slug, page: 1 })}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 text-blue-700 font-extrabold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span>{cat.name}</span>
                    {cat.children && cat.children.length > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isSelected ? 'bg-blue-100 text-blue-700 font-extrabold' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {cat.children.length}
                      </span>
                    )}
                  </button>

                  {/* Multi-level: Nested Child Categories */}
                  {cat.children && cat.children.length > 0 && isExpanded && (
                    <div className="pl-6 pt-0.5 pb-1 space-y-0.5 animate-in slide-in-from-top-1 duration-100">
                      {cat.children.map((child: any) => {
                        const isChildSelected = filters.category === child.slug || filters.category === child.id || filters.category === child.name;
                        return (
                          <button
                            key={child.id}
                            type="button"
                            onClick={() => handleFilterChange({ category: child.slug, page: 1 })}
                            className={`w-full text-left px-3.5 py-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                              isChildSelected
                                ? 'bg-blue-50/60 text-blue-600 font-extrabold'
                                : 'text-slate-500 hover:bg-slate-50/50 hover:text-slate-800'
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              <span className={`w-1 h-1 rounded-full ${isChildSelected ? 'bg-blue-500' : 'bg-slate-300'}`} />
                              {child.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Right Column: Filters and Grid layout (Responsive span) */}
      <div className="col-span-1 md:col-span-9 space-y-6">
        {/* On Mobile: Horizontal Category Slider (keeps mobile fully functional) */}
        <div className="md:hidden bg-white rounded-2xl p-3 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs border border-slate-100">
          <button
            type="button"
            onClick={() => handleFilterChange({ category: 'all', page: 1 })}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              filters.category === 'all' || !filters.category
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 hover:bg-slate-200/70 text-slate-700 hover:text-slate-900'
            }`}
          >
            <span>Tất cả</span>
          </button>
          
          {categoryTree.map((cat) => {
            const isSelected = filters.category === cat.slug || filters.category === cat.id || filters.category === cat.name;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleFilterChange({ category: cat.slug, page: 1 })}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 hover:bg-slate-200/70 text-slate-700 hover:text-slate-900'
                }`}
              >
                <span>{cat.name}</span>
              </button>
            );
          })}
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
          <Link
            to="/cart"
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold underline ml-2"
          >
            Xem giỏ
          </Link>
        </div>
      )}
    </div>
  );
};
