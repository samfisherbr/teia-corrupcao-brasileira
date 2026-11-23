-- ============================================================================
-- MIGRAÇÃO 0009 — valor do vínculo de Sandra Inês Azevedo na Operação Faroeste
-- (JÁ APLICADA em produção em 23/11/2026)
-- ============================================================================
-- O vínculo dela com o esquema registrava R$ 2.400.000 como propina. Segundo o
-- g1 (04/11/2026), esse é o valor que "o grupo" teria recebido: de cerca de
-- R$ 4 milhões prometidos aos envolvidos, R$ 2,4 milhões teriam sido pagos. Não
-- é um valor dela: somado por amount_kind, entraria como propina de uma só ré e
-- se sobreporia aos valores individuais dos outros vínculos.
-- O total do grupo continua descrito no nível do esquema, no campo `impact` do
-- dossiê (data/schemeDetails*.ts). O vínculo dela passa a registrar só o que a
-- fonte lhe atribui: R$ 250 mil de propina que, segundo o g1, ela teria
-- recebido, valor que o STJ registra ter sido apreendido pela PF na casa dela e
-- do filho. Natureza: bribe.
-- Vínculo identificado pela chave natural, nunca pelo id (migrations/README.md).
-- Pré-requisito: migração 0007. Pode rodar de novo: grava valores fixos; se o
-- status do vínculo mudou, o comando não casa e não altera nada.
--   npx wrangler d1 execute corruption_graph_db --remote --file=./migrations/0009_faroeste_sandra_ines_amount.sql
-- ============================================================================

UPDATE links SET amount = 'R$ 250.000', amount_brl = 250000, amount_kind = 'bribe', amount_note = 'Propina de R$ 250 mil que, segundo o g1, ela teria recebido para dar parecer favorável a uma empresa; o STJ registra que a PF apreendeu R$ 250 mil na casa dela e do filho. Não é o total de R$ 2,4 milhões que, segundo o MPF, teriam sido pagos ao grupo de réus.', reviewed_at = '2026-11-23' WHERE source = 'op_sandra_ines_azevedo' AND target = 'esquema_faroeste' AND type = 'transaction' AND status = 'convicted_appealing' AND COALESCE(year, -1) = 2026;

-- Traduções do amount_note (source_text recalculado pelo próprio comando).
UPDATE link_translations SET amount_note = 'A R$ 250,000 bribe that, according to g1, she allegedly received for giving a favourable opinion to a company; the STJ records that the Federal Police seized R$ 250,000 at her and her son''s home. It is not the R$ 2.4 million that, according to the MPF, was paid to the group of defendants.', source_text = (SELECT l.relation || char(10) || COALESCE(l.amount, '') || char(10) || COALESCE(l.amount_note, '') FROM links l WHERE l.id = link_translations.link_id) WHERE link_id IN (SELECT id FROM links WHERE source = 'op_sandra_ines_azevedo' AND target = 'esquema_faroeste' AND type = 'transaction' AND status = 'convicted_appealing' AND COALESCE(year, -1) = 2026) AND lang = 'en';
UPDATE link_translations SET amount_note = 'Soborno de 250.000 reales que, según g1, habría recibido por emitir un dictamen favorable a una empresa; el STJ registra que la Policía Federal incautó 250.000 reales en la casa de ella y de su hijo. No es el total de 2,4 millones de reales que, según el MPF, se habrían pagado al grupo de acusados.', source_text = (SELECT l.relation || char(10) || COALESCE(l.amount, '') || char(10) || COALESCE(l.amount_note, '') FROM links l WHERE l.id = link_translations.link_id) WHERE link_id IN (SELECT id FROM links WHERE source = 'op_sandra_ines_azevedo' AND target = 'esquema_faroeste' AND type = 'transaction' AND status = 'convicted_appealing' AND COALESCE(year, -1) = 2026) AND lang = 'es';
