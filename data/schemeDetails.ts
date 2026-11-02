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
}

};