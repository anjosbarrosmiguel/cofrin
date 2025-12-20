import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../contexts/themeContext';
import { spacing, borderRadius, getShadow } from '../../theme';
import { formatCurrencyBRL } from '../../utils/format';

type HealthStatus = 'ok' | 'warning' | 'risk';

interface FinancialHealthCardProps {
  income: number;
  expense: number;
  balance: number;
}

export default function FinancialHealthCard({ income, expense, balance }: FinancialHealthCardProps) {
  const { colors } = useAppTheme();

  // Calcular status da saúde financeira
  const getHealthStatus = (): { status: HealthStatus; diagnosis: string; tip: string } => {
    // Se não há dados suficientes, retorna status neutro
    if (income === 0 && expense === 0) {
      return {
        status: 'ok',
        diagnosis: 'Registre suas movimentações para análise',
        tip: 'Adicione receitas e despesas para acompanhar sua saúde financeira'
      };
    }

    const expenseRatio = income > 0 ? (expense / income) * 100 : (expense > 0 ? 100 : 0);
    
    if (balance >= 0 && expenseRatio <= 70) {
      return {
        status: 'ok',
        diagnosis: 'Suas finanças estão equilibradas',
        tip: 'Continue reservando parte da renda para objetivos futuros'
      };
    } else if (expenseRatio > 70 && expenseRatio <= 95) {
      return {
        status: 'warning',
        diagnosis: 'Você está gastando quase tudo que ganha',
        tip: 'Tente reduzir gastos desnecessários para criar uma reserva'
      };
    } else {
      return {
        status: 'risk',
        diagnosis: 'Suas despesas superam a renda',
        tip: 'Priorize apenas gastos essenciais e busque aumentar sua renda'
      };
    }
  };

  const health = getHealthStatus();

  const statusConfig = {
    ok: {
      icon: 'check-circle',
      color: colors.success,      // verde elegante
      bgColor: colors.successBg,
      label: 'Tudo certo'
    },
    warning: {
      icon: 'alert-circle',
      color: colors.warning,      // laranja atenção
      bgColor: colors.warningBg,
      label: 'Atenção'
    },
    risk: {
      icon: 'alert-octagon',
      color: colors.danger,       // laranja escuro (SEM vermelho)
      bgColor: colors.dangerBg,
      label: 'Risco'
    }
  };

  const config = statusConfig[health.status];

  const showExplanation = () => {
    const expenseRatio = income > 0 ? (expense / income) * 100 : 0;
    
    Alert.alert(
      'Como calculamos sua saúde financeira',
      `Analisamos a relação entre suas receitas e despesas do mês:\n\n` +
      `📊 Receitas: ${formatCurrencyBRL(income)}\n` +
      `📊 Despesas: ${formatCurrencyBRL(expense)}\n` +
      `📊 Proporção: ${expenseRatio.toFixed(1)}%\n\n` +
      `✅ Tudo certo: até 70% da renda comprometida\n` +
      `⚠️ Atenção: 70% a 95% da renda comprometida\n` +
      `🚨 Risco: mais de 95% da renda comprometida`,
      [{ text: 'Entendi' }]
    );
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card }, getShadow(colors)]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Saúde financeira do mês</Text>
      </View>

      {/* Status Badge */}
      <View style={[styles.statusBadge, { backgroundColor: config.bgColor }]}>
        <MaterialCommunityIcons name={config.icon as any} size={20} color={config.color} />
        <Text style={[styles.statusLabel, { color: config.color }]}>{config.label}</Text>
      </View>

      {/* Diagnosis */}
      <Text style={[styles.diagnosis, { color: colors.text }]}>{health.diagnosis}</Text>

      {/* Tip */}
      <View style={[styles.tipContainer, { backgroundColor: colors.primaryBg }]}>
        <MaterialCommunityIcons name="lightbulb-on-outline" size={16} color={colors.primary} />
        <Text style={[styles.tipText, { color: colors.text }]}>{health.tip}</Text>
      </View>

      {/* Info Button */}
      <Pressable style={styles.infoButton} onPress={showExplanation}>
        <MaterialCommunityIcons name="information-outline" size={16} color={colors.textMuted} />
        <Text style={[styles.infoText, { color: colors.textMuted }]}>
          Como isso é calculado?
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  header: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  diagnosis: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  tipContainer: {
    flexDirection: 'row',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  infoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.xs,
  },
  infoText: {
    fontSize: 12,
  },
});
