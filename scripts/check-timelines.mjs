#!/usr/bin/env node
/**
 * Confere a linha do tempo (`timeline`) de cada dossiê em data/schemeDetails.ts.
 *
 *   npm run check:timelines        (roda no CI e reprova o build se falhar)
 *
 * Para cada esquema: start e end presentes; datas 'AAAA', 'AAAA-MM' ou
 * 'AAAA-MM-DD' válidas; basis dentro dos valores permitidos (types/graph.ts);
 * sourceUrl http(s); start ≤ end; exposed (se houver) depois do end.
 *
 * Datas de precisões diferentes são comparadas pelo intervalo que cobrem:
 * '2014' vai de 2014-01-01 a 2014-12-31. "start ≤ end" exige que o início do
 * start não passe do fim do end; "exposed depois do end" exige que o exposed
 * não comece antes do end e não seja a mesma data.
 *
 * A mesma regra (só pelo ano) está nos CHECKs da tabela scheme_timelines.
 * A comparação com o D1 é outro script: npm run check:timeline-sync.
 */
import { loadSchemeDetails, START_BASES, END_BASES, EXPOSED_BASES, DATE_RE } from './load-scheme-details.mjs';

/** Primeiro e último dia cobertos por uma data parcial, como 'AAAA-MM-DD'. */
function range(d) {
  const [y, m, day] = d.split('-');
  if (day) return [d, d];
  if (m) {
    const last = new Date(Date.UTC(Number(y), Number(m), 0)).getUTCDate();
    return [`${y}-${m}-01`, `${y}-${m}-${String(last).padStart(2, '0')}`];
  }
  return [`${y}-01-01`, `${y}-12-31`];
}

/** 'AAAA-MM-DD' existe no calendário? (Date.parse aceita 1993-02-30 e rola para março.) */
function realDay(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

const details = await loadSchemeDetails();
const errors = [];

function checkPoint(id, name, p, bases, required) {
  if (!p) {
    if (required) errors.push(`${id}: falta timeline.${name}`);
    return false;
  }
  let ok = true;
  if (typeof p.date !== 'string' || !DATE_RE.test(p.date)) {
    errors.push(`${id}: timeline.${name}.date inválida (${JSON.stringify(p.date)}); use AAAA, AAAA-MM ou AAAA-MM-DD`);
    ok = false;
  } else if (!realDay(range(p.date)[0])) {
    errors.push(`${id}: timeline.${name}.date não existe no calendário (${p.date})`);
    ok = false;
  }
  if (!bases.includes(p.basis)) {
    errors.push(`${id}: timeline.${name}.basis "${p.basis}" fora de ${bases.join(' | ')}`);
    ok = false;
  }
  if (typeof p.sourceUrl !== 'string' || !/^https?:\/\//i.test(p.sourceUrl)) {
    errors.push(`${id}: timeline.${name}.sourceUrl ausente ou não é http(s)`);
    ok = false;
  }
  if (p.note !== undefined && (typeof p.note !== 'string' || !p.note.trim())) {
    errors.push(`${id}: timeline.${name}.note vazia (omita o campo)`);
  }
  return ok;
}

for (const [id, d] of Object.entries(details)) {
  const t = d.timeline;
  if (!t) {
    errors.push(`${id}: falta timeline`);
    continue;
  }
  const okStart = checkPoint(id, 'start', t.start, START_BASES, true);
  const okEnd = checkPoint(id, 'end', t.end, END_BASES, true);
  const okExposed = checkPoint(id, 'exposed', t.exposed, EXPOSED_BASES, false);
  if (okStart && okEnd && range(t.start.date)[0] > range(t.end.date)[1]) {
    errors.push(`${id}: start (${t.start.date}) depois do end (${t.end.date})`);
  }
  if (okEnd && okExposed) {
    const [es, ee] = range(t.end.date);
    const [xs, xe] = range(t.exposed.date);
    if (xs < es || (xs === es && xe === ee)) {
      errors.push(`${id}: exposed (${t.exposed.date}) não é posterior ao end (${t.end.date})`);
    }
    if (t.end.basis !== 'documented_end') {
      errors.push(`${id}: exposed só existe quando end é documented_end (end aqui é ${t.end.basis}, já um ato oficial)`);
    }
  }
}

const n = Object.keys(details).length;
if (errors.length) {
  console.error(`check:timelines — ${errors.length} problema(s) em ${n} dossiês:\n  ${errors.join('\n  ')}`);
  process.exit(1);
}
console.log(`OK: ${n} dossiês com linha do tempo válida.`);
