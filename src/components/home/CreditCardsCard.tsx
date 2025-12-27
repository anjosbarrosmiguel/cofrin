import { View, StyleSheet, Pressable, Modal } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, useMemo, memo, useEffect } from 'react';
import { useAppTheme } from '../../contexts/themeContext';
import { formatCurrencyBRL } from '../../utils/format';
import { CreditCard } from '../../types/firebase';
import { getCreditCardTransactionsByMonth, calculateBillTotal } from '../../services/creditCardBillService';
import { useAuth } from '../../contexts/authContext';
import { DS_COLORS, DS_TYPOGRAPHY, DS_ICONS, DS_CARD, DS_BADGE, DS_SPACING } from '../../theme/designSystem';

interface Props {
  cards?: CreditCard[];
  totalBills?: number;
  totalIncome?: number; // Receita do mês para calcular porcentagem
  onCardPress?: (card: CreditCard) => void;
  onAddPress?: () => void;
}



// Status de uso do cartão baseado na porcentagem de gastos vs receitas
type CardUsageStatus = {
  level: 'controlled' | 'warning' | 'alert' | 'no-income';
  message: string;
  color: string;
};

const getCardUsageStatus = (totalUsed: number, totalIncome: number): CardUsageStatus => {
  if (totalIncome === 0) {
    return {
      level: 'no-income',
      message: 'Sem receitas registradas neste mês',
      color: DS_COLORS.textMuted,
    };
  }

  const percentage = (totalUsed / totalIncome) * 100;

  if (percentage <= 30) {
    return {
      level: 'controlled',
      message: 'Gastos controlados',
      color: DS_COLORS.success,
    };
  } else if (percentage <= 50) {
    return {
      level: 'warning',
      message: 'Cuidado, você está se aproximando do limite recomendado',
      color: DS_COLORS.warning,
    };
  } else {
    return {
      level: 'alert',
      message: 'Atenção, gastos elevados no cartão',
      color: DS_COLORS.error,
    };
  }
};

export default memo(function CreditCardsCard({ cards = [], totalBills = 0, totalIncome = 0, onCardPress, onAddPress }: Props) {
  const { colors } = useAppTheme();
  const { user } = useAuth();
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [currentBills, setCurrentBills] = useState<Record<string, number>>({});

  // Mês atual
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  // Buscar faturas do mês atual para cada cartão
  useEffect(() => {
    const fetchCurrentBills = async () => {
      if (!user?.uid || cards.length === 0) return;
      
      const billsMap: Record<string, number> = {};
      
      for (const card of cards) {
        try {
          // Buscar transações do cartão no mês atual
          const transactions = await getCreditCardTransactionsByMonth(
            user.uid, 
            card.id, 
            currentMonth, 
            currentYear
          );
          
          // Calcular total da fatura
          const totalAmount = calculateBillTotal(transactions);
          
          billsMap[card.id] = totalAmount;
        } catch (error) {
          console.error(`Erro ao buscar fatura do cartão ${card.id}:`, error);
          billsMap[card.id] = 0;
        }
      }
      

      setCurrentBills(billsMap);
    };
    
    fetchCurrentBills();
  }, [cards, user?.uid, currentMonth, currentYear]);

  // Calcular total usado apenas nas faturas do mês atual
  const totalUsed = useMemo(() => {
    return Object.values(currentBills).reduce((sum, amount) => sum + amount, 0);
  }, [currentBills]);

  // Status do uso dos cartões
  const usageStatus = useMemo(() => {
    return getCardUsageStatus(totalUsed, totalIncome, colors);
  }, [totalUsed, totalIncome, colors]);

  // Porcentagem de uso
  const usagePercentage = useMemo(() => {
    if (totalIncome === 0) return 0;
    return (totalUsed / totalIncome) * 100;
  }, [totalUsed, totalIncome]);

  // Filtrar apenas cartões com fatura pendente no mês atual
  const cardsWithPendingBills = useMemo(() => {
    return cards.filter(card => {
      const billAmount = currentBills[card.id] || 0;
      return billAmount > 0;
    });
  }, [cards, currentBills]);

  // Componente de item do cartão (layout minimalista)
  const CardItem = ({ card, index }: { card: CreditCard; index: number }) => {
    const billAmount = currentBills[card.id] || 0;
    
    // Determinar status da fatura
    const today = new Date().getDate();
    const isPaid = billAmount === 0;
    const isDueToday = !isPaid && today === card.dueDay;
    const isOverdue = !isPaid && today > card.dueDay;
    const isPending = !isPaid && today < card.dueDay;
    
    const getStatusText = () => {
      if (isPaid) return null;
      if (isOverdue) return 'Vencida';
      if (isDueToday) return 'Vence hoje';
      if (isPending) return 'Pendente';
      return null;
    };

    const getStatusBadgeColors = () => {
      if (isOverdue) return DS_BADGE.variants.error;
      if (isDueToday) return DS_BADGE.variants.warning;
      return DS_BADGE.variants.neutral;
    };
    
    const getBillValueColor = () => {
      if (isOverdue) return DS_COLORS.error;
      if (isDueToday) return DS_COLORS.warning;
      return DS_COLORS.textMuted;
    };
    
    const statusText = getStatusText();
    
    const badgeColors = getStatusBadgeColors();
    
    return (
      <>
        {index > 0 && (
          <View style={[styles.divider, { borderColor: DS_COLORS.divider }]} />
        )}
        <Pressable
          onPress={() => onCardPress?.(card)}
          style={({ pressed }) => [
            styles.cardItem,
            { opacity: pressed ? 0.7 : 1 }
          ]}
        >
          {/* Primeira linha: ícone + nome + badge */}
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons
              name={(card.icon as any) || 'credit-card'}
              size={DS_ICONS.size.default}
              color={DS_ICONS.color}
            />
            <Text style={[styles.cardName, { color: DS_COLORS.textBody }]} numberOfLines={1}>
              {card.name}
            </Text>
            {statusText && (
              <View style={[styles.statusBadge, { backgroundColor: badgeColors.backgroundColor }]}>
                <Text style={[styles.statusBadgeText, { color: badgeColors.color }]}>
                  {statusText}
                </Text>
              </View>
            )}
          </View>

          {/* Segunda linha: vencimento + valor na mesma linha */}
          <View style={styles.cardInfo}>
            <Text style={[styles.infoLabel, { color: DS_COLORS.textMuted }]}>
              Vencimento dia {card.dueDay}
            </Text>
            <Text style={[styles.billValue, { color: getBillValueColor() }]}>
              {formatCurrencyBRL(billAmount)}
            </Text>
          </View>
        </Pressable>
      </>
    );
  };

  return (
    <View style={[styles.card, { backgroundColor: DS_COLORS.card }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, DS_TYPOGRAPHY.styles.sectionTitle, { color: DS_COLORS.primary }]}>
              Meus cartões
            </Text>
            {cardsWithPendingBills.length > 0 && totalUsed > 0 && (
              <Pressable 
                onPress={() => setShowStatusModal(true)}
                style={({ pressed }) => [
                  styles.statusIconButton,
                  { opacity: pressed ? 0.7 : 1 }
                ]}
              >
                <MaterialCommunityIcons 
                  name="information" 
                  size={22} 
                  color={usageStatus.color} 
                />
              </Pressable>
            )}
          </View>
        </View>
      </View>

      {/* Lista de cartões */}
      <View style={styles.cardsList}>
        {cardsWithPendingBills.map((card, index) => (
          <CardItem key={card.id} card={card} index={index} />
        ))}
      </View>

      {/* Mensagem vazia */}
      {cardsWithPendingBills.length === 0 && (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="credit-card-check" size={48} color={DS_COLORS.textMuted} />
          <Text style={[styles.emptyText, { color: DS_COLORS.textMuted }]}>
            Nenhuma fatura pendente neste mês
          </Text>
        </View>
      )}

      {/* Modal de Status de Uso dos Cartões */}
      <Modal
        visible={showStatusModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowStatusModal(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowStatusModal(false)}
        >
          <View style={[styles.modalCard, { backgroundColor: DS_COLORS.card }]}>
            {/* Ícone e status principal */}
            <View style={styles.modalHeader}>
              <View style={[styles.modalIconContainer, { backgroundColor: `${usageStatus.color}15` }]}>
                <MaterialCommunityIcons 
                  name={usageStatus.icon} 
                  size={32} 
                  color={usageStatus.color} 
                />
              </View>
              <Text style={[styles.modalTitle, { color: DS_COLORS.textTitle }]}>
                {usageStatus.message}
              </Text>
            </View>

            <View style={[styles.modalDivider, { backgroundColor: DS_COLORS.divider }]} />

            {/* Resumo dos compromissos */}
            <View style={styles.modalDetails}>
              <View style={styles.modalRow}>
                <Text style={[styles.modalLabel, { color: DS_COLORS.textMuted }]}>Total em faturas:</Text>
                <Text style={[styles.modalValue, { color: DS_COLORS.error }]}>
                  {formatCurrencyBRL(totalUsed)}
                </Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={[styles.modalLabel, { color: DS_COLORS.textMuted }]}>Receitas do mês:</Text>
                <Text style={[styles.modalValue, { color: DS_COLORS.success }]}>
                  {formatCurrencyBRL(totalIncome)}
                </Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={[styles.modalLabel, { color: DS_COLORS.textMuted }]}>Comprometimento:</Text>
                <Text style={[styles.modalValue, { color: usageStatus.color }]}>
                  {usagePercentage.toFixed(1)}%
                </Text>
              </View>
            </View>

            <View style={[styles.modalDivider, { backgroundColor: DS_COLORS.divider }]} />

            {/* Detalhes por cartão - apenas mês atual */}
            <View style={styles.modalCardsList}>
              <Text style={[styles.modalSectionTitle, { color: DS_COLORS.textBody }]}>
                Por cartão (mês atual)
              </Text>
              {cards.filter(c => (currentBills[c.id] || 0) > 0).map((card) => (
                <View key={card.id} style={styles.modalCardItem}>
                  <View style={styles.modalCardInfo}>
                    <View style={[styles.modalCardIcon, { backgroundColor: DS_COLORS.primaryLight }]}>
                      <MaterialCommunityIcons 
                        name={(card.icon as any) || 'credit-card'} 
                        size={16} 
                        color={DS_ICONS.color} 
                      />
                    </View>
                    <Text style={[styles.modalCardName, { color: DS_COLORS.textBody }]} numberOfLines={1}>
                      {card.name}
                    </Text>
                  </View>
                  <Text style={[styles.modalCardValue, { color: DS_COLORS.error }]}>
                    {formatCurrencyBRL(currentBills[card.id] || 0)}
                  </Text>
                </View>
              ))}
              {cards.filter(c => (currentBills[c.id] || 0) > 0).length === 0 && (
                <Text style={[styles.modalEmptyText, { color: DS_COLORS.textMuted }]}>
                  Nenhuma fatura em aberto no mês atual
                </Text>
              )}
            </View>

            {/* Dica - só mostra se tiver receitas para comparar */}
            {usageStatus.level !== 'no-income' ? (
              <View style={[styles.modalTip, { backgroundColor: `${usageStatus.color}10` }]}>
                <MaterialCommunityIcons 
                  name="lightbulb-outline" 
                  size={16} 
                  color={usageStatus.color} 
                />
                <Text style={[styles.modalTipText, { color: DS_COLORS.textBody }]}>
                  {usageStatus.level === 'controlled' 
                    ? 'Continue assim! Manter os gastos no cartão abaixo de 30% das receitas é ideal.'
                    : usageStatus.level === 'warning'
                    ? 'Considere revisar seus gastos. O ideal é manter abaixo de 30% das receitas.'
                    : 'Revise seus gastos no cartão para evitar comprometer seu orçamento.'}
                </Text>
              </View>
            ) : (
              <View style={[styles.modalTip, { backgroundColor: DS_COLORS.primaryLight }]}>
                <MaterialCommunityIcons 
                  name="information-outline" 
                  size={16} 
                  color={DS_ICONS.color} 
                />
                <Text style={[styles.modalTipText, { color: DS_COLORS.textBody }]}>
                  Cadastre suas receitas para acompanhar o comprometimento do seu orçamento com cartões de crédito.
                </Text>
              </View>
            )}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    ...DS_CARD,
    ...DS_CARD.shadow,
  },
  header: {
    marginBottom: DS_SPACING.lg,
  },
  titleSection: {
    gap: DS_SPACING.xs,
  },
  title: {
    ...DS_TYPOGRAPHY.styles.sectionTitle,
  },
  subtitle: {
    ...DS_TYPOGRAPHY.styles.label,
  },
  cardsList: {
    gap: 0,
  },
  cardItem: {
    paddingVertical: DS_SPACING.lg,
  },
  divider: {
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    marginVertical: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DS_SPACING.sm,
    marginBottom: DS_SPACING.sm,
  },
  cardName: {
    flex: 1,
    ...DS_TYPOGRAPHY.styles.valueSecondary,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '500',
  },
  statusBadge: {
    ...DS_BADGE,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  cardInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    ...DS_TYPOGRAPHY.styles.label,
  },
  billValue: {
    ...DS_TYPOGRAPHY.styles.valueSecondary,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: DS_SPACING.md,
  },
  emptyText: {
    ...DS_TYPOGRAPHY.styles.body,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: DS_SPACING.lg,
    borderRadius: 20,
    marginTop: 4,
  },
  emptyButtonText: {
    color: DS_COLORS.textInverse,
    ...DS_TYPOGRAPHY.styles.body,
    fontWeight: '600',
  },
  // Estilos do ícone de status
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DS_SPACING.sm,
  },
  statusIconButton: {
    padding: 4,
  },
  // Estilos da modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: DS_SPACING.xxl,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: DS_CARD.borderRadius,
    padding: DS_SPACING.xxl,
    ...DS_CARD.shadow,
  },
  modalHeader: {
    alignItems: 'center',
    gap: DS_SPACING.md,
    marginBottom: DS_SPACING.lg,
  },
  modalIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    ...DS_TYPOGRAPHY.styles.valueSecondary,
    textAlign: 'center',
  },
  modalDivider: {
    height: 1,
    marginVertical: DS_SPACING.lg,
  },
  modalDetails: {
    gap: DS_SPACING.md,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalLabel: {
    ...DS_TYPOGRAPHY.styles.body,
  },
  modalValue: {
    ...DS_TYPOGRAPHY.styles.valueSecondary,
  },
  modalCardsList: {
    gap: 10,
  },
  modalSectionTitle: {
    ...DS_TYPOGRAPHY.styles.body,
    fontWeight: '600',
    marginBottom: 4,
  },
  modalCardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalCardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  modalCardIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCardName: {
    ...DS_TYPOGRAPHY.styles.body,
    flex: 1,
  },
  modalCardValue: {
    ...DS_TYPOGRAPHY.styles.body,
    fontWeight: '600',
  },
  modalEmptyText: {
    ...DS_TYPOGRAPHY.styles.body,
    fontStyle: 'italic',
  },
  modalTip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: DS_SPACING.sm,
    padding: DS_SPACING.md,
    borderRadius: DS_SPACING.md,
    marginTop: DS_SPACING.lg,
  },
  modalTipText: {
    ...DS_TYPOGRAPHY.styles.label,
    flex: 1,
    lineHeight: 18,
  },
});
