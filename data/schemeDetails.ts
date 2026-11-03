export interface SchemeDetail {
  context: string;
  mechanism: string;
  impact: string;
  legalStatus: string;
  sources: { title: string; url: string }[];
}

export const SCHEME_DETAILS: Record<string, SchemeDetail> = {
  esquema_pc_farias: {
    context: "O Esquema PC Farias estruturou-se durante a campanha presidencial de 1989 e consolidou-se ao longo do governo de Fernando Collor de Mello (1990–1992). Operado pelo ex-tesoureiro de campanha Paulo César Farias, o esquema montou um balcão paralelo de negócios no governo federal para extorquir empreiteiras e empresários privados em troca de facilidades contratuais, verbas orçamentárias e crédito público.",
    mechanism: "A rede funcionava por meio de cobrança de propina sobre obras públicas e liberação de verbas. Os recursos eram lavados através de empresas de fachada (como a EPC e a Brasil Jet) e movimentados em dezenas de contas bancárias em nome de pessoas fictícias ('fantasmas'), gerenciadas pela secretária Rosinete Melanias. O saldo financiava despesas pessoais e residenciais do presidente Fernando Collor e familiares, sob intermediação de seu secretário particular Cláudio Vieira.",
    impact: "US$ 88.000.000 a US$ 100.000.000 (Estimativa total de propinas e depósitos não contabilizados arrecadados pela CPI do PC durante o governo Collor)",
    legalStatus: "O escândalo resultou no impeachment e na renúncia de Fernando Collor em 1992, além da cassação de seus direitos políticos por 8 anos. Na esfera criminal, o STF absolveu Collor em 1994 (Ação Penal 307) por falta de provas de ato de ofício direto. PC Farias foi condenado por falsidade ideológica e sonegação fiscal em 1994. Em 1996, PC Farias foi encontrado morto em Maceió em circunstâncias controversas.",
    sources: [
      { title: "Esquema PC Farias - Wikipédia", url: "https://pt.wikipedia.org/wiki/Esquema_PC_Farias" },
      { title: "As acusações contra PC - Folha de S.Paulo", url: "https://www1.folha.uol.com.br/fsp/1996/6/24/brasil/11.html" },
      { title: "Relembre casos do governo Collor que envolveram PC Farias - G1", url: "https://g1.globo.com/politica/noticia/2013/05/relembre-casos-do-governo-collor-que-envolveram-pc-farias.html" },
      { title: "Supremo absolveu Collor e condenou PC a 7 anos - Folha de S.Paulo", url: "https://www1.folha.uol.com.br/fsp/1994/12/18/brasil/4.html" },
      { title: "STF condena PC, Bandeira e Rosinete - Folha de S.Paulo", url: "https://www1.folha.uol.com.br/fsp/1994/12/14/brasil/20.html" },
      { title: "PC pega quatro anos por sonegação - Folha de S.Paulo", url: "http://almanaque.folha.uol.com.br/brasil_08jan1994.htm" }
    ]
  },

  esquema_anoes_orcamento: {
    context: "Eclodiu em outubro de 1993 durante o governo Itamar Franco, revelando uma rede de corrupção cravada na Comissão Mista de Orçamento do Congresso Nacional. O esquema operava desde o fortalecimento do Poder Legislativo com a Constituição de 1988 e veio a público após denúncias do ex-assessor José Carlos Alves dos Santos.",
    mechanism: "O grupo fraudava o Orçamento da União por meio de cobrança de propina de prefeitos para alocação de emendas municipais, cooptação por grandes empreiteiras para inflar verbas de obras públicas e desvio de subvenções sociais para entidades filantrópicas de fachada mantidas por parentes ou laranjas. O deputado João Alves justificava sua evolução patrimonial alegando ter ganhado centenas de vezes na loteria.",
    impact: "US$ 100.000.000 (Estimativa total de recursos desviados dos cofres públicos pela rede de desvios no Orçamento da União)",
    legalStatus: "A CPI do Orçamento instaurada em 1993 recomendou a punição de 18 congressistas, resultando em 6 cassações de mandato e 4 renúncias. Na esfera judicial criminal, a lentidão processual e o término de mandatos levaram à prescrição da maioria dos crimes ou absolvições formais por falta de provas.",
    sources: [
      { title: "Anões do Orçamento - Wikipédia", url: "https://pt.wikipedia.org/wiki/An%C3%B5es_do_Or%C3%A7amento" },
      { title: "Entenda o caso dos anões do Orçamento - Folha de S.Paulo", url: "https://www1.folha.uol.com.br/folha/brasil/ult96u65705.shtml" },
      { title: "Os anões que burlavam o orçamento da União - Rádio Câmara", url: "https://www.camara.leg.br/radio/programas/266244-especial-cpis-2-os-anoes-que-burlavam-o-orcamento-da-uniao-para-engordar-as-contas-bancarias-07-09/" },
      { title: "CPI investiga anões do orçamento - Memorial da Democracia", url: "https://memorialdademocracia.com.br/card/cpi-investiga-anoes-do-orcamento" },
      { title: "30 anos de um erro: vínculo de nome de Ibsen Pinheiro aos 'Anões do Orçamento' - Correio da Manhã", url: "https://www.correiodamanha.com.br/especiais/2023/11/102133-30-anos-de-um-erro-vinculo-de-nome-de-ibsen-pinheiro-aos-anoes-do-orcamento-era-tudo-mentira.html" }
    ]
  },

  esquema_sivam: {
    context: "O Escândalo do Sivam (Sistema de Vigilância da Amazônia) eclodiu em novembro de 1995, durante o primeiro ano do governo Fernando Henrique Cardoso (PSDB). O projeto visava instalar radares e monitorar a Amazônia Legal contra o narcotráfico, garimpo ilegal e desmatamento, mas foi abalado pelo vazamento de conversas telefônicas gravadas pela PF no Palácio do Planalto.",
    mechanism: "A rede envolveu lobby ilícito e tráfico de influência articulados pelo chefe do Cerimonial do Planalto, Júlio César Gomes dos Santos, e pelo empresário José Afonso Assumpção para beneficiar a norte-americana Raytheon no contrato do Sivam. O ministro da Aeronáutica, Mauro Gandra, hospedou-se na casa do representante comercial da Raytheon, gerando conflito de interesses. Paralelamente, a gerenciadora brasileira ESCA foi desqualificada por certidões falsas e sonegação ao INSS.",
    impact: "US$ 1.400.000.000 (Valor do contrato comercial para fornecimento do sistema de radares pela Raytheon e financiamento junto ao Eximbank)",
    legalStatus: "O escândalo provocou a demissão do ministro da Aeronáutica, Mauro Gandra, e o afastamento do embaixador Júlio César Gomes dos Santos. A empresa ESCA teve seu contrato rescindido. O presidente FHC manteve a contratação da Raytheon após auditorias. A CPI do Sivam no Senado concluiu os trabalhos em 2002 sem propor indiciamentos diretos por ausência de provas materiais de pagamento de propina.",
    sources: [
      { title: "Caso Sivam derruba ministro de FHC - Memorial da Democracia", url: "https://memorialdademocracia.com.br/card/caso-sivam-derruba-ministro-de-fhc" },
      { title: "Sem conclusão, CPI do Sivam termina hoje - Folha de S.Paulo", url: "https://www1.folha.uol.com.br/folha/brasil/ult96u33015.shtml" },
      { title: "Caso Sivam não causa dano à imagem de FHC - Folha de S.Paulo", url: "https://www1.folha.uol.com.br/fsp/1995/12/03/brasil/13.html" },
      { title: "Júlio César depõe e acusa outro 'grampo' no Planalto - Folha de S.Paulo", url: "https://www1.folha.uol.com.br/fsp/1995/11/30/brasil/4.html" },
      { title: "A outra corrupção - Folha de S.Paulo", url: "https://www1.folha.uol.com.br/fsp/1995/05/21/brasil/11.html" }
    ]
  },

  esquema_compra_reeleicao: {
    context: "O escândalo explodiu em maio de 1997 após revelação de gravações telefônicas pela Folha de S.Paulo. Deputados federais admitiram ter vendido seus votos favoráveis à aprovação da Proposta de Emenda à Constituição (PEC nº 22/1996), que instituiu a reeleição para cargos do Poder Executivo (Presidente, Governadores e Prefeitos) no Brasil durante o primeiro mandato de Fernando Henrique Cardoso.",
    mechanism: "Deputados do baixo clero negociaram a aprovação do texto em troca de cotas fixas de R$ 200 mil em dinheiro vivo por voto, além de outorgas de retransmissoras de rádio e televisão públicas registradas em nome de laranjas. A operacionalização financeira envolveu intermediações entre o Ministério das Comunicações e governadores estaduais para triangulação de verbas e favorecimentos.",
    impact: "R$ 200.000 por parlamentar cooptado (Pagarmentos em espécie documentados em gravações; ex-parlamentares alegaram em delações posteriores que mais de 50 votos teriam sido negociados)",
    legalStatus: "Os deputados federais Ronivon Santiago e Osvaldo Reis renunciaram aos mandatos em 1997 para evitar processos de cassação por quebra de decoro. A Procuradoria-Geral da República (PGR) determinou o arquivamento das apurações quanto ao presidente FHC e seus ministros por ausência de prova de envolvimento direto. O Congresso não instalou CPI para o caso.",
    sources: [
      { title: "Entenda como foi a compra de votos a favor da emenda da reeleição em 1997 - Poder360", url: "https://www.poder360.com.br/midia/entenda-como-foi-a-compra-de-votos-a-favor-da-emenda-da-reeleicao-em-1997/" },
      { title: "Sérgio Motta intermediou compra de voto pró-reeleição - Folha de S.Paulo", url: "https://www1.folha.uol.com.br/fsp/1997/5/14/brasil/11.html" },
      { title: "A compra de votos, segundo o ex-presidente - Folha de S.Paulo", url: "https://www1.folha.uol.com.br/fsp/brasil/fc2105200626.htm" },
      { title: "'Mais de 50' votos foram comprados na reeleição, diz Corrêa - Senado Federal", url: "https://www2.senado.leg.br/bdsf/bitstream/handle/id/523270/noticia.html?sequence=1&isAllowed=y" }
    ]
  },

  esquema_trt_sp: {
    context: "O escândalo do Fórum Trabalhista de São Paulo (TRT-SP) eclodiu publicamente em 1998. A obra, planejada para concentrar as varas trabalhistas na Barra Funda, teve sua licitação realizada em 1992 e foi vencida pela Incal Incorporações. Auditorias do TCU e investigações do MPF apontaram que mais de 90% dos recursos públicos repassados foram desviados enquanto a construção permanecia inacabada.",
    mechanism: "O juiz Nicolau dos Santos Neto ('Juiz Lalau'), na condição de presidente do TRT-SP e da comissão de obras, aprovava medições falsas e liberava verbas públicas para a Incal. A construtora repassava a maior parte dos fundos para empresas do Grupo OK, pertencentes ao então senador Luiz Estevão, além de remeter valores para contas offshore na Suíça via doleiros.",
    impact: "R$ 169.500.000 (Valor nominal desviado entre 1992 e 1998; montante superou R$ 1 bilhão em valores atualizados, com restituição judicial superior a R$ 468 milhões pelo Grupo OK)",
    legalStatus: "Em 2000, Luiz Estevão tornou-se o primeiro senador cassado da história da República. O juiz Nicolau dos Santos Neto foi preso em 2000 e condenado a 26 anos e 6 meses em 2006 (faleceu em 2020). Luiz Estevão e os sócios da Incal foram condenados a mais de 30 anos de prisão em 2006, com execução das penas decretada pelo STF em 2016.",
    sources: [
      { title: "Preso, ex-senador Luiz Estevão é o primeiro cassado da história do Senado - G1", url: "https://g1.globo.com/politica/noticia/2016/03/preso-ex-senador-luiz-estevao-e-o-primeiro-cassado-da-historia-do-senado.html" },
      { title: "Senado cassa mandato de Luiz Estevão - Senado Notícias", url: "https://www12.senado.leg.br/noticias/materias/2000/06/28/senado-cassa-mandato-de-luiz-estevao" },
      { title: "Ex-juiz Nicolau dos Santos Neto morre aos 92 anos em SP - G1", url: "https://g1.globo.com/sp/sao-paulo/noticia/2020/04/01/ex-juiz-nicolau-dos-santos-neto-morre-aos-92-anos-em-sp.ghtml" },
      { title: "Entenda o caso do Fórum Trabalhista de São Paulo - Folha de S.Paulo", url: "https://www1.folha.uol.com.br/fsp/brasil/fc2105200626.htm" }
    ]
  },

  esquema_grampos_bndes: {
    context: "O escândalo dos 'Grampos do BNDES' ou Escândalo das Privatizações eclodiu em novembro de 1998, após a reeleição do presidente Fernando Henrique Cardoso. O caso envolveu o vazamento de conversas telefônicas gravadas ilicitamente nas linhas do BNDES e do Ministério das Comunicações durante o leilão de desestatização do Sistema Telebrás, realizado em julho de 1998.",
    mechanism: "As gravações expuseram a articulação de autoridades do governo federal, como o ministro Luiz Carlos Mendonça de Barros e o presidente do BNDES André Lara Resende, para favorecer o consórcio do Banco Opportunity (liderado por Daniel Dantas) na disputa pela Tele Norte Leste (Telemar). Houve pressões diretas sobre o fundo de pensão Previ com aval do presidente FHC, além da atuação de diretores do Banco do Brasil na emissão de fianças bancárias.",
    impact: "R$ 22.060.000.000 (Valor total arrecadado no leilão do Sistema Telebrás em julho de 1998, o maior processo de desestatização da história do país)",
    legalStatus: "O escândalo levou aos pedidos de demissão do ministro das Comunicações, Luiz Carlos Mendonça de Barros, e do presidente do BNDES, André Lara Resende, em novembro de 1998. Na esfera judicial, as ações movidas pelo Ministério Público Federal contra FHC e ex-dirigentes foram arquivadas pelo TRF-1 e tribunais superiores, que concluíram pela inexistência de dolo, propina ou vantagem financeira pessoal dos gestores públicos.",
    sources: [
      { title: "O grampo no BNDES - Folha de Londrina", url: "https://www.folhadelondrina.com.br/politica/o-grampo-no-bndes-109714.html" },
      { title: "Grampo no BNDES divide base governista - Folha de S.Paulo", url: "https://www1.folha.uol.com.br/fsp/brasil/fc16119805.htm" },
      { title: "Escândalo do grampo do BNDES - Wikipédia", url: "https://pt.wikipedia.org/wiki/Esc%C3%A2ndalo_do_grampo_do_BNDES" },
      { title: "Mendonça liga ex-diretor do BB a grampo - Folha de S.Paulo", url: "https://www1.folha.uol.com.br/fsp/brasil/fc2604200116.htm" },
      { title: "Saiba como foi a privatização da Telebrás em 1998 - Correio Braziliense", url: "https://www.correiobraziliense.com.br/app/noticia/economia/2008/07/29/internas_economia,22069/saiba-como-foi-a-privatizacao-da-telebras-em-1998.shtml" }
    ]
  },

  esquema_mensalao_mineiro: {
    context: "O Mensalão Mineiro (ou Mensalão Tucano) eclodiu a partir das investigações sobre o financiamento não contabilizado da campanha de reeleição do então governador de Minas Gerais, Eduardo Azeredo (PSDB), no pleito de 1998. É apontado pelo Ministério Público Federal como o embrião e modelo operacional do que viria a ser o Mensalão federal em 2005.",
    mechanism: "O esquema consistiu no desvio sistemático de recursos de empresas públicas mineiras (como Copasa, Comig e Bemge) maquiados como patrocínios a eventos esportivos e institucionais. As verbas fluíam para as agências de publicidade DNA Propaganda e SMP&B, do publicitário Marcos Valério, acompanhadas de empréstimos bancários fictícios garantidos por contratos frios, alimentando o caixa dois gerido pela cúpula da campanha tucana.",
    impact: "R$ 3.500.000 (Valor nominal desviado diretamente de estatais mineiras comprovado por perícias judiciais, superando R$ 14 milhões em valores corrigidos; a movimentação global do caixa dois ultrapassou R$ 10 milhões na época)",
    legalStatus: "Eduardo Azeredo foi condenado em 1ª instância em 2015 a 20 anos e 10 meses por peculato e lavagem de dinheiro, pena mantida pelo TJ-MG e posteriormente ajustada para 15 anos e 7 meses pelo STJ. Marcos Valério, Ramon Hollerbach e Cristiano Paz também foram condenados criminalmente. Os processos contra os coordenadores políticos Walfrido dos Mares Guia e Cláudio Mourão prescreveram ao atingirem 70 anos.",
    sources: [
      { title: "Marcos Valério, Hollerbach e Cristiano Paz são condenados no mensalão tucano - G1", url: "https://g1.globo.com/mg/minas-gerais/noticia/marcos-valerio-hollerbach-e-cristiano-paz-sao-condenados-no-mensalao-tucano.ghtml" },
      { title: "Após 17 anos, Eduardo Azeredo é condenado por mensalão do PSDB - EL PAÍS Brasil", url: "https://brasil.elpais.com/brasil/2015/12/17/politica/1450356356_948714.html" },
      { title: "STJ confirma condenação de Eduardo Azeredo e redimensiona pena para 15 anos e sete meses - STJ", url: "https://www.stj.jus.br/sites/portalp/Paginas/Comunicacao/Noticias/STJ-confirma-condenacao-de-Eduardo-Azeredo-e-redimensiona-pena-para-15-anos-e-sete-meses.aspx" },
      { title: "Ex-ministro se livra de mensalão tucano após prescrição dos crimes - Folha de S.Paulo", url: "https://m.folha.uol.com.br/poder/2014/01/1400651-crimes-contra-ex-ministro-envolvido-em-mensalao-tucano-prescrevem.shtml" },
      { title: "STF aceita denúncia contra o senador Eduardo Azeredo pelos crimes de peculato e lavagem de dinheiro - STF", url: "https://noticias.stf.jus.br/postsnoticias/stf-aceita-denuncia-contra-o-senador-eduardo-azeredo-pelos/" }
    ]
  },

  esquema_banestado: {
    context: "O escândalo do Banestado (Banco do Estado do Paraná) emergiu entre 2001 e 2003 como um dos maiores esquemas de evasão de divisas e lavagem de capitais da história brasileira[cite: 1, 2, 3]. Operado desde a década de 1990, aproveitou vulnerabilidades da regulação de contas de não residentes (contas CC-5) estabelecida pelo Banco Central[cite: 3, 6].",
    mechanism: "Depósitos massivos de cédulas físicas eram feitos em agências de Foz do Iguaçu (PR) simulando receitas de empresas paraguaias e repassados a contas CC-5 de laranjas[cite: 3]. Os saldos eram convertidos em moeda estrangeira e remetidos via agência de Nova Iorque do Banestado para a Beacon Hill Service Corporation, que mantinha uma conta concentradora no JP Morgan Chase abrigando subcontas clandestinas de doleiros como Alberto Youssef e Toninho da Barcelona[cite: 1, 3].",
    impact: "US$ 30.000.000.000 (Estimativa total de divisas evadidas via contas CC-5; com mais de US$ 20 bilhões movimentados na conta-mãe da Beacon Hill e R$ 8,2 bilhões em autuações fiscais da Receita Federal)[cite: 3, 4, 8]",
    legalStatus: "A persecução penal resultou na condenação de mais de cem doleiros e gerentes pela 2ª Vara Federal Criminal de Curitiba e nos primeiros acordos de delação premiada do país[cite: 1, 3]. A CPMI do Banestado recomendou 87 indiciamentos em 2003[cite: 7]. O caso motivou a extinção do modelo flexível das contas CC-5, a criação da ENCCLA e a implementação do sistema SIMBA[cite: 9].",
    sources: [
      { title: "O Caso Banestado - Blog do Vlad", url: "https://vladimiraras.blog/2021/01/17/o-caso-banestado/" },
      { title: "Escândalo do Banestado - Wikipédia", url: "https://pt.wikipedia.org/wiki/Esc%C3%A2ndalo_do_Banestado" },
      { title: "Contas CC5 viabilizaram as movimentações ilegais - Câmara dos Deputados", url: "https://www.camara.leg.br/noticias/58274-contas-cc5-viabilizaram-as-movimentacoes-ilegais/" },
      { title: "Relatório sugere o indiciamento de 87 pessoas - Câmara dos Deputados", url: "https://www.camara.leg.br/noticias/58272-relatorio-sugere-o-indiciamento-de-87-pessoas/" }
    ]
  },

  esquema_santo_andre: {
    context: "O 'Caso Santo André' teve início com o sequestro e assassinato do prefeito Celso Daniel (PT) em janeiro de 2002. As investigações posteriores revelaram a existência de um esquema de extorsão e cobrança sistemática de propinas sobre empresas concessionárias de transporte público e serviços urbanos no município paulista.",
    mechanism: "Empresários de transporte pagavam propinas mensais para atuar sem fiscalização adequada. Os recursos em espécie eram arrecadados por secretários municipais e operadores privados para abastecer caixa dois eleitoral do Partido dos Trabalhadores. O Ministério Público sustentou que Celso Daniel foi morto a mando de seu empresário Sérgio Gomes da Silva ('Sombra') por tentar impedir o desvio pessoal das verbas de extorsão.",
    impact: "R$ 300.000 a R$ 500.000 mensais (Montante arrecadado do setor de transportes em Santo André; total acumulado estimado entre R$ 5 milhões e R$ 10 milhões)",
    legalStatus: "A Polícia Civil concluiu por crime comum (sequestro seguido de morte por quadrilha local). O Ministério Público denunciou Sérgio 'Sombra' como mandante do assassinato, mas ele faleceu em 2016 antes de ser julgado pelo Tribunal do Júri. Executores materiais foram condenados a penas de 18 a 24 anos. Na esfera de corrupção dos transportes, o ex-secretário Klinger Alves e o empresário Ronan Maria Pinto foram condenados por concussão e corrupção.",
    sources: [
      { title: "Assassinato de Celso Daniel completa 20 anos sem respostas sobre motivo - G1", url: "https://g1.globo.com/sp/sao-paulo/noticia/2022/01/18/assassinato-de-celso-daniel-completa-20-anos-sem-respostas-sobre-motivo.ghtml" },
      { title: "Morre Sérgio Gomes da Silva, o 'Sombra' do caso Celso Daniel - G1", url: "https://g1.globo.com/sp/sao-paulo/noticia/2016/09/27/morre-sergio-gomes-da-silva-o-sombra-do-caso-celso-daniel.ghtml" },
      { title: "Justiça condena ex-secretário de Celso Daniel e empresários por corrupção - Folha de S.Paulo", url: "https://www1.folha.uol.com.br/fsp/cotidiano/ff1911200912.htm" },
      { title: "TJ-SP mantém condenação de Ronan Maria Pinto em processo derivado do caso Celso Daniel - G1", url: "https://g1.globo.com/sp/sao-paulo/noticia/2019/11/14/tj-sp-mantem-condenacao-de-ronan-maria-pinto-em-processo-derivado-do-caso-celso-daniel.ghtml" }
    ]
  },

  esquema_waldomiro_diniz: {
    context: "O Caso Waldomiro Diniz eclodiu em fevereiro de 2004, após a divulgação de um vídeo gravado em 2002. Na época da gravação, Waldomiro presidia a Loterj no governo fluminense; ao ser exposto em 2004, atuava como subchefe de Assuntos Parlamentares da Casa Civil, sendo assessor direto do ministro José Dirceu. Foi a primeira grande crise política e de corrupção do governo Lula.",
    mechanism: "Waldomiro Diniz foi gravado cobrando propina do empresário de jogos Carlinhos Cachoeira em troca do direcionamento de editais na Loterj, exigindo 1% do faturamento e fundos para campanhas do PT no Rio de Janeiro. Já na Casa Civil, atuou na intermediação e pressão pela renovação de contratos milionários de processamento de loterias entre a Caixa Econômica Federal e a multinacional Gtech.",
    impact: "R$ 120.000 exigidos em espécie para caixa dois eleitoral (além de 1% sobre faturamento de jogos e contratos da Caixa/Gtech orçados em R$ 650 milhões)",
    legalStatus: "Waldomiro Diniz foi exonerado sumariamente em fevereiro de 2004. Em 2012, foi condenado pela Justiça do Rio de Janeiro a 12 anos de prisão por corrupção passiva e concussão no caso Loterj. Também enfrentou condenações e sanções por improbidade administrativa na Justiça Federal em Brasília decorrentes das negociações com a Gtech.",
    sources: [
      { title: "Justiça do Rio condena Waldomiro Diniz a 12 anos de prisão - G1", url: "https://g1.globo.com/rj/rio-de-janeiro/noticia/2012/03/justica-do-rio-condena-waldomiro-diniz-12-anos-de-prisao.html" },
      { title: "Lula demite Waldomiro e Casa Civil nega ligação - Folha de S.Paulo", url: "https://www1.folha.uol.com.br/fsp/brasil/fc1402200402.htm" },
      { title: "Entenda o caso Waldomiro Diniz - Folha de S.Paulo", url: "https://www1.folha.uol.com.br/fsp/brasil/fc1802200402.htm" },
      { title: "Relembre o caso Waldomiro Diniz - G1", url: "https://g1.globo.com/noticias/politica/0,,MUL212852-5601,00.html" }
    ]
  },

  esquema_operacao_vampiro: {
    context: "A Operação Vampiro foi deflagrada pela Polícia Federal em maio de 2004 para desarticular um esquema de fraude, cartel e propinas na compra pública de hemoderivados e medicamentos para o Ministério da Saúde. As investigações demonstraram que o grupo atuava há pelo menos 14 anos na pasta.",
    mechanism: "Servidores públicos da Coordenação-Geral de Recursos Logísticos vazavam editais e valores de referência para lobistas e farmacêuticas internacionais (como Octapharma, LFB e Baxter). Os laboratórios realizavam acordos de cartel para simular concorrência e fatiar os lotes licitatórios, garantindo aditivos contratuais desnecessários mediante o pagamento sistemático de propinas.",
    impact: "R$ 2.000.000.000 (Prejuízo estimado aos cofres públicos pela ausência de concorrência e superfaturamento ao longo de 14 anos; ações do MPF buscaram o ressarcimento de R$ 227 milhões)",
    legalStatus: "A operação resultou no cumprimento de 17 mandados de prisão, exoneração e afastamento de servidores, além de ações civis e criminais movidas pelo MPF contra mais de 30 acusados. Em 2016, o CADE condenou administrativamente o cartel dos hemoderivados com multas milionárias. Como resposta ao escândalo, o governo federal sancionou a criação da estatal Hemobrás para assegurar a produção pública nacional.",
    sources: [
      { title: "Operação Vampiro: Fraude em Licitações de Hemoderivados - Instituto Ética Saúde", url: "https://www.eticasaude.org.br/radar-etica-saude/caso/operao-vampiro-fraude-em-licitaes-de-hemoderivados-braslia-rj-sp-e-pe" },
      { title: "Servidores vendiam segredos das licitações - Folha de S.Paulo", url: "https://www1.folha.uol.com.br/fsp/brasil/fc2505200424.htm" },
      { title: "PF deflagra a Operação Vampiro - Memorial da Democracia", url: "https://memorialdademocracia.com.br/card/deflagrada-a-operacao-vampiro" },
      { title: "MPF processa acusados de fraude a licitações na Saúde - SEDEP", url: "https://www.sedep.com.br/noticias/operao-vampiro-mpf-processa-acusados-de-fraude-a-licitaes-na-sade" },
      { title: "Cade condena cartel dos hemoderivados - CADE", url: "https://www.gov.br/cade/pt-br/assuntos/noticias/cade-condena-cartel-dos-hemoderivados" }
    ]
  },

  esquema_dolares_cueca: {
    context: "O episódio conhecido como o Caso dos 'Dólares na Cueca' ocorreu em 8 de julho de 2005, no Aeroporto de Congonhas, em São Paulo, em meio ao auge das apurações do Escândalo do Mensalão. A Polícia Federal prendeu em flagrante o assessor parlamentar José Adalberto Vieira da Silva, vinculado ao deputado estadual José Guimarães (PT-CE), irmão do então presidente nacional do PT, José Genoino.",
    mechanism: "José Adalberto tentava embarcar para Fortaleza transportando US$ 100 mil ocultos em sua cueca e R$ 209 mil distribuídos em uma mala de mão. O Ministério Público Federal apontou que o dinheiro em espécie correspondia a propina paga pelo empresário Kennedy Moura Ribeiro referente à liberação de financiamentos públicos superior a R$ 150 milhões pelo Banco do Nordeste do Brasil (BNB) para o consórcio Sistema de Transmissão do Nordeste (STN).",
    impact: "R$ 430.000 (Valor total aproximado apreendido em espécie em julho de 2005, composto por US$ 100.000 e R$ 209.000; operação sob suspeita no BNB envolvia R$ 150 milhões)",
    legalStatus: "O escândalo motivou a renúncia de José Genoino da presidência do PT em 2005. Em junho de 2012, o STJ acolheu recurso de José Guimarães, decidindo pela sua inocência e exclusão do processo de improbidade administrativa por ausência de provas. Em agosto de 2021, a Justiça Federal do Ceará reconheceu a prescrição da pretensão punitiva referente aos crimes de lavagem de dinheiro e corrupção imputados aos demais réus.",
    sources: [
      { title: "Dinheiro transportado em cueca era propina, diz MP - Folha de S.Paulo", url: "https://www1.folha.uol.com.br/folha/brasil/ult96u74366.shtml" },
      { title: "STJ livra deputado cujo assessor foi flagrado com dólares na cueca - G1", url: "https://g1.globo.com/politica/noticia/2012/06/stj-livra-deputado-cujo-assessor-foi-flagrado-com-dolares-na-cueca.html" },
      { title: "STJ livra irmão de Genoino do caso 'dólares na cueca' - Folha de S.Paulo", url: "https://m.folha.uol.com.br/poder/2012/06/1112534-stj-livra-irmao-de-genoino-do-caso-dolares-na-cueca.shtml" },
      { title: "Caso do dinheiro na cueca prescreve e petistas escapam da Justiça - Veja", url: "https://veja.abril.com.br/coluna/radar/caso-do-dinheiro-na-cueca-prescreve-e-petistas-escapam-da-justica/" }
    ]
  },

  esquema_mensalao: {
    context: "O Escândalo do Mensalão (Ação Penal 470) eclodiu em junho de 2005 após denúncias do deputado Roberto Jefferson sobre o pagamento sistemático de propinas e mesadas a parlamentares do Congresso Nacional em troca de apoio político às matérias de interesse do Governo Federal no início do primeiro mandato do presidente Luiz Inácio Lula da Silva.",
    mechanism: "A engrenagem envolvia o núcleo político (membros da Casa Civil e diretoria do PT), que coordenava as cotas financeiras, e o núcleo operador/financeiro liderado por Marcos Valério (agências SMP&B e DNA Propaganda), que utilizava repasses fraudulentos de contratos públicos (como o fundo Visanet do Banco do Brasil) e empréstimos simulados nos bancos Rural e BMG para irrigar o caixa dois e abastecer deputados e partidos aliados.",
    impact: "R$ 55.000.000 a R$ 100.000.000 (Valores movimentados pelo esquema de Marcos Valério e empréstimos simulados; auditorias comprovaram o desvio direto de R$ 73 milhões do fundo Visanet do Banco do Brasil)",
    legalStatus: "A Ação Penal 470 foi julgada pelo STF em 2012 e resultou na condenação de 25 réus, incluindo José Dirceu, José Genoino, Delúbio Soares, Marcos Valério, Henrique Pizzolato, Valdemar Costa Neto e Roberto Jefferson, por crimes como corrupção ativa, corrupção passiva, peculato, lavagem de dinheiro e evasão de divisas. As penas foram executadas a partir de 2013.",
    sources: [
      { title: "Entenda o escândalo do Mensalão - G1", url: "https://g1.globo.com/politica/mensalao/noticia/2012/08/entenda-o-mensalao.html" },
      { title: "STF conclui julgamento da Ação Penal 470 - STF Notícias", url: "https://noticias.stf.jus.br/postsnoticias/stf-conclui-julgamento-da-acao-penal-470/" },
      { title: "STF aplica pena de mais de 37 anos de prisão a Marcos Valério - G1", url: "https://g1.globo.com/politica/mensalao/noticia/2012/10/stf-aplica-pena-de-mais-de-37-anos-de-prisao-marcos-valerio.html" },
      { title: "STF define pena de José Genoino em 6 anos e 11 meses de prisão - G1", url: "https://g1.globo.com/politica/mensalao/noticia/2012/10/stf-define-pena-de-jose-genoino-em-6-anos-e-11-meses-de-prisaor.html" },
      { title: "STF fixa pena de Valdemar Costa Neto em 7 anos e 10 meses - G1", url: "https://g1.globo.com/politica/mensalao/noticia/2012/11/stf-fixa-pena-de-valdemar-costa-neto-em-7-anos-e-10-meses.html" }
    ]
  },

  esquema_sanguessugas: {
    context: "A Máfia dos Sanguessugas (ou Escândalo das Ambulâncias) foi desarticulada pela Polícia Federal em maio de 2006 através da Operação Sanguessuga. O esquema consistia no direcionamento ilícito e superfaturamento na compra de ambulâncias e equipamentos médicos para prefeituras brasileiras via verbas do Orçamento Geral da União.",
    mechanism: "Empresários do Grupo Planam (liderados pela família Vedoin) cooptavam parlamentares e assessores para apresentarem emendas orçamentárias alocando verbas do Ministério da Saúde em municípios parceiros. Servidores cooptados agilizavam os convênios na pasta. Nos municípios, a Planam simulava concorrências fraudulentas com empresas fantasmas para vencer as licitações, entregando ambulâncias superfaturadas em até 120% e pagando propinas de 10% a 15% aos congressistas e prefeitos envolvidos.",
    impact: "R$ 110.000.000 (Montante global movimentado pelo esquema entre 2001 e 2006, envolvendo a venda de mais de 1.000 ambulâncias adulteradas ou superfaturadas)",
    legalStatus: "A CPMI dos Sanguessugas recomendou a cassação de dezenas de parlamentares e o indiciamento de 72 congressistas. Embora o Plenário do Congresso não tenha votado as cassações antes das eleições de 2006, a ampla maioria dos investigados não conseguiu se reeleger. Nas esferas cível e criminal da Justiça Federal, foram proferidas diversas condenações por corrupção, estelionato e improbidade administrativa contra os empresários, ex-parlamentares e ex-prefeitos.",
    sources: [
      { title: "Entenda como funcionava a máfia das ambulâncias - G1", url: "https://g1.globo.com/Noticias/Politica/0,,AA1275111-5601,00.html" },
      { title: "Veja lista dos envolvidos com a máfia das ambulâncias - Folha de S.Paulo", url: "https://www1.folha.uol.com.br/folha/especial/2006/eleicoes/acusados-sanguessugas.shtml" },
      { title: "Sanguessugas do dinheiro público - Congresso em Foco", url: "https://www.congressoemfoco.com.br/noticia/94075/sanguessugas-do-dinheiro-publico" },
      { title: "Escândalo dos Sanguessugas - Wikipédia", url: "https://pt.wikipedia.org/wiki/Esc%C3%A2ndalo_dos_Sanguessugas" },
      { title: "Máfia dos sanguessugas / Ações na Justiça Federal - Senado Notícias", url: "https://www2.senado.leg.br/bdsf/bitstream/handle/id/44065/noticia.htm?sequence=1" }
    ]
  },

  esquema_operacao_navalha: {
    context: "A Operação Navalha foi deflagrada pela Polícia Federal em maio de 2007 para desarticular um esquema de fraude em licitações, superfaturamento e pagamentos de propinas em obras públicas federais e estaduais (incluindo o PAC e o programa Luz Para Todos). O epicentro das fraudes era a Construtora Gautama, pertencente ao empresário Zuleido Veras.",
    mechanism: "A Construtora Gautama montava editais de licitação direcionados em governos estaduais (Maranhão, Alagoas, Sergipe, Piauí) e ministérios federais. Executivos da empresa pagavam propinas sistemáticas a servidores e assessores (como Ivo Almeida Costa, assessor especial do Ministério de Minas e Energia) para liberar repasses, aditivos contratuais e atestar medições irregulares.",
    impact: "R$ 178.700.000 (Montante de prejuízos e contratos com irregularidades auditados pela Controladoria-Geral da União na Construtora Gautama)",
    legalStatus: "O escândalo provocou a demissão do ministro de Minas e Energia, Silas Rondeau, e a exoneração de diversos secretários estaduais. Em 2008, a PGR denunciou 61 pessoas ao STJ. Com o desmembramento do processo para varas federais nos estados, ao longo dos anos os procedimentos enfrentaram nulidades de provas grampeadas, prescrições e absolvições nas instâncias regionais.",
    sources: [
      { title: "Confira a lista de presos na Operação Navalha - G1", url: "https://g1.globo.com/Noticias/Politica/0,,MUL38115-5601,00.html" },
      { title: "Operação Navalha - Wikipédia", url: "https://pt.wikipedia.org/wiki/Opera%C3%A7%C3%A3o_Navalha" },
      { title: "Especial Máfia das Obras - Folha Online", url: "https://www1.folha.uol.com.br/folha/especial/2007/mafiadasobras/" },
      { title: "Acusado pela PF, Silas Rondeau entrega o cargo a Lula - Senado Notícias", url: "https://www2.senado.leg.br/bdsf/bitstream/handle/id/406619/noticia.htm?sequence=1&isAllowed=y" },
      { title: "Corrupção desde 2003 desviou mais que o dobro gasto na Copa - Estado de Minas", url: "https://www.em.com.br/app/noticia/politica/2015/03/09/interna_politica,625390/o-que-ja-foi-pelo-ralo.shtml" }
    ]
  },

  esquema_caixa_pandora: {
    context: "A Operação Caixa de Pandora (Mensalão do DF) foi deflagrada pela Polícia Federal em novembro de 2009. A investigação desarticulou uma ampla rede de corrupção instalada no Governo do Distrito Federal durante a gestão do governador José Roberto Arruda (DEM) e do vice Paulo Octávio (DEM).",
    mechanism: "Empresas prestadoras de serviços (especialmente de tecnologia) repassavam entre 10% e 20% do valor de faturas e contratos públicos como retorno ilícito. O ex-secretário Durval Barbosa centralizava a arrecadação e distribuía o dinheiro vivo em 'mesadas' para deputados distritais e secretários para garantir apoio parlamentar e aprovação de contas. A operação teve enorme repercussão pública por contar com dezenas de vídeos gravados pelo próprio delator registrando o recebimento de propina.",
    impact: "R$ 600.000.000 (Estimativa total de propinas e movimentações ilícitas apuradas pela Polícia Federal e pelo MPF)",
    legalStatus: "O escândalo culminou na prisão preventiva de José Roberto Arruda em 2010 (primeiro governador no cargo preso no Brasil) e sua posterior cassação do mandato pelo TSE. Na esfera cível, Arruda e aliados acumulam múltiplas condenações por improbidade administrativa com suspensão de direitos políticos e multas milionárias. Na esfera criminal, a acusação de formação de quadrilha foi declarada extinta por prescrição em 2023.",
    sources: [
      { title: "Operação Caixa de Pandora - Wikipédia", url: "https://pt.wikipedia.org/wiki/Opera%C3%A7%C3%A3o_Caixa_de_Pandora" },
      { title: "Escândalo do Mensalão no Distrito Federal - Wikipédia", url: "https://pt.wikipedia.org/wiki/Esc%C3%A2ndalo_do_Mensal%C3%A3o_no_Distrito_Federal" },
      { title: "Procuradoria denuncia 37 por mensalão do DEM - Senado Notícias", url: "https://www2.senado.leg.br/bdsf/bitstream/handle/id/719450/DF_Corrupcao_P005_R0134.pdf?sequence=1" },
      { title: "Pandora: Arruda é condenado por improbidade administrativa pela 6ª vez - Metrópoles", url: "https://www.metropoles.com/colunas/grande-angular/pandora-arruda-e-condenado-por-improbidade-administrativa-pela-6a-vez" },
      { title: "Caixa de Pandora: Justiça do DF mantém condenação de Arruda - G1 DF", url: "https://g1.globo.com/df/distrito-federal/noticia/2026/06/15/caixa-de-pandora-justica-mantem-condenacao-de-arruda-e-mais-tres-por-improbidade.ghtml" },
      { title: "Com prescrição, Arruda, Paulo Octávio e 18 réus livram-se da acusação - Metrópoles", url: "https://www.metropoles.com/colunas/grande-angular/caixa-de-pandora-com-prescricao-arruda-paulo-octavio-e-18-reus-livram-se-da-acusacao-de-formacao-de-quadrilha" }
    ]
  },

  esquema_trensalao: {
    context: "O Trensalão (ou Máfia dos Trens de SP) veio à tona em maio de 2013, após a multinacional alemã Siemens assinar um acordo de leniência com o CADE e o Ministério Público Federal. A empresa revelou a existência de um cartel formado por multinacionais para combinar propostas e dividir licitações de compra, manutenção e modernização de trens da CPTM e do Metrô de São Paulo entre 1998 e 2008.",
    mechanism: "As multinacionais participantes (Siemens, Alstom, CAF, Bombardier, entre outras) reuniam-se previamente para definir o consórcio vencedor de cada edital, apresentando propostas de cobertura inflacionadas para simular concorrência. As empresas perdedoras eram recompensadas via subcontratações cruzadas. Para irrigar propinas direcionadas a diretores das estatais e políticos, as empresas utilizavam contratos simulados com empresas de consultoria de fachada (como a Procint), alimentando contas bancárias secretas mantidas na Suíça.",
    impact: "R$ 9.400.000.000 (Soma dos contratos licitatórios afetados pelas ações do cartel entre 1998 e 2008, gerando sobrepreço estimado entre R$ 800 milhões e R$ 1,5 bilhão aos cofres públicos estaduais)",
    legalStatus: "Em julho de 2019, o CADE condenou 11 empresas e 42 pessoas físicas, aplicando R$ 535 milhões em multas e banindo a Alstom de licitações federais por 5 anos. Na esfera penal, a Polícia Federal indiciou 33 pessoas em 2014. O Ministério Público ajuizou diversas ações civis de improbidade e sequestro de bens no exterior, enquanto parte das acusações criminais contra executivos sofreu absolvições ou prescrições devido a disputas de competência judicial e exigências de provas materiais diretas.",
    sources: [
      { title: "Cade condena 11 empresas e 42 pessoas por cartel de trens e metrôs - G1", url: "https://g1.globo.com/economia/noticia/2019/07/08/cade-condena-11-empresas-e-42-pessoas-por-cartel-de-trens-e-metros.ghtml" },
      { title: "PF conclui inquérito do cartel dos trens em SP e indicia 33 pessoas - G1", url: "https://g1.globo.com/sao-paulo/noticia/2014/12/pf-conclui-inquerito-do-cartel-dos-trens-e-indicia-33-pessoas.html" },
      { title: "PF indicia consultor por lavagem de dinheiro em cartel no Metrô de SP - G1", url: "https://g1.globo.com/sao-paulo/noticia/2013/11/pf-indicia-consultor-por-lavagem-de-dinheiro-em-cartel-no-metro-de-sp.html" },
      { title: "Consultor confirma ter pago US$ 250 mil para ex-diretor da CPTM - Jornal Nacional", url: "https://g1.globo.com/jornal-nacional/noticia/2014/01/consultor-confirma-ter-pago-us-250-mil-para-ex-diretor-da-cptm.html" },
      { title: "O cartel dos trens leva a maré anticorrupção para São Paulo - EL PAÍS Brasil", url: "https://brasil.elpais.com/brasil/2014/12/05/politica/1417813172_432211.html" }
    ]
  },

  esquema_operacao_zelotes: {
    context: "A Operação Zelotes foi deflagrada pela Polícia Federal em março de 2015 para desarticular um esquema criminoso atuante no Conselho Administrativo de Recursos Fiscais (CARF), órgão do Ministério da Fazenda responsável por julgar recursos tributários. Em fases subsequentes, a operação expandiu seu escopo para apurar a compra e venda de Medidas Provisórias destinadas à concessão de incentivos fiscais ao setor automotivo.",
    mechanism: "O esquema no CARF funcionava através do vazamento de informações sigilosas sobre pautas de julgamento por conselheiros e servidores cooptados para escritórios de advocacia e consultorias privadas (como S3 Gestão e SGR Consultoria). Lobistas contatavam grandes devedores do Fisco oferecendo decisões favoráveis e redução de autuações bilionárias mediante pagamento de propinas maquiadas como honorários. Na frente legislativa, lobistas receberam dezenas de milhões de montadoras de veículos (como MMC Mitsubishi e CAOA) para atuar junto a agentes públicos e garantir a extensão de benefícios tributários via Medidas Provisórias (como a MP 471/2009 e a MP 627/2013).",
    impact: "R$ 19.000.000.000 (Soma dos débitos cobrados pela Receita Federal em processos fiscais sob suspeita no CARF, com fraudes diretas auditadas de R$ 5,7 bilhões e R$ 32 milhões rastreados em repasses de lobistas das montadoras)",
    legalStatus: "O escândalo motivou a alteração integral do regimento interno do CARF e regras de impedimento de conselheiros. Na esfera criminal, executivos de montadoras e lobistas foram condenados pela Justiça Federal do DF por corrupção e lavagem de dinheiro. Por outro lado, denunciados políticos no braço das Medidas Provisórias (como o ex-presidente Lula) foram absolvidos por falta de provas materiais de contrapartida em 2021, e investigações relativas ao ex-ministro Guido Mantega foram trancadas pela Justiça em 2025.",
    sources: [
      { title: "Entenda a Operação Zelotes - G1", url: "https://g1.globo.com/politica/noticia/2016/02/entenda-operacao-zelotes.html" },
      { title: "Entenda a Operação Zelotes da Polícia Federal - Folha de S.Paulo", url: "https://www1.folha.uol.com.br/mercado/2015/04/1611246-entenda-a-operacao-zelotes-da-policia-federal.shtml" },
      { title: "Operação Zelotes - Wikipédia", url: "https://pt.wikipedia.org/wiki/Opera%C3%A7%C3%A3o_Zelotes" },
      { title: "CPI do CARF - Senado Notícias", url: "https://www12.senado.leg.br/noticias/materias/2015/07/09/cpi-do-carf-pode-quebrar-sigilos-de-presidente-da-mitsubishi-no-brasil" }
    ]
  },

  esquema_operacao_porto_seguro: {
    context: "A Operação Porto Seguro foi deflagrada pela Polícia Federal e pelo Ministério Público Federal em novembro de 2012 para desarticular uma organização criminosa infiltrada em órgãos públicos federais e agências reguladoras dedicada à negociação, elaboração e compra de pareceres técnicos e jurídicos fraudulentos.",
    mechanism: "O grupo utilizava a influência de Rosemary Noronha, chefe do escritório da Presidência em SP, para nomear e manter aliados em cargos estratégicos (como Paulo Vieira na ANA e Rubens Vieira na ANAC). A rede cooptou autoridades como o vice-advogado-geral da União, José Weber Holanda, expedindo pareceres sob encomenda para beneficiar empresas privadas em projetos portuários em Santos e concessões imobiliárias em ilhas marítimas em troca de vantagens indevidas e propinas.",
    impact: "R$ 1.300.000.000 a R$ 2.000.000.000 (Valores dos contratos portuários em Santos e empreendimentos imobiliários nas ilhas de Bagre/Cabras beneficiados pelos pareceres encomendados)",
    legalStatus: "A eclosão do caso resultou na exoneração de Rosemary Noronha e José Weber, além da demissão dos irmãos Vieira das agências reguladoras. O MPF denunciou 24 pessoas por corrupção, tráfico de influência e falsidade ideológica. Contudo, em outubro de 2021, o TRF-3 e a Justiça Federal anularam as interceptações telefônicas e telemáticas que fundamentavam o processo por ilegalidades probatórias, determinando o trancamento definitivo da ação penal.",
    sources: [
      { title: "PF deflagra operação para desarticular esquema de pareceres - G1", url: "https://g1.globo.com/politica/noticia/2012/11/pf-deflagra-operacao-para-desarticular-esquema-de-pareceres.html" },
      { title: "Rosemary usou e-mail oficial para pedir dinheiro - Folha de S.Paulo", url: "https://m.folha.uol.com.br/poder/2012/11/1192314-rosemary-usou-e-mail-oficial-para-pedir-dinheiro-a-grupo-investigado.shtml" },
      { title: "Auditor diz que recebeu de esquema a fim de reunir provas para a PF - G1", url: "https://g1.globo.com/politica/noticia/2012/11/auditor-diz-que-recebeu-de-esquema-fim-de-reunir-provas-para-pf.html" },
      { title: "Adams admite que errou ao confiar em Weber - Senado Notícias", url: "https://www12.senado.leg.br/noticias/materias/2012/12/05/adams-admite-que-errou-ao-confiar-em-weber-e-a-anuncia-medidas-para-evitar-irregularidades" },
      { title: "Justiça Federal em SP encerra ação penal contra Rosemary Noronha - G1", url: "https://g1.globo.com/sp/sao-paulo/noticia/2021/10/19/justica-federal-em-sp-encerra-acao-penal-contra-rosemary-noronha-ex-assessora-de-lula.ghtml" }
    ]
  },

  esquema_lava_jato: {
    context: "A Operação Lava Jato foi deflagrada pela Polícia Federal em março de 2014, inicialmente focada em desarticular redes de lavagem de dinheiro operadas por doleiros. Com os desdobramentos e acordos de delação premiada (destacadamente do ex-diretor Paulo Roberto Costa e do doleiro Alberto Youssef), a operação revelou um megaprocesso de corrupção sistêmica e loteamento político das diretorias da Petrobras, denominado Petrolão.",
    mechanism: "O esquema operava através de um cartel formado pelas maiores empreiteiras do país (como Odebrecht, OAS, Camargo Corrêa e Andrade Gutierrez), que combinavam resultados em licitações e superfaturavam contratos de grandes obras da estatal. Uma cota entre 1% e 3% dos contratos era desviada via contratos fictícios de consultoria para o pagamento de propinas a executivos da Petrobras e a partidos políticos encarregados do apadrinhamento das diretorias (PT, PMDB e PP), com o suporte de operadores e doleiros no exterior e em entregas de dinheiro vivo.",
    impact: "R$ 6.200.000.000 (Perdas diretas por corrupção admitidas pela Petrobras em balanço oficial, dentro de estimativas globais de movimentações ilícitas superiores a R$ 42 bilhões e devoluções negociadas em leniências de R$ 25 bilhões)",
    legalStatus: "A operação promoveu centenas de prisões e condenações de altos executivos, operadores e lideranças políticas brasileiras (incluindo o ex-presidente Lula, o ex-governador Sérgio Cabral e o ex-deputado Eduardo Cunha). A partir de 2019, o STF promoveu inflexões jurídicas: extinguiu a prisão após condenação em segunda instância, declarou a incompetência da 13ª Vara Federal de Curitiba para julgar diversos casos e reconheceu a suspeição do ex-juiz Sérgio Moro, anulando as condenações do ex-presidente Lula e trancando ou anulando diversos processos e acórdãos conexos por vícios de instrução probatória.",
    sources: [
      { title: "Petrobras admite perda de R$ 6,2 bi com corrupção - G1", url: "https://g1.globo.com/politica/operacao-lava-jato/noticia/2015/04/petrobras-admite-perda-de-r-62-bi-com-corrupcao-e-tem-prejuizo-em-2014.html" },
      { title: "Doleiro diz que PT, PMDB e PP recebiam propina da Petrobras - G1", url: "https://g1.globo.com/politica/operacao-lava-jato/noticia/2014/10/doleiro-diz-que-pt-pmdb-e-pp-recebiam-propina-da-petrobras.html" },
      { title: "Fachin anula condenações de Lula relacionadas à Lava Jato - G1", url: "https://g1.globo.com/politica/noticia/2021/03/08/fachin-anula-condenacoes-de-lula-relacionadas-a-lava-jato.ghtml" },
      { title: "Eduardo Cunha é condenado a 15 anos e 4 meses de prisão na Lava Jato - G1", url: "https://g1.globo.com/pr/parana/noticia/2017/03/eduardo-cunha-e-condenado-15-anos-e-quatro-meses-de-prisao-na-lava-jato.html" },
      { title: "Odebrecht e Braskem assinam acordo de leniência com MPF - G1", url: "https://g1.globo.com/politica/operacao-lava-jato/noticia/odebrecht-e-braskem-assinam-acordo-de-leniencia-com-mpf.ghtml" }
    ]
  }

};