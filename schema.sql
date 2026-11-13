-- ============================================================================
-- SCHEMA DO CLOUDFLARE D1 — Teia da Corrupção (Master Prompt v4)
-- ============================================================================
-- Criar o banco do zero:
--   1. npx wrangler d1 create teia-corrupcao
--   2. ligue o banco ao projeto do Cloudflare Pages com o nome de binding DB
--      (Pages → Settings → Functions → D1 database bindings, ou wrangler.toml)
--   3. npx wrangler d1 execute teia-corrupcao --remote --file=./schema.sql
--   4. rode os INSERTs da Fase 2 de cada dossiê aprovado (nodes antes de links)
--
-- Pode rodar este arquivo de novo sem risco: tudo usa IF NOT EXISTS.
--
-- Banco criado ANTES de 12/11/2026? As colunas image_credit, image_source_url
-- e reviewed_at não existem nele (IF NOT EXISTS não altera tabela existente):
-- rode uma vez migrations/0002_review_dates_and_credits.sql.
--
-- Fonte da verdade do formato dos dados. Se mudar algo aqui, mude também em
-- docs/MasterPrompt_Dossie.txt e docs/MasterPrompt_Scheduled.txt (blocos <schema>), em types/graph.ts e em
-- lib/graphConfig.ts (cores/rótulos de status).
-- ============================================================================

-- Entidades do grafo (círculos).
CREATE TABLE IF NOT EXISTS nodes (
    id         TEXT PRIMARY KEY,
    label      TEXT NOT NULL,
    type       TEXT NOT NULL CHECK(type IN ('politician','party','scheme','company','operator')),
    party      TEXT,
    image_url  TEXT,
    summary    TEXT NOT NULL,
    -- Crédito da foto (autor + licença) e página de origem. Obrigatórios, na
    -- prática, para fotos sob licença Creative Commons (ex.: Wikimedia Commons).
    image_credit     TEXT,
    image_source_url TEXT
);

-- Vínculos entre entidades (linhas).
CREATE TABLE IF NOT EXISTS links (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    source      TEXT NOT NULL,
    target      TEXT NOT NULL,
    relation    TEXT NOT NULL,
    type        TEXT NOT NULL CHECK(type IN ('transaction','contract','process')),
    status      TEXT NOT NULL CHECK(status IN (
                    'confirmed',
                    'under_investigation',
                    'convicted_appealing',
                    'convicted_final',
                    'annulled',
                    'acquitted'
                )),
    amount      TEXT,
    amount_brl  INTEGER,
    amount_note TEXT,
    year        INTEGER,
    source_url  TEXT NOT NULL,
    -- Data (AAAA-MM-DD) em que o status deste vínculo foi conferido pela
    -- última vez. Atualize junto com o status.
    reviewed_at TEXT,
    FOREIGN KEY(source) REFERENCES nodes(id),
    FOREIGN KEY(target) REFERENCES nodes(id)
);

-- Torna `INSERT OR IGNORE INTO links` idempotente: rodar o mesmo dossiê duas
-- vezes não duplica vínculos. COALESCE porque o SQLite trata NULLs como
-- diferentes entre si dentro de um índice único.
CREATE UNIQUE INDEX IF NOT EXISTS idx_links_unique
    ON links(source, target, type, COALESCE(year, -1));

-- Índices de apoio (não fazem parte do prompt; só aceleram consultas por ponta).
CREATE INDEX IF NOT EXISTS idx_links_source ON links(source);
CREATE INDEX IF NOT EXISTS idx_links_target ON links(target);

-- ============================================================================
-- CONSULTAS DE VERIFICAÇÃO (rodar manualmente, ex.: após inserir um dossiê)
-- ============================================================================

-- Regra de ouro — nós sem nenhum vínculo (devem ser 0):
-- SELECT id FROM nodes WHERE id NOT IN (SELECT source FROM links UNION SELECT target FROM links);

-- Referências fantasma — links apontando para ids inexistentes (devem ser 0):
-- SELECT * FROM links WHERE source NOT IN (SELECT id FROM nodes) OR target NOT IN (SELECT id FROM nodes);

-- Políticos sem vínculo com partido ou sem vínculo com esquema:
-- SELECT n.id FROM nodes n WHERE n.type = 'politician' AND (
--   NOT EXISTS (SELECT 1 FROM links l JOIN nodes p ON p.id IN (l.source, l.target) AND p.type = 'party'
--               WHERE n.id IN (l.source, l.target))
--   OR NOT EXISTS (SELECT 1 FROM links l JOIN nodes s ON s.id IN (l.source, l.target) AND s.type = 'scheme'
--               WHERE n.id IN (l.source, l.target)));

-- Ids fora do padrão ^[a-z0-9_]+$ (acentos, espaços, hífen, maiúsculas):
-- SELECT id FROM nodes WHERE id GLOB '*[^a-z0-9_]*';
