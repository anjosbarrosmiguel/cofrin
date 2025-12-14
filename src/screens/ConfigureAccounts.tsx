import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Platform, ScrollView, Alert } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppTheme } from "../contexts/themeContext";
import { spacing, borderRadius, getShadow } from "../theme";
import { useAccounts } from "../hooks/useAccounts";
import { AccountType, ACCOUNT_TYPE_LABELS } from "../types/firebase";
import { formatCurrencyBRL } from "../utils/format";

interface AccountTypeOption {
  id: AccountType;
  icon: string;
  label: string;
}

const ACCOUNT_TYPES: AccountTypeOption[] = [
  { id: 'checking', icon: 'bank', label: 'Corrente' },
  { id: 'savings', icon: 'piggy-bank', label: 'Poupança' },
  { id: 'wallet', icon: 'wallet', label: 'Carteira' },
  { id: 'investment', icon: 'chart-line', label: 'Investimento' },
  { id: 'other', icon: 'dots-horizontal', label: 'Outro' },
];

const ACCOUNT_ICONS = [
  'bank', 'bank-outline', 'piggy-bank', 'wallet', 'wallet-outline',
  'cash', 'credit-card', 'safe', 'chart-line', 'bitcoin',
];

export default function ConfigureAccounts({ navigation }: any) {
  const { colors } = useAppTheme();
  
  const [name, setName] = useState('');
  const [selectedType, setSelectedType] = useState<AccountType>('checking');
  const [selectedIcon, setSelectedIcon] = useState('bank');
  const [initialBalance, setInitialBalance] = useState('');
  const [includeInTotal, setIncludeInTotal] = useState(true);
  const [saving, setSaving] = useState(false);

  // Hook de contas do Firebase
  const { 
    activeAccounts,
    totalBalance,
    loading, 
    createAccount,
    archiveAccount,
  } = useAccounts();

  // Converter string de valor para número
  function parseBalance(value: string): number {
    const cleaned = value.replace(/[^\d,.-]/g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
  }

  async function handleCreate() {
    if (!name.trim()) return;
    
    setSaving(true);
    try {
      const balance = parseBalance(initialBalance);
      
      const result = await createAccount({
        name: name.trim(),
        type: selectedType,
        icon: selectedIcon,
        initialBalance: balance,
        includeInTotal,
        isArchived: false,
      });

      if (result) {
        setName('');
        setInitialBalance('');
        setSelectedType('checking');
        setSelectedIcon('bank');
        setIncludeInTotal(true);
        Alert.alert('Sucesso', 'Conta criada com sucesso!');
      } else {
        Alert.alert('Erro', 'Não foi possível criar a conta');
      }
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao criar a conta');
    } finally {
      setSaving(false);
    }
  }

  async function handleArchive(accountId: string, accountName: string) {
    Alert.alert(
      'Arquivar conta',
      `Deseja arquivar a conta "${accountName}"? Ela não aparecerá mais na lista, mas você pode restaurá-la depois.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Arquivar', 
          style: 'destructive',
          onPress: async () => {
            const result = await archiveAccount(accountId);
            if (!result) {
              Alert.alert('Erro', 'Não foi possível arquivar a conta');
            }
          }
        },
      ]
    );
  }

  // Obter ícone do tipo de conta
  function getAccountIcon(type: AccountType, icon?: string): string {
    if (icon) return icon;
    const typeOption = ACCOUNT_TYPES.find(t => t.id === type);
    return typeOption?.icon || 'bank';
  }

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
        <Text style={styles.headerTitle}>Contas</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Saldo total */}
        {activeAccounts.length > 0 && (
          <View style={[styles.totalCard, { backgroundColor: colors.primary }]}>
            <Text style={styles.totalLabel}>Saldo total</Text>
            <Text style={styles.totalValue}>{formatCurrencyBRL(totalBalance)}</Text>
          </View>
        )}

        {/* Contas existentes */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: colors.textMuted }]}>Carregando contas...</Text>
          </View>
        ) : activeAccounts.length > 0 ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              SUAS CONTAS
            </Text>
            <Text style={[styles.sectionHint, { color: colors.textMuted }]}>
              Segure para arquivar
            </Text>
            <View style={[styles.card, { backgroundColor: colors.card }, getShadow(colors)]}>
              {activeAccounts.map((account, index) => (
                <Pressable
                  key={account.id}
                  onLongPress={() => handleArchive(account.id, account.name)}
                  delayLongPress={500}
                  style={[
                    styles.accountItem,
                    index < activeAccounts.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                  ]}
                >
                  <View style={[styles.iconCircle, { backgroundColor: colors.primaryBg }]}>
                    <MaterialCommunityIcons 
                      name={getAccountIcon(account.type, account.icon) as any} 
                      size={20} 
                      color={colors.primary} 
                    />
                  </View>
                  <View style={styles.accountInfo}>
                    <Text style={[styles.accountName, { color: colors.text }]}>{account.name}</Text>
                    <Text style={[styles.accountType, { color: colors.textMuted }]}>
                      {ACCOUNT_TYPE_LABELS[account.type]}
                    </Text>
                  </View>
                  <Text style={[
                    styles.accountBalance, 
                    { color: account.balance >= 0 ? colors.income : colors.expense }
                  ]}>
                    {formatCurrencyBRL(account.balance)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.section}>
            <View style={[styles.emptyCard, { backgroundColor: colors.card }, getShadow(colors)]}>
              <MaterialCommunityIcons name="bank-off-outline" size={48} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                Nenhuma conta cadastrada
              </Text>
            </View>
          </View>
        )}

        {/* Nova conta */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            CRIAR NOVA CONTA
          </Text>
          <View style={[styles.card, { backgroundColor: colors.card }, getShadow(colors)]}>
            {/* Nome */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Nome da conta</Text>
              <View style={[styles.inputContainer, { borderColor: colors.border }]}>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Ex: Nubank, Caixa, Carteira..."
                  placeholderTextColor={colors.textMuted}
                  style={[styles.input, { color: colors.text }]}
                />
              </View>
            </View>

            {/* Tipo */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Tipo da conta</Text>
              <View style={styles.typeGrid}>
                {ACCOUNT_TYPES.map((type) => (
                  <Pressable
                    key={type.id}
                    onPress={() => {
                      setSelectedType(type.id);
                      setSelectedIcon(type.icon);
                    }}
                    style={[
                      styles.typeOption,
                      { borderColor: selectedType === type.id ? colors.primary : colors.border },
                      selectedType === type.id && { backgroundColor: colors.primaryBg },
                    ]}
                  >
                    <MaterialCommunityIcons 
                      name={type.icon as any} 
                      size={22} 
                      color={selectedType === type.id ? colors.primary : colors.textMuted} 
                    />
                    <Text 
                      style={[
                        styles.typeLabel, 
                        { color: selectedType === type.id ? colors.primary : colors.textMuted },
                      ]}
                    >
                      {type.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Ícone */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Ícone</Text>
              <View style={styles.iconGrid}>
                {ACCOUNT_ICONS.map((icon) => (
                  <Pressable
                    key={icon}
                    onPress={() => setSelectedIcon(icon)}
                    style={[
                      styles.iconOption,
                      { borderColor: selectedIcon === icon ? colors.primary : colors.border },
                      selectedIcon === icon && { backgroundColor: colors.primaryBg },
                    ]}
                  >
                    <MaterialCommunityIcons 
                      name={icon as any} 
                      size={22} 
                      color={selectedIcon === icon ? colors.primary : colors.textMuted} 
                    />
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Saldo inicial */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Saldo inicial</Text>
              <View style={[styles.inputContainer, { borderColor: colors.border }]}>
                <Text style={[styles.currency, { color: colors.textMuted }]}>R$</Text>
                <TextInput
                  value={initialBalance}
                  onChangeText={setInitialBalance}
                  placeholder="0,00"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  style={[styles.input, { color: colors.text }]}
                />
              </View>
            </View>

            {/* Incluir no total */}
            <Pressable
              onPress={() => setIncludeInTotal(!includeInTotal)}
              style={styles.checkboxRow}
            >
              <View style={[
                styles.checkbox,
                { borderColor: colors.primary },
                includeInTotal && { backgroundColor: colors.primary },
              ]}>
                {includeInTotal && (
                  <MaterialCommunityIcons name="check" size={14} color="#fff" />
                )}
              </View>
              <Text style={[styles.checkboxLabel, { color: colors.text }]}>
                Incluir no saldo total
              </Text>
            </Pressable>

            {/* Botão */}
            <Pressable
              onPress={handleCreate}
              disabled={saving || !name.trim()}
              style={({ pressed }) => [
                styles.createButton,
                { backgroundColor: colors.primary },
                pressed && { opacity: 0.9 },
                (saving || !name.trim()) && { opacity: 0.6 },
              ]}
            >
              <MaterialCommunityIcons name="plus" size={20} color="#fff" />
              <Text style={styles.createButtonText}>
                {saving ? 'Criando...' : 'Criar conta'}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
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
  totalCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
  },
  emptyCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
    marginLeft: spacing.xs,
  },
  sectionHint: {
    fontSize: 11,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  card: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '500',
  },
  accountType: {
    fontSize: 13,
    marginTop: 2,
  },
  accountBalance: {
    fontSize: 16,
    fontWeight: '600',
  },
  formGroup: {
    padding: spacing.md,
    paddingBottom: 0,
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
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  typeOption: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minWidth: 80,
  },
  typeLabel: {
    fontSize: 11,
    marginTop: 4,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  iconOption: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderRadius: borderRadius.md,
    width: 48,
    height: 48,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxLabel: {
    fontSize: 14,
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
});
