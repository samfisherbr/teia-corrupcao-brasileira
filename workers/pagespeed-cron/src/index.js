/**
 * Roda o PageSpeed Insights (mobile + desktop) uma vez por dia e grava em D1.
 * O Lighthouse roda nos servidores do Google; o Worker só chama a API.
 *
 * GET /history?strategy=mobile|desktop&url=…&limit=30 (Authorization: Bearer
 * READ_TOKEN) devolve as últimas execuções, da mais antiga para a mais nova.
 * Sem o segredo READ_TOKEN, a rota responde 404.
 */

const API = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
const STRATEGIES = ['mobile', 'desktop'];
const CATEGORIES = ['performance', 'accessibility', 'best-practices', 'seo'];

const pct = (s) => (typeof s === 'number' ? Math.round(s * 100) : null);
const round = (n, d = 0) => (typeof n === 'number' ? Number(n.toFixed(d)) : null);

async function callPsi(url, strategy, key) {
  const qs = new URLSearchParams({ url, strategy, key });
  for (const c of CATEGORIES) qs.append('category', c);
  let lastErr;
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt) await new Promise((r) => setTimeout(r, 5000 * attempt));
    const res = await fetch(`${API}?${qs}`, { signal: AbortSignal.timeout(150_000) });
    if (res.ok) return res.json();
    const body = await res.json().catch(() => ({}));
    lastErr = new Error(`PSI ${res.status}: ${body?.error?.message ?? 'sem detalhe'}`);
    if (res.status !== 429 && res.status < 500) break; // erro do pedido: não adianta repetir
  }
  throw lastErr;
}

function fieldData(le) {
  if (!le?.metrics) return null;
  const metrics = {};
  for (const [k, v] of Object.entries(le.metrics)) {
    // O CrUX informa o CLS multiplicado por 100.
    metrics[k] = k === 'CUMULATIVE_LAYOUT_SHIFT_SCORE' && typeof v.percentile === 'number' ? v.percentile / 100 : v.percentile;
  }
  return { overall: le.overall_category ?? null, originFallback: !!le.origin_fallback, metrics };
}

function topIssues(lr, limit = 25) {
  const out = [];
  for (const key of CATEGORIES) {
    for (const ref of lr.categories?.[key]?.auditRefs ?? []) {
      if (ref.group === 'metrics' || ref.group === 'hidden') continue;
      const a = lr.audits?.[ref.id];
      if (!a || typeof a.score !== 'number' || a.score >= 0.9) continue;
      if (['notApplicable', 'manual', 'informative', 'error'].includes(a.scoreDisplayMode)) continue;
      const ms = a.metricSavings ?? {};
      out.push({
        category: key,
        id: a.id,
        title: a.title,
        score: a.score,
        savings_ms: Math.round(Math.max(ms.LCP || 0, ms.FCP || 0, ms.TBT || 0, ms.INP || 0, a.details?.overallSavingsMs || 0)),
      });
    }
  }
  return out.sort((x, y) => y.savings_ms - x.savings_ms || x.score - y.score).slice(0, limit);
}

export function toRow(raw, url, strategy) {
  const lr = raw.lighthouseResult ?? {};
  if (lr.runtimeError) throw new Error(`Lighthouse: ${lr.runtimeError.message}`);
  const num = (id) => lr.audits?.[id]?.numericValue;
  const page = fieldData(raw.loadingExperience);
  const origin = fieldData(raw.originLoadingExperience);
  const fd = page && !page.originFallback ? page : origin;
  const m = fd?.metrics ?? {};
  const cats = lr.categories ?? {};
  return {
    analyzed_at: raw.analysisUTCTimestamp ?? lr.fetchTime ?? new Date().toISOString(),
    url,
    final_url: lr.finalUrl ?? null,
    strategy,
    performance: pct(cats.performance?.score),
    accessibility: pct(cats.accessibility?.score),
    best_practices: pct(cats['best-practices']?.score),
    seo: pct(cats.seo?.score),
    lab_fcp_ms: round(num('first-contentful-paint')),
    lab_lcp_ms: round(num('largest-contentful-paint')),
    lab_tbt_ms: round(num('total-blocking-time')),
    lab_cls: round(num('cumulative-layout-shift'), 3),
    lab_speed_index_ms: round(num('speed-index')),
    lab_ttfb_ms: round(num('server-response-time')),
    field_lcp_ms: m.LARGEST_CONTENTFUL_PAINT_MS ?? null,
    field_inp_ms: m.INTERACTION_TO_NEXT_PAINT ?? null,
    field_cls: m.CUMULATIVE_LAYOUT_SHIFT_SCORE ?? null,
    field_fcp_ms: m.FIRST_CONTENTFUL_PAINT_MS ?? null,
    field_ttfb_ms: m.EXPERIMENTAL_TIME_TO_FIRST_BYTE ?? null,
    field_overall: fd?.overall ?? null,
    field_scope: fd ? (fd === page ? 'page' : 'origin') : '',
    lighthouse_version: lr.lighthouseVersion ?? null,
    note: '',
    issues_json: JSON.stringify(topIssues(lr)),
    source: 'cron',
  };
}

const COLUMNS = [
  'analyzed_at', 'url', 'final_url', 'strategy', 'performance', 'accessibility', 'best_practices', 'seo',
  'lab_fcp_ms', 'lab_lcp_ms', 'lab_tbt_ms', 'lab_cls', 'lab_speed_index_ms', 'lab_ttfb_ms',
  'field_lcp_ms', 'field_inp_ms', 'field_cls', 'field_fcp_ms', 'field_ttfb_ms', 'field_overall', 'field_scope',
  'lighthouse_version', 'note', 'issues_json', 'source',
];

async function saveRow(db, row) {
  await db
    .prepare(`INSERT OR IGNORE INTO pagespeed_runs (${COLUMNS.join(',')}) VALUES (${COLUMNS.map(() => '?').join(',')})`)
    .bind(...COLUMNS.map((c) => row[c] ?? null))
    .run();
}

async function runAll(env) {
  if (!env.PSI_API_KEY) throw new Error('Segredo PSI_API_KEY não configurado');
  const urls = (env.TARGET_URLS ?? '').split(',').map((u) => u.trim()).filter(Boolean);
  const jobs = urls.flatMap((url) => STRATEGIES.map((strategy) => ({ url, strategy })));
  // Uma falha (por exemplo, cota) não impede as outras execuções de serem gravadas.
  const results = await Promise.allSettled(
    jobs.map(async ({ url, strategy }) => {
      const raw = await callPsi(url, strategy, env.PSI_API_KEY);
      await saveRow(env.DB, toRow(raw, url, strategy));
    }),
  );
  const failed = results.flatMap((r, i) => (r.status === 'rejected' ? [`${jobs[i].url} [${jobs[i].strategy}]: ${r.reason?.message ?? r.reason}`] : []));
  if (failed.length) throw new Error(`${failed.length}/${jobs.length} execuções falharam: ${failed.join(' | ')}`);
}

const worker = {
  async scheduled(_event, env, ctx) {
    ctx.waitUntil(runAll(env));
  },

  async fetch(request, env) {
    const u = new URL(request.url);
    if (u.pathname !== '/history' || !env.READ_TOKEN) return new Response('Not found', { status: 404 });
    if (request.headers.get('authorization') !== `Bearer ${env.READ_TOKEN}`) return new Response('Unauthorized', { status: 401 });
    const strategy = u.searchParams.get('strategy');
    const url = u.searchParams.get('url');
    const limit = Math.max(1, Math.min(Number(u.searchParams.get('limit')) || 30, 500));
    const where = [];
    const args = [];
    if (strategy === 'mobile' || strategy === 'desktop') { where.push('strategy = ?'); args.push(strategy); }
    if (url) { where.push('url = ?'); args.push(url); }
    const sql = `SELECT * FROM (SELECT * FROM pagespeed_runs ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY analyzed_at DESC LIMIT ?) ORDER BY analyzed_at ASC`;
    const { results } = await env.DB.prepare(sql).bind(...args, limit).all();
    return Response.json({ rows: results });
  },
};

export default worker;
