import type { OperacaoAtivo, PosicaoAtivo } from '../../types/ativos';

export function calculatePositions(operacoes: OperacaoAtivo[]): PosicaoAtivo[] {
  const byTicker = new Map<string, {
    comprasQtd: number;
    vendasQtd: number;
    comprasValor: number;
    vendasValor: number;
  }>();

  for (const op of operacoes) {
    const ticker = op.ticker;
    if (!ticker) continue;

    const cur = byTicker.get(ticker) ?? { comprasQtd: 0, vendasQtd: 0, comprasValor: 0, vendasValor: 0 };

    if (op.tipo === 'COMPRA') {
      cur.comprasQtd += op.quantidade;
      cur.comprasValor += op.valorTotal;
    } else if (op.tipo === 'VENDA') {
      cur.vendasQtd += op.quantidade;
      cur.vendasValor += op.valorTotal;
    }

    byTicker.set(ticker, cur);
  }

  const positions: PosicaoAtivo[] = [];

  for (const [ticker, sums] of byTicker.entries()) {
    const quantidadeAtual = sums.comprasQtd - sums.vendasQtd;

    const denom = quantidadeAtual;
    const numer = (sums.comprasValor - sums.vendasValor);

    const precoMedio = denom !== 0 ? numer / denom : 0;
    const valorInvestido = quantidadeAtual * precoMedio;

    positions.push({
      ticker,
      quantidadeAtual,
      precoMedio,
      valorInvestido,
    });
  }

  // Stable ordering
  positions.sort((a, b) => a.ticker.localeCompare(b.ticker));
  return positions;
}
