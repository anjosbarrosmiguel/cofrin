import type { OperacaoAtivo, TipoOperacaoAtivo } from '../../types/ativos';

export type AnnualTradeTickerSummary = {
  ticker: string;
  comprasQtd: number;
  comprasValor: number;
  vendasQtd: number;
  vendasValor: number;
};

export type AnnualTradeYearHeader = {
  ano: number;
  totalComprasQtd: number;
  totalComprasValor: number;
  totalVendasQtd: number;
  totalVendasValor: number;
  tickersCount: number;
};

export type AnnualProventTickerSummary = {
  ticker: string;
  isFii: boolean;
  dividendos: number;
  jcp: number;
  total: number;
};

export type AnnualProventYearHeader = {
  ano: number;
  total: number;
  totalDividendos: number;
  totalJcp: number;
  totalFii: number;
  totalOutros: number;
  tickersCount: number;
};

export type ProventosOverallSummary = {
  total: number;
  totalDividendos: number;
  totalJcp: number;
  totalFii: number;
  totalOutros: number;
  topPayers: AnnualProventTickerSummary[];
};

function yearOf(d: Date): number {
  return d.getFullYear();
}

function isFiiTicker(ticker: string): boolean {
  // Heurística simples e comum no BR: FIIs geralmente terminam com 11 (ex: HGLG11)
  return /\d\d$/.test(ticker) ? ticker.endsWith('11') : false;
}

function add(n: number, v: unknown): number {
  const x = typeof v === 'number' && Number.isFinite(v) ? v : Number(v);
  return n + (Number.isFinite(x) ? x : 0);
}

export function summarizeTradesByYear(operacoes: OperacaoAtivo[]): AnnualTradeYearHeader[] {
  const byYear = new Map<number, {
    totalComprasQtd: number;
    totalComprasValor: number;
    totalVendasQtd: number;
    totalVendasValor: number;
    tickers: Set<string>;
  }>();

  for (const op of operacoes) {
    if (op.tipo !== 'COMPRA' && op.tipo !== 'VENDA') continue;
    if (!op.ticker) continue;

    const ano = yearOf(op.data);
    const cur = byYear.get(ano) ?? {
      totalComprasQtd: 0,
      totalComprasValor: 0,
      totalVendasQtd: 0,
      totalVendasValor: 0,
      tickers: new Set<string>(),
    };

    cur.tickers.add(op.ticker);
    if (op.tipo === 'COMPRA') {
      cur.totalComprasQtd = add(cur.totalComprasQtd, op.quantidade);
      cur.totalComprasValor = add(cur.totalComprasValor, op.valorTotal);
    } else {
      cur.totalVendasQtd = add(cur.totalVendasQtd, op.quantidade);
      cur.totalVendasValor = add(cur.totalVendasValor, op.valorTotal);
    }

    byYear.set(ano, cur);
  }

  const out: AnnualTradeYearHeader[] = [];
  for (const [ano, sums] of byYear.entries()) {
    out.push({
      ano,
      totalComprasQtd: sums.totalComprasQtd,
      totalComprasValor: sums.totalComprasValor,
      totalVendasQtd: sums.totalVendasQtd,
      totalVendasValor: sums.totalVendasValor,
      tickersCount: sums.tickers.size,
    });
  }

  out.sort((a, b) => b.ano - a.ano);
  return out;
}

export function getTradeYearDetails(operacoes: OperacaoAtivo[], ano: number): AnnualTradeTickerSummary[] {
  const byTicker = new Map<string, AnnualTradeTickerSummary>();

  for (const op of operacoes) {
    if (yearOf(op.data) !== ano) continue;
    if (op.tipo !== 'COMPRA' && op.tipo !== 'VENDA') continue;
    if (!op.ticker) continue;

    const cur = byTicker.get(op.ticker) ?? {
      ticker: op.ticker,
      comprasQtd: 0,
      comprasValor: 0,
      vendasQtd: 0,
      vendasValor: 0,
    };

    if (op.tipo === 'COMPRA') {
      cur.comprasQtd = add(cur.comprasQtd, op.quantidade);
      cur.comprasValor = add(cur.comprasValor, op.valorTotal);
    } else {
      cur.vendasQtd = add(cur.vendasQtd, op.quantidade);
      cur.vendasValor = add(cur.vendasValor, op.valorTotal);
    }

    byTicker.set(op.ticker, cur);
  }

  const tickers = [...byTicker.values()].sort((a, b) => a.ticker.localeCompare(b.ticker));
  return tickers;
}

function isProventoTipo(tipo: TipoOperacaoAtivo): tipo is 'DIVIDENDO' | 'JCP' {
  return tipo === 'DIVIDENDO' || tipo === 'JCP';
}

export function summarizeProventosByYear(operacoes: OperacaoAtivo[]): AnnualProventYearHeader[] {
  const byYear = new Map<number, {
    total: number;
    totalDividendos: number;
    totalJcp: number;
    totalFii: number;
    totalOutros: number;
    tickers: Set<string>;
  }>();

  for (const op of operacoes) {
    if (!isProventoTipo(op.tipo)) continue;
    if (!op.ticker) continue;

    const ano = yearOf(op.data);
    const cur = byYear.get(ano) ?? {
      total: 0,
      totalDividendos: 0,
      totalJcp: 0,
      totalFii: 0,
      totalOutros: 0,
      tickers: new Set<string>(),
    };

    const isFii = isFiiTicker(op.ticker);
    const v = add(0, op.valorTotal);
    cur.tickers.add(op.ticker);

    cur.total = add(cur.total, v);
    if (op.tipo === 'DIVIDENDO') cur.totalDividendos = add(cur.totalDividendos, v);
    if (op.tipo === 'JCP') cur.totalJcp = add(cur.totalJcp, v);
    if (isFii) cur.totalFii = add(cur.totalFii, v);
    else cur.totalOutros = add(cur.totalOutros, v);

    byYear.set(ano, cur);
  }

  const out: AnnualProventYearHeader[] = [];
  for (const [ano, sums] of byYear.entries()) {
    out.push({
      ano,
      total: sums.total,
      totalDividendos: sums.totalDividendos,
      totalJcp: sums.totalJcp,
      totalFii: sums.totalFii,
      totalOutros: sums.totalOutros,
      tickersCount: sums.tickers.size,
    });
  }

  out.sort((a, b) => b.ano - a.ano);
  return out;
}

export function getProventosYearDetails(operacoes: OperacaoAtivo[], ano: number): AnnualProventTickerSummary[] {
  const byTicker = new Map<string, { dividendos: number; jcp: number }>();

  for (const op of operacoes) {
    if (yearOf(op.data) !== ano) continue;
    if (!isProventoTipo(op.tipo)) continue;
    if (!op.ticker) continue;

    const cur = byTicker.get(op.ticker) ?? { dividendos: 0, jcp: 0 };
    const v = add(0, op.valorTotal);
    if (op.tipo === 'DIVIDENDO') cur.dividendos = add(cur.dividendos, v);
    if (op.tipo === 'JCP') cur.jcp = add(cur.jcp, v);
    byTicker.set(op.ticker, cur);
  }

  const out: AnnualProventTickerSummary[] = [];
  for (const [ticker, sums] of byTicker.entries()) {
    const total = add(sums.dividendos, sums.jcp);
    out.push({
      ticker,
      isFii: isFiiTicker(ticker),
      dividendos: sums.dividendos,
      jcp: sums.jcp,
      total,
    });
  }

  out.sort((a, b) => a.ticker.localeCompare(b.ticker));
  return out;
}

export function summarizeProventosOverall(operacoes: OperacaoAtivo[], topN: number = 5): ProventosOverallSummary {
  let total = 0;
  let totalDividendos = 0;
  let totalJcp = 0;
  let totalFii = 0;
  let totalOutros = 0;

  const byTicker = new Map<string, { dividendos: number; jcp: number }>();

  for (const op of operacoes) {
    if (!isProventoTipo(op.tipo)) continue;
    if (!op.ticker) continue;

    const v = add(0, op.valorTotal);
    total = add(total, v);
    if (op.tipo === 'DIVIDENDO') totalDividendos = add(totalDividendos, v);
    if (op.tipo === 'JCP') totalJcp = add(totalJcp, v);

    const isFii = isFiiTicker(op.ticker);
    if (isFii) totalFii = add(totalFii, v);
    else totalOutros = add(totalOutros, v);

    const cur = byTicker.get(op.ticker) ?? { dividendos: 0, jcp: 0 };
    if (op.tipo === 'DIVIDENDO') cur.dividendos = add(cur.dividendos, v);
    if (op.tipo === 'JCP') cur.jcp = add(cur.jcp, v);
    byTicker.set(op.ticker, cur);
  }

  const topPayers: AnnualProventTickerSummary[] = [];
  for (const [ticker, sums] of byTicker.entries()) {
    const totalTicker = add(sums.dividendos, sums.jcp);
    topPayers.push({
      ticker,
      isFii: isFiiTicker(ticker),
      dividendos: sums.dividendos,
      jcp: sums.jcp,
      total: totalTicker,
    });
  }

  topPayers.sort((a, b) => b.total - a.total);

  return {
    total,
    totalDividendos,
    totalJcp,
    totalFii,
    totalOutros,
    topPayers: topPayers.slice(0, Math.max(0, topN)),
  };
}
