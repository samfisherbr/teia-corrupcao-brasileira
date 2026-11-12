#!/usr/bin/env node
/**
 * ============================================================================
 * VERIFICADOR DE LINKS DE FONTE — `npm run check:links`
 * ============================================================================
 * Confere se as URLs de fonte ainda respondem:
 *   - as `sources` de cada dossiê em data/schemeDetails.ts (sempre);
 *   - as `source_url` dos vínculos e as `image_url` dos nós, lidas da API
 *     pública do site, com `--site`:
 *         npm run check:links -- --site https://teiadacorrupcao.io
 *
 * Resultado de cada link:
 *   OK            respondeu 2xx/3xx;
 *   QUEBRADO      404/410, domínio inexistente ou erro de certificado —
 *                 troque a fonte e registre em data/corrections.ts;
 *   INCONCLUSIVO  403/401/429/5xx ou tempo esgotado: muitos portais bloqueiam
 *                 robôs. Abra no navegador para conferir. Não reprova.
 *
 * Sai com código 1 se houver algum QUEBRADO (reprova o workflow do GitHub).
 * Um link que responde não prova que o CONTEÚDO ainda sustenta o vínculo:
 * isso continua sendo conferência humana.
 * ============================================================================
 */
import { readFile } from 'node:fs/promises';

const CONCURRENCY = 6; // conexões simultâneas (no máximo 1 por domínio)
const TIMEOUT_MS = 20000;
const UA = 'Mozilla/5.0 (compatible; link-checker/1.0)';

const args = process.argv.slice(2);
const siteArg = args.includes('--site') ? args[args.indexOf('--site') + 1] : null;

/** url → lugares onde aparece (para o relatório). */
const found = new Map();
const add = (url, where) => {
  if (typeof url !== 'string' || !/^https?:\/\//i.test(url)) return;
  const u = url.trim();
  if (!found.has(u)) found.set(u, []);
  found.get(u).push(where);
};

// 1. Fontes dos dossiês (o arquivo é TypeScript; basta ler as chaves e as urls).
const text = await readFile(new URL('../data/schemeDetails.ts', import.meta.url), 'utf8');
let scheme = '?';
for (const line of text.split('\n')) {
  const key = line.match(/^  "(esquema[a-z0-9_]*)": \{/);
  if (key) scheme = key[1];
  const url = line.match(/\burl:\s*"([^"]+)"/);
  if (url) add(url[1], `dossiê ${scheme}`);
}

// 2. Fontes dos vínculos e fotos (API pública do site).
if (siteArg) {
  const res = await fetch(new URL('/api/graph', siteArg), { headers: { 'user-agent': UA } });
  if (!res.ok) {
    console.error(`Não foi possível ler ${siteArg}/api/graph (status ${res.status}).`);
    process.exit(2);
  }
  const data = await res.json();
  const id = (end) => (end && typeof end === 'object' ? end.id : end);
  for (const l of data.links ?? []) add(l.source_url, `vínculo ${id(l.source)} → ${id(l.target)}`);
  for (const n of data.nodes ?? []) add(n.image_url, `foto de ${n.id}`);
}

async function check(url) {
  for (const method of ['HEAD', 'GET']) {
    try {
      const res = await fetch(url, {
        method,
        redirect: 'follow',
        signal: AbortSignal.timeout(TIMEOUT_MS),
        headers: { 'user-agent': UA, accept: 'text/html,application/pdf,*/*' },
      });
      res.body?.cancel().catch(() => {});
      if (res.ok) return { state: 'OK', detail: String(res.status) };
      // Muitos servidores recusam HEAD: tenta GET antes de concluir.
      if (method === 'HEAD') continue;
      if (res.status === 404 || res.status === 410) return { state: 'QUEBRADO', detail: String(res.status) };
      return { state: 'INCONCLUSIVO', detail: String(res.status) };
    } catch (e) {
      if (method === 'HEAD') continue;
      const code = e?.cause?.code ?? e?.name ?? 'erro';
      const dead = ['ENOTFOUND', 'CERT_HAS_EXPIRED', 'ERR_TLS_CERT_ALTNAME_INVALID'].includes(code);
      return { state: dead ? 'QUEBRADO' : 'INCONCLUSIVO', detail: code };
    }
  }
  return { state: 'INCONCLUSIVO', detail: 'sem resposta' };
}

// Fila com no máximo uma requisição por domínio ao mesmo tempo (educado com os portais).
const queue = [...found.keys()];
const busyHosts = new Set();
const results = [];
async function worker() {
  for (;;) {
    const i = queue.findIndex((u) => !busyHosts.has(new URL(u).hostname));
    if (i === -1) {
      if (queue.length === 0) return;
      await new Promise((r) => setTimeout(r, 100));
      continue;
    }
    const [url] = queue.splice(i, 1);
    const host = new URL(url).hostname;
    busyHosts.add(host);
    results.push({ url, ...(await check(url)) });
    busyHosts.delete(host);
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker));

const by = (state) => results.filter((r) => r.state === state);

// Nenhum link respondeu: o problema é a rede desta máquina, não os links.
if (results.length > 5 && by('OK').length === 0) {
  console.error(`Nenhum dos ${results.length} links respondeu. Esta máquina parece estar sem acesso à internet (ou atrás de um proxy que o Node não usa); nada foi conferido.`);
  process.exit(2);
}
const print = (r) => console.log(`  [${r.detail}] ${r.url}\n      em: ${[...new Set(found.get(r.url))].join('; ')}`);

console.log(`\n${results.length} links conferidos: ${by('OK').length} OK, ${by('INCONCLUSIVO').length} inconclusivos, ${by('QUEBRADO').length} quebrados.`);
if (by('INCONCLUSIVO').length) {
  console.log('\nINCONCLUSIVOS (confira no navegador; portais costumam bloquear robôs):');
  by('INCONCLUSIVO').forEach(print);
}
if (by('QUEBRADO').length) {
  console.log('\nQUEBRADOS (troque a fonte e registre em data/corrections.ts):');
  by('QUEBRADO').forEach(print);
  process.exit(1);
}
