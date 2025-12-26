import type { OperacaoAtivo, TipoOperacaoAtivo } from '../../types/ativos';
import { formatDateId } from './helpers';
import { sha256Hex } from './crypto';

export async function buildOperacaoId(input: {
  data: Date;
  tipo: TipoOperacaoAtivo;
  ticker: string;
  quantidade: number;
  valorTotal: number;
}): Promise<string> {
  const dateKey = formatDateId(input.data);
  const base = `${dateKey}-${input.tipo}-${input.ticker}-${input.quantidade}-${input.valorTotal}`;
  return sha256Hex(base);
}

export async function attachOperacaoId(op: Omit<OperacaoAtivo, 'idOperacao'>): Promise<OperacaoAtivo> {
  const idOperacao = await buildOperacaoId({
    data: op.data,
    tipo: op.tipo,
    ticker: op.ticker,
    quantidade: op.quantidade,
    valorTotal: op.valorTotal,
  });
  return { ...op, idOperacao };
}
