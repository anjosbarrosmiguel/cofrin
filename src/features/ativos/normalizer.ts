import type { OperacaoAtivo, TipoOperacaoAtivo } from '../../types/ativos';
import { extractTicker, parseBrazilianNumber, parseExcelDate } from './helpers';

export type ExcelRow = Record<string, unknown>;

export function inferTipoOperacao(row: ExcelRow): TipoOperacaoAtivo | null {
  const entradaSaida = String(row['Entrada/Saída'] ?? row['entrada/saída'] ?? row['entrada/saida'] ?? '').trim().toLowerCase();
  const movimentacao = String(row['Movimentação'] ?? row['movimentação'] ?? row['movimentacao'] ?? '').trim().toLowerCase();

  // Proventos / rendimentos (inclui FIIs)
  if (
    movimentacao.includes('dividend') ||
    movimentacao.includes('provento') ||
    movimentacao.includes('rendimento') ||
    movimentacao.includes('rendimentos')
  ) return 'DIVIDENDO';
  if (
    movimentacao.includes('juros sobre capital próprio') ||
    movimentacao.includes('juros sobre capital proprio') ||
    movimentacao.includes(' jcp') ||
    movimentacao === 'jcp'
  ) return 'JCP';

  // Eventos societários que alteram quantidade (ex.: bonificação de ações)
  // Tratamos como COMPRA com valorTotal 0 (dilui PM automaticamente).
  if (movimentacao.includes('bonifica')) return 'COMPRA';

  // Algumas corretoras trazem explicitamente compra/venda na movimentação
  if (movimentacao.includes('compra')) return 'COMPRA';
  if (movimentacao.includes('venda')) return 'VENDA';

  const entrada =
    entradaSaida.includes('entr') ||
    entradaSaida.includes('cr') ||
    entradaSaida.includes('cred') ||
    entradaSaida.includes('crédito') ||
    entradaSaida.includes('credito');
  const saida =
    entradaSaida.includes('saí') ||
    entradaSaida.includes('sai') ||
    entradaSaida.includes('deb') ||
    entradaSaida.includes('déb') ||
    entradaSaida.includes('débito') ||
    entradaSaida.includes('debito');

  // Transferência - Liquidação + Entrada/Saída (caixa)
  if (movimentacao.includes('transfer') && movimentacao.includes('liquida')) {
    // No extrato de ativos (custódia), Crédito normalmente significa entrada do ativo (equivalente a COMPRA)
    // e Débito significa saída do ativo (equivalente a VENDA).
    if (entrada) return 'COMPRA';
    if (saida) return 'VENDA';
  }

  return null;
}

export function normalizeOperacaoAtivo(row: ExcelRow): Omit<OperacaoAtivo, 'idOperacao'> | null {
  const data = parseExcelDate(row['Data'] ?? row['data']);
  const ticker = extractTicker(row['Produto'] ?? row['produto']);
  const tipo = inferTipoOperacao(row);

  const corretora = String(row['Instituição'] ?? row['Instituicao'] ?? row['instituição'] ?? row['instituicao'] ?? '').trim();
  // No Excel da corretora, valores podem vir com sinal (ex: COMPRA como débito negativo).
  // Para manter os cálculos consistentes, armazenamos tudo como números positivos.
  const quantidadeRaw = parseBrazilianNumber(row['Quantidade'] ?? row['quantidade']);
  const precoUnitarioRaw = parseBrazilianNumber(row['Preço unitário'] ?? row['Preco unitario'] ?? row['preço unitário'] ?? row['preco unitario'] ?? row['Preço unitário ']);
  const valorTotalRaw = parseBrazilianNumber(row['Valor da Operação'] ?? row['Valor da Operacao'] ?? row['valor da operação'] ?? row['valor da operacao']);

  const quantidade = Math.abs(quantidadeRaw);
  const precoUnitario = Math.abs(precoUnitarioRaw);
  const valorTotal = Math.abs(valorTotalRaw);

  if (!data || !ticker || !tipo) return null;

  return {
    data,
    ticker,
    tipo,
    quantidade,
    precoUnitario,
    valorTotal,
    corretora,
  };
}
