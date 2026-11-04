/**
 * Utilitários de valores monetários em texto livre (padrão brasileiro).
 * Usado pelos infográficos quando o link NÃO tem `amount_brl` numérico.
 * Para aceitar outra moeda (ex.: euro), inclua o símbolo na regex de
 * `parseAmount` e no tipo `Currency`, e trate-o em `formatAmount`.
 */
export type Currency = 'BRL' | 'USD';

export interface ParsedAmount {
  value: number;
  currency: Currency;
}

/** Palavras que multiplicam o número: "6,2 bilhões", "300 mil", "42 mi"… */
const MULTIPLIERS: Array<[RegExp, number]> = [
  [/^(bi|bilh(ão|ao|ões|oes)|bn)\b/i, 1_000_000_000],
  [/^(mi|milh(ão|ao|ões|oes)|mm)\b/i, 1_000_000],
  [/^mil\b/i, 1_000],
];

/**
 * Parses the FIRST monetary amount in a free-text string, Brazilian format.
 *
 *   "R$ 5.000.000"                      -> 5_000_000 BRL
 *   "R$ 5.000.000,00"                   -> 5_000_000 BRL   (old parser: 500_000_000)
 *   "R$ 6,2 bilhões"                    -> 6_200_000_000   (old parser: 62)
 *   "US$ 88.000.000 a US$ 100.000.000"  -> 88_000_000 USD  (old parser: 88000000100000000)
 */
export function parseAmount(text?: string | null): ParsedAmount | null {
  if (!text || text === 'NULL' || text === 'N/A') return null;

  const match = text.match(/(US\$|U\$|R\$)?\s*(\d{1,3}(?:\.\d{3})+|\d+)(?:,(\d+))?\s*([A-Za-zÀ-ú]+)?/);
  if (!match) return null;

  const [, symbol, intPart, decPart, word] = match;
  let value = Number(intPart.replace(/\./g, '') + (decPart ? `.${decPart}` : ''));
  if (!Number.isFinite(value)) return null;

  if (word) {
    const mult = MULTIPLIERS.find(([re]) => re.test(word));
    if (mult) value *= mult[1];
  }

  const currency: Currency = symbol && symbol.startsWith('U') ? 'USD' : 'BRL';
  return value > 0 ? { value, currency } : null;
}

/** Formata de forma curta: 6200000000 → "R$ 6,2 bi"; 300000 → "R$ 300 mil". */
export function formatAmount(value: number, currency: Currency = 'BRL'): string {
  const symbol = currency === 'USD' ? 'US$' : 'R$';
  const fmt = (n: number) => n.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
  if (value >= 1_000_000_000) return `${symbol} ${fmt(value / 1_000_000_000)} bi`;
  if (value >= 1_000_000) return `${symbol} ${fmt(value / 1_000_000)} mi`;
  if (value >= 1_000) return `${symbol} ${fmt(value / 1_000)} mil`;
  return `${symbol} ${value.toLocaleString('pt-BR')}`;
}
