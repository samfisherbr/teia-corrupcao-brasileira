/**
 * Formatação de datas. Módulo sem dependências, para poder ser usado tanto
 * no servidor quanto no JavaScript da página inicial.
 */
import { LOCALE_INFO, type Locale } from '@/lib/i18n';

/**
 * "2026-11-05" → "5 de novembro de 2026" (pt), "5 November 2026" (en),
 * "5 de noviembre de 2026" (es). Devolve null se a data for inválida.
 */
export function formatDate(iso: string | null | undefined, locale: Locale): string | null {
  if (!iso || !/^\d{4}-\d{2}-\d{2}/.test(iso)) return null;
  // Meio-dia UTC: a data não "volta um dia" em nenhum fuso.
  const d = new Date(`${iso.slice(0, 10)}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(LOCALE_INFO[locale].tag, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}
