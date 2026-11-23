-- ============================================================================
-- MIGRAÇÃO 0008 — correções de 23/11/2026: Waldomiro Diniz, F. H. Cardoso,
-- Delúbio Soares e títulos do Faroeste (JÁ APLICADA em produção em 23/11/2026)
-- ============================================================================
-- Registra no repositório o que foi corrigido direto no D1. Os ids são os do
-- banco de produção, e todos os comandos conferem origem e destino do vínculo
-- além do id: num banco em que o id aponte para outro vínculo, nada é alterado.
-- Pré-requisito: migração 0007 aplicada. Pode rodar de novo sem risco: os
-- UPDATEs gravam valores fixos e os DELETEs miram vínculos fixos.
--   npx wrangler d1 execute corruption_graph_db --remote --file=./migrations/0008_waldomiro_fhc_delubio_cleanup.sql
--
--  1. Vínculo 290 (PT → Caso Waldomiro Diniz): a fonte passa a ser a Folha de
--     13/02/2004 (antes, Tribuna do Paraná) e o texto passa a trazer o
--     depoimento de Waldomiro à CPI dos Bingos (Senado, 11/08/2005), a versão de
--     Cachoeira à CPI (Senado, 14/07/2005) e a de Magela (Folha, 13/04/2004).
--  2. Filiação de F. H. Cardoso ao PSDB: ficam só o vínculo 68, que passa a
--     citar a Presidência, e as informações de contexto já presentes nos
--     vínculos com os esquemas; os vínculos 81 e 136 repetiam a filiação.
--  3. Delúbio Soares → PT: o vínculo 242 é removido (317 fica); a informação de
--     que era tesoureiro do PT passa ao vínculo 243, cuja fonte a sustenta.
--  4. Traduções do nó esquema_faroeste: o rótulo em português passou a ser
--     "Operação Faroeste"; os rótulos em inglês e espanhol acompanham.
-- A natureza do valor do vínculo 290 (illicit_flow) está na migração 0007.
-- ============================================================================

UPDATE links SET source_url = 'https://www1.folha.uol.com.br/folha/brasil/ult96u58129.shtml', relation = 'No vídeo divulgado pela Época, Waldomiro pedia a Cachoeira dinheiro para campanhas de candidatos do PT, além de propina para si; à revista, à Assembleia Legislativa do Rio e à CPI dos Bingos, ele afirmou ter repassado R$ 100 mil à campanha de Geraldo Magela, candidato do PT ao governo do DF, valor que, segundo ele, foi doação de Cachoeira, e disse nunca ter sido filiado ao PT. Cachoeira disse à CPI que nada destinou à campanha de Magela, e Magela negou ter recebido recursos e anunciou ação por danos morais contra Waldomiro. O partido não consta como investigado ou réu nas fontes consultadas.', reviewed_at = '2026-11-23' WHERE id = 290 AND source = 'par_pt' AND target = 'esquema_waldomiro_diniz';
UPDATE links SET relation = 'Um dos fundadores da legenda em 1988; eleito presidente da República em 1994, tomou posse em 1995 e foi reeleito em 1998.', reviewed_at = '2026-11-23' WHERE id = 68 AND source = 'pol_fhc' AND target = 'par_psdb';
UPDATE links SET relation = 'Ex-tesoureiro do PT, foi condenado por lavagem de dinheiro por ter, segundo a denúncia, orientado a dissimulação do empréstimo cujo destinatário final seria o empresário de Santo André; a condenação foi anulada pelo STJ em 2023 por incompetência da Justiça Federal e o caso remetido à Justiça Eleitoral.', reviewed_at = '2026-11-23' WHERE id = 243 AND source = 'pol_delubio_soares' AND target = 'esquema_santo_andre';

-- Traduções dos vínculos 290, 68 e 243 (source_text recalculado pelo próprio comando).
UPDATE link_translations SET relation = 'In the video released by Época, Waldomiro asked Cachoeira for money for PT candidates'' campaigns, as well as a bribe for himself; to the magazine, to the Rio de Janeiro Legislative Assembly and to the Bingos CPI, he said he passed R$ 100,000 to the campaign of Geraldo Magela, the PT candidate for governor of the Federal District, an amount that, according to him, was a donation from Cachoeira, and said he had never been a member of the PT. Cachoeira told the CPI that he allocated nothing to Magela''s campaign, and Magela denied having received any funds and announced a lawsuit for moral damages against Waldomiro. The party is not named as a subject of investigation or a defendant in the sources consulted.', source_text = (SELECT l.relation || char(10) || COALESCE(l.amount, '') || char(10) || COALESCE(l.amount_note, '') FROM links l WHERE l.id = link_translations.link_id) WHERE link_id = 290 AND lang = 'en';
UPDATE link_translations SET relation = 'En el vídeo divulgado por Época, Waldomiro pedía a Cachoeira dinero para campañas de candidatos del PT, además de un soborno para sí; a la revista, a la Asamblea Legislativa de Río de Janeiro y a la CPI de los Bingos afirmó haber transferido 100.000 reales a la campaña de Geraldo Magela, candidato del PT al Gobierno del Distrito Federal, importe que, según él, fue una donación de Cachoeira, y dijo no haber estado nunca afiliado al PT. Cachoeira dijo a la CPI que no destinó nada a la campaña de Magela, y Magela negó haber recibido fondos y anunció una demanda por daños morales contra Waldomiro. El partido no figura como investigado ni como acusado en las fuentes consultadas.', source_text = (SELECT l.relation || char(10) || COALESCE(l.amount, '') || char(10) || COALESCE(l.amount_note, '') FROM links l WHERE l.id = link_translations.link_id) WHERE link_id = 290 AND lang = 'es';
UPDATE link_translations SET relation = 'One of the founders of the party in 1988; elected President of the Republic in 1994, took office in 1995 and was re-elected in 1998.', source_text = (SELECT l.relation || char(10) || COALESCE(l.amount, '') || char(10) || COALESCE(l.amount_note, '') FROM links l WHERE l.id = link_translations.link_id) WHERE link_id = 68 AND lang = 'en';
UPDATE link_translations SET relation = 'Uno de los fundadores del partido en 1988; elegido presidente de la República en 1994, tomó posesión en 1995 y fue reelegido en 1998.', source_text = (SELECT l.relation || char(10) || COALESCE(l.amount, '') || char(10) || COALESCE(l.amount_note, '') FROM links l WHERE l.id = link_translations.link_id) WHERE link_id = 68 AND lang = 'es';
UPDATE link_translations SET relation = 'Former treasurer of the PT, he was convicted of money laundering for allegedly directing the disguising of the loan whose final recipient was said to be the Santo André businessman; the conviction was annulled by the STJ in 2023 because the federal courts lacked jurisdiction and the case was sent to the electoral courts.', source_text = (SELECT l.relation || char(10) || COALESCE(l.amount, '') || char(10) || COALESCE(l.amount_note, '') FROM links l WHERE l.id = link_translations.link_id) WHERE link_id = 243 AND lang = 'en';
UPDATE link_translations SET relation = 'Extesorero del PT, fue condenado por blanqueo de capitales por haber, según la acusación, orientado el encubrimiento del préstamo cuyo destinatario final sería el empresario de Santo André; la condena fue anulada por el STJ en 2023 por incompetencia de la justicia federal y el caso se remitió a la justicia electoral.', source_text = (SELECT l.relation || char(10) || COALESCE(l.amount, '') || char(10) || COALESCE(l.amount_note, '') FROM links l WHERE l.id = link_translations.link_id) WHERE link_id = 243 AND lang = 'es';

-- Remoção dos vínculos repetidos e das traduções deles.
DELETE FROM link_translations WHERE link_id IN (SELECT id FROM links WHERE (id IN (81, 136) AND source = 'pol_fhc' AND target = 'par_psdb') OR (id = 242 AND source = 'pol_delubio_soares' AND target = 'par_pt'));
DELETE FROM links WHERE id IN (81, 136) AND source = 'pol_fhc' AND target = 'par_psdb';
DELETE FROM links WHERE id = 242 AND source = 'pol_delubio_soares' AND target = 'par_pt';

-- Rótulos traduzidos do esquema Faroeste.
UPDATE node_translations SET label = 'Operation Faroeste', source_text = (SELECT n.label || char(10) || COALESCE(n.summary, '') FROM nodes n WHERE n.id = node_translations.node_id) WHERE node_id = 'esquema_faroeste' AND lang = 'en';
UPDATE node_translations SET label = 'Operación Faroeste', source_text = (SELECT n.label || char(10) || COALESCE(n.summary, '') FROM nodes n WHERE n.id = node_translations.node_id) WHERE node_id = 'esquema_faroeste' AND lang = 'es';
