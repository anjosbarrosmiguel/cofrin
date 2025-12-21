import { View, Text, StyleSheet, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppTheme } from "../contexts/themeContext";
import { spacing, borderRadius, getShadow } from "../theme";
import MainLayout from "../components/MainLayout";
import SimpleHeader from "../components/SimpleHeader";
import { FOOTER_HEIGHT } from "../components/AppFooter";
import { useMemo } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function About({ navigation }: any) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  const bottomPad = useMemo(
    () => FOOTER_HEIGHT + 6 + Math.max(insets.bottom, 8) + spacing.lg,
    [insets.bottom]
  );

  return (
    <MainLayout>
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Header simples */}
      <SimpleHeader title="Sobre o App" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad }]}
      >
        <View style={styles.centeredContainer}>
          <View style={styles.content}>
            {/* Logo e versão */}
            <View style={styles.logoSection}>
              <View style={[styles.logoCircle, { backgroundColor: colors.primary }]}>
                <MaterialCommunityIcons name="piggy-bank" size={64} color="#fff" />
              </View>
              <Text style={[styles.appName, { color: colors.text }]}>Cofrin</Text>
              <Text style={[styles.version, { color: colors.textMuted }]}>Versão 1.0.0</Text>
            </View>

            {/* Descrição */}
            <View style={[styles.card, { backgroundColor: colors.card }, getShadow(colors)]}>
              <Text style={[styles.cardTitle, { color: colors.primary }]}>
                💚 Nossa Missão
              </Text>
              <Text style={[styles.cardText, { color: colors.text }]}>
                Ajudar a família brasileira a ter controle financeiro de maneira prática, na palma da mão.
              </Text>
            </View>

            {/* Frase do Julius */}
            <View style={[styles.quoteCard, { backgroundColor: colors.card, borderLeftColor: colors.primary }]}>
              <View style={styles.quoteHeader}>
                <MaterialCommunityIcons name="format-quote-open" size={24} color={colors.primary} />
                <Text style={[styles.quoteAuthor, { color: colors.primary }]}>Julius</Text>
              </View>
              <Text style={[styles.quoteText, { color: colors.text }]}>
                "Dinheiro não dá em árvore! 💰"
              </Text>
              <Text style={[styles.quoteSource, { color: colors.textMuted }]}>
                — Todo Mundo Odeia o Chris
              </Text>
            </View>

            {/* Créditos */}
            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: colors.textMuted }]}>
                Feito com 💚 para as famílias brasileiras
              </Text>
              <Text style={[styles.footerText, { color: colors.textMuted, marginTop: 4 }]}>
                © 2024 Cofrin - Todos os direitos reservados
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
      </View>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  centeredContainer: {
    maxWidth: 1200,
    width: "100%",
    alignSelf: "center",
  },
  content: {
    padding: spacing.lg,
  },
  logoSection: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  appName: {
    fontSize: 28,
    fontWeight: "700",
  },
  version: {
    fontSize: 14,
    marginTop: 4,
  },
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: spacing.md,
  },
  cardText: {
    fontSize: 15,
    lineHeight: 22,
  },
  quoteCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
  },
  quoteHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  quoteAuthor: {
    fontSize: 16,
    fontWeight: "700",
  },
  quoteText: {
    fontSize: 18,
    fontStyle: "italic",
    lineHeight: 26,
  },
  quoteSource: {
    fontSize: 12,
    marginTop: spacing.sm,
  },
  footer: {
    alignItems: "center",
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
  },
  footerText: {
    fontSize: 12,
  },
});
