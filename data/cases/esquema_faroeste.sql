-- Operação Faroeste (esquema_faroeste). Gerado em 2026-11-17 a partir do Master Prompt v6, após revisão independente.
-- Aplicar no D1 nesta ordem (já está no arquivo): nodes, links, node_translations, link_translations.
-- Idempotente: vínculos com guarda NOT EXISTS; traduções com ON CONFLICT DO NOTHING.

-- INSERÇÃO DE ENTIDADES (NODES)
INSERT OR IGNORE INTO nodes (id, label, type, party, image_url, summary, image_credit, image_source_url) VALUES
('esquema_faroeste', 'Operação Faroeste', 'scheme', NULL, NULL, 'Esquema de venda de decisões judiciais ligado à grilagem de terras no oeste da Bahia, investigado pela Polícia Federal e pelo MPF desde a operação deflagrada em novembro de 2019.', NULL, NULL),
('emp_tjba', 'Tribunal de Justiça da Bahia (TJ-BA)', 'company', NULL, NULL, 'Tribunal de segunda instância da Justiça estadual da Bahia, com sede em Salvador.', NULL, NULL),
('op_maria_do_socorro_santiago', 'Maria do Socorro Barreto Santiago', 'operator', NULL, NULL, 'Desembargadora do Tribunal de Justiça da Bahia, que presidiu a corte de 2016 a 2018.', NULL, NULL),
('op_sergio_sampaio', 'Sérgio Humberto de Quadros Sampaio', 'operator', NULL, NULL, 'Juiz de Direito da Bahia, aposentado, que atuou na comarca de Formosa do Rio Preto.', NULL, NULL),
('op_sandra_ines_azevedo', 'Sandra Inês Rusciolelli Azevedo', 'operator', NULL, NULL, 'Desembargadora aposentada do Tribunal de Justiça da Bahia.', NULL, NULL),
('op_vasco_rusciolelli', 'Vasco Rusciolelli Azevedo', 'operator', NULL, NULL, 'Advogado, filho da desembargadora Sandra Inês Rusciolelli Azevedo.', NULL, NULL),
('op_adailton_maturino', 'Adailton Maturino dos Santos', 'operator', NULL, NULL, 'Empresário que se apresentava como cônsul da Guiné-Bissau no Brasil.', NULL, NULL),
('op_geciane_maturino', 'Geciane Souza Maturino dos Santos', 'operator', NULL, NULL, 'Advogada, casada com o empresário Adailton Maturino dos Santos.', NULL, NULL),
('op_ricardo_tres', 'Ricardo Augusto Três', 'operator', NULL, NULL, 'Advogado.', NULL, NULL),
('op_nelson_vigolo', 'Nelson José Vigolo', 'operator', NULL, NULL, 'Produtor rural ligado à empresa Bom Jesus Agropecuária.', NULL, NULL),
('op_vanderlei_chilante', 'Vanderlei Chilante', 'operator', NULL, NULL, 'Advogado.', NULL, NULL),
('op_julio_cesar_ferreira', 'Júlio César Cavalcanti Ferreira', 'operator', NULL, NULL, 'Advogado.', NULL, NULL),
('op_marivalda_moutinho', 'Marivalda Almeida Moutinho', 'operator', NULL, NULL, 'Juíza de Direito do Tribunal de Justiça da Bahia.', NULL, NULL),
('op_gesivaldo_britto', 'Gesivaldo Nascimento Britto', 'operator', NULL, NULL, 'Desembargador do Tribunal de Justiça da Bahia, que presidia a corte quando foi afastado em 2019.', NULL, NULL),
('op_jose_olegario_caldas', 'José Olegário Monção Caldas', 'operator', NULL, NULL, 'Desembargador do Tribunal de Justiça da Bahia.', NULL, NULL),
('op_maria_da_graca_pimentel', 'Maria da Graça Osório Pimentel Leal', 'operator', NULL, NULL, 'Desembargadora do Tribunal de Justiça da Bahia.', NULL, NULL),
('op_marcio_braga', 'Márcio Reinaldo Miranda Braga', 'operator', NULL, NULL, 'Juiz de Direito do Tribunal de Justiça da Bahia.', NULL, NULL),
('op_marcio_duarte_miranda', 'Márcio Duarte Miranda', 'operator', NULL, NULL, 'Advogado, genro da desembargadora Maria do Socorro Barreto Santiago.', NULL, NULL),
('op_amanda_santiago', 'Amanda Santiago', 'operator', NULL, NULL, 'Cantora, ex-vocalista da banda Timbalada.', NULL, NULL);

-- INSERÇÃO DE CONEXÕES (LINKS) — um comando por vínculo, com guarda contra duplicação
INSERT INTO links (source, target, relation, type, status, amount, amount_brl, amount_note, amount_kind, year, source_url, reviewed_at)
SELECT 'op_maria_do_socorro_santiago', 'esquema_faroeste', 'Desembargadora condenada em 21/10/2026 pela Corte Especial do STJ a 14 anos e 11 meses de prisão, em regime inicial fechado, por corrupção passiva e lavagem de dinheiro, com perda do cargo; segundo o MPF, recebeu mais de R$ 400 mil, pagos por meio de terceiros, para beneficiar uma das partes em disputa de terras. Segundo o g1, a defesa afirma que não há prova idônea, que o valor apontado como propina foi uma operação financeira declarada entre irmãos e que recorrerá.', 'transaction', 'convicted_appealing', 'R$ 400.000', 400000, 'Valor citado pelo MPF (mais de R$ 400 mil); é valor mínimo, não o total apurado.', 'bribe', 2026, 'https://www.stj.jus.br/sites/portalp/Paginas/Comunicacao/Noticias/2026/21102026-Operacao-Faroeste-Corte-Especial-condena-magistrados-por-venda-de-decisoes-judiciais-na-Bahia.aspx', '2026-11-17'
WHERE NOT EXISTS (SELECT 1 FROM links WHERE source = 'op_maria_do_socorro_santiago' AND target = 'esquema_faroeste' AND type = 'transaction' AND status = 'convicted_appealing' AND COALESCE(year, -1) = 2026);
INSERT INTO links (source, target, relation, type, status, amount, amount_brl, amount_note, amount_kind, year, source_url, reviewed_at)
SELECT 'op_sergio_sampaio', 'esquema_faroeste', 'Juiz aposentado condenado em 21/10/2026 pela Corte Especial do STJ a 15 anos e 8 meses de prisão, em regime inicial fechado, por corrupção passiva e lavagem de dinheiro, com perda do cargo convertida em cassação da aposentadoria; segundo o MPF, recebeu mais de R$ 600 mil, pagos por meio de terceiros, para beneficiar uma das partes em disputa de terras. Segundo o g1, a defesa afirma que ele é inocente, que suas decisões foram legais e que buscará reverter a condenação.', 'transaction', 'convicted_appealing', 'R$ 600.000', 600000, 'Valor citado pelo MPF (mais de R$ 600 mil); é valor mínimo, não o total apurado.', 'bribe', 2026, 'https://www.stj.jus.br/sites/portalp/Paginas/Comunicacao/Noticias/2026/21102026-Operacao-Faroeste-Corte-Especial-condena-magistrados-por-venda-de-decisoes-judiciais-na-Bahia.aspx', '2026-11-17'
WHERE NOT EXISTS (SELECT 1 FROM links WHERE source = 'op_sergio_sampaio' AND target = 'esquema_faroeste' AND type = 'transaction' AND status = 'convicted_appealing' AND COALESCE(year, -1) = 2026);
INSERT INTO links (source, target, relation, type, status, amount, amount_brl, amount_note, amount_kind, year, source_url, reviewed_at)
SELECT 'op_sandra_ines_azevedo', 'esquema_faroeste', 'Desembargadora aposentada condenada em 04/11/2026 pela Corte Especial do STJ a 14 anos e 20 dias de prisão, em regime inicial fechado, por corrupção passiva e lavagem de dinheiro, com perda do cargo; segundo o MPF, atuou em processos para favorecer uma empresa agropecuária em troca de propina recebida por meio do filho. A defesa alegou que as decisões foram lícitas, que o patrimônio da família é compatível com a renda declarada e que há nulidade de provas.', 'transaction', 'convicted_appealing', 'R$ 250.000', 250000, 'Propina de R$ 250 mil que, segundo o g1, ela teria recebido para dar parecer favorável a uma empresa; o STJ registra que a PF apreendeu R$ 250 mil na casa dela e do filho. Não é o total de R$ 2,4 milhões que, segundo o g1, teriam sido pagos ao grupo de réus.', 'bribe', 2026, 'https://g1.globo.com/ba/bahia/noticia/2026/11/04/operacao-faroeste-mpf-pede-condenacao-dos-reus-e-defende-perdao-judicial-do-delator.ghtml', '2026-11-23'
WHERE NOT EXISTS (SELECT 1 FROM links WHERE source = 'op_sandra_ines_azevedo' AND target = 'esquema_faroeste' AND type = 'transaction' AND status = 'convicted_appealing' AND COALESCE(year, -1) = 2026);
INSERT INTO links (source, target, relation, type, status, amount, amount_brl, amount_note, amount_kind, year, source_url, reviewed_at)
SELECT 'op_vasco_rusciolelli', 'esquema_faroeste', 'Advogado e filho da desembargadora Sandra Inês Rusciolelli Azevedo, condenado em 04/11/2026 pela Corte Especial do STJ a 13 anos e 11 meses de prisão, em regime inicial fechado, por corrupção passiva, lavagem de dinheiro e associação criminosa; segundo o STJ, a PF apreendeu R$ 250 mil na casa da desembargadora e do filho. As fontes lidas não trazem defesa de mérito: na ausência dos advogados dos réus, a Defensoria Pública da União foi designada pelo STJ para a defesa.', 'transaction', 'convicted_appealing', NULL, NULL, NULL, NULL, 2026, 'https://www.stj.jus.br/sites/portalp/Paginas/Comunicacao/Noticias/2026/04112026-Operacao-Faroeste-STJ-condena-mais-uma-desembargadora-do-TJBA-e-cassa-aposentadoria.aspx', '2026-11-17'
WHERE NOT EXISTS (SELECT 1 FROM links WHERE source = 'op_vasco_rusciolelli' AND target = 'esquema_faroeste' AND type = 'transaction' AND status = 'convicted_appealing' AND COALESCE(year, -1) = 2026);
INSERT INTO links (source, target, relation, type, status, amount, amount_brl, amount_note, amount_kind, year, source_url, reviewed_at)
SELECT 'op_adailton_maturino', 'esquema_faroeste', 'Empresário condenado em 21/10/2026 pela Corte Especial do STJ a 21 anos e 7 meses de prisão, em regime inicial fechado, por corrupção ativa e lavagem de dinheiro; segundo o relator, ocupava posição central no esquema e se apresentava falsamente como cônsul da Guiné-Bissau. As fontes lidas não registram manifestação da defesa.', 'transaction', 'convicted_appealing', NULL, NULL, NULL, NULL, 2026, 'https://www.stj.jus.br/sites/portalp/Paginas/Comunicacao/Noticias/2026/21102026-Operacao-Faroeste-Corte-Especial-condena-magistrados-por-venda-de-decisoes-judiciais-na-Bahia.aspx', '2026-11-17'
WHERE NOT EXISTS (SELECT 1 FROM links WHERE source = 'op_adailton_maturino' AND target = 'esquema_faroeste' AND type = 'transaction' AND status = 'convicted_appealing' AND COALESCE(year, -1) = 2026);
INSERT INTO links (source, target, relation, type, status, amount, amount_brl, amount_note, amount_kind, year, source_url, reviewed_at)
SELECT 'op_geciane_maturino', 'esquema_faroeste', 'Esposa de Adailton Maturino dos Santos, condenada em 21/10/2026 pela Corte Especial do STJ a 16 anos e 4 meses de prisão, em regime inicial fechado, por corrupção ativa e lavagem de dinheiro; segundo o relator, ocupava posição central no esquema ao lado do marido. As fontes lidas não registram manifestação da defesa.', 'transaction', 'convicted_appealing', NULL, NULL, NULL, NULL, 2026, 'https://www.stj.jus.br/sites/portalp/Paginas/Comunicacao/Noticias/2026/21102026-Operacao-Faroeste-Corte-Especial-condena-magistrados-por-venda-de-decisoes-judiciais-na-Bahia.aspx', '2026-11-17'
WHERE NOT EXISTS (SELECT 1 FROM links WHERE source = 'op_geciane_maturino' AND target = 'esquema_faroeste' AND type = 'transaction' AND status = 'convicted_appealing' AND COALESCE(year, -1) = 2026);
INSERT INTO links (source, target, relation, type, status, amount, amount_brl, amount_note, amount_kind, year, source_url, reviewed_at)
SELECT 'op_ricardo_tres', 'esquema_faroeste', 'Advogado condenado em 21/10/2026 pela Corte Especial do STJ a 10 anos e 9 meses de prisão, em regime inicial fechado, por corrupção ativa e lavagem de dinheiro. As fontes lidas não registram manifestação da defesa.', 'transaction', 'convicted_appealing', NULL, NULL, NULL, NULL, 2026, 'https://www.stj.jus.br/sites/portalp/Paginas/Comunicacao/Noticias/2026/21102026-Operacao-Faroeste-Corte-Especial-condena-magistrados-por-venda-de-decisoes-judiciais-na-Bahia.aspx', '2026-11-17'
WHERE NOT EXISTS (SELECT 1 FROM links WHERE source = 'op_ricardo_tres' AND target = 'esquema_faroeste' AND type = 'transaction' AND status = 'convicted_appealing' AND COALESCE(year, -1) = 2026);
INSERT INTO links (source, target, relation, type, status, amount, amount_brl, amount_note, amount_kind, year, source_url, reviewed_at)
SELECT 'op_nelson_vigolo', 'esquema_faroeste', 'Produtor rural ligado à Bom Jesus Agropecuária, condenado em 04/11/2026 pela Corte Especial do STJ a 4 anos e 1 mês de prisão, em regime semiaberto domiciliar, por corrupção ativa e lavagem de capitais, e absolvido do crime de organização criminosa (o g1 registra pena de 4 anos, 1 mês e 20 dias). Segundo o g1, a defesa afirma que ele, como outros produtores do oeste baiano, foi vítima de um esquema de extorsão revelado pela operação.', 'transaction', 'convicted_appealing', NULL, NULL, NULL, NULL, 2026, 'https://www.stj.jus.br/sites/portalp/Paginas/Comunicacao/Noticias/2026/04112026-Operacao-Faroeste-STJ-condena-mais-uma-desembargadora-do-TJBA-e-cassa-aposentadoria.aspx', '2026-11-17'
WHERE NOT EXISTS (SELECT 1 FROM links WHERE source = 'op_nelson_vigolo' AND target = 'esquema_faroeste' AND type = 'transaction' AND status = 'convicted_appealing' AND COALESCE(year, -1) = 2026);
INSERT INTO links (source, target, relation, type, status, amount, amount_brl, amount_note, amount_kind, year, source_url, reviewed_at)
SELECT 'op_vanderlei_chilante', 'esquema_faroeste', 'Advogado condenado em 04/11/2026 pela Corte Especial do STJ a 4 anos e 11 meses de prisão, em regime semiaberto, por corrupção ativa e lavagem de capitais, e absolvido do crime de organização criminosa (o g1 registra pena de 4 anos, 11 meses e 25 dias). O g1 procurou a defesa, que não respondeu até a atualização da reportagem.', 'transaction', 'convicted_appealing', NULL, NULL, NULL, NULL, 2026, 'https://www.stj.jus.br/sites/portalp/Paginas/Comunicacao/Noticias/2026/04112026-Operacao-Faroeste-STJ-condena-mais-uma-desembargadora-do-TJBA-e-cassa-aposentadoria.aspx', '2026-11-17'
WHERE NOT EXISTS (SELECT 1 FROM links WHERE source = 'op_vanderlei_chilante' AND target = 'esquema_faroeste' AND type = 'transaction' AND status = 'convicted_appealing' AND COALESCE(year, -1) = 2026);
INSERT INTO links (source, target, relation, type, status, amount, amount_brl, amount_note, amount_kind, year, source_url, reviewed_at)
SELECT 'op_julio_cesar_ferreira', 'esquema_faroeste', 'Advogado colaborador que recebeu perdão judicial em 04/11/2026 da Corte Especial do STJ, em razão da colaboração premiada, a pedido também do MPF. Segundo a defesa, o acordo foi homologado pelo STJ em 31/03/2020 e trouxe fatos até então desconhecidos; o conteúdo da colaboração é alegação do colaborador.', 'process', 'confirmed', NULL, NULL, NULL, NULL, 2026, 'https://g1.globo.com/ba/bahia/noticia/2026/11/04/operacao-faroeste-mpf-pede-condenacao-dos-reus-e-defende-perdao-judicial-do-delator.ghtml', '2026-11-17'
WHERE NOT EXISTS (SELECT 1 FROM links WHERE source = 'op_julio_cesar_ferreira' AND target = 'esquema_faroeste' AND type = 'process' AND status = 'confirmed' AND COALESCE(year, -1) = 2026);
INSERT INTO links (source, target, relation, type, status, amount, amount_brl, amount_note, amount_kind, year, source_url, reviewed_at)
SELECT 'op_marivalda_moutinho', 'esquema_faroeste', 'Juíza de Direito tornada ré em maio de 2020 pela Corte Especial do STJ na Operação Faroeste. As fontes lidas não registram julgamento de mérito nem manifestação da defesa.', 'process', 'under_investigation', NULL, NULL, NULL, NULL, 2020, 'https://g1.globo.com/ba/bahia/noticia/2020/07/02/operacao-faroeste-mpf-requer-manutencao-da-prisao-preventiva-de-seis-investigados.ghtml', '2026-11-17'
WHERE NOT EXISTS (SELECT 1 FROM links WHERE source = 'op_marivalda_moutinho' AND target = 'esquema_faroeste' AND type = 'process' AND status = 'under_investigation' AND COALESCE(year, -1) = 2020);
INSERT INTO links (source, target, relation, type, status, amount, amount_brl, amount_note, amount_kind, year, source_url, reviewed_at)
SELECT 'op_gesivaldo_britto', 'esquema_faroeste', 'Desembargador tornado réu em maio de 2020 pela Corte Especial do STJ na Operação Faroeste. As fontes lidas não registram julgamento de mérito nem manifestação da defesa; o CNJ informou em 2026 seu falecimento, que por lei extingue a punibilidade, mas a decisão penal que a declara não foi localizada.', 'process', 'under_investigation', NULL, NULL, NULL, NULL, 2020, 'https://g1.globo.com/ba/bahia/noticia/2020/07/02/operacao-faroeste-mpf-requer-manutencao-da-prisao-preventiva-de-seis-investigados.ghtml', '2026-11-17'
WHERE NOT EXISTS (SELECT 1 FROM links WHERE source = 'op_gesivaldo_britto' AND target = 'esquema_faroeste' AND type = 'process' AND status = 'under_investigation' AND COALESCE(year, -1) = 2020);
INSERT INTO links (source, target, relation, type, status, amount, amount_brl, amount_note, amount_kind, year, source_url, reviewed_at)
SELECT 'op_jose_olegario_caldas', 'esquema_faroeste', 'Desembargador tornado réu em maio de 2020 pela Corte Especial do STJ na Operação Faroeste. As fontes lidas não registram julgamento de mérito nem manifestação da defesa.', 'process', 'under_investigation', NULL, NULL, NULL, NULL, 2020, 'https://g1.globo.com/ba/bahia/noticia/2020/07/02/operacao-faroeste-mpf-requer-manutencao-da-prisao-preventiva-de-seis-investigados.ghtml', '2026-11-17'
WHERE NOT EXISTS (SELECT 1 FROM links WHERE source = 'op_jose_olegario_caldas' AND target = 'esquema_faroeste' AND type = 'process' AND status = 'under_investigation' AND COALESCE(year, -1) = 2020);
INSERT INTO links (source, target, relation, type, status, amount, amount_brl, amount_note, amount_kind, year, source_url, reviewed_at)
SELECT 'op_maria_da_graca_pimentel', 'esquema_faroeste', 'Desembargadora tornada ré em maio de 2020 pela Corte Especial do STJ na Operação Faroeste. As fontes lidas não registram julgamento de mérito nem manifestação da defesa.', 'process', 'under_investigation', NULL, NULL, NULL, NULL, 2020, 'https://g1.globo.com/ba/bahia/noticia/2020/07/02/operacao-faroeste-mpf-requer-manutencao-da-prisao-preventiva-de-seis-investigados.ghtml', '2026-11-17'
WHERE NOT EXISTS (SELECT 1 FROM links WHERE source = 'op_maria_da_graca_pimentel' AND target = 'esquema_faroeste' AND type = 'process' AND status = 'under_investigation' AND COALESCE(year, -1) = 2020);
INSERT INTO links (source, target, relation, type, status, amount, amount_brl, amount_note, amount_kind, year, source_url, reviewed_at)
SELECT 'op_marcio_braga', 'esquema_faroeste', 'Juiz de Direito tornado réu em maio de 2020 pela Corte Especial do STJ na Operação Faroeste. As fontes lidas não registram julgamento de mérito nem manifestação da defesa.', 'process', 'under_investigation', NULL, NULL, NULL, NULL, 2020, 'https://g1.globo.com/ba/bahia/noticia/2020/07/02/operacao-faroeste-mpf-requer-manutencao-da-prisao-preventiva-de-seis-investigados.ghtml', '2026-11-17'
WHERE NOT EXISTS (SELECT 1 FROM links WHERE source = 'op_marcio_braga' AND target = 'esquema_faroeste' AND type = 'process' AND status = 'under_investigation' AND COALESCE(year, -1) = 2020);
INSERT INTO links (source, target, relation, type, status, amount, amount_brl, amount_note, amount_kind, year, source_url, reviewed_at)
SELECT 'op_marcio_duarte_miranda', 'esquema_faroeste', 'Advogado absolvido em 21/10/2026 pela Corte Especial do STJ, na ação penal 985, por insuficiência de provas da participação nas dinâmicas delitivas.', 'process', 'acquitted', NULL, NULL, NULL, NULL, 2026, 'https://www.stj.jus.br/sites/portalp/Paginas/Comunicacao/Noticias/2026/21102026-Operacao-Faroeste-Corte-Especial-condena-magistrados-por-venda-de-decisoes-judiciais-na-Bahia.aspx', '2026-11-17'
WHERE NOT EXISTS (SELECT 1 FROM links WHERE source = 'op_marcio_duarte_miranda' AND target = 'esquema_faroeste' AND type = 'process' AND status = 'acquitted' AND COALESCE(year, -1) = 2026);
INSERT INTO links (source, target, relation, type, status, amount, amount_brl, amount_note, amount_kind, year, source_url, reviewed_at)
SELECT 'op_amanda_santiago', 'esquema_faroeste', 'Ré na ação penal 985, absolvida em 21/10/2026 pela Corte Especial do STJ por insuficiência de provas da participação nas dinâmicas delitivas. Segundo o g1, a defesa afirma que a absolvição reconhece a ausência de dolo e de provas e que ela jamais praticou crime.', 'process', 'acquitted', NULL, NULL, NULL, NULL, 2026, 'https://www.stj.jus.br/sites/portalp/Paginas/Comunicacao/Noticias/2026/21102026-Operacao-Faroeste-Corte-Especial-condena-magistrados-por-venda-de-decisoes-judiciais-na-Bahia.aspx', '2026-11-17'
WHERE NOT EXISTS (SELECT 1 FROM links WHERE source = 'op_amanda_santiago' AND target = 'esquema_faroeste' AND type = 'process' AND status = 'acquitted' AND COALESCE(year, -1) = 2026);
INSERT INTO links (source, target, relation, type, status, amount, amount_brl, amount_note, amount_kind, year, source_url, reviewed_at)
SELECT 'op_maria_do_socorro_santiago', 'emp_tjba', 'Desembargadora e ex-presidente do TJ-BA, afastada desde 2019; em 27/10/2026 o CNJ lhe aplicou, por unanimidade, a pena de disponibilidade, com proposta de perda do cargo, que depende de ação da AGU no STF; na ação penal, o STJ já decretara a perda do cargo, decisão sujeita a recurso.', 'contract', 'confirmed', NULL, NULL, NULL, NULL, 2026, 'https://g1.globo.com/politica/noticia/2026/10/27/operacao-faroeste-cnj-propoe-perda-de-cargo-a-envolvidos-em-venda-de-decisoes-judiciais-na-bahia.ghtml', '2026-11-17'
WHERE NOT EXISTS (SELECT 1 FROM links WHERE source = 'op_maria_do_socorro_santiago' AND target = 'emp_tjba' AND type = 'contract' AND status = 'confirmed' AND COALESCE(year, -1) = 2026);
INSERT INTO links (source, target, relation, type, status, amount, amount_brl, amount_note, amount_kind, year, source_url, reviewed_at)
SELECT 'op_sergio_sampaio', 'emp_tjba', 'Juiz de Direito aposentado do TJ-BA; em 27/10/2026 o CNJ lhe aplicou, por unanimidade, a pena de disponibilidade, com proposta de perda do cargo, que depende de ação da AGU no STF; na ação penal, o STJ já decretara a perda do cargo, decisão sujeita a recurso.', 'contract', 'confirmed', NULL, NULL, NULL, NULL, 2026, 'https://g1.globo.com/politica/noticia/2026/10/27/operacao-faroeste-cnj-propoe-perda-de-cargo-a-envolvidos-em-venda-de-decisoes-judiciais-na-bahia.ghtml', '2026-11-17'
WHERE NOT EXISTS (SELECT 1 FROM links WHERE source = 'op_sergio_sampaio' AND target = 'emp_tjba' AND type = 'contract' AND status = 'confirmed' AND COALESCE(year, -1) = 2026);
INSERT INTO links (source, target, relation, type, status, amount, amount_brl, amount_note, amount_kind, year, source_url, reviewed_at)
SELECT 'op_sandra_ines_azevedo', 'emp_tjba', 'Desembargadora do TJ-BA, afastada desde 2020 e aposentada compulsoriamente pelo CNJ, por unanimidade, em dezembro de 2024, em processo administrativo disciplinar; em 04/11/2026, na ação penal, o STJ decretou a perda do cargo, decisão sujeita a recurso.', 'contract', 'confirmed', NULL, NULL, NULL, NULL, 2024, 'https://g1.globo.com/ba/bahia/noticia/2026/11/04/operacao-faroeste-mpf-pede-condenacao-dos-reus-e-defende-perdao-judicial-do-delator.ghtml', '2026-11-17'
WHERE NOT EXISTS (SELECT 1 FROM links WHERE source = 'op_sandra_ines_azevedo' AND target = 'emp_tjba' AND type = 'contract' AND status = 'confirmed' AND COALESCE(year, -1) = 2024);
INSERT INTO links (source, target, relation, type, status, amount, amount_brl, amount_note, amount_kind, year, source_url, reviewed_at)
SELECT 'op_gesivaldo_britto', 'emp_tjba', 'Desembargador do TJ-BA; em 27/10/2026 o CNJ declarou extinta a pretensão punitiva disciplinar contra ele, em razão de seu falecimento.', 'contract', 'confirmed', NULL, NULL, NULL, NULL, 2026, 'https://www.cnj.jus.br/cinco-magistrados-do-tjba-sao-penalizados-pelo-cnj-por-envolvimento-na-operacao-faroeste/', '2026-11-17'
WHERE NOT EXISTS (SELECT 1 FROM links WHERE source = 'op_gesivaldo_britto' AND target = 'emp_tjba' AND type = 'contract' AND status = 'confirmed' AND COALESCE(year, -1) = 2026);
INSERT INTO links (source, target, relation, type, status, amount, amount_brl, amount_note, amount_kind, year, source_url, reviewed_at)
SELECT 'op_marivalda_moutinho', 'emp_tjba', 'Juíza de Direito do TJ-BA; em 27/10/2026 o CNJ lhe aplicou, por unanimidade, a pena de disponibilidade, com afastamento imediato e proposta de perda do cargo, que depende de ação da AGU no STF.', 'contract', 'confirmed', NULL, NULL, NULL, NULL, 2026, 'https://www.cnj.jus.br/cinco-magistrados-do-tjba-sao-penalizados-pelo-cnj-por-envolvimento-na-operacao-faroeste/', '2026-11-17'
WHERE NOT EXISTS (SELECT 1 FROM links WHERE source = 'op_marivalda_moutinho' AND target = 'emp_tjba' AND type = 'contract' AND status = 'confirmed' AND COALESCE(year, -1) = 2026);
INSERT INTO links (source, target, relation, type, status, amount, amount_brl, amount_note, amount_kind, year, source_url, reviewed_at)
SELECT 'op_jose_olegario_caldas', 'emp_tjba', 'Desembargador do TJ-BA; em 27/10/2026 o CNJ lhe aplicou, por unanimidade, a pena de disponibilidade, com proposta de perda do cargo, que depende de ação da AGU no STF.', 'contract', 'confirmed', NULL, NULL, NULL, NULL, 2026, 'https://www.cnj.jus.br/cinco-magistrados-do-tjba-sao-penalizados-pelo-cnj-por-envolvimento-na-operacao-faroeste/', '2026-11-17'
WHERE NOT EXISTS (SELECT 1 FROM links WHERE source = 'op_jose_olegario_caldas' AND target = 'emp_tjba' AND type = 'contract' AND status = 'confirmed' AND COALESCE(year, -1) = 2026);
INSERT INTO links (source, target, relation, type, status, amount, amount_brl, amount_note, amount_kind, year, source_url, reviewed_at)
SELECT 'op_maria_da_graca_pimentel', 'emp_tjba', 'Desembargadora do TJ-BA; em 27/10/2026 o CNJ lhe aplicou, por unanimidade, a pena de disponibilidade, com proposta de perda do cargo, que depende de ação da AGU no STF.', 'contract', 'confirmed', NULL, NULL, NULL, NULL, 2026, 'https://www.cnj.jus.br/cinco-magistrados-do-tjba-sao-penalizados-pelo-cnj-por-envolvimento-na-operacao-faroeste/', '2026-11-17'
WHERE NOT EXISTS (SELECT 1 FROM links WHERE source = 'op_maria_da_graca_pimentel' AND target = 'emp_tjba' AND type = 'contract' AND status = 'confirmed' AND COALESCE(year, -1) = 2026);
INSERT INTO links (source, target, relation, type, status, amount, amount_brl, amount_note, amount_kind, year, source_url, reviewed_at)
SELECT 'op_marcio_braga', 'emp_tjba', 'Juiz de Direito do TJ-BA; em 27/10/2026 o CNJ julgou improcedentes as imputações disciplinares contra ele e determinou o arquivamento do processo em relação a ele.', 'contract', 'confirmed', NULL, NULL, NULL, NULL, 2026, 'https://www.cnj.jus.br/cinco-magistrados-do-tjba-sao-penalizados-pelo-cnj-por-envolvimento-na-operacao-faroeste/', '2026-11-17'
WHERE NOT EXISTS (SELECT 1 FROM links WHERE source = 'op_marcio_braga' AND target = 'emp_tjba' AND type = 'contract' AND status = 'confirmed' AND COALESCE(year, -1) = 2026);

-- TRADUÇÕES DE ENTIDADES
INSERT INTO node_translations (node_id, lang, label, summary, source_text)
SELECT id, 'en', 'Operation Faroeste', 'Scheme for selling court rulings linked to land grabbing (grilagem) in western Bahia, investigated by the Federal Police and the Federal Prosecution Service (MPF) since the operation launched in November 2019.', label || char(10) || COALESCE(summary, '') FROM nodes WHERE id = 'esquema_faroeste'
ON CONFLICT(node_id, lang) DO NOTHING;
INSERT INTO node_translations (node_id, lang, label, summary, source_text)
SELECT id, 'es', 'Operación Faroeste', 'Trama de venta de resoluciones judiciales vinculada al acaparamiento ilegal de tierras (grilagem) en el oeste de Bahía, investigada por la Policía Federal y el Ministerio Público Federal (MPF) desde la operación desencadenada en noviembre de 2019.', label || char(10) || COALESCE(summary, '') FROM nodes WHERE id = 'esquema_faroeste'
ON CONFLICT(node_id, lang) DO NOTHING;
INSERT INTO node_translations (node_id, lang, label, summary, source_text)
SELECT id, 'en', 'Court of Justice of Bahia (TJ-BA)', 'Second-instance court of the Bahia state judiciary, based in Salvador.', label || char(10) || COALESCE(summary, '') FROM nodes WHERE id = 'emp_tjba'
ON CONFLICT(node_id, lang) DO NOTHING;
INSERT INTO node_translations (node_id, lang, label, summary, source_text)
SELECT id, 'es', 'Tribunal de Justicia de Bahía (TJ-BA)', 'Tribunal de segunda instancia de la Justicia estadual de Bahía, con sede en Salvador.', label || char(10) || COALESCE(summary, '') FROM nodes WHERE id = 'emp_tjba'
ON CONFLICT(node_id, lang) DO NOTHING;
INSERT INTO node_translations (node_id, lang, label, summary, source_text)
SELECT id, 'en', NULL, 'Appeal court judge (desembargadora) of the Court of Justice of Bahia, who presided over the court from 2016 to 2018.', label || char(10) || COALESCE(summary, '') FROM nodes WHERE id = 'op_maria_do_socorro_santiago'
ON CONFLICT(node_id, lang) DO NOTHING;
INSERT INTO node_translations (node_id, lang, label, summary, source_text)
SELECT id, 'es', NULL, 'Desembargadora del Tribunal de Justicia de Bahía, que presidió la corte de 2016 a 2018.', label || char(10) || COALESCE(summary, '') FROM nodes WHERE id = 'op_maria_do_socorro_santiago'
ON CONFLICT(node_id, lang) DO NOTHING;
INSERT INTO node_translations (node_id, lang, label, summary, source_text)
SELECT id, 'en', NULL, 'Retired Bahia state judge who served in the district of Formosa do Rio Preto.', label || char(10) || COALESCE(summary, '') FROM nodes WHERE id = 'op_sergio_sampaio'
ON CONFLICT(node_id, lang) DO NOTHING;
INSERT INTO node_translations (node_id, lang, label, summary, source_text)
SELECT id, 'es', NULL, 'Juez de Bahía jubilado, que actuó en el distrito judicial de Formosa do Rio Preto.', label || char(10) || COALESCE(summary, '') FROM nodes WHERE id = 'op_sergio_sampaio'
ON CONFLICT(node_id, lang) DO NOTHING;
INSERT INTO node_translations (node_id, lang, label, summary, source_text)
SELECT id, 'en', NULL, 'Retired appeal court judge (desembargadora) of the Court of Justice of Bahia.', label || char(10) || COALESCE(summary, '') FROM nodes WHERE id = 'op_sandra_ines_azevedo'
ON CONFLICT(node_id, lang) DO NOTHING;
INSERT INTO node_translations (node_id, lang, label, summary, source_text)
SELECT id, 'es', NULL, 'Desembargadora jubilada del Tribunal de Justicia de Bahía.', label || char(10) || COALESCE(summary, '') FROM nodes WHERE id = 'op_sandra_ines_azevedo'
ON CONFLICT(node_id, lang) DO NOTHING;
INSERT INTO node_translations (node_id, lang, label, summary, source_text)
SELECT id, 'en', NULL, 'Lawyer, son of appeal court judge (desembargadora) Sandra Inês Rusciolelli Azevedo.', label || char(10) || COALESCE(summary, '') FROM nodes WHERE id = 'op_vasco_rusciolelli'
ON CONFLICT(node_id, lang) DO NOTHING;
INSERT INTO node_translations (node_id, lang, label, summary, source_text)
SELECT id, 'es', NULL, 'Abogado, hijo de la desembargadora Sandra Inês Rusciolelli Azevedo.', label || char(10) || COALESCE(summary, '') FROM nodes WHERE id = 'op_vasco_rusciolelli'
ON CONFLICT(node_id, lang) DO NOTHING;
INSERT INTO node_translations (node_id, lang, label, summary, source_text)
SELECT id, 'en', NULL, 'Businessman who presented himself as consul of Guinea-Bissau in Brazil.', label || char(10) || COALESCE(summary, '') FROM nodes WHERE id = 'op_adailton_maturino'
ON CONFLICT(node_id, lang) DO NOTHING;
INSERT INTO node_translations (node_id, lang, label, summary, source_text)
SELECT id, 'es', NULL, 'Empresario que se presentaba como cónsul de Guinea-Bisáu en Brasil.', label || char(10) || COALESCE(summary, '') FROM nodes WHERE id = 'op_adailton_maturino'
ON CONFLICT(node_id, lang) DO NOTHING;
INSERT INTO node_translations (node_id, lang, label, summary, source_text)
SELECT id, 'en', NULL, 'Lawyer, married to the businessman Adailton Maturino dos Santos.', label || char(10) || COALESCE(summary, '') FROM nodes WHERE id = 'op_geciane_maturino'
ON CONFLICT(node_id, lang) DO NOTHING;
INSERT INTO node_translations (node_id, lang, label, summary, source_text)
SELECT id, 'es', NULL, 'Abogada, casada con el empresario Adailton Maturino dos Santos.', label || char(10) || COALESCE(summary, '') FROM nodes WHERE id = 'op_geciane_maturino'
ON CONFLICT(node_id, lang) DO NOTHING;
INSERT INTO node_translations (node_id, lang, label, summary, source_text)
SELECT id, 'en', NULL, 'Lawyer.', label || char(10) || COALESCE(summary, '') FROM nodes WHERE id = 'op_ricardo_tres'
ON CONFLICT(node_id, lang) DO NOTHING;
INSERT INTO node_translations (node_id, lang, label, summary, source_text)
SELECT id, 'es', NULL, 'Abogado.', label || char(10) || COALESCE(summary, '') FROM nodes WHERE id = 'op_ricardo_tres'
ON CONFLICT(node_id, lang) DO NOTHING;
INSERT INTO node_translations (node_id, lang, label, summary, source_text)
SELECT id, 'en', NULL, 'Farmer linked to the company Bom Jesus Agropecuária.', label || char(10) || COALESCE(summary, '') FROM nodes WHERE id = 'op_nelson_vigolo'
ON CONFLICT(node_id, lang) DO NOTHING;
INSERT INTO node_translations (node_id, lang, label, summary, source_text)
SELECT id, 'es', NULL, 'Productor rural vinculado a la empresa Bom Jesus Agropecuária.', label || char(10) || COALESCE(summary, '') FROM nodes WHERE id = 'op_nelson_vigolo'
ON CONFLICT(node_id, lang) DO NOTHING;
INSERT INTO node_translations (node_id, lang, label, summary, source_text)
SELECT id, 'en', NULL, 'Lawyer.', label || char(10) || COALESCE(summary, '') FROM nodes WHERE id = 'op_vanderlei_chilante'
ON CONFLICT(node_id, lang) DO NOTHING;
INSERT INTO node_translations (node_id, lang, label, summary, source_text)
SELECT id, 'es', NULL, 'Abogado.', label || char(10) || COALESCE(summary, '') FROM nodes WHERE id = 'op_vanderlei_chilante'
ON CONFLICT(node_id, lang) DO NOTHING;
INSERT INTO node_translations (node_id, lang, label, summary, source_text)
SELECT id, 'en', NULL, 'Lawyer.', label || char(10) || COALESCE(summary, '') FROM nodes WHERE id = 'op_julio_cesar_ferreira'
ON CONFLICT(node_id, lang) DO NOTHING;
INSERT INTO node_translations (node_id, lang, label, summary, source_text)
SELECT id, 'es', NULL, 'Abogado.', label || char(10) || COALESCE(summary, '') FROM nodes WHERE id = 'op_julio_cesar_ferreira'
ON CONFLICT(node_id, lang) DO NOTHING;
INSERT INTO node_translations (node_id, lang, label, summary, source_text)
SELECT id, 'en', NULL, 'Judge of the Court of Justice of Bahia.', label || char(10) || COALESCE(summary, '') FROM nodes WHERE id = 'op_marivalda_moutinho'
ON CONFLICT(node_id, lang) DO NOTHING;
INSERT INTO node_translations (node_id, lang, label, summary, source_text)
SELECT id, 'es', NULL, 'Jueza del Tribunal de Justicia de Bahía.', label || char(10) || COALESCE(summary, '') FROM nodes WHERE id = 'op_marivalda_moutinho'
ON CONFLICT(node_id, lang) DO NOTHING;
INSERT INTO node_translations (node_id, lang, label, summary, source_text)
SELECT id, 'en', NULL, 'Appeal court judge (desembargador) of the Court of Justice of Bahia, who presided over the court when he was suspended in 2019.', label || char(10) || COALESCE(summary, '') FROM nodes WHERE id = 'op_gesivaldo_britto'
ON CONFLICT(node_id, lang) DO NOTHING;
INSERT INTO node_translations (node_id, lang, label, summary, source_text)
SELECT id, 'es', NULL, 'Desembargador del Tribunal de Justicia de Bahía, que presidía la corte cuando fue apartado en 2019.', label || char(10) || COALESCE(summary, '') FROM nodes WHERE id = 'op_gesivaldo_britto'
ON CONFLICT(node_id, lang) DO NOTHING;
INSERT INTO node_translations (node_id, lang, label, summary, source_text)
SELECT id, 'en', NULL, 'Appeal court judge (desembargador) of the Court of Justice of Bahia.', label || char(10) || COALESCE(summary, '') FROM nodes WHERE id = 'op_jose_olegario_caldas'
ON CONFLICT(node_id, lang) DO NOTHING;
INSERT INTO node_translations (node_id, lang, label, summary, source_text)
SELECT id, 'es', NULL, 'Desembargador del Tribunal de Justicia de Bahía.', label || char(10) || COALESCE(summary, '') FROM nodes WHERE id = 'op_jose_olegario_caldas'
ON CONFLICT(node_id, lang) DO NOTHING;
INSERT INTO node_translations (node_id, lang, label, summary, source_text)
SELECT id, 'en', NULL, 'Appeal court judge (desembargadora) of the Court of Justice of Bahia.', label || char(10) || COALESCE(summary, '') FROM nodes WHERE id = 'op_maria_da_graca_pimentel'
ON CONFLICT(node_id, lang) DO NOTHING;
INSERT INTO node_translations (node_id, lang, label, summary, source_text)
SELECT id, 'es', NULL, 'Desembargadora del Tribunal de Justicia de Bahía.', label || char(10) || COALESCE(summary, '') FROM nodes WHERE id = 'op_maria_da_graca_pimentel'
ON CONFLICT(node_id, lang) DO NOTHING;
INSERT INTO node_translations (node_id, lang, label, summary, source_text)
SELECT id, 'en', NULL, 'Judge of the Court of Justice of Bahia.', label || char(10) || COALESCE(summary, '') FROM nodes WHERE id = 'op_marcio_braga'
ON CONFLICT(node_id, lang) DO NOTHING;
INSERT INTO node_translations (node_id, lang, label, summary, source_text)
SELECT id, 'es', NULL, 'Juez del Tribunal de Justicia de Bahía.', label || char(10) || COALESCE(summary, '') FROM nodes WHERE id = 'op_marcio_braga'
ON CONFLICT(node_id, lang) DO NOTHING;
INSERT INTO node_translations (node_id, lang, label, summary, source_text)
SELECT id, 'en', NULL, 'Lawyer, son-in-law of appeal court judge (desembargadora) Maria do Socorro Barreto Santiago.', label || char(10) || COALESCE(summary, '') FROM nodes WHERE id = 'op_marcio_duarte_miranda'
ON CONFLICT(node_id, lang) DO NOTHING;
INSERT INTO node_translations (node_id, lang, label, summary, source_text)
SELECT id, 'es', NULL, 'Abogado, yerno de la desembargadora Maria do Socorro Barreto Santiago.', label || char(10) || COALESCE(summary, '') FROM nodes WHERE id = 'op_marcio_duarte_miranda'
ON CONFLICT(node_id, lang) DO NOTHING;
INSERT INTO node_translations (node_id, lang, label, summary, source_text)
SELECT id, 'en', NULL, 'Singer, former vocalist of the band Timbalada.', label || char(10) || COALESCE(summary, '') FROM nodes WHERE id = 'op_amanda_santiago'
ON CONFLICT(node_id, lang) DO NOTHING;
INSERT INTO node_translations (node_id, lang, label, summary, source_text)
SELECT id, 'es', NULL, 'Cantante, exvocalista de la banda Timbalada.', label || char(10) || COALESCE(summary, '') FROM nodes WHERE id = 'op_amanda_santiago'
ON CONFLICT(node_id, lang) DO NOTHING;

-- TRADUÇÕES DE CONEXÕES
INSERT INTO link_translations (link_id, lang, relation, amount, amount_note, source_text)
SELECT id, 'en', 'Appeal court judge (desembargadora) convicted on 21 October 2026 by the Special Court of the Superior Court of Justice (STJ) and sentenced to 14 years and 11 months in prison, to be served initially in a closed regime, for passive corruption and money laundering, with loss of office; according to the Federal Prosecution Service (MPF), she received more than R$ 400,000, paid through third parties, to favour one party in a land dispute. According to g1, the defence says there is no sound evidence, that the amount described as a bribe was a declared financial transaction between siblings and that it will appeal.', NULL, 'Figure cited by the MPF (more than R$ 400,000); a minimum figure, not the total established.', relation || char(10) || COALESCE(amount, '') || char(10) || COALESCE(amount_note, '')
  FROM links WHERE source = 'op_maria_do_socorro_santiago' AND target = 'esquema_faroeste' AND type = 'transaction' AND status = 'convicted_appealing' AND COALESCE(year, -1) = 2026
ON CONFLICT(link_id, lang) DO NOTHING;
INSERT INTO link_translations (link_id, lang, relation, amount, amount_note, source_text)
SELECT id, 'es', 'Desembargadora condenada el 21 de octubre de 2026 por la Corte Especial del Superior Tribunal de Justicia (STJ) a 14 años y 11 meses de prisión, en régimen inicial cerrado, por cohecho pasivo y blanqueo de capitales, con pérdida del cargo; según el Ministerio Público Federal (MPF), recibió más de 400.000 reales, pagados mediante terceros, para favorecer a una de las partes en una disputa de tierras. Según el g1, la defensa afirma que no hay prueba idónea, que la cantidad señalada como soborno fue una operación financiera declarada entre hermanos y que recurrirá.', NULL, 'Cifra citada por el MPF (más de 400.000 reales); es una cifra mínima, no el total determinado.', relation || char(10) || COALESCE(amount, '') || char(10) || COALESCE(amount_note, '')
  FROM links WHERE source = 'op_maria_do_socorro_santiago' AND target = 'esquema_faroeste' AND type = 'transaction' AND status = 'convicted_appealing' AND COALESCE(year, -1) = 2026
ON CONFLICT(link_id, lang) DO NOTHING;
INSERT INTO link_translations (link_id, lang, relation, amount, amount_note, source_text)
SELECT id, 'en', 'Retired judge convicted on 21 October 2026 by the Special Court of the Superior Court of Justice (STJ) and sentenced to 15 years and 8 months in prison, to be served initially in a closed regime, for passive corruption and money laundering, with loss of office converted into revocation of his retirement; according to the Federal Prosecution Service (MPF), he received more than R$ 600,000, paid through third parties, to favour one party in a land dispute. According to g1, the defence says he is innocent, that his rulings were lawful and that it will seek to overturn the conviction.', NULL, 'Figure cited by the MPF (more than R$ 600,000); a minimum figure, not the total established.', relation || char(10) || COALESCE(amount, '') || char(10) || COALESCE(amount_note, '')
  FROM links WHERE source = 'op_sergio_sampaio' AND target = 'esquema_faroeste' AND type = 'transaction' AND status = 'convicted_appealing' AND COALESCE(year, -1) = 2026
ON CONFLICT(link_id, lang) DO NOTHING;
INSERT INTO link_translations (link_id, lang, relation, amount, amount_note, source_text)
SELECT id, 'es', 'Juez jubilado condenado el 21 de octubre de 2026 por la Corte Especial del Superior Tribunal de Justicia (STJ) a 15 años y 8 meses de prisión, en régimen inicial cerrado, por cohecho pasivo y blanqueo de capitales, con pérdida del cargo convertida en revocación de su jubilación; según el Ministerio Público Federal (MPF), recibió más de 600.000 reales, pagados mediante terceros, para favorecer a una de las partes en una disputa de tierras. Según el g1, la defensa afirma que es inocente, que sus resoluciones fueron legales y que buscará revertir la condena.', NULL, 'Cifra citada por el MPF (más de 600.000 reales); es una cifra mínima, no el total determinado.', relation || char(10) || COALESCE(amount, '') || char(10) || COALESCE(amount_note, '')
  FROM links WHERE source = 'op_sergio_sampaio' AND target = 'esquema_faroeste' AND type = 'transaction' AND status = 'convicted_appealing' AND COALESCE(year, -1) = 2026
ON CONFLICT(link_id, lang) DO NOTHING;
INSERT INTO link_translations (link_id, lang, relation, amount, amount_note, source_text)
SELECT id, 'en', 'Retired appeal court judge (desembargadora) convicted on 4 November 2026 by the Special Court of the Superior Court of Justice (STJ) and sentenced to 14 years and 20 days in prison, to be served initially in a closed regime, for passive corruption and money laundering, with loss of office; according to the Federal Prosecution Service (MPF), she acted in cases to favour an agribusiness company in exchange for bribes received through her son. The defence argued that the rulings were lawful, that the family''s assets are consistent with declared income and that evidence is void.', NULL, 'A R$ 250,000 bribe that, according to g1, she allegedly received for giving a favourable opinion to a company; the STJ records that the Federal Police seized R$ 250,000 at her and her son''s home. It is not the R$ 2.4 million that, according to g1, was allegedly paid to the group of defendants.', relation || char(10) || COALESCE(amount, '') || char(10) || COALESCE(amount_note, '')
  FROM links WHERE source = 'op_sandra_ines_azevedo' AND target = 'esquema_faroeste' AND type = 'transaction' AND status = 'convicted_appealing' AND COALESCE(year, -1) = 2026
ON CONFLICT(link_id, lang) DO NOTHING;
INSERT INTO link_translations (link_id, lang, relation, amount, amount_note, source_text)
SELECT id, 'es', 'Desembargadora jubilada condenada el 4 de noviembre de 2026 por la Corte Especial del Superior Tribunal de Justicia (STJ) a 14 años y 20 días de prisión, en régimen inicial cerrado, por cohecho pasivo y blanqueo de capitales, con pérdida del cargo; según el Ministerio Público Federal (MPF), actuó en procesos para favorecer a una empresa agropecuaria a cambio de sobornos recibidos por medio de su hijo. La defensa alegó que las resoluciones fueron lícitas, que el patrimonio familiar es compatible con los ingresos declarados y que hay nulidad de pruebas.', NULL, 'Soborno de 250.000 reales que, según g1, habría recibido por emitir un dictamen favorable a una empresa; el STJ registra que la Policía Federal incautó 250.000 reales en la casa de ella y de su hijo. No es el total de 2,4 millones de reales que, según g1, se habrían pagado al grupo de acusados.', relation || char(10) || COALESCE(amount, '') || char(10) || COALESCE(amount_note, '')
  FROM links WHERE source = 'op_sandra_ines_azevedo' AND target = 'esquema_faroeste' AND type = 'transaction' AND status = 'convicted_appealing' AND COALESCE(year, -1) = 2026
ON CONFLICT(link_id, lang) DO NOTHING;
INSERT INTO link_translations (link_id, lang, relation, amount, amount_note, source_text)
SELECT id, 'en', 'Lawyer and son of appeal court judge (desembargadora) Sandra Inês Rusciolelli Azevedo, convicted on 4 November 2026 by the Special Court of the Superior Court of Justice (STJ) and sentenced to 13 years and 11 months in prison, to be served initially in a closed regime, for passive corruption, money laundering and criminal association; according to the STJ, the Federal Police seized R$ 250,000 at the home of the judge and her son. The sources read contain no defence on the merits: in the absence of the defendants'' lawyers, the Federal Public Defender''s Office (DPU) was appointed by the STJ to act for the defence.', NULL, NULL, relation || char(10) || COALESCE(amount, '') || char(10) || COALESCE(amount_note, '')
  FROM links WHERE source = 'op_vasco_rusciolelli' AND target = 'esquema_faroeste' AND type = 'transaction' AND status = 'convicted_appealing' AND COALESCE(year, -1) = 2026
ON CONFLICT(link_id, lang) DO NOTHING;
INSERT INTO link_translations (link_id, lang, relation, amount, amount_note, source_text)
SELECT id, 'es', 'Abogado e hijo de la desembargadora Sandra Inês Rusciolelli Azevedo, condenado el 4 de noviembre de 2026 por la Corte Especial del Superior Tribunal de Justicia (STJ) a 13 años y 11 meses de prisión, en régimen inicial cerrado, por cohecho pasivo, blanqueo de capitales y asociación criminal; según el STJ, la Policía Federal incautó 250.000 reales en la casa de la desembargadora y de su hijo. Las fuentes consultadas no recogen una defensa de fondo: en ausencia de los abogados de los acusados, la Defensoría Pública de la Unión (DPU) fue designada por el STJ para la defensa.', NULL, NULL, relation || char(10) || COALESCE(amount, '') || char(10) || COALESCE(amount_note, '')
  FROM links WHERE source = 'op_vasco_rusciolelli' AND target = 'esquema_faroeste' AND type = 'transaction' AND status = 'convicted_appealing' AND COALESCE(year, -1) = 2026
ON CONFLICT(link_id, lang) DO NOTHING;
INSERT INTO link_translations (link_id, lang, relation, amount, amount_note, source_text)
SELECT id, 'en', 'Businessman convicted on 21 October 2026 by the Special Court of the Superior Court of Justice (STJ) and sentenced to 21 years and 7 months in prison, to be served initially in a closed regime, for active corruption and money laundering; according to the rapporteur, he held a central position in the scheme and falsely presented himself as consul of Guinea-Bissau. The sources read record no statement from the defence.', NULL, NULL, relation || char(10) || COALESCE(amount, '') || char(10) || COALESCE(amount_note, '')
  FROM links WHERE source = 'op_adailton_maturino' AND target = 'esquema_faroeste' AND type = 'transaction' AND status = 'convicted_appealing' AND COALESCE(year, -1) = 2026
ON CONFLICT(link_id, lang) DO NOTHING;
INSERT INTO link_translations (link_id, lang, relation, amount, amount_note, source_text)
SELECT id, 'es', 'Empresario condenado el 21 de octubre de 2026 por la Corte Especial del Superior Tribunal de Justicia (STJ) a 21 años y 7 meses de prisión, en régimen inicial cerrado, por cohecho activo y blanqueo de capitales; según el ponente, ocupaba una posición central en la trama y se presentaba falsamente como cónsul de Guinea-Bisáu. Las fuentes consultadas no registran manifestación de la defensa.', NULL, NULL, relation || char(10) || COALESCE(amount, '') || char(10) || COALESCE(amount_note, '')
  FROM links WHERE source = 'op_adailton_maturino' AND target = 'esquema_faroeste' AND type = 'transaction' AND status = 'convicted_appealing' AND COALESCE(year, -1) = 2026
ON CONFLICT(link_id, lang) DO NOTHING;
INSERT INTO link_translations (link_id, lang, relation, amount, amount_note, source_text)
SELECT id, 'en', 'Wife of Adailton Maturino dos Santos, convicted on 21 October 2026 by the Special Court of the Superior Court of Justice (STJ) and sentenced to 16 years and 4 months in prison, to be served initially in a closed regime, for active corruption and money laundering; according to the rapporteur, she held a central position in the scheme alongside her husband. The sources read record no statement from the defence.', NULL, NULL, relation || char(10) || COALESCE(amount, '') || char(10) || COALESCE(amount_note, '')
  FROM links WHERE source = 'op_geciane_maturino' AND target = 'esquema_faroeste' AND type = 'transaction' AND status = 'convicted_appealing' AND COALESCE(year, -1) = 2026
ON CONFLICT(link_id, lang) DO NOTHING;
INSERT INTO link_translations (link_id, lang, relation, amount, amount_note, source_text)
SELECT id, 'es', 'Esposa de Adailton Maturino dos Santos, condenada el 21 de octubre de 2026 por la Corte Especial del Superior Tribunal de Justicia (STJ) a 16 años y 4 meses de prisión, en régimen inicial cerrado, por cohecho activo y blanqueo de capitales; según el ponente, ocupaba una posición central en la trama junto a su marido. Las fuentes consultadas no registran manifestación de la defensa.', NULL, NULL, relation || char(10) || COALESCE(amount, '') || char(10) || COALESCE(amount_note, '')
  FROM links WHERE source = 'op_geciane_maturino' AND target = 'esquema_faroeste' AND type = 'transaction' AND status = 'convicted_appealing' AND COALESCE(year, -1) = 2026
ON CONFLICT(link_id, lang) DO NOTHING;
INSERT INTO link_translations (link_id, lang, relation, amount, amount_note, source_text)
SELECT id, 'en', 'Lawyer convicted on 21 October 2026 by the Special Court of the Superior Court of Justice (STJ) and sentenced to 10 years and 9 months in prison, to be served initially in a closed regime, for active corruption and money laundering. The sources read record no statement from the defence.', NULL, NULL, relation || char(10) || COALESCE(amount, '') || char(10) || COALESCE(amount_note, '')
  FROM links WHERE source = 'op_ricardo_tres' AND target = 'esquema_faroeste' AND type = 'transaction' AND status = 'convicted_appealing' AND COALESCE(year, -1) = 2026
ON CONFLICT(link_id, lang) DO NOTHING;
INSERT INTO link_translations (link_id, lang, relation, amount, amount_note, source_text)
SELECT id, 'es', 'Abogado condenado el 21 de octubre de 2026 por la Corte Especial del Superior Tribunal de Justicia (STJ) a 10 años y 9 meses de prisión, en régimen inicial cerrado, por cohecho activo y blanqueo de capitales. Las fuentes consultadas no registran manifestación de la defensa.', NULL, NULL, relation || char(10) || COALESCE(amount, '') || char(10) || COALESCE(amount_note, '')
  FROM links WHERE source = 'op_ricardo_tres' AND target = 'esquema_faroeste' AND type = 'transaction' AND status = 'convicted_appealing' AND COALESCE(year, -1) = 2026
ON CONFLICT(link_id, lang) DO NOTHING;
INSERT INTO link_translations (link_id, lang, relation, amount, amount_note, source_text)
SELECT id, 'en', 'Farmer linked to Bom Jesus Agropecuária, convicted on 4 November 2026 by the Special Court of the Superior Court of Justice (STJ) and sentenced to 4 years and 1 month in prison, under a semi-open regime served at home, for active corruption and money laundering, and acquitted of criminal organisation (g1 reports a sentence of 4 years, 1 month and 20 days). According to g1, the defence says that he, like other producers in western Bahia, was a victim of an extortion scheme uncovered by the operation.', NULL, NULL, relation || char(10) || COALESCE(amount, '') || char(10) || COALESCE(amount_note, '')
  FROM links WHERE source = 'op_nelson_vigolo' AND target = 'esquema_faroeste' AND type = 'transaction' AND status = 'convicted_appealing' AND COALESCE(year, -1) = 2026
ON CONFLICT(link_id, lang) DO NOTHING;
INSERT INTO link_translations (link_id, lang, relation, amount, amount_note, source_text)
SELECT id, 'es', 'Productor rural vinculado a Bom Jesus Agropecuária, condenado el 4 de noviembre de 2026 por la Corte Especial del Superior Tribunal de Justicia (STJ) a 4 años y 1 mes de prisión, en régimen semiabierto domiciliario, por cohecho activo y blanqueo de capitales, y absuelto del delito de organización criminal (el g1 registra una pena de 4 años, 1 mes y 20 días). Según el g1, la defensa afirma que él, como otros productores del oeste de Bahía, fue víctima de un esquema de extorsión descubierto por la operación.', NULL, NULL, relation || char(10) || COALESCE(amount, '') || char(10) || COALESCE(amount_note, '')
  FROM links WHERE source = 'op_nelson_vigolo' AND target = 'esquema_faroeste' AND type = 'transaction' AND status = 'convicted_appealing' AND COALESCE(year, -1) = 2026
ON CONFLICT(link_id, lang) DO NOTHING;
INSERT INTO link_translations (link_id, lang, relation, amount, amount_note, source_text)
SELECT id, 'en', 'Lawyer convicted on 4 November 2026 by the Special Court of the Superior Court of Justice (STJ) and sentenced to 4 years and 11 months in prison, under a semi-open regime, for active corruption and money laundering, and acquitted of criminal organisation (g1 reports a sentence of 4 years, 11 months and 25 days). The g1 news outlet contacted the defence, which had not replied by the time the report was last updated.', NULL, NULL, relation || char(10) || COALESCE(amount, '') || char(10) || COALESCE(amount_note, '')
  FROM links WHERE source = 'op_vanderlei_chilante' AND target = 'esquema_faroeste' AND type = 'transaction' AND status = 'convicted_appealing' AND COALESCE(year, -1) = 2026
ON CONFLICT(link_id, lang) DO NOTHING;
INSERT INTO link_translations (link_id, lang, relation, amount, amount_note, source_text)
SELECT id, 'es', 'Abogado condenado el 4 de noviembre de 2026 por la Corte Especial del Superior Tribunal de Justicia (STJ) a 4 años y 11 meses de prisión, en régimen semiabierto, por cohecho activo y blanqueo de capitales, y absuelto del delito de organización criminal (el g1 registra una pena de 4 años, 11 meses y 25 días). El g1 contactó con la defensa, que no respondió hasta la última actualización del reportaje.', NULL, NULL, relation || char(10) || COALESCE(amount, '') || char(10) || COALESCE(amount_note, '')
  FROM links WHERE source = 'op_vanderlei_chilante' AND target = 'esquema_faroeste' AND type = 'transaction' AND status = 'convicted_appealing' AND COALESCE(year, -1) = 2026
ON CONFLICT(link_id, lang) DO NOTHING;
INSERT INTO link_translations (link_id, lang, relation, amount, amount_note, source_text)
SELECT id, 'en', 'Cooperating lawyer granted a judicial pardon on 4 November 2026 by the Special Court of the Superior Court of Justice (STJ) on account of his plea agreement, at the request also of the Federal Prosecution Service (MPF). According to his defence, the agreement was ratified by the STJ on 31 March 2020 and brought previously unknown facts to light; the content of the cooperation is an allegation by the cooperating witness.', NULL, NULL, relation || char(10) || COALESCE(amount, '') || char(10) || COALESCE(amount_note, '')
  FROM links WHERE source = 'op_julio_cesar_ferreira' AND target = 'esquema_faroeste' AND type = 'process' AND status = 'confirmed' AND COALESCE(year, -1) = 2026
ON CONFLICT(link_id, lang) DO NOTHING;
INSERT INTO link_translations (link_id, lang, relation, amount, amount_note, source_text)
SELECT id, 'es', 'Abogado colaborador al que la Corte Especial del Superior Tribunal de Justicia (STJ) concedió el perdón judicial el 4 de noviembre de 2026 por su acuerdo de colaboración, también a petición del Ministerio Público Federal (MPF). Según su defensa, el acuerdo fue homologado por el STJ el 31 de marzo de 2020 y sacó a la luz hechos hasta entonces desconocidos; el contenido de la colaboración es una alegación del delator.', NULL, NULL, relation || char(10) || COALESCE(amount, '') || char(10) || COALESCE(amount_note, '')
  FROM links WHERE source = 'op_julio_cesar_ferreira' AND target = 'esquema_faroeste' AND type = 'process' AND status = 'confirmed' AND COALESCE(year, -1) = 2026
ON CONFLICT(link_id, lang) DO NOTHING;
INSERT INTO link_translations (link_id, lang, relation, amount, amount_note, source_text)
SELECT id, 'en', 'Judge made a defendant in May 2020 by the Special Court of the Superior Court of Justice (STJ) in Operation Faroeste. The sources read record neither a ruling on the merits nor a statement from the defence.', NULL, NULL, relation || char(10) || COALESCE(amount, '') || char(10) || COALESCE(amount_note, '')
  FROM links WHERE source = 'op_marivalda_moutinho' AND target = 'esquema_faroeste' AND type = 'process' AND status = 'under_investigation' AND COALESCE(year, -1) = 2020
ON CONFLICT(link_id, lang) DO NOTHING;
INSERT INTO link_translations (link_id, lang, relation, amount, amount_note, source_text)
SELECT id, 'es', 'Jueza convertida en acusada en mayo de 2020 por la Corte Especial del Superior Tribunal de Justicia (STJ) en la Operación Faroeste. Las fuentes consultadas no registran sentencia de fondo ni manifestación de la defensa.', NULL, NULL, relation || char(10) || COALESCE(amount, '') || char(10) || COALESCE(amount_note, '')
  FROM links WHERE source = 'op_marivalda_moutinho' AND target = 'esquema_faroeste' AND type = 'process' AND status = 'under_investigation' AND COALESCE(year, -1) = 2020
ON CONFLICT(link_id, lang) DO NOTHING;
INSERT INTO link_translations (link_id, lang, relation, amount, amount_note, source_text)
SELECT id, 'en', 'Appeal court judge (desembargador) made a defendant in May 2020 by the Special Court of the Superior Court of Justice (STJ) in Operation Faroeste. The sources read record neither a ruling on the merits nor a statement from the defence; in 2026 the National Council of Justice (CNJ) reported his death, which by law extinguishes criminal liability, but the criminal decision declaring it was not found.', NULL, NULL, relation || char(10) || COALESCE(amount, '') || char(10) || COALESCE(amount_note, '')
  FROM links WHERE source = 'op_gesivaldo_britto' AND target = 'esquema_faroeste' AND type = 'process' AND status = 'under_investigation' AND COALESCE(year, -1) = 2020
ON CONFLICT(link_id, lang) DO NOTHING;
INSERT INTO link_translations (link_id, lang, relation, amount, amount_note, source_text)
SELECT id, 'es', 'Desembargador convertido en acusado en mayo de 2020 por la Corte Especial del Superior Tribunal de Justicia (STJ) en la Operación Faroeste. Las fuentes consultadas no registran sentencia de fondo ni manifestación de la defensa; en 2026 el Consejo Nacional de Justicia (CNJ) informó de su fallecimiento, que por ley extingue la responsabilidad penal, pero no se localizó la resolución penal que lo declare.', NULL, NULL, relation || char(10) || COALESCE(amount, '') || char(10) || COALESCE(amount_note, '')
  FROM links WHERE source = 'op_gesivaldo_britto' AND target = 'esquema_faroeste' AND type = 'process' AND status = 'under_investigation' AND COALESCE(year, -1) = 2020
ON CONFLICT(link_id, lang) DO NOTHING;
INSERT INTO link_translations (link_id, lang, relation, amount, amount_note, source_text)
SELECT id, 'en', 'Appeal court judge (desembargador) made a defendant in May 2020 by the Special Court of the Superior Court of Justice (STJ) in Operation Faroeste. The sources read record neither a ruling on the merits nor a statement from the defence.', NULL, NULL, relation || char(10) || COALESCE(amount, '') || char(10) || COALESCE(amount_note, '')
  FROM links WHERE source = 'op_jose_olegario_caldas' AND target = 'esquema_faroeste' AND type = 'process' AND status = 'under_investigation' AND COALESCE(year, -1) = 2020
ON CONFLICT(link_id, lang) DO NOTHING;
INSERT INTO link_translations (link_id, lang, relation, amount, amount_note, source_text)
SELECT id, 'es', 'Desembargador convertido en acusado en mayo de 2020 por la Corte Especial del Superior Tribunal de Justicia (STJ) en la Operación Faroeste. Las fuentes consultadas no registran sentencia de fondo ni manifestación de la defensa.', NULL, NULL, relation || char(10) || COALESCE(amount, '') || char(10) || COALESCE(amount_note, '')
  FROM links WHERE source = 'op_jose_olegario_caldas' AND target = 'esquema_faroeste' AND type = 'process' AND status = 'under_investigation' AND COALESCE(year, -1) = 2020
ON CONFLICT(link_id, lang) DO NOTHING;
INSERT INTO link_translations (link_id, lang, relation, amount, amount_note, source_text)
SELECT id, 'en', 'Appeal court judge (desembargadora) made a defendant in May 2020 by the Special Court of the Superior Court of Justice (STJ) in Operation Faroeste. The sources read record neither a ruling on the merits nor a statement from the defence.', NULL, NULL, relation || char(10) || COALESCE(amount, '') || char(10) || COALESCE(amount_note, '')
  FROM links WHERE source = 'op_maria_da_graca_pimentel' AND target = 'esquema_faroeste' AND type = 'process' AND status = 'under_investigation' AND COALESCE(year, -1) = 2020
ON CONFLICT(link_id, lang) DO NOTHING;
INSERT INTO link_translations (link_id, lang, relation, amount, amount_note, source_text)
SELECT id, 'es', 'Desembargadora convertida en acusada en mayo de 2020 por la Corte Especial del Superior Tribunal de Justicia (STJ) en la Operación Faroeste. Las fuentes consultadas no registran sentencia de fondo ni manifestación de la defensa.', NULL, NULL, relation || char(10) || COALESCE(amount, '') || char(10) || COALESCE(amount_note, '')
  FROM links WHERE source = 'op_maria_da_graca_pimentel' AND target = 'esquema_faroeste' AND type = 'process' AND status = 'under_investigation' AND COALESCE(year, -1) = 2020
ON CONFLICT(link_id, lang) DO NOTHING;
INSERT INTO link_translations (link_id, lang, relation, amount, amount_note, source_text)
SELECT id, 'en', 'Judge made a defendant in May 2020 by the Special Court of the Superior Court of Justice (STJ) in Operation Faroeste. The sources read record neither a ruling on the merits nor a statement from the defence.', NULL, NULL, relation || char(10) || COALESCE(amount, '') || char(10) || COALESCE(amount_note, '')
  FROM links WHERE source = 'op_marcio_braga' AND target = 'esquema_faroeste' AND type = 'process' AND status = 'under_investigation' AND COALESCE(year, -1) = 2020
ON CONFLICT(link_id, lang) DO NOTHING;
INSERT INTO link_translations (link_id, lang, relation, amount, amount_note, source_text)
SELECT id, 'es', 'Juez convertido en acusado en mayo de 2020 por la Corte Especial del Superior Tribunal de Justicia (STJ) en la Operación Faroeste. Las fuentes consultadas no registran sentencia de fondo ni manifestación de la defensa.', NULL, NULL, relation || char(10) || COALESCE(amount, '') || char(10) || COALESCE(amount_note, '')
  FROM links WHERE source = 'op_marcio_braga' AND target = 'esquema_faroeste' AND type = 'process' AND status = 'under_investigation' AND COALESCE(year, -1) = 2020
ON CONFLICT(link_id, lang) DO NOTHING;
INSERT INTO link_translations (link_id, lang, relation, amount, amount_note, source_text)
SELECT id, 'en', 'Lawyer acquitted on 21 October 2026 by the Special Court of the Superior Court of Justice (STJ), in criminal action 985, for insufficient evidence of participation in the criminal dynamics.', NULL, NULL, relation || char(10) || COALESCE(amount, '') || char(10) || COALESCE(amount_note, '')
  FROM links WHERE source = 'op_marcio_duarte_miranda' AND target = 'esquema_faroeste' AND type = 'process' AND status = 'acquitted' AND COALESCE(year, -1) = 2026
ON CONFLICT(link_id, lang) DO NOTHING;
INSERT INTO link_translations (link_id, lang, relation, amount, amount_note, source_text)
SELECT id, 'es', 'Abogado absuelto el 21 de octubre de 2026 por la Corte Especial del Superior Tribunal de Justicia (STJ), en la acción penal 985, por insuficiencia de pruebas de su participación en las dinámicas delictivas.', NULL, NULL, relation || char(10) || COALESCE(amount, '') || char(10) || COALESCE(amount_note, '')
  FROM links WHERE source = 'op_marcio_duarte_miranda' AND target = 'esquema_faroeste' AND type = 'process' AND status = 'acquitted' AND COALESCE(year, -1) = 2026
ON CONFLICT(link_id, lang) DO NOTHING;
INSERT INTO link_translations (link_id, lang, relation, amount, amount_note, source_text)
SELECT id, 'en', 'Defendant in criminal action 985, acquitted on 21 October 2026 by the Special Court of the Superior Court of Justice (STJ) for insufficient evidence of participation in the criminal dynamics. According to g1, the defence says the acquittal recognises absence of intent and of evidence and that she never committed a crime.', NULL, NULL, relation || char(10) || COALESCE(amount, '') || char(10) || COALESCE(amount_note, '')
  FROM links WHERE source = 'op_amanda_santiago' AND target = 'esquema_faroeste' AND type = 'process' AND status = 'acquitted' AND COALESCE(year, -1) = 2026
ON CONFLICT(link_id, lang) DO NOTHING;
INSERT INTO link_translations (link_id, lang, relation, amount, amount_note, source_text)
SELECT id, 'es', 'Acusada en la acción penal 985, absuelta el 21 de octubre de 2026 por la Corte Especial del Superior Tribunal de Justicia (STJ) por insuficiencia de pruebas de su participación en las dinámicas delictivas. Según el g1, la defensa afirma que la absolución reconoce la ausencia de dolo y de pruebas y que nunca cometió delito.', NULL, NULL, relation || char(10) || COALESCE(amount, '') || char(10) || COALESCE(amount_note, '')
  FROM links WHERE source = 'op_amanda_santiago' AND target = 'esquema_faroeste' AND type = 'process' AND status = 'acquitted' AND COALESCE(year, -1) = 2026
ON CONFLICT(link_id, lang) DO NOTHING;
INSERT INTO link_translations (link_id, lang, relation, amount, amount_note, source_text)
SELECT id, 'en', 'Appeal court judge (desembargadora) and former president of the TJ-BA, suspended since 2019; on 27 October 2026 the National Council of Justice (CNJ) unanimously imposed the penalty of compulsory availability (disponibilidade), with a proposal for loss of office, which depends on an action by the Office of the Attorney General of the Union (AGU) before the Supreme Federal Court (STF); in the criminal action, the STJ had already ordered loss of office, a decision subject to appeal.', NULL, NULL, relation || char(10) || COALESCE(amount, '') || char(10) || COALESCE(amount_note, '')
  FROM links WHERE source = 'op_maria_do_socorro_santiago' AND target = 'emp_tjba' AND type = 'contract' AND status = 'confirmed' AND COALESCE(year, -1) = 2026
ON CONFLICT(link_id, lang) DO NOTHING;
INSERT INTO link_translations (link_id, lang, relation, amount, amount_note, source_text)
SELECT id, 'es', 'Desembargadora y expresidenta del TJ-BA, apartada desde 2019; el 27 de octubre de 2026 el Consejo Nacional de Justicia (CNJ) le impuso, por unanimidad, la pena de disponibilidad, con propuesta de pérdida del cargo, que depende de una acción de la Abogacía General de la Unión (AGU) ante el Supremo Tribunal Federal (STF); en la acción penal, el STJ ya había decretado la pérdida del cargo, decisión que admite recurso.', NULL, NULL, relation || char(10) || COALESCE(amount, '') || char(10) || COALESCE(amount_note, '')
  FROM links WHERE source = 'op_maria_do_socorro_santiago' AND target = 'emp_tjba' AND type = 'contract' AND status = 'confirmed' AND COALESCE(year, -1) = 2026
ON CONFLICT(link_id, lang) DO NOTHING;
INSERT INTO link_translations (link_id, lang, relation, amount, amount_note, source_text)
SELECT id, 'en', 'Retired judge of the TJ-BA; on 27 October 2026 the National Council of Justice (CNJ) unanimously imposed the penalty of compulsory availability (disponibilidade), with a proposal for loss of office, which depends on an action by the Office of the Attorney General of the Union (AGU) before the Supreme Federal Court (STF); in the criminal action, the STJ had already ordered loss of office, a decision subject to appeal.', NULL, NULL, relation || char(10) || COALESCE(amount, '') || char(10) || COALESCE(amount_note, '')
  FROM links WHERE source = 'op_sergio_sampaio' AND target = 'emp_tjba' AND type = 'contract' AND status = 'confirmed' AND COALESCE(year, -1) = 2026
ON CONFLICT(link_id, lang) DO NOTHING;
INSERT INTO link_translations (link_id, lang, relation, amount, amount_note, source_text)
SELECT id, 'es', 'Juez jubilado del TJ-BA; el 27 de octubre de 2026 el Consejo Nacional de Justicia (CNJ) le impuso, por unanimidad, la pena de disponibilidad, con propuesta de pérdida del cargo, que depende de una acción de la Abogacía General de la Unión (AGU) ante el Supremo Tribunal Federal (STF); en la acción penal, el STJ ya había decretado la pérdida del cargo, decisión que admite recurso.', NULL, NULL, relation || char(10) || COALESCE(amount, '') || char(10) || COALESCE(amount_note, '')
  FROM links WHERE source = 'op_sergio_sampaio' AND target = 'emp_tjba' AND type = 'contract' AND status = 'confirmed' AND COALESCE(year, -1) = 2026
ON CONFLICT(link_id, lang) DO NOTHING;
INSERT INTO link_translations (link_id, lang, relation, amount, amount_note, source_text)
SELECT id, 'en', 'Appeal court judge (desembargadora) of the TJ-BA, suspended since 2020 and compulsorily retired by the National Council of Justice (CNJ), unanimously, in December 2024, in administrative disciplinary proceedings; on 4 November 2026, in the criminal action, the STJ ordered loss of office, a decision subject to appeal.', NULL, NULL, relation || char(10) || COALESCE(amount, '') || char(10) || COALESCE(amount_note, '')
  FROM links WHERE source = 'op_sandra_ines_azevedo' AND target = 'emp_tjba' AND type = 'contract' AND status = 'confirmed' AND COALESCE(year, -1) = 2024
ON CONFLICT(link_id, lang) DO NOTHING;
INSERT INTO link_translations (link_id, lang, relation, amount, amount_note, source_text)
SELECT id, 'es', 'Desembargadora del TJ-BA, apartada desde 2020 y jubilada forzosamente por el Consejo Nacional de Justicia (CNJ), por unanimidad, en diciembre de 2024, en un proceso administrativo disciplinario; el 4 de noviembre de 2026, en la acción penal, el STJ decretó la pérdida del cargo, decisión que admite recurso.', NULL, NULL, relation || char(10) || COALESCE(amount, '') || char(10) || COALESCE(amount_note, '')
  FROM links WHERE source = 'op_sandra_ines_azevedo' AND target = 'emp_tjba' AND type = 'contract' AND status = 'confirmed' AND COALESCE(year, -1) = 2024
ON CONFLICT(link_id, lang) DO NOTHING;
INSERT INTO link_translations (link_id, lang, relation, amount, amount_note, source_text)
SELECT id, 'en', 'Appeal court judge (desembargador) of the TJ-BA; on 27 October 2026 the National Council of Justice (CNJ) declared the disciplinary liability against him extinguished because of his death.', NULL, NULL, relation || char(10) || COALESCE(amount, '') || char(10) || COALESCE(amount_note, '')
  FROM links WHERE source = 'op_gesivaldo_britto' AND target = 'emp_tjba' AND type = 'contract' AND status = 'confirmed' AND COALESCE(year, -1) = 2026
ON CONFLICT(link_id, lang) DO NOTHING;
INSERT INTO link_translations (link_id, lang, relation, amount, amount_note, source_text)
SELECT id, 'es', 'Desembargador del TJ-BA; el 27 de octubre de 2026 el Consejo Nacional de Justicia (CNJ) declaró extinguida la pretensión punitiva disciplinar contra él por su fallecimiento.', NULL, NULL, relation || char(10) || COALESCE(amount, '') || char(10) || COALESCE(amount_note, '')
  FROM links WHERE source = 'op_gesivaldo_britto' AND target = 'emp_tjba' AND type = 'contract' AND status = 'confirmed' AND COALESCE(year, -1) = 2026
ON CONFLICT(link_id, lang) DO NOTHING;
INSERT INTO link_translations (link_id, lang, relation, amount, amount_note, source_text)
SELECT id, 'en', 'Judge of the TJ-BA; on 27 October 2026 the National Council of Justice (CNJ) unanimously imposed the penalty of compulsory availability (disponibilidade), with immediate removal from duties and a proposal for loss of office, which depends on an action by the Office of the Attorney General of the Union (AGU) before the Supreme Federal Court (STF).', NULL, NULL, relation || char(10) || COALESCE(amount, '') || char(10) || COALESCE(amount_note, '')
  FROM links WHERE source = 'op_marivalda_moutinho' AND target = 'emp_tjba' AND type = 'contract' AND status = 'confirmed' AND COALESCE(year, -1) = 2026
ON CONFLICT(link_id, lang) DO NOTHING;
INSERT INTO link_translations (link_id, lang, relation, amount, amount_note, source_text)
SELECT id, 'es', 'Jueza del TJ-BA; el 27 de octubre de 2026 el Consejo Nacional de Justicia (CNJ) le impuso, por unanimidad, la pena de disponibilidad, con apartamiento inmediato y propuesta de pérdida del cargo, que depende de una acción de la Abogacía General de la Unión (AGU) ante el Supremo Tribunal Federal (STF).', NULL, NULL, relation || char(10) || COALESCE(amount, '') || char(10) || COALESCE(amount_note, '')
  FROM links WHERE source = 'op_marivalda_moutinho' AND target = 'emp_tjba' AND type = 'contract' AND status = 'confirmed' AND COALESCE(year, -1) = 2026
ON CONFLICT(link_id, lang) DO NOTHING;
INSERT INTO link_translations (link_id, lang, relation, amount, amount_note, source_text)
SELECT id, 'en', 'Appeal court judge (desembargador) of the TJ-BA; on 27 October 2026 the National Council of Justice (CNJ) unanimously imposed the penalty of compulsory availability (disponibilidade), with a proposal for loss of office, which depends on an action by the Office of the Attorney General of the Union (AGU) before the Supreme Federal Court (STF).', NULL, NULL, relation || char(10) || COALESCE(amount, '') || char(10) || COALESCE(amount_note, '')
  FROM links WHERE source = 'op_jose_olegario_caldas' AND target = 'emp_tjba' AND type = 'contract' AND status = 'confirmed' AND COALESCE(year, -1) = 2026
ON CONFLICT(link_id, lang) DO NOTHING;
INSERT INTO link_translations (link_id, lang, relation, amount, amount_note, source_text)
SELECT id, 'es', 'Desembargador del TJ-BA; el 27 de octubre de 2026 el Consejo Nacional de Justicia (CNJ) le impuso, por unanimidad, la pena de disponibilidad, con propuesta de pérdida del cargo, que depende de una acción de la Abogacía General de la Unión (AGU) ante el Supremo Tribunal Federal (STF).', NULL, NULL, relation || char(10) || COALESCE(amount, '') || char(10) || COALESCE(amount_note, '')
  FROM links WHERE source = 'op_jose_olegario_caldas' AND target = 'emp_tjba' AND type = 'contract' AND status = 'confirmed' AND COALESCE(year, -1) = 2026
ON CONFLICT(link_id, lang) DO NOTHING;
INSERT INTO link_translations (link_id, lang, relation, amount, amount_note, source_text)
SELECT id, 'en', 'Appeal court judge (desembargadora) of the TJ-BA; on 27 October 2026 the National Council of Justice (CNJ) unanimously imposed the penalty of compulsory availability (disponibilidade), with a proposal for loss of office, which depends on an action by the Office of the Attorney General of the Union (AGU) before the Supreme Federal Court (STF).', NULL, NULL, relation || char(10) || COALESCE(amount, '') || char(10) || COALESCE(amount_note, '')
  FROM links WHERE source = 'op_maria_da_graca_pimentel' AND target = 'emp_tjba' AND type = 'contract' AND status = 'confirmed' AND COALESCE(year, -1) = 2026
ON CONFLICT(link_id, lang) DO NOTHING;
INSERT INTO link_translations (link_id, lang, relation, amount, amount_note, source_text)
SELECT id, 'es', 'Desembargadora del TJ-BA; el 27 de octubre de 2026 el Consejo Nacional de Justicia (CNJ) le impuso, por unanimidad, la pena de disponibilidad, con propuesta de pérdida del cargo, que depende de una acción de la Abogacía General de la Unión (AGU) ante el Supremo Tribunal Federal (STF).', NULL, NULL, relation || char(10) || COALESCE(amount, '') || char(10) || COALESCE(amount_note, '')
  FROM links WHERE source = 'op_maria_da_graca_pimentel' AND target = 'emp_tjba' AND type = 'contract' AND status = 'confirmed' AND COALESCE(year, -1) = 2026
ON CONFLICT(link_id, lang) DO NOTHING;
INSERT INTO link_translations (link_id, lang, relation, amount, amount_note, source_text)
SELECT id, 'en', 'Judge of the TJ-BA; on 27 October 2026 the National Council of Justice (CNJ) dismissed the disciplinary charges against him and ordered the proceedings against him to be closed.', NULL, NULL, relation || char(10) || COALESCE(amount, '') || char(10) || COALESCE(amount_note, '')
  FROM links WHERE source = 'op_marcio_braga' AND target = 'emp_tjba' AND type = 'contract' AND status = 'confirmed' AND COALESCE(year, -1) = 2026
ON CONFLICT(link_id, lang) DO NOTHING;
INSERT INTO link_translations (link_id, lang, relation, amount, amount_note, source_text)
SELECT id, 'es', 'Juez del TJ-BA; el 27 de octubre de 2026 el Consejo Nacional de Justicia (CNJ) declaró improcedentes las imputaciones disciplinarias contra él y ordenó archivar el proceso en relación con él.', NULL, NULL, relation || char(10) || COALESCE(amount, '') || char(10) || COALESCE(amount_note, '')
  FROM links WHERE source = 'op_marcio_braga' AND target = 'emp_tjba' AND type = 'contract' AND status = 'confirmed' AND COALESCE(year, -1) = 2026
ON CONFLICT(link_id, lang) DO NOTHING;
