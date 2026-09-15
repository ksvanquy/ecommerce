import { categoriesRepository } from './categories.repository.ts';
import { AppError } from '../shared/errors/AppError.ts';
import type {
  Category,
  CategoryTreeNode,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from '@repo/shared-types';

export class CategoriesService {
  async getCategoryTree(): Promise<CategoryTreeNode[]> {
    const flatList = await categoriesRepository.findAll();

    const nodeMap = new Map<string, CategoryTreeNode>();
    const rootNodes: CategoryTreeNode[] = [];

    // 1. Initialize all nodes
    flatList.forEach((c) => {
      nodeMap.set(c.id, {
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description || undefined,
        parentId: c.parentId,
        icon: c.icon || 'folder',
        level: c.level,
        sortOrder: c.sortOrder,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
        children: [],
      });
    });

    // 2. Build tree structure based on parentId
    flatList.forEach((c) => {
      const node = nodeMap.get(c.id)!;
      if (c.parentId && nodeMap.has(c.parentId)) {
        const parentNode = nodeMap.get(c.parentId)!;
        parentNode.children = parentNode.children || [];
        parentNode.children.push(node);
      } else {
        rootNodes.push(node);
      }
    });

    // 3. Sort nodes by sortOrder
    const sortNodes = (nodes: CategoryTreeNode[]) => {
      nodes.sort((a, b) => a.sortOrder - b.sortOrder);
      nodes.forEach((n) => {
        if (n.children && n.children.length > 0) {
          sortNodes(n.children);
        }
      });
    };

    sortNodes(rootNodes);
    return rootNodes;
  }

  async getAllCategories(): Promise<Category[]> {
    const flatList = await categoriesRepository.findAll();
    return flatList.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description || undefined,
      parentId: c.parentId,
      icon: c.icon || 'folder',
      level: c.level,
      sortOrder: c.sortOrder,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }));
  }

  async getCategoryByIdOrSlug(idOrSlug: string): Promise<Category> {
    let row = await categoriesRepository.findById(idOrSlug);
    if (!row) {
      row = await categoriesRepository.findBySlug(idOrSlug);
    }

    if (!row) {
      throw new AppError(`Không tìm thấy danh mục: ${idOrSlug}`, 404, 'CATEGORY_NOT_FOUND');
    }

    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description || undefined,
      parentId: row.parentId,
      icon: row.icon || 'folder',
      level: row.level,
      sortOrder: row.sortOrder,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  async createCategory(payload: CreateCategoryPayload): Promise<Category> {
    const existing = await categoriesRepository.findBySlug(payload.slug);
    if (existing) {
      throw new AppError(`Đường dẫn tĩnh (slug) '${payload.slug}' đã tồn tại.`, 409, 'SLUG_EXISTS');
    }

    let level = 1;
    if (payload.parentId) {
      const parent = await categoriesRepository.findById(payload.parentId);
      if (!parent) {
        throw new AppError('Danh mục cha không tồn tại.', 400, 'INVALID_PARENT');
      }
      level = parent.level + 1;
    }

    const id = `cat_${payload.slug.replace(/[^a-z0-9]/g, '_')}_${Date.now().toString(36)}`;
    const now = new Date();

    const created = await categoriesRepository.create({
      id,
      name: payload.name,
      slug: payload.slug,
      description: payload.description || '',
      parentId: payload.parentId || null,
      icon: payload.icon || 'folder',
      level,
      sortOrder: payload.sortOrder || 0,
      createdAt: now,
      updatedAt: now,
    });

    return {
      id: created.id,
      name: created.name,
      slug: created.slug,
      description: created.description || undefined,
      parentId: created.parentId,
      icon: created.icon || 'folder',
      level: created.level,
      sortOrder: created.sortOrder,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    };
  }

  async updateCategory(id: string, payload: UpdateCategoryPayload): Promise<Category> {
    const current = await categoriesRepository.findById(id);
    if (!current) {
      throw new AppError('Không tìm thấy danh mục cần cập nhật.', 404, 'CATEGORY_NOT_FOUND');
    }

    if (payload.parentId && payload.parentId === id) {
      throw new AppError('Danh mục không thể làm cha của chính nó.', 400, 'CIRCULAR_DEPENDENCY');
    }

    let level = current.level;
    if (payload.parentId !== undefined) {
      if (payload.parentId) {
        const parent = await categoriesRepository.findById(payload.parentId);
        if (!parent) {
          throw new AppError('Danh mục cha không tồn tại.', 400, 'INVALID_PARENT');
        }
        level = parent.level + 1;
      } else {
        level = 1;
      }
    }

    const updated = await categoriesRepository.update(id, {
      ...payload,
      level,
    });

    if (!updated) {
      throw new AppError('Cập nhật danh mục thất bại.', 500, 'UPDATE_FAILED');
    }

    return {
      id: updated.id,
      name: updated.name,
      slug: updated.slug,
      description: updated.description || undefined,
      parentId: updated.parentId,
      icon: updated.icon || 'folder',
      level: updated.level,
      sortOrder: updated.sortOrder,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  }

  async deleteCategory(id: string): Promise<boolean> {
    const current = await categoriesRepository.findById(id);
    if (!current) {
      throw new AppError('Không tìm thấy danh mục cần xóa.', 404, 'CATEGORY_NOT_FOUND');
    }

    return await categoriesRepository.delete(id);
  }
}

export const categoriesService = new CategoriesService();
