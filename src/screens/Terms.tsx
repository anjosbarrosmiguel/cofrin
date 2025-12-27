import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Design System Roxo Premium
const TERMS_COLORS = {
  primary: '#28043b',      // cor primária
  primaryDark: '#28043b',  // variação escura
  primaryLight: '#7B5CD6', // roxo claro
};

export default function Terms({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="piggy-bank" size={24} color="#fff" />
            </View>
            <Text style={styles.appName}>Cofrin</Text>
          </View>
          <Text style={styles.tagline}>Controle financeiro pessoal</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Termos de Uso</Text>

          {/* Alerta de Versão Beta */}
          <View style={styles.warningBox}>
            <MaterialCommunityIcons name="alert-circle" size={24} color="#D97706" />
            <View style={styles.warningContent}>
              <Text style={styles.warningTitle}>Versão de Testes (Beta)</Text>
              <Text style={styles.warningText}>
                Este aplicativo está em fase de testes e desenvolvimento contínuo. 
                Podem ocorrer erros, inconsistências ou perda de dados.
              </Text>
            </View>
          </View>

          {/* Seção 1 */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="shield-alert-outline" size={20} color={TERMS_COLORS.primary} />
              <Text style={styles.sectionTitle}>1. Isenção de Responsabilidade</Text>
            </View>
            <Text style={styles.paragraph}>
              O aplicativo <Text style={styles.bold}>Cofrin versão 1.0.0</Text> é fornecido "como está", 
              em caráter experimental e educacional. Os desenvolvedores <Text style={styles.bold}>não se 
              responsabilizam</Text> por:
            </Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>• Erros de cálculo ou processamento de dados</Text>
              <Text style={styles.listItem}>• Inconsistências nos relatórios gerados</Text>
              <Text style={styles.listItem}>• Perda ou corrupção de dados armazenados</Text>
              <Text style={styles.listItem}>• Decisões financeiras tomadas com base no aplicativo</Text>
              <Text style={styles.listItem}>• Problemas técnicos, bugs ou falhas no sistema</Text>
              <Text style={styles.listItem}>• Indisponibilidade temporária ou permanente do serviço</Text>
            </View>
          </View>

          {/* Seção 2 */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="account-check-outline" size={20} color={TERMS_COLORS.primary} />
              <Text style={styles.sectionTitle}>2. Responsabilidade do Usuário</Text>
            </View>
            <Text style={styles.paragraph}>
              Ao utilizar este aplicativo, você concorda e reconhece que:
            </Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>
                • <Text style={styles.bold}>Você é o único responsável</Text> por validar todas as informações 
                apresentadas no aplicativo contra suas contas bancárias originais
              </Text>
              <Text style={styles.listItem}>
                • Deve <Text style={styles.bold}>sempre consultar suas contas oficiais</Text> (banco, cartão de 
                crédito, investimentos) antes de tomar qualquer decisão financeira
              </Text>
              <Text style={styles.listItem}>
                • Os relatórios e análises fornecidos pelo aplicativo são <Text style={styles.bold}>apenas 
                ferramentas auxiliares</Text> e não substituem consultoria financeira profissional
              </Text>
              <Text style={styles.listItem}>
                • Não deve tomar decisões financeiras importantes baseando-se exclusivamente nos dados do aplicativo
              </Text>
              <Text style={styles.listItem}>
                • É responsável por manter backups externos de suas informações financeiras
              </Text>
            </View>
          </View>

          {/* Seção 3 */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="database-alert-outline" size={20} color={TERMS_COLORS.primary} />
              <Text style={styles.sectionTitle}>3. Precisão dos Dados</Text>
            </View>
            <Text style={styles.paragraph}>
              Este aplicativo <Text style={styles.bold}>não garante</Text>:
            </Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>• Precisão absoluta nos cálculos de saldo e despesas</Text>
              <Text style={styles.listItem}>• Sincronização perfeita com suas contas bancárias reais</Text>
              <Text style={styles.listItem}>• Atualização em tempo real das informações</Text>
              <Text style={styles.listItem}>• Integridade permanente dos dados armazenados</Text>
            </View>
            <Text style={styles.paragraph}>
              <Text style={styles.bold}>Importante:</Text> O aplicativo funciona como um caderno digital 
              para controle manual de finanças. Todas as informações inseridas são de responsabilidade 
              do usuário e devem ser conferidas periodicamente.
            </Text>
          </View>

          {/* Seção 4 */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="flask-outline" size={20} color={TERMS_COLORS.primary} />
              <Text style={styles.sectionTitle}>4. Natureza Experimental</Text>
            </View>
            <Text style={styles.paragraph}>
              Por ser uma versão beta (1.0.0), o aplicativo:
            </Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>• Está em constante desenvolvimento e atualização</Text>
              <Text style={styles.listItem}>• Pode apresentar bugs, falhas ou comportamentos inesperados</Text>
              <Text style={styles.listItem}>• Pode sofrer alterações significativas sem aviso prévio</Text>
              <Text style={styles.listItem}>• Pode ter funcionalidades removidas ou modificadas</Text>
              <Text style={styles.listItem}>• Pode ser descontinuado a qualquer momento</Text>
            </View>
          </View>

          {/* Seção 5 */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="shield-lock-outline" size={20} color={TERMS_COLORS.primary} />
              <Text style={styles.sectionTitle}>5. Privacidade e Segurança</Text>
            </View>
            <Text style={styles.paragraph}>
              Embora utilizemos medidas de segurança (Firebase Authentication), recomendamos:
            </Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>• Não armazenar informações extremamente sensíveis</Text>
              <Text style={styles.listItem}>• Usar senhas fortes e únicas</Text>
              <Text style={styles.listItem}>• Não compartilhar suas credenciais de acesso</Text>
              <Text style={styles.listItem}>• Fazer logout em dispositivos compartilhados</Text>
            </View>
          </View>

          {/* Seção 6 */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="hand-okay" size={20} color={TERMS_COLORS.primary} />
              <Text style={styles.sectionTitle}>6. Aceitação dos Termos</Text>
            </View>
            <Text style={styles.paragraph}>
              Ao utilizar este aplicativo, você declara que:
            </Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>• Leu e compreendeu todos os termos acima</Text>
              <Text style={styles.listItem}>• Aceita os riscos associados ao uso de software em versão beta</Text>
              <Text style={styles.listItem}>• Concorda em não responsabilizar os desenvolvedores por erros ou perdas</Text>
              <Text style={styles.listItem}>• Entende que este aplicativo é uma ferramenta auxiliar, não definitiva</Text>
            </View>
          </View>

          {/* Disclaimer Final */}
          <View style={styles.disclaimerBox}>
            <MaterialCommunityIcons name="information" size={20} color={TERMS_COLORS.primary} />
            <Text style={styles.disclaimerText}>
              <Text style={styles.bold}>Use com responsabilidade!</Text> Este aplicativo deve ser usado como 
              uma ferramenta de apoio ao controle financeiro pessoal. Sempre valide suas informações com suas 
              contas bancárias oficiais e consulte um profissional certificado para decisões financeiras importantes.
            </Text>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Cofrin v1.0.0 - Beta</Text>
            <Text style={styles.footerText}>Última atualização: Dezembro 2025</Text>
          </View>

          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [styles.acceptButton, pressed && styles.buttonPressed]}
          >
            <Text style={styles.acceptButtonText}>Entendi</Text>
            <MaterialCommunityIcons name="check" size={20} color="#fff" />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(108 42 143)',
  },
  header: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 12,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#F7F6F2',
    borderRadius: 16,
    padding: 24,
    marginTop: 16,
    marginBottom: 32,
    ...Platform.select({
      web: {
        maxWidth: 460,
        alignSelf: 'center',
        width: '100%',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 3,
      },
    }),
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: TERMS_COLORS.primary,
    textAlign: 'center',
    marginBottom: 20,
  },
  warningBox: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: TERMS_COLORS.primary,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    color: '#322438',
    marginBottom: 8,
  },
  bold: {
    fontWeight: '700',
  },
  list: {
    paddingLeft: 8,
    gap: 8,
  },
  listItem: {
    fontSize: 14,
    lineHeight: 22,
    color: '#322438',
  },
  disclaimerBox: {
    backgroundColor: '#E0F2FE',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  disclaimerText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#322438',
  },
  footer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    color: '#322438',
  },
  acceptButton: {
    backgroundColor: TERMS_COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
