-- ============================================================================
-- MIGRAÇÃO 0002 — data de conferência dos vínculos e crédito das fotos
-- ============================================================================
-- Rodar UMA vez em bancos criados antes de 12/11/2026:
--   npx wrangler d1 execute corruption_graph_db --remote --file=./migrations/0002_review_dates_and_credits.sql
-- (rodar de novo dá "duplicate column name" e não altera nada.)
--
-- As três colunas são opcionais (NULL): o site funciona sem elas e passa a
-- mostrar a informação conforme for preenchida.
-- ============================================================================

-- Data (AAAA-MM-DD) em que o status do vínculo foi conferido pela última vez.
ALTER TABLE links ADD COLUMN reviewed_at TEXT;

-- Crédito da foto (autor + licença) e página de origem.
ALTER TABLE nodes ADD COLUMN image_credit TEXT;
ALTER TABLE nodes ADD COLUMN image_source_url TEXT;

-- Exemplos de preenchimento:
-- UPDATE links SET reviewed_at = '2026-11-12' WHERE source = 'pol_fulano' AND target = 'esquema_x';
-- UPDATE nodes SET image_credit = 'Fulano de Tal / Wikimedia Commons, CC BY-SA 4.0',
--                  image_source_url = 'https://commons.wikimedia.org/wiki/File:Exemplo.jpg'
--  WHERE id = 'pol_fulano';
