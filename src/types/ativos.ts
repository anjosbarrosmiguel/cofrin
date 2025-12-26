export type TipoOperacaoAtivo = 'COMPRA' | 'VENDA' | 'DIVIDENDO' | 'JCP';

export type OperacaoAtivo = {
  idOperacao: string;
  data: Date;
  ticker: string;
  tipo: TipoOperacaoAtivo;
  quantidade: number;
  precoUnitario: number;
  valorTotal: number;
  corretora: string;
};

export type PosicaoAtivo = {
  ticker: string;
  quantidadeAtual: number;
  precoMedio: number;
  valorInvestido: number;
};

export type ImportResult = {
  totalLinhasLidas: number;
  totalOperacoesImportadas: number;
  totalOperacoesIgnoradasDuplicidade: number;
};
