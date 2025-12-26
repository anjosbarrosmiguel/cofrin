import { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, ActivityIndicator, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import MainLayout from '../components/MainLayout';
import SimpleHeader from '../components/SimpleHeader';
import { useAppTheme } from '../contexts/themeContext';
import { useAuth } from '../contexts/authContext';
import { prepareImportFromExcel } from '../features/ativos/pipeline';
import { importOperacoesAtivos } from '../services/ativoService';

export default function ImportarMovimentacoesAtivos({ navigation }: any) {
  const { colors } = useAppTheme();
  const { user } = useAuth();
  const canAccessAtivosBeta = (user?.email ?? '').toLowerCase() === 'thiago.w3c@gmail.com';

  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    totalLinhasLidas: number;
    totalOperacoesImportadas: number;
    totalOperacoesIgnoradasDuplicidade: number;
  } | null>(null);

  const canUseFile = useMemo(() => {
    return Platform.OS === 'web' && typeof File !== 'undefined';
  }, []);

  async function handlePickAndImport() {
    if (!user?.uid) return;
    if (!canAccessAtivosBeta) return;

    setError(null);
    setResult(null);
    setImporting(true);

    try {
      const picked: any = await DocumentPicker.getDocumentAsync({
        type: [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          // Some Android vendors report generic excel mimetype
          'application/vnd.ms-excel',
        ],
        multiple: false,
        copyToCacheDirectory: true,
      });

      if (picked?.canceled) {
        setImporting(false);
        return;
      }

      const asset = picked?.assets?.[0];
      const uri = asset?.uri as string | undefined;
      const file = asset?.file as File | undefined;

      if (!uri && !file) {
        throw new Error('Arquivo inválido');
      }

      const prepared = await prepareImportFromExcel(
        canUseFile && file instanceof File
          ? { kind: 'web-file', file }
          : { kind: 'uri', uri: uri! }
      );

      const saved = await importOperacoesAtivos(user.uid, prepared.operacoes);
      setResult(saved);
    } catch (e: any) {
      setError(e?.message ? String(e.message) : 'Falha ao importar o arquivo');
    } finally {
      setImporting(false);
    }
  }

  return (
    <MainLayout>
      <ScrollView style={[styles.root, { backgroundColor: colors.bg }]} contentContainerStyle={styles.scrollContent}>
        <SimpleHeader title="Importar movimentações" />

        <View style={styles.container}>
          {!canAccessAtivosBeta ? (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.title, { color: colors.text }]}>Recurso em beta</Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>Este recurso está habilitado apenas para um usuário beta.</Text>
            </View>
          ) : (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}> 
            <Text style={[styles.title, { color: colors.text }]}>Importe seu Excel (.xlsx)</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              As colunas precisam conter: Entrada/Saída, Data, Movimentação, Produto, Instituição, Quantidade, Preço unitário e Valor da Operação.
            </Text>

            <View style={{ height: 14 }} />

            <Pressable
              onPress={handlePickAndImport}
              disabled={importing}
              style={({ pressed }) => [
                styles.primaryButton,
                { backgroundColor: colors.primary, opacity: importing ? 0.6 : 1 },
                pressed && !importing && styles.buttonPressed,
              ]}
              accessibilityLabel="Selecionar Excel e importar"
            >
              <View style={styles.buttonContent}>
                {importing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <MaterialCommunityIcons name="file-upload" size={18} color="#fff" />
                )}
                <Text style={styles.primaryButtonText}>{importing ? 'Importando...' : 'Selecionar arquivo'}</Text>
              </View>
            </Pressable>

            {error ? (
              <View style={{ marginTop: 12 }}>
                <Text style={[styles.error, { color: colors.text }]}>{error}</Text>
              </View>
            ) : null}

            {result ? (
              <View style={{ marginTop: 12 }}>
                <Text style={[styles.resultLine, { color: colors.text }]}>
                  Linhas lidas: {result.totalLinhasLidas}
                </Text>
                <Text style={[styles.resultLine, { color: colors.text }]}>
                  Importadas: {result.totalOperacoesImportadas}
                </Text>
                <Text style={[styles.resultLine, { color: colors.text }]}>
                  Duplicadas ignoradas: {result.totalOperacoesIgnoradasDuplicidade}
                </Text>

                <View style={{ height: 12 }} />

                <Pressable
                  onPress={() => navigation.navigate('Minhas ações')}
                  style={({ pressed }) => [
                    styles.secondaryButton,
                    { backgroundColor: colors.primaryBg, borderColor: colors.primary },
                    pressed && styles.buttonPressed,
                  ]}
                  accessibilityLabel="Ver posições"
                >
                  <View style={styles.buttonContent}>
                    <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>Ver posições</Text>
                    <MaterialCommunityIcons name="arrow-right" size={16} color={colors.primary} />
                  </View>
                </Pressable>
              </View>
            ) : null}
          </View>
          )}
        </View>
      </ScrollView>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollContent: { paddingBottom: 24 },
  container: {
    maxWidth: 900,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
  },
  title: { fontSize: 16, fontWeight: '800' },
  subtitle: { marginTop: 8, fontSize: 13, fontWeight: '600', lineHeight: 18 },
  primaryButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  secondaryButtonText: {
    fontWeight: '800',
    fontSize: 14,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  error: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  resultLine: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
});
