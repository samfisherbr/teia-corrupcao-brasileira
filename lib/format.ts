/**
 * Formatação de datas. Módulo sem dependências, para poder ser usado tanto
 * no servidor quanto no JavaScript da página inicial.
 */

/** "2026-11-05" → "5 de novembro de 2026". Devolve null se a data for inválida. */
export function formatDatePtBR(iso: string | null | undefined): string | null {
  if (!iso || !/^\d{4}-\d{2}-\d{2}/.test(iso)) return null;
  // Meio-dia UTC: a data não "volta um dia" em nenhum fuso do Brasil.
  const d = new Date(`${iso.slice(0, 10)}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}
