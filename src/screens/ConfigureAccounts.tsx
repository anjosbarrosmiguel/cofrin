import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Platform, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppTheme } from "../contexts/themeContext";
import { spacing, borderRadius, getShadow } from "../theme";

type AccountIconType = 'bank' | 'cash' | 'wallet' | 'piggy-bank' | 'credit-card';

interface AccountIcon {
  id: AccountIconType;
  label: string;
}

const ACCOUNT_ICONS: AccountIcon[] = [
  { id: 'bank', label: 'Banco' },
  { id: 'cash', label: 'Dinheiro' },
  { id: 'wallet', label: 'Carteira' },
  { id: 'piggy-bank', label: 'Poupança' },
  { id: 'credit-card', label: 'Cartão' },
];

export default function ConfigureAccounts({ navigation }: any) {
  const { colors } = useAppTheme();
  
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<AccountIconType>('bank');
  const [initialBalance, setInitialBalance] = useState('');
  const [loading, setLoading] = useState(false);

  // Mock de contas existentes
  const [accounts] = useState([
    { id: '1', name: 'Nubank', icon: 'bank' as AccountIconType, balance: 1500.00 },
    { id: '2', name: 'Carteira', icon: 'wallet' as AccountIconType, balance: 150.00 },
  ]);

  async function handleCreate() {
    if (!name.trim()) return;
    
    setLoading(true);
    // TODO: Implementar criação de conta no Firebase
    setTimeout(() => {
      setLoading(false);
      setName('');
      setInitialBalance('');
    }, 500);
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
        {/* Contas existentes */}
        {accounts.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              SUAS CONTAS
            </Text>
            <View style={[styles.card, { backgroundColor: colors.card }, getShadow(colors)]}>
              {accounts.map((account, index) => (
                <Pressable
                  key={account.id}
                  style={[
                    styles.accountItem,
                    index < accounts.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                  ]}
                >
                  <View style={[styles.iconCircle, { backgroundColor: colors.primary + '20' }]}>
                    <MaterialCommunityIcons name={account.icon} size={20} color={colors.primary} />
                  </View>
                  <View style={styles.accountInfo}>
                    <Text style={[styles.accountName, { color: colors.text }]}>{account.name}</Text>
                    <Text style={[styles.accountBalance, { color: colors.textSecondary }]}>
                      R$ {account.balance.toFixed(2)}
                    </Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textMuted} />
                </Pressable>
              ))}
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

            {/* Ícone */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Tipo da conta</Text>
              <View style={styles.iconGrid}>
                {ACCOUNT_ICONS.map((icon) => (
                  <Pressable
                    key={icon.id}
                    onPress={() => setSelectedIcon(icon.id)}
                    style={[
                      styles.iconOption,
                      { borderColor: selectedIcon === icon.id ? colors.primary : colors.border },
                      selectedIcon === icon.id && { backgroundColor: colors.primary + '15' },
                    ]}
                  >
                    <MaterialCommunityIcons 
                      name={icon.id} 
                      size={24} 
                      color={selectedIcon === icon.id ? colors.primary : colors.textMuted} 
                    />
                    <Text 
                      style={[
                        styles.iconLabel, 
                        { color: selectedIcon === icon.id ? colors.primary : colors.textMuted },
                      ]}
                    >
                      {icon.label}
                    </Text>
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

            {/* Botão */}
            <Pressable
              onPress={handleCreate}
              disabled={loading || !name.trim()}
              style={({ pressed }) => [
                styles.createButton,
                { backgroundColor: colors.primary },
                pressed && { opacity: 0.9 },
                (loading || !name.trim()) && { opacity: 0.6 },
              ]}
            >
              <MaterialCommunityIcons name="plus" size={20} color="#fff" />
              <Text style={styles.createButtonText}>
                {loading ? 'Criando...' : 'Criar conta'}
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
  accountItem: {
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
  accountInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '500',
  },
  accountBalance: {
    fontSize: 14,
    marginTop: 2,
  },
  formGroup: {
    padding: spacing.md,
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
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minWidth: 70,
  },
  iconLabel: {
    fontSize: 11,
    marginTop: 4,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: spacing.md,
    marginTop: 0,
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
