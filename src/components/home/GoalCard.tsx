import React, { memo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../contexts/themeContext';
import { getShadow } from '../../theme';

// Cores do design system - Roxo
const primaryDark = '#4A2FA8';   // roxo escuro (títulos h1)
const primary = '#5B3CC4';       // roxo principal (botões, ícones)
const primaryBg = '#EDE9FF';     // fundo roxo suave (backgrounds de ícones)

interface Props {
  onPress: () => void;
}

export default memo(function GoalCard({ onPress }: Props) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.card, { backgroundColor: '#fff' }, getShadow(colors)]}>
      <View style={styles.header}>
        <View style={[styles.iconCircle, { backgroundColor: primaryBg }]}>
          <MaterialCommunityIcons name="target" size={20} color={primary} />
        </View>
        <Text style={[styles.title, { color: primaryDark }]}>Meta financeira</Text>
      </View>

      <Text style={[styles.description, { color: colors.textMuted }]}>
        Ter um objetivo claro torna suas escolhas financeiras mais fáceis.
      </Text>

      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: primary },
          pressed && { opacity: 0.85 }
        ]}
      >
        <Text style={styles.buttonText}>Acompanhar metas</Text>
        <MaterialCommunityIcons name="arrow-right" size={16} color="#fff" />
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    padding: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
