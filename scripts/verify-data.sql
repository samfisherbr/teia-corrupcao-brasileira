-- ============================================================================
-- VERIFICAÇÃO DOS DADOS — rodar depois de inserir ou corrigir um dossiê:
-- Precisa das colunas da migração 0002 (migrations/0002_review_dates_and_credits.sql).
--   npm run check:data
-- Cada consulta devolve uma linha com o nome da checagem e quantos problemas
-- achou. Tudo deve dar 0 (as duas últimas são avisos: podem ser > 0).
-- ============================================================================
SELECT 'nós sem nenhum vínculo' AS checagem, COUNT(*) AS problemas
  FROM nodes WHERE id NOT IN (SELECT source FROM links UNION SELECT target FROM links)
UNION ALL
SELECT 'vínculos apontando para id inexistente', COUNT(*)
  FROM links WHERE source NOT IN (SELECT id FROM nodes) OR target NOT IN (SELECT id FROM nodes)
UNION ALL
SELECT 'ids fora do padrão a-z 0-9 _', COUNT(*)
  FROM nodes WHERE id GLOB '*[^a-z0-9_]*'
UNION ALL
SELECT 'vínculos com fonte que não é http(s)', COUNT(*)
  FROM links WHERE source_url NOT LIKE 'http://%' AND source_url NOT LIKE 'https://%'
UNION ALL
SELECT 'vínculos com texto NULL ou N/A no lugar de vazio', COUNT(*)
  FROM links WHERE amount IN ('NULL', 'N/A', '') OR amount_note IN ('NULL', 'N/A', '')
UNION ALL
SELECT 'políticos sem vínculo com esquema', COUNT(*)
  FROM nodes n WHERE n.type = 'politician' AND NOT EXISTS (
    SELECT 1 FROM links l JOIN nodes s ON s.type = 'scheme' AND s.id IN (l.source, l.target)
     WHERE n.id IN (l.source, l.target))
UNION ALL
SELECT 'aviso: vínculos sem data de conferência (reviewed_at)', COUNT(*)
  FROM links WHERE reviewed_at IS NULL
UNION ALL
SELECT 'aviso: fotos sem crédito (image_credit)', COUNT(*)
  FROM nodes WHERE image_url IS NOT NULL AND image_url NOT IN ('', 'NULL') AND image_credit IS NULL;
