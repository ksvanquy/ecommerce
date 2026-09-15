import React, { useState } from 'react';
import {
  useCategoryTree,
  useCategoriesList,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '../../products/api/useCategories.ts';
import { Button } from '../../../components/ui/Button.tsx';
import { Modal } from '../../../components/ui/Modal.tsx';
import { Badge } from '../../../components/ui/Badge.tsx';
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
import type { Category, CategoryTreeNode, CreateCategoryPayload } from '@repo/shared-types';

export const AdminCategoryManagement: React.FC = () => {
  const { data: tree = [], isLoading: isLoadingTree } = useCategoryTree();
  const { data: flatCategories = [] } = useCategoriesList();

  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await updateMutation.mutateAsync({
          id: editingCategory.id,
          payload: formData,
        });
        showFeedback('success', `Đã cập nhật danh mục '${formData.name}' thành công.`);
      } else {
        await createMutation.mutateAsync(formData);
        showFeedback('success', `Đã tạo danh mục '${formData.name}' thành công.`);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      showFeedback('error', err?.response?.data?.message || 'Có lỗi xảy ra khi lưu danh mục.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      setDeleteConfirmId(null);
      showFeedback('success', 'Đã xóa danh mục thành công.');
    } catch (err: any) {
      showFeedback('error', err?.response?.data?.message || 'Có lỗi xảy ra khi xóa danh mục.');
    }
  };

  const renderIcon = (iconName?: string) => {
    switch (iconName) {
      case 'laptop':
        return <Laptop className="w-4 h-4 text-blue-500" />;
      case 'headphones':
        return <Headphones className="w-4 h-4 text-indigo-500" />;
      case 'watch':
        return <Watch className="w-4 h-4 text-amber-500" />;
      case 'keyboard':
        return <Keyboard className="w-4 h-4 text-purple-500" />;
      case 'mouse':
        return <Mouse className="w-4 h-4 text-cyan-500" />;
      case 'monitor':
        return <Monitor className="w-4 h-4 text-emerald-500" />;
      case 'smartphone':
        return <Smartphone className="w-4 h-4 text-rose-500" />;
      case 'radio':
        return <Radio className="w-4 h-4 text-orange-500" />;
      default:
        return <Folder className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-base">Quản trị Cây Danh mục Sản phẩm</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý danh mục đa cấp (Danh mục Cha &amp; Danh mục Con), cấu hình slug và thứ tự hiển thị.
          </p>
        </div>

        <Button
          id="btn-admin-add-category"
          variant="primary"
          size="sm"
          onClick={() => handleOpenCreateModal()}
          className="text-xs shrink-0"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          <span>Thêm danh mục gốc</span>
        </Button>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Tree Visualization List */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Cấu trúc Phân cấp Danh mục ({flatCategories.length} mục)
          </span>
          <span className="text-xs text-slate-500">Mô hình Adjacency Tree</span>
        </div>

        {isLoadingTree ? (
          <div className="p-8 text-center text-xs text-slate-400 animate-pulse">
            Đang tải dữ liệu cây danh mục...
          </div>
        ) : tree.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            Chưa có danh mục nào. Hãy bấm &quot;Thêm danh mục gốc&quot; để bắt đầu.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {tree.map((rootNode) => (
              <div key={rootNode.id} className="p-4 hover:bg-slate-50/60 transition">
                {/* Root Level Card */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                      {renderIcon(rootNode.icon)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{rootNode.name}</span>
                        <Badge variant="neutral" className="text-[10px]">
                          /{rootNode.slug}
                        </Badge>
                        <Badge variant="info" className="text-[10px]">
                          Cấp 1 (Gốc)
                        </Badge>
                      </div>
                      {rootNode.description && (
                        <p className="text-[11px] text-slate-500 mt-0.5">{rootNode.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenCreateModal(rootNode)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 text-xs font-medium transition flex items-center gap-1"
                      title="Thêm danh mục con"
                    >
                      <Plus className="w-3 h-3" />
                      <span className="hidden sm:inline">Thêm mục con</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(rootNode)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                      title="Chỉnh sửa"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(rootNode.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Xóa danh mục"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Subcategories (Level 2) */}
                {rootNode.children && rootNode.children.length > 0 && (
                  <div className="mt-3 pl-6 sm:pl-10 space-y-2 border-l-2 border-blue-100 ml-4">
                    {rootNode.children.map((subNode) => (
                      <div
                        key={subNode.id}
                        className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5">
                          <ChevronRight className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <div className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center shrink-0">
                            {renderIcon(subNode.icon)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-slate-800">
                                {subNode.name}
                              </span>
                              <Badge variant="neutral" className="text-[10px]">
                                /{subNode.slug}
                              </Badge>
                              <Badge variant="success" className="text-[10px]">
                                Cấp 2 (Con)
                              </Badge>
                            </div>
                            {subNode.description && (
                              <p className="text-[11px] text-slate-500 mt-0.5">{subNode.description}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(subNode)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                            title="Chỉnh sửa"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(subNode.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Xóa danh mục con"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Add / Edit Category */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Chỉnh sửa Danh mục' : 'Thêm Danh mục Mới'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tên Danh mục <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="VD: Bàn phím cơ &amp; Switch"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Đường dẫn tĩnh (Slug) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="VD: ban-phim-co"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Danh mục Cha (Parent Category)
            </label>
            <select
              value={formData.parentId || ''}
              onChange={(e) => setFormData({ ...formData, parentId: e.target.value || null })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="">-- Không chọn (Đặt làm Danh mục Gốc Cấp 1) --</option>
              {flatCategories
                .filter((c) => !editingCategory || c.id !== editingCategory.id)
                .map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.parentId ? '— ' : ''}
                    {cat.name} ({cat.parentId ? 'Cấp con' : 'Cấp gốc'})
                  </option>
                ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Chọn danh mục cha để thiết lập quan hệ cha-con đa cấp.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Icon đại diện</label>
              <select
                value={formData.icon || 'folder'}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="folder">📁 Thư mục (Folder)</option>
                <option value="laptop">💻 Laptop / Máy tính</option>
                <option value="headphones">🎧 Tai nghe (Audio)</option>
                <option value="watch">⌚ Đồng hồ / Wearable</option>
                <option value="keyboard">⌨️ Bàn phím cơ</option>
                <option value="mouse">🖱️ Chuột máy tính</option>
                <option value="monitor">🖥️ Màn hình (Display)</option>
                <option value="smartphone">📱 Điện thoại</option>
                <option value="radio">📻 Loa / Earbuds</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Thứ tự hiển thị</label>
              <input
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Mô tả danh mục</label>
            <textarea
              rows={2}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Nhập mô tả ngắn gọn về danh mục..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Hủy
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
        title="Xác nhận xóa danh mục"
        size="sm"
      >
        <div className="space-y-4 text-xs text-slate-600">
          <p>
            Bạn có chắc chắn muốn xóa danh mục này không? Nếu danh mục có các danh mục con, các mục con sẽ tự động trở thành cấp gốc.
          </p>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
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
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
            >
              Xác nhận xóa
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
