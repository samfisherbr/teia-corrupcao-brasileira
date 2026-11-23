#!/usr/bin/env node
/**
 * Compara a linha do tempo dos esquemas no D1 (tabela scheme_timelines, fonte
 * da verdade) com a cópia de reserva em data/schemeDetails.ts (`timeline`).
 *
 *   npm run check:timeline-sync
 *
 * Lê o banco de produção com o wrangler (precisa de login no Cloudflare), por
 * isso NÃO roda no CI, como o check:data. Rode depois de aplicar uma migração
 * que mexa em scheme_timelines ou de editar `timeline` num dossiê.
 *
 * Aponta: esquema com dossiê e sem linha no D1; linha no D1 sem dossiê; e cada
 * campo (data, basis, sourceUrl, note de start/end/exposed) diferente.
 * Sai com código 1 se houver diferença.
 */
import { execFileSync } from 'node:child_process';
import { loadSchemeDetails, ROOT } from './load-scheme-details.mjs';

const DB_NAME = 'corruption_graph_db';
const FIELDS = [
  ['date', 'date'],
  ['basis', 'basis'],
  ['sourceUrl', 'source_url'],
  ['note', 'note'],
];

let out;
try {
  out = execFileSync(
    'npx',
    ['wrangler', 'd1', 'execute', DB_NAME, '--remote', '--json', '--command', 'SELECT * FROM scheme_timelines'],
    { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
  );
} catch (e) {
  console.error('Falha ao ler o D1 com o wrangler (login feito? migração 0010 aplicada?):\n' + (e.stderr || e.message));
  process.exit(2);
}
const rows = JSON.parse(out)[0]?.results ?? [];
const db = new Map(rows.map((r) => [String(r.scheme_id), r]));
const details = await loadSchemeDetails();

const norm = (v) => (v === undefined || v === null || v === '' ? null : String(v));
const diffs = [];
for (const [id, d] of Object.entries(details)) {
  const row = db.get(id);
  if (!row) {
    diffs.push(`${id}: tem dossiê, mas não tem linha em scheme_timelines`);
    continue;
  }
  for (const point of ['start', 'end', 'exposed']) {
    const p = d.timeline?.[point];
    for (const [tsKey, col] of FIELDS) {
      const a = norm(p?.[tsKey]);
      const b = norm(row[`${point}_${col}`]);
      if (a !== b) diffs.push(`${id}: ${point}.${tsKey} — schemeDetails ${JSON.stringify(a)} ≠ D1 ${JSON.stringify(b)}`);
    }
  }
}
for (const id of db.keys()) if (!details[id]) diffs.push(`${id}: linha em scheme_timelines sem dossiê em data/schemeDetails.ts`);

if (diffs.length) {
  console.error(`check:timeline-sync — ${diffs.length} diferença(s):\n  ${diffs.join('\n  ')}`);
  process.exit(1);
}
console.log(`OK: ${db.size} linhas do D1 iguais às de data/schemeDetails.ts.`);
