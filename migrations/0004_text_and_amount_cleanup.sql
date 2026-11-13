-- ============================================================================
-- MIGRAÇÃO 0004 — limpeza de texto e de valores (aplicada em 13/11/2026)
-- ============================================================================
-- Só corrige forma, não conteúdo:
--  1. Espaçamento quebrado em 4 nós e 8 vínculos (quebras de linha e espaços
--     no meio das palavras, ex.: "Investiga çã o" → "Investigação").
--  2. Valores em formato inglês no campo amount (US$ 4,000,000.00 →
--     US$ 4.000.000) — o padrão do banco é o brasileiro.
--  3. amount_brl 100 vezes maior nos vínculos 20 e 84: os centavos ",00" do
--     formato inglês foram lidos como dígitos na conversão. O vínculo 94 trazia
--     no amount um valor em dólares sem relação com a cifra da nota (R$ 800
--     milhões da AGU); fica igual ao vínculo gêmeo 127.
-- No fim, as traduções desses itens recebem o novo texto em português como
-- source_text (a tradução já tinha sido feita a partir do texto limpo), para
-- não serem tratadas como desatualizadas.
-- Pode rodar de novo sem risco: os UPDATEs gravam valores fixos.
-- ============================================================================

UPDATE nodes SET summary = 'Ex-governador do Distrito Federal (2007–2010).' WHERE id = 'pol_jose_roberto_arruda';
UPDATE nodes SET summary = 'Auditor do Tribunal de Contas da União (TCU).' WHERE id = 'op_cyonil_borges';
UPDATE nodes SET summary = 'Ex-deputado estadual pelo PMDB e ex-presidente da Assembleia Legislativa do Rio de Janeiro (Alerj).' WHERE id = 'pol_jorge_picciani';
UPDATE nodes SET summary = 'Investigação da PF sobre a cessão ao BRB de carteiras de crédito do Banco Master sem comprovação de lastro e sobre consignados do Master a beneficiários do INSS (2025–2026).' WHERE id = 'esquema_banco_master_inss';
UPDATE links SET relation = 'Em setembro de 2026 o TSE manteve, por 5 votos a 2, o indeferimento de sua candidatura ao governo do DF por acumular sete condenações colegiadas por improbidade administrativa dolosa em processos da Operação Caixa de Pandora (esfera cível). A defesa alegou que ele estaria elegível após a mudança na Lei da Ficha Limpa aprovada em 2025, por se tratar de processos conexos.' WHERE id = 409;
UPDATE links SET relation = 'Ex-deputado distrital, apontado pelo MPDFT entre os deputados distritais que receberam vantagem indevida no esquema, conforme descrito em sentença de improbidade do TJDFT de 2023 (da qual não é réu). O desfecho dos processos contra ele não foi verificado nesta revisão, e a posição da defesa não foi localizada.' WHERE id = 413;
UPDATE links SET relation = 'Ex-deputada distrital apontada pelo MPDFT entre os parlamentares que receberam vantagem indevida no esquema, conforme descrito em sentença de improbidade do TJDFT de 2023 (da qual não é ré). O desfecho dos processos contra ela não foi verificado nesta revisão, e a posição da defesa não foi localizada.' WHERE id = 415;
UPDATE links SET relation = 'Condenado pela 13ª Vara Federal de Curitiba em duas ações (casos Benin e Sondas). A 2ª Turma do STF anulou as duas condenações por incompetência da Justiça Federal, diante de indícios de crimes eleitorais, e enviou os casos à Justiça Eleitoral do Rio de Janeiro; em novembro de 2024 o ministro Dias Toffoli negou o pedido da defesa para encerrar todos os processos, que seguem em tramitação. A defesa sustenta que houve conluio entre o ex-juiz Sergio Moro e a força-tarefa.' WHERE id = 456;
UPDATE links SET relation = 'Assinou acordo de delação premiada com o MPF em agosto de 2014, homologado pelo ministro Teori Zavascki (STF) em 30/09/2014; no mesmo dia o juiz Sergio Moro lhe concedeu prisão domiciliar em razão da colaboração.' WHERE id = 459;
UPDATE links SET relation = 'Partido do prefeito Gilberto Braga, de Luís Domingues (MA), que relatou pedido de propina em ouro feito por pastor ligado ao MEC. As fontes lidas não registram acusação ao partido como instituição.' WHERE id = 601;
UPDATE links SET relation = 'Partido (atual MDB) do governador do DF Ibaneis Rocha durante a aquisição de carteiras do Banco Master pelo BRB. As fontes lidas não registram acusação ao partido como instituição.' WHERE id = 633;
UPDATE links SET amount_note = 'Total pedido pelo MPF na ação (ressarcimento, multa civil e danos morais coletivos); não é valor de condenação' WHERE id = 452;
UPDATE links SET amount = 'US$ 2.000.000,00' WHERE id = 19;
UPDATE links SET amount = 'US$ 35.000,00', amount_brl = 191048 WHERE id = 20;
UPDATE links SET amount = 'US$ 1.115.004.821,57' WHERE id = 46;
UPDATE links SET amount = 'US$ 239.199.956,54' WHERE id = 47;
UPDATE links SET amount = 'US$ 250.099.954,56' WHERE id = 50;
UPDATE links SET amount = 'US$ 4.000.000', amount_brl = 21836000 WHERE id = 84;
UPDATE links SET amount = 'R$ 800.000.000' WHERE id = 94;

-- Traduções: source_text = texto atual em português (mesmo formato de lib/translations.ts).
UPDATE node_translations SET source_text = (SELECT n.label || char(10) || COALESCE(n.summary, '') FROM nodes n WHERE n.id = node_translations.node_id) WHERE node_id IN ('pol_jose_roberto_arruda', 'op_cyonil_borges', 'pol_jorge_picciani', 'esquema_banco_master_inss');
UPDATE link_translations SET source_text = (SELECT l.relation || char(10) || COALESCE(l.amount, '') || char(10) || COALESCE(l.amount_note, '') FROM links l WHERE l.id = link_translations.link_id) WHERE link_id IN (409, 413, 415, 456, 459, 601, 633, 452, 19, 20, 46, 47, 50, 84, 94);
