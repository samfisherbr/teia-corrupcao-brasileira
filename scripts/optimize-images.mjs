#!/usr/bin/env node
/**
 * ============================================================================
 * OTIMIZA AS FOTOS DO R2 — `npm run images:optimize` (simulação)
 *                          `npm run images:optimize -- --apply` (executa)
 * ============================================================================
 * OPCIONAL desde que o site passou a pedir as fotos já reduzidas pelo
 * Cloudflare (lib/photoUrl.ts, Image Transformations): fotos novas podem ser
 * enviadas em qualquer tamanho. Este script continua útil para encolher o
 * próprio arquivo no R2 (ex.: se as transformações forem desligadas).
 *
 * As fotos dos nós ficam no bucket R2 `teia-imagens` (img.teiadacorrupcao.io)
 * e o grafo baixa TODAS ao abrir a página inicial. Fotos enviadas no tamanho
 * original (até 2,5 MB cada) somavam ~23 MB por visita. O grafo desenha cada
 * foto num círculo de 192 px e o painel lateral a 64 px — 256 px bastam.
 *
 * Para cada nó cujo image_url aponta para o R2:
 *   - foto (jpg/png/gif/avif/webp): baixa, reduz para caber em 256×256
 *     (proporção mantida, nunca aumenta), grava `<mesmo caminho>.webp` com
 *     Cache-Control longo e troca o image_url do nó no D1 para o arquivo novo;
 *   - SVG (logos de partido): regrava o mesmo arquivo só para pôr o Cache-Control.
 * O arquivo original continua no bucket (cópia de arquivo), só deixa de ser usado.
 * Nós já apontando para um .webp de 256 px são pulados: pode rodar sempre que
 * fotos novas forem inseridas.
 *
 * Requisitos:
 *   - `npm i --no-save sharp` (biblioteca de imagens; fora do package.json para
 *     não pesar no build do Pages);
 *   - acesso à API do Cloudflare: variável CLOUDFLARE_API_TOKEN com permissão
 *     de D1 Edit e R2 Edit nesta conta. Nas sessões do Claude Code na nuvem o
 *     proxy já autentica as chamadas a api.cloudflare.com, mas o fetch do Node
 *     só passa pelo proxy com NODE_USE_ENV_PROXY=1:
 *       NODE_USE_ENV_PROXY=1 npm run images:optimize -- --apply
 *
 * FOTO NOVA (para quem insere dados): prefira já enviar ao R2 em .webp ≤ 256 px
 * com `Cache-Control: public, max-age=2592000`; ou rode este script depois.
 * ============================================================================
 */
const ACCOUNT_ID = 'af5825c2f896c228f6c3d6c55c9dcce6';
const BUCKET = 'teia-imagens';
const D1_ID = '8ef78bfa-f668-40d9-8c30-d2db9dda631a'; // corruption_graph_db (wrangler.toml)
const PUBLIC_BASE = 'https://img.teiadacorrupcao.io/';
const MAX_PX = 256;
const WEBP_QUALITY = 80;
/** 30 dias: troca de foto = arquivo novo (nome novo), então cache longo é seguro. */
const CACHE_CONTROL = 'public, max-age=2592000';

const APPLY = process.argv.includes('--apply');
const API = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}`;
// Sem CLOUDFLARE_API_TOKEN, não manda cabeçalho: o proxy das sessões do Claude Code autentica.
const AUTH = process.env.CLOUDFLARE_API_TOKEN ? { Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}` } : {};

let sharp;
try {
  sharp = (await import('sharp')).default;
} catch {
  console.error('Falta a biblioteca sharp. Rode antes: npm i --no-save sharp');
  process.exit(2);
}

async function d1(sql, params = []) {
  const res = await fetch(`${API}/d1/database/${D1_ID}/query`, {
    method: 'POST',
    headers: { ...AUTH, 'Content-Type': 'application/json' },
    body: JSON.stringify({ sql, params }),
  });
  const body = await res.json();
  if (!body.success) throw new Error(`D1: ${JSON.stringify(body.errors)}`);
  return body.result[0].results;
}

const objectUrl = (key) => `${API}/r2/buckets/${BUCKET}/objects/${key.split('/').map(encodeURIComponent).join('/')}`;

async function getObject(key) {
  const res = await fetch(objectUrl(key), { headers: AUTH });
  if (!res.ok) throw new Error(`R2 GET ${key}: ${res.status}`);
  return { bytes: Buffer.from(await res.arrayBuffer()), type: res.headers.get('content-type') || '' };
}

async function putObject(key, bytes, contentType) {
  const res = await fetch(objectUrl(key), {
    method: 'PUT',
    headers: { ...AUTH, 'Content-Type': contentType, 'Cache-Control': CACHE_CONTROL },
    body: bytes,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.success === false) throw new Error(`R2 PUT ${key}: ${res.status} ${JSON.stringify(body.errors ?? '')}`);
}

const kb = (n) => `${Math.round(n / 1024)} KB`;

const nodes = await d1(`SELECT id, image_url FROM nodes WHERE image_url LIKE ?1`, [`${PUBLIC_BASE}%`]);
console.log(`${nodes.length} nós com foto no R2. Modo: ${APPLY ? 'EXECUTANDO' : 'simulação (use --apply para executar)'}\n`);

let before = 0;
let after = 0;
let changed = 0;
const failures = [];
for (const { id, image_url: url } of nodes) {
  const key = decodeURIComponent(url.slice(PUBLIC_BASE.length));
  const ext = key.split('.').pop().toLowerCase();
  try {
    const { bytes, type } = await getObject(key);

    if (ext === 'svg') {
      before += bytes.length;
      after += bytes.length;
      if (APPLY) await putObject(key, bytes, 'image/svg+xml');
      console.log(`  svg   ${id}: ${key} (só Cache-Control)`);
      continue;
    }

    const meta = await sharp(bytes).metadata();
    if (ext === 'webp' && Math.max(meta.width ?? 0, meta.height ?? 0) <= MAX_PX) {
      before += bytes.length;
      after += bytes.length;
      continue; // já otimizada
    }

    const out = await sharp(bytes, { animated: false })
      .rotate() // respeita a orientação EXIF antes de reduzir
      .resize({ width: MAX_PX, height: MAX_PX, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();
    const newKey = key.replace(/\.[^./]+$/, '') + '.webp';
    const newUrl = PUBLIC_BASE + newKey.split('/').map(encodeURIComponent).join('/');
    before += bytes.length;
    after += out.length;
    changed++;
    console.log(`  foto  ${id}: ${key} (${kb(bytes.length)}, ${type}) → ${newKey} (${kb(out.length)})`);
    if (APPLY) {
      await putObject(newKey, out, 'image/webp');
      await d1('UPDATE nodes SET image_url = ?1 WHERE id = ?2', [newUrl, id]);
    }
  } catch (e) {
    failures.push(`${id}: ${e.message}`);
  }
}

console.log(`\nTotal das fotos usadas: ${kb(before)} → ${kb(after)} (${changed} convertidas).`);
if (failures.length) {
  console.log(`\nFALHAS (${failures.length}):\n  ${failures.join('\n  ')}`);
  process.exit(1);
}
if (!APPLY) console.log('\nNada foi alterado. Rode com --apply para gravar no R2 e no D1.');
