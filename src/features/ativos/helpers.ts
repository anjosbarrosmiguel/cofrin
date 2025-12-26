export function normalizeHeaderName(header: unknown): string {
  return String(header ?? '')
    .trim()
    .toLowerCase()
    // normalize common variations
    .replace(/\s+/g, ' ')
    .replace(/\u00A0/g, ' ');
}

export function parseBrazilianNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (value == null) return 0;

  const raw = String(value).trim();
  if (!raw) return 0;

  // Negatives can appear as:
  // - "-123,45"
  // - "(123,45)"
  // - "123,45-"
  const isParenNegative = raw.startsWith('(') && raw.endsWith(')');
  const isTrailingMinus = /-\s*$/.test(raw);
  const sign = (isParenNegative || isTrailingMinus) ? -1 : 1;

  // Remove currency symbols and spaces
  const cleaned = raw
    .replace(/^\(|\)$/g, '')
    .replace(/-\s*$/g, '')
    .replace(/R\$\s?/gi, '')
    .replace(/\s+/g, '')
    // thousands '.' and decimal ','
    .replace(/\./g, '')
    .replace(/,/g, '.');

  const n = Number(cleaned);
  return Number.isFinite(n) ? (n * sign) : 0;
}

export function parseExcelDate(value: unknown): Date | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;

  // Excel serial date
  if (typeof value === 'number' && Number.isFinite(value)) {
    // Excel epoch: 1899-12-30
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const ms = value * 24 * 60 * 60 * 1000;
    const d = new Date(excelEpoch.getTime() + ms);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  const raw = String(value ?? '').trim();
  if (!raw) return null;

  // Try ISO
  const iso = new Date(raw);
  if (!Number.isNaN(iso.getTime())) return iso;

  // Try dd/mm/yyyy
  const m = raw.match(/^([0-3]?\d)[/\-]([0-1]?\d)[/\-](\d{4})/);
  if (m) {
    const day = Number(m[1]);
    const month = Number(m[2]);
    const year = Number(m[3]);
    const d = new Date(year, month - 1, day);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  return null;
}

export function extractTicker(produto: unknown): string {
  const raw = String(produto ?? '').trim();
  if (!raw) return '';

  // Ex: "ABEV3 - AMBEV S/A" -> "ABEV3"
  const dashIndex = raw.indexOf('-');
  const firstPart = dashIndex >= 0 ? raw.slice(0, dashIndex) : raw;
  return firstPart.trim().split(' ')[0].trim().toUpperCase();
}

export function formatDateId(date: Date): string {
  // Deterministic day precision in UTC
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
