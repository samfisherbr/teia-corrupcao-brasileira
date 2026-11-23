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
-- Banco criado ANTES de 22/11/2026? Falta a coluna links.amount_kind: rode uma
-- vez migrations/0007_amount_kind.sql.
--
-- Banco sem a tabela scheme_timelines (anterior à migração 0010)? Rode
-- migrations/0010_scheme_timelines.sql (cria a tabela e preenche os esquemas).
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
    -- Natureza do valor; obrigatória quando há amount/amount_brl, NULL quando não há.
    --   bribe: propina/vantagem indevida · damage: prejuízo ou desvio estimado ·
    --   illicit_flow: dinheiro movimentado/lavado/remetido, caixa dois ·
    --   contract: valor de contrato/financiamento/verba (não é o desviado) ·
    --   recovery: acordo, multa, ressarcimento, bloqueio, apreensão · other
    amount_kind TEXT CHECK(amount_kind IS NULL OR amount_kind IN (
                    'bribe','damage','illicit_flow','contract','recovery','other')),
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

-- CONVENÇÃO: migrações e seeds identificam vínculos pela chave natural acima
-- (source, target, type, status, COALESCE(year, -1)), nunca pelo id autoincremento,
-- que só vale no banco onde nasceu (ver migrations/README.md). O CI reprova o contrário.

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

-- Linha do tempo de cada esquema: quando começou e quando parou (ou foi
-- descoberto). Uma linha por nó `scheme`. Fonte da verdade; a cópia de reserva
-- fica em `timeline` de data/schemeDetails.ts (`npm run check:timeline-sync`
-- compara as duas). Regras das âncoras: cabeçalho de data/schemeDetails.ts.
-- Datas 'AAAA', 'AAAA-MM' ou 'AAAA-MM-DD' (a precisão que a fonte permite).
--   start_*   quando o esquema começou a operar
--   end_*     quando a atividade parou; sem data documentada, o primeiro ato
--             oficial público (operação, CPI, órgão de controle, decisão)
--   exposed_* opcional: primeiro ato oficial, quando veio DEPOIS do fim
-- *_note é justificativa interna em português (não aparece no site).
CREATE TABLE IF NOT EXISTS scheme_timelines (
    scheme_id          TEXT PRIMARY KEY REFERENCES nodes(id),
    start_date         TEXT NOT NULL CHECK(start_date GLOB '[0-9][0-9][0-9][0-9]'
                                        OR start_date GLOB '[0-9][0-9][0-9][0-9]-[0-1][0-9]'
                                        OR start_date GLOB '[0-9][0-9][0-9][0-9]-[0-1][0-9]-[0-3][0-9]'),
    start_basis        TEXT NOT NULL CHECK(start_basis IN ('documented_start','first_known_act','enabling_act')),
    start_source_url   TEXT NOT NULL CHECK(start_source_url GLOB 'http*://*'),
    start_note         TEXT,
    end_date           TEXT NOT NULL CHECK(end_date GLOB '[0-9][0-9][0-9][0-9]'
                                        OR end_date GLOB '[0-9][0-9][0-9][0-9]-[0-1][0-9]'
                                        OR end_date GLOB '[0-9][0-9][0-9][0-9]-[0-1][0-9]-[0-3][0-9]'),
    end_basis          TEXT NOT NULL CHECK(end_basis IN ('documented_end','police_investigation','parliamentary_inquiry','oversight','court_ruling')),
    end_source_url     TEXT NOT NULL CHECK(end_source_url GLOB 'http*://*'),
    end_note           TEXT,
    exposed_date       TEXT CHECK(exposed_date IS NULL
                                  OR exposed_date GLOB '[0-9][0-9][0-9][0-9]'
                                  OR exposed_date GLOB '[0-9][0-9][0-9][0-9]-[0-1][0-9]'
                                  OR exposed_date GLOB '[0-9][0-9][0-9][0-9]-[0-1][0-9]-[0-3][0-9]'),
    exposed_basis      TEXT CHECK(exposed_basis IS NULL OR exposed_basis IN ('police_investigation','parliamentary_inquiry','oversight','court_ruling')),
    exposed_source_url TEXT CHECK(exposed_source_url IS NULL OR exposed_source_url GLOB 'http*://*'),
    exposed_note       TEXT,
    -- Ordem pelo ano (datas de precisões diferentes no mesmo ano: o
    -- npm run check:timelines confere o resto).
    CHECK(substr(start_date, 1, 4) <= substr(end_date, 1, 4)),
    CHECK(exposed_date IS NULL OR substr(exposed_date, 1, 4) >= substr(end_date, 1, 4)),
    -- O trio exposed_* vem completo ou não vem.
    CHECK((exposed_date IS NULL) = (exposed_basis IS NULL) AND (exposed_date IS NULL) = (exposed_source_url IS NULL))
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
