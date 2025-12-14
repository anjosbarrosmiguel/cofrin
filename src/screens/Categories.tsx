import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Platform, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppTheme } from "../contexts/themeContext";
import { spacing, borderRadius, getShadow } from "../theme";

type CategoryType = 'expense' | 'income';

interface CategoryIcon {
  id: string;
  name: string;
}

const EXPENSE_ICONS: CategoryIcon[] = [
  { id: 'food', name: 'Alimentação' },
  { id: 'bus', name: 'Transporte' },
  { id: 'home', name: 'Moradia' },
  { id: 'hospital-box', name: 'Saúde' },
  { id: 'school', name: 'Educação' },
  { id: 'shopping', name: 'Compras' },
  { id: 'gamepad-variant', name: 'Lazer' },
  { id: 'dumbbell', name: 'Fitness' },
  { id: 'paw', name: 'Pets' },
  { id: 'car', name: 'Carro' },
  { id: 'cellphone', name: 'Telefone' },
  { id: 'wifi', name: 'Internet' },
  { id: 'lightning-bolt', name: 'Energia' },
  { id: 'water', name: 'Água' },
  { id: 'gas-station', name: 'Combustível' },
  { id: 'pill', name: 'Farmácia' },
  { id: 'gift', name: 'Presentes' },
  { id: 'dots-horizontal', name: 'Outros' },
];

const INCOME_ICONS: CategoryIcon[] = [
  { id: 'briefcase', name: 'Salário' },
  { id: 'cash-multiple', name: 'Freelance' },
  { id: 'chart-line', name: 'Investimentos' },
  { id: 'hand-coin', name: 'Dividendos' },
  { id: 'gift', name: 'Presente' },
  { id: 'sale', name: 'Vendas' },
  { id: 'cash-refund', name: 'Reembolso' },
  { id: 'dots-horizontal', name: 'Outros' },
];

export default function Categories({ navigation }: any) {
  const { colors } = useAppTheme();
  
  const [categoryType, setCategoryType] = useState<CategoryType>('expense');
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<string>('food');
  const [loading, setLoading] = useState(false);

  // Mock de categorias existentes
  const [categories] = useState({
    expense: [
      { id: '1', name: 'Alimentação', icon: 'food' },
      { id: '2', name: 'Transporte', icon: 'bus' },
      { id: '3', name: 'Lazer', icon: 'gamepad-variant' },
    ],
    income: [
      { id: '4', name: 'Salário', icon: 'briefcase' },
      { id: '5', name: 'Freelance', icon: 'cash-multiple' },
    ],
  });

  async function handleCreate() {
    if (!name.trim()) return;
    
    setLoading(true);
    // TODO: Implementar criação no Firebase
    setTimeout(() => {
      setLoading(false);
      setName('');
    }, 500);
  }

  const icons = categoryType === 'expense' ? EXPENSE_ICONS : INCOME_ICONS;
  const currentCategories = categories[categoryType];

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
        <Text style={styles.headerTitle}>Categorias</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Tipo de categoria */}
        <View style={styles.typeSelector}>
          <Pressable
            onPress={() => {
              setCategoryType('expense');
              setSelectedIcon('food');
            }}
            style={[
              styles.typeButton,
              { 
                backgroundColor: categoryType === 'expense' ? colors.expense : 'transparent',
                borderColor: colors.expense,
              },
            ]}
          >
            <MaterialCommunityIcons 
              name="arrow-down-circle" 
              size={18} 
              color={categoryType === 'expense' ? '#fff' : colors.expense} 
            />
            <Text style={[
              styles.typeButtonText,
              { color: categoryType === 'expense' ? '#fff' : colors.expense },
            ]}>
              Despesas
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setCategoryType('income');
              setSelectedIcon('briefcase');
            }}
            style={[
              styles.typeButton,
              { 
                backgroundColor: categoryType === 'income' ? colors.income : 'transparent',
                borderColor: colors.income,
              },
            ]}
          >
            <MaterialCommunityIcons 
              name="arrow-up-circle" 
              size={18} 
              color={categoryType === 'income' ? '#fff' : colors.income} 
            />
            <Text style={[
              styles.typeButtonText,
              { color: categoryType === 'income' ? '#fff' : colors.income },
            ]}>
              Receitas
            </Text>
          </Pressable>
        </View>

        {/* Categorias existentes */}
        {currentCategories.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              {categoryType === 'expense' ? 'CATEGORIAS DE DESPESA' : 'CATEGORIAS DE RECEITA'}
            </Text>
            <View style={[styles.card, { backgroundColor: colors.card }, getShadow(colors)]}>
              <View style={styles.categoriesGrid}>
                {currentCategories.map((cat) => (
                  <View key={cat.id} style={styles.categoryChip}>
                    <View style={[
                      styles.categoryIcon, 
                      { backgroundColor: (categoryType === 'expense' ? colors.expense : colors.income) + '20' }
                    ]}>
                      <MaterialCommunityIcons 
                        name={cat.icon as any} 
                        size={16} 
                        color={categoryType === 'expense' ? colors.expense : colors.income} 
                      />
                    </View>
                    <Text style={[styles.categoryName, { color: colors.text }]}>{cat.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Nova categoria */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            CRIAR NOVA CATEGORIA
          </Text>
          <View style={[styles.card, { backgroundColor: colors.card }, getShadow(colors)]}>
            {/* Nome */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Nome da categoria</Text>
              <View style={[styles.inputContainer, { borderColor: colors.border }]}>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Ex: Restaurantes, Academia..."
                  placeholderTextColor={colors.textMuted}
                  style={[styles.input, { color: colors.text }]}
                />
              </View>
            </View>

            {/* Ícone */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Ícone</Text>
              <View style={styles.iconGrid}>
                {icons.map((icon) => (
                  <Pressable
                    key={icon.id}
                    onPress={() => setSelectedIcon(icon.id)}
                    style={[
                      styles.iconOption,
                      { 
                        borderColor: selectedIcon === icon.id 
                          ? (categoryType === 'expense' ? colors.expense : colors.income) 
                          : colors.border,
                      },
                      selectedIcon === icon.id && { 
                        backgroundColor: (categoryType === 'expense' ? colors.expense : colors.income) + '15' 
                      },
                    ]}
                  >
                    <MaterialCommunityIcons 
                      name={icon.id as any} 
                      size={22} 
                      color={selectedIcon === icon.id 
                        ? (categoryType === 'expense' ? colors.expense : colors.income) 
                        : colors.textMuted
                      } 
                    />
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Preview */}
            <View style={[styles.previewContainer, { borderColor: colors.border }]}>
              <Text style={[styles.previewLabel, { color: colors.textMuted }]}>Preview:</Text>
              <View style={styles.previewChip}>
                <View style={[
                  styles.categoryIcon, 
                  { backgroundColor: (categoryType === 'expense' ? colors.expense : colors.income) + '20' }
                ]}>
                  <MaterialCommunityIcons 
                    name={selectedIcon as any} 
                    size={16} 
                    color={categoryType === 'expense' ? colors.expense : colors.income} 
                  />
                </View>
                <Text style={[styles.categoryName, { color: colors.text }]}>
                  {name || 'Nova categoria'}
                </Text>
              </View>
            </View>

            {/* Botão */}
            <Pressable
              onPress={handleCreate}
              disabled={loading || !name.trim()}
              style={({ pressed }) => [
                styles.createButton,
                { backgroundColor: categoryType === 'expense' ? colors.expense : colors.income },
                pressed && { opacity: 0.9 },
                (loading || !name.trim()) && { opacity: 0.6 },
              ]}
            >
              <MaterialCommunityIcons name="plus" size={20} color="#fff" />
              <Text style={styles.createButtonText}>
                {loading ? 'Criando...' : 'Criar categoria'}
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
  typeSelector: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    gap: spacing.xs,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
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
    padding: spacing.md,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: borderRadius.full,
    backgroundColor: 'transparent',
  },
  categoryIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '500',
  },
  formGroup: {
    marginBottom: spacing.md,
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
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: spacing.md,
    marginTop: spacing.sm,
    gap: spacing.md,
  },
  previewLabel: {
    fontSize: 13,
  },
  previewChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
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
