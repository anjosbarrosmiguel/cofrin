import { calculatePositions } from '../aggregator';
import type { OperacaoAtivo } from '../../../types/ativos';

describe('calculatePositions', () => {
  it('calcula PM com compras e vendas e ignora dividendos/JCP', () => {
    const ops: OperacaoAtivo[] = [
      {
        idOperacao: '1',
        data: new Date('2025-01-01'),
        ticker: 'ABEV3',
        tipo: 'COMPRA',
        quantidade: 100,
        precoUnitario: 10,
        valorTotal: 1000,
        corretora: 'X',
      },
      {
        idOperacao: '2',
        data: new Date('2025-02-01'),
        ticker: 'ABEV3',
        tipo: 'VENDA',
        quantidade: 20,
        precoUnitario: 12,
        valorTotal: 240,
        corretora: 'X',
      },
      {
        idOperacao: '3',
        data: new Date('2025-03-01'),
        ticker: 'ABEV3',
        tipo: 'DIVIDENDO',
        quantidade: 0,
        precoUnitario: 0,
        valorTotal: 50,
        corretora: 'X',
      },
    ];

    const [p] = calculatePositions(ops);
    expect(p.ticker).toBe('ABEV3');
    expect(p.quantidadeAtual).toBe(80);
    // (1000 - 240) / (100 - 20) = 760 / 80 = 9.5
    expect(p.precoMedio).toBeCloseTo(9.5, 6);
    expect(p.valorInvestido).toBeCloseTo(760, 6);
  });

  it('zera precoMedio quando quantidadeAtual = 0', () => {
    const ops: OperacaoAtivo[] = [
      {
        idOperacao: '1',
        data: new Date('2025-01-01'),
        ticker: 'ITUB4',
        tipo: 'COMPRA',
        quantidade: 10,
        precoUnitario: 10,
        valorTotal: 100,
        corretora: 'X',
      },
      {
        idOperacao: '2',
        data: new Date('2025-02-01'),
        ticker: 'ITUB4',
        tipo: 'VENDA',
        quantidade: 10,
        precoUnitario: 12,
        valorTotal: 120,
        corretora: 'X',
      },
    ];

    const [p] = calculatePositions(ops);
    expect(p.quantidadeAtual).toBe(0);
    expect(p.precoMedio).toBe(0);
    expect(p.valorInvestido).toBe(0);
  });
});
