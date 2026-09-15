import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/apiClient.ts';
import { Button } from '../../../components/ui/Button.tsx';
import { Modal } from '../../../components/ui/Modal.tsx';
import { Badge } from '../../../components/ui/Badge.tsx';
import { Card } from '../../../components/ui/Card.tsx';
import { formatCurrency } from '../../../lib/utils.ts';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  AlertCircle,
  CheckCircle2,
  Package,
  Layers,
} from 'lucide-react';
import type {
  Product,
  Category,
  CreateProductPayload,
  ApiResponse,
  PaginatedResponse,
} from '@repo/shared-types';

export const AdminProductsView: React.FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState<CreateProductPayload>({
    name: '',
    description: '',
    price: 100000,
    inventory: 10,
    category: '',
    imageUrl: '',
  });

  const { data: productsData, isLoading } = useQuery<PaginatedResponse<Product>>({
    queryKey: ['admin', 'products', { page, search, category: categoryFilter }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search ? { search } : {}),
        ...(categoryFilter ? { category: categoryFilter } : {}),
      });
      const res = await apiClient.get<PaginatedResponse<Product>>(`/products?${params.toString()}`);
      return res.data;
    },
  });

  const { data: flatCategories = [] } = useQuery<Category[]>({
    queryKey: ['admin', 'categories', 'list'],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Category[]>>('/categories');
      return res.data.data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: CreateProductPayload) => {
      const res = await apiClient.post<ApiResponse<Product>>('/products', payload);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      showFeedback('success', 'Thêm mới sản phẩm thành công!');
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      showFeedback('error', err.response?.data?.message || 'Không thể tạo sản phẩm');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<CreateProductPayload> }) => {
      const res = await apiClient.put<ApiResponse<Product>>(`/products/${id}`, payload);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      showFeedback('success', 'Cập nhật sản phẩm thành công!');
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      showFeedback('error', err.response?.data?.message || 'Không thể cập nhật sản phẩm');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.delete<ApiResponse<null>>(`/products/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      showFeedback('success', 'Đã xóa sản phẩm khỏi hệ thống!');
      setDeleteConfirmId(null);
    },
    onError: (err: any) => {
      showFeedback('error', err.response?.data?.message || 'Không thể xóa sản phẩm');
      setDeleteConfirmId(null);
    },
  });

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: 500000,
      inventory: 20,
      category: flatCategories[0]?.name || 'Điện tử',
      imageUrl: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      description: p.description,
      price: p.price,
      inventory: p.inventory,
      category: p.category,
      imageUrl: p.imageUrl || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, payload: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const products = productsData?.data || [];
  const pagination = productsData?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="primary">Kho Hàng Toàn Diện</Badge>
            <span className="text-xs text-slate-500">Tổng: {pagination.total} sản phẩm</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100 mt-1">Quản lý Sản phẩm</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Thêm mới, sửa giá, điều chỉnh tồn kho và phân loại danh mục sản phẩm.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={handleOpenCreate} className="shrink-0">
          <Plus className="w-4 h-4 mr-1.5" />
          Thêm Sản phẩm Mới
        </Button>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl border flex items-center gap-2 text-xs ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Tìm kiếm sản phẩm theo tên..."
            className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tất cả Danh mục</option>
          {flatCategories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <Card>
        {isLoading ? (
          <div className="p-8 text-center text-slate-500 text-xs">Đang tải danh sách sản phẩm...</div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center bg-slate-950/40 rounded-xl">
            <Package className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400">Không tìm thấy sản phẩm nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700">
                <tr>
                  <th className="p-3">Sản phẩm</th>
                  <th className="p-3">Danh mục</th>
                  <th className="p-3">Giá bán</th>
                  <th className="p-3">Tồn kho</th>
                  <th className="p-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-800 overflow-hidden border border-slate-700 shrink-0">
                          <img
                            src={p.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100'}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-slate-100 truncate max-w-xs">{p.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">ID: {p.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge variant="primary">{p.category}</Badge>
                    </td>
                    <td className="p-3 font-semibold text-blue-400">{formatCurrency(p.price)}</td>
                    <td className="p-3">
                      <span
                        className={`font-semibold ${
                          p.inventory < 5
                            ? 'text-rose-400 font-bold'
                            : p.inventory < 15
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {p.inventory} cái
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEdit(p)}
                          className="h-7 px-2 text-[11px]"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setDeleteConfirmId(p.id)}
                          className="h-7 px-2 text-[11px]"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">
              Trang {pagination.page} / {pagination.totalPages} ({pagination.total} sản phẩm)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Trang trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Trang sau
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Modal Thêm / Sửa Sản phẩm */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? `Sửa sản phẩm: ${editingProduct.name}` : 'Thêm mới Sản phẩm'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Tên sản phẩm <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="VD: Tai nghe Sony WH-1000XM5, Bàn phím cơ..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Giá bán (VND) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min={0}
                value={formData.price}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, price: parseFloat(e.target.value) || 0 }))
                }
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Số lượng Tồn kho <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min={0}
                value={formData.inventory}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, inventory: parseInt(e.target.value) || 0 }))
                }
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Danh mục phân loại <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
              required
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Chọn danh mục --</option>
              {flatCategories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name} ({c.slug})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">URL Hình ảnh</label>
            <input
              type="url"
              value={formData.imageUrl || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Mô tả sản phẩm</label>
            <textarea
              rows={3}
              required
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Thông số kỹ thuật, tính năng nổi bật..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {editingProduct ? 'Cập nhật' : 'Thêm sản phẩm'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <Modal
          isOpen={Boolean(deleteConfirmId)}
          onClose={() => setDeleteConfirmId(null)}
          title="Xác nhận Xóa Sản phẩm"
          maxWidth="sm"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-300">
              Bạn có chắc chắn muốn xóa sản phẩm này khỏi hệ thống cơ sở dữ liệu?
            </p>
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setDeleteConfirmId(null)}>
                Hủy
              </Button>
              <Button
                variant="danger"
                size="sm"
                isLoading={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(deleteConfirmId)}
              >
                Xóa ngay
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
