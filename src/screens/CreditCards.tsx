import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Platform, ScrollView, Modal } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppTheme } from "../contexts/themeContext";
import { spacing, borderRadius, getShadow } from "../theme";

type CardBrand = 'credit-card' | 'credit-card-outline';

interface CardBrandOption {
  id: string;
  name: string;
  icon: CardBrand;
  color: string;
}

const CARD_BRANDS: CardBrandOption[] = [
  { id: 'nubank', name: 'Nubank', icon: 'credit-card', color: '#8B5CF6' },
  { id: 'itau', name: 'Itaú', icon: 'credit-card', color: '#F97316' },
  { id: 'bradesco', name: 'Bradesco', icon: 'credit-card', color: '#EF4444' },
  { id: 'bb', name: 'Banco do Brasil', icon: 'credit-card', color: '#FBBF24' },
  { id: 'caixa', name: 'Caixa', icon: 'credit-card', color: '#3B82F6' },
  { id: 'santander', name: 'Santander', icon: 'credit-card', color: '#EF4444' },
  { id: 'inter', name: 'Inter', icon: 'credit-card', color: '#F97316' },
  { id: 'outro', name: 'Outro', icon: 'credit-card-outline', color: '#6B7280' },
];

export default function CreditCards({ navigation }: any) {
  const { colors } = useAppTheme();
  
  const [name, setName] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('nubank');
  const [limit, setLimit] = useState('');
  const [closingDay, setClosingDay] = useState('');
  const [dueDay, setDueDay] = useState('');
  const [paymentAccount, setPaymentAccount] = useState('');
  const [showAccountPicker, setShowAccountPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // Mock de cartões existentes
  const [cards] = useState([
    { id: '1', name: 'Nubank', brand: 'nubank', limit: 5000, closingDay: 10, dueDay: 17 },
  ]);

  // Mock de contas para pagamento
  const accounts = [
    { id: '1', name: 'Nubank' },
    { id: '2', name: 'Carteira' },
  ];

  async function handleCreate() {
    if (!name.trim()) return;
    
    setLoading(true);
    // TODO: Implementar criação no Firebase
    setTimeout(() => {
      setLoading(false);
      setName('');
      setLimit('');
      setClosingDay('');
      setDueDay('');
    }, 500);
  }

  const selectedBrandData = CARD_BRANDS.find(b => b.id === selectedBrand);

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Pressable 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
          hitSlop={12}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Cartões de Crédito</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Cartões existentes */}
        {cards.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              SEUS CARTÕES
            </Text>
            <View style={[styles.card, { backgroundColor: colors.card }, getShadow(colors)]}>
              {cards.map((card, index) => {
                const brand = CARD_BRANDS.find(b => b.id === card.brand);
                return (
                  <Pressable
                    key={card.id}
                    style={[
                      styles.cardItem,
                      index < cards.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                    ]}
                  >
                    <View style={[styles.iconCircle, { backgroundColor: (brand?.color || colors.primary) + '20' }]}>
                      <MaterialCommunityIcons 
                        name={brand?.icon || 'credit-card'} 
                        size={20} 
                        color={brand?.color || colors.primary} 
                      />
                    </View>
                    <View style={styles.cardInfo}>
                      <Text style={[styles.cardName, { color: colors.text }]}>{card.name}</Text>
                      <Text style={[styles.cardDetails, { color: colors.textSecondary }]}>
                        Limite: R$ {card.limit.toFixed(2)} • Fecha dia {card.closingDay}
                      </Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textMuted} />
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* Novo cartão */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            CADASTRAR NOVO CARTÃO
          </Text>
          <View style={[styles.card, { backgroundColor: colors.card }, getShadow(colors)]}>
            {/* Nome */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Nome do cartão</Text>
              <View style={[styles.inputContainer, { borderColor: colors.border }]}>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Ex: Nubank, Itaú Platinum..."
                  placeholderTextColor={colors.textMuted}
                  style={[styles.input, { color: colors.text }]}
                />
              </View>
            </View>

            {/* Bandeira/Banco */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Banco/Bandeira</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.brandGrid}>
                  {CARD_BRANDS.map((brand) => (
                    <Pressable
                      key={brand.id}
                      onPress={() => setSelectedBrand(brand.id)}
                      style={[
                        styles.brandOption,
                        { borderColor: selectedBrand === brand.id ? brand.color : colors.border },
                        selectedBrand === brand.id && { backgroundColor: brand.color + '15' },
                      ]}
                    >
                      <MaterialCommunityIcons 
                        name={brand.icon} 
                        size={24} 
                        color={selectedBrand === brand.id ? brand.color : colors.textMuted} 
                      />
                      <Text 
                        style={[
                          styles.brandLabel, 
                          { color: selectedBrand === brand.id ? brand.color : colors.textMuted },
                        ]}
                        numberOfLines={1}
                      >
                        {brand.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Limite */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Limite</Text>
              <View style={[styles.inputContainer, { borderColor: colors.border }]}>
                <Text style={[styles.currency, { color: colors.textMuted }]}>R$</Text>
                <TextInput
                  value={limit}
                  onChangeText={setLimit}
                  placeholder="0,00"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  style={[styles.input, { color: colors.text }]}
                />
              </View>
            </View>

            {/* Datas */}
            <View style={styles.rowFormGroup}>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={[styles.label, { color: colors.text }]}>Dia fechamento</Text>
                <View style={[styles.inputContainer, { borderColor: colors.border }]}>
                  <TextInput
                    value={closingDay}
                    onChangeText={setClosingDay}
                    placeholder="10"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                    maxLength={2}
                    style={[styles.input, { color: colors.text }]}
                  />
                </View>
              </View>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={[styles.label, { color: colors.text }]}>Dia vencimento</Text>
                <View style={[styles.inputContainer, { borderColor: colors.border }]}>
                  <TextInput
                    value={dueDay}
                    onChangeText={setDueDay}
                    placeholder="17"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                    maxLength={2}
                    style={[styles.input, { color: colors.text }]}
                  />
                </View>
              </View>
            </View>

            {/* Conta de pagamento */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Conta de pagamento</Text>
              <Pressable 
                onPress={() => setShowAccountPicker(true)}
                style={[styles.selectButton, { borderColor: colors.border }]}
              >
                <Text style={[
                  styles.selectText, 
                  { color: paymentAccount ? colors.text : colors.textMuted }
                ]}>
                  {paymentAccount || 'Selecione a conta'}
                </Text>
                <MaterialCommunityIcons name="chevron-down" size={20} color={colors.textMuted} />
              </Pressable>
            </View>

            {/* Botão */}
            <Pressable
              onPress={handleCreate}
              disabled={loading || !name.trim()}
              style={({ pressed }) => [
                styles.createButton,
                { backgroundColor: selectedBrandData?.color || colors.primary },
                pressed && { opacity: 0.9 },
                (loading || !name.trim()) && { opacity: 0.6 },
              ]}
            >
              <MaterialCommunityIcons name="plus" size={20} color="#fff" />
              <Text style={styles.createButtonText}>
                {loading ? 'Criando...' : 'Cadastrar cartão'}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Modal de seleção de conta */}
      <Modal
        visible={showAccountPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAccountPicker(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowAccountPicker(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Selecionar conta</Text>
            {accounts.map((account) => (
              <Pressable
                key={account.id}
                onPress={() => {
                  setPaymentAccount(account.name);
                  setShowAccountPicker(false);
                }}
                style={[styles.modalOption, { borderBottomColor: colors.border }]}
              >
                <MaterialCommunityIcons name="bank" size={20} color={colors.primary} />
                <Text style={[styles.modalOptionText, { color: colors.text }]}>{account.name}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    paddingHorizontal: spacing.md,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  card: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '500',
  },
  cardDetails: {
    fontSize: 13,
    marginTop: 2,
  },
  formGroup: {
    padding: spacing.md,
    paddingBottom: 0,
  },
  rowFormGroup: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  currency: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  brandGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  brandOption: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    minWidth: 70,
    maxWidth: 80,
  },
  brandLabel: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  selectText: {
    fontSize: 16,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: spacing.md,
    paddingVertical: 14,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    gap: spacing.md,
  },
  modalOptionText: {
    fontSize: 16,
  },
});
