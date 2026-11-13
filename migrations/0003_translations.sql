-- ============================================================================
-- MIGRAÇÃO 0003 — traduções (inglês e espanhol) dos textos do banco
-- ============================================================================
-- Rodar UMA vez em bancos criados antes de 13/11/2026:
--   npx wrangler d1 execute corruption_graph_db --remote --file=./migrations/0003_translations.sql
-- (pode rodar de novo sem risco: tudo usa IF NOT EXISTS.)
--
-- O português continua nas tabelas `nodes` e `links`, que seguem sendo a fonte
-- da verdade. Estas duas tabelas guardam SÓ os textos traduzidos; ids, status,
-- anos, valores numéricos e fontes não se repetem (mudou o status de um
-- vínculo? muda num lugar só e vale para os três idiomas).
--
--  - lang: 'en' (inglês, Reino Unido) ou 'es' (espanhol, Espanha).
--  - Coluna de texto NULL = "igual ao português" (ex.: nome de pessoa).
--  - Sem chave estrangeira de propósito: apagar/recriar um nó ou vínculo não
--    falha nem apaga traduções em cascata; a tradução órfã só é ignorada.
--  - source_text: cópia do texto em português no momento da tradução. Se o
--    português mudar depois, a cópia deixa de bater e o site volta a mostrar o
--    português naquele item, até a tradução ser refeita. Assim uma tradução
--    desatualizada nunca fica no ar afirmando algo que o original já corrigiu.
--
-- Como gravar uma tradução (o SELECT copia o português atual para source_text):
--   INSERT INTO node_translations (node_id, lang, label, summary, source_text)
--   SELECT id, 'en', NULL, 'Former senator…', label || char(10) || COALESCE(summary, '')
--     FROM nodes WHERE id = 'pol_fulano'
--   ON CONFLICT(node_id, lang) DO UPDATE SET
--     label = excluded.label, summary = excluded.summary, source_text = excluded.source_text;
--
--   INSERT INTO link_translations (link_id, lang, relation, amount, amount_note, source_text)
--   SELECT id, 'en', 'Elected president…', NULL, NULL,
--          relation || char(10) || COALESCE(amount, '') || char(10) || COALESCE(amount_note, '')
--     FROM links WHERE source = 'pol_fulano' AND target = 'esquema_x' AND type = 'process' AND year = 1992
--   ON CONFLICT(link_id, lang) DO UPDATE SET
--     relation = excluded.relation, amount = excluded.amount,
--     amount_note = excluded.amount_note, source_text = excluded.source_text;
--
-- Traduções faltando ou desatualizadas: consultas no fim de scripts/verify-data.sql.
-- ============================================================================

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
