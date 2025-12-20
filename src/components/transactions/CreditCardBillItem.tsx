import React, { memo } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatCurrencyBRL } from '../../utils/format';
import { useAppTheme } from '../../contexts/themeContext';
import { spacing, borderRadius, getShadow } from '../../theme';

interface Props {
  creditCardName: string;
  creditCardIcon?: string;
  creditCardColor?: string;
  billMonth: number;
  billYear: number;
  totalAmount: number;
  isPaid: boolean;
  isLastInGroup?: boolean;
  onPress: () => void;
}

// Nomes dos meses abreviados
const MONTHS_SHORT = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
];

function CreditCardBillItemComponent({
  creditCardName,
  creditCardIcon = 'credit-card',
  creditCardColor = '#3B82F6',
  billMonth,
  billYear,
  totalAmount,
  isPaid,
  isLastInGroup = false,
  onPress,
}: Props) {
  const { colors } = useAppTheme();
  
  const monthName = MONTHS_SHORT[billMonth - 1] || '';
  const title = `Fatura ${creditCardName}`;
  const subtitle = `${monthName}/${billYear}`;
  
  // Cor do valor - laranja para despesa (sem vermelho)
  const amountColor = colors.expense;
  
  // Badge de status - verde se pago, cinza se pendente
  const badgeColor = isPaid ? colors.success : colors.textMuted;
  const badgeIcon = isPaid ? 'check' : 'clock-outline';
  const badgeText = isPaid ? 'Paga' : 'Pendente';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card },
        getShadow(colors, 'sm'),
        pressed && { backgroundColor: colors.grayLight },
        isLastInGroup && styles.lastInGroup,
      ]}
    >
      {/* Ícone do cartão */}
      <View style={[styles.iconContainer, { backgroundColor: creditCardColor + '15' }]}>
        <MaterialCommunityIcons 
          name={creditCardIcon as any} 
          size={24} 
          color={creditCardColor} 
        />
      </View>
      
      {/* Conteúdo central - Título e Subtítulo */}
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {title}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      
      {/* Coluna direita - Valor e Badge */}
      <View style={styles.rightColumn}>
        <Text style={[styles.amount, { color: amountColor }]}>
          {formatCurrencyBRL(-totalAmount)}
        </Text>
        <View style={[styles.badge, { backgroundColor: badgeColor + '15' }]}>
          <MaterialCommunityIcons name={badgeIcon} size={12} color={badgeColor} />
          <Text style={[styles.badgeText, { color: badgeColor }]}>{badgeText}</Text>
        </View>
      </View>
    </Pressable>
  );
}

export default memo(CreditCardBillItemComponent);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm + 4,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  lastInGroup: {
    marginBottom: 0,
  },
  iconContainer: { 
    width: 48, 
    height: 48, 
    borderRadius: 24,
    alignItems: 'center', 
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
  },
  rightColumn: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  amount: { 
    fontWeight: '700', 
    fontSize: 16,
    marginBottom: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    gap: 3,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
});
