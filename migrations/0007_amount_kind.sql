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
-- IDENTIFICAÇÃO DOS VÍNCULOS: cada UPDATE abaixo casa o vínculo pela chave
-- natural (source, target, type, status, COALESCE(year, -1)), a mesma do índice
-- único idx_links_unique, e nunca pelo id, que muda de banco para banco (ver
-- migrations/README.md). Se nenhum vínculo casar, o UPDATE não altera nada.
-- O status faz parte da chave: se o status de um vínculo mudar em produção, a
-- linha dele aqui deixa de casar e o vínculo fica sem amount_kind; o
-- npm run check:data aponta esse caso ("vínculo com valor sem amount_kind").
-- Cada UPDATE só grava em vínculo que tenha valor.
--
-- Os 110 vínculos com valor foram classificados em 22/11/2026 pela leitura de
-- amount e amount_note. Três foram reclassificados depois, em produção, e este
-- arquivo já reflete isso: o total movimentado pelo grupo Planam, nas
-- Sanguessugas (de damage para illicit_flow), os ativos repassados com fraude no
-- caso Banco Master / BRB (de damage para contract) e os R$ 100 mil que
-- Waldomiro Diniz disse ter repassado à campanha de Geraldo Magela (de bribe
-- para illicit_flow).
--
-- Banco criado com o schema.sql atual já tem a coluna: não rode esta migração;
-- use os INSERTs dos dossiês com amount_kind (Master Prompt v7).
-- Não mexe nas traduções: amount_kind não é texto traduzido nem entra no
-- source_text.
-- ============================================================================

ALTER TABLE links ADD COLUMN amount_kind TEXT
    CHECK(amount_kind IS NULL OR amount_kind IN ('bribe','damage','illicit_flow','contract','recovery','other'));

-- bribe (31 vínculos)
UPDATE links SET amount_kind = 'bribe' WHERE source = 'emp_odebrecht' AND target = 'esquema_operacao_cadeia_velha' AND type = 'contract' AND status = 'confirmed' AND COALESCE(year, -1) = 2017 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'bribe' WHERE source = 'op_alessandro_stefanutto' AND target = 'esquema_inss_sem_desconto' AND type = 'transaction' AND status = 'under_investigation' AND COALESCE(year, -1) = 2026 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'bribe' WHERE source = 'op_arilton_moura' AND target = 'pol_gilberto_braga' AND type = 'transaction' AND status = 'under_investigation' AND COALESCE(year, -1) = 2022 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'bribe' WHERE source = 'op_arthur_teixeira' AND target = 'op_joao_zaniboni' AND type = 'transaction' AND status = 'under_investigation' AND COALESCE(year, -1) = 2014 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'bribe' WHERE source = 'op_ivo_costa' AND target = 'esquema_operacao_navalha' AND type = 'transaction' AND status = 'under_investigation' AND COALESCE(year, -1) = 2007 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'bribe' WHERE source = 'op_joao_zaniboni' AND target = 'esquema_trensalao' AND type = 'transaction' AND status = 'under_investigation' AND COALESCE(year, -1) = 2014 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'bribe' WHERE source = 'op_jose_carlos_oliveira' AND target = 'esquema_inss_sem_desconto' AND type = 'transaction' AND status = 'under_investigation' AND COALESCE(year, -1) = 2026 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'bribe' WHERE source = 'op_laerte_correa' AND target = 'esquema_vampiro' AND type = 'transaction' AND status = 'under_investigation' AND COALESCE(year, -1) = 2006 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'bribe' WHERE source = 'op_luciano_musse' AND target = 'esquema_bolsolao_do_mec' AND type = 'transaction' AND status = 'under_investigation' AND COALESCE(year, -1) = 2022 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'bribe' WHERE source = 'op_maria_do_socorro_santiago' AND target = 'esquema_faroeste' AND type = 'transaction' AND status = 'convicted_appealing' AND COALESCE(year, -1) = 2026 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'bribe' WHERE source = 'op_ricardo_saud' AND target = 'pol_rodrigo_rocha_loures' AND type = 'transaction' AND status = 'confirmed' AND COALESCE(year, -1) = 2017 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'bribe' WHERE source = 'op_rogerio_buratti' AND target = 'emp_gtech' AND type = 'transaction' AND status = 'under_investigation' AND COALESCE(year, -1) = 2003 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'bribe' WHERE source = 'op_sandra_ines_azevedo' AND target = 'esquema_faroeste' AND type = 'transaction' AND status = 'convicted_appealing' AND COALESCE(year, -1) = 2026 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'bribe' WHERE source = 'op_sergio_sampaio' AND target = 'esquema_faroeste' AND type = 'transaction' AND status = 'convicted_appealing' AND COALESCE(year, -1) = 2026 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'bribe' WHERE source = 'op_waldomiro_diniz' AND target = 'esquema_waldomiro_diniz' AND type = 'transaction' AND status = 'convicted_appealing' AND COALESCE(year, -1) = 2002 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'bribe' WHERE source = 'par_pp' AND target = 'esquema_mensalao' AND type = 'transaction' AND status = 'confirmed' AND COALESCE(year, -1) = 2005 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'bribe' WHERE source = 'pol_aecio_neves' AND target = 'esquema_jbs_mala_rocha_loures' AND type = 'transaction' AND status = 'acquitted' AND COALESCE(year, -1) = 2022 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'bribe' WHERE source = 'pol_chicao_brigido' AND target = 'esquema_compra_reeleicao' AND type = 'process' AND status = 'acquitted' AND COALESCE(year, -1) = 1998 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'bribe' WHERE source = 'pol_delubio_soares' AND target = 'esquema_vampiro' AND type = 'transaction' AND status = 'under_investigation' AND COALESCE(year, -1) = 2006 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'bribe' WHERE source = 'pol_dirceu' AND target = 'esquema_lava_jato' AND type = 'transaction' AND status = 'annulled' AND COALESCE(year, -1) = 2024 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'bribe' WHERE source = 'pol_genebaldo_correia' AND target = 'pol_ibsen_pinheiro' AND type = 'transaction' AND status = 'under_investigation' AND COALESCE(year, -1) = 1993 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'bribe' WHERE source = 'pol_gilberto_braga' AND target = 'esquema_bolsolao_do_mec' AND type = 'transaction' AND status = 'confirmed' AND COALESCE(year, -1) = 2022 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'bribe' WHERE source = 'pol_joao_maia' AND target = 'esquema_compra_reeleicao' AND type = 'transaction' AND status = 'under_investigation' AND COALESCE(year, -1) = 1997 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'bribe' WHERE source = 'pol_joao_paulo_cunha' AND target = 'esquema_mensalao' AND type = 'transaction' AND status = 'convicted_final' AND COALESCE(year, -1) = 2003 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'bribe' WHERE source = 'pol_lino_rossi' AND target = 'esquema_sanguessugas' AND type = 'transaction' AND status = 'under_investigation' AND COALESCE(year, -1) = 2006 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'bribe' WHERE source = 'pol_ney_suassuna' AND target = 'esquema_sanguessugas' AND type = 'transaction' AND status = 'under_investigation' AND COALESCE(year, -1) = 2008 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'bribe' WHERE source = 'pol_nilton_capixaba' AND target = 'esquema_sanguessugas' AND type = 'transaction' AND status = 'under_investigation' AND COALESCE(year, -1) = 2006 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'bribe' WHERE source = 'pol_rodrigo_rocha_loures' AND target = 'esquema_jbs_mala_rocha_loures' AND type = 'transaction' AND status = 'under_investigation' AND COALESCE(year, -1) = 2017 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'bribe' WHERE source = 'pol_ronivon_santiago' AND target = 'esquema_compra_reeleicao' AND type = 'transaction' AND status = 'under_investigation' AND COALESCE(year, -1) = 1997 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'bribe' WHERE source = 'pol_silas_rondeau' AND target = 'esquema_operacao_navalha' AND type = 'transaction' AND status = 'under_investigation' AND COALESCE(year, -1) = 2007 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'bribe' WHERE source = 'pol_valdemar_costa_neto' AND target = 'esquema_mensalao' AND type = 'transaction' AND status = 'convicted_final' AND COALESCE(year, -1) = 2003 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);

-- damage (10 vínculos)
UPDATE links SET amount_kind = 'damage' WHERE source = 'emp_caixa' AND target = 'esquema_waldomiro_diniz' AND type = 'contract' AND status = 'confirmed' AND COALESCE(year, -1) = 2003 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'damage' WHERE source = 'emp_carf' AND target = 'esquema_operacao_zelotes' AND type = 'contract' AND status = 'confirmed' AND COALESCE(year, -1) = 2015 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'damage' WHERE source = 'emp_copasa' AND target = 'esquema_mensalao_mineiro' AND type = 'transaction' AND status = 'under_investigation' AND COALESCE(year, -1) = 1998 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'damage' WHERE source = 'emp_gautama' AND target = 'esquema_operacao_navalha' AND type = 'contract' AND status = 'confirmed' AND COALESCE(year, -1) = 2007 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'damage' WHERE source = 'emp_inss' AND target = 'esquema_inss_sem_desconto' AND type = 'contract' AND status = 'confirmed' AND COALESCE(year, -1) = 2025 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'damage' WHERE source = 'emp_ministerio_saude' AND target = 'esquema_vampiro' AND type = 'transaction' AND status = 'under_investigation' AND COALESCE(year, -1) = 2004 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'damage' WHERE source = 'emp_petrobras' AND target = 'esquema_lava_jato' AND type = 'contract' AND status = 'confirmed' AND COALESCE(year, -1) = 2014 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'damage' WHERE source = 'emp_sudam' AND target = 'esquema_sudam_sudene' AND type = 'process' AND status = 'confirmed' AND COALESCE(year, -1) = 2001 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'damage' WHERE source = 'op_henrique_pizzolato' AND target = 'emp_dna_propaganda' AND type = 'transaction' AND status = 'convicted_final' AND COALESCE(year, -1) = 2005 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'damage' WHERE source = 'pol_eduardo_azeredo' AND target = 'esquema_mensalao_mineiro' AND type = 'transaction' AND status = 'annulled' AND COALESCE(year, -1) = 1998 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);

-- illicit_flow (27 vínculos)
UPDATE links SET amount_kind = 'illicit_flow' WHERE source = 'emp_alerj' AND target = 'esquema_caso_queiroz_rachadinhas' AND type = 'contract' AND status = 'confirmed' AND COALESCE(year, -1) = 2018 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'illicit_flow' WHERE source = 'emp_banco_del_parana' AND target = 'esquema_banestado' AND type = 'transaction' AND status = 'under_investigation' AND COALESCE(year, -1) = 1996 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'illicit_flow' WHERE source = 'emp_banco_rural' AND target = 'emp_dna_propaganda' AND type = 'transaction' AND status = 'under_investigation' AND COALESCE(year, -1) = 1998 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'illicit_flow' WHERE source = 'emp_banco_rural' AND target = 'emp_smpb' AND type = 'transaction' AND status = 'under_investigation' AND COALESCE(year, -1) = 1998 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'illicit_flow' WHERE source = 'emp_banco_rural' AND target = 'esquema_mensalao' AND type = 'transaction' AND status = 'confirmed' AND COALESCE(year, -1) = 2005 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'illicit_flow' WHERE source = 'emp_banco_rural' AND target = 'esquema_mensalao_mineiro' AND type = 'transaction' AND status = 'under_investigation' AND COALESCE(year, -1) = 1998 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'illicit_flow' WHERE source = 'emp_banco_schahin' AND target = 'esquema_santo_andre' AND type = 'transaction' AND status = 'under_investigation' AND COALESCE(year, -1) = 2004 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'illicit_flow' WHERE source = 'emp_banestado' AND target = 'esquema_banestado' AND type = 'contract' AND status = 'confirmed' AND COALESCE(year, -1) = 1996 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'illicit_flow' WHERE source = 'emp_carbo' AND target = 'esquema_mensalao_mineiro' AND type = 'transaction' AND status = 'under_investigation' AND COALESCE(year, -1) = 1998 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'illicit_flow' WHERE source = 'emp_fetranspor' AND target = 'esquema_operacao_cadeia_velha' AND type = 'contract' AND status = 'confirmed' AND COALESCE(year, -1) = 2017 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'illicit_flow' WHERE source = 'emp_i9_minas' AND target = 'esquema_laranjas_do_psl' AND type = 'contract' AND status = 'under_investigation' AND COALESCE(year, -1) = 2019 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'illicit_flow' WHERE source = 'emp_planam' AND target = 'esquema_sanguessugas' AND type = 'transaction' AND status = 'under_investigation' AND COALESCE(year, -1) = 2006 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'illicit_flow' WHERE source = 'op_adriano_nobrega' AND target = 'esquema_caso_queiroz_rachadinhas' AND type = 'transaction' AND status = 'under_investigation' AND COALESCE(year, -1) = 2020 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'illicit_flow' WHERE source = 'op_alberto_youssef' AND target = 'emp_banestado' AND type = 'transaction' AND status = 'convicted_appealing' AND COALESCE(year, -1) = 1998 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'illicit_flow' WHERE source = 'op_claudio_mourao' AND target = 'esquema_mensalao_mineiro' AND type = 'transaction' AND status = 'under_investigation' AND COALESCE(year, -1) = 1998 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'illicit_flow' WHERE source = 'op_claudio_vieira' AND target = 'esquema_pc_farias' AND type = 'process' AND status = 'under_investigation' AND COALESCE(year, -1) = 1992 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'illicit_flow' WHERE source = 'op_dario_messer' AND target = 'esquema_banestado' AND type = 'transaction' AND status = 'under_investigation' AND COALESCE(year, -1) = 2004 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'illicit_flow' WHERE source = 'op_joesley_batista' AND target = 'esquema_jbs_mala_rocha_loures' AND type = 'transaction' AND status = 'confirmed' AND COALESCE(year, -1) = 2017 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'illicit_flow' WHERE source = 'op_jose_adalberto_vieira' AND target = 'esquema_dolares_na_cueca' AND type = 'transaction' AND status = 'under_investigation' AND COALESCE(year, -1) = 2005 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'illicit_flow' WHERE source = 'op_lucas_tristao' AND target = 'op_mario_peixoto' AND type = 'transaction' AND status = 'under_investigation' AND COALESCE(year, -1) = 2020 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'illicit_flow' WHERE source = 'op_olga_youssef' AND target = 'emp_banestado' AND type = 'transaction' AND status = 'convicted_appealing' AND COALESCE(year, -1) = 2008 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'illicit_flow' WHERE source = 'op_rubens_catenacci' AND target = 'esquema_banestado' AND type = 'transaction' AND status = 'convicted_appealing' AND COALESCE(year, -1) = 2008 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'illicit_flow' WHERE source = 'par_pt' AND target = 'esquema_waldomiro_diniz' AND type = 'transaction' AND status = 'confirmed' AND COALESCE(year, -1) = 2002 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'illicit_flow' WHERE source = 'pol_celso_pitta' AND target = 'esquema_banestado' AND type = 'transaction' AND status = 'under_investigation' AND COALESCE(year, -1) = 1994 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'illicit_flow' WHERE source = 'pol_collor' AND target = 'esquema_pc_farias' AND type = 'transaction' AND status = 'acquitted' AND COALESCE(year, -1) = 1992 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'illicit_flow' WHERE source = 'pol_genebaldo_correia' AND target = 'esquema_anoes_orcamento' AND type = 'transaction' AND status = 'under_investigation' AND COALESCE(year, -1) = 1993 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'illicit_flow' WHERE source = 'pol_vittorio_medioli' AND target = 'esquema_banestado' AND type = 'transaction' AND status = 'convicted_appealing' AND COALESCE(year, -1) = 2002 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);

-- contract (20 vínculos)
UPDATE links SET amount_kind = 'contract' WHERE source = 'emp_banco_master' AND target = 'esquema_banco_master_inss' AND type = 'transaction' AND status = 'under_investigation' AND COALESCE(year, -1) = 2025 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'contract' WHERE source = 'emp_bnb' AND target = 'esquema_dolares_na_cueca' AND type = 'contract' AND status = 'confirmed' AND COALESCE(year, -1) = 2004 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'contract' WHERE source = 'emp_brb' AND target = 'esquema_banco_master_inss' AND type = 'transaction' AND status = 'confirmed' AND COALESCE(year, -1) = 2025 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'contract' WHERE source = 'emp_dna_propaganda' AND target = 'esquema_mensalao_mineiro' AND type = 'contract' AND status = 'under_investigation' AND COALESCE(year, -1) = 1998 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'contract' WHERE source = 'emp_enphase' AND target = 'esquema_dolares_na_cueca' AND type = 'transaction' AND status = 'acquitted' AND COALESCE(year, -1) = 2012 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'contract' WHERE source = 'emp_esca' AND target = 'esquema_sivam' AND type = 'contract' AND status = 'confirmed' AND COALESCE(year, -1) = 1994 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'contract' WHERE source = 'emp_fnde' AND target = 'esquema_bolsolao_do_mec' AND type = 'contract' AND status = 'confirmed' AND COALESCE(year, -1) = 2022 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'contract' WHERE source = 'emp_iabas' AND target = 'emp_secretaria_saude_rj' AND type = 'contract' AND status = 'confirmed' AND COALESCE(year, -1) = 2020 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'contract' WHERE source = 'emp_imperador_agroindustrial' AND target = 'esquema_sudam_sudene' AND type = 'contract' AND status = 'under_investigation' AND COALESCE(year, -1) = 1998 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'contract' WHERE source = 'emp_odebrecht' AND target = 'esquema_anoes_orcamento' AND type = 'process' AND status = 'under_investigation' AND COALESCE(year, -1) = 1993 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'contract' WHERE source = 'emp_raytheon' AND target = 'esquema_sivam' AND type = 'contract' AND status = 'confirmed' AND COALESCE(year, -1) = 1994 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'contract' WHERE source = 'emp_raytheon' AND target = 'esquema_sivam' AND type = 'transaction' AND status = 'confirmed' AND COALESCE(year, -1) = 1994 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'contract' WHERE source = 'emp_smpb' AND target = 'esquema_mensalao' AND type = 'contract' AND status = 'confirmed' AND COALESCE(year, -1) = 2003 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'contract' WHERE source = 'emp_sus' AND target = 'esquema_orcamento_secreto_rp9' AND type = 'contract' AND status = 'under_investigation' AND COALESCE(year, -1) = 2022 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'contract' WHERE source = 'emp_telebras' AND target = 'esquema_grampos_bndes' AND type = 'process' AND status = 'confirmed' AND COALESCE(year, -1) = 1998 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'contract' WHERE source = 'emp_usimar' AND target = 'esquema_sudam_sudene' AND type = 'contract' AND status = 'under_investigation' AND COALESCE(year, -1) = 1999 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'contract' WHERE source = 'op_maria_de_lourdes_paixao' AND target = 'esquema_laranjas_do_psl' AND type = 'transaction' AND status = 'acquitted' AND COALESCE(year, -1) = 2022 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'contract' WHERE source = 'op_mauro_marcondes' AND target = 'emp_mmc_mitsubishi' AND type = 'contract' AND status = 'confirmed' AND COALESCE(year, -1) = 2015 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'contract' WHERE source = 'op_roberto_rodrigues' AND target = 'esquema_orcamento_secreto_rp9' AND type = 'transaction' AND status = 'under_investigation' AND COALESCE(year, -1) = 2022 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'contract' WHERE source = 'pol_milton_ribeiro' AND target = 'esquema_bolsolao_do_mec' AND type = 'transaction' AND status = 'under_investigation' AND COALESCE(year, -1) = 2022 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);

-- recovery (20 vínculos)
UPDATE links SET amount_kind = 'recovery' WHERE source = 'emp_grupo_ok' AND target = 'esquema_trt_sp' AND type = 'process' AND status = 'confirmed' AND COALESCE(year, -1) = 2023 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'recovery' WHERE source = 'emp_grupo_ok' AND target = 'esquema_trt_sp' AND type = 'transaction' AND status = 'confirmed' AND COALESCE(year, -1) = 2012 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'recovery' WHERE source = 'emp_inss' AND target = 'esquema_banco_master_inss' AND type = 'contract' AND status = 'confirmed' AND COALESCE(year, -1) = 2026 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'recovery' WHERE source = 'emp_jandf' AND target = 'esquema_operacao_greenfield' AND type = 'transaction' AND status = 'confirmed' AND COALESCE(year, -1) = 2017 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'recovery' WHERE source = 'emp_lunus' AND target = 'esquema_sudam_sudene' AND type = 'process' AND status = 'under_investigation' AND COALESCE(year, -1) = 2002 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'recovery' WHERE source = 'emp_odebrecht' AND target = 'esquema_lava_jato' AND type = 'contract' AND status = 'confirmed' AND COALESCE(year, -1) = 2016 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'recovery' WHERE source = 'emp_rafia_maranhao' AND target = 'esquema_sudam_sudene' AND type = 'transaction' AND status = 'convicted_appealing' AND COALESCE(year, -1) = 2026 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'recovery' WHERE source = 'emp_stn' AND target = 'esquema_dolares_na_cueca' AND type = 'contract' AND status = 'convicted_appealing' AND COALESCE(year, -1) = 2012 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'recovery' WHERE source = 'op_edmar_santos' AND target = 'esquema_operacao_placebo' AND type = 'transaction' AND status = 'confirmed' AND COALESCE(year, -1) = 2020 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'recovery' WHERE source = 'op_itelvino_pisoni' AND target = 'esquema_sudam_sudene' AND type = 'transaction' AND status = 'convicted_appealing' AND COALESCE(year, -1) = 2013 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'recovery' WHERE source = 'op_luiz_marcondes_de_freitas_junior' AND target = 'esquema_santo_andre' AND type = 'transaction' AND status = 'convicted_appealing' AND COALESCE(year, -1) = 2001 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'recovery' WHERE source = 'op_marcelo_pitta' AND target = 'esquema_vampiro' AND type = 'process' AND status = 'under_investigation' AND COALESCE(year, -1) = 2004 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'recovery' WHERE source = 'op_marcelo_pitta' AND target = 'esquema_vampiro' AND type = 'transaction' AND status = 'under_investigation' AND COALESCE(year, -1) = 2007 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'recovery' WHERE source = 'op_nicolau_dos_santos_neto' AND target = 'esquema_trt_sp' AND type = 'transaction' AND status = 'convicted_final' AND COALESCE(year, -1) = 1992 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'recovery' WHERE source = 'op_roberto_smith' AND target = 'esquema_dolares_na_cueca' AND type = 'process' AND status = 'convicted_appealing' AND COALESCE(year, -1) = 2012 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'recovery' WHERE source = 'op_rogerio_buratti' AND target = 'esquema_waldomiro_diniz' AND type = 'process' AND status = 'convicted_appealing' AND COALESCE(year, -1) = 2003 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'recovery' WHERE source = 'op_waldomiro_diniz' AND target = 'esquema_waldomiro_diniz' AND type = 'process' AND status = 'convicted_appealing' AND COALESCE(year, -1) = 2003 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'recovery' WHERE source = 'par_pp' AND target = 'esquema_lava_jato' AND type = 'process' AND status = 'under_investigation' AND COALESCE(year, -1) = 2017 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'recovery' WHERE source = 'par_pt' AND target = 'esquema_santo_andre' AND type = 'process' AND status = 'convicted_appealing' AND COALESCE(year, -1) = 2001 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'recovery' WHERE source = 'pol_jader_barbalho' AND target = 'emp_imperador_agroindustrial' AND type = 'transaction' AND status = 'annulled' AND COALESCE(year, -1) = 2013 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);

-- other (2 vínculos)
UPDATE links SET amount_kind = 'other' WHERE source = 'emp_receita_federal' AND target = 'esquema_operacao_venire_joias_presidencia' AND type = 'process' AND status = 'confirmed' AND COALESCE(year, -1) = 2021 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
UPDATE links SET amount_kind = 'other' WHERE source = 'op_carlos_jereissati' AND target = 'esquema_grampos_bndes' AND type = 'process' AND status = 'confirmed' AND COALESCE(year, -1) = 1999 AND (amount IS NOT NULL OR amount_brl IS NOT NULL);
