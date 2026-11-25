#!/usr/bin/env node
/**
 * Converte o history.csv do plugin teia-pagespeed em SQL para o D1.
 *
 *   node scripts/import-history.mjs ~/.teia-pagespeed/history.csv > import.sql
 *   npx wrangler d1 execute teia_pagespeed_db --remote --file=import.sql
 *
 * INSERT OR IGNORE + índice único (url, strategy, analyzed_at): rodar duas
 * vezes não duplica linhas.
 */
import { readFileSync } from 'node:fs';

const file = process.argv[2];
if (!file) { console.error('uso: import-history.mjs <history.csv>'); process.exit(1); }

function parseCsv(text) {
  const rows = [];
  let row = [], cur = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) {
      if (ch === '"' && text[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') q = false;
      else cur += ch;
    } else if (ch === '"') q = true;
    else if (ch === ',') { row.push(cur); cur = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(cur); cur = '';
      if (row.some((c) => c !== '')) rows.push(row);
      row = [];
    } else cur += ch;
  }
  if (cur !== '' || row.length) { row.push(cur); if (row.some((c) => c !== '')) rows.push(row); }
  return rows;
}

const NUMERIC = new Set(['performance', 'accessibility', 'best_practices', 'seo', 'lab_fcp_ms', 'lab_lcp_ms', 'lab_tbt_ms', 'lab_cls', 'lab_speed_index_ms', 'lab_ttfb_ms', 'field_lcp_ms', 'field_inp_ms', 'field_cls', 'field_fcp_ms', 'field_ttfb_ms']);
const TEXT = ['final_url', 'field_overall', 'field_scope', 'lighthouse_version', 'note'];
const lit = (v) => (v === '' || v === undefined ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`);

const [header, ...data] = parseCsv(readFileSync(file, 'utf8'));
const cols = ['analyzed_at', 'url', 'strategy', ...NUMERIC, ...TEXT, 'source'];
const out = [];
for (const cells of data) {
  const r = Object.fromEntries(header.map((h, i) => [h, cells[i] ?? '']));
  const strategy = String(r.strategy).toLowerCase();
  if (!r.timestamp || !r.url || !['mobile', 'desktop'].includes(strategy)) { console.error('linha ignorada:', cells.join(',')); continue; }
  const vals = [
    lit(r.timestamp), lit(r.url), lit(strategy),
    ...[...NUMERIC].map((c) => (r[c] !== '' && !isNaN(Number(r[c])) ? Number(r[c]) : 'NULL')),
    ...TEXT.map((c) => lit(r[c])),
    "'import'",
  ];
  out.push(`INSERT OR IGNORE INTO pagespeed_runs (${cols.join(',')}) VALUES (${vals.join(',')});`);
}
console.log(out.join('\n'));
console.error(`${out.length} linhas convertidas`);
