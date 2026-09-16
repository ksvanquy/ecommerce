import React from 'react';
import { Search, X, ArrowUpDown, Tag, SlidersHorizontal, Award } from 'lucide-react';
import { Button } from '@repo/ui';
import { useCategoryTree } from '../api/useCategories.ts';
import { useBrands } from '../api/useBrands.ts';
import type { ProductFilters } from '../types.ts';

interface ProductFiltersBarProps {
  filters: ProductFilters;
  categories?: string[];
  onFilterChange: (newFilters: Partial<ProductFilters>) => void;
  onReset: () => void;
  totalProducts?: number;
}

export const ProductFiltersBar: React.FC<ProductFiltersBarProps> = ({
  filters,
  onFilterChange,
  onReset,
  totalProducts,
}) => {
  const { data: categoryTree = [] } = useCategoryTree();
  const { data: brandsList = [] } = useBrands();

  const isCategoryActive = filters.category && filters.category !== 'all';
  const isBrandActive = Boolean(filters.brandId);
  const hasActiveFilters = Boolean(
    isCategoryActive ||
      isBrandActive ||
      filters.search ||
      (filters.sortBy && filters.sortBy !== 'newest') ||
      filters.minPrice ||
      filters.maxPrice
  );

  const activeBrandName = brandsList.find((b) => b.id === filters.brandId)?.name;

  // Helper to find category name & hierarchy from tree
  const getActiveCategoryLabel = (): { rootName?: string; subName?: string; fullName: string } => {
    if (!isCategoryActive) return { fullName: 'Tất cả sản phẩm' };
    const catId = filters.category!.toLowerCase();

    // Check root node
    const root = categoryTree.find(
      (r) =>
        r.id.toLowerCase() === catId ||
        r.slug.toLowerCase() === catId ||
        r.name.toLowerCase() === catId
    );
    if (root) {
      return { rootName: root.name, fullName: root.name };
    }

    // Check sub node
    for (const r of categoryTree) {
      const child = r.children?.find(
        (c) =>
          c.id.toLowerCase() === catId ||
          c.slug.toLowerCase() === catId ||
          c.name.toLowerCase() === catId
      );
      if (child) {
        return {
          rootName: r.name,
          subName: child.name,
          fullName: `${r.name} → ${child.name}`,
        };
      }
    }

    return { fullName: filters.category! };
  };

  const activeCategoryInfo = getActiveCategoryLabel();

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
      {/* Top row: Search input, Sort, Total products */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Box */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="input-product-search"
            type="text"
            value={filters.search || ''}
            onChange={(e) => onFilterChange({ search: e.target.value, page: 1 })}
            placeholder="Tìm kiếm sản phẩm theo tên, linh kiện, mô tả..."
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          />
          {filters.search && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => onFilterChange({ search: '', page: 1 })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>

        {/* Sort, Brand & Count */}
        <div className="flex items-center gap-2.5 shrink-0 justify-between sm:justify-end flex-wrap">
          {/* Total products badge */}
          {totalProducts !== undefined && (
            <span className="text-xs font-medium text-slate-500 hidden md:inline-block">
              Tổng <strong className="text-slate-900 font-semibold">{totalProducts}</strong> sản phẩm
            </span>
          )}

          {/* Brand Dropdown */}
          {brandsList.length > 0 && (
            <div className="relative shrink-0">
              <div className="flex items-center space-x-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
                <Award className="w-3.5 h-3.5 text-blue-600" />
                <select
                  id="select-product-brand"
                  value={filters.brandId || ''}
                  onChange={(e) => onFilterChange({ brandId: e.target.value || undefined, page: 1 })}
                  aria-label="Lọc theo thương hiệu"
                  className="bg-transparent border-none text-xs text-slate-800 font-semibold focus:outline-none cursor-pointer pr-2"
                >
                  <option value="">Tất cả thương hiệu</option>
                  {brandsList.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.country})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Sort Dropdown */}
          <div className="relative shrink-0">
            <div className="flex items-center space-x-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <select
                id="select-product-sort"
                value={filters.sortBy || 'newest'}
                onChange={(e) => onFilterChange({ sortBy: e.target.value as any, page: 1 })}
                aria-label="Sắp xếp sản phẩm"
                className="bg-transparent border-none text-xs text-slate-800 font-semibold focus:outline-none cursor-pointer pr-2"
              >
                <option value="newest">Mới nhất</option>
                <option value="price_asc">Giá: Thấp đến Cao</option>
                <option value="price_desc">Giá: Cao đến Thấp</option>
                <option value="name_asc">Tên: A → Z</option>
              </select>
            </div>
          </div>

          {/* Clear Filters Button if any filter is active */}
          {hasActiveFilters && (
            <Button
              type="button"
              id="btn-reset-filters"
              variant="outline"
              size="sm"
              onClick={onReset}
              className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 transition"
            >
              <X className="w-3.5 h-3.5" />
              <span>Xóa bộ lọc</span>
            </Button>
          )}
        </div>
      </div>

      {/* Category Pills Horizontal Scroll */}
      <div className="pt-2 border-t border-slate-100">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none text-xs">
          <Button
            type="button"
            variant="pill"
            size="sm"
            isActive={!isCategoryActive}
            onClick={() => onFilterChange({ category: 'all', page: 1 })}
            className="font-semibold whitespace-nowrap"
          >
            Tất cả sản phẩm
          </Button>

          {categoryTree.map((cat) => {
            const isSelected =
              filters.category === cat.id ||
              filters.category === cat.slug ||
              filters.category === cat.name;

            return (
              <Button
                key={cat.id}
                type="button"
                variant="pill"
                size="sm"
                isActive={isSelected}
                onClick={() => onFilterChange({ category: cat.slug, page: 1 })}
                className="font-semibold whitespace-nowrap flex items-center gap-1.5"
              >
                <span>{cat.name}</span>
                {cat.children && cat.children.length > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {cat.children.length}
                  </span>
                )}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Active Filter Breadcrumbs / Status Bar */}
      {hasActiveFilters && (
        <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
            <span>Đang lọc:</span>
          </span>

          {/* Active Brand Chip */}
          {isBrandActive && activeBrandName && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200 font-medium">
              <Award className="w-3 h-3 text-indigo-600" />
              <span>Thương hiệu: {activeBrandName}</span>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onFilterChange({ brandId: undefined, page: 1 })}
                className="p-0.5 hover:bg-indigo-200/60 rounded-full transition text-indigo-700 min-h-0 min-w-0"
                title="Bỏ lọc thương hiệu"
              >
                <X className="w-3 h-3" />
              </Button>
            </span>
          )}

          {/* Active Category Chip */}
          {isCategoryActive && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 font-medium">
              <Tag className="w-3 h-3 text-blue-600" />
              <span>{activeCategoryInfo.fullName}</span>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onFilterChange({ category: 'all', page: 1 })}
                className="p-0.5 hover:bg-blue-200/60 rounded-full transition text-blue-700 min-h-0 min-w-0"
                title="Bỏ lọc danh mục"
              >
                <X className="w-3 h-3" />
              </Button>
            </span>
          )}

          {/* Active Search Term Chip */}
          {filters.search && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-medium">
              <Search className="w-3 h-3 text-amber-600" />
              <span>Từ khóa: "{filters.search}"</span>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onFilterChange({ search: '', page: 1 })}
                className="p-0.5 hover:bg-amber-200/60 rounded-full transition text-amber-700 min-h-0 min-w-0"
                title="Bỏ tìm kiếm"
              >
                <X className="w-3 h-3" />
              </Button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};
