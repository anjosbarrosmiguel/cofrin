import { normalizeOperacaoAtivo } from '../normalizer';

describe('ativos normalizer', () => {
  it('classifica Transferência - Liquidação como COMPRA quando Crédito', () => {
    const row: Record<string, unknown> = {
      'Entrada/Saída': 'Credito',
      Data: '04/12/2025',
      'Movimentação': 'Transferência - Liquidação',
      Produto: 'ALUP3 - ALUPAR INVESTIMENTOS S/A',
      Instituição: 'NU INVEST CORRETORA DE VALORES S.A.',
      Quantidade: '306',
      'Preço unitário': 'R$ 12,603',
      'Valor da Operação': 'R$ 3.856,52',
    };

    const op = normalizeOperacaoAtivo(row);
    expect(op).not.toBeNull();
    expect(op!.tipo).toBe('COMPRA');
    expect(op!.ticker).toBe('ALUP3');
    expect(op!.quantidade).toBe(306);
    expect(op!.precoUnitario).toBeCloseTo(12.603, 6);
    expect(op!.valorTotal).toBeCloseTo(3856.52, 2);
  });

  it('classifica Transferência - Liquidação como VENDA quando Débito', () => {
    const row: Record<string, unknown> = {
      'Entrada/Saída': 'Debito',
      Data: '02/12/2025',
      'Movimentação': 'Transferência - Liquidação',
      Produto: 'ALUP11 - ALUPAR INVESTIMENTOS S/A',
      Instituição: 'NU INVEST CORRETORA DE VALORES S.A.',
      Quantidade: '101',
      'Preço unitário': 'R$ 33,61',
      'Valor da Operação': 'R$ 3.394,61',
    };

    const op = normalizeOperacaoAtivo(row);
    expect(op).not.toBeNull();
    expect(op!.tipo).toBe('VENDA');
    expect(op!.ticker).toBe('ALUP11');
    expect(op!.quantidade).toBe(101);
    expect(op!.precoUnitario).toBeCloseTo(33.61, 6);
    expect(op!.valorTotal).toBeCloseTo(3394.61, 2);
  });

  it('classifica bonificação como COMPRA com valor 0', () => {
    const row: Record<string, unknown> = {
      'Entrada/Saída': 'Credito',
      Data: '22/12/2025',
      'Movimentação': 'Bonificação em Ativos',
      Produto: 'ITSA4 - ITAUSA S.A.',
      Instituição: 'NU INVEST',
      Quantidade: '12,2',
      'Preço unitário': '-',
      'Valor da Operação': '-',
    };

    const op = normalizeOperacaoAtivo(row);
    expect(op).not.toBeNull();
    expect(op!.tipo).toBe('COMPRA');
    expect(op!.ticker).toBe('ITSA4');
    expect(op!.quantidade).toBeCloseTo(12.2, 6);
    expect(op!.precoUnitario).toBe(0);
    expect(op!.valorTotal).toBe(0);
  });

  it('classifica dividendo e jcp', () => {
    const div: Record<string, unknown> = {
      'Entrada/Saída': 'Credito',
      Data: '19/12/2025',
      'Movimentação': 'Dividendo',
      Produto: 'ITSA4 - ITAUSA S.A.',
      Instituição: 'NU INVEST',
      Quantidade: '610',
      'Preço unitário': 'R$ 0,775',
      'Valor da Operação': 'R$ 472,97',
    };

    const jcp: Record<string, unknown> = {
      'Entrada/Saída': 'Credito',
      Data: '18/12/2025',
      'Movimentação': 'Juros Sobre Capital Próprio',
      Produto: 'DXCO3 - DEXCO S.A.',
      Instituição: 'NU INVEST',
      Quantidade: '1',
      'Preço unitário': 'R$ 0,046',
      'Valor da Operação': 'R$ 0,04',
    };

    const opDiv = normalizeOperacaoAtivo(div);
    expect(opDiv).not.toBeNull();
    expect(opDiv!.tipo).toBe('DIVIDENDO');
    expect(opDiv!.ticker).toBe('ITSA4');
    expect(opDiv!.valorTotal).toBeCloseTo(472.97, 2);

    const opJcp = normalizeOperacaoAtivo(jcp);
    expect(opJcp).not.toBeNull();
    expect(opJcp!.tipo).toBe('JCP');
    expect(opJcp!.ticker).toBe('DXCO3');
    expect(opJcp!.valorTotal).toBeCloseTo(0.04, 2);
  });
});
