-- Histórico do PageSpeed Insights. Mesmas colunas do history.csv do plugin
-- teia-pagespeed, mais `issues_json` (principais auditorias reprovadas) e `source`.
CREATE TABLE IF NOT EXISTS pagespeed_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  analyzed_at TEXT NOT NULL,          -- ISO 8601, UTC
  url TEXT NOT NULL,
  final_url TEXT,
  strategy TEXT NOT NULL CHECK (strategy IN ('mobile', 'desktop')),
  performance INTEGER,
  accessibility INTEGER,
  best_practices INTEGER,
  seo INTEGER,
  lab_fcp_ms REAL,
  lab_lcp_ms REAL,
  lab_tbt_ms REAL,
  lab_cls REAL,
  lab_speed_index_ms REAL,
  lab_ttfb_ms REAL,
  field_lcp_ms REAL,
  field_inp_ms REAL,
  field_cls REAL,
  field_fcp_ms REAL,
  field_ttfb_ms REAL,
  field_overall TEXT,
  field_scope TEXT,                   -- 'page' | 'origin' | ''
  lighthouse_version TEXT,
  note TEXT,
  issues_json TEXT,
  source TEXT NOT NULL DEFAULT 'cron' -- 'cron' | 'import'
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_runs_unique ON pagespeed_runs (url, strategy, analyzed_at);
CREATE INDEX IF NOT EXISTS idx_runs_lookup ON pagespeed_runs (strategy, analyzed_at DESC);
