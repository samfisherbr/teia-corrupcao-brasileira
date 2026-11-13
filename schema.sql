-- ============================================================================
-- SCHEMA DO CLOUDFLARE D1 — Teia da Corrupção
-- ============================================================================
-- Criar o banco do zero:
--   1. npx wrangler d1 create corruption_graph_db
--   2. ligue o banco ao projeto com o binding DB: o wrangler.toml já faz isso;
--      se criou um banco novo, troque o database_id lá pelo id que o passo 1 mostrar
--   3. npx wrangler d1 execute corruption_graph_db --remote --file=./schema.sql
--   4. rode os INSERTs da Fase 2 de cada dossiê aprovado (nodes antes de links)
--
-- Pode rodar este arquivo de novo sem risco: tudo usa IF NOT EXISTS.
--
-- Banco criado ANTES de 12/11/2026? As colunas image_credit, image_source_url
-- e reviewed_at não existem nele (IF NOT EXISTS não altera tabela existente):
-- rode uma vez migrations/0002_review_dates_and_credits.sql.
--
-- Banco criado ANTES de 13/11/2026? Faltam as tabelas de tradução
-- (node_translations, link_translations): rode este arquivo de novo ou
-- migrations/0003_translations.sql — os dois criam as tabelas se não existirem.
--
-- Fonte da verdade do formato dos dados. Se mudar algo aqui, mude também em
-- nos master prompts (bloco <schema>, mantidos fora do repositório), em types/graph.ts e em
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
-- diferentes entre si dentro de um índice único. O status faz parte da chave
-- porque a história processual de uma pessoa num caso é gravada em vínculos
-- separados, e dois estágios podem cair no mesmo ano (investigado e absolvido).
-- Banco que já existia sem este índice (o de produção, até a migração 0005):
-- ver migrations/0005_dedupe_links_and_unique_index.sql, que remove as cópias
-- antes de criá-lo. Sem o índice, INSERT OR IGNORE NÃO ignora nada.
CREATE UNIQUE INDEX IF NOT EXISTS idx_links_unique
    ON links(source, target, type, status, COALESCE(year, -1));

-- Índices de apoio (não fazem parte do prompt; só aceleram consultas por ponta).
CREATE INDEX IF NOT EXISTS idx_links_source ON links(source);
CREATE INDEX IF NOT EXISTS idx_links_target ON links(target);

-- Traduções (inglês e espanhol) dos textos de nodes e links. O português fica
-- nas tabelas acima; aqui, só os textos traduzidos. Explicação completa e
-- exemplos de INSERT em migrations/0003_translations.sql.
CREATE TABLE IF NOT EXISTS node_translations (
    node_id     TEXT NOT NULL,
    lang        TEXT NOT NULL CHECK(lang IN ('en','es')),
    label       TEXT,
    summary     TEXT,
    source_text TEXT NOT NULL,
    PRIMARY KEY (node_id, lang)
);

CREATE TABLE IF NOT EXISTS link_translations (
    link_id     INTEGER NOT NULL,
    lang        TEXT NOT NULL CHECK(lang IN ('en','es')),
    relation    TEXT,
    amount      TEXT,
    amount_note TEXT,
    source_text TEXT NOT NULL,
    PRIMARY KEY (link_id, lang)
);

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
