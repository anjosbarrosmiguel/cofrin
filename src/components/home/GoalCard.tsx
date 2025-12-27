import React, { memo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../contexts/themeContext';
import { DS_COLORS, DS_TYPOGRAPHY, DS_ICONS, DS_CARD, DS_SPACING } from '../../theme/designSystem';

interface Props {
  onPress: () => void;
}

export default memo(function GoalCard({ onPress }: Props) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: DS_COLORS.card },
        pressed && { opacity: 0.95 }
      ]}
    >
      <View style={[styles.iconCircle, { backgroundColor: DS_COLORS.primaryLight }]}>
        <MaterialCommunityIcons name="target" size={DS_ICONS.size.default} color={DS_ICONS.color} />
      </View>
      <Text style={[styles.title, { color: DS_COLORS.primary }]}>Metas financeiras</Text>
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
    marginBottom: 0,
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
