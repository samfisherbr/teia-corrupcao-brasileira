-- ============================================================================
-- MIGRAÇÃO 0005 — PROPOSTA, AINDA NÃO APLICADA
-- Remove vínculos duplicados e cria o índice único que faltava no banco.
-- ============================================================================
-- Aplicar (depois de revisar):
--   npx wrangler d1 export corruption_graph_db --remote --output=backup-antes-0005.sql
--   npx wrangler d1 execute corruption_graph_db --remote --file=./migrations/0005_dedupe_links_and_unique_index.sql
-- Depende da 0004 (já aplicada), que deixou os pares 84/117 e 94/127 idênticos.
--
-- O PROBLEMA
-- schema.sql define idx_links_unique, mas o índice nunca foi criado no banco
-- de produção (o banco é anterior a ele, e CREATE TABLE IF NOT EXISTS não
-- altera tabela existente). Sem o índice, "INSERT OR IGNORE" não ignora nada:
-- rodar o mesmo dossiê duas vezes duplicou 33 vínculos do Escândalo do TRT-SP,
-- da Compra de Votos da Reeleição e dos Anões do Orçamento (ids 103–135 e 117,
-- 127 repetem 70–102, 84 e 94). Em 13/11/2026 havia 36 grupos com o mesmo
-- (source, target, type, year):
--   - 33 cópias exatas ............................. apagar a mais nova;
--   - 3 grupos de filiação Jair Bolsonaro → PL 2021 (588, 602, 618), escritos
--     por três dossiês diferentes ......................... manter só o 602;
--   - Delúbio Soares → PT 2004 (242 e 258): o 258 é, na verdade, a declaração
--     de Delúbio sobre as doações de laboratórios no caso da Operação Vampiro
--     .................................. passa a ligar Delúbio ao esquema;
--   - Ricardo Fiúza → Anões do Orçamento 1993 (37 under_investigation e 38
--     acquitted): dois fatos distintos do mesmo ano ......... ficam os dois.
--
-- A CHAVE NOVA
-- O índice passa a incluir o status: (source, target, type, status, year).
-- Motivo: o site registra a história processual em vínculos separados, e no
-- mesmo ano a mesma pessoa pode ser investigada e absolvida (caso do Fiúza).
-- A chave continua barrando o que causou o problema: o mesmo vínculo gravado
-- duas vezes, e a mesma filiação repetida por dossiês diferentes.
--
-- Nada aqui altera texto publicado: só apaga cópias, e o vínculo 258 muda de
-- ponta mantendo o texto. As traduções dos vínculos apagados saem junto.
-- ============================================================================

-- 1. Cópias exatas: apaga o vínculo mais novo de cada grupo idêntico em todas
--    as colunas (menos id), mantendo o de menor id.
CREATE TEMP TABLE _dup AS
SELECT b.id AS id
  FROM links a
  JOIN links b
    ON b.id > a.id
   AND b.source = a.source AND b.target = a.target AND b.type = a.type
   AND b.status = a.status AND COALESCE(b.year, -1) = COALESCE(a.year, -1)
   AND b.relation = a.relation AND b.source_url = a.source_url
   AND COALESCE(b.amount, '') = COALESCE(a.amount, '')
   AND COALESCE(b.amount_brl, -1) = COALESCE(a.amount_brl, -1)
   AND COALESCE(b.amount_note, '') = COALESCE(a.amount_note, '');

-- 2. Filiação de Jair Bolsonaro ao PL em 2021, repetida por três dossiês:
--    fica o 602 ("Filiou-se ao Partido Liberal para disputar a reeleição…").
INSERT INTO _dup (id) SELECT id FROM links WHERE id IN (588, 618)
   AND source = 'pol_jair_bolsonaro' AND target = 'par_pl';

DELETE FROM link_translations WHERE link_id IN (SELECT id FROM _dup);
DELETE FROM links WHERE id IN (SELECT id FROM _dup);
DROP TABLE _dup;

-- 3. Vínculo 258: a declaração de Delúbio sobre doações de laboratórios ao PT
--    pertence ao caso da Operação Vampiro, não à filiação partidária (que já
--    está no 242). O texto e a fonte não mudam; muda a ponta de destino.
UPDATE links SET target = 'esquema_vampiro'
 WHERE id = 258 AND source = 'pol_delubio_soares' AND target = 'par_pt';

-- 4. Índice único (falha, sem alterar nada, se ainda houver repetição).
DROP INDEX IF EXISTS idx_links_unique;
CREATE UNIQUE INDEX idx_links_unique
    ON links(source, target, type, status, COALESCE(year, -1));

-- Conferência (devem dar 0 e 1):
-- SELECT COUNT(*) FROM (SELECT 1 FROM links GROUP BY source, target, type, status, COALESCE(year,-1) HAVING COUNT(*) > 1);
-- SELECT COUNT(*) FROM sqlite_master WHERE type = 'index' AND name = 'idx_links_unique';
