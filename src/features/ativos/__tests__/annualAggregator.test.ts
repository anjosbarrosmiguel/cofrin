import {
    getProventosYearDetails,
    getTradeYearDetails,
    summarizeProventosByYear,
    summarizeProventosOverall,
    summarizeTradesByYear,
} from '../annualAggregator';
import type { OperacaoAtivo } from '../../../types/ativos';

describe('annualAggregator', () => {
  it('agrupa compras e vendas por ano e ticker', () => {
    const ops: OperacaoAtivo[] = [
      {
        idOperacao: '1',
        data: new Date('2019-01-10'),
        ticker: 'ABEV3',
        tipo: 'COMPRA',
        quantidade: 10,
        precoUnitario: 10,
        valorTotal: 100,
        corretora: 'X',
      },
      {
        idOperacao: '2',
        data: new Date('2019-06-01'),
        ticker: 'ABEV3',
        tipo: 'VENDA',
        quantidade: 2,
        precoUnitario: 12,
        valorTotal: 24,
        corretora: 'X',
      },
      {
        idOperacao: '3',
        data: new Date('2020-02-01'),
        ticker: 'ITUB4',
        tipo: 'COMPRA',
        quantidade: 5,
        precoUnitario: 20,
        valorTotal: 100,
        corretora: 'X',
      },
    ];

    const years = summarizeTradesByYear(ops);
    expect(years.map((y) => y.ano)).toEqual([2020, 2019]);

    const y2019 = years.find((y) => y.ano === 2019)!;
    expect(y2019.totalComprasValor).toBe(100);
    expect(y2019.totalVendasValor).toBe(24);
    expect(y2019.tickersCount).toBe(1);

    const details2019 = getTradeYearDetails(ops, 2019);
    expect(details2019).toHaveLength(1);
    expect(details2019[0].ticker).toBe('ABEV3');
    expect(details2019[0].comprasQtd).toBe(10);
    expect(details2019[0].vendasQtd).toBe(2);
  });

  it('agrupa proventos (DIVIDENDO/JCP) por ano e ticker', () => {
    const ops: OperacaoAtivo[] = [
      {
        idOperacao: '1',
        data: new Date('2019-01-10'),
        ticker: 'HGLG11',
        tipo: 'DIVIDENDO',
        quantidade: 0,
        precoUnitario: 0,
        valorTotal: 50,
        corretora: 'X',
      },
      {
        idOperacao: '2',
        data: new Date('2019-02-10'),
        ticker: 'ITUB4',
        tipo: 'JCP',
        quantidade: 0,
        precoUnitario: 0,
        valorTotal: 30,
        corretora: 'X',
      },
      {
        idOperacao: '3',
        data: new Date('2019-03-10'),
        ticker: 'ITUB4',
        tipo: 'DIVIDENDO',
        quantidade: 0,
        precoUnitario: 0,
        valorTotal: 20,
        corretora: 'X',
      },
    ];

    const years = summarizeProventosByYear(ops);
    expect(years).toHaveLength(1);
    expect(years[0].ano).toBe(2019);
    expect(years[0].total).toBe(100);
    expect(years[0].totalFii).toBe(50);
    expect(years[0].totalOutros).toBe(50);
    expect(years[0].totalDividendos).toBe(70);
    expect(years[0].totalJcp).toBe(30);
    expect(years[0].tickersCount).toBe(2);

    const details2019 = getProventosYearDetails(ops, 2019);
    const itub = details2019.find((t) => t.ticker === 'ITUB4')!;
    expect(itub.dividendos).toBe(20);
    expect(itub.jcp).toBe(30);
    expect(itub.total).toBe(50);
  });

  it('calcula resumo geral e maiores pagadores', () => {
    const ops: OperacaoAtivo[] = [
      {
        idOperacao: '1',
        data: new Date('2019-01-10'),
        ticker: 'HGLG11',
        tipo: 'DIVIDENDO',
        quantidade: 0,
        precoUnitario: 0,
        valorTotal: 50,
        corretora: 'X',
      },
      {
        idOperacao: '2',
        data: new Date('2019-02-10'),
        ticker: 'ITUB4',
        tipo: 'JCP',
        quantidade: 0,
        precoUnitario: 0,
        valorTotal: 30,
        corretora: 'X',
      },
      {
        idOperacao: '3',
        data: new Date('2020-03-10'),
        ticker: 'ITUB4',
        tipo: 'DIVIDENDO',
        quantidade: 0,
        precoUnitario: 0,
        valorTotal: 25,
        corretora: 'X',
      },
    ];

    const overall = summarizeProventosOverall(ops, 5);
    expect(overall.total).toBe(105);
    expect(overall.totalDividendos).toBe(75);
    expect(overall.totalJcp).toBe(30);
    expect(overall.totalFii).toBe(50);
    expect(overall.totalOutros).toBe(55);
    expect(overall.topPayers[0].ticker).toBe('ITUB4');
    expect(overall.topPayers[0].total).toBe(55);
  });
});
