-- Cloudflare D1 schema for Teia da Corrupção.
-- (The previous schema.sql contained the dossier prompt text, not SQL; it now
--  lives in docs/prompt-dossie.md.)
--
-- Apply to a NEW database:
--   npx wrangler d1 execute <DB_NAME> --remote --file=./schema.sql
--
-- For an EXISTING database, SQLite can't add CHECK/UNIQUE constraints in place.
-- Run the dedup query at the bottom first, then create the unique index; that
-- index alone is what makes `INSERT OR IGNORE INTO links` idempotent.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS nodes (
  id         TEXT PRIMARY KEY CHECK (id = lower(id) AND id NOT LIKE '% %'),
  label      TEXT NOT NULL,
  type       TEXT NOT NULL CHECK (type IN ('politician', 'party', 'scheme', 'company', 'operator')),
  party      TEXT,
  summary    TEXT,
  image_url  TEXT CHECK (image_url IS NULL OR image_url LIKE 'https://%')
);

CREATE TABLE IF NOT EXISTS links (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  source      TEXT NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  target      TEXT NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  relation    TEXT NOT NULL,
  type        TEXT CHECK (type IS NULL OR type IN ('transaction', 'contract', 'process')),
  status      TEXT NOT NULL CHECK (status IN ('confirmed', 'under_investigation', 'acquitted')),
  amount      TEXT,
  year        INTEGER CHECK (year IS NULL OR year BETWEEN 1500 AND 2100),
  source_url  TEXT,
  CHECK (source <> target)
);

-- Without a unique key, `INSERT OR IGNORE` never ignores anything and re-running
-- an approved dossier duplicates every link. COALESCE because SQLite treats
-- NULLs as distinct inside UNIQUE.
CREATE UNIQUE INDEX IF NOT EXISTS ux_links_edge
  ON links (source, target, COALESCE(type, ''), COALESCE(year, 0));

CREATE INDEX IF NOT EXISTS ix_links_source ON links (source);
CREATE INDEX IF NOT EXISTS ix_links_target ON links (target);
CREATE INDEX IF NOT EXISTS ix_nodes_type   ON nodes (type);

-- ---------------------------------------------------------------------------
-- Maintenance queries (run manually)
-- ---------------------------------------------------------------------------

-- 1) Remove duplicate links before creating ux_links_edge on an existing DB:
-- DELETE FROM links WHERE rowid NOT IN (
--   SELECT MIN(rowid) FROM links
--   GROUP BY source, target, COALESCE(type, ''), COALESCE(year, 0)
-- );

-- 2) Convert literal 'NULL' strings (from generated INSERTs) into real NULLs:
-- UPDATE nodes SET party = NULL     WHERE party IN ('NULL', 'N/A', '');
-- UPDATE nodes SET image_url = NULL WHERE image_url IN ('NULL', '');
-- UPDATE links SET amount = NULL    WHERE amount IN ('NULL', 'N/A', '');
-- UPDATE links SET source_url = NULL WHERE source_url IN ('NULL', '');

-- 3) "Golden rule" check — nodes that are not connected to anything:
-- SELECT id FROM nodes WHERE id NOT IN (SELECT source FROM links UNION SELECT target FROM links);

-- 4) Links pointing to ids that don't exist in nodes (typos in source/target):
-- SELECT * FROM links WHERE source NOT IN (SELECT id FROM nodes) OR target NOT IN (SELECT id FROM nodes);
