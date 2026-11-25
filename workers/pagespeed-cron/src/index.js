/**
 * Roda o PageSpeed Insights (mobile + desktop) e guarda o resultado no D1.
 * O Lighthouse roda nos servidores do Google; o Worker só chama a API.
 *
 *  - Cron diário: roda TARGET_URLS e grava (source = 'cron').
 *  - POST /run   (plugin teia-pagespeed): roda sob demanda, grava e devolve o
 *    relatório condensado + a resposta bruta (para get_audit_details).
 *  - GET /history?strategy=&url=&limit=: últimas execuções, da mais antiga para a mais nova.
 *
 * As rotas exigem `Authorization: Bearer <API_TOKEN>`; sem o segredo API_TOKEN
 * respondem 404.
 */

const API = 'https://pagespeedonline.googleapis.com/pagespeedonline/v5/runPagespeed';
const STRATEGIES = ['mobile', 'desktop'];
const ALL_CATEGORIES = ['PERFORMANCE', 'ACCESSIBILITY', 'BEST_PRACTICES', 'SEO'];
const ISSUE_LIMITS = { performance: 12, accessibility: 10, 'best-practices': 8, seo: 8 };

const pct = (s) => (typeof s === 'number' ? Math.round(s * 100) : null);
const round = (n, d = 0) => (typeof n === 'number' ? Number(n.toFixed(d)) : null);

async function callPsi({ url, strategy, categories, locale, key }) {
  const qs = new URLSearchParams({ url, strategy: strategy.toUpperCase(), key });
  if (locale) qs.set('locale', locale);
  for (const c of categories) qs.append('category', c);
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
    const p75 = k === 'CUMULATIVE_LAYOUT_SHIFT_SCORE' && typeof v.percentile === 'number' ? v.percentile / 100 : v.percentile;
    metrics[k] = { p75, category: v.category };
  }
  return { scope: le.id, overall: le.overall_category ?? null, origin_fallback: !!le.origin_fallback, metrics };
}

function issuesFor(lr, key, limit) {
  const out = [];
  for (const ref of lr.categories?.[key]?.auditRefs ?? []) {
    if (ref.group === 'metrics' || ref.group === 'hidden') continue;
    const a = lr.audits?.[ref.id];
    if (!a || typeof a.score !== 'number' || a.score >= 0.9) continue;
    if (['notApplicable', 'manual', 'informative', 'error'].includes(a.scoreDisplayMode)) continue;
    const ms = a.metricSavings ?? {};
    // Economias em métricas diferentes se sobrepõem: pega a maior, não a soma.
    const savingsMs = Math.round(Math.max(ms.LCP || 0, ms.FCP || 0, ms.TBT || 0, ms.INP || 0, a.details?.overallSavingsMs || 0));
    const bytes = a.details?.overallSavingsBytes || 0;
    out.push({
      id: a.id,
      title: a.title,
      score: a.score,
      display: a.displayValue ?? null,
      est_savings_ms: savingsMs || undefined,
      est_savings_kib: bytes ? Math.round(bytes / 1024) : undefined,
      cls_savings: ms.CLS || undefined,
      weight: ref.weight || 0,
      items: Array.isArray(a.details?.items) ? a.details.items.length : undefined,
    });
  }
  out.sort((x, y) => (y.est_savings_ms || 0) - (x.est_savings_ms || 0) || y.weight - x.weight || x.score - y.score);
  return out.slice(0, limit);
}

/** Mesmo formato condensado que o plugin teia-pagespeed sempre devolveu. */
export function condense(raw, strategy) {
  const lr = raw.lighthouseResult ?? {};
  const num = (id) => lr.audits?.[id]?.numericValue;
  const cats = lr.categories ?? {};
  return {
    url: lr.requestedUrl ?? raw.id,
    final_url: lr.finalUrl ?? raw.id,
    strategy,
    analyzed_at: raw.analysisUTCTimestamp ?? lr.fetchTime ?? new Date().toISOString(),
    lighthouse_version: lr.lighthouseVersion ?? null,
    scores: {
      performance: pct(cats.performance?.score),
      accessibility: pct(cats.accessibility?.score),
      best_practices: pct(cats['best-practices']?.score),
      seo: pct(cats.seo?.score),
    },
    lab_metrics: {
      fcp_ms: round(num('first-contentful-paint')),
      lcp_ms: round(num('largest-contentful-paint')),
      tbt_ms: round(num('total-blocking-time')),
      cls: round(num('cumulative-layout-shift'), 3),
      speed_index_ms: round(num('speed-index')),
      ttfb_ms: round(num('server-response-time')),
    },
    field_data_page: fieldData(raw.loadingExperience),
    field_data_origin: fieldData(raw.originLoadingExperience),
    issues: Object.fromEntries(Object.entries(ISSUE_LIMITS).map(([k, n]) => [k.replace('-', '_'), issuesFor(lr, k, n)])),
    run_warnings: lr.runWarnings?.length ? lr.runWarnings : undefined,
    runtime_error: lr.runtimeError?.message || undefined,
  };
}

const COLUMNS = [
  'analyzed_at', 'url', 'final_url', 'strategy', 'performance', 'accessibility', 'best_practices', 'seo',
  'lab_fcp_ms', 'lab_lcp_ms', 'lab_tbt_ms', 'lab_cls', 'lab_speed_index_ms', 'lab_ttfb_ms',
  'field_lcp_ms', 'field_inp_ms', 'field_cls', 'field_fcp_ms', 'field_ttfb_ms', 'field_overall', 'field_scope',
  'lighthouse_version', 'note', 'issues_json', 'source',
];

export function toRow(report, { note = '', source = 'cron' } = {}) {
  const page = report.field_data_page;
  const fd = page && !page.origin_fallback ? page : report.field_data_origin;
  const m = fd?.metrics ?? {};
  return {
    analyzed_at: report.analyzed_at,
    url: report.url,
    final_url: report.final_url,
    strategy: report.strategy,
    ...report.scores,
    lab_fcp_ms: report.lab_metrics.fcp_ms,
    lab_lcp_ms: report.lab_metrics.lcp_ms,
    lab_tbt_ms: report.lab_metrics.tbt_ms,
    lab_cls: report.lab_metrics.cls,
    lab_speed_index_ms: report.lab_metrics.speed_index_ms,
    lab_ttfb_ms: report.lab_metrics.ttfb_ms,
    field_lcp_ms: m.LARGEST_CONTENTFUL_PAINT_MS?.p75 ?? null,
    field_inp_ms: m.INTERACTION_TO_NEXT_PAINT?.p75 ?? null,
    field_cls: m.CUMULATIVE_LAYOUT_SHIFT_SCORE?.p75 ?? null,
    field_fcp_ms: m.FIRST_CONTENTFUL_PAINT_MS?.p75 ?? null,
    field_ttfb_ms: m.EXPERIMENTAL_TIME_TO_FIRST_BYTE?.p75 ?? null,
    field_overall: fd?.overall ?? null,
    field_scope: fd ? (fd === page ? 'page' : 'origin') : '',
    lighthouse_version: report.lighthouse_version,
    note,
    issues_json: JSON.stringify(report.issues),
    source,
  };
}

async function saveRow(db, row) {
  await db
    .prepare(`INSERT OR IGNORE INTO pagespeed_runs (${COLUMNS.join(',')}) VALUES (${COLUMNS.map(() => '?').join(',')})`)
    .bind(...COLUMNS.map((c) => row[c] ?? null))
    .run();
}

/** Roda uma URL/estratégia; devolve { report, raw, saved }. Só grava com as 4 categorias (senão as notas viriam nulas e sujariam o histórico). */
async function runOne(env, { url, strategy, categories = ALL_CATEGORIES, locale = 'en', note = '', save = true, source }) {
  const raw = await callPsi({ url, strategy, categories, locale, key: env.PSI_API_KEY });
  const report = condense(raw, strategy);
  const complete = ALL_CATEGORIES.every((c) => categories.includes(c));
  const saved = save && complete && !report.runtime_error;
  if (saved) await saveRow(env.DB, toRow(report, { note, source }));
  return { report, raw, saved };
}

async function runScheduled(env) {
  if (!env.PSI_API_KEY) throw new Error('Segredo PSI_API_KEY não configurado');
  const urls = (env.TARGET_URLS ?? '').split(',').map((u) => u.trim()).filter(Boolean);
  const jobs = urls.flatMap((url) => STRATEGIES.map((strategy) => ({ url, strategy })));
  // Uma falha (por exemplo, cota) não impede as outras execuções de serem gravadas.
  const results = await Promise.allSettled(jobs.map((j) => runOne(env, { ...j, source: 'cron' })));
  const failed = results.flatMap((r, i) => (r.status === 'rejected' ? [`${jobs[i].url} [${jobs[i].strategy}]: ${r.reason?.message ?? r.reason}`] : []));
  if (failed.length) throw new Error(`${failed.length}/${jobs.length} execuções falharam: ${failed.join(' | ')}`);
}

async function authorized(request, env) {
  const given = new TextEncoder().encode(request.headers.get('authorization') ?? '');
  const want = new TextEncoder().encode(`Bearer ${env.API_TOKEN}`);
  return given.length === want.length && crypto.subtle.timingSafeEqual(given, want);
}

async function handleRun(request, env) {
  if (!env.PSI_API_KEY) return Response.json({ error: 'PSI_API_KEY não configurado no Worker' }, { status: 500 });
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') return Response.json({ error: 'corpo JSON inválido' }, { status: 400 });
  const url = body.url || (env.TARGET_URLS ?? '').split(',')[0]?.trim();
  if (!/^https?:\/\//i.test(url ?? '')) return Response.json({ error: 'url deve começar com http:// ou https://' }, { status: 400 });
  const strategies = !body.strategy || body.strategy === 'both' ? STRATEGIES : [String(body.strategy).toLowerCase()];
  if (!strategies.every((s) => STRATEGIES.includes(s))) return Response.json({ error: 'strategy: mobile, desktop ou both' }, { status: 400 });
  const categories = Array.isArray(body.categories) && body.categories.length ? body.categories.map(String) : ALL_CATEGORIES;
  if (!categories.every((c) => ALL_CATEGORIES.includes(c))) return Response.json({ error: `categories: ${ALL_CATEGORIES.join(', ')}` }, { status: 400 });

  const results = await Promise.allSettled(
    strategies.map((strategy) =>
      runOne(env, { url, strategy, categories, locale: body.locale || 'en', note: String(body.note ?? ''), save: body.save !== false, source: 'plugin' }),
    ),
  );
  const runs = [];
  const raw = {};
  results.forEach((r, i) => {
    if (r.status === 'rejected') return runs.push({ strategy: strategies[i], error: r.reason?.message ?? String(r.reason) });
    runs.push({ ...r.value.report, saved: r.value.saved });
    raw[strategies[i]] = r.value.raw;
  });
  return Response.json({ runs, raw });
}

async function handleHistory(url, env) {
  const strategy = url.searchParams.get('strategy');
  const target = url.searchParams.get('url');
  const limit = Math.max(1, Math.min(Number(url.searchParams.get('limit')) || 30, 500));
  const where = [];
  const args = [];
  if (strategy === 'mobile' || strategy === 'desktop') { where.push('strategy = ?'); args.push(strategy); }
  if (target) { where.push('url = ?'); args.push(target); }
  const sql = `SELECT * FROM (SELECT * FROM pagespeed_runs ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY analyzed_at DESC LIMIT ?) ORDER BY analyzed_at ASC`;
  const { results } = await env.DB.prepare(sql).bind(...args, limit).all();
  return Response.json({ rows: results });
}

const worker = {
  async scheduled(_event, env, ctx) {
    ctx.waitUntil(runScheduled(env));
  },

  async fetch(request, env) {
    const url = new URL(request.url);
    const isRun = request.method === 'POST' && url.pathname === '/run';
    const isHistory = request.method === 'GET' && url.pathname === '/history';
    if (!env.API_TOKEN || !(isRun || isHistory)) return new Response('Not found', { status: 404 });
    if (!(await authorized(request, env))) return new Response('Unauthorized', { status: 401 });
    return isRun ? handleRun(request, env) : handleHistory(url, env);
  },
};

export default worker;
