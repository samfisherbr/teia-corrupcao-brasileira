-- ============================================================================
-- MIGRAÇÃO 0010 — linha do tempo dos esquemas (tabela scheme_timelines)
-- ============================================================================
-- Quando cada esquema começou e quando parou (ou foi descoberto). Antes, o único
-- ano no banco era links.year, que é o ano do STATUS de um vínculo, não da
-- atividade do esquema. Regras das âncoras: cabeçalho de data/schemeDetails.ts.
--
--   start_*    quando o esquema começou a operar
--   end_*      quando a atividade parou; sem data documentada, o primeiro ato
--              oficial público (operação, CPI instalada, órgão de controle,
--              decisão judicial). Reportagem sozinha e inquérito sigiloso não
--              contam.
--   exposed_*  opcional: o primeiro ato oficial, quando veio depois do fim
--
-- FONTE DA VERDADE: esta tabela. A cópia de reserva fica em `timeline` de
-- data/schemeDetails.ts (gerada dos mesmos dados). Depois de rodar, confira:
--   npm run check:timeline-sync
--
-- Rodar:
--   npx wrangler d1 execute corruption_graph_db --remote --file=./migrations/0010_scheme_timelines.sql
-- Pode rodar de novo: CREATE TABLE IF NOT EXISTS + INSERT OR REPLACE pela chave
-- scheme_id (id de texto estável do nó, não o id autoincremento de links).
-- ============================================================================

CREATE TABLE IF NOT EXISTS scheme_timelines (
    scheme_id          TEXT PRIMARY KEY REFERENCES nodes(id),
    start_date         TEXT NOT NULL CHECK(start_date GLOB '[0-9][0-9][0-9][0-9]'
                                        OR start_date GLOB '[0-9][0-9][0-9][0-9]-[0-1][0-9]'
                                        OR start_date GLOB '[0-9][0-9][0-9][0-9]-[0-1][0-9]-[0-3][0-9]'),
    start_basis        TEXT NOT NULL CHECK(start_basis IN ('documented_start','first_known_act','enabling_act')),
    start_source_url   TEXT NOT NULL CHECK(start_source_url GLOB 'http*://*'),
    start_note         TEXT,
    end_date           TEXT NOT NULL CHECK(end_date GLOB '[0-9][0-9][0-9][0-9]'
                                        OR end_date GLOB '[0-9][0-9][0-9][0-9]-[0-1][0-9]'
                                        OR end_date GLOB '[0-9][0-9][0-9][0-9]-[0-1][0-9]-[0-3][0-9]'),
    end_basis          TEXT NOT NULL CHECK(end_basis IN ('documented_end','police_investigation','parliamentary_inquiry','oversight','court_ruling')),
    end_source_url     TEXT NOT NULL CHECK(end_source_url GLOB 'http*://*'),
    end_note           TEXT,
    exposed_date       TEXT CHECK(exposed_date IS NULL
                                  OR exposed_date GLOB '[0-9][0-9][0-9][0-9]'
                                  OR exposed_date GLOB '[0-9][0-9][0-9][0-9]-[0-1][0-9]'
                                  OR exposed_date GLOB '[0-9][0-9][0-9][0-9]-[0-1][0-9]-[0-3][0-9]'),
    exposed_basis      TEXT CHECK(exposed_basis IS NULL OR exposed_basis IN ('police_investigation','parliamentary_inquiry','oversight','court_ruling')),
    exposed_source_url TEXT CHECK(exposed_source_url IS NULL OR exposed_source_url GLOB 'http*://*'),
    exposed_note       TEXT,
    -- Ordem pelo ano (datas de precisões diferentes no mesmo ano: o
    -- npm run check:timelines confere o resto).
    CHECK(substr(start_date, 1, 4) <= substr(end_date, 1, 4)),
    CHECK(exposed_date IS NULL OR substr(exposed_date, 1, 4) >= substr(end_date, 1, 4)),
    -- O trio exposed_* vem completo ou não vem.
    CHECK((exposed_date IS NULL) = (exposed_basis IS NULL) AND (exposed_date IS NULL) = (exposed_source_url IS NULL))
);

INSERT OR REPLACE INTO scheme_timelines (scheme_id, start_date, start_basis, start_source_url, start_note, end_date, end_basis, end_source_url, end_note, exposed_date, exposed_basis, exposed_source_url, exposed_note)
VALUES ('esquema_pc_farias', '1990-03-15', 'enabling_act', 'https://www.tse.jus.br/jurisprudencia/julgados-historicos/collor', 'Posse de Collor; PC Farias, tesoureiro da campanha de 1989, passa a operar no governo. O início exato da cobrança não é datado nas fontes.', '1992-06-01', 'parliamentary_inquiry', 'https://www2.camara.leg.br/atividade-legislativa/plenario/discursos/escrevendohistoria/20-anos-do-impeachment/cpmi-pc-farias', 'Instalação da CPMI. A entrevista de Pedro Collor à Veja (maio de 1992) foi revelação da imprensa, não ato oficial.', NULL, NULL, NULL, NULL);

INSERT OR REPLACE INTO scheme_timelines (scheme_id, start_date, start_basis, start_source_url, start_note, end_date, end_basis, end_source_url, end_note, exposed_date, exposed_basis, exposed_source_url, exposed_note)
VALUES ('esquema_anoes_orcamento', '1989', 'documented_start', 'https://pt.wikipedia.org/wiki/An%C3%B5es_do_Or%C3%A7amento', 'Fontes situam as fraudes no "final dos anos 80", depois da Constituição de 1988; 1989 é o primeiro ano possível, não data exata.', '1993-10', 'parliamentary_inquiry', 'https://www2.senado.leg.br/bdsf/handle/id/610023', 'CPMI do Orçamento (Requerimento 151/1993) instalada depois das denúncias de José Carlos Alves dos Santos.', NULL, NULL, NULL, NULL);

INSERT OR REPLACE INTO scheme_timelines (scheme_id, start_date, start_basis, start_source_url, start_note, end_date, end_basis, end_source_url, end_note, exposed_date, exposed_basis, exposed_source_url, exposed_note)
VALUES ('esquema_sivam', '1994-12-27', 'enabling_act', 'https://www2.camara.leg.br/legin/fed/ressen/1994/resolucao-97-27-dezembro-1994-392017-publicacaooriginal-1-pl.html', 'Resolução do Senado que nomeou a Raytheon fornecedora; o lobby gravado é de 1995.', '1995-11', 'police_investigation', 'https://www.spokesman.com/stories/1995/nov/19/raytheon-denies-bribery-in-brazil/', 'Grampo da PF (setembro de 1995, sigiloso) vem a público; embaixador exonerado em 17/11/1995 e CPI do Sivam em seguida.', NULL, NULL, NULL, NULL);

INSERT OR REPLACE INTO scheme_timelines (scheme_id, start_date, start_basis, start_source_url, start_note, end_date, end_basis, end_source_url, end_note, exposed_date, exposed_basis, exposed_source_url, exposed_note)
VALUES ('esquema_compra_reeleicao', '1997-01', 'first_known_act', 'https://www.congressoemfoco.com.br/noticia/101937/ecos-de-um-escandalo', 'Votação em primeiro turno da emenda da reeleição na Câmara (28/1/1997).', '1997-05', 'police_investigation', 'https://www.congressoemfoco.com.br/noticia/101937/ecos-de-um-escandalo', 'Mês da revelação pela Folha e das renúncias; a PF abriu inquérito (depois arquivado), mês exato não confirmado. A CPI foi barrada.', NULL, NULL, NULL, NULL);

INSERT OR REPLACE INTO scheme_timelines (scheme_id, start_date, start_basis, start_source_url, start_note, end_date, end_basis, end_source_url, end_note, exposed_date, exposed_basis, exposed_source_url, exposed_note)
VALUES ('esquema_trt_sp', '1992', 'first_known_act', 'https://agenciabrasil.ebc.com.br/geral/noticia/2017-09/mpf-pede-ressarcimento-de-r-1-bilhao-por-desvios-em-obra-do-trt-de-sao-paulo', 'Licitação do Fórum Trabalhista vencida pela Incal.', '1998', 'police_investigation', 'https://agenciabrasil.ebc.com.br/geral/noticia/2017-09/mpf-pede-ressarcimento-de-r-1-bilhao-por-desvios-em-obra-do-trt-de-sao-paulo', 'Ex-genro do juiz denuncia o patrimônio ao MPF; CPI do Judiciário em 1999.', NULL, NULL, NULL, NULL);

INSERT OR REPLACE INTO scheme_timelines (scheme_id, start_date, start_basis, start_source_url, start_note, end_date, end_basis, end_source_url, end_note, exposed_date, exposed_basis, exposed_source_url, exposed_note)
VALUES ('esquema_banestado', '1996-04-10', 'enabling_act', 'https://www.camara.leg.br/noticias/58274-contas-cc5-viabilizaram-as-movimentacoes-ilegais/', 'Circular 2.677 do Banco Central libera depósitos em espécie nas CC5 de Foz do Iguaçu.', '2003-05', 'police_investigation', 'https://www.jusbrasil.com.br/noticias/mpf-pr-balanco-sobre-o-caso-banestado/21051', 'Criação da força-tarefa CC5 do MPF, primeiro ato público localizado. Antes, alerta da fiscalização do BC levou o MP a pedir inquérito à PF (ano não localizado).', NULL, NULL, NULL, NULL);

INSERT OR REPLACE INTO scheme_timelines (scheme_id, start_date, start_basis, start_source_url, start_note, end_date, end_basis, end_source_url, end_note, exposed_date, exposed_basis, exposed_source_url, exposed_note)
VALUES ('esquema_grampos_bndes', '1998-07', 'first_known_act', 'https://www.correiobraziliense.com.br/app/noticia/economia/2008/07/29/internas_economia,22069/amp.shtml', 'Articulações gravadas nas semanas do leilão da Telebrás.', '1998-07-29', 'documented_end', 'https://www.bndes.gov.br/wps/portal/site/home/transparencia/desestatizacao/projetos-encerrados/privatizacao-federais-telecomunicacoes', 'Leilões da Telebrás concluídos; o favorecimento suspeito se esgota no leilão.', '1998-11', 'police_investigation', 'https://www1.folha.uol.com.br/fsp/brasil/fc28119813.htm', 'Fitas reveladas por Elio Gaspari em 8/11/1998; a PF investigou a autoria do grampo, não o conteúdo.');

INSERT OR REPLACE INTO scheme_timelines (scheme_id, start_date, start_basis, start_source_url, start_note, end_date, end_basis, end_source_url, end_note, exposed_date, exposed_basis, exposed_source_url, exposed_note)
VALUES ('esquema_mensalao_mineiro', '1998', 'documented_start', 'https://www.itatiaia.com.br/politica/mensalao-tucano-o-escandalo-mineiro-que-antecedeu-o-mensalao-do-pt/', 'Campanha de reeleição de Eduardo Azeredo.', '1998-10', 'documented_end', 'https://www.itatiaia.com.br/politica/mensalao-tucano-o-escandalo-mineiro-que-antecedeu-o-mensalao-do-pt/', 'Eleição de outubro de 1998, perdida por Azeredo.', '2005', 'parliamentary_inquiry', 'https://www.itatiaia.com.br/politica/mensalao-tucano-o-escandalo-mineiro-que-antecedeu-o-mensalao-do-pt/', 'Vem à tona sete anos depois, nas investigações do mensalão federal (CPMI dos Correios).');

INSERT OR REPLACE INTO scheme_timelines (scheme_id, start_date, start_basis, start_source_url, start_note, end_date, end_basis, end_source_url, end_note, exposed_date, exposed_basis, exposed_source_url, exposed_note)
VALUES ('esquema_sudam_sudene', '1997', 'documented_start', 'https://brasil.mongabay.com/2025/03/o-escandalo-da-sudam-ou-como-o-desmatamento-foi-apoiado-pelo-governo/', 'A investigação se concentrou em atos de 1997 a 1999; fraudes anteriores são presumidas, não documentadas.', '1999', 'documented_end', 'https://brasil.mongabay.com/2025/03/o-escandalo-da-sudam-ou-como-o-desmatamento-foi-apoiado-pelo-governo/', 'Fim do período investigado (1997-1999).', '2000', 'oversight', 'https://www18.fgv.br/cpdoc/acervo/dicionarios/verbete-tematico/superintendencia-do-desenvolvimento-da-amazonia-sudam', 'Auditoria do Grupo Especial de Trabalho do Ministério da Integração Nacional.');

INSERT OR REPLACE INTO scheme_timelines (scheme_id, start_date, start_basis, start_source_url, start_note, end_date, end_basis, end_source_url, end_note, exposed_date, exposed_basis, exposed_source_url, exposed_note)
VALUES ('esquema_santo_andre', '1997', 'documented_start', 'https://www.migalhas.com.br/quentes/239417/pt-e-condenado-a-pagar-r--3-5-mi-por-esquema-de-propina-na-gestao-de-celso-daniel', 'Esquema montado na gestão Celso Daniel, de 1997 a 2001, segundo a sentença cível.', '2001', 'documented_end', 'https://www.migalhas.com.br/quentes/239417/pt-e-condenado-a-pagar-r--3-5-mi-por-esquema-de-propina-na-gestao-de-celso-daniel', NULL, '2002-01', 'police_investigation', 'https://www1.folha.uol.com.br/folha/brasil/ult96u60988.shtml', 'Assassinato de Celso Daniel; a investigação do crime pelo MP-SP leva ao esquema de propinas.');

INSERT OR REPLACE INTO scheme_timelines (scheme_id, start_date, start_basis, start_source_url, start_note, end_date, end_basis, end_source_url, end_note, exposed_date, exposed_basis, exposed_source_url, exposed_note)
VALUES ('esquema_vampiro', '1990', 'documented_start', 'https://memorialdademocracia.com.br/card/deflagrada-a-operacao-vampiro', 'PF: quadrilha atuava desde 1990 em fraudes contra o Ministério da Saúde.', '2004-05-19', 'police_investigation', 'https://www1.folha.uol.com.br/fsp/cotidian/ff2005200401.htm', 'Operação Vampiro (Folha de 20/5/2004: "prendeu ontem"). Pedido de averiguação à PF em 2003 não foi público.', NULL, NULL, NULL, NULL);

INSERT OR REPLACE INTO scheme_timelines (scheme_id, start_date, start_basis, start_source_url, start_note, end_date, end_basis, end_source_url, end_note, exposed_date, exposed_basis, exposed_source_url, exposed_note)
VALUES ('esquema_trensalao', '1998', 'documented_start', 'https://g1.globo.com/economia/noticia/2019/07/08/cade-condena-11-empresas-e-42-pessoas-por-cartel-de-trens-e-metros.ghtml', 'Cartel em licitações da CPTM e do Metrô entre 1998 e 2008.', '2008', 'documented_end', 'https://g1.globo.com/economia/noticia/2019/07/08/cade-condena-11-empresas-e-42-pessoas-por-cartel-de-trens-e-metros.ghtml', NULL, '2013-05', 'oversight', 'https://brasil.elpais.com/brasil/2014/12/05/politica/1417813172_432211.html', 'Acordo de leniência da Siemens com o CADE e o MPF.');

INSERT OR REPLACE INTO scheme_timelines (scheme_id, start_date, start_basis, start_source_url, start_note, end_date, end_basis, end_source_url, end_note, exposed_date, exposed_basis, exposed_source_url, exposed_note)
VALUES ('esquema_sanguessugas', '2000', 'documented_start', 'https://www12.senado.leg.br/noticias/materias/2006/07/31/cpi-dos-sanguessugas-deve-decidir-proximos-passos-nesta-terca-feira', 'CPMI: provas de que o esquema funcionava pelo menos desde 2000.', '2006-05', 'police_investigation', 'https://www.congressoemfoco.com.br/noticia/71007/entenda-o-caso-o-que-foi-a-operacao-sanguessuga', 'Operação Sanguessuga. Órgãos de controle apuravam o caso desde 2004, sem ato público.', NULL, NULL, NULL, NULL);

INSERT OR REPLACE INTO scheme_timelines (scheme_id, start_date, start_basis, start_source_url, start_note, end_date, end_basis, end_source_url, end_note, exposed_date, exposed_basis, exposed_source_url, exposed_note)
VALUES ('esquema_waldomiro_diniz', '2002-02', 'first_known_act', 'https://atarde.com.br/politica/tj-reduz-penas-de-waldomiro-e-cachoeira-no-caso-loterj-510900', 'Pedido de propina gravado na Loterj.', '2004-02-13', 'police_investigation', 'https://www.tribunapr.com.br/noticias/lula-demite-assessor-acusado-de-corrupcao-e-manda-abrir-inquerito/', 'Exoneração e ordem de abertura de inquérito, dias depois da revelação pela Época.', NULL, NULL, NULL, NULL);

INSERT OR REPLACE INTO scheme_timelines (scheme_id, start_date, start_basis, start_source_url, start_note, end_date, end_basis, end_source_url, end_note, exposed_date, exposed_basis, exposed_source_url, exposed_note)
VALUES ('esquema_mensalao', '2003', 'first_known_act', 'https://noticias.stf.jus.br/postsnoticias/pgr-diz-que-e-inafastavel-reconhecimento-de-eficiente-sistema-de-repasse-ilicito-de-recursos/', 'Primeiros repasses descritos pela PGR e pelo STF (2003).', '2005-06-09', 'parliamentary_inquiry', 'https://www.cnnbrasil.com.br/politica/20-anos-de-mensalao-entenda-como-tudo-comecou/', 'Instalação da CPMI dos Correios, três dias depois da entrevista de Roberto Jefferson. Um inquérito da PF sobre o vídeo dos Correios (maio de 2005) não foi confirmado.', NULL, NULL, NULL, NULL);

INSERT OR REPLACE INTO scheme_timelines (scheme_id, start_date, start_basis, start_source_url, start_note, end_date, end_basis, end_source_url, end_note, exposed_date, exposed_basis, exposed_source_url, exposed_note)
VALUES ('esquema_dolares_na_cueca', '2004-06-25', 'first_known_act', 'https://www.congressoemfoco.com.br/noticia/101576/dolares-na-cueca-mp-denuncia-irmao-de-genoino', 'Aprovação do financiamento do BNB ao consórcio STN.', '2005-07-08', 'police_investigation', 'https://www.aosfatos.org/noticias/deputado-jose-guimaraes-nao-foi-flagrado-com-dolares-na-cueca-nem-preso/', 'Prisão do assessor no Aeroporto de Congonhas.', NULL, NULL, NULL, NULL);

INSERT OR REPLACE INTO scheme_timelines (scheme_id, start_date, start_basis, start_source_url, start_note, end_date, end_basis, end_source_url, end_note, exposed_date, exposed_basis, exposed_source_url, exposed_note)
VALUES ('esquema_lava_jato', '2004', 'enabling_act', 'https://www.congressoemfoco.com.br/noticias/partidos-receberam-propina-por-contratos-na-petrobras/', 'Paulo Roberto Costa assume a Diretoria de Abastecimento por indicação do PP; o início dos repasses não tem data única nas fontes.', '2014-03-17', 'police_investigation', 'https://brasil.elpais.com/brasil/2015/04/23/politica/1429744001_078177.html', 'Deflagração da operação. O inquérito sobre doleiros corria em sigilo desde antes.', NULL, NULL, NULL, NULL);

INSERT OR REPLACE INTO scheme_timelines (scheme_id, start_date, start_basis, start_source_url, start_note, end_date, end_basis, end_source_url, end_note, exposed_date, exposed_basis, exposed_source_url, exposed_note)
VALUES ('esquema_operacao_navalha', '2003-11', 'enabling_act', 'https://www.planalto.gov.br/ccivil_03/decreto/2003/d4873.htm', 'Criação do Luz para Todos, um dos programas fraudados. O início das fraudes da Gautama não é datado nas fontes.', '2007-05-17', 'police_investigation', 'https://g1.globo.com/Noticias/Politica/0,,MUL48053-5601,00.html', 'Deflagração da operação. A PF investigava em sigilo desde novembro de 2006.', NULL, NULL, NULL, NULL);

INSERT OR REPLACE INTO scheme_timelines (scheme_id, start_date, start_basis, start_source_url, start_note, end_date, end_basis, end_source_url, end_note, exposed_date, exposed_basis, exposed_source_url, exposed_note)
VALUES ('esquema_operacao_zelotes', '2005', 'documented_start', 'https://www.politize.com.br/operacao-zelotes-crime-investigado/', 'Há indícios de que o esquema começou em 2005.', '2015-03-26', 'police_investigation', 'https://www1.folha.uol.com.br/mercado/2015/04/1611246-entenda-a-operacao-zelotes-da-policia-federal.shtml', 'Deflagração da operação; investigação sigilosa desde 2013.', NULL, NULL, NULL, NULL);

INSERT OR REPLACE INTO scheme_timelines (scheme_id, start_date, start_basis, start_source_url, start_note, end_date, end_basis, end_source_url, end_note, exposed_date, exposed_basis, exposed_source_url, exposed_note)
VALUES ('esquema_caixa_pandora', '2007-01', 'enabling_act', 'https://www.congressoemfoco.com.br/noticia/77253/esquema-de-durval-comecou-no-governo-roriz', 'Posse de José Roberto Arruda, recorte do dossiê. O esquema de Durval Barbosa começou antes, no governo Roriz (ano não especificado).', '2009-11-27', 'police_investigation', 'https://g1.globo.com/politica/noticia/2012/06/mensalao-do-dem-desviou-pelo-menos-r-110-milhoes-diz-pgr.html', 'Deflagração da operação.', NULL, NULL, NULL, NULL);

INSERT OR REPLACE INTO scheme_timelines (scheme_id, start_date, start_basis, start_source_url, start_note, end_date, end_basis, end_source_url, end_note, exposed_date, exposed_basis, exposed_source_url, exposed_note)
VALUES ('esquema_operacao_porto_seguro', '2007', 'first_known_act', 'https://g1.globo.com/politica/noticia/2012/11/denuncia-de-propina-de-auditor-levou-pf-investigar-diretor-de-estatal.html', 'Oferta de R$ 300 mil ao auditor do TCU, primeiro ato datado.', '2012-11-23', 'police_investigation', 'https://noticias.uol.com.br/politica/ultimas-noticias/2012/12/03/confira-os-principais-fatos-relacionados-a-operacao-porto-seguro.htm', 'Deflagração da operação.', NULL, NULL, NULL, NULL);

INSERT OR REPLACE INTO scheme_timelines (scheme_id, start_date, start_basis, start_source_url, start_note, end_date, end_basis, end_source_url, end_note, exposed_date, exposed_basis, exposed_source_url, exposed_note)
VALUES ('esquema_caso_queiroz_rachadinhas', '2007', 'documented_start', 'https://conjur.com.br/2020-nov-04/mp-denuncia-flavio-bolsonaro-esquema-rachadinha-alerj/', 'Denúncia do MP-RJ: esquema entre 2007 e 2018.', '2018-12', 'oversight', 'https://g1.globo.com/rj/rio-de-janeiro/noticia/2019/01/18/caso-fabricio-queiroz-o-que-e-cronologia-dos-fatos-personagens.ghtml', 'Relatório do Coaf vem a público. A denúncia situa o fim do esquema no mesmo ano (2018).', NULL, NULL, NULL, NULL);

INSERT OR REPLACE INTO scheme_timelines (scheme_id, start_date, start_basis, start_source_url, start_note, end_date, end_basis, end_source_url, end_note, exposed_date, exposed_basis, exposed_source_url, exposed_note)
VALUES ('esquema_operacao_cadeia_velha', '1990', 'documented_start', 'http://combateacorrupcao.mpf.mp.br/feeder_novo/lava-jato/4c37f792bb76be936cab4ef9e67f3bc4', 'MPF: Picciani recebia propinas "desde os anos 1990"; 1990 é aproximação da década.', '2017-03', 'documented_end', 'https://oglobo.globo.com/politica/mpf-picciani-albertassi-receberam-propina-da-fetranspor-ate-2017-22070175', 'Último pagamento da Fetranspor apontado pelo MPF.', '2017-11-14', 'police_investigation', 'https://g1.globo.com/rio-de-janeiro/noticia/operacao-cadeia-velha-investiga-cupula-da-alerj.ghtml', 'Deflagração da operação.');

INSERT OR REPLACE INTO scheme_timelines (scheme_id, start_date, start_basis, start_source_url, start_note, end_date, end_basis, end_source_url, end_note, exposed_date, exposed_basis, exposed_source_url, exposed_note)
VALUES ('esquema_operacao_greenfield', '2011', 'documented_start', 'https://mpmt.mp.br/conteudo/726/93125/ft-greenfield-aciona-13-pessoas-por-improbidade-administrativa-pela-gestao-temeraria-dos-fundos-de-pensao-petros-funcef-e-previ', 'Investimentos questionados feitos entre 2011 e 2016.', '2016-09', 'police_investigation', 'https://www2.senado.leg.br/bdsf/bitstream/handle/id/525541/noticia.html?sequence=1&isAllowed=y', 'Deflagração da operação.', NULL, NULL, NULL, NULL);

INSERT OR REPLACE INTO scheme_timelines (scheme_id, start_date, start_basis, start_source_url, start_note, end_date, end_basis, end_source_url, end_note, exposed_date, exposed_basis, exposed_source_url, exposed_note)
VALUES ('esquema_faroeste', '2013-01', 'first_known_act', 'https://brasil.mongabay.com/2019/11/investigacao-revela-esquema-de-corrupcao-entre-juizes-e-ruralistas-no-oeste-da-bahia/', 'Início das movimentações financeiras investigadas (janeiro de 2013).', '2019-11-19', 'police_investigation', 'https://www.stj.jus.br/sites/portalp/Paginas/Comunicacao/Noticias/2026/21102026-Operacao-Faroeste-Corte-Especial-condena-magistrados-por-venda-de-decisoes-judiciais-na-Bahia.aspx', 'Deflagração da operação; apurações do MP-BA desde 2015, sem ato público.', NULL, NULL, NULL, NULL);

INSERT OR REPLACE INTO scheme_timelines (scheme_id, start_date, start_basis, start_source_url, start_note, end_date, end_basis, end_source_url, end_note, exposed_date, exposed_basis, exposed_source_url, exposed_note)
VALUES ('esquema_jbs_mala_rocha_loures', '2017-03', 'first_known_act', 'https://g1.globo.com/politica/noticia/delacao-da-jbs-veja-os-videos-dos-depoimentos.ghtml', 'Conversa gravada de Joesley Batista com Michel Temer no Jaburu.', '2017-05-18', 'police_investigation', 'https://g1.globo.com/politica/noticia/stf-libera-conteudo-da-delacao-dos-donos-da-jbs.ghtml', 'Operação Patmos. A entrega da mala, em abril, foi ação controlada sigilosa.', NULL, NULL, NULL, NULL);

INSERT OR REPLACE INTO scheme_timelines (scheme_id, start_date, start_basis, start_source_url, start_note, end_date, end_basis, end_source_url, end_note, exposed_date, exposed_basis, exposed_source_url, exposed_note)
VALUES ('esquema_laranjas_do_psl', '2018', 'first_known_act', 'https://g1.globo.com/politica/noticia/2019/04/29/entenda-as-investigacoes-sobre-candidatos-laranja.ghtml', 'Candidaturas fictícias nas eleições de 2018.', '2019-02-27', 'police_investigation', 'https://www.poder360.com.br/governo/pf-abre-inquerito-sobre-suspeitas-de-candidaturas-laranjas-do-psl-em-minas/', 'PF abre inquérito em Minas, depois das reportagens da Folha.', NULL, NULL, NULL, NULL);

INSERT OR REPLACE INTO scheme_timelines (scheme_id, start_date, start_basis, start_source_url, start_note, end_date, end_basis, end_source_url, end_note, exposed_date, exposed_basis, exposed_source_url, exposed_note)
VALUES ('esquema_operacao_placebo', '2020-03', 'first_known_act', 'https://www.cnnbrasil.com.br/politica/em-relatorio-governo-do-rj-ve-omissao-de-edmar-santos-na-compra-de-respiradores/', 'Contratações emergenciais da Saúde do RJ no início da pandemia.', '2020-05-26', 'police_investigation', 'https://g1.globo.com/politica/noticia/2020/05/26/bolsonaro-ri-ao-ser-questionado-sobre-operacao-contra-witzel-e-da-parabens-a-pf.ghtml', 'Deflagração da operação.', NULL, NULL, NULL, NULL);

INSERT OR REPLACE INTO scheme_timelines (scheme_id, start_date, start_basis, start_source_url, start_note, end_date, end_basis, end_source_url, end_note, exposed_date, exposed_basis, exposed_source_url, exposed_note)
VALUES ('esquema_orcamento_secreto_rp9', '2020', 'enabling_act', 'https://www.cnnbrasil.com.br/politica/em-quase-3-anos-orcamento-secreto-pago-supera-emendas-individuais-e-e-mais-que-o-dobro-das-de-bancada/', 'Emendas de relator (RP9) usadas a partir do Orçamento de 2020.', '2022-12-19', 'court_ruling', 'https://g1.globo.com/politica/noticia/2022/12/19/entenda-a-decisao-do-supremo-que-considerou-o-orcamento-secreto-inconstitucional.ghtml', 'STF declara inconstitucional o modelo. A suspensão liminar de novembro de 2021 não encerrou as emendas.', NULL, NULL, NULL, NULL);

INSERT OR REPLACE INTO scheme_timelines (scheme_id, start_date, start_basis, start_source_url, start_note, end_date, end_basis, end_source_url, end_note, exposed_date, exposed_basis, exposed_source_url, exposed_note)
VALUES ('esquema_bolsolao_do_mec', '2021-01', 'first_known_act', 'https://legis.senado.leg.br/sdleg-getter/documento?dm=9096890', 'Pastores negociavam com prefeituras "ao menos desde janeiro de 2021".', '2022-03', 'police_investigation', 'https://www.migalhas.com.br/quentes/362361/carmen-determina-inquerito-para-apurar-audio-do-ministro-da-educacao', 'Cármen Lúcia determina inquérito no STF, dias depois das reportagens.', NULL, NULL, NULL, NULL);

INSERT OR REPLACE INTO scheme_timelines (scheme_id, start_date, start_basis, start_source_url, start_note, end_date, end_basis, end_source_url, end_note, exposed_date, exposed_basis, exposed_source_url, exposed_note)
VALUES ('esquema_operacao_venire_joias_presidencia', '2021-10', 'first_known_act', 'https://g1.globo.com/politica/noticia/2024/07/04/pf-indicia-bolsonaro-em-inquerito-das-joias.ghtml', 'Retenção das joias sauditas em Guarulhos.', '2023-03', 'police_investigation', 'https://www.estadao.com.br/150-anos/150-momentos/caso-das-joias-veio-a-publico-pela-primeira-vez-no-estadao/', 'Estadão revela o caso no início de março de 2023 e a PF abre inquérito no mesmo mês.', NULL, NULL, NULL, NULL);

INSERT OR REPLACE INTO scheme_timelines (scheme_id, start_date, start_basis, start_source_url, start_note, end_date, end_basis, end_source_url, end_note, exposed_date, exposed_basis, exposed_source_url, exposed_note)
VALUES ('esquema_banco_master_inss', '2024-07', 'documented_start', 'https://www.cnnbrasil.com.br/economia/mercado/entenda-operacao-que-prendeu-daniel-vorcaro-dono-do-banco-master/', 'Primeiras cessões de carteiras do Master ao BRB.', '2025-11-18', 'police_investigation', 'https://www.cnnbrasil.com.br/economia/mercado/entenda-operacao-que-prendeu-daniel-vorcaro-dono-do-banco-master/', 'Operação Compliance Zero e liquidação do Master. O veto do BC à compra (setembro de 2025) não interrompeu as cessões.', NULL, NULL, NULL, NULL);

INSERT OR REPLACE INTO scheme_timelines (scheme_id, start_date, start_basis, start_source_url, start_note, end_date, end_basis, end_source_url, end_note, exposed_date, exposed_basis, exposed_source_url, exposed_note)
VALUES ('esquema_inss_sem_desconto', '2019', 'documented_start', 'https://agenciabrasil.ebc.com.br/geral/noticia/2025-05/inss-descontos-indevidos-partir-de-marco-de-2020-serao-restituidos', 'PF e CGU apontam descontos indevidos de 2019 a 2024.', '2025-04-23', 'police_investigation', 'https://agenciagov.ebc.com.br/noticias/202504/201cprotecao-aos-aposentados201d-diz-lewandowski-sobre-operacao-contra-fraudes-em-descontos-no-inss', 'Deflagração da operação; investigação desde 2023, sem ato público.', NULL, NULL, NULL, NULL);
