import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Folder, ChevronRight, X, AlertCircle, Save, Check } from 'lucide-react';
import { Category } from '@repo/shared-types';
import axios from 'axios';

interface CategoriesTableProps {
  categories: Category[];
  token: string;
  onRefresh: () => void;
}

export default function CategoriesTable({ categories, token, onRefresh }: CategoriesTableProps) {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: 'folder',
    parentId: '' as string | null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      icon: 'folder',
      parentId: null,
    });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      icon: cat.icon || 'folder',
      parentId: cat.parentId || null,
    });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleNameChange = (nameVal: string) => {
    const autoSlug = nameVal
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    setFormData((prev) => ({
      ...prev,
      name: nameVal,
      slug: editingCategory ? prev.slug : autoSlug,
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
        slug: formData.slug.trim().toLowerCase(),
        description: formData.description.trim(),
        icon: formData.icon,
        parentId: formData.parentId || null,
      };

      if (editingCategory) {
        const res = await axios.put(`/api/categories/${editingCategory.id}`, payload, { headers });
        if (res.data.success) {
          setIsModalOpen(false);
          onRefresh();
        } else {
          setErrorMsg(res.data.message || 'Cập nhật danh mục thất bại');
        }
      } else {
        const res = await axios.post('/api/categories', payload, { headers });
        if (res.data.success) {
          setIsModalOpen(false);
          onRefresh();
        } else {
          setErrorMsg(res.data.message || 'Thêm danh mục thất bại');
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || err?.response?.data?.error?.message || 'Có lỗi xảy ra.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;
    setIsSubmitting(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.delete(`/api/categories/${deletingCategory.id}`, { headers });
      if (res.data.success) {
        setDeletingCategory(null);
        onRefresh();
      } else {
        setErrorMsg(res.data.message || 'Xóa danh mục thất bại');
      }
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Không thể xóa danh mục này.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Actions Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên hoặc slug danh mục..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:bg-white font-medium"
          />
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Danh Mục</span>
        </button>
      </div>

      {/* Categories Flat Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Tên Danh Mục</th>
                <th className="py-3.5 px-4">Slug</th>
                <th className="py-3.5 px-4">Icon</th>
                <th className="py-3.5 px-4">Mô tả</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                    Chưa có danh mục nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                        <Folder className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="block">{cat.name}</span>
                        {cat.parentId && (
                          <span className="text-[10px] text-slate-400 font-normal">
                            Thuộc nhóm cha: {categories.find((c) => c.id === cat.parentId)?.name || 'Cha'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">{cat.slug}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold">
                        {cat.icon || 'folder'}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-slate-500 text-[11px]">
                      {cat.description || 'Chưa có mô tả'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(cat)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition cursor-pointer border-none"
                          title="Sửa danh mục"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingCategory(cat)}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition cursor-pointer border-none"
                          title="Xóa danh mục"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Create/Edit Category */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden animate-scale-up">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-slate-900">
                {editingCategory ? 'Chỉnh Sửa Danh Mục' : 'Thêm Danh Mục Mới'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer border-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs font-medium">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-bold mb-1">Tên Danh Mục (*)</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ví dụ: Điện Thoại, Laptop, Phụ Kiện..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Slug URL (*)</label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="e.g. dien-thoai"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 font-mono outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Danh Mục Cha (Nếu có)</label>
                <select
                  value={formData.parentId || ''}
                  onChange={(e) => setFormData({ ...formData, parentId: e.target.value || null })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-blue-600 bg-white"
                >
                  <option value="">-- Không chọn (Danh mục cấp 1) --</option>
                  {categories
                    .filter((c) => c.id !== editingCategory?.id)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Tên Icon Định Dạng</label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="smartphone, laptop, watch, headphones, etc."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Mô tả</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả chi tiết nhóm danh mục..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSubmitting ? 'Đang lưu...' : 'Lưu Thay Đổi'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Popup */}
      {deletingCategory && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full border border-slate-200 p-5 shadow-xl space-y-4 animate-scale-up">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl w-fit">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Xác nhận xóa danh mục?</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Bạn có chắc chắn muốn xóa danh mục <span className="font-bold text-slate-800">"{deletingCategory.name}"</span> không? Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setDeletingCategory(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                disabled={isSubmitting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                {isSubmitting ? 'Đang xóa...' : 'Xóa Danh Mục'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
