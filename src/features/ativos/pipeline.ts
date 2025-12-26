import type { ImportResult, OperacaoAtivo } from '../../types/ativos';
import { parseXlsxFromFile, parseXlsxFromUri, validateExpectedColumns } from './excelParser';
import { normalizeOperacaoAtivo } from './normalizer';
import { attachOperacaoId } from './id';

export type ImportPipelineInput =
  | { kind: 'web-file'; file: File }
  | { kind: 'uri'; uri: string };

export type PreparedImport = {
  result: ImportResult;
  operacoes: OperacaoAtivo[];
};

export async function prepareImportFromExcel(input: ImportPipelineInput): Promise<PreparedImport> {
  const parsed = input.kind === 'web-file'
    ? await parseXlsxFromFile(input.file)
    : await parseXlsxFromUri(input.uri);

  const { ok, missing } = validateExpectedColumns(parsed.headers);
  if (!ok) {
    throw new Error(`Colunas ausentes no Excel: ${missing.join(', ')}`);
  }

  const totalLinhasLidas = parsed.rows.length;

  const normalized = parsed.rows
    .map(normalizeOperacaoAtivo)
    .filter((x): x is NonNullable<typeof x> => !!x);

  const operacoes: OperacaoAtivo[] = [];
  for (const op of normalized) {
    operacoes.push(await attachOperacaoId(op));
  }

  return {
    operacoes,
    result: {
      totalLinhasLidas,
      totalOperacoesImportadas: 0,
      totalOperacoesIgnoradasDuplicidade: 0,
    },
  };
}
