import React, { memo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../contexts/themeContext';
import { DS_COLORS, DS_TYPOGRAPHY, DS_ICONS, DS_CARD, DS_SPACING } from '../theme/designSystem';

interface CategoryData {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  total: number;
}

interface Props {
  expenses?: CategoryData[];
  incomes?: CategoryData[];
  totalExpenses?: number;
  totalIncomes?: number;
}

export default memo(function TopCategoriesCard({
  expenses = [],
  incomes = [],
  totalExpenses = 0,
  totalIncomes = 0,
}: Props) {
  const { colors } = useAppTheme();
  const navigation = useNavigation<any>();

  const handlePressDetails = () => {
    navigation.navigate('CategoryDetails');
  };

  return (
    <Pressable
      onPress={handlePressDetails}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: DS_COLORS.card },
        pressed && { opacity: 0.95 }
      ]}
    >
      <View style={[styles.iconCircle, { backgroundColor: DS_COLORS.primaryLight }]}>
        <MaterialCommunityIcons name="chart-donut" size={DS_ICONS.size.default} color={DS_ICONS.color} />
      </View>
      <Text style={[styles.title, { color: DS_COLORS.primary }]}>Entenda seu dinheiro</Text>
      <MaterialCommunityIcons name="chevron-right" size={22} color={DS_COLORS.textMuted} />
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    ...DS_CARD,
    ...DS_CARD.shadow,
    width: '100%',
    marginBottom: DS_SPACING.lg,
  },
  iconCircle: {
    width: DS_ICONS.featured.containerSize,
    height: DS_ICONS.featured.containerSize,
    borderRadius: DS_ICONS.featured.containerSize / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: DS_SPACING.md,
  },
  title: {
    flex: 1,
    ...DS_TYPOGRAPHY.styles.cardSubtitle,
    color: DS_COLORS.primary,
  },
});

