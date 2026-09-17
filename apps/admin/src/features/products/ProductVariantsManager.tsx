import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Check, X, Layers, Save, AlertCircle } from 'lucide-react';
import { ProductVariant } from '@repo/shared-types';
import axios from 'axios';

interface ProductVariantsManagerProps {
  productId: string;
  variants?: ProductVariant[];
  token: string;
  onRefresh: () => void;
}

export default function ProductVariantsManager({
  productId,
  variants = [],
  token,
  onRefresh,
}: ProductVariantsManagerProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    price: 0,
    originalPrice: 0,
    inventory: 10,
    colorName: '',
    colorCode: '#2563eb',
    specSummary: '',
    imageUrl: '',
    isDefault: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setEditingVariant(null);
    setFormData({
      name: '',
      sku: `SKU-${Date.now().toString().slice(-6)}`,
      price: 0,
      originalPrice: 0,
      inventory: 10,
      colorName: '',
      colorCode: '#2563eb',
      specSummary: '',
      imageUrl: '',
      isDefault: variants.length === 0,
    });
    setErrorMsg(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (v: ProductVariant) => {
    setEditingVariant(v);
    setFormData({
      name: v.name,
      sku: v.sku,
      price: v.price,
      originalPrice: v.originalPrice || 0,
      inventory: v.inventory,
      colorName: v.colorName || '',
      colorCode: v.colorCode || '#2563eb',
      specSummary: v.specSummary || '',
      imageUrl: v.imageUrl || '',
      isDefault: v.isDefault,
    });
    setErrorMsg(null);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const payload = {
        name: formData.name.trim(),
        sku: formData.sku.trim().toUpperCase(),
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
        inventory: Number(formData.inventory),
        colorName: formData.colorName.trim() || undefined,
        colorCode: formData.colorCode.trim() || undefined,
        specSummary: formData.specSummary.trim() || undefined,
        imageUrl: formData.imageUrl.trim() || undefined,
        isDefault: formData.isDefault,
      };

      if (editingVariant) {
        await axios.put(`/api/products/${productId}/variants/${editingVariant.id}`, payload, { headers });
      } else {
        await axios.post(`/api/products/${productId}/variants`, payload, { headers });
      }

      setIsFormOpen(false);
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Không thể lưu phiên bản biến thể.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (variantId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa biến thể này?')) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`/api/products/${productId}/variants/${variantId}`, { headers });
      onRefresh();
    } catch (err: any) {
      alert('Không thể xóa biến thể.');
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <div className="space-y-4 font-sans pt-3 border-t border-slate-100">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>Biến Thể Sản Phẩm ({variants.length})</span>
          </h4>
          <p className="text-[10px] text-slate-500 font-medium">Cấu hình RAM/Màu sắc/Giá/SKU riêng cho từng phiên bản</p>
        </div>

        {!isFormOpen && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm Biến Thể</span>
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form Add/Edit Variant */}
      {isFormOpen && (
        <div className="bg-slate-50/80 border border-slate-200 p-4 rounded-2xl space-y-3 text-xs">
          <div className="flex justify-between items-center pb-2 border-b border-slate-200/80">
            <span className="font-bold text-slate-900">
              {editingVariant ? 'Chỉnh Sửa Biến Thể' : 'Tạo Biến Thể Mới'}
            </span>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="text-slate-400 hover:text-slate-600 cursor-pointer border-none"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Tên Biến Thể (*)</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ví dụ: 8GB RAM / 256GB SSD - Xám Titan"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Mã SKU (*)</label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="SKU-10023"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-mono text-slate-900 outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Giá Bán (VND) (*)</label>
              <input
                type="number"
                required
                min={0}
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-bold text-blue-600 outline-none focus:border-blue-600"
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
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-bold outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Tên Màu Sắc / Thông Số</label>
              <input
                type="text"
                value={formData.colorName}
                onChange={(e) => setFormData({ ...formData, colorName: e.target.value })}
                placeholder="Titan Tự Nhiên, Đen Nhám..."
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Mô Tả Tóm Tắt Cấu Hình</label>
              <input
                type="text"
                value={formData.specSummary}
                onChange={(e) => setFormData({ ...formData, specSummary: e.target.value })}
                placeholder="Màn hình OLED, Chip A17 Pro..."
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200/80">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-xl font-bold cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 cursor-pointer flex items-center gap-1"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Đang lưu...' : 'Lưu Biến Thể'}</span>
            </button>
          </div>
        </div>
      )}

      {/* List of existing variants */}
      <div className="space-y-2">
        {variants.length === 0 ? (
          <div className="p-4 text-center text-slate-400 text-xs font-medium bg-slate-50 rounded-xl border border-dashed border-slate-200">
            Chưa có biến thể nào được tạo cho sản phẩm này.
          </div>
        ) : (
          variants.map((v) => (
            <div
              key={v.id}
              className="p-3 bg-white border border-slate-200/80 rounded-xl flex items-center justify-between gap-3 text-xs shadow-2xs hover:border-slate-300"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{v.name}</span>
                  <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 font-mono text-[10px]">
                    {v.sku}
                  </span>
                  {v.isDefault && (
                    <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[9px] font-extrabold">
                      Mặc định
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-3">
                  <span>Giá: <strong className="text-blue-600">{formatCurrency(v.price)}</strong></span>
                  <span>Tồn kho: <strong>{v.inventory} chiếc</strong></span>
                  {v.specSummary && <span>Cấu hình: {v.specSummary}</span>}
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(v)}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg cursor-pointer border-none"
                  title="Sửa biến thể"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(v.id)}
                  className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg cursor-pointer border-none"
                  title="Xóa biến thể"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
