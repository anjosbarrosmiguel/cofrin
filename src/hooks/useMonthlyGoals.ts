import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/authContext';
import type { Goal } from '../types/firebase';
import {
    getCurrentMonthlyGoals,
    createMonthlyGoal,
    updateMonthlyGoal,
    deleteMonthlyGoal,
    updateMonthlyGoalsProgress,
    hasMonthlyGoalsAlert,
} from '../services/monthlyGoalService';

export function useMonthlyGoals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasAlert, setHasAlert] = useState(false);

  const loadGoals = async () => {
    if (!user?.uid) {
      setGoals([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Atualizar progresso antes de carregar
      await updateMonthlyGoalsProgress(user.uid);
      // Carregar metas
      const monthlyGoals = await getCurrentMonthlyGoals(user.uid);
      setGoals(monthlyGoals);
      // Verificar alertas
      const alert = await hasMonthlyGoalsAlert(user.uid);
      setHasAlert(alert);
    } catch (error) {
      console.error('Erro ao carregar metas mensais:', error);
      setGoals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, [user?.uid]);

  const create = async (
    categoryId: string,
    goalType: 'expense' | 'income',
    targetAmount: number,
    categoryName: string
  ) => {
    if (!user?.uid) return { success: false, error: 'Usuário não autenticado' };

    try {
      await createMonthlyGoal(user.uid, categoryId, goalType, targetAmount, categoryName);
      await loadGoals();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Erro ao criar meta mensal' };
    }
  };

  const remove = async (goalId: string): Promise<boolean> => {
    try {
      await deleteMonthlyGoal(goalId);
      await loadGoals();
      return true;
    } catch (error) {
      console.error('Erro ao deletar meta mensal:', error);
      return false;
    }
  };

  const update = async (goalId: string, targetAmount: number) => {
    if (!user?.uid) return { success: false, error: 'Usuário não autenticado' };

    console.log('Atualizando meta mensal:', { goalId, targetAmount });

    try {
      await updateMonthlyGoal(goalId, targetAmount);
      // Pequeno delay para garantir sincronização do Firestore
      await new Promise(resolve => setTimeout(resolve, 100));
      await loadGoals();
      console.log('Meta mensal atualizada com sucesso');
      return { success: true };
    } catch (error: any) {
      console.error('Erro ao atualizar meta mensal:', error);
      return { success: false, error: error.message || 'Erro ao atualizar meta mensal' };
    }
  };

  const refresh = async () => {
    await loadGoals();
  };

  return {
    goals,
    loading,
    hasAlert,
    create,
    update,
    remove,
    refresh,
  };
}
