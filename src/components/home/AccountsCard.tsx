import React, { memo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../contexts/themeContext';
import { formatCurrencyBRL } from '../../utils/format';
import { Account, Transaction, CreditCard } from '../../types/firebase';
import { DS_COLORS, DS_TYPOGRAPHY, DS_ICONS, DS_CARD, DS_SPACING } from '../../theme/designSystem';

interface Props {
  accounts?: Account[];
  username?: string;
  totalBalance?: number;
  totalIncome?: number;
  totalExpense?: number;
  pendingTransactions?: Transaction[];
  creditCards?: CreditCard[];
  onAccountPress?: (account: Account) => void;
  onAddPress?: () => void;
  showGreeting?: boolean;
}

// Cores e ícones para os tipos de conta
const getAccountIcon = (type: string): string => {
  switch (type) {
    case 'checking': return 'bank';
    case 'savings': return 'piggy-bank';
    case 'investment': return 'chart-line';
    case 'cash': return 'cash';
    default: return 'wallet';
  }
};

const getAccountColor = (type: string): string => {
  switch (type) {
    case 'checking': return DS_COLORS.primary;
    case 'savings': return DS_COLORS.success;
    case 'investment': return DS_COLORS.primary;
    case 'cash': return DS_COLORS.warning;
    default: return DS_COLORS.gray;
  }
};

export default memo(function AccountsCard({ 
  accounts = [], 
  username = 'Usuário',
  totalBalance,
  pendingTransactions = [],
  creditCards = [],
  onAccountPress, 
  onAddPress,
  showGreeting = true,
}: Props) {
  const { colors } = useAppTheme();

  // Filtrar apenas contas com saldo diferente de zero OU que tenham lançamentos/faturas pendentes
  // E que estejam marcadas para incluir no saldo total (includeInTotal !== false)
  const accountsWithBalance = accounts.filter(account => {
    // Primeira validação: não mostrar contas ocultas (includeInTotal = false)
    if (account.includeInTotal === false) return false;
    
    // Se tem saldo, mostrar
    if (account.balance !== 0) return true;
    
    // Se saldo = 0, verificar se tem lançamentos pendentes associados
    const hasPendingTransactions = pendingTransactions.some(
      transaction => transaction.accountId === account.id
    );
    
    // Verificar se há cartões com faturas pendentes que usam esta conta para pagamento
    const hasPendingCardBills = creditCards.some(
      card => card.paymentAccountId === account.id && (card.currentUsed || 0) > 0
    );
    
    return hasPendingTransactions || hasPendingCardBills;
  });

  // Determinar saudação baseada na hora
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return { text: 'Bom dia', icon: 'weather-sunny' as const };
    if (hour >= 12 && hour < 18) return { text: 'Boa tarde', icon: 'weather-partly-cloudy' as const };
    return { text: 'Boa noite', icon: 'weather-night' as const };
  };

  const greeting = getGreeting();
  
  // Se totalBalance for fornecido via prop, usa ele. Caso contrário, calcula.
  const displayTotalBalance = totalBalance !== undefined 
    ? totalBalance 
    : accountsWithBalance.reduce((sum, account) => sum + (account.balance || 0), 0);

  // Componente de item da conta (minimal design)
  const AccountItem = ({ account, index }: { account: Account; index: number }) => {
    const accountColor = getAccountColor(account.type);
    const accountIcon = getAccountIcon(account.type);
    const isNegative = account.balance < 0;
    
    return (
      <>
        {index > 0 && (
          <View style={[styles.divider, { borderColor: DS_COLORS.divider }]} />
        )}
        <Pressable
          onPress={() => onAccountPress?.(account)}
          style={({ pressed }) => [
            styles.accountItem,
            { opacity: pressed ? 0.7 : 1 }
          ]}
        >
          {/* Primeira linha: ícone + nome */}
          <View style={styles.accountHeader}>
            <MaterialCommunityIcons
              name={accountIcon as any}
              size={DS_ICONS.size.default}
              color={accountColor}
            />
            <Text style={[styles.accountName, { color: DS_COLORS.textBody }]} numberOfLines={1}>
              {account.name}
            </Text>
          </View>

          {/* Segunda linha: saldo */}
          <View style={styles.accountInfo}>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: DS_COLORS.textMuted }]}>Saldo atual:</Text>
              <Text 
                style={[
                  styles.balanceValue, 
                  { color: isNegative ? DS_COLORS.error : DS_COLORS.textBody }
                ]}
              >
                {formatCurrencyBRL(account.balance)}
              </Text>
            </View>
          </View>
        </Pressable>
      </>
    );
  };

  return (
    <View style={styles.container}>
      {/* Saudação */}
      {showGreeting && (
        <View style={styles.greetingSection}>
          <View style={styles.greetingRow}>
            <Text style={[styles.greeting, { color: DS_COLORS.primary }]}>
              {greeting.text}, {username}
            </Text>
            <MaterialCommunityIcons 
              name={greeting.icon} 
              size={28} 
              color={DS_COLORS.primary}
              style={styles.greetingIcon}
            />
          </View>
        </View>
      )}

      {/* Card Principal */}
      <View style={styles.card}>
        {/* Header com título e saldo geral */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: DS_COLORS.primary }]}>
            Onde está meu dinheiro
          </Text>
          
          {/* Saldo Geral - Destaque */}
          <View style={styles.totalBalanceSection}>
            <Text style={[styles.totalBalanceLabel, { color: DS_COLORS.textMuted }]}>
              Saldo geral
            </Text>
            <Text style={[
              styles.totalBalanceValue, 
              { color: displayTotalBalance >= 0 ? DS_COLORS.success : DS_COLORS.error }
            ]}>
              {formatCurrencyBRL(displayTotalBalance)}
            </Text>
          </View>
        </View>

        {/* Separador */}
        {accountsWithBalance.length > 0 && (
          <View style={[styles.separator, { backgroundColor: DS_COLORS.divider }]} />
        )}

        {/* Lista de contas */}
        {accountsWithBalance.length > 0 && (
          <View style={styles.accountsList}>
            <Text style={styles.accountsTitle}>
              Contas
            </Text>
            {accountsWithBalance.map((account, index) => (
              <AccountItem key={account.id} account={account} index={index} />
            ))}
          </View>
        )}

        {/* Mensagem vazia */}
        {accountsWithBalance.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="wallet-outline" size={48} color={DS_COLORS.textMuted} />
            <Text style={[styles.emptyText, { color: DS_COLORS.textMuted }]}>
              Nenhuma conta com saldo disponível
            </Text>
          </View>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: DS_SPACING.lg,
  },
  greetingSection: {
    gap: DS_SPACING.xs,
    paddingHorizontal: 4,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greetingIcon: {
    marginLeft: DS_SPACING.sm,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  card: {
    ...DS_CARD,
    ...DS_CARD.shadow,
    backgroundColor: DS_COLORS.card,
  },
  header: {
    gap: DS_SPACING.lg,
  },
  title: {
    ...DS_TYPOGRAPHY.styles.sectionTitle,
    color: DS_COLORS.primary,
  },
  totalBalanceSection: {
    gap: DS_SPACING.xs,
  },
  totalBalanceLabel: {
    ...DS_TYPOGRAPHY.styles.label,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  totalBalanceValue: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 38,
  },
  separator: {
    height: 1,
    marginVertical: DS_SPACING.sm,
  },
  accountsList: {
    gap: 0,
    marginTop: DS_SPACING.sm,
  },
  accountsTitle: {
    ...DS_TYPOGRAPHY.styles.body,
    fontWeight: '600',
    marginBottom: 4,
  },
  accountItem: {
    paddingVertical: DS_SPACING.lg,
  },
  divider: {
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    marginVertical: 0,
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DS_SPACING.sm,
    marginBottom: DS_SPACING.sm,
  },
  accountName: {
    flex: 1,
    ...DS_TYPOGRAPHY.styles.valueSecondary,
  },
  accountInfo: {
    flexDirection: 'row',
  },
  infoItem: {
    flex: 1,
    gap: DS_SPACING.xs,
  },
  infoLabel: {
    ...DS_TYPOGRAPHY.styles.label,
    fontSize: 13,
  },
  balanceValue: {
    ...DS_TYPOGRAPHY.styles.valueSecondary,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: DS_SPACING.md,
  },
  emptyText: {
    ...DS_TYPOGRAPHY.styles.body,
    textAlign: 'center',
  },
});
