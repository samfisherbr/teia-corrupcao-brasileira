#!/usr/bin/env node
/**
 * ============================================================================
 * VERIFICADOR DAS TRADUÇÕES DOS DOSSIÊS — `npm run check:translations`
 * ============================================================================
 * Compara data/schemeDetails.ts (português, o original) com as traduções em
 * data/schemeDetails.en.ts e data/schemeDetails.es.ts e lista, por idioma:
 *
 *   FALTANDO       dossiê sem tradução — aparece em português naquele idioma;
 *   DESATUALIZADA  o `reviewedAt` da tradução é diferente do `reviewedAt` do
 *                  português (o texto foi revisto depois de traduzido) — o
 *                  site mostra o português, com aviso, até a tradução ser
 *                  atualizada e receber o mesmo `reviewedAt`;
 *   SOBRANDO       tradução de um dossiê que não existe mais em português.
 *
 * Só avisa (sai com código 0): tradução pendente não quebra o site.
 * Para os textos do BANCO (nós e vínculos), use `npm run check:data`.
 * ============================================================================
 */
import { readFile } from 'node:fs/promises';

/** id do esquema → reviewedAt, lidos do arquivo TypeScript (chaves e datas). */
async function reviewDates(file) {
  const text = await readFile(new URL(`../data/${file}`, import.meta.url), 'utf8');
  const out = new Map();
  let id = null;
  for (const line of text.split('\n')) {
    const key = line.match(/^  "?(esquema[a-z0-9_]*)"?: \{/);
    if (key) id = key[1];
    const date = line.match(/^\s*reviewedAt:\s*["'](\d{4}-\d{2}-\d{2})["']/);
    if (date && id && !out.has(id)) out.set(id, date[1]);
  }
  return out;
}

const base = await reviewDates('schemeDetails.ts');
let pending = 0;
for (const [lang, file] of [['inglês', 'schemeDetails.en.ts'], ['espanhol', 'schemeDetails.es.ts']]) {
  const tr = await reviewDates(file);
  const missing = [...base.keys()].filter((id) => !tr.has(id));
  const stale = [...base.keys()].filter((id) => tr.has(id) && tr.get(id) !== base.get(id));
  const extra = [...tr.keys()].filter((id) => !base.has(id));
  pending += missing.length + stale.length;
  console.log(`\n${lang}: ${base.size - missing.length - stale.length} de ${base.size} dossiês com tradução em dia.`);
  if (missing.length) console.log(`  FALTANDO (${missing.length}): ${missing.join(', ')}`);
  for (const id of stale) console.log(`  DESATUALIZADA: ${id} — português revisto em ${base.get(id)}, tradução feita sobre a versão de ${tr.get(id)}`);
  if (extra.length) console.log(`  SOBRANDO (${extra.length}): ${extra.join(', ')}`);
}
console.log(pending ? `\n${pending} pendência(s): esses dossiês aparecem em português nos outros idiomas.` : '\nTudo em dia.');
