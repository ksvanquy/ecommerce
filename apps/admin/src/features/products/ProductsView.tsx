import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Trash2,
  Edit2,
  Package,
  Check,
  AlertCircle,
  Grid,
  List,
  Filter,
  ChevronLeft,
  ChevronRight,
  Folder,
  Award,
  Eye,
  EyeOff,
  Layers,
} from 'lucide-react';
import { Product, Category, Brand } from '@repo/shared-types';
import axios from 'axios';
import CategoriesTable from './CategoriesTable.tsx';
import BrandsTable from './BrandsTable.tsx';
import ProductFormModal from './ProductFormModal.tsx';

interface ProductsViewProps {
  products: Product[];
  token: string;
  onRefresh: () => void;
}

export default function ProductsView({ products, token, onRefresh }: ProductsViewProps) {
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'brands'>('products');

  // Categories & Brands list state
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  // Filters & Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 8;

  // Inline Stock/Price Editing
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [editStockValue, setEditStockValue] = useState<number>(0);
  const [editPriceValue, setEditPriceValue] = useState<number>(0);

  // Full Modal Form State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch Categories & Brands on Mount or Refresh
  const fetchCategoriesAndBrands = async () => {
    try {
      const [catRes, brandRes] = await Promise.all([
        axios.get('/api/categories'),
        axios.get('/api/brands'),
      ]);
      if (catRes.data.success) {
        setCategories(catRes.data.data || []);
      }
      if (brandRes.data.success) {
        setBrands(brandRes.data.data || []);
      }
    } catch (e) {
      console.error('Lỗi tải danh mục/thương hiệu:', e);
    }
  };

  useEffect(() => {
    fetchCategoriesAndBrands();
  }, []);

  const handleRefreshAll = () => {
    onRefresh();
    fetchCategoriesAndBrands();
  };

  // Filter Products
  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchCategory =
      selectedCategory === 'all' ||
      p.categoryId === selectedCategory ||
      p.category.toLowerCase() === selectedCategory.toLowerCase();

    const matchBrand = selectedBrand === 'all' || p.brandId === selectedBrand;

    return matchSearch && matchCategory && matchBrand;
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Quick inline stock edit
  const handleStartInlineEdit = (p: Product) => {
    setEditingStockId(p.id);
    setEditStockValue(p.inventory);
    setEditPriceValue(p.price);
    setErrorMsg(null);
  };

  const handleSaveInlineEdit = async (p: Product) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const response = await axios.put(
        `/api/products/${p.id}`,
        { inventory: editStockValue, price: editPriceValue },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setEditingStockId(null);
        handleRefreshAll();
      } else {
        setErrorMsg(response.data.message || 'Cập nhật thất bại.');
      }
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Không thể cập nhật sản phẩm.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete product
  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;
    setIsSubmitting(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.delete(`/api/products/${deletingProduct.id}`, { headers });
      if (res.data.success) {
        setDeletingProduct(null);
        handleRefreshAll();
      } else {
        setErrorMsg(res.data.message || 'Xóa sản phẩm thất bại.');
      }
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Không thể xóa sản phẩm.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="space-y-3 animate-fade-in font-sans">
      {/* Sub-tabs Navigation & Quick Action */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-0">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-3.5 py-2 rounded-t-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer border-t border-x ${
              activeTab === 'products'
                ? 'bg-white border-slate-200/80 text-blue-600 border-b-white -mb-px shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Sản Phẩm ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`px-3.5 py-2 rounded-t-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer border-t border-x ${
              activeTab === 'categories'
                ? 'bg-white border-slate-200/80 text-blue-600 border-b-white -mb-px shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Folder className="w-4 h-4" />
            <span>Danh Mục ({categories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('brands')}
            className={`px-3.5 py-2 rounded-t-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer border-t border-x ${
              activeTab === 'brands'
                ? 'bg-white border-slate-200/80 text-blue-600 border-b-white -mb-px shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Thương Hiệu ({brands.length})</span>
          </button>
        </div>

        {/* Action button aligned right */}
        {activeTab === 'products' && (
          <button
            onClick={() => {
              setEditingProduct(null);
              setIsProductModalOpen(true);
            }}
            className="mb-1 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs border-none"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm Sản Phẩm</span>
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-start gap-2.5 shadow-2xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <p className="leading-relaxed font-semibold">{errorMsg}</p>
        </div>
      )}

      {/* TAB 1: PRODUCTS TABLE & CARDS */}
      {activeTab === 'products' && (
        <div className="space-y-3">
          {/* Toolbar Filters */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-2.5 bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
            {/* Search Input */}
            <div className="relative w-full lg:w-80">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Tìm tên, mã sản phẩm hoặc danh mục..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:bg-white font-medium"
              />
            </div>

            {/* Dropdown Filters & Layout toggle */}
            <div className="flex items-center gap-2 w-full lg:w-auto flex-wrap justify-end">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-blue-600 cursor-pointer"
              >
                <option value="all">Tất cả danh mục</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Brand Filter */}
              <select
                value={selectedBrand}
                onChange={(e) => {
                  setSelectedBrand(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-blue-600 cursor-pointer"
              >
                <option value="all">Tất cả thương hiệu</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>

              {/* View mode buttons */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/80">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1 rounded text-xs transition cursor-pointer border-none ${
                    viewMode === 'table' ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'text-slate-500'
                  }`}
                  title="Chế độ Bảng danh sách"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1 rounded text-xs transition cursor-pointer border-none ${
                    viewMode === 'grid' ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'text-slate-500'
                  }`}
                  title="Chế độ Thẻ (Grid)"
                >
                  <Grid className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* VIEW MODE 1: FLAT TABLE */}
          {viewMode === 'table' ? (
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 px-3">Sản Phẩm</th>
                      <th className="py-2.5 px-3">Danh Mục</th>
                      <th className="py-2.5 px-3">Thương Hiệu</th>
                      <th className="py-2.5 px-3">Giá Bán</th>
                      <th className="py-2.5 px-3">Tồn Kho</th>
                      <th className="py-2.5 px-3 text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {paginatedProducts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                          Không tìm thấy sản phẩm nào phù hợp.
                        </td>
                      </tr>
                    ) : (
                      paginatedProducts.map((p) => {
                        const isEditingThis = editingStockId === p.id;
                        const isLowStock = p.inventory < 5;
                        const brandObj = brands.find((b) => b.id === p.brandId) || p.brand;

                        return (
                          <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-2 px-3 font-bold text-slate-900 flex items-center gap-2.5">
                              {p.imageUrl ? (
                                <img
                                  src={p.imageUrl}
                                  alt={p.name}
                                  className="w-8 h-8 rounded-lg object-contain bg-slate-50 border border-slate-100 p-0.5 shrink-0"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center shrink-0 border border-slate-100">
                                  <Package className="w-4 h-4" />
                                </div>
                              )}
                              <div className="space-y-0.5">
                                <span className="block font-bold text-slate-900">{p.name}</span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  Mã: {p.id.substring(0, 10).toUpperCase()}
                                </span>
                              </div>
                            </td>

                            <td className="py-2 px-3">
                              <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 capitalize">
                                {p.category}
                              </span>
                            </td>

                            <td className="py-2 px-3 text-slate-600 font-medium">
                              {brandObj?.name || 'Chưa chọn'}
                            </td>

                            <td className="py-2 px-3 font-extrabold text-blue-600">
                              {isEditingThis ? (
                                <input
                                  type="number"
                                  value={editPriceValue}
                                  onChange={(e) => setEditPriceValue(Number(e.target.value))}
                                  className="w-24 px-2 py-1 bg-white border border-slate-300 rounded text-xs font-bold text-blue-600 outline-none focus:border-blue-600"
                                />
                              ) : (
                                formatCurrency(p.price)
                              )}
                            </td>

                            <td className="py-3 px-4">
                              {isEditingThis ? (
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="number"
                                    value={editStockValue}
                                    onChange={(e) => setEditStockValue(Math.max(0, parseInt(e.target.value) || 0))}
                                    className="w-16 px-2 py-1 bg-white border border-slate-300 rounded text-xs text-slate-900 text-center font-bold outline-none focus:border-blue-600"
                                  />
                                  <button
                                    onClick={() => handleSaveInlineEdit(p)}
                                    disabled={isSubmitting}
                                    className="p-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded cursor-pointer border-none"
                                    title="Lưu"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <span
                                  className={`font-bold ${
                                    isLowStock ? 'text-rose-600 font-extrabold' : 'text-slate-900'
                                  }`}
                                >
                                  {p.inventory} chiếc {isLowStock && '(Sắp hết)'}
                                </span>
                              )}
                            </td>

                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleStartInlineEdit(p)}
                                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition cursor-pointer border-none"
                                  title="Sửa nhanh giá & kho"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingProduct(p);
                                    setIsProductModalOpen(true);
                                  }}
                                  className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition cursor-pointer border-none"
                                  title="Chỉnh sửa chi tiết & Biến thể"
                                >
                                  <Layers className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setDeletingProduct(p)}
                                  className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition cursor-pointer border-none"
                                  title="Xóa sản phẩm"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* VIEW MODE 2: CARDS GRID */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {paginatedProducts.length === 0 ? (
                <div className="col-span-full py-12 text-center text-slate-400 text-xs font-medium bg-white rounded-2xl border border-slate-200/80">
                  Không tìm thấy sản phẩm nào phù hợp.
                </div>
              ) : (
                paginatedProducts.map((p) => {
                  const isLowStock = p.inventory < 5;
                  return (
                    <div
                      key={p.id}
                      className="bg-white border border-slate-200/80 shadow-2xs rounded-2xl p-4 flex flex-col justify-between space-y-3 relative hover:border-slate-300 transition"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 min-w-0">
                          <span className="inline-flex px-2 py-0.5 rounded-md text-[9px] font-bold bg-slate-100 text-slate-600 capitalize">
                            {p.category}
                          </span>
                          <h3 className="text-xs font-bold text-slate-900 line-clamp-2">{p.name}</h3>
                        </div>
                        {p.imageUrl ? (
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="w-12 h-12 rounded-xl object-contain bg-slate-50 border border-slate-100 p-1 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 shrink-0 border border-slate-100">
                            <Package className="w-5 h-5" />
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">Giá bán</span>
                          <span className="font-extrabold text-blue-600">{formatCurrency(p.price)}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block font-medium">Tồn kho</span>
                          <span className={`font-bold ${isLowStock ? 'text-rose-600' : 'text-slate-900'}`}>
                            {p.inventory} chiếc
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-end gap-1.5 border-t border-slate-100">
                        <button
                          onClick={() => {
                            setEditingProduct(p);
                            setIsProductModalOpen(true);
                          }}
                          className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-bold transition border-none cursor-pointer flex items-center gap-1"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Chi tiết</span>
                        </button>
                        <button
                          onClick={() => setDeletingProduct(p)}
                          className="p-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition border-none cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* PAGINATION CONTROLS */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs text-xs font-medium">
              <span className="text-slate-500">
                Hiển thị {paginatedProducts.length} trên tổng số {filteredProducts.length} sản phẩm
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="font-bold text-slate-800 px-2">
                  Trang {currentPage} / {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CATEGORIES TABLE */}
      {activeTab === 'categories' && (
        <CategoriesTable categories={categories} token={token} onRefresh={handleRefreshAll} />
      )}

      {/* TAB 3: BRANDS TABLE */}
      {activeTab === 'brands' && (
        <BrandsTable brands={brands} token={token} onRefresh={handleRefreshAll} />
      )}

      {/* PRODUCT FORM MODAL (Create & Edit & Variant Management) */}
      <ProductFormModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        editingProduct={editingProduct}
        categories={categories}
        brands={brands}
        token={token}
        onRefresh={handleRefreshAll}
      />

      {/* DELETE CONFIRMATION POPUP */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full border border-slate-200 p-5 shadow-xl space-y-4 animate-scale-up">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl w-fit">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Xác nhận xóa sản phẩm?</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Bạn có chắc chắn muốn xóa sản phẩm <span className="font-bold text-slate-800">"{deletingProduct.name}"</span> không? Hành động này sẽ xóa các biến thể thuộc sản phẩm này.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setDeletingProduct(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteProduct}
                disabled={isSubmitting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                {isSubmitting ? 'Đang xóa...' : 'Xóa Sản Phẩm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
