import React, { useState } from 'react';
import { Search, Plus, Trash2, Edit2, Package, Check, Save, AlertCircle, ShoppingBag, Grid } from 'lucide-react';
import { Product } from '@repo/shared-types';
import axios from 'axios';

interface ProductsViewProps {
  products: Product[];
  token: string;
  onRefresh: () => void;
}

export default function ProductsView({ products, token, onRefresh }: ProductsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStock, setEditStock] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const filtered = products.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                          p.category.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleStartEdit = (p: Product) => {
    setEditingId(p.id);
    setEditStock(p.inventory);
    setErrorMsg(null);
  };

  const handleSaveStock = async (p: Product) => {
    setIsSaving(true);
    setErrorMsg(null);
    try {
      // Gọi API cập nhật sản phẩm hiện có
      const response = await axios.put(
        `/api/products/${p.id}`,
        { inventory: editStock },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setEditingId(null);
        onRefresh();
      } else {
        setErrorMsg(response.data.message || 'Cập nhật thất bại.');
      }
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Không thể cập nhật số lượng kho.');
    } finally {
      setIsSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900">Quản lý Sản phẩm</h2>
          <p className="text-xs text-slate-500 font-medium">Kiểm kê số lượng hàng hóa và giá bán phân phối thực tế</p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-start gap-3 shadow-2xs">
          <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5 text-rose-600" />
          <p className="leading-relaxed font-semibold">{errorMsg}</p>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm sản phẩm, danh mục, thương hiệu..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 font-medium shadow-2xs"
          />
        </div>
      </div>

      {/* Grid of products */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs font-medium bg-white rounded-2xl border border-slate-200/80">
            Không tìm thấy sản phẩm nào phù hợp.
          </div>
        ) : (
          filtered.map((p) => {
            const isEditing = editingId === p.id;
            const isLowStock = p.inventory < 10;

            return (
              <div key={p.id} className="bg-white border border-slate-200/80 shadow-sm rounded-2xl p-5 space-y-4 flex flex-col justify-between relative overflow-hidden transition-all hover:border-slate-300">
                {/* Visual indicators */}
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <span className="inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 border border-slate-200 text-slate-600 capitalize">{p.category}</span>
                    <h3 className="text-xs font-bold text-slate-900 line-clamp-1" title={p.name}>{p.name}</h3>
                    <p className="text-[10px] text-slate-400 font-medium">ID: {p.id.substring(0, 8).toUpperCase()}</p>
                  </div>
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} className="w-12 h-12 rounded-xl object-contain bg-slate-50 p-1 shrink-0 border border-slate-100" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 shrink-0 border border-slate-100">
                      <Package className="w-5 h-5" />
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium block">Giá bán</span>
                    <span className="font-extrabold text-blue-600">{formatCurrency(p.price)}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-medium block">Tồn kho</span>
                    {isEditing ? (
                      <div className="flex items-center gap-1.5 mt-1">
                        <input
                          type="number"
                          value={editStock}
                          onChange={(e) => setEditStock(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-16 bg-white border border-slate-300 rounded px-1.5 py-0.5 text-xs text-slate-900 text-center font-bold outline-none focus:border-blue-600"
                        />
                        <button
                          onClick={() => handleSaveStock(p)}
                          disabled={isSaving}
                          className="p-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded cursor-pointer border-none"
                          title="Lưu số lượng"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 justify-end mt-1">
                        <span className={`font-extrabold ${isLowStock ? 'text-rose-600' : 'text-slate-900'}`}>
                          {p.inventory} chiếc
                        </span>
                        <button
                          onClick={() => handleStartEdit(p)}
                          className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded cursor-pointer border-none transition"
                          title="Cập nhật nhanh kho"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {isLowStock && !isEditing && (
                  <div className="p-2.5 bg-rose-50 text-rose-700 text-[10px] font-bold rounded-xl border border-rose-200/80 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                    <span>Cảnh báo: Kho sắp cạn, cần bổ sung gấp!</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
