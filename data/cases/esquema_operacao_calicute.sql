-- Operação Calicute (esquema_operacao_calicute). Gerado em 2026-11-24 a partir do Master Prompt v6, após revisão independente.
-- Aplicar no D1 nesta ordem (já está no arquivo): nodes, links, scheme_timelines, node_translations, link_translations.
-- Idempotente: vínculos com guarda NOT EXISTS; linha do tempo com INSERT OR REPLACE; traduções com ON CONFLICT DO NOTHING.
-- Requer as migrações 0007 (amount_kind) e 0010 (scheme_timelines).

-- INSERÇÃO DE ENTIDADES (NODES)
INSERT OR IGNORE INTO nodes (id, label, type, party, image_url, summary, image_credit, image_source_url) VALUES
('esquema_operacao_calicute', 'Operação Calicute', 'scheme', NULL, NULL, 'Operação da Polícia Federal e do MPF deflagrada em 17 de novembro de 2016, desdobramento da Lava Jato no Rio de Janeiro, sobre propinas de empreiteiras em obras do governo estadual, como a reforma do Maracanã, o PAC Favelas e o Arco Metropolitano.', NULL, NULL),
('pol_sergio_cabral', 'Sérgio Cabral', 'politician', 'PMDB', NULL, 'Ex-governador do Rio de Janeiro (2007–2014).', NULL, NULL),
('op_adriana_ancelmo', 'Adriana Ancelmo', 'operator', NULL, NULL, 'Advogada, titular do escritório Ancelmo Advogados; foi primeira-dama do Rio de Janeiro durante o governo de Sérgio Cabral.', NULL, NULL),
('op_wilson_carlos', 'Wilson Carlos', 'operator', NULL, NULL, 'Ex-secretário de Governo do Rio de Janeiro na gestão de Sérgio Cabral.', NULL, NULL),
('op_hudson_braga', 'Hudson Braga', 'operator', NULL, NULL, 'Ex-secretário de Obras do Rio de Janeiro na gestão de Sérgio Cabral.', NULL, NULL),
('op_carlos_miranda', 'Carlos Miranda', 'operator', NULL, NULL, 'Sócio de Sérgio Cabral na empresa SCF Comunicação.', NULL, NULL),
('emp_andrade_gutierrez', 'Andrade Gutierrez', 'company', NULL, NULL, 'Empreiteira brasileira de grande porte, com contratos de obras públicas em vários estados.', NULL, NULL),
('emp_carioca_engenharia', 'Carioca Engenharia', 'company', NULL, NULL, 'Construtora com sede no Rio de Janeiro, responsável por obras públicas como a Linha 4 do Metrô.', NULL, NULL);

-- INSERÇÃO DE CONEXÕES (LINKS) — um comando por vínculo, com guarda contra duplicação
INSERT INTO links (source, target, relation, type, status, amount, amount_brl, amount_note, year, source_url, reviewed_at, amount_kind)
SELECT 'pol_sergio_cabral', 'par_pmdb', 'Ex-governador do Rio de Janeiro, filiado ao PMDB quando foi condenado na Operação Calicute, em 2017.', 'process', 'confirmed', NULL, NULL, NULL, 2017, 'https://www1.folha.uol.com.br/poder/2017/09/1920321-cabral-e-condenado-a-45-anos-de-prisao-a-maior-pena-da-lava-jato.shtml', '2026-11-24', NULL
WHERE NOT EXISTS (SELECT 1 FROM links WHERE source = 'pol_sergio_cabral' AND target = 'par_pmdb' AND type = 'process' AND status = 'confirmed' AND COALESCE(year, -1) = 2017);
INSERT INTO links (source, target, relation, type, status, amount, amount_brl, amount_note, year, source_url, reviewed_at, amount_kind)
SELECT 'pol_sergio_cabral', 'esquema_operacao_calicute', 'Condenado em primeira instância pelo juiz Marcelo Bretas (2017) a 45 anos e 2 meses por corrupção, lavagem de dinheiro e associação criminosa; em dezembro de 2018 o TRF-2 manteve a condenação e fixou a pena em 45 anos e 9 meses. A defesa afirmava que ele era inocente; em 2019 Cabral admitiu ter recebido propinas e, depois de deixar a prisão, em dezembro de 2022, voltou a negar as denúncias.', 'process', 'convicted_appealing', NULL, NULL, NULL, 2018, 'https://noticias.uol.com.br/politica/ultimas-noticias/2018/12/04/pena-sergio-cabral-adriana-ancelmo-segunda-instancia-prisao.htm', '2026-11-24', NULL
WHERE NOT EXISTS (SELECT 1 FROM links WHERE source = 'pol_sergio_cabral' AND target = 'esquema_operacao_calicute' AND type = 'process' AND status = 'convicted_appealing' AND COALESCE(year, -1) = 2018);
INSERT INTO links (source, target, relation, type, status, amount, amount_brl, amount_note, year, source_url, reviewed_at, amount_kind)
SELECT 'pol_sergio_cabral', 'esquema_operacao_calicute', 'No braço de Curitiba da operação, foi condenado por Sergio Moro (2017) a 14 anos e 2 meses, pena mantida pelo TRF-4, sob acusação de receber R$ 2,7 milhões de propina da Andrade Gutierrez por obras do Comperj. Em maio de 2023 o juiz Eduardo Appio anulou a sentença a pedido da defesa, que alegou parcialidade de Moro, mas o TRF-4 derrubou a anulação dias depois, por haver arguição de suspeição contra Appio.', 'process', 'convicted_appealing', NULL, NULL, NULL, 2023, 'https://g1.globo.com/rs/rio-grande-do-sul/noticia/2023/05/16/trf-4-derruba-decisao-de-juiz-que-anulou-sentenca-de-moro-contra-cabral.ghtml', '2026-11-24', NULL
WHERE NOT EXISTS (SELECT 1 FROM links WHERE source = 'pol_sergio_cabral' AND target = 'esquema_operacao_calicute' AND type = 'process' AND status = 'convicted_appealing' AND COALESCE(year, -1) = 2023);
INSERT INTO links (source, target, relation, type, status, amount, amount_brl, amount_note, year, source_url, reviewed_at, amount_kind)
SELECT 'op_adriana_ancelmo', 'esquema_operacao_calicute', 'Condenada em primeira instância (2017) a 18 anos e 3 meses por organização criminosa e lavagem de dinheiro; em dezembro de 2018 o TRF-2 manteve a condenação e reduziu a pena para 12 anos e 11 meses. Após a sentença de 2017, a defesa afirmou que ela era divorciada das provas.', 'process', 'convicted_appealing', NULL, NULL, NULL, 2018, 'https://noticias.uol.com.br/politica/ultimas-noticias/2018/12/04/pena-sergio-cabral-adriana-ancelmo-segunda-instancia-prisao.htm', '2026-11-24', NULL
WHERE NOT EXISTS (SELECT 1 FROM links WHERE source = 'op_adriana_ancelmo' AND target = 'esquema_operacao_calicute' AND type = 'process' AND status = 'convicted_appealing' AND COALESCE(year, -1) = 2018);
INSERT INTO links (source, target, relation, type, status, amount, amount_brl, amount_note, year, source_url, reviewed_at, amount_kind)
SELECT 'op_wilson_carlos', 'esquema_operacao_calicute', 'Ex-secretário de Governo, apontado pela PF como responsável pelo núcleo administrativo do esquema; condenado em primeira instância (2017) e, em dezembro de 2018, pelo TRF-2, que fixou a pena em 18 anos e 1 mês. A posição da defesa não foi localizada nas fontes lidas.', 'process', 'convicted_appealing', NULL, NULL, NULL, 2018, 'https://noticias.uol.com.br/politica/ultimas-noticias/2018/12/04/pena-sergio-cabral-adriana-ancelmo-segunda-instancia-prisao.htm', '2026-11-24', NULL
WHERE NOT EXISTS (SELECT 1 FROM links WHERE source = 'op_wilson_carlos' AND target = 'esquema_operacao_calicute' AND type = 'process' AND status = 'convicted_appealing' AND COALESCE(year, -1) = 2018);
INSERT INTO links (source, target, relation, type, status, amount, amount_brl, amount_note, year, source_url, reviewed_at, amount_kind)
SELECT 'op_hudson_braga', 'esquema_operacao_calicute', 'Ex-secretário de Obras, apontado pela PF como responsável pelo núcleo administrativo do esquema; condenado em primeira instância (2017) e, em dezembro de 2018, pelo TRF-2, que fixou a pena em 18 anos e 4 meses. A posição da defesa não foi localizada nas fontes lidas.', 'process', 'convicted_appealing', NULL, NULL, NULL, 2018, 'https://noticias.uol.com.br/politica/ultimas-noticias/2018/12/04/pena-sergio-cabral-adriana-ancelmo-segunda-instancia-prisao.htm', '2026-11-24', NULL
WHERE NOT EXISTS (SELECT 1 FROM links WHERE source = 'op_hudson_braga' AND target = 'esquema_operacao_calicute' AND type = 'process' AND status = 'convicted_appealing' AND COALESCE(year, -1) = 2018);
INSERT INTO links (source, target, relation, type, status, amount, amount_brl, amount_note, year, source_url, reviewed_at, amount_kind)
SELECT 'op_carlos_miranda', 'esquema_operacao_calicute', 'Apontado pela PF como integrante do núcleo operacional do esquema; condenado em primeira instância (2017), teve a condenação confirmada pelo TRF-2 em dezembro de 2018. Tornou-se colaborador: fechou acordo de delação premiada com o MPF, homologado pelo STF em dezembro de 2017.', 'process', 'convicted_appealing', NULL, NULL, NULL, 2018, 'https://noticias.uol.com.br/ultimas-noticias/agencia-estado/2018/12/19/trf2-diz-que-decisao-de-marco-aurelio-mello-nao-atinge-sergio-cabral.htm', '2026-11-24', NULL
WHERE NOT EXISTS (SELECT 1 FROM links WHERE source = 'op_carlos_miranda' AND target = 'esquema_operacao_calicute' AND type = 'process' AND status = 'convicted_appealing' AND COALESCE(year, -1) = 2018);
INSERT INTO links (source, target, relation, type, status, amount, amount_brl, amount_note, year, source_url, reviewed_at, amount_kind)
SELECT 'emp_andrade_gutierrez', 'esquema_operacao_calicute', 'Segundo delação dos executivos Rogério Nora de Sá e Clóvis Primo, Cabral cobrou 5% do valor do contrato para permitir que a empreiteira se associasse à Odebrecht e à Delta no consórcio da reforma do Maracanã, em 2009; na época, Cabral negou. A empresa colaborou com as investigações: seus executivos fecharam delação, e ela firmou em 2016 acordo de leniência com o MPF.', 'transaction', 'under_investigation', NULL, NULL, NULL, 2009, 'https://g1.globo.com/rio-de-janeiro/noticia/2016/11/ex-governador-sergio-cabral-e-preso-pela-pf-na-zona-sul-do-rio.html', '2026-11-24', NULL
WHERE NOT EXISTS (SELECT 1 FROM links WHERE source = 'emp_andrade_gutierrez' AND target = 'esquema_operacao_calicute' AND type = 'transaction' AND status = 'under_investigation' AND COALESCE(year, -1) = 2009);
INSERT INTO links (source, target, relation, type, status, amount, amount_brl, amount_note, year, source_url, reviewed_at, amount_kind)
SELECT 'emp_carioca_engenharia', 'esquema_operacao_calicute', 'Segundo as investigações descritas pelo G1 na deflagração da operação, a Carioca Engenharia teria pago mais de R$ 176 milhões em propina ao grupo de Cabral; a delação da empreiteira foi uma das bases da operação. A empresa colaborou com as investigações.', 'transaction', 'under_investigation', 'R$ 176.000.000', 176000000, 'Cifra das investigações relatada pelo G1 em 2016; Ricardo Pernambuco, então controlador da empresa, disse em colaboração premiada que a propina paga a Cabral chegou a R$ 30 milhões (G1, 2021)', 2016, 'https://g1.globo.com/rio-de-janeiro/noticia/2016/11/ex-governador-sergio-cabral-e-preso-pela-pf-na-zona-sul-do-rio.html', '2026-11-24', 'bribe'
WHERE NOT EXISTS (SELECT 1 FROM links WHERE source = 'emp_carioca_engenharia' AND target = 'esquema_operacao_calicute' AND type = 'transaction' AND status = 'under_investigation' AND COALESCE(year, -1) = 2016);
INSERT INTO links (source, target, relation, type, status, amount, amount_brl, amount_note, year, source_url, reviewed_at, amount_kind)
SELECT 'esquema_operacao_calicute', 'esquema_lava_jato', 'Desdobramento da Lava Jato, deflagrado em 17 de novembro de 2016 em ação coordenada das forças-tarefa do Rio de Janeiro e do Paraná, com mandados dos juízes Marcelo Bretas e Sergio Moro.', 'process', 'confirmed', NULL, NULL, NULL, 2016, 'https://g1.globo.com/rio-de-janeiro/noticia/2016/11/ex-governador-sergio-cabral-e-preso-pela-pf-na-zona-sul-do-rio.html', '2026-11-24', NULL
WHERE NOT EXISTS (SELECT 1 FROM links WHERE source = 'esquema_operacao_calicute' AND target = 'esquema_lava_jato' AND type = 'process' AND status = 'confirmed' AND COALESCE(year, -1) = 2016);
INSERT INTO links (source, target, relation, type, status, amount, amount_brl, amount_note, year, source_url, reviewed_at, amount_kind)
SELECT 'par_pmdb', 'esquema_operacao_calicute', 'Partido do ex-governador Sérgio Cabral à época da condenação. As fontes lidas não registram acusação ao partido como instituição.', 'process', 'confirmed', NULL, NULL, NULL, 2017, 'https://www1.folha.uol.com.br/poder/2017/09/1920321-cabral-e-condenado-a-45-anos-de-prisao-a-maior-pena-da-lava-jato.shtml', '2026-11-24', NULL
WHERE NOT EXISTS (SELECT 1 FROM links WHERE source = 'par_pmdb' AND target = 'esquema_operacao_calicute' AND type = 'process' AND status = 'confirmed' AND COALESCE(year, -1) = 2017);

-- LINHA DO TEMPO (scheme_timelines, migração 0010) — cópia em data/schemeDetails.ts (timeline)
INSERT OR REPLACE INTO scheme_timelines (scheme_id, start_date, start_basis, start_source_url, start_note, end_date, end_basis, end_source_url, end_note, exposed_date, exposed_basis, exposed_source_url, exposed_note)
VALUES ('esquema_operacao_calicute', '2007', 'first_known_act', 'https://g1.globo.com/rio-de-janeiro/noticia/cabral-e-condenado-a-45-anos-de-prisao-por-crimes-investigados-na-operacao-calicute.ghtml', 'Segundo a sentença, Cabral pediu propina a Rogério Nora (Andrade Gutierrez) em reunião no início de 2007.', '2016-11-17', 'police_investigation', 'https://g1.globo.com/rio-de-janeiro/noticia/2016/11/ex-governador-sergio-cabral-e-preso-pela-pf-na-zona-sul-do-rio.html', 'Deflagração da operação e prisão de Cabral.', NULL, NULL, NULL, NULL);

-- TRADUÇÕES DE ENTIDADES
INSERT INTO node_translations (node_id, lang, label, summary, source_text)
SELECT id, 'en', 'Operation Calicute', 'Federal Police and Federal Prosecution Service (MPF) operation launched on 17 November 2016, an offshoot of Operation Car Wash (Lava Jato) in Rio de Janeiro, into bribes paid by construction companies on state government works such as the refurbishment of the Maracanã stadium, the PAC Favelas programme and the Arco Metropolitano ring road.', label || char(10) || COALESCE(summary, '') FROM nodes WHERE id = 'esquema_operacao_calicute'
ON CONFLICT(node_id, lang) DO NOTHING;
INSERT INTO node_translations (node_id, lang, label, summary, source_text)
SELECT id, 'es', 'Operación Calicute', 'Operación de la Policía Federal y del Ministerio Público Federal (MPF) iniciada el 17 de noviembre de 2016, derivación de la Operación Lava Jato en Río de Janeiro, sobre sobornos de constructoras en obras del gobierno estatal, como la reforma del estadio Maracaná, el programa PAC Favelas y la autopista Arco Metropolitano.', label || char(10) || COALESCE(summary, '') FROM nodes WHERE id = 'esquema_operacao_calicute'
ON CONFLICT(node_id, lang) DO NOTHING;
INSERT INTO node_translations (node_id, lang, label, summary, source_text)
SELECT id, 'en', NULL, 'Former governor of Rio de Janeiro (2007–2014).', label || char(10) || COALESCE(summary, '') FROM nodes WHERE id = 'pol_sergio_cabral'
ON CONFLICT(node_id, lang) DO NOTHING;
INSERT INTO node_translations (node_id, lang, label, summary, source_text)
SELECT id, 'es', NULL, 'Exgobernador de Río de Janeiro (2007–2014).', label || char(10) || COALESCE(summary, '') FROM nodes WHERE id = 'pol_sergio_cabral'
ON CONFLICT(node_id, lang) DO NOTHING;
INSERT INTO node_translations (node_id, lang, label, summary, source_text)
SELECT id, 'en', NULL, 'Lawyer who heads the Ancelmo Advogados law firm; she was first lady of Rio de Janeiro during the Sérgio Cabral government.', label || char(10) || COALESCE(summary, '') FROM nodes WHERE id = 'op_adriana_ancelmo'
ON CONFLICT(node_id, lang) DO NOTHING;
INSERT INTO node_translations (node_id, lang, label, summary, source_text)
SELECT id, 'es', NULL, 'Abogada, titular del bufete Ancelmo Advogados; fue primera dama de Río de Janeiro durante el gobierno de Sérgio Cabral.', label || char(10) || COALESCE(summary, '') FROM nodes WHERE id = 'op_adriana_ancelmo'
ON CONFLICT(node_id, lang) DO NOTHING;
INSERT INTO node_translations (node_id, lang, label, summary, source_text)
SELECT id, 'en', NULL, 'Former Secretary of Government of Rio de Janeiro under Sérgio Cabral.', label || char(10) || COALESCE(summary, '') FROM nodes WHERE id = 'op_wilson_carlos'
ON CONFLICT(node_id, lang) DO NOTHING;
INSERT INTO node_translations (node_id, lang, label, summary, source_text)
SELECT id, 'es', NULL, 'Exsecretario de Gobierno de Río de Janeiro durante la gestión de Sérgio Cabral.', label || char(10) || COALESCE(summary, '') FROM nodes WHERE id = 'op_wilson_carlos'
ON CONFLICT(node_id, lang) DO NOTHING;
INSERT INTO node_translations (node_id, lang, label, summary, source_text)
SELECT id, 'en', NULL, 'Former Secretary of Public Works of Rio de Janeiro under Sérgio Cabral.', label || char(10) || COALESCE(summary, '') FROM nodes WHERE id = 'op_hudson_braga'
ON CONFLICT(node_id, lang) DO NOTHING;
INSERT INTO node_translations (node_id, lang, label, summary, source_text)
SELECT id, 'es', NULL, 'Exsecretario de Obras de Río de Janeiro durante la gestión de Sérgio Cabral.', label || char(10) || COALESCE(summary, '') FROM nodes WHERE id = 'op_hudson_braga'
ON CONFLICT(node_id, lang) DO NOTHING;
INSERT INTO node_translations (node_id, lang, label, summary, source_text)
SELECT id, 'en', NULL, 'Business partner of Sérgio Cabral in the company SCF Comunicação.', label || char(10) || COALESCE(summary, '') FROM nodes WHERE id = 'op_carlos_miranda'
ON CONFLICT(node_id, lang) DO NOTHING;
INSERT INTO node_translations (node_id, lang, label, summary, source_text)
SELECT id, 'es', NULL, 'Socio de Sérgio Cabral en la empresa SCF Comunicação.', label || char(10) || COALESCE(summary, '') FROM nodes WHERE id = 'op_carlos_miranda'
ON CONFLICT(node_id, lang) DO NOTHING;
INSERT INTO node_translations (node_id, lang, label, summary, source_text)
SELECT id, 'en', NULL, 'Large Brazilian construction company with public works contracts in several states.', label || char(10) || COALESCE(summary, '') FROM nodes WHERE id = 'emp_andrade_gutierrez'
ON CONFLICT(node_id, lang) DO NOTHING;
INSERT INTO node_translations (node_id, lang, label, summary, source_text)
SELECT id, 'es', NULL, 'Gran constructora brasileña, con contratos de obras públicas en varios estados.', label || char(10) || COALESCE(summary, '') FROM nodes WHERE id = 'emp_andrade_gutierrez'
ON CONFLICT(node_id, lang) DO NOTHING;
INSERT INTO node_translations (node_id, lang, label, summary, source_text)
SELECT id, 'en', NULL, 'Construction company based in Rio de Janeiro, responsible for public works such as Metro Line 4.', label || char(10) || COALESCE(summary, '') FROM nodes WHERE id = 'emp_carioca_engenharia'
ON CONFLICT(node_id, lang) DO NOTHING;
INSERT INTO node_translations (node_id, lang, label, summary, source_text)
SELECT id, 'es', NULL, 'Constructora con sede en Río de Janeiro, responsable de obras públicas como la Línea 4 del Metro.', label || char(10) || COALESCE(summary, '') FROM nodes WHERE id = 'emp_carioca_engenharia'
ON CONFLICT(node_id, lang) DO NOTHING;

-- TRADUÇÕES DE CONEXÕES
INSERT INTO link_translations (link_id, lang, relation, amount, amount_note, source_text)
SELECT id, 'en', 'Former governor of Rio de Janeiro, a member of the PMDB when he was convicted in Operation Calicute in 2017.', NULL, NULL,
       relation || char(10) || COALESCE(amount, '') || char(10) || COALESCE(amount_note, '')
  FROM links WHERE source = 'pol_sergio_cabral' AND target = 'par_pmdb' AND type = 'process' AND status = 'confirmed' AND COALESCE(year, -1) = 2017
ON CONFLICT(link_id, lang) DO NOTHING;
INSERT INTO link_translations (link_id, lang, relation, amount, amount_note, source_text)
SELECT id, 'es', 'Exgobernador de Río de Janeiro, afiliado al PMDB cuando fue condenado en la Operación Calicute, en 2017.', NULL, NULL,
       relation || char(10) || COALESCE(amount, '') || char(10) || COALESCE(amount_note, '')
  FROM links WHERE source = 'pol_sergio_cabral' AND target = 'par_pmdb' AND type = 'process' AND status = 'confirmed' AND COALESCE(year, -1) = 2017
ON CONFLICT(link_id, lang) DO NOTHING;
INSERT INTO link_translations (link_id, lang, relation, amount, amount_note, source_text)
SELECT id, 'en', 'Convicted at first instance by Judge Marcelo Bretas (2017) and sentenced to 45 years and 2 months for corruption, money laundering and criminal association; in December 2018 the Federal Regional Court of the 2nd Region (TRF-2) upheld the conviction and set the sentence at 45 years and 9 months. The defence maintained that he was innocent; in 2019 Cabral admitted to receiving bribes and, after leaving prison in December 2022, again denied the accusations.', NULL, NULL,
       relation || char(10) || COALESCE(amount, '') || char(10) || COALESCE(amount_note, '')
  FROM links WHERE source = 'pol_sergio_cabral' AND target = 'esquema_operacao_calicute' AND type = 'process' AND status = 'convicted_appealing' AND COALESCE(year, -1) = 2018
ON CONFLICT(link_id, lang) DO NOTHING;
INSERT INTO link_translations (link_id, lang, relation, amount, amount_note, source_text)
SELECT id, 'es', 'Condenado en primera instancia por el juez Marcelo Bretas (2017) a 45 años y 2 meses por corrupción, blanqueo de capitales y asociación criminal; en diciembre de 2018 el Tribunal Regional Federal de la 2.ª Región (TRF-2) mantuvo la condena y fijó la pena en 45 años y 9 meses. La defensa sostenía que era inocente; en 2019 Cabral admitió haber recibido sobornos y, tras salir de prisión en diciembre de 2022, volvió a negar las acusaciones.', NULL, NULL,
       relation || char(10) || COALESCE(amount, '') || char(10) || COALESCE(amount_note, '')
  FROM links WHERE source = 'pol_sergio_cabral' AND target = 'esquema_operacao_calicute' AND type = 'process' AND status = 'convicted_appealing' AND COALESCE(year, -1) = 2018
ON CONFLICT(link_id, lang) DO NOTHING;
INSERT INTO link_translations (link_id, lang, relation, amount, amount_note, source_text)
SELECT id, 'en', 'In the Curitiba branch of the operation, he was convicted by Sergio Moro (2017) and sentenced to 14 years and 2 months, a sentence upheld by the TRF-4, on charges of receiving R$ 2.7 million in bribes from Andrade Gutierrez over works at the Comperj petrochemical complex. In May 2023 Judge Eduardo Appio annulled the ruling at the request of the defence, which alleged that Moro had been partial, but the TRF-4 overturned the annulment days later because a challenge for bias was pending against Appio.', NULL, NULL,
       relation || char(10) || COALESCE(amount, '') || char(10) || COALESCE(amount_note, '')
  FROM links WHERE source = 'pol_sergio_cabral' AND target = 'esquema_operacao_calicute' AND type = 'process' AND status = 'convicted_appealing' AND COALESCE(year, -1) = 2023
ON CONFLICT(link_id, lang) DO NOTHING;
INSERT INTO link_translations (link_id, lang, relation, amount, amount_note, source_text)
SELECT id, 'es', 'En la rama de Curitiba de la operación, fue condenado por Sergio Moro (2017) a 14 años y 2 meses, pena mantenida por el TRF-4, acusado de recibir 2,7 millones de reales en sobornos de Andrade Gutierrez por obras del complejo petroquímico Comperj. En mayo de 2023 el juez Eduardo Appio anuló la sentencia a petición de la defensa, que alegó parcialidad de Moro, pero el TRF-4 revocó la anulación días después porque pesaba sobre Appio una recusación por parcialidad.', NULL, NULL,
       relation || char(10) || COALESCE(amount, '') || char(10) || COALESCE(amount_note, '')
  FROM links WHERE source = 'pol_sergio_cabral' AND target = 'esquema_operacao_calicute' AND type = 'process' AND status = 'convicted_appealing' AND COALESCE(year, -1) = 2023
ON CONFLICT(link_id, lang) DO NOTHING;
INSERT INTO link_translations (link_id, lang, relation, amount, amount_note, source_text)
SELECT id, 'en', 'Convicted at first instance (2017) and sentenced to 18 years and 3 months for criminal organisation and money laundering; in December 2018 the TRF-2 upheld the conviction and reduced the sentence to 12 years and 11 months. After the 2017 ruling, the defence said it was divorced from the evidence.', NULL, NULL,
       relation || char(10) || COALESCE(amount, '') || char(10) || COALESCE(amount_note, '')
  FROM links WHERE source = 'op_adriana_ancelmo' AND target = 'esquema_operacao_calicute' AND type = 'process' AND status = 'convicted_appealing' AND COALESCE(year, -1) = 2018
ON CONFLICT(link_id, lang) DO NOTHING;
INSERT INTO link_translations (link_id, lang, relation, amount, amount_note, source_text)
SELECT id, 'es', 'Condenada en primera instancia (2017) a 18 años y 3 meses por organización criminal y blanqueo de capitales; en diciembre de 2018 el TRF-2 mantuvo la condena y redujo la pena a 12 años y 11 meses. Tras la sentencia de 2017, la defensa afirmó que estaba divorciada de las pruebas.', NULL, NULL,
       relation || char(10) || COALESCE(amount, '') || char(10) || COALESCE(amount_note, '')
  FROM links WHERE source = 'op_adriana_ancelmo' AND target = 'esquema_operacao_calicute' AND type = 'process' AND status = 'convicted_appealing' AND COALESCE(year, -1) = 2018
ON CONFLICT(link_id, lang) DO NOTHING;
INSERT INTO link_translations (link_id, lang, relation, amount, amount_note, source_text)
SELECT id, 'en', 'Former Secretary of Government, identified by the Federal Police as responsible for the administrative core of the scheme; convicted at first instance (2017) and, in December 2018, by the TRF-2, which set the sentence at 18 years and 1 month. The position of the defence was not found in the sources read.', NULL, NULL,
       relation || char(10) || COALESCE(amount, '') || char(10) || COALESCE(amount_note, '')
  FROM links WHERE source = 'op_wilson_carlos' AND target = 'esquema_operacao_calicute' AND type = 'process' AND status = 'convicted_appealing' AND COALESCE(year, -1) = 2018
ON CONFLICT(link_id, lang) DO NOTHING;
INSERT INTO link_translations (link_id, lang, relation, amount, amount_note, source_text)
SELECT id, 'es', 'Exsecretario de Gobierno, señalado por la Policía Federal como responsable del núcleo administrativo de la trama; condenado en primera instancia (2017) y, en diciembre de 2018, por el TRF-2, que fijó la pena en 18 años y 1 mes. La posición de la defensa no se localizó en las fuentes consultadas.', NULL, NULL,
       relation || char(10) || COALESCE(amount, '') || char(10) || COALESCE(amount_note, '')
  FROM links WHERE source = 'op_wilson_carlos' AND target = 'esquema_operacao_calicute' AND type = 'process' AND status = 'convicted_appealing' AND COALESCE(year, -1) = 2018
ON CONFLICT(link_id, lang) DO NOTHING;
INSERT INTO link_translations (link_id, lang, relation, amount, amount_note, source_text)
SELECT id, 'en', 'Former Secretary of Public Works, identified by the Federal Police as responsible for the administrative core of the scheme; convicted at first instance (2017) and, in December 2018, by the TRF-2, which set the sentence at 18 years and 4 months. The position of the defence was not found in the sources read.', NULL, NULL,
       relation || char(10) || COALESCE(amount, '') || char(10) || COALESCE(amount_note, '')
  FROM links WHERE source = 'op_hudson_braga' AND target = 'esquema_operacao_calicute' AND type = 'process' AND status = 'convicted_appealing' AND COALESCE(year, -1) = 2018
ON CONFLICT(link_id, lang) DO NOTHING;
INSERT INTO link_translations (link_id, lang, relation, amount, amount_note, source_text)
SELECT id, 'es', 'Exsecretario de Obras, señalado por la Policía Federal como responsable del núcleo administrativo de la trama; condenado en primera instancia (2017) y, en diciembre de 2018, por el TRF-2, que fijó la pena en 18 años y 4 meses. La posición de la defensa no se localizó en las fuentes consultadas.', NULL, NULL,
       relation || char(10) || COALESCE(amount, '') || char(10) || COALESCE(amount_note, '')
  FROM links WHERE source = 'op_hudson_braga' AND target = 'esquema_operacao_calicute' AND type = 'process' AND status = 'convicted_appealing' AND COALESCE(year, -1) = 2018
ON CONFLICT(link_id, lang) DO NOTHING;
INSERT INTO link_translations (link_id, lang, relation, amount, amount_note, source_text)
SELECT id, 'en', 'Identified by the Federal Police as a member of the operational core of the scheme; convicted at first instance (2017), his conviction was upheld by the TRF-2 in December 2018. He became a cooperating witness: he signed a plea agreement with the Federal Prosecution Service (MPF), ratified by the Supreme Federal Court (STF) in December 2017.', NULL, NULL,
       relation || char(10) || COALESCE(amount, '') || char(10) || COALESCE(amount_note, '')
  FROM links WHERE source = 'op_carlos_miranda' AND target = 'esquema_operacao_calicute' AND type = 'process' AND status = 'convicted_appealing' AND COALESCE(year, -1) = 2018
ON CONFLICT(link_id, lang) DO NOTHING;
INSERT INTO link_translations (link_id, lang, relation, amount, amount_note, source_text)
SELECT id, 'es', 'Señalado por la Policía Federal como integrante del núcleo operativo de la trama; condenado en primera instancia (2017), el TRF-2 confirmó su condena en diciembre de 2018. Pasó a ser delator: firmó un acuerdo de colaboración con el Ministerio Público Federal (MPF), homologado por el Supremo Tribunal Federal (STF) en diciembre de 2017.', NULL, NULL,
       relation || char(10) || COALESCE(amount, '') || char(10) || COALESCE(amount_note, '')
  FROM links WHERE source = 'op_carlos_miranda' AND target = 'esquema_operacao_calicute' AND type = 'process' AND status = 'convicted_appealing' AND COALESCE(year, -1) = 2018
ON CONFLICT(link_id, lang) DO NOTHING;
INSERT INTO link_translations (link_id, lang, relation, amount, amount_note, source_text)
SELECT id, 'en', 'According to the plea deals of executives Rogério Nora de Sá and Clóvis Primo, Cabral demanded 5% of the contract value to allow the company to join Odebrecht and Delta in the consortium for the Maracanã refurbishment, in 2009; at the time, Cabral denied it. The company cooperated with the investigations: its executives signed plea deals, and in 2016 it signed a leniency agreement with the Federal Prosecution Service (MPF).', NULL, NULL,
       relation || char(10) || COALESCE(amount, '') || char(10) || COALESCE(amount_note, '')
  FROM links WHERE source = 'emp_andrade_gutierrez' AND target = 'esquema_operacao_calicute' AND type = 'transaction' AND status = 'under_investigation' AND COALESCE(year, -1) = 2009
ON CONFLICT(link_id, lang) DO NOTHING;
INSERT INTO link_translations (link_id, lang, relation, amount, amount_note, source_text)
SELECT id, 'es', 'Según la delación de los directivos Rogério Nora de Sá y Clóvis Primo, Cabral exigió el 5 % del valor del contrato para permitir que la constructora se asociara a Odebrecht y Delta en el consorcio de la reforma del Maracaná, en 2009; en su momento, Cabral lo negó. La empresa colaboró con las investigaciones: sus directivos firmaron acuerdos de colaboración y en 2016 suscribió un acuerdo de clemencia con el Ministerio Público Federal (MPF).', NULL, NULL,
       relation || char(10) || COALESCE(amount, '') || char(10) || COALESCE(amount_note, '')
  FROM links WHERE source = 'emp_andrade_gutierrez' AND target = 'esquema_operacao_calicute' AND type = 'transaction' AND status = 'under_investigation' AND COALESCE(year, -1) = 2009
ON CONFLICT(link_id, lang) DO NOTHING;
INSERT INTO link_translations (link_id, lang, relation, amount, amount_note, source_text)
SELECT id, 'en', 'According to the investigations described by G1 when the operation was launched, Carioca Engenharia allegedly paid more than R$ 176 million in bribes to the Cabral group; the plea deal of the construction company was one of the bases of the operation. The company cooperated with the investigations.', NULL, 'Figure from the investigations reported by G1 in 2016; Ricardo Pernambuco, then controlling shareholder of the company, said in a plea agreement that the bribes paid to Cabral reached R$ 30 million (G1, 2021)',
       relation || char(10) || COALESCE(amount, '') || char(10) || COALESCE(amount_note, '')
  FROM links WHERE source = 'emp_carioca_engenharia' AND target = 'esquema_operacao_calicute' AND type = 'transaction' AND status = 'under_investigation' AND COALESCE(year, -1) = 2016
ON CONFLICT(link_id, lang) DO NOTHING;
INSERT INTO link_translations (link_id, lang, relation, amount, amount_note, source_text)
SELECT id, 'es', 'Según las investigaciones descritas por G1 al iniciarse la operación, Carioca Engenharia habría pagado más de 176 millones de reales en sobornos al grupo de Cabral; la delación de la constructora fue una de las bases de la operación. La empresa colaboró con las investigaciones.', NULL, 'Cifra de las investigaciones publicada por G1 en 2016; Ricardo Pernambuco, entonces accionista de control de la empresa, afirmó en un acuerdo de colaboración que los sobornos pagados a Cabral llegaron a 30 millones de reales (G1, 2021)',
       relation || char(10) || COALESCE(amount, '') || char(10) || COALESCE(amount_note, '')
  FROM links WHERE source = 'emp_carioca_engenharia' AND target = 'esquema_operacao_calicute' AND type = 'transaction' AND status = 'under_investigation' AND COALESCE(year, -1) = 2016
ON CONFLICT(link_id, lang) DO NOTHING;
INSERT INTO link_translations (link_id, lang, relation, amount, amount_note, source_text)
SELECT id, 'en', 'Offshoot of Operation Car Wash (Lava Jato), launched on 17 November 2016 in a coordinated action by the task forces of Rio de Janeiro and Paraná, with warrants issued by judges Marcelo Bretas and Sergio Moro.', NULL, NULL,
       relation || char(10) || COALESCE(amount, '') || char(10) || COALESCE(amount_note, '')
  FROM links WHERE source = 'esquema_operacao_calicute' AND target = 'esquema_lava_jato' AND type = 'process' AND status = 'confirmed' AND COALESCE(year, -1) = 2016
ON CONFLICT(link_id, lang) DO NOTHING;
INSERT INTO link_translations (link_id, lang, relation, amount, amount_note, source_text)
SELECT id, 'es', 'Derivación de la Operación Lava Jato, iniciada el 17 de noviembre de 2016 en una acción coordinada de los equipos especiales de Río de Janeiro y Paraná, con órdenes de los jueces Marcelo Bretas y Sergio Moro.', NULL, NULL,
       relation || char(10) || COALESCE(amount, '') || char(10) || COALESCE(amount_note, '')
  FROM links WHERE source = 'esquema_operacao_calicute' AND target = 'esquema_lava_jato' AND type = 'process' AND status = 'confirmed' AND COALESCE(year, -1) = 2016
ON CONFLICT(link_id, lang) DO NOTHING;
INSERT INTO link_translations (link_id, lang, relation, amount, amount_note, source_text)
SELECT id, 'en', 'Party of former governor Sérgio Cabral at the time of his conviction. The sources read do not record any accusation against the party as an institution.', NULL, NULL,
       relation || char(10) || COALESCE(amount, '') || char(10) || COALESCE(amount_note, '')
  FROM links WHERE source = 'par_pmdb' AND target = 'esquema_operacao_calicute' AND type = 'process' AND status = 'confirmed' AND COALESCE(year, -1) = 2017
ON CONFLICT(link_id, lang) DO NOTHING;
INSERT INTO link_translations (link_id, lang, relation, amount, amount_note, source_text)
SELECT id, 'es', 'Partido del exgobernador Sérgio Cabral en el momento de la condena. Las fuentes consultadas no registran acusación al partido como institución.', NULL, NULL,
       relation || char(10) || COALESCE(amount, '') || char(10) || COALESCE(amount_note, '')
  FROM links WHERE source = 'par_pmdb' AND target = 'esquema_operacao_calicute' AND type = 'process' AND status = 'confirmed' AND COALESCE(year, -1) = 2017
ON CONFLICT(link_id, lang) DO NOTHING;
