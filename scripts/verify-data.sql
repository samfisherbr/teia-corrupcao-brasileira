-- ============================================================================
-- VERIFICAÇÃO DOS DADOS — rodar depois de inserir ou corrigir um dossiê:
-- Precisa das colunas da migração 0002 (migrations/0002_review_dates_and_credits.sql).
--   npm run check:data
-- Cada consulta devolve uma linha com o nome da checagem e quantos problemas
-- achou (uma consulta por checagem: o D1 limita o número de UNION ALL). Tudo deve dar 0 (as linhas "aviso:" podem ser > 0).
-- As checagens de tradução precisam da migração 0003 (migrations/0003_translations.sql).
-- "tradução desatualizada" = o texto em português mudou depois de traduzido;
-- o site mostra o português nesses itens até a tradução ser regravada.
-- ============================================================================
SELECT 'nós sem nenhum vínculo' AS checagem, COUNT(*) AS problemas
  FROM nodes WHERE id NOT IN (SELECT source FROM links UNION SELECT target FROM links);
SELECT 'vínculos apontando para id inexistente' AS checagem, COUNT(*) AS problemas
  FROM links WHERE source NOT IN (SELECT id FROM nodes) OR target NOT IN (SELECT id FROM nodes);
SELECT 'ids fora do padrão a-z 0-9 _' AS checagem, COUNT(*) AS problemas
  FROM nodes WHERE id GLOB '*[^a-z0-9_]*';
SELECT 'vínculos com fonte que não é http(s)' AS checagem, COUNT(*) AS problemas
  FROM links WHERE source_url NOT LIKE 'http://%' AND source_url NOT LIKE 'https://%';
SELECT 'vínculos com texto NULL ou N/A no lugar de vazio' AS checagem, COUNT(*) AS problemas
  FROM links WHERE amount IN ('NULL', 'N/A', '') OR amount_note IN ('NULL', 'N/A', '');
SELECT 'políticos sem vínculo com esquema' AS checagem, COUNT(*) AS problemas
  FROM nodes n WHERE n.type = 'politician' AND NOT EXISTS (
    SELECT 1 FROM links l JOIN nodes s ON s.type = 'scheme' AND s.id IN (l.source, l.target)
     WHERE n.id IN (l.source, l.target));
SELECT 'vínculos repetidos (mesmo source, target, type, status e ano)' AS checagem, COUNT(*) AS problemas
  FROM (SELECT 1 FROM links GROUP BY source, target, type, status, COALESCE(year, -1) HAVING COUNT(*) > 1);
SELECT 'índice único idx_links_unique ausente (rode a migração 0005)' AS checagem, 1 - COUNT(*) AS problemas
  FROM sqlite_master WHERE type = 'index' AND name = 'idx_links_unique';
SELECT 'aviso: mesma pessoa ligada ao mesmo partido em mais de um vínculo (confira se são períodos distintos)' AS checagem, COUNT(*) AS problemas
  FROM (SELECT 1 FROM links l JOIN nodes p ON p.id = l.target AND p.type = 'party'
         JOIN nodes s ON s.id = l.source AND s.type = 'politician'
        GROUP BY l.source, l.target HAVING COUNT(*) > 1);
SELECT 'textos com quebra de linha ou espaço no meio de palavra' AS checagem, COUNT(*) AS problemas
  FROM links WHERE relation LIKE '%' || char(10) || '%' OR amount_note LIKE '%' || char(10) || '%'
                OR relation GLOB '* [çãõáéíóúâêô]*[a-z]*' AND relation GLOB '*[a-z] [çãõ]*';
SELECT 'valores (amount) fora do formato brasileiro' AS checagem, COUNT(*) AS problemas
  FROM links WHERE amount GLOB '*,[0-9][0-9][0-9]*' OR amount GLOB '*$ $*';
SELECT 'aviso: vínculos sem data de conferência (reviewed_at)' AS checagem, COUNT(*) AS problemas
  FROM links WHERE reviewed_at IS NULL;
SELECT 'aviso: fotos sem crédito (image_credit)' AS checagem, COUNT(*) AS problemas
  FROM nodes WHERE image_url IS NOT NULL AND image_url NOT IN ('', 'NULL') AND image_credit IS NULL;
SELECT 'aviso: nós sem tradução para o inglês' AS checagem, COUNT(*) AS problemas
  FROM nodes n WHERE NOT EXISTS (SELECT 1 FROM node_translations t WHERE t.node_id = n.id AND t.lang = 'en');
SELECT 'aviso: nós sem tradução para o espanhol' AS checagem, COUNT(*) AS problemas
  FROM nodes n WHERE NOT EXISTS (SELECT 1 FROM node_translations t WHERE t.node_id = n.id AND t.lang = 'es');
SELECT 'aviso: vínculos sem tradução para o inglês' AS checagem, COUNT(*) AS problemas
  FROM links l WHERE NOT EXISTS (SELECT 1 FROM link_translations t WHERE t.link_id = l.id AND t.lang = 'en');
SELECT 'aviso: vínculos sem tradução para o espanhol' AS checagem, COUNT(*) AS problemas
  FROM links l WHERE NOT EXISTS (SELECT 1 FROM link_translations t WHERE t.link_id = l.id AND t.lang = 'es');
SELECT 'aviso: traduções de nós desatualizadas (português mudou)' AS checagem, COUNT(*) AS problemas
  FROM node_translations t JOIN nodes n ON n.id = t.node_id
 WHERE t.source_text <> n.label || char(10) || COALESCE(n.summary, '');
SELECT 'aviso: traduções de vínculos desatualizadas (português mudou)' AS checagem, COUNT(*) AS problemas
  FROM link_translations t JOIN links l ON l.id = t.link_id
 WHERE t.source_text <> l.relation || char(10) || COALESCE(l.amount, '') || char(10) || COALESCE(l.amount_note, '');
SELECT 'aviso: traduções órfãs (nó ou vínculo não existe mais)' AS checagem, (
    SELECT COUNT(*) FROM node_translations WHERE node_id NOT IN (SELECT id FROM nodes)
  ) + (
    SELECT COUNT(*) FROM link_translations WHERE link_id NOT IN (SELECT id FROM links)
  ) AS problemas;

-- Para LISTAR os itens (em vez de contar), rode à parte, trocando 'en' por 'es' se quiser:
--   SELECT n.id FROM nodes n LEFT JOIN node_translations t ON t.node_id = n.id AND t.lang = 'en'
--    WHERE t.node_id IS NULL OR t.source_text <> n.label || char(10) || COALESCE(n.summary, '');
--   SELECT l.id, l.source, l.target FROM links l LEFT JOIN link_translations t ON t.link_id = l.id AND t.lang = 'en'
--    WHERE t.link_id IS NULL
--       OR t.source_text <> l.relation || char(10) || COALESCE(l.amount, '') || char(10) || COALESCE(l.amount_note, '');
