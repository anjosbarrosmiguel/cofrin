import { useCallback, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, ActivityIndicator, Alert, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import MainLayout from '../components/MainLayout';
import SimpleHeader from '../components/SimpleHeader';
import { useAppTheme } from '../contexts/themeContext';
import { useAuth } from '../contexts/authContext';
import { deleteAllOperacoesAtivos, listOperacoesAtivos } from '../services/ativoService';
import { calculatePositions } from '../features/ativos/aggregator';
import {
    getProventosYearDetails,
    getTradeYearDetails,
    summarizeProventosByYear,
    summarizeProventosOverall,
    summarizeTradesByYear,
} from '../features/ativos/annualAggregator';
import { formatCurrencyBRL } from '../utils/format';
import type { OperacaoAtivo, PosicaoAtivo } from '../types/ativos';

export default function MinhasAcoes({ navigation }: any) {
  const { colors } = useAppTheme();
  const { user } = useAuth();
  const canAccessAtivosBeta = (user?.email ?? '').toLowerCase() === 'thiago.w3c@gmail.com';

  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [positions, setPositions] = useState<PosicaoAtivo[]>([]);
  const [operacoes, setOperacoes] = useState<OperacaoAtivo[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [expandedTradesYears, setExpandedTradesYears] = useState<Record<number, boolean>>({});
  const [expandedProventosYears, setExpandedProventosYears] = useState<Record<number, boolean>>({});
  const [tradeDetailsByYear, setTradeDetailsByYear] = useState<Record<number, any[]>>({});
  const [proventosDetailsByYear, setProventosDetailsByYear] = useState<Record<number, any[]>>({});

  const formatQty = useMemo(() => {
    try {
      return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 8 });
    } catch {
      return null;
    }
  }, []);

  const load = useCallback(async () => {
    if (!user?.uid) return;
    if (!canAccessAtivosBeta) {
      setOperacoes([]);
      setPositions([]);
      setError('Esse recurso está disponível apenas na versão beta.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const ops = await listOperacoesAtivos(user.uid);
      setOperacoes(ops);
      const pos = calculatePositions(ops);
      setPositions(pos);
    } catch (e: any) {
      setError(e?.message ? String(e.message) : 'Não foi possível carregar suas operações');
    } finally {
      setLoading(false);
    }
  }, [canAccessAtivosBeta, user?.uid]);

  const handleResetBase = useCallback(() => {
    if (!user?.uid) return;
    if (!canAccessAtivosBeta) return;
    if (deleting) return;

    const title = 'Zerar base de ações';
    const message = 'Isso vai apagar todas as suas movimentações de ações (compras, vendas, dividendos e JCP). Esta ação não pode ser desfeita. Deseja continuar?';

    const doReset = async () => {
      try {
        setDeleting(true);
        setError(null);

        // Feedback imediato na UI
        setOperacoes([]);
        setPositions([]);
        setExpandedTradesYears({});
        setExpandedProventosYears({});
        setTradeDetailsByYear({});
        setProventosDetailsByYear({});

        const res = await deleteAllOperacoesAtivos(user.uid);
        if (res.totalDeleted === 0) {
          // Ajuda a diagnosticar: botão funcionou, mas não havia nada para apagar
          console.log('[MinhasAcoes] deleteAllOperacoesAtivos: totalDeleted=0');
        } else {
          console.log('[MinhasAcoes] deleteAllOperacoesAtivos: totalDeleted=', res.totalDeleted);
        }

        await load();
      } catch (e: any) {
        setError(e?.message ? String(e.message) : 'Não foi possível zerar sua base');
        await load();
      } finally {
        setDeleting(false);
      }
    };

    if (Platform.OS === 'web') {
      const ok = window.confirm(`${title}\n\n${message}`);
      if (ok) void doReset();
      return;
    }

    Alert.alert(title, message, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Zerar', style: 'destructive', onPress: () => { void doReset(); } },
    ]);
  }, [canAccessAtivosBeta, deleting, load, user?.uid]);

  const positionsInCarteira = useMemo(
    () => positions.filter((p) => (Number(p.quantidadeAtual) || 0) > 0),
    [positions]
  );

  const tradesYears = useMemo(() => summarizeTradesByYear(operacoes), [operacoes]);
  const proventosYears = useMemo(() => summarizeProventosByYear(operacoes), [operacoes]);
  const proventosOverall = useMemo(() => summarizeProventosOverall(operacoes, 5), [operacoes]);

  const toggleTradesYear = useCallback((ano: number) => {
    setExpandedTradesYears((prev) => {
      const next = { ...prev, [ano]: !prev[ano] };
      return next;
    });

    setTradeDetailsByYear((prev) => {
      if (prev[ano]) return prev;
      const details = getTradeYearDetails(operacoes, ano);
      return { ...prev, [ano]: details };
    });
  }, [operacoes]);

  const toggleProventosYear = useCallback((ano: number) => {
    setExpandedProventosYears((prev) => {
      const next = { ...prev, [ano]: !prev[ano] };
      return next;
    });

    setProventosDetailsByYear((prev) => {
      if (prev[ano]) return prev;
      const details = getProventosYearDetails(operacoes, ano);
      return { ...prev, [ano]: details };
    });
  }, [operacoes]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (!canAccessAtivosBeta) {
    return (
      <MainLayout>
        <ScrollView style={[styles.root, { backgroundColor: colors.bg }]} contentContainerStyle={styles.scrollContent}>
          <SimpleHeader title="Minhas ações" />
          <View style={styles.container}>
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Recurso em beta</Text>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>Este recurso está habilitado apenas para um usuário beta.</Text>
            </View>
          </View>
        </ScrollView>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <ScrollView style={[styles.root, { backgroundColor: colors.bg }]} contentContainerStyle={styles.scrollContent}>
        <SimpleHeader title="Minhas ações" />

        <View style={styles.container}>
          <Pressable
            onPress={() => navigation.navigate('Importar movimentações')}
            style={({ pressed }) => [
              styles.primaryButton,
              { backgroundColor: colors.primary },
              pressed && styles.buttonPressed,
            ]}
            accessibilityLabel="Importar movimentações via Excel"
          >
            <View style={styles.buttonContent}>
              <MaterialCommunityIcons name="file-excel" size={18} color="#fff" />
              <Text style={styles.primaryButtonText}>Importar Excel</Text>
            </View>
          </Pressable>

          <View style={{ height: 10 }} />

          <Pressable
            onPress={handleResetBase}
            disabled={loading || deleting}
            style={({ pressed }) => [
              styles.secondaryButton,
              {
                backgroundColor: colors.dangerBg,
                borderColor: colors.danger,
                opacity: loading || deleting ? 0.6 : 1,
              },
              pressed && !(loading || deleting) && styles.buttonPressed,
            ]}
            accessibilityLabel="Zerar base de ações"
          >
            <View style={styles.buttonContent}>
              <MaterialCommunityIcons name="trash-can-outline" size={18} color={colors.danger} />
              <Text style={[styles.secondaryButtonText, { color: colors.danger }]}>
                {deleting ? 'Zerando base...' : 'Zerar base de ações'}
              </Text>
            </View>
          </Pressable>

          <View style={{ height: 16 }} />

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.textMuted }]}>Carregando posições...</Text>
            </View>
          ) : error ? (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}> 
              <Text style={[styles.errorTitle, { color: colors.text }]}>Erro</Text>
              <Text style={[styles.errorText, { color: colors.textMuted }]}>{error}</Text>
            </View>
          ) : positions.length === 0 ? (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}> 
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Nenhuma operação importada</Text>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                Importe um Excel para ver suas posições consolidadas.
              </Text>
            </View>
          ) : (
            <>
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}> 
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Minhas posições</Text>

                <View style={{ height: 8 }} />

                {positionsInCarteira.length === 0 ? (
                  <Text style={[styles.emptyText, { color: colors.textMuted }]}>Sem posições com quantidade maior que zero.</Text>
                ) : (
                  positionsInCarteira.map((p) => (
                    <View key={p.ticker} style={[styles.row, { borderBottomColor: colors.border }]}> 
                      <View style={styles.rowLeft}>
                        <Text style={[styles.ticker, { color: colors.text }]}>{p.ticker}</Text>
                        <Text style={[styles.sub, { color: colors.textMuted }]}>
                          Qtd: {formatQty ? formatQty.format(p.quantidadeAtual) : String(p.quantidadeAtual)}
                        </Text>
                      </View>

                      <View style={styles.rowRight}>
                        <Text style={[styles.amount, { color: colors.text }]}>{formatCurrencyBRL(p.valorInvestido)}</Text>
                        <Text style={[styles.sub, { color: colors.textMuted }]}>PM: {formatCurrencyBRL(p.precoMedio)}</Text>
                      </View>
                    </View>
                  ))
                )}
              </View>

              <View style={{ height: 16 }} />

              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}> 
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Panorama de proventos</Text>

                <View style={{ height: 8 }} />

                <View style={[styles.compactRow, { borderBottomColor: colors.border }]}> 
                  <Text style={[styles.compactLeft, { color: colors.textMuted }]}>Dividendos</Text>
                  <Text style={[styles.compactRight, { color: colors.text }]}>{formatCurrencyBRL(proventosOverall.totalDividendos)}</Text>
                </View>
                <View style={[styles.compactRow, { borderBottomColor: colors.border }]}> 
                  <Text style={[styles.compactLeft, { color: colors.textMuted }]}>JCP</Text>
                  <Text style={[styles.compactRight, { color: colors.text }]}>{formatCurrencyBRL(proventosOverall.totalJcp)}</Text>
                </View>
                <View style={[styles.compactRow, { borderBottomColor: colors.border }]}> 
                  <Text style={[styles.compactLeft, { color: colors.textMuted }]}>FIIs</Text>
                  <Text style={[styles.compactRight, { color: colors.text }]}>{formatCurrencyBRL(proventosOverall.totalFii)}</Text>
                </View>
                <View style={[styles.compactRow, { borderBottomColor: colors.border }]}> 
                  <Text style={[styles.compactLeft, { color: colors.textMuted }]}>Total</Text>
                  <Text style={[styles.compactRight, { color: colors.text }]}>{formatCurrencyBRL(proventosOverall.total)}</Text>
                </View>

                <View style={{ height: 14 }} />

                <Text style={[styles.sectionTitle, { color: colors.text }]}>Maiores pagadores</Text>

                {proventosOverall.topPayers.length === 0 ? (
                  <Text style={[styles.emptyText, { color: colors.textMuted, marginTop: 8 }]}>Nenhum dividendo/JCP identificado.</Text>
                ) : (
                  <View style={{ marginTop: 8 }}>
                    {proventosOverall.topPayers.map((t) => (
                      <View key={`top_${t.ticker}`} style={[styles.smallRow, { borderBottomColor: colors.border }]}> 
                        <Text style={[styles.smallLeft, { color: colors.text }]}>{t.ticker}</Text>
                        <Text style={[styles.smallRight, { color: colors.textMuted }]}>
                          Div: {formatCurrencyBRL(t.dividendos)} · JCP: {formatCurrencyBRL(t.jcp)} · Total: {formatCurrencyBRL(t.total)}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                <View style={{ height: 16 }} />

                <Text style={[styles.sectionTitle, { color: colors.text }]}>Proventos por ano</Text>

                {proventosYears.length === 0 ? (
                  <Text style={[styles.emptyText, { color: colors.textMuted, marginTop: 8 }]}>Nenhum dividendo/JCP identificado.</Text>
                ) : (
                  <View style={{ marginTop: 8 }}>
                    {proventosYears.map((year) => {
                      const expanded = !!expandedProventosYears[year.ano];
                      const details = proventosDetailsByYear[year.ano] as any[] | undefined;
                      return (
                        <View key={`prov_${year.ano}`} style={[styles.yearBox, { borderTopColor: colors.border }]}> 
                          <Pressable
                            onPress={() => toggleProventosYear(year.ano)}
                            style={({ pressed }) => [
                              styles.accordionHeader,
                              pressed && styles.buttonPressed,
                            ]}
                            accessibilityLabel={`Abrir/fechar proventos ${year.ano}`}
                          >
                            <View style={styles.accordionLeft}>
                              <Text style={[styles.yearTitle, { color: colors.text }]}>{year.ano}</Text>
                              <Text style={[styles.sub, { color: colors.textMuted }]}>
                                Total: {formatCurrencyBRL(year.total)} · Div: {formatCurrencyBRL(year.totalDividendos)} · JCP: {formatCurrencyBRL(year.totalJcp)} · FIIs: {formatCurrencyBRL(year.totalFii)}
                              </Text>
                            </View>
                            <MaterialCommunityIcons
                              name={expanded ? 'chevron-up' : 'chevron-down'}
                              size={20}
                              color={colors.textMuted}
                            />
                          </Pressable>

                          {expanded ? (
                            <View style={{ marginTop: 8 }}>
                              {(details ?? []).map((t) => (
                                <View key={`${year.ano}_prov_${t.ticker}`} style={[styles.smallRow, { borderBottomColor: colors.border }]}> 
                                  <Text style={[styles.smallLeft, { color: colors.text }]}>{t.ticker}</Text>
                                  <Text style={[styles.smallRight, { color: colors.textMuted }]}>
                                    Div: {formatCurrencyBRL(t.dividendos)} · JCP: {formatCurrencyBRL(t.jcp)} · Total: {formatCurrencyBRL(t.total)}
                                  </Text>
                                </View>
                              ))}
                            </View>
                          ) : null}
                        </View>
                      );
                    })}
                  </View>
                )}

                <View style={{ height: 16 }} />

                <Text style={[styles.sectionTitle, { color: colors.text }]}>Compras e vendas por ano</Text>

                {tradesYears.length === 0 ? (
                  <Text style={[styles.emptyText, { color: colors.textMuted, marginTop: 8 }]}>Sem compras/vendas para consolidar.</Text>
                ) : (
                  <View style={{ marginTop: 8 }}>
                    {tradesYears.map((year) => {
                      const expanded = !!expandedTradesYears[year.ano];
                      const details = tradeDetailsByYear[year.ano] as any[] | undefined;
                      return (
                        <View key={`tr_${year.ano}`} style={[styles.yearBox, { borderTopColor: colors.border }]}> 
                          <Pressable
                            onPress={() => toggleTradesYear(year.ano)}
                            style={({ pressed }) => [
                              styles.accordionHeader,
                              pressed && styles.buttonPressed,
                            ]}
                            accessibilityLabel={`Abrir/fechar compras e vendas ${year.ano}`}
                          >
                            <View style={styles.accordionLeft}>
                              <Text style={[styles.yearTitle, { color: colors.text }]}>{year.ano}</Text>
                              <Text style={[styles.sub, { color: colors.textMuted }]}>
                                Compras: {formatCurrencyBRL(year.totalComprasValor)} · Vendas: {formatCurrencyBRL(year.totalVendasValor)}
                              </Text>
                            </View>
                            <MaterialCommunityIcons
                              name={expanded ? 'chevron-up' : 'chevron-down'}
                              size={20}
                              color={colors.textMuted}
                            />
                          </Pressable>

                          {expanded ? (
                            <View style={{ marginTop: 8 }}>
                              {(details ?? []).map((t) => (
                                <View key={`${year.ano}_${t.ticker}`} style={[styles.smallRow, { borderBottomColor: colors.border }]}> 
                                  <Text style={[styles.smallLeft, { color: colors.text }]}>{t.ticker}</Text>
                                  <Text style={[styles.smallRight, { color: colors.textMuted }]}>
                                    C: {formatQty ? formatQty.format(t.comprasQtd) : String(t.comprasQtd)} ({formatCurrencyBRL(t.comprasValor)}) · V: {formatQty ? formatQty.format(t.vendasQtd) : String(t.vendasQtd)} ({formatCurrencyBRL(t.vendasValor)})
                                  </Text>
                                </View>
                              ))}
                            </View>
                          ) : null}
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            </>
          )}

          <View style={{ height: 24 }} />

          <Text style={[styles.betaNote, { color: colors.textMuted }]}>
            Beta: o cálculo de PM ignora dividendos e JCP. Proventos dependem do texto em “Movimentação” no seu Excel.
          </Text>
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
  primaryButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    paddingVertical: 12,
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
  loadingBox: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: '600',
  },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  rowLeft: { flex: 1 },
  rowRight: { alignItems: 'flex-end' },
  ticker: { fontSize: 16, fontWeight: '800' },
  amount: { fontSize: 14, fontWeight: '800' },
  sub: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  compactLeft: {
    fontSize: 12,
    fontWeight: '700',
  },
  compactRight: {
    fontSize: 12,
    fontWeight: '800',
  },
  yearBox: {
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 1,
  },
  yearTitle: {
    fontSize: 14,
    fontWeight: '900',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  accordionLeft: {
    flex: 1,
    paddingRight: 8,
  },
  smallRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    gap: 10,
  },
  smallLeft: {
    fontSize: 13,
    fontWeight: '800',
    flexShrink: 0,
  },
  smallRight: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  emptyTitle: { fontSize: 15, fontWeight: '800' },
  emptyText: { marginTop: 8, fontSize: 13, fontWeight: '600', lineHeight: 18 },
  errorTitle: { fontSize: 15, fontWeight: '800' },
  errorText: { marginTop: 8, fontSize: 13, fontWeight: '600', lineHeight: 18 },
  betaNote: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});
