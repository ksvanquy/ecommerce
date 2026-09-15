import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../lib/axios.ts';
import type { ApiResponse } from '../../../types/api.ts';
import type {
  Category,
  CategoryTreeNode,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from '@repo/shared-types';

/**
 * Fetch nested hierarchical category tree (for navigation, mega-menu, tree filters)
 */
export function useCategoryTree() {
  return useQuery({
    queryKey: ['categories-tree'],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<CategoryTreeNode[]>>('/categories/tree');
      return response.data.data || [];
    },
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Fetch flat list of all categories
 */
export function useCategoriesList() {
  return useQuery({
    queryKey: ['categories-list'],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Category[]>>('/categories');
      return response.data.data || [];
    },
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Backward-compatible string categories list
 */
export function useCategories() {
  return useQuery({
    queryKey: ['product-categories'],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<string[]>>('/products/categories');
      return response.data.data || [];
    },
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Mutation: Create category (Admin)
 */
export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateCategoryPayload) => {
      const response = await apiClient.post<ApiResponse<Category>>('/categories', payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories-tree'] });
      queryClient.invalidateQueries({ queryKey: ['categories-list'] });
      queryClient.invalidateQueries({ queryKey: ['product-categories'] });
    },
  });
}

/**
 * Mutation: Update category (Admin)
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateCategoryPayload }) => {
      const response = await apiClient.put<ApiResponse<Category>>(`/categories/${id}`, payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories-tree'] });
      queryClient.invalidateQueries({ queryKey: ['categories-list'] });
      queryClient.invalidateQueries({ queryKey: ['product-categories'] });
    },
  });
}

/**
 * Mutation: Delete category (Admin)
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete<ApiResponse<null>>(`/categories/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories-tree'] });
      queryClient.invalidateQueries({ queryKey: ['categories-list'] });
      queryClient.invalidateQueries({ queryKey: ['product-categories'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
