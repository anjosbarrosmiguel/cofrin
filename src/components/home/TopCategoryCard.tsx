import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../contexts/themeContext';
import { getShadow } from '../../theme';
import { formatCurrencyBRL } from '../../utils/format';

// Cores do design system - Roxo
const primaryDark = '#4A2FA8';   // roxo escuro (títulos h1)
const primary = '#5B3CC4';       // roxo principal (ícones, barras)
const primaryBg = '#EDE9FF';     // fundo roxo suave
const progressBg = '#E8E6F3';    // fundo barras de progresso

interface CategoryExpense {
  categoryId: string;
  categoryName: string;
  total: number;
  icon?: string;
  color?: string;
}

interface TopCategoryCardProps {
  expenses: CategoryExpense[];
  totalExpenses: number;
  onPress?: () => void;
}

export default memo(function TopCategoryCard({ expenses, totalExpenses, onPress }: TopCategoryCardProps) {
  const { colors } = useAppTheme();

  if (!expenses || expenses.length === 0) {
    return (
      <View style={[styles.card, { backgroundColor: '#fff' }, getShadow(colors)]}>
        <Text style={[styles.title, { color: primaryDark }]}>Onde você gastou</Text>
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
          Nenhuma despesa registrada este mês
        </Text>
      </View>
    );
  }

  // Pegar a categoria com maior gasto
  const topCategory = expenses[0];
  const percentage = totalExpenses > 0 ? (topCategory.total / totalExpenses) * 100 : 0;

  // Gerar insight baseado na proporção
  const getInsight = (): string => {
    if (percentage >= 50) {
      return `Mais da metade dos gastos foi em ${topCategory.categoryName}`;
    } else if (percentage >= 30) {
      return `${Math.round(percentage)}% dos gastos em ${topCategory.categoryName}`;
    } else {
      return `Gastos distribuídos entre várias categorias`;
    }
  };

  return (
    <Pressable 
      style={[styles.card, { backgroundColor: '#fff' }, getShadow(colors)]}
      onPress={onPress}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: primaryBg }]}>
          <MaterialCommunityIcons 
            name={(topCategory.icon || 'tag') as any} 
            size={20} 
            color={primary} 
          />
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: primaryDark }]}>Onde você gastou</Text>
          <Text style={[styles.categoryName, { color: colors.textSecondary }]}>
            {topCategory.categoryName}
          </Text>
        </View>
      </View>

      {/* Valor */}
      <Text style={[styles.categoryAmount, { color: colors.text }]}>
        {formatCurrencyBRL(topCategory.total)}
      </Text>

      {/* Progress Bar */}
      <View style={[styles.progressTrack, { backgroundColor: progressBg }]}>
        <View 
          style={[
            styles.progressFill, 
            { 
              backgroundColor: primary, 
              width: `${Math.min(percentage, 100)}%` 
            }
          ]} 
        />
      </View>

      {/* Insight */}
      <Text style={[styles.insight, { color: colors.textMuted }]}>
        {getInsight()}
      </Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 14,
    marginTop: 8,
  },
  categoryName: {
    fontSize: 13,
  },
  categoryAmount: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  insight: {
    fontSize: 13,
    lineHeight: 18,
  },
});
