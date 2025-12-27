import { View, Text, StyleSheet } from 'react-native';
import TransactionItem from './TransactionItem';
import CreditCardBillItem from './CreditCardBillItem';
import { useAppTheme } from '../../contexts/themeContext';
import { spacing } from '../../theme';
import { Timestamp } from 'firebase/firestore';

export interface TransactionListItem {
  id: string;
  date: string;
  title: string;
  account: string;
  toAccountName?: string; // Para transferências - conta destino
  amount: number;
  type: 'paid' | 'received' | 'transfer';
  category?: string;
  categoryIcon?: string;
  status?: 'pending' | 'completed' | 'cancelled';
  goalName?: string; // Se for aporte em meta
  installmentCurrent?: number;
  installmentTotal?: number;
  anticipatedFrom?: { month: number; year: number; date: Timestamp };
  anticipationDiscount?: number;
  itemType?: 'transaction' | 'bill';
  billData?: any; // Dados da fatura se for tipo 'bill'
}

interface Props { 
  items: TransactionListItem[];
  onEditItem?: (item: TransactionListItem) => void;
  onStatusPress?: (item: TransactionListItem) => void;
  onBillPress?: (billData: any) => void;
}

export default function TransactionsList({ items = [], onEditItem, onStatusPress, onBillPress }: Props) {
  const { colors } = useAppTheme();
  
  // group by date (simple grouping: same date string -> header)
  const groups: Record<string, TransactionListItem[]> = {};
  items.forEach((t) => {
    // Parse date string as UTC to avoid timezone shift
    const dateObj = new Date(t.date + 'T12:00:00Z');
    const date = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
    if (!groups[date]) groups[date] = [];
    groups[date].push(t);
  });

  const dates = Object.keys(groups);

  return (
    <View>
      {dates.map((d) => (
        <View key={d} style={styles.group}>
          <Text style={[styles.dateHeader, { color: colors.textMuted }]}>{d}</Text>
          {groups[d].map((tx, index) => {
            // Renderizar fatura ou transação
            if (tx.itemType === 'bill' && tx.billData) {
              const bill = tx.billData;
              return (
                <CreditCardBillItem
                  key={tx.id}
                  creditCardName={bill.creditCardName}
                  creditCardIcon={bill.creditCard?.icon || 'credit-card'}
                  creditCardColor={bill.creditCard?.color || '#3B82F6'}
                  billMonth={bill.month}
                  billYear={bill.year}
                  totalAmount={bill.totalAmount}
                  isPaid={bill.isPaid}
                  dueDate={bill.dueDate}
                  isLastInGroup={index === groups[d].length - 1}
                  onPress={() => onBillPress?.(bill)}
                />
              );
            }
            
            // Transação normal
            return (
              <TransactionItem 
                key={tx.id}
                title={tx.title} 
                account={tx.account} 
                toAccountName={tx.toAccountName}
                amount={tx.amount} 
                type={tx.type}
                category={tx.category}
                categoryIcon={tx.categoryIcon}
                status={tx.status}
                goalName={tx.goalName}
                installmentCurrent={tx.installmentCurrent}
                installmentTotal={tx.installmentTotal}
                anticipatedFrom={tx.anticipatedFrom}
                anticipationDiscount={tx.anticipationDiscount}
                isLastInGroup={index === groups[d].length - 1}
                onEdit={() => onEditItem?.(tx)}
                onStatusPress={() => onStatusPress?.(tx)}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    marginBottom: spacing.sm,
  },
  dateHeader: { 
    marginBottom: spacing.xs + 2,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.xs,
    fontWeight: '600',
    fontSize: 12,
    textTransform: 'capitalize',
  },
});
