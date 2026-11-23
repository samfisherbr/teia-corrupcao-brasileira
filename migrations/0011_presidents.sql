-- ============================================================================
-- MIGRAÇÃO 0011 — presidentes da República (tabela presidents)
-- ============================================================================
-- Alimenta a faixa "Presidente" do gráfico "Quanto tempo cada esquema durou"
-- (Infográficos). Quando um presidente novo assumir (ou um mandato terminar),
-- basta um INSERT/UPDATE aqui: o gráfico muda sozinho, sem deploy (o dado novo
-- aparece em até 5 min, o tempo do cache de /api/graph). Sem a tabela, o site
-- usa a lista de reserva DEFAULT_PRESIDENTS em lib/infographics.ts.
--
-- Posse de um novo presidente:
--   UPDATE presidents SET term_end = 'AAAA-MM-DD' WHERE id = 'lula2';
--   INSERT OR REPLACE INTO presidents (id, name, party, term_start, term_end)
--   VALUES ('novo_id', 'Nome', 'SIGLA', 'AAAA-MM-DD', NULL);
-- Só um presidente pode ter term_end NULL (o atual).
--
-- Rodar:
--   npx wrangler d1 execute corruption_graph_db --remote --file=./migrations/0011_presidents.sql
-- Pode rodar de novo: CREATE TABLE IF NOT EXISTS + INSERT OR REPLACE pela chave id.
-- Sem vínculos nesta migração (a regra da chave natural não se aplica).
-- ============================================================================

CREATE TABLE IF NOT EXISTS presidents (
    id         TEXT PRIMARY KEY CHECK(id GLOB '[a-z0-9_]*'),
    name       TEXT NOT NULL,
    -- Sigla do partido na posse (texto livre; não é chave para a tabela nodes).
    party      TEXT NOT NULL,
    term_start TEXT NOT NULL CHECK(term_start GLOB '[0-9][0-9][0-9][0-9]-[0-1][0-9]-[0-3][0-9]'),
    -- NULL = ainda no cargo.
    term_end   TEXT CHECK(term_end IS NULL OR term_end GLOB '[0-9][0-9][0-9][0-9]-[0-1][0-9]-[0-3][0-9]'),
    CHECK(term_end IS NULL OR term_end >= term_start)
);

INSERT OR REPLACE INTO presidents (id, name, party, term_start, term_end) VALUES
    ('sarney', 'Sarney', 'PMDB', '1985-03-15', '1990-03-15'),
    ('collor', 'Collor', 'PRN', '1990-03-15', '1992-12-29'),
    ('itamar', 'Itamar', 'PMDB', '1992-12-29', '1995-01-01'),
    ('fhc', 'FHC', 'PSDB', '1995-01-01', '2003-01-01'),
    ('lula1', 'Lula', 'PT', '2003-01-01', '2011-01-01'),
    ('dilma', 'Dilma', 'PT', '2011-01-01', '2016-08-31'),
    ('temer', 'Temer', 'MDB', '2016-08-31', '2019-01-01'),
    ('bolsonaro', 'Bolsonaro', 'PSL', '2019-01-01', '2023-01-01'),
    ('lula2', 'Lula', 'PT', '2023-01-01', NULL);
