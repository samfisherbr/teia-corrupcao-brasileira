-- ============================================================================
-- MIGRAÇÃO 0007 — natureza do valor (links.amount_kind)
-- ============================================================================
-- O amount_brl mistura cifras de naturezas diferentes (propina, prejuízo
-- estimado, dinheiro lavado, valor de contrato, acordo de leniência…). Somá-las
-- produz totais sem sentido. A coluna amount_kind diz o que cada valor é, para
-- que os infográficos somem só cifras comparáveis.
--
--   bribe         propina ou vantagem indevida (paga, recebida ou pedida)
--   damage        prejuízo ou desvio estimado de dinheiro público
--   illicit_flow  dinheiro movimentado, lavado, remetido ao exterior,
--                 empréstimo simulado, caixa dois
--   contract      valor de contrato, financiamento, verba ou leilão envolvido
--                 (contexto; NÃO é o valor desviado)
--   recovery      acordo de leniência, multa, ressarcimento (fixado ou pedido),
--                 bloqueio ou apreensão
--   other         qualquer outro
--
-- Regra: todo vínculo com amount ou amount_brl deve ter amount_kind, e só eles
-- (checado em scripts/verify-data.sql).
--
-- Rodar UMA vez:
--   npx wrangler d1 execute corruption_graph_db --remote --file=./migrations/0007_amount_kind.sql
-- (rodar de novo dá "duplicate column name" no ALTER. Para reaplicar só as
-- classificações num banco que já tem a coluna, rode os UPDATEs abaixo sem o
-- ALTER: eles gravam valores fixos e podem ser repetidos.)
--
-- Os ids abaixo são os do banco de produção (110 vínculos com valor,
-- classificados em 22/11/2026 pela leitura de amount e amount_note). Três
-- vínculos foram reclassificados depois, em produção: 359 (total movimentado
-- pelo grupo) de damage para illicit_flow, 652 (ativos repassados com fraude)
-- de damage para contract e 290 (R$ 100 mil repassados à campanha de Geraldo
-- Magela, segundo Waldomiro Diniz) de bribe para illicit_flow; este arquivo já
-- reflete isso, para que rodá-lo de novo não desfaça as correções.
-- Não mexe nas traduções: amount_kind não é texto traduzido nem entra no
-- source_text.
-- ============================================================================

ALTER TABLE links ADD COLUMN amount_kind TEXT
    CHECK(amount_kind IS NULL OR amount_kind IN ('bribe','damage','illicit_flow','contract','recovery','other'));

UPDATE links SET amount_kind = 'bribe' WHERE id IN (
    20, 70, 72, 78, 260, 267, 274, 286, 323, 330, 357, 369, 372, 378, 395,
    403, 442, 449, 509, 511, 515, 532, 607, 608, 613, 665, 671, 672, 675, 676, 677);

UPDATE links SET amount_kind = 'damage' WHERE id IN (
    165, 186, 196, 272, 289, 345, 404, 465, 477, 670);

UPDATE links SET amount_kind = 'illicit_flow' WHERE id IN (
    4, 13, 19, 179, 183, 184, 185, 189, 210, 218, 224, 225, 227, 229, 232, 234,
    250, 290, 298, 352, 359, 513, 531, 544, 545, 564, 579);

UPDATE links SET amount_kind = 'contract' WHERE id IN (
    42, 46, 47, 50, 163, 182, 193, 206, 308, 312, 350, 472, 563, 581, 595, 597,
    605, 616, 651, 652);

UPDATE links SET amount_kind = 'recovery' WHERE id IN (
    84, 93, 94, 192, 195, 205, 207, 237, 253, 269, 271, 275, 285, 307, 309, 452,
    466, 501, 572, 653);

-- 156: indenização pedida em ação por danos morais; 631: valor das joias apreendidas.
UPDATE links SET amount_kind = 'other' WHERE id IN (156, 631);
