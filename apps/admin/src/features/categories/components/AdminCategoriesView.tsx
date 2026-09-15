import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/apiClient.ts';
import { Button } from '../../../components/ui/Button.tsx';
import { Modal } from '../../../components/ui/Modal.tsx';
import { Badge } from '../../../components/ui/Badge.tsx';
import { Card } from '../../../components/ui/Card.tsx';
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  ChevronRight,
  Folder,
  Layers,
  AlertCircle,
  CheckCircle2,
  Laptop,
  Headphones,
  Watch,
  Keyboard,
  Monitor,
  Smartphone,
  Radio,
  Mouse,
} from 'lucide-react';
import type {
  Category,
  CategoryTreeNode,
  CreateCategoryPayload,
  ApiResponse,
} from '@repo/shared-types';

export const AdminCategoriesView: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: tree = [], isLoading: isLoadingTree } = useQuery<CategoryTreeNode[]>({
    queryKey: ['admin', 'categories', 'tree'],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<CategoryTreeNode[]>>('/categories/tree');
      return res.data.data || [];
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
    mutationFn: async (payload: CreateCategoryPayload) => {
      const res = await apiClient.post<ApiResponse<Category>>('/categories', payload);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      showFeedback('success', 'Tạo danh mục mới thành công!');
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      showFeedback('error', err.response?.data?.message || 'Không thể tạo danh mục');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<CreateCategoryPayload> }) => {
      const res = await apiClient.put<ApiResponse<Category>>(`/categories/${id}`, payload);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      showFeedback('success', 'Cập nhật danh mục thành công!');
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      showFeedback('error', err.response?.data?.message || 'Không thể cập nhật danh mục');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.delete<ApiResponse<null>>(`/categories/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      showFeedback('success', 'Đã xóa danh mục khỏi hệ thống!');
      setDeleteConfirmId(null);
    },
    onError: (err: any) => {
      showFeedback('error', err.response?.data?.message || 'Không thể xóa danh mục');
      setDeleteConfirmId(null);
    },
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState<CreateCategoryPayload>({
    name: '',
    slug: '',
    description: '',
    parentId: null,
    icon: 'folder',
    sortOrder: 0,
  });

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleOpenCreateModal = (parent?: CategoryTreeNode) => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      parentId: parent ? parent.id : null,
      icon: 'folder',
      sortOrder: 0,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      parentId: cat.parentId || null,
      icon: cat.icon || 'folder',
      sortOrder: cat.sortOrder || 0,
    });
    setIsModalOpen(true);
  };

  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');

    setFormData((prev) => ({
      ...prev,
      name,
      slug: editingCategory ? prev.slug : slug,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      updateMutation.mutate({
        id: editingCategory.id,
        payload: formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const renderIcon = (iconName?: string) => {
    switch (iconName) {
      case 'laptop':
        return <Laptop className="w-4 h-4 text-blue-400" />;
      case 'headphones':
        return <Headphones className="w-4 h-4 text-indigo-400" />;
      case 'watch':
        return <Watch className="w-4 h-4 text-emerald-400" />;
      case 'keyboard':
        return <Keyboard className="w-4 h-4 text-amber-400" />;
      case 'mouse':
        return <Mouse className="w-4 h-4 text-rose-400" />;
      case 'monitor':
        return <Monitor className="w-4 h-4 text-cyan-400" />;
      case 'smartphone':
        return <Smartphone className="w-4 h-4 text-purple-400" />;
      case 'radio':
        return <Radio className="w-4 h-4 text-teal-400" />;
      default:
        return <Folder className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="primary">Module Quản trị Cây Danh mục</Badge>
            <span className="text-xs text-slate-500">Cấu trúc Adjacency List Đa cấp</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100 mt-1">Quản lý Danh mục Sản phẩm</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Thiết lập danh mục gốc và danh mục con phân cấp tự động đồng bộ hóa trên Mega Menu.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => handleOpenCreateModal()}
          className="shrink-0"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Tạo Danh mục Gốc mới
        </Button>
      </div>

      {/* Notification Feedback */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border flex items-center gap-2 text-xs animate-in fade-in duration-150 ${
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

      {/* Main Category Tree List */}
      <Card
        title={`Cây Danh mục Hệ thống (${tree.length} Ngành hàng gốc)`}
        subtitle="Quản lý cấu trúc danh mục cha - con và thứ tự hiển thị"
      >
        {isLoadingTree ? (
          <div className="p-8 text-center text-slate-500 text-xs">Đang tải dữ liệu cây danh mục...</div>
        ) : tree.length === 0 ? (
          <div className="p-8 text-center bg-slate-950/50 rounded-xl border border-slate-800/80">
            <FolderTree className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-300">Chưa có danh mục nào trong hệ thống</p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleOpenCreateModal()}
              className="mt-3 text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Tạo danh mục đầu tiên
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {tree.map((root) => (
              <div
                key={root.id}
                className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40"
              >
                {/* Root Category Row */}
                <div className="p-3.5 bg-slate-800/50 flex items-center justify-between gap-3 border-b border-slate-800/60">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                      {renderIcon(root.icon)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-100 truncate">{root.name}</h4>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                          /{root.slug}
                        </span>
                        <Badge variant="primary">Gốc (Cấp 1)</Badge>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {root.description || 'Không có mô tả'} • Thứ tự: {root.sortOrder}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenCreateModal(root)}
                      className="text-[11px] py-1 px-2.5 h-7"
                      title="Thêm danh mục con"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Thêm con
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEditModal(root)}
                      className="text-[11px] py-1 px-2 h-7"
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setDeleteConfirmId(root.id)}
                      className="text-[11px] py-1 px-2 h-7"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* Children Subcategories Rows */}
                {root.children && root.children.length > 0 ? (
                  <div className="divide-y divide-slate-800/50 pl-6 sm:pl-8 bg-slate-900/30">
                    {root.children.map((sub) => (
                      <div
                        key={sub.id}
                        className="p-3 flex items-center justify-between gap-3 hover:bg-slate-800/30 transition"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                          <div className="w-7 h-7 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-center justify-center shrink-0">
                            {renderIcon(sub.icon)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h5 className="text-xs font-semibold text-slate-200 truncate">
                                {sub.name}
                              </h5>
                              <span className="text-[10px] font-mono text-slate-500">/{sub.slug}</span>
                              <Badge variant="neutral">Con (Cấp 2)</Badge>
                            </div>
                            <p className="text-[10px] text-slate-400 truncate">
                              {sub.description || 'Không có mô tả'} • Thứ tự: {sub.sortOrder}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEditModal(sub)}
                            className="text-[10px] py-1 px-2 h-6"
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setDeleteConfirmId(sub.id)}
                            className="text-[10px] py-1 px-2 h-6"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 pl-8 text-[11px] text-slate-500 italic">
                    Chưa có danh mục con nào.
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Modal Tạo / Sửa Danh mục */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? `Chỉnh sửa: ${editingCategory.name}` : 'Thêm mới Danh mục'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Tên Danh mục <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="VD: Linh kiện PC, Chuột Gaming, Tai nghe..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Slug URL <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
              placeholder="vd: linh-kien-pc, chuot-gaming"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Danh mục Cha (Cấp bậc)</label>
            <select
              value={formData.parentId || ''}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, parentId: e.target.value || null }))
              }
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Danh mục Gốc (Cấp 1 - Root Category) --</option>
              {flatCategories
                .filter((c) => !editingCategory || c.id !== editingCategory.id)
                .map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({cat.slug})
                  </option>
                ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Biểu tượng (Icon)</label>
              <select
                value={formData.icon || 'folder'}
                onChange={(e) => setFormData((prev) => ({ ...prev, icon: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="folder">Thư mục (Folder)</option>
                <option value="laptop">Laptop / Máy tính</option>
                <option value="headphones">Tai nghe (Headphones)</option>
                <option value="watch">Đồng hồ thông minh</option>
                <option value="keyboard">Bàn phím cơ</option>
                <option value="mouse">Chuột máy tính</option>
                <option value="monitor">Màn hình hiển thị</option>
                <option value="smartphone">Điện thoại di động</option>
                <option value="radio">Thiết bị âm thanh</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Thứ tự ưu tiên</label>
              <input
                type="number"
                value={formData.sortOrder || 0}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))
                }
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Mô tả ngắn</label>
            <textarea
              rows={2}
              value={formData.description || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Mô tả ngành hàng và phạm vi sản phẩm..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {editingCategory ? 'Lưu cập nhật' : 'Tạo danh mục'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Xác nhận Xóa */}
      {deleteConfirmId && (
        <Modal
          isOpen={Boolean(deleteConfirmId)}
          onClose={() => setDeleteConfirmId(null)}
          title="Xác nhận Xóa Danh mục"
          maxWidth="sm"
        >
          <div className="space-y-4">
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Hành động này không thể hoàn tác!</p>
                <p className="mt-1">
                  Nếu xóa danh mục gốc, toàn bộ danh mục con trực thuộc cũng sẽ bị xóa.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteConfirmId(null)}
              >
                Hủy
              </Button>
              <Button
                variant="danger"
                size="sm"
                isLoading={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(deleteConfirmId)}
              >
                Xác nhận Xóa
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
