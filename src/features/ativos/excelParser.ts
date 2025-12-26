import * as XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { normalizeHeaderName } from './helpers';

export type ParsedExcel = {
  headers: string[];
  rows: Record<string, unknown>[];
};

const EXPECTED_COLUMNS = [
  'Entrada/Saída',
  'Data',
  'Movimentação',
  'Produto',
  'Instituição',
  'Quantidade',
  'Preço unitário',
  'Valor da Operação',
] as const;

export function validateExpectedColumns(headers: string[]): { ok: boolean; missing: string[] } {
  const normalized = new Set(headers.map((h) => normalizeHeaderName(h)));
  const missing = EXPECTED_COLUMNS.filter((col) => !normalized.has(normalizeHeaderName(col)));
  return { ok: missing.length === 0, missing: [...missing] };
}

function sheetToRows(sheet: XLSX.WorkSheet): ParsedExcel {
  const raw = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' }) as unknown[][];
  const headerRow = (raw[0] ?? []).map((h) => String(h ?? '').trim());

  const headers = headerRow;
  const rows: Record<string, unknown>[] = [];

  for (let i = 1; i < raw.length; i++) {
    const rowArr = raw[i] ?? [];
    const obj: Record<string, unknown> = {};
    for (let c = 0; c < headers.length; c++) {
      const key = headers[c];
      if (!key) continue;
      obj[key] = rowArr[c];
    }
    // keep also normalized aliases for mapping convenience
    for (const [k, v] of Object.entries(obj)) {
      obj[normalizeHeaderName(k)] = v;
    }
    rows.push(obj);
  }

  return { headers, rows };
}

export async function parseXlsxFromUri(uri: string): Promise<ParsedExcel> {
  if (Platform.OS === 'web') {
    // On web, uri is usually a blob URL; FileSystem may not support it.
    // Caller should prefer parseXlsxFromFile when available.
    const res = await fetch(uri);
    const ab = await res.arrayBuffer();
    const wb = XLSX.read(ab, { type: 'array' });
    const sheetName = wb.SheetNames[0];
    const sheet = wb.Sheets[sheetName];
    return sheetToRows(sheet);
  }

  const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' as any });
  const wb = XLSX.read(base64, { type: 'base64' });
  const sheetName = wb.SheetNames[0];
  const sheet = wb.Sheets[sheetName];
  return sheetToRows(sheet);
}

export async function parseXlsxFromFile(file: File): Promise<ParsedExcel> {
  const ab = await file.arrayBuffer();
  const wb = XLSX.read(ab, { type: 'array' });
  const sheetName = wb.SheetNames[0];
  const sheet = wb.Sheets[sheetName];
  return sheetToRows(sheet);
}
