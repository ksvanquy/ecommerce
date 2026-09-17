import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Award, ExternalLink, X, AlertCircle, Save, Check } from 'lucide-react';
import { Brand } from '@repo/shared-types';
import axios from 'axios';

interface BrandsTableProps {
  brands: Brand[];
  token: string;
  onRefresh: () => void;
}

export default function BrandsTable({ brands, token, onRefresh }: BrandsTableProps) {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [deletingBrand, setDeletingBrand] = useState<Brand | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    logoUrl: '',
    description: '',
    website: '',
    country: '',
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const filteredBrands = brands.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.slug.toLowerCase().includes(search.toLowerCase()) ||
      (b.country && b.country.toLowerCase().includes(search.toLowerCase()))
  );

  const handleOpenCreateModal = () => {
    setEditingBrand(null);
    setFormData({
      name: '',
      slug: '',
      logoUrl: '',
      description: '',
      website: '',
      country: '',
      isActive: true,
    });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (b: Brand) => {
    setEditingBrand(b);
    setFormData({
      name: b.name,
      slug: b.slug,
      logoUrl: b.logoUrl || '',
      description: b.description || '',
      website: b.website || '',
      country: b.country || '',
      isActive: b.isActive ?? true,
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
      slug: editingBrand ? prev.slug : autoSlug,
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
        logoUrl: formData.logoUrl.trim(),
        description: formData.description.trim(),
        website: formData.website.trim(),
        country: formData.country.trim(),
        isActive: formData.isActive,
      };

      if (editingBrand) {
        const res = await axios.put(`/api/brands/${editingBrand.id}`, payload, { headers });
        if (res.data.success) {
          setIsModalOpen(false);
          onRefresh();
        } else {
          setErrorMsg(res.data.message || 'Cập nhật thương hiệu thất bại');
        }
      } else {
        const res = await axios.post('/api/brands', payload, { headers });
        if (res.data.success) {
          setIsModalOpen(false);
          onRefresh();
        } else {
          setErrorMsg(res.data.message || 'Thêm thương hiệu thất bại');
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || err?.response?.data?.error?.message || 'Có lỗi xảy ra.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingBrand) return;
    setIsSubmitting(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.delete(`/api/brands/${deletingBrand.id}`, { headers });
      if (res.data.success) {
        setDeletingBrand(null);
        onRefresh();
      } else {
        setErrorMsg(res.data.message || 'Xóa thương hiệu thất bại');
      }
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Không thể xóa thương hiệu này.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 font-sans">
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
            placeholder="Tìm theo tên, quốc gia, slug thương hiệu..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:bg-white font-medium"
          />
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Thương Hiệu</span>
        </button>
      </div>

      {/* Brands Flat Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Thương Hiệu</th>
                <th className="py-3.5 px-4">Slug</th>
                <th className="py-3.5 px-4">Quốc Gia</th>
                <th className="py-3.5 px-4">Website</th>
                <th className="py-3.5 px-4">Trạng Thái</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredBrands.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                    Chưa có thương hiệu nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredBrands.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                      {b.logoUrl ? (
                        <img
                          src={b.logoUrl}
                          alt={b.name}
                          className="w-8 h-8 rounded-lg object-contain bg-slate-50 border border-slate-100 shrink-0 p-1"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                          <Award className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        <span className="block font-bold">{b.name}</span>
                        {b.description && (
                          <span className="text-[10px] text-slate-400 font-normal line-clamp-1">
                            {b.description}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">{b.slug}</td>
                    <td className="py-3 px-4 text-slate-600 font-medium">{b.country || 'N/A'}</td>
                    <td className="py-3 px-4">
                      {b.website ? (
                        <a
                          href={b.website.startsWith('http') ? b.website : `https://${b.website}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1 font-mono text-[11px]"
                        >
                          <span>Website</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-slate-400 font-mono text-[11px]">N/A</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          b.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        {b.isActive ? 'Đang hoạt động' : 'Đã ẩn'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(b)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition cursor-pointer border-none"
                          title="Sửa thương hiệu"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingBrand(b)}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition cursor-pointer border-none"
                          title="Xóa thương hiệu"
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

      {/* Modal Create/Edit Brand */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden animate-scale-up">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-slate-900">
                {editingBrand ? 'Chỉnh Sửa Thương Hiệu' : 'Thêm Thương Hiệu Mới'}
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
                <label className="block text-slate-700 font-bold mb-1">Tên Thương Hiệu (*)</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ví dụ: Apple, Samsung, Asus..."
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
                  placeholder="e.g. apple"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 font-mono outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Quốc Gia</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="e.g. Mỹ, Hàn Quốc, Đài Loan"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Website</label>
                  <input
                    type="text"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://apple.com"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">URL Logo Thương Hiệu</label>
                <input
                  type="text"
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Mô tả</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả về thương hiệu..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-slate-700 font-bold cursor-pointer select-none">
                  Kích hoạt hiển thị thương hiệu này
                </label>
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
      {deletingBrand && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full border border-slate-200 p-5 shadow-xl space-y-4 animate-scale-up">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl w-fit">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Xác nhận xóa thương hiệu?</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Bạn có chắc chắn muốn xóa thương hiệu <span className="font-bold text-slate-800">"{deletingBrand.name}"</span> không? Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setDeletingBrand(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                disabled={isSubmitting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                {isSubmitting ? 'Đang xóa...' : 'Xóa Thương Hiệu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
