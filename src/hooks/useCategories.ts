// ==========================================
// HOOK DE CATEGORIAS
// ==========================================

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/authContext';
import { useTransactionRefresh } from '../contexts/transactionRefreshContext';
import {
    Category,
    CreateCategoryInput,
    UpdateCategoryInput,
    CategoryType,
} from '../types/firebase';
import * as categoryService from '../services/categoryService';

export function useCategories(type?: CategoryType) {
  const { user } = useAuth();
  const { refreshKey } = useTransactionRefresh();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar categorias
  const loadCategories = useCallback(async () => {
    if (!user?.uid) {
      setCategories([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let data: Category[];
      if (type) {
        data = await categoryService.getCategoriesByType(user.uid, type);
      } else {
        data = await categoryService.getCategories(user.uid);
      }

      setCategories(data);
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
      setError('Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  }, [user?.uid, type]);

  // Carregar ao montar e quando refreshKey mudar
  useEffect(() => {
    loadCategories();
  }, [loadCategories, refreshKey]);

  // Criar categoria
  const createCategory = async (data: CreateCategoryInput): Promise<Category | null> => {
    if (!user?.uid) return null;

    try {
      const newCategory = await categoryService.createCategory(user.uid, data);
      setCategories(prev => [...prev, newCategory].sort((a, b) => a.name.localeCompare(b.name)));
      return newCategory;
    } catch (err) {
      console.error('Erro ao criar categoria:', err);
      setError('Erro ao criar categoria');
      return null;
    }
  };

  // Atualizar categoria
  const updateCategory = async (categoryId: string, data: UpdateCategoryInput): Promise<boolean> => {
    try {
      await categoryService.updateCategory(categoryId, data);
      setCategories(prev => 
        prev.map(cat => cat.id === categoryId ? { ...cat, ...data } : cat)
      );
      return true;
    } catch (err) {
      console.error('Erro ao atualizar categoria:', err);
      setError('Erro ao atualizar categoria');
      return false;
    }
  };

  // Deletar categoria
  const deleteCategory = async (categoryId: string): Promise<boolean> => {
    try {
      await categoryService.deleteCategory(categoryId);
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
      return true;
    } catch (err) {
      console.error('Erro ao deletar categoria:', err);
      setError('Erro ao deletar categoria');
      return false;
    }
  };

  // Criar categorias padrão
  const createDefaultCategories = async (): Promise<boolean> => {
    if (!user?.uid) return false;

    try {
      await categoryService.createDefaultCategories(user.uid);
      await loadCategories();
      return true;
    } catch (err) {
      console.error('Erro ao criar categorias padrão:', err);
      setError('Erro ao criar categorias padrão');
      return false;
    }
  };

  // Filtrar por tipo
  const expenseCategories = categories.filter(c => c.type === 'expense');
  const incomeCategories = categories.filter(c => c.type === 'income');

  // Criar subcategoria
  const createSubcategory = async (parentId: string, data: Omit<CreateCategoryInput, 'parentId'>): Promise<Category | null> => {
    if (!user?.uid) return null;

    try {
      const newSubcategory = await categoryService.createSubcategory(user.uid, parentId, data);
      // Recarregar todas as categorias para atualizar estado do pai
      await loadCategories();
      return newSubcategory;
    } catch (err) {
      console.error('Erro ao criar subcategoria:', err);
      setError('Erro ao criar subcategoria');
      return null;
    }
  };

  // Buscar subcategorias de uma categoria
  const getSubcategories = async (parentId: string): Promise<Category[]> => {
    if (!user?.uid) return [];

    try {
      return await categoryService.getSubcategories(user.uid, parentId);
    } catch (err) {
      console.error('Erro ao buscar subcategorias:', err);
      return [];
    }
  };

  // Deletar categoria e subcategorias
  const deleteCategoryWithSubs = async (categoryId: string): Promise<boolean> => {
    if (!user?.uid) return false;

    try {
      await categoryService.deleteCategoryAndSubcategories(user.uid, categoryId);
      await loadCategories();
      return true;
    } catch (err) {
      console.error('Erro ao deletar categoria:', err);
      setError('Erro ao deletar categoria');
      return false;
    }
  };

  // Atualizar subcategoria
  const updateSubcategory = async (
    subcategoryId: string,
    data: { name?: string; icon?: string; parentId?: string }
  ): Promise<boolean> => {
    if (!user?.uid) return false;

    try {
      await categoryService.updateSubcategory(subcategoryId, data);
      await loadCategories();
      return true;
    } catch (err) {
      console.error('Erro ao atualizar subcategoria:', err);
      setError('Erro ao atualizar subcategoria');
      return false;
    }
  };

  return {
    categories,
    expenseCategories,
    incomeCategories,
    loading,
    error,
    refresh: loadCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    createDefaultCategories,
    // Hierarquia
    createSubcategory,
    getSubcategories,
    deleteCategoryWithSubs,
    updateSubcategory,
  };
}
