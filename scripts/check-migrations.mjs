#!/usr/bin/env node
/**
 * Reprova migrações e seeds que identificam vínculos pelo id.
 *
 *   npm run check:migrations              confere os arquivos do projeto
 *   node scripts/check-migrations.mjs f   confere só os arquivos dados
 *
 * O id de `links` é autoincremento e só vale no banco onde nasceu; num banco
 * restaurado ou reconstruído ele aponta para outro vínculo, e o comando grava
 * no vínculo errado sem avisar. A regra (migrations/README.md): vínculos são
 * identificados pela chave natural (source, target, type, status,
 * COALESCE(year, -1)), a mesma do índice único idx_links_unique.
 *
 * O que confere: migrações numeradas de 0007 em diante e o seed de traduções
 * data/translations/links.en-es.sql. As 0002 a 0006 já foram aplicadas e ficam
 * de fora. Em cada comando que cita `links` ou `link_translations`, procura
 * `id = 12`, `id IN (1, 2)`, `id <= 5`, `id BETWEEN 1 AND 9`, `rowid = 5` ou
 * `link_id = 12` (os textos entre aspas e os comentários são ignorados;
 * `id = 'pol_x'` de nós é permitido).
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const FIRST_CHECKED_MIGRATION = 7;

/** Divide o SQL em comandos (por ';'), sem comentários e com os textos entre aspas esvaziados. */
export function statements(sql) {
  const out = [];
  let cur = '';
  for (let i = 0; i < sql.length; i++) {
    const c = sql[i];
    if (c === '-' && sql[i + 1] === '-') {
      while (i < sql.length && sql[i] !== '\n') i++;
      cur += '\n';
    } else if (c === "'") {
      cur += "''";
      i++;
      while (i < sql.length) {
        if (sql[i] === "'" && sql[i + 1] === "'") i += 2;
        else if (sql[i] === "'") break;
        else i++;
      }
    } else if (c === ';') {
      if (cur.trim()) out.push(cur.trim());
      cur = '';
    } else {
      cur += c;
    }
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

const TOUCHES_LINKS = /\b(links|link_translations)\b/i;
// id, rowid ou link_id comparados com número ou parâmetro: =, !=, <>, <, <=, >, >=, IN, BETWEEN.
const ID_PREDICATE = /(?:\b\w+\.)?\b(?:link_|row)?id\s*(?:=|!=|<>|<=|>=|<|>|\bIN\b|\bBETWEEN\b)\s*\(?\s*[-+]?\s*[\d:?@$]/i;

export function violations(sql) {
  return statements(sql).filter((s) => TOUCHES_LINKS.test(s) && ID_PREDICATE.test(s));
}

function defaultFiles() {
  const files = [];
  const dir = path.join(ROOT, 'migrations');
  if (existsSync(dir)) {
    for (const f of readdirSync(dir).sort()) {
      const m = /^(\d+)_.*\.sql$/.exec(f);
      if (m && Number(m[1]) >= FIRST_CHECKED_MIGRATION) files.push(path.join(dir, f));
    }
  }
  const seed = path.join(ROOT, 'data', 'translations', 'links.en-es.sql');
  if (existsSync(seed)) files.push(seed);
  return files;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const files = args.length ? args.map((f) => path.resolve(f)) : defaultFiles();
  let bad = 0;
  for (const f of files) {
    for (const s of violations(readFileSync(f, 'utf8'))) {
      bad++;
      console.error(`${path.relative(ROOT, f)}: vínculo identificado pelo id: ${s.replace(/\s+/g, ' ').slice(0, 160)}`);
    }
  }
  if (bad) {
    console.error(`\n${bad} comando(s) usam id de vínculo. Use a chave natural (source, target, type, status, COALESCE(year, -1)); ver migrations/README.md.`);
    process.exit(1);
  }
  console.log(`OK: ${files.length} arquivo(s) sem vínculo identificado pelo id.`);
}
