import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Package, Image, Tag, Award, Layers } from 'lucide-react';
import { Product, Category, Brand } from '@repo/shared-types';
import axios from 'axios';
import ProductVariantsManager from './ProductVariantsManager.tsx';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingProduct: Product | null;
  categories: Category[];
  brands: Brand[];
  token: string;
  onRefresh: () => void;
}

export default function ProductFormModal({
  isOpen,
  onClose,
  editingProduct,
  categories,
  brands,
  token,
  onRefresh,
}: ProductFormModalProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'variants'>('info');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    inventory: 10,
    category: '',
    categoryId: '' as string | null,
    brandId: '' as string | null,
    imageUrl: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name,
        description: editingProduct.description || '',
        price: editingProduct.price,
        inventory: editingProduct.inventory,
        category: editingProduct.category,
        categoryId: editingProduct.categoryId || null,
        brandId: editingProduct.brandId || null,
        imageUrl: editingProduct.imageUrl || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        inventory: 10,
        category: categories[0]?.name || 'Điện thoại',
        categoryId: categories[0]?.id || null,
        brandId: brands[0]?.id || null,
        imageUrl: '',
      });
    }
    setErrorMsg(null);
    setActiveTab('info');
  }, [editingProduct, categories, brands, isOpen]);

  if (!isOpen) return null;

  const handleCategoryChange = (catId: string) => {
    const found = categories.find((c) => c.id === catId);
    setFormData((prev) => ({
      ...prev,
      categoryId: catId || null,
      category: found ? found.name : prev.category,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        inventory: Number(formData.inventory),
        category: formData.category.trim() || 'Khác',
        categoryId: formData.categoryId || undefined,
        brandId: formData.brandId || undefined,
        imageUrl: formData.imageUrl.trim() || undefined,
      };

      if (editingProduct) {
        const res = await axios.put(`/api/products/${editingProduct.id}`, payload, { headers });
        if (res.data.success) {
          onClose();
          onRefresh();
        } else {
          setErrorMsg(res.data.message || 'Cập nhật sản phẩm thất bại');
        }
      } else {
        const res = await axios.post('/api/products', payload, { headers });
        if (res.data.success) {
          onClose();
          onRefresh();
        } else {
          setErrorMsg(res.data.message || 'Thêm sản phẩm thất bại');
        }
      }
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.message ||
          err?.response?.data?.error?.message ||
          'Không thể lưu thông tin sản phẩm.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up font-sans">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">
              {editingProduct ? `Chỉnh Sửa Sản Phẩm: ${editingProduct.name}` : 'Thêm Sản Phẩm Mới'}
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">Nhập thông tin sản phẩm, cấu hình giá bán và kiểm kê kho hàng</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 cursor-pointer border-none transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Tabs if editing */}
        {editingProduct && (
          <div className="flex border-b border-slate-200/80 px-6 bg-white gap-6">
            <button
              onClick={() => setActiveTab('info')}
              className={`py-3 text-xs font-bold border-b-2 cursor-pointer transition ${
                activeTab === 'info'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Thông Tin Cơ Bản
            </button>
            <button
              onClick={() => setActiveTab('variants')}
              className={`py-3 text-xs font-bold border-b-2 cursor-pointer transition flex items-center gap-1.5 ${
                activeTab === 'variants'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>Biến Thể Sản Phẩm</span>
              <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-700 text-[10px] font-extrabold">
                {editingProduct.variants?.length || 0}
              </span>
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs font-medium flex-1">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {activeTab === 'info' ? (
            <form id="product-form" onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Tên Sản Phẩm (*)</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ví dụ: iPhone 15 Pro Max 256GB - VN/A"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-blue-600 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Danh Mục (*)</label>
                  <select
                    value={formData.categoryId || ''}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-blue-600 bg-white font-medium"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Thương Hiệu</label>
                  <select
                    value={formData.brandId || ''}
                    onChange={(e) => setFormData({ ...formData, brandId: e.target.value || null })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-blue-600 bg-white font-medium"
                  >
                    <option value="">-- Không chọn thương hiệu --</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.country || 'Toàn cầu'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Giá Bán Niêm Yết (VND) (*)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    placeholder="30000000"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-900 font-bold text-blue-600 outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Số Lượng Tồn Kho (*)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.inventory}
                    onChange={(e) => setFormData({ ...formData, inventory: Number(e.target.value) })}
                    placeholder="50"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-900 font-bold outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Đường Dẫn URL Ảnh Bìa</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="flex-1 px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-blue-600 font-medium"
                  />
                  {formData.imageUrl && (
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-10 h-10 rounded-xl object-cover bg-slate-50 border border-slate-200 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Mô Tả Chi Tiết Sản Phẩm (*)</label>
                <textarea
                  rows={4}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Nhập thông số kỹ thuật, tính năng nổi bật..."
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-blue-600 font-medium"
                />
              </div>
            </form>
          ) : (
            editingProduct && (
              <ProductVariantsManager
                productId={editingProduct.id}
                variants={editingProduct.variants}
                token={token}
                onRefresh={onRefresh}
              />
            )
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-white cursor-pointer transition"
          >
            Đóng
          </button>
          {activeTab === 'info' && (
            <button
              type="submit"
              form="product-form"
              disabled={isSubmitting}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Đang lưu...' : 'Lưu Sản Phẩm'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
