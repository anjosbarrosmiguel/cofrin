import { memo } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatCurrencyBRL } from '../../utils/format';
import { useAppTheme } from '../../contexts/themeContext';
import { spacing, borderRadius, getShadow } from '../../theme';

interface Props {
  icon?: string; // letter or emoji
  title: string;
  account?: string;
  toAccountName?: string; // Para transferências - conta destino
  amount: number; // numeric value; positive = income, negative = expense
  type?: 'received' | 'paid' | 'transfer';
  category?: string;
  categoryIcon?: string;
  status?: 'pending' | 'completed' | 'cancelled';
  goalName?: string; // Se for aporte em meta
  isLocked?: boolean; // Se for pagamento de fatura (não pode ser editado)
  isLastInGroup?: boolean; // Se é o último item do grupo de data
  onPress?: () => void;
  onEdit?: () => void;
  onStatusPress?: () => void;
}

function TransactionItemComponent({ 
  icon = '◻', 
  title, 
  account, 
  toAccountName,
  amount, 
  type, 
  category,
  categoryIcon,
  status = 'completed',
  goalName,
  isLocked = false,
  isLastInGroup = false,
  onPress,
  onEdit,
  onStatusPress,
}: Props) {
  const { colors } = useAppTheme();
  
  // Cores específicas para cada tipo de transação (usando theme tokens)
  const incomeColor = colors.income;  // Verde elegante
  const expenseColor = colors.expense; // Laranja escuro (sem vermelho)
  const transferColor = colors.textMuted; // Cinza
  const goalColor = colors.primary; // Cor da meta (roxo)
  
  const getColor = () => {
    if (goalName) return goalColor; // Aporte em meta usa cor primária
    if (type === 'transfer') return transferColor;
    if (type === 'paid') return expenseColor;
    return incomeColor; // type === 'received'
  };
  
  const color = isLocked ? colors.textMuted : getColor();
  const initial = title.charAt(0).toUpperCase();

  // Subtítulo: para transferência mostra apenas conta origem, para outros mostra categoria + conta
  const subtitle = goalName 
    ? `Meta • ${account || ''}`.replace(/ • $/, '')
    : type === 'transfer'
      ? account || 'Transferência'
      : [category, account].filter(Boolean).join(' • ');
  
  // Cor e ícone do status
  const statusColor = status === 'completed' ? colors.success : colors.textMuted;
  const statusIcon = status === 'completed' ? 'thumb-up' : 'thumb-down';

  // Determinar ícone a ser exibido
  const renderIcon = () => {
    if (goalName) {
      return <MaterialCommunityIcons name="flag-checkered" size={18} color={color} />;
    }
    if (type === 'transfer') {
      return <MaterialCommunityIcons name="swap-horizontal" size={18} color={color} />;
    }
    if (categoryIcon) {
      return <MaterialCommunityIcons name={categoryIcon as any} size={18} color={color} />;
    }
    return <Text style={[styles.iconLabel, { color }]}>{initial}</Text>;
  };

  return (
    <Pressable
      onPress={isLocked ? undefined : (onEdit || onPress)}
      disabled={isLocked}
      style={({ pressed }) => [
        styles.card,
        { 
          backgroundColor: isLocked ? colors.grayLight : colors.card,
          opacity: isLocked ? 0.7 : 1,
        },
        getShadow(colors, 'sm'),
        pressed && { backgroundColor: colors.grayLight },
      ]}
    >
      {/* Ícone da categoria ou transferência */}
      <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
        {renderIcon()}
      </View>
      
      {/* Conteúdo central - Título e Subtítulo */}
      <View style={styles.content}>
        <Text 
          style={[
            styles.title, 
            { color: status === 'pending' ? colors.textMuted : colors.text }
          ]} 
          numberOfLines={2}
        >
          {title}
          {isLocked && (
            <>
              <Text> </Text>
              <MaterialCommunityIcons name="lock" size={11} color={colors.textMuted} />
            </>
          )}
        </Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: colors.textMuted }]} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
        {isLocked && (
          <Text style={[styles.lockedLabel, { color: colors.textMuted }]}>
            Pagamento de fatura
          </Text>
        )}
      </View>
      
      {/* Coluna direita - Valor e ícone de feedback */}
      <View style={styles.rightColumn}>
        <Text style={[styles.amount, { color: status === 'pending' ? colors.textMuted : color }]}>
          {formatCurrencyBRL(amount)}
        </Text>
        {!isLocked && onStatusPress && (
          <Pressable
            onPress={onStatusPress}
            hitSlop={10}
            style={({ pressed }) => [
              styles.feedbackButton,
              { opacity: pressed ? 0.5 : 1 }
            ]}
          >
            <MaterialCommunityIcons 
              name={statusIcon} 
              size={24} 
              color={statusColor}
            />
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}

export default memo(TransactionItemComponent);

const styles = StyleSheet.create({
  card: { 
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm + 4,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  iconContainer: { 
    width: 32, 
    height: 32, 
    borderRadius: borderRadius.sm,
    alignItems: 'center', 
    justifyContent: 'center',
    marginRight: spacing.sm + 2,
    flexShrink: 0,
  },
  iconLabel: { 
    fontWeight: '700',
    fontSize: 14,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  rightColumn: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    flexShrink: 0,
  },
  amount: { 
    fontWeight: '700', 
    fontSize: 16,
    lineHeight: 20,
  },
  feedbackButton: {
    marginTop: 2,
    padding: 2,
  },
  lockedLabel: {
    fontSize: 10,
    fontStyle: 'italic',
    marginTop: 4,
  },
});
