-- ============================================================================
-- VERIFICAÇÃO DOS DADOS — rodar depois de inserir ou corrigir um dossiê:
-- Precisa das colunas da migração 0002 (migrations/0002_review_dates_and_credits.sql).
--   npm run check:data
-- Cada consulta devolve uma linha com o nome da checagem e quantos problemas
-- achou. Tudo deve dar 0 (as linhas "aviso:" podem ser > 0).
-- As checagens de tradução precisam da migração 0003 (migrations/0003_translations.sql).
-- "tradução desatualizada" = o texto em português mudou depois de traduzido;
-- o site mostra o português nesses itens até a tradução ser regravada.
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
  FROM nodes WHERE image_url IS NOT NULL AND image_url NOT IN ('', 'NULL') AND image_credit IS NULL
UNION ALL
SELECT 'aviso: nós sem tradução para o inglês', COUNT(*)
  FROM nodes n WHERE NOT EXISTS (SELECT 1 FROM node_translations t WHERE t.node_id = n.id AND t.lang = 'en')
UNION ALL
SELECT 'aviso: nós sem tradução para o espanhol', COUNT(*)
  FROM nodes n WHERE NOT EXISTS (SELECT 1 FROM node_translations t WHERE t.node_id = n.id AND t.lang = 'es')
UNION ALL
SELECT 'aviso: vínculos sem tradução para o inglês', COUNT(*)
  FROM links l WHERE NOT EXISTS (SELECT 1 FROM link_translations t WHERE t.link_id = l.id AND t.lang = 'en')
UNION ALL
SELECT 'aviso: vínculos sem tradução para o espanhol', COUNT(*)
  FROM links l WHERE NOT EXISTS (SELECT 1 FROM link_translations t WHERE t.link_id = l.id AND t.lang = 'es')
UNION ALL
SELECT 'aviso: traduções de nós desatualizadas (português mudou)', COUNT(*)
  FROM node_translations t JOIN nodes n ON n.id = t.node_id
 WHERE t.source_text <> n.label || char(10) || COALESCE(n.summary, '')
UNION ALL
SELECT 'aviso: traduções de vínculos desatualizadas (português mudou)', COUNT(*)
  FROM link_translations t JOIN links l ON l.id = t.link_id
 WHERE t.source_text <> l.relation || char(10) || COALESCE(l.amount, '') || char(10) || COALESCE(l.amount_note, '')
UNION ALL
SELECT 'aviso: traduções órfãs (nó ou vínculo não existe mais)', (
    SELECT COUNT(*) FROM node_translations WHERE node_id NOT IN (SELECT id FROM nodes)
  ) + (
    SELECT COUNT(*) FROM link_translations WHERE link_id NOT IN (SELECT id FROM links)
  );

-- Para LISTAR os itens (em vez de contar), rode à parte, trocando 'en' por 'es' se quiser:
--   SELECT n.id FROM nodes n LEFT JOIN node_translations t ON t.node_id = n.id AND t.lang = 'en'
--    WHERE t.node_id IS NULL OR t.source_text <> n.label || char(10) || COALESCE(n.summary, '');
--   SELECT l.id, l.source, l.target FROM links l LEFT JOIN link_translations t ON t.link_id = l.id AND t.lang = 'en'
--    WHERE t.link_id IS NULL
--       OR t.source_text <> l.relation || char(10) || COALESCE(l.amount, '') || char(10) || COALESCE(l.amount_note, '');
