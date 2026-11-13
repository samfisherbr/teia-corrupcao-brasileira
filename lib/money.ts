/**
 * Utilitários de valores monetários em texto livre.
 * Usado pelos infográficos quando o link NÃO tem `amount_brl` numérico.
 * Para aceitar outra moeda (ex.: euro), inclua o símbolo na regex de
 * `parseAmount` e no tipo `Currency`, e trate-o em `formatAmount`.
 *
 * A leitura aceita os dois formatos de número, porque o mesmo texto aparece
 * em português/espanhol ("R$ 6.200.000,50") e em inglês ("R$ 6,200,000.50").
 */
import { LOCALE_INFO, type Locale } from '@/lib/i18n';

export type Currency = 'BRL' | 'USD';

export interface ParsedAmount {
  value: number;
  currency: Currency;
}

/**
 * Palavras que multiplicam o número: "6,2 bilhões", "300 mil", "6.2 billion",
 * "6.200 millones"… A ordem importa (a primeira que casar vale).
 */
const MULTIPLIERS: Array<[RegExp, number]> = [
  [/^mil\s+mill(ón|on|ones)\b/i, 1_000_000_000], // es: "mil millones"
  [/^(bi|bilh(ão|ao|ões|oes)|bn|billion)\b/i, 1_000_000_000],
  [/^(mi|milh(ão|ao|ões|oes)|mm|m|million|mill(ón|on|ones))\b/i, 1_000_000],
  [/^(mil|thousand|k)\b/i, 1_000],
];

/**
 * "6.200.000,50", "6,200,000.50", "6,2", "300.000", "35,000.00" → número.
 * Com os dois separadores, o último é o decimal. Com um só: repetido ou
 * seguido de exatamente 3 dígitos = milhar; senão = decimal.
 */
function splitNumber(raw: string): { value: number; decimals: number } {
  const lastDot = raw.lastIndexOf('.');
  const lastComma = raw.lastIndexOf(',');
  let decimalSep = '';
  if (lastDot !== -1 && lastComma !== -1) {
    decimalSep = lastDot > lastComma ? '.' : ',';
  } else {
    const sep = lastDot !== -1 ? '.' : lastComma !== -1 ? ',' : '';
    if (sep) {
      const parts = raw.split(sep);
      const isThousands = parts.length > 2 || parts[parts.length - 1].length === 3;
      if (!isThousands) decimalSep = sep;
    }
  }
  const cut = decimalSep ? raw.lastIndexOf(decimalSep) : raw.length;
  const intPart = raw.slice(0, cut);
  const decPart = raw.slice(cut + 1);
  return { value: Number(intPart.replace(/[.,]/g, '') + (decPart ? `.${decPart}` : '')), decimals: decPart.length };
}

const parseNumber = (raw: string): number => splitNumber(raw).value;

/**
 * Reescreve os números de um valor ("R$ 3.526.514.000,00") no formato do
 * idioma: inglês → "R$ 3,526,514,000.00"; espanhol e português → ponto no
 * milhar e vírgula nos centavos. Em português o texto do banco não é tocado.
 * Só para o campo `amount` (texto curto, só com valores) — não use em frases.
 */
export function localizeAmountText(text: string | null | undefined, locale: Locale): string | null {
  if (!text) return null;
  if (locale === 'pt') return text;
  const tag = LOCALE_INFO[locale].tag;
  return text.replace(/\$\s*\$/g, '$').replace(/\d[\d.,]*\d/g, (raw) => {
    const { value, decimals } = splitNumber(raw);
    if (!Number.isFinite(value)) return raw;
    return value.toLocaleString(tag, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      useGrouping: 'always',
    } as Intl.NumberFormatOptions);
  });
}

/**
 * Lê o PRIMEIRO valor monetário de um texto livre.
 *
 *   "R$ 5.000.000"                      -> 5_000_000 BRL
 *   "R$ 5.000.000,00"                   -> 5_000_000 BRL
 *   "R$ 5,000,000.00"                   -> 5_000_000 BRL   (formato inglês)
 *   "R$ 6,2 bilhões" / "R$ 6.2 billion" -> 6_200_000_000
 *   "US$ 88.000.000 a US$ 100.000.000"  -> 88_000_000 USD
 */
export function parseAmount(text?: string | null): ParsedAmount | null {
  if (!text || text === 'NULL' || text === 'N/A') return null;

  const match = text.match(/(US\$|U\$|R\$)?\s*\$?\s*(\d[\d.,]*\d|\d)\s*([A-Za-zÀ-ú]+(?:\s+[A-Za-zÀ-ú]+)?)?/);
  if (!match) return null;

  const [, symbol, number, words] = match;
  let value = parseNumber(number);
  if (!Number.isFinite(value)) return null;

  if (words) {
    const mult = MULTIPLIERS.find(([re]) => re.test(words));
    if (mult) value *= mult[1];
  }

  const currency: Currency = symbol && symbol.startsWith('U') ? 'USD' : 'BRL';
  return value > 0 ? { value, currency } : null;
}

/**
 * Formata de forma curta, no costume de cada idioma:
 *   pt: 6200000000 → "R$ 6,2 bi"   300000 → "R$ 300 mil"
 *   en: 6200000000 → "R$ 6.2bn"    300000 → "R$ 300k"
 *   es: 6200000000 → "R$ 6.200 M"  300000 → "R$ 300 mil"  (bilhão = "mil millones")
 */
export function formatAmount(value: number, currency: Currency = 'BRL', locale: Locale = 'pt'): string {
  const symbol = currency === 'USD' ? 'US$' : 'R$';
  const tag = LOCALE_INFO[locale].tag;
  const fmt = (n: number) => n.toLocaleString(tag, { maximumFractionDigits: 1 });
  if (locale === 'en') {
    if (value >= 1_000_000_000) return `${symbol} ${fmt(value / 1_000_000_000)}bn`;
    if (value >= 1_000_000) return `${symbol} ${fmt(value / 1_000_000)}m`;
    if (value >= 1_000) return `${symbol} ${fmt(value / 1_000)}k`;
    return `${symbol} ${value.toLocaleString(tag)}`;
  }
  if (locale === 'es') {
    // useGrouping 'always': o espanhol não agrupa números de 4 dígitos por padrão ("6200").
    if (value >= 1_000_000)
      return `${symbol} ${(value / 1_000_000).toLocaleString(tag, { maximumFractionDigits: 1, useGrouping: 'always' } as Intl.NumberFormatOptions)} M`;
    if (value >= 1_000) return `${symbol} ${fmt(value / 1_000)} mil`;
    return `${symbol} ${value.toLocaleString(tag)}`;
  }
  if (value >= 1_000_000_000) return `${symbol} ${fmt(value / 1_000_000_000)} bi`;
  if (value >= 1_000_000) return `${symbol} ${fmt(value / 1_000_000)} mi`;
  if (value >= 1_000) return `${symbol} ${fmt(value / 1_000)} mil`;
  return `${symbol} ${value.toLocaleString(tag)}`;
}
