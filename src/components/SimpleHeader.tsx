import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../contexts/themeContext';
import { spacing } from '../theme';

interface SimpleHeaderProps {
  title: string;
}

export default function SimpleHeader({ title }: SimpleHeaderProps) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  
  const topPadding = Math.max(insets.top, 16) + spacing.md;

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { paddingTop: topPadding }]}>
        <Text style={[styles.title, { color: colors.primary }]}>{title}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
});
