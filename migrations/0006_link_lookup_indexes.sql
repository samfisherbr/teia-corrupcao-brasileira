-- ============================================================================
-- MIGRAÇÃO 0006 — índices de busca por ponta do vínculo
-- ============================================================================
-- O schema.sql sempre declarou idx_links_source e idx_links_target, mas o banco
-- de produção foi criado sem eles. Sem os índices, cada dossiê
-- (`WHERE l.source = ? OR l.target = ?`) lia a tabela links inteira; com eles,
-- lê só os vínculos do esquema (~1.650 → ~165 linhas lidas por dossiê).
--
-- Aplicada em produção em 2026-11-16. Pode rodar de novo sem risco:
--   npx wrangler d1 execute corruption_graph_db --remote --file=./migrations/0006_link_lookup_indexes.sql
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_links_source ON links(source);
CREATE INDEX IF NOT EXISTS idx_links_target ON links(target);
