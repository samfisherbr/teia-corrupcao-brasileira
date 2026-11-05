/**
 * ============================================================================
 * TEXTOS DO GLOSSÁRIO — um registro por esquema
 * ============================================================================
 * A CHAVE de cada registro precisa ser idêntica ao `id` do nó `scheme` no
 * banco (ex.: esquema_lava_jato). Se não bater, o cartão do Glossário aparece
 * sem o dossiê e o infográfico financeiro não encontra o `impact`.
 *
 * Novos registros vêm da Fase 2 do Master Prompt. Regras de formato:
 *  - impact: comece pela cifra principal ("R$ 6.200.000.000 (…)") — o
 *    infográfico lê a PRIMEIRA cifra do texto quando os links não têm valor.
 *  - legalStatus: termine com a situação do caso e a data da verificação.
 *  - aspas duplas dentro do texto: escape com \".
 * ============================================================================
 */
/** Formato de cada registro (usado pelo HeaderOverlay → Glossário). */
export interface SchemeDetail {
  context: string;
  mechanism: string;
  impact: string;
  legalStatus: string;
  sources: { title: string; url: string }[];
}

export const SCHEME_DETAILS: Record<string, SchemeDetail> = {

  "esquema_pc_farias": {
    context: "Fernando Collor de Mello, eleito presidente em 1989 pelo PRN, manteve no centro do governo o empresário alagoano Paulo César Cavalcante Farias, o PC Farias, tesoureiro de suas campanhas de 1986 e 1989. Em maio de 1992, Pedro Collor de Mello acusou, em entrevista à revista Veja, o irmão de se beneficiar de uma rede de tráfico de influência intermediada por PC Farias. A denúncia originou o Requerimento 52 de 1992, que criou a Comissão Parlamentar Mista de Inquérito do chamado esquema PC Farias, instalada em 1º de junho de 1992 com presidência do deputado Benito Gama, vice-presidência do senador Maurício Corrêa e relatoria do senador Amir Lando.",
    mechanism: "Conforme o relatório final da CPMI, aprovado por 16 votos a 5 em 26 de agosto de 1992, empresários pagavam a PC Farias para obter contratos, nomeações e decisões do governo, e os recursos circulavam por empresas ligadas ao tesoureiro, entre elas a EPC e a Brasil-Jet, e por contas bancárias abertas com nomes fictícios, as chamadas contas fantasmas. O relatório dedica capítulos próprios à CEME, às operações externas, aos aspectos tributários do esquema e à chamada Operação Uruguai. Depoimentos à comissão, entre eles o do ex-motorista Francisco Eriberto Freire França, indicaram que despesas pessoais do presidente e da Casa da Dinda eram quitadas por esse circuito; Collor negou as acusações e sustentou que os valores eram sobras de recursos de campanha.",
    impact: "R$ 35.486.100,00 é a estimativa registrada no relatório da CPMI, de 24 de agosto de 1992, para os valores transferidos irregularmente a fim de custear gastos pessoais do presidente ao longo do mandato; o critério é a apuração parlamentar de repasses por contas fantasmas, e não um prejuízo contábil apurado pela União. O relatório final soma 371 páginas e separa a arrecadação junto a empresários, a movimentação de recursos pelos operadores do esquema e suas operações externas. Nas fontes abertas não foi localizada cifra oficial consolidada de valor desviado, de prejuízo apurado ou de valor recuperado pelo Estado.",
    legalStatus: "A Câmara autorizou o processo por crime de responsabilidade em 29 de setembro de 1992 e, pela Resolução 101 do Senado, publicada em 30 de dezembro de 1992, Collor foi condenado à inabilitação para o exercício de função pública por oito anos, mesmo tendo renunciado antes do julgamento; o pedido de perda do cargo foi considerado prejudicado pela renúncia. Na esfera criminal, a Ação Penal 307, relatada pelo ministro Ilmar Galvão e julgada pelo STF em sessões de 7, 9, 12 e 13 de dezembro de 1994, absolveu Collor da acusação de corrupção passiva por falta de provas, por 5 votos a 3, enquanto PC Farias foi condenado a sete anos por falsidade ideológica ligada às contas fantasmas, somados a condenação anterior por sonegação fiscal na 10ª Vara Federal de Brasília. PC Farias obteve liberdade condicional do STF em dezembro de 1995 e foi morto a tiros em 23 de junho de 1996, em Maceió, ao lado de Suzana Marcolino; o STF arquivou em 2002 a acusação contra Augusto Farias por falta de provas e o júri de Maceió absolveu em 2013 os quatro policiais militares denunciados, deixando as mortes sem culpados reconhecidos. Situação em novembro de 2026: o esquema não resultou em condenação criminal de Collor, cuja prisão determinada em 2025 decorre de ação penal diversa, originada na Operação Lava Jato.",
    sources: [
      { title: "Relatório final da Comissão Parlamentar Mista de Inquérito: CPMI - P.C.Farias", url: "https://www2.senado.leg.br/jspui/handle/id/88802" },
      { title: "CPMI - Esquema PC Farias: tramitação do Requerimento nº 52, de 1992", url: "https://www2.camara.leg.br/atividade-legislativa/plenario/discursos/escrevendohistoria/20-anos-do-impeachment/cpmi-pc-farias" },
      { title: "Collor - Julgados históricos", url: "https://www.tse.jus.br/jurisprudencia/julgados-historicos/collor" },
      { title: "Ação Penal 307 - Descrição", url: "https://portal.stf.jus.br/textos/verTexto.asp?servico=sobreStfConhecaStfJulgamentoHistorico&pagina=STFdescricaoAP307" },
      { title: "Condenação de PC Farias por esquema de corrupção completa 25 anos", url: "https://www.migalhas.com.br/quentes/302364/condenacao-de-pc-farias-por-esquema-de-corrupcao-completa-25-anos" },
      { title: "Relembre como foi o impeachment de Collor", url: "https://istoedinheiro.com.br/relembre-como-foi-o-impeachment-de-collor" },
      { title: "Filme revisita história do Brasil a partir da trajetória de PC Farias", url: "https://agenciabrasil.ebc.com.br/geral/noticia/2024-03/filme-revisita-historia-do-brasil-partir-da-trajetoria-de-pc-farias" }
    ]
  },

  "esquema_anoes_orcamento": {
    context: "A Constituição de 1988 permitiu que deputados e senadores incluíssem verbas no Orçamento da União por meio de emendas, e um grupo de parlamentares de baixa estatura e pouca projeção passou a controlar a Comissão Mista de Orçamento. Uma reportagem de O Globo sobre verbas para Serra Dourada (BA), base do relator João Alves, derrubou-o da relatoria. O caso só veio a público em 1993, quando o assessor técnico José Carlos Alves dos Santos, preso pelo assassinato da mulher, passou a denunciar o esquema. As denúncias originaram a CPMI do Orçamento, presidida por Jarbas Passarinho e relatada por Roberto Magalhães.",
    mechanism: "Parlamentares aprovavam emendas para obras e usavam influência para que determinada empreiteira vencesse a licitação, recebendo de volta parte dos recursos. A palavra final cabia ao relator-geral, apoiado pelo conhecimento técnico da assessoria da comissão. Segundo a CPI, João Alves lavava o dinheiro comprando bilhetes de loteria já premiados, o que ele atribuiu à sorte. A subcomissão de bancos apontou movimentações incompatíveis com a renda de deputados e cheques repassados entre eles.",
    impact: "Não há cifra oficial verificada do total desviado; os valores documentados são parciais. A CPI apontou que Genebaldo Correia movimentou quase R$ 10.918.800,00 entre 1989 e 1993 e que João Alves movimentava por mês cerca de 300 vezes o salário de deputado. Um relatório interno da Odebrecht apreendido em 1993 ligava 63 emendas do Orçamento de 1992 a contratos de R$ 3.526.772.400,00, valor de faturamento esperado, e não de desvio. Nenhuma recuperação de recursos aos cofres públicos foi localizada.",
    legalStatus: "A CPI pediu 18 cassações: seis parlamentares foram cassados, entre eles o ex-presidente da Câmara Ibsen Pinheiro, quatro renunciaram, entre eles João Alves e Genebaldo Correia, e oito foram inocentados em plenário, entre eles Ricardo Fiúza. A ação criminal contra Ibsen foi arquivada por falta de provas, e ele voltou à Câmara em 2006. O assessor José Carlos Alves dos Santos foi condenado por corrupção passiva e preso em 2014, com trânsito em julgado; em 2015, o STJ reduziu sua pena para 7 anos, 9 meses e 10 dias. Situação em novembro de 2026: caso encerrado no Congresso, sem processo criminal em curso localizado. Última atualização verificada em 4 de novembro de 2026.",
    sources: [
      { title: "Estrago político do mensalão supera caso dos anões (O Estado de S. Paulo, 2006)", url: "https://www2.senado.leg.br/jspui/bitstream/id/317130/3/complemento_2.htm" },
      { title: "Esquema foi desvendado pela imprensa (Correio da Manhã, 2023)", url: "https://www.correiodamanha.com.br/especiais/2023/11/102129-esquema-foi-desvendado-pela-imprensa.html" },
      { title: "Ex-chefe de orçamento do Senado é preso em Brasília por corrupção (Congresso em Foco, 2014)", url: "https://www.congressoemfoco.com.br/noticia/54231/ex-chefe-de-orcamento-do-senado-e-preso-em-brasilia-por-corrupcao" },
      { title: "Atenuante de confissão espontânea reduz pena de delator de escândalo (OAB-RS, 2015)", url: "https://www2.oabrs.org.br/jornalDaOrdem/atenuante-de-confissao-espontanea-reduz-pena-de-delator-de-escandalo/36177" },
      { title: "Morre o ex-presidente da Câmara Ibsen Pinheiro (Agência Brasil, 2020)", url: "https://www.tnh1.com.br/noticia/nid/morre-o-ex-presidente-da-camara-ibsen-pinheiro/" },
      { title: "A cobertura de luxo de Ibsen Pinheiro, mais de 30 anos depois (Brazil Journal, 2026)", url: "https://braziljournal.com/a-cobertura-de-luxo-de-ibsen-pinheiro-mais-de-30-anos-depois" },
      { title: "CPI descobre que Genebaldo teve depósitos de US$ 2 milhões (O Globo, 1993)", url: "https://www2.senado.leg.br/jspui/bitstream/id/699336/1/CPI_Orcamento_P008_R0167.pdf" },
      { title: "Relatório final da CPMI do Orçamento (Biblioteca Digital do Senado, 1994)", url: "https://www2.senado.leg.br/jspui/handle/id/84896?mode=full" }
    ]
  },

  "esquema_sivam": {
    context: "O Sistema de Vigilância da Amazônia foi concebido em 1990 e contratado com dispensa de licitação, depois que 16 embaixadas indicaram empresas. As resoluções do Senado de 1994 nomearam a Raytheon como fornecedora e a ESCA como integradora nacional. O escândalo veio a público em novembro de 1995, quando a revista IstoÉ publicou trechos de um grampo da Polícia Federal no telefone do chefe do Cerimonial da Presidência.",
    mechanism: "A PF obteve autorização judicial para grampear o embaixador Júlio César Gomes dos Santos alegando suspeita de tráfico de drogas. As conversas, gravadas em setembro de 1995, mostram José Afonso Assumpção, dono da Líder Táxi Aéreo e representante da Raytheon, pedindo que o embaixador ajudasse a destravar o Sivam no Senado. O embaixador viajou aos EUA em avião do empresário. Um agente da PF entregou a fita a Xico Graziano, que a levou ao presidente. Embaixador, empresário e Raytheon negaram lobby ou suborno.",
    impact: "R$ 7.615.863.000,00 em financiamento externo autorizado pelo Senado em 1994, dos quais R$ 6.087.231.000,00 para a Raytheon e subcontratadas. Com juros e comissões, o total chegava a R$ 9.663.138.000,00. Nenhuma fonte apurou valor desviado, prejuízo ou valor recuperado.",
    legalStatus: "O embaixador foi exonerado em 17/11/1995 e o ministro da Aeronáutica, Mauro Gandra, deixou o cargo. O processo disciplinar do Itamaraty foi arquivado em 1996. A CPI da Câmara concluiu em 2002 haver indícios de advocacia administrativa, exploração de prestígio e corrupção ativa e remeteu o relatório ao MPF. Situação em novembro de 2026: não foram localizadas denúncia, sentença ou extinção da punibilidade nas fontes consultadas.",
    sources: [
      { title: "Relatório Final da CPI do Sivam", url: "https://www2.camara.leg.br/atividade-legislativa/comissoes/comissoes-temporarias/parlamentar-de-inquerito/51-legislatura/cpisivam/relatoriofinal.pdf" },
      { title: "Resolução nº 97, de 1994 - Publicação Original", url: "https://www2.camara.leg.br/legin/fed/ressen/1994/resolucao-97-27-dezembro-1994-392017-publicacaooriginal-1-pl.html" },
      { title: "CPI do Sivam quer ver contas de Júlio César nos EUA", url: "https://www.camara.leg.br/noticias/12789-cpi-do-sivam-quer-ver-contas-de-julio-cesar-nos-eua/" },
      { title: "Raytheon Denies Bribery In Brazil", url: "https://www.spokesman.com/stories/1995/nov/19/raytheon-denies-bribery-in-brazil/" },
      { title: "Big Surveillance Project For the Amazon Jungle Teeters Over Scandals", url: "https://www.csmonitor.com/1996/0125/25071.html" },
      { title: "CPI - SIVAM: depoimento de Francisco Graziano (30/10/2001)", url: "https://www2.camara.leg.br/atividade-legislativa/comissoes/comissoes-temporarias/parlamentar-de-inquerito/51-legislatura/cpisivam/notas/nt301001.pdf" }
    ]
  },

  "esquema_trt_sp": {
    context: "Em 1992, o Tribunal Regional do Trabalho da 2ª Região, presidido pelo juiz Nicolau dos Santos Neto, abriu a licitação para construir o Fórum Trabalhista da Barra Funda, em São Paulo, vencida pela construtora Incal. O caso veio a público em 1998, depois que um ex-genro do juiz denunciou ao Ministério Público Federal seu patrimônio incompatível com o salário de magistrado. A CPI do Judiciário, em 1999, quebrou sigilos e chegou às empresas do senador Luiz Estevão, cassado pelo Senado em junho de 2000.",
    mechanism: "Segundo o MPF, a Incal Incorporações, de Fábio Monteiro de Barros e José Eduardo Ferraz, e o Grupo OK, de Luiz Estevão, combinaram-se para disputar a licitação, e a execução da obra teve superfaturamento de materiais, pagamentos antecipados e transferências ilícitas para contas no Brasil e no exterior. Uma auditoria constatou que, seis anos após a licitação, só 64% da obra estava pronta, embora toda a verba já tivesse sido liberada. A quebra de sigilos mostrou transferências da Incal para o Grupo OK coincidentes com os pagamentos do tribunal. Os réus negam os desvios.",
    impact: "R$ 169.400.000 desviados em valores de 1998, segundo o MPF, que em 2017 cobrou R$ 1,04 bilhão em ressarcimento, somando o desvio corrigido e danos morais. Em 2012, o Grupo OK firmou acordo de R$ 468 milhões com a AGU e pagou R$ 338 milhões até suspender as parcelas, em março de 2016. Em 2023, a AGU retomou a cobrança de uma dívida de mais de R$ 800 milhões decorrente da condenação no TCU; Luiz Estevão afirma que os valores penhorados já quitam o débito.",
    legalStatus: "Nicolau dos Santos Neto, Luiz Estevão, Fábio Monteiro de Barros e José Eduardo Ferraz foram condenados em definitivo; o STF manteve em 2015 a pena de 31 anos e 6 meses de Estevão e Monteiro de Barros, reduzida a cerca de 26 anos pela prescrição de dois crimes. Nicolau teve a pena extinta por indulto em 2014 e morreu em 2020; Estevão foi preso em 2016 e obteve o regime aberto em 2021; Ferraz foi preso em 2017. O ex-presidente do TRT-2 Délvio Buffulin foi absolvido em todas as instâncias, com a ação de improbidade extinta pelo STJ em 2024. Situação em novembro de 2026: condenações criminais transitadas em julgado e execução cível contra o Grupo OK em curso, conforme último registro verificado, de junho de 2023.",
    sources: [
      { title: "MPF pede ressarcimento de R$ 1 bilhão por desvios em obra do TRT de São Paulo", url: "https://agenciabrasil.ebc.com.br/geral/noticia/2017-09/mpf-pede-ressarcimento-de-r-1-bilhao-por-desvios-em-obra-do-trt-de-sao-paulo" },
      { title: "Senado cassa mandato de Luiz Estevão", url: "https://www12.senado.leg.br/noticias/materias/2000/06/28/senado-cassa-mandato-de-luiz-estevao" },
      { title: "STF mantém em 31 anos e 6 meses condenação do ex-senador Luís Estevão", url: "https://www.gazetadopovo.com.br/vida-publica/stf-mantem-em-31-anos-e-6-meses-condenacao-do-ex-senador-luis-estevao-087kfze3j3fs09gt8dukkgzxm/" },
      { title: "Governo recupera R$ 468 milhões desviados do TRT-SP", url: "https://www.congressoemfoco.com.br/noticia/75291/governo-recupera-r-468-milhoes-desviados-do-trt-sp" },
      { title: "Condenado por desvio no TRT paulista, ex-juiz Lalau deixa a prisão", url: "https://www.congressoemfoco.com.br/noticia/50251/condenado-por-desvio-no-trt-paulista-ex-juiz-lalau-deixa-a-prisao" },
      { title: "Mantida condenação de Lalau e Luiz Estevão por desvio de verbas", url: "https://www.migalhas.com.br/quentes/189701/mantida-condenacao-de-lalau-e-luiz-estevao-por-desvio-de-verbas" },
      { title: "STJ extingue ação de improbidade contra ex-presidente do TRT-2", url: "https://www.migalhas.com.br/quentes/413553/stj-extingue-acao-de-improbidade-contra-ex-presidente-do-trt-2" },
      { title: "AGU cobrará dívida do Grupo OK por desvios nas obras do TRT-SP", url: "https://www.poder360.com.br/justica/agu-cobrara-divida-do-grupo-ok-por-desvios-nas-obras-do-trt-sp/" }
    ]
  },

  "esquema_compra_reeleicao": {
    context: "A emenda constitucional que permitiu a reeleição para presidente, governadores e prefeitos foi articulada desde 1995 e aprovada em primeiro turno na Câmara em 28 de janeiro de 1997, por 336 votos a 17. Em 13 e 14 de maio de 1997, a Folha de S.Paulo divulgou gravações feitas a pedido do jornal em que deputados do Acre admitiam ter vendido o voto.",
    mechanism: "Nas fitas, os deputados Ronivon Santiago e João Maia, do PFL do Acre, diziam ter recebido R$ 200 mil cada um. Ronivon descrevia repasses do governador do Amazonas, Amazonino Mendes, ao governador do Acre, Orleir Cameli, e citava os colegas Chicão Brígido, Zila Bezerra e Osmir Lima; a reportagem apontava ainda o ministro Sérgio Motta e o deputado Luís Eduardo Magalhães como operadores. Os citados negaram, e Ronivon disse que a conversa fora uma brincadeira. Em delação de 2016, sem prova judicial, Pedro Corrêa afirmou que mais de 50 deputados venderam o voto.",
    impact: "R$ 200 mil por deputado, valor citado nas gravações por Ronivon Santiago e João Maia, sem confirmação judicial. Não há cifra oficial de valor desviado, prejuízo ou recuperação, porque nenhuma investigação quantificou o esquema. A emenda foi aprovada e permitiu a reeleição de FHC em 1998.",
    legalStatus: "Ronivon Santiago e João Maia foram expulsos do PFL e renunciaram aos mandatos em maio de 1997, e a CPI pedida pela oposição foi barrada pela base governista. Chicão Brígido, Zila Bezerra e Osmir Lima foram absolvidos na Câmara em junho de 1998, a investigação da PF foi arquivada e o procurador-geral Geraldo Brindeiro não acolheu as representações contra FHC, que sempre negou participação. Situação em novembro de 2026: nenhuma denúncia, ação penal ou investigação em curso localizada; caso nunca esclarecido pelas autoridades (verificação em 4 de novembro de 2026).",
    sources: [
      { title: "CPMI ouve ex-deputado sobre compra de votos para reeleição", url: "https://www.camara.leg.br/noticias/74853-cpmi-ouve-ex-deputado-sobre-compra-de-votos-para-reeleicao/" },
      { title: "Ecos de um escândalo", url: "https://www.congressoemfoco.com.br/noticia/101937/ecos-de-um-escandalo" },
      { title: "Os rolos judiciais de uma dupla do barulho", url: "https://www.congressoemfoco.com.br/noticia/101941/os-rolos-judiciais-de-uma-dupla-do-barulho" },
      { title: "Ex-deputado nega envolvimento com escândalo da reeleição", url: "https://www.congressoemfoco.com.br/noticia/103484/ex-deputado-nega-envolvimento-com-escandalo-da-reeleicao" },
      { title: "Pronunciamento de Eduardo Suplicy em 13/05/1997", url: "https://www25.senado.leg.br/web/atividade/pronunciamentos/-/p/pronunciamento/205577" },
      { title: "Governo FHC comprou votos para aprovar reeleição, diz delator da Lava Jato", url: "https://www.gazetadopovo.com.br/vida-publica/governo-fhc-comprou-votos-para-aprovar-reeleicao-diz-delator-da-lava-jato-0vmyu2n3ahzyjzchy7jffo50c/" },
      { title: "FHC faz mea-culpa e afirma que emenda que permitiu reeleição foi um erro", url: "https://www.folhape.com.br/politica/fhc-faz-mea-culpa-e-afirma-que-emenda-que-permitiu-reeleicao-foi-um/153848/" }
    ]
  },

  "esquema_grampos_bndes": {
    context: "Em 29 de julho de 1998, o governo Fernando Henrique Cardoso privatizou o Sistema Telebrás em doze leilões na Bolsa de Valores do Rio de Janeiro, na maior venda de estatal da história brasileira. O modelo havia sido desenhado pelo ministro das Comunicações Sérgio Motta, morto em abril daquele ano e substituído por Luiz Carlos Mendonça de Barros, que deixou a presidência do BNDES para o cargo. Semanas depois do leilão, fitas gravadas por meio de grampo ilegal em telefones do BNDES vieram a público e levantaram suspeitas de favorecimento a um dos consórcios. A autoria do grampo nunca foi estabelecida.",
    mechanism: "As gravações divulgadas pela imprensa mostravam Mendonça de Barros, o presidente do BNDES André Lara Resende, o vice Pio Borges e o sócio do Opportunity Pérsio Arida articulando a adesão do Previ, fundo de pensão dos funcionários do Banco do Brasil, ao consórcio liderado pelo banco de Daniel Dantas. Para conseguir essa adesão, os interlocutores mencionavam recorrer à influência do presidente da República, a quem chamavam de \"bomba atômica\". Em paralelo, o Banco do Brasil concedeu 30 cartas de fiança a licitantes, uma delas ao Opportunity a pedido do ministro. O diretor do banco envolvido nas conversas sustenta que os empréstimos-ponte e as fianças visavam ampliar a concorrência e o ágio, e que nunca manipulou fundos de pensão.",
    impact: "R$ 22.058.000.000 foi a arrecadação do leilão de 29 de julho de 1998, com ágio médio de 63,7% sobre o preço mínimo, referente ao controle das doze empresas resultantes da cisão da Telebrás. O Banco do Brasil emitiu 30 cartas de fiança a participantes das licitações, sem valor agregado consolidado em fontes abertas. Nenhum prejuízo ao erário foi apurado: a sentença de 2009 apoiou-se em parecer do Tribunal de Contas da União segundo o qual os atos dos acusados não causaram danos aos cofres públicos.",
    legalStatus: "O escândalo derrubou o ministro das Comunicações, o presidente do BNDES e dirigentes do Banco do Brasil e do Previ, mas não produziu condenação. Em 4 de março de 2009, o juiz da 17ª Vara Federal de Brasília julgou improcedente a ação de improbidade do MPF, absolvendo Mendonça de Barros, André Lara Resende, José Pio Borges e o ex-presidente da Anatel Renato Guerreiro. Em litígio paralelo, o empresário Carlos Jereissati processou Mendonça de Barros por dano moral: venceu no STJ, mas o STF acolheu o recurso do ex-ministro em 20 de novembro de 2014. Situação em novembro de 2026: nenhuma condenação em vigor e autoria do grampo sem conclusão oficial; eventual apelação da sentença de 2009 não foi localizada. Última atualização verificada em 4 de novembro de 2026.",
    sources: [
      { title: "Justiça absolve tucanos no processo de privatização da Telebrás", url: "https://www.otempo.com.br/brasil/justica-absolve-tucanos-no-processo-de-privatizacao-da-telebras-1.535832" },
      { title: "Saiba como foi a privatização da Telebrás em 1998", url: "https://www.correiobraziliense.com.br/app/noticia/economia/2008/07/29/internas_economia,22069/amp.shtml" },
      { title: "Época não terá de indenizar ex-diretor do BB", url: "https://conjur.com.br/2006-mar-22/epoca_nao_indenizar_ex-diretor_bb/" },
      { title: "Acervo: lembranças do governo FHC", url: "https://www.cartacapital.com.br/politica/acervo-lembrancas-do-governo-fhc-8756/" },
      { title: "Jereissati v. Mendonça de Barros", url: "https://globalfreedomofexpression.columbia.edu/cases/jereissati-v-mendonca-de-barros/" }
    ]
  }
};
