#!/usr/bin/env node
/**
 * Exporta as traduções dos vínculos (inglês e espanhol) do D1 de produção para
 * data/translations/links.en-es.sql.
 *
 *   npm run export:translations
 *
 * Por que um script e não um arquivo editado à mão: o D1 de produção é a fonte
 * da verdade, e o status de um vínculo (que faz parte da chave natural dele)
 * muda com o tempo. Um arquivo mantido à mão envelhece em silêncio; este é
 * regerado sempre que for usado. Cada vínculo é identificado pela chave natural
 * (source, target, type, status, COALESCE(year, -1)), nunca pelo id
 * (ver migrations/README.md).
 *
 * Só lê o banco (SELECT). Precisa do wrangler logado na conta do projeto. Lê em
 * páginas: rode sem edições em andamento no banco (uma tradução repetida aborta).
 */
import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const DB = 'corruption_graph_db';
const OUT = fileURLToPath(new URL('../data/translations/links.en-es.sql', import.meta.url));
const PAGE = 200;

function d1(sql) {
  const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const r = spawnSync(npx, ['wrangler', 'd1', 'execute', DB, '--remote', '--json', '--command', sql], {
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
    shell: process.platform === 'win32',
  });
  if (r.error) throw new Error(`não consegui rodar o wrangler: ${r.error.message}`);
  if (r.status !== 0) throw new Error(`wrangler falhou (código ${r.status}): ${(r.stderr || r.stdout).slice(-500)}`);
  // O wrangler pode imprimir avisos antes do JSON: tenta cada linha que começa com '['.
  let parsed;
  for (const m of r.stdout.matchAll(/^\[/gm)) {
    try {
      parsed = JSON.parse(r.stdout.slice(m.index));
      break;
    } catch {
      /* não era o JSON; tenta a próxima linha */
    }
  }
  if (!parsed) throw new Error(`resposta do wrangler sem JSON: ${r.stdout.slice(-300)}`);
  if (!parsed[0]?.success) throw new Error(`consulta falhou: ${JSON.stringify(parsed[0]).slice(0, 300)}`);
  return parsed[0].results;
}

const q = (v) => (v === null || v === undefined ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`);

const BASE = `SELECT l.source, l.target, l.type, l.status, l.year, t.lang, t.relation, t.amount, t.amount_note
  FROM link_translations t JOIN links l ON l.id = t.link_id
  ORDER BY l.source, l.target, l.type, l.status, COALESCE(l.year, -1), t.lang`;

const rows = [];
for (let off = 0; ; off += PAGE) {
  const part = d1(`${BASE} LIMIT ${PAGE} OFFSET ${off}`);
  rows.push(...part);
  if (part.length < PAGE) break;
}

const seen = new Set();
const statements = rows.map((r) => {
  const key = [r.source, r.target, r.type, r.status, r.year ?? -1, r.lang].join('|');
  if (seen.has(key)) throw new Error(`tradução repetida para a mesma chave: ${key}`);
  seen.add(key);
  return (
    `INSERT INTO link_translations (link_id, lang, relation, amount, amount_note, source_text) ` +
    `SELECT id, ${q(r.lang)}, ${q(r.relation)}, ${q(r.amount)}, ${q(r.amount_note)}, ` +
    `relation || char(10) || COALESCE(amount, '') || char(10) || COALESCE(amount_note, '') ` +
    `FROM links WHERE source = ${q(r.source)} AND target = ${q(r.target)} AND type = ${q(r.type)} ` +
    `AND status = ${q(r.status)} AND COALESCE(year, -1) = ${r.year ?? -1} ` +
    `ON CONFLICT(link_id, lang) DO UPDATE SET relation = excluded.relation, amount = excluded.amount, ` +
    `amount_note = excluded.amount_note, source_text = excluded.source_text;`
  );
});

const header = `-- ARQUIVO GERADO: não edite à mão. Regere com: npm run export:translations
-- Traduções (inglês e espanhol) dos vínculos, lidas do D1 de produção.
-- Cada vínculo é identificado pela chave natural (source, target, type, status,
-- COALESCE(year, -1)), nunca pelo id (ver migrations/README.md). O status faz
-- parte da chave: depois que o status de um vínculo muda em produção, a linha
-- dele aqui deixa de casar e é ignorada, sem erro. Por isso, regere o arquivo
-- antes de usá-lo. O source_text é recalculado pelo próprio SELECT.
--   npx wrangler d1 execute ${DB} --remote --file=./data/translations/links.en-es.sql
`;

writeFileSync(OUT, `${header}${statements.join('\n')}\n`, 'utf8');
const linkCount = new Set(rows.map((r) => [r.source, r.target, r.type, r.status, r.year ?? -1].join('|'))).size;
console.log(`${statements.length} traduções de ${linkCount} vínculos gravadas em data/translations/links.en-es.sql`);
