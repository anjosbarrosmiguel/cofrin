import { View, Text, Pressable, StyleSheet, ScrollView, Platform, ActivityIndicator } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppTheme } from "../contexts/themeContext";
import { useAuth } from "../contexts/authContext";
import { useCustomAlert } from "../hooks/useCustomAlert";
import { useState } from "react";
import CustomAlert from "../components/CustomAlert";
import MainLayout from "../components/MainLayout";
import { FOOTER_HEIGHT } from "../components/AppFooter";
import { spacing, borderRadius, getShadow } from "../theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMemo } from "react";

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  screen?: string;
  danger?: boolean;
}

export default function Settings({ navigation }: any) {
  const { colors } = useAppTheme();
  const { user } = useAuth();
  const { alertState, showAlert, hideAlert } = useCustomAlert();
  const insets = useSafeAreaInsets();
  const [deleting, setDeleting] = useState(false);

  const bottomPad = useMemo(
    () => FOOTER_HEIGHT + 6 + Math.max(insets.bottom, 8) + spacing.lg,
    [insets.bottom]
  );

  const userName = user?.displayName || user?.email?.split('@')[0] || 'Usuário';
  const userEmail = user?.email || '';

  const menuItems: MenuItem[] = [
    { id: "edit_profile", label: "Editar perfil", icon: "account-edit", screen: "EditProfile" },
    { id: "accounts", label: "Configurar contas", icon: "bank", screen: "ConfigureAccounts" },
    { id: "cards", label: "Cartões de crédito", icon: "credit-card", screen: "CreditCards" },
    { id: "categories", label: "Categorias", icon: "tag-multiple", screen: "Categories" },
    { id: "my_goals", label: "Meus objetivos", icon: "trophy", screen: "Meus Objetivos" },
  ];

  const secondaryItems: MenuItem[] = [
    { id: "education", label: "Educação financeira", icon: "school-outline", screen: "Education" },
    { id: "about", label: "Sobre o app", icon: "information-outline", screen: "About" },
  ];

  const dangerItems: MenuItem[] = [
    { id: "delete_account", label: "Deletar conta", icon: "delete-forever", danger: true },
  ];

  function handlePress(item: MenuItem) {
    if (item.id === 'delete_account') {
      handleDeleteAccount();
    } else if (item.screen) {
      navigation.navigate(item.screen);
    }
  }

  async function handleDeleteAccount() {
    showAlert(
      'Deletar conta',
      'Tem certeza que deseja deletar sua conta? Todos os seus dados serão permanentemente removidos e essa ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: confirmDeleteAccount,
        },
      ]
    );
  }

  async function confirmDeleteAccount() {
    if (!user?.uid) return;

    setDeleting(true);
    try {
      // Importar serviços necessários
      const { deleteDoc, collection, query, where, getDocs } = await import('firebase/firestore');
      const { deleteUser } = await import('firebase/auth');
      const { db, COLLECTIONS } = await import('../services/firebase');

      // Deletar todas as coleções do usuário
      const collectionsToDelete = [
        COLLECTIONS.TRANSACTIONS,
        COLLECTIONS.CATEGORIES,
        COLLECTIONS.ACCOUNTS,
        COLLECTIONS.CREDIT_CARDS,
        COLLECTIONS.CREDIT_CARD_BILLS,
        COLLECTIONS.GOALS,
      ];

      for (const collectionName of collectionsToDelete) {
        const q = query(
          collection(db, collectionName),
          where('userId', '==', user.uid)
        );
        const snapshot = await getDocs(q);
        
        // Deletar documentos em lotes
        const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
      }

      // Deletar a conta do Firebase Auth
      if (user) {
        await deleteUser(user as any);
      }

      // Nota: O logout é automático após deletar a conta do Firebase Auth
      showAlert('Conta deletada', 'Sua conta e todos os dados foram removidos com sucesso.');
    } catch (error: any) {
      console.error('Erro ao deletar conta:', error);
      showAlert('Erro', error.message || 'Não foi possível deletar a conta. Tente novamente.');
    } finally {
      setDeleting(false);
    }
  }

  function renderMenuItem(item: MenuItem, isLast: boolean) {
    const iconBgColor = item.danger ? colors.dangerBg : colors.primaryBg;
    const iconColor = item.danger ? colors.danger : colors.primary;
    const textColor = item.danger ? colors.danger : colors.text;

    return (
      <View key={item.id}>
        <Pressable
          onPress={() => handlePress(item)}
          style={({ pressed }) => [
            styles.row,
            { backgroundColor: pressed ? colors.grayLight : 'transparent' },
          ]}
          disabled={deleting}
        >
          <View style={[styles.iconCircle, { backgroundColor: iconBgColor }]}>
            <MaterialCommunityIcons name={item.icon as any} size={20} color={iconColor} />
          </View>
          <Text style={[styles.rowText, { color: textColor }]}>{item.label}</Text>
          {deleting && item.danger ? (
            <ActivityIndicator size="small" color={colors.danger} />
          ) : (
            <MaterialCommunityIcons 
              name="chevron-right"
              size={20} 
              color={colors.textMuted} 
            />
          )}
        </Pressable>
        {!isLast && (
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
        )}
      </View>
    );
  }

  return (
    <MainLayout>
      <ScrollView 
        style={[styles.scrollView, { backgroundColor: colors.bg }]} 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad }]}
      >
        {/* Header com perfil */}
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <View style={styles.headerInner}>
          {/* Botão voltar */}
          <Pressable 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
            hitSlop={12}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </Pressable>

          <View style={styles.profileSection}>
            <View style={styles.avatarCircle}>
              <MaterialCommunityIcons name="account" size={40} color={colors.primary} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{userName}</Text>
              <Text style={styles.userEmail}>{userEmail}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Cards de menu */}
      <View style={styles.centeredContainer}>
        <View style={styles.menuContainer}>
        {/* Menu principal */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            CONFIGURAÇÕES
          </Text>
          <View style={[styles.card, { backgroundColor: colors.card }, getShadow(colors)]}>
            {menuItems.map((item, idx) => renderMenuItem(item, idx === menuItems.length - 1))}
          </View>
        </View>

        {/* Menu secundário */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            SUPORTE
          </Text>
          <View style={[styles.card, { backgroundColor: colors.card }, getShadow(colors)]}>
            {secondaryItems.map((item, idx) => renderMenuItem(item, idx === secondaryItems.length - 1))}
          </View>
        </View>

        {/* Zona de perigo */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.danger }]}>
            ZONA DE PERIGO
          </Text>
          <View style={[styles.card, { backgroundColor: colors.card }, getShadow(colors)]}>
            {dangerItems.map((item, idx) => renderMenuItem(item, idx === dangerItems.length - 1))}
          </View>
        </View>
        </View>
      </View>
      </ScrollView>
      <CustomAlert {...alertState} onClose={hideAlert} />
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
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 24,
  },
  headerInner: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
  },
  backButton: {
    marginBottom: spacing.md,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  menuContainer: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  rowText: { 
    fontSize: 16, 
    flex: 1,
  },
  divider: {
    height: 1,
    marginLeft: 62,
  },
});
