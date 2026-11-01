export interface SchemeDetail {
  context: string;
  mechanism: string;
  impact: string;
  legalStatus: string;
  sources: { title: string; url: string }[];
}

export const SCHEME_DETAILS: Record<string, SchemeDetail> = {
  esquema_sanguessugas: {
    context:
      'A Operação Sanguessuga (Máfia das Ambulâncias) foi deflagrada pela Polícia Federal em 2006 para desarticular uma quadrilha envolvida na aquisição superfaturada de ambulâncias e equipamentos médicos no Brasil.',
    mechanism:
      'Empresários do Grupo Planam acertavam a destinação de emendas parlamentares com deputados e senadores. Os parlamentares direcionavam verbas do orçamento da saúde para municípios específicos, onde licitações eram fraudadas e direcionadas para as empresas do grupo.',
    impact: 'R$ 110.000.000 (Estimado em superfaturamento de emendas)',
    legalStatus:
      'Condenações mantidas pelo STF e Justiça Federal para os mentores empresariais e parlamentares envolvidos, com perda de mandato e ressarcimento ao erário.',
    sources: [
      {
        title: 'Wikipédia – Escândalo dos Sanguessugas',
        url: 'https://pt.wikipedia.org/wiki/Esc%C3%A2ndalo_dos_Sanguessugas'
      },
      {
        title: 'G1 – Entenda a CPI dos Sanguessugas',
        url: 'https://g1.globo.com/Noticias/Politica/0,,AA1251927-5601,00.html'
      }
    ]
  },

  esquema_mensalao: {
    context:
      "O Escândalo do Mensalão estourou em 2005 durante o primeiro mandato do governo Luiz Inácio Lula da Silva, a partir de denúncias do então deputado federal Roberto Jefferson. Tratou-se de um amplo esquema de cooptação política no Congresso Nacional, com a compra de apoio parlamentar de diversos partidos para a aprovação de projetos de interesse do Poder Executivo, financiado por recursos públicos e valerioduto de publicidade.",
    mechanism:
      "O esquema operava por meio da utilização de contratos de publicidade da administração pública e de empresas estatais com agências de publicidade do empresário Marcos Valério (como a SMP&B e a DNA Propaganda). Recursos provenientes dessas agências, somados a empréstimos bancários fictícios ou fraudulentos (em instituições como o Banco Rural e BMG), eram repassados periodicamente a parlamentares e dirigentes partidários em troca de sustentação e votos em matérias legislativas de interesse do governo.",
    impact:
      "R$ 101.600.000 (Valores repassados e movimentados ilegalmente)",
    legalStatus:
      "A apuração principal culminou no julgamento do STF na Ação Penal 470 (AP 470), resultando na condenação de 24 réus por crimes como corrupção ativa, corrupção passiva, lavagem de dinheiro, peculato e formação de quadrilha, incluindo importantes figuras políticas e empresariais. Ao longo dos anos seguintes, diversos condenados cumpriram penas e tiveram suas penas extintas ou perdoadas por indutos presidenciais.",
    sources: [
      {
        title: "Julgamento da Ação Penal 470 - Supremo Tribunal Federal (STF)",
        url: "https://noticias.stf.jus.br/postsnoticias/cronologia-do-inquerito-do-mensalao-no-stf/"
      },
      {
        title: "Memória e Histórico das Investigações do Mensalão - Ministério Público Federal (MPF)",
        url: "https://linhadotempo.mpf.mp.br/www/linha-do-tempo/2006"
      }
    ]
  },

  esquema_mensalao_mineiro: {
    context:
      "O Mensalão Mineiro (também conhecido como Mensalão do PSDB) ocorreu durante a campanha de reeleição do então governador de Minas Gerais, Eduardo Azeredo, em 1998. Considerado por investigadores e procuradores como o 'laboratório' do esquema que viria a se repetir em âmbito nacional no Escândalo do Mensalão de 2005, o caso envolveu a estruturação de uma rede clandestina de arrecadação e desvio de verbas estaduais para financiamento não declarado de campanha política.",
    mechanism:
      "O esquema operava por meio do direcionamento de verbas de patrocínio e publicidade de empresas estatais mineiras (como Comig, Copasa e Bemge) para eventos esportivos e culturais (como o Enduro da Independência), intermediados pelas agências de publicidade SMP&B e DNA Propaganda, do empresário Marcos Valério. Os recursos desviados, somados a empréstimos bancários fictícios contratados junto ao Banco Rural e ao Banco BMG, alimentaram um caixa dois para repasses a candidatos e quitar despesas da campanha eleitoral.",
    impact:
      "R$ 3.500.000 (Estimativa de recursos públicos estaduais desviados e movimentados ilegalmente apurados no âmbito da Ação Penal 536)",
    legalStatus:
      "A denúncia principal tramitou originalmente no Supremo Tribunal Federal sob a Ação Penal 536 (AP 536). Com a renúncia de Eduardo Azeredo ao mandato de deputado federal em 2014, o processo foi remetido à Justiça Estadual de Minas Gerais. Em primeira e segunda instâncias (TJMG), Azeredo foi condenado a mais de 20 anos de prisão pelos crimes de peculato e lavagem de dinheiro, assim como os operadores Marcos Valério e Cláudio Mourão. Posteriormente, o ex-governador teve a execução da pena suspensa e a prescrição extintiva reconhecida pelos tribunais superiores.",
    sources: [
      {
        title: "Acompanhamento e Histórico da Ação Penal 536 - Supremo Tribunal Federal (STF)",
        url: "https://portal.stf.jus.br/"
      },
      {
        title: "Atuação e Processos do Mensalão Mineiro - Ministério Público do Estado de Minas Gerais (MPMG)",
        url: "https://www.mpmg.mp.br/"
      }
    ]
  },

  esquema_santo_andre: {
    context:
      "O Escândalo de Santo André refere-se à rede de corrupção, extorsão e propinas estruturada na Prefeitura de Santo André (SP) durante a gestão do prefeito Celso Daniel, no final da década de 1990 e início dos anos 2000. O esquema ganhou enorme projeção nacional após o sequestro e assassinato do prefeito em janeiro de 2002, revelando investigações sobre a arrecadação sistemática de recursos ilícitos para financiamento de caixa 2 de campanhas políticas.",
    mechanism:
      "O esquema funcionava por meio da extorsão periódica praticada contra empresários concessionários do sistema de transporte público e empresas de coleta de lixo no município. As empresas pagavam propinas mensais em dinheiro vivo para garantir reajustes tarifários favoráveis, prorrogação de contratos e isenção de fiscalização. Os valores eram recolhidos por operadores e intermediários ligados ao governo municipal e direcionados para fundos clandestinos de campanhas e enriquecimento ilícito.",
    impact:
      "R$ 5.300.000 (Estimativa apurada pelo Ministério Público de São Paulo em propinas arrecadadas junto às empresas de transporte)",
    legalStatus:
      "As investigações conduzidas pelo Ministério Público de São Paulo (MPSP) resultaram em denúncias e processos criminais por corrupção, extorsão, concussão e formação de quadrilha contra ex-assessores, empresários do setor de transportes e operadores do esquema. Sérgio Gomes da Silva ('Sombra') e executores do crime foram processados e condenados. Ramificações financeiras e de lavagem de dinheiro correlatas ao caso voltaram a ser examinadas anos mais tarde na Operação Lava Jato.",
    sources: [
      {
        title: "Denúncias e Procedimentos Investigatórios do Ministério Público do Estado de São Paulo (MPSP)",
        url: "https://www.mpsp.mp.br/"
      },
      {
        title: "Jurisprudência e Decisões Processuais - Tribunal de Justiça do Estado de São Paulo (TJSP)",
        url: "https://www.tjsp.jus.br/"
      }
    ]
  },

  esquema_waldomiro_diniz: {
    context:
      "O Caso Waldomiro Diniz veio à tona em fevereiro de 2004, configurando a primeira grande crise política do governo Luiz Inácio Lula da Silva. O escândalo decorreu da divulgação de gravações em vídeo feitas em 2002, nas quais Waldomiro Diniz — então presidente da Loterj e mais tarde Subchefe de Assuntos Parlamentares da Casa Civil — extorquia propina do empresário de jogos Carlos Augusto Ramos, o 'Carlinhos Cachoeira'.",
    mechanism:
      "O esquema envolvia a exigência de propinas mensais e repasses percentuais sobre contratos públicos de loteria e apostas em troca de facilitação de negócios e favorecimento em licitações estaduais e federais (como na Loterj e em negociações envolvendo a multinacional GTech). Parte dos valores arrecadados também era direcionada ao financiamento ilícito de campanhas políticas de aliados.",
    impact:
      "R$ 1.500.000 (Estimativa de propinas solicitadas e movimentadas no âmbito dos contratos e campanhas investigadas)",
    legalStatus:
      "Waldomiro Diniz foi exonerado do cargo na Casa Civil em 2004 e o caso motivou a instalação da CPI dos Bingos no Senado Federal. Processado pelo Ministério Público Federal, Diniz foi condenado pela Justiça Federal pelos crimes de corrupção passiva e concussão. O processo seguiu em tramitação nas instâncias superiores (TRF-1, STJ e STF), resultando em sanções penais e inelegibilidade.",
    sources: [
      {
        title: "Procedimentos e Denúncias do Ministério Público Federal (MPF)",
        url: "https://www.mpf.mp.br/"
      },
      {
        title: "Acompanhamento Processual do Tribunal Regional Federal da 1ª Região (TRF-1)",
        url: "https://www.trf1.jus.br/"
      }
    ]
  },

  esquema_dolares_cueca: {
    context:
      "O episódio conhecido como 'Caso dos Dólares na Cueca' ocorreu em julho de 2005, durante o ápice da crise política do Mensalão. O caso ganhou repercussão nacional após a prisão em flagrante de José Adalberto Vieira da Silva no Aeroporto de Congonhas, em São Paulo, prestes a embarcar para Fortaleza transportando quantias expressivas de dinheiro não declarado.",
    mechanism:
      "Durante a abordagem da Polícia Federal, foram encontrados US$ 100.000 ocultos na cueca do assessor e R$ 209.000 guardados em uma mala de mão. As investigações do Ministério Público Federal indicaram que os valores eram provenientes de propina paga por intermediários em troca do favorecimento do Consórcio Sistema de Transmissão do Nordeste (STN) na obtenção de financiamentos junto ao Banco do Nordeste do Brasil (BNB).",
    impact:
      "R$ 450.000 (Valor estimado apreendido em espécie, somando US$ 100 mil ocultados e R$ 209 mil em mala de mão)",
    legalStatus:
      "O Ministério Público Federal moveu ações por improbidade administrativa e lavagem de dinheiro contra os envolvidos. Em relação às apurações sobre lideranças políticas vinculadas ao gabinete do assessor, o STF e o STJ arquivaram os processos por falta de provas de participação direta ou declararam a prescrição das acusações. O montante apreendido permaneceu sob custódia judicial vinculada ao Tesouro Nacional.",
    sources: [
      {
        title: "Acompanhamento Processual e Decisões - Superior Tribunal de Justiça (STJ)",
        url: "https://www.stj.jus.br/"
      },
      {
        title: "Procedimentos e Inquéritos do Ministério Público Federal (MPF)",
        url: "https://www.mpf.mp.br/"
      }
    ]
  },

  esquema_porto_seguro: {
    context:
      "Deflagrada pela Polícia Federal em novembro de 2012, a Operação Porto Seguro desarticulou uma organização criminosa infiltrada em órgãos federais e agências reguladoras para a compra e venda de pareceres técnicos, laudos governamentais e decisões administrativas favoráveis a interesses privados.",
    mechanism:
      "O esquema envolvia a cooptação de servidores em instâncias estratégicas do Poder Executivo — como a Advocacia-Geral da União (AGU), a Agência Nacional de Aviação Civil (ANAC), a Agência Nacional de Águas (ANA) e a Secretaria do Patrimônio da União (SPU). A rede, operada pelos irmãos Paulo e Rubens Vieira com a intermediação da chefia do escritório regional da Presidência em São Paulo, cobrava propina e vantagens indevidas em troca da emissão rápida e manipulada de pareceres vinculantes para favorecer empreendimentos portuários, imobiliários e concessões públicas.",
    impact:
      "R$ 5.600.000 (Estimativa apurada pelo MPF em propinas diretas pagas em negociações relativas a contratos e empreendimentos superiores a R$ 525 milhões)",
    legalStatus:
      "O Ministério Público Federal (MPF) denunciou 24 investigados por crimes como corrupção ativa, corrupção passiva, tráfico de influência, falsidade ideológica e formação de quadrilha. A Justiça Federal recebeu as denúncias, instaurando ações penais e de improbidade administrativa que resultaram em exonerações, bloqueio de bens e condenações em primeira e segunda instâncias.",
    sources: [
      {
        title: "Denúncias e Atuações na Operação Porto Seguro - Ministério Público Federal (MPF)",
        url: "https://www.mpf.mp.br/"
      },
      {
        title: "Decisões e Processos Relacionados - Tribunal Regional Federal da 3ª Região (TRF-3)",
        url: "https://www.trf3.jus.br/"
      }
    ]
  },

  esquema_lava_jato: {
    context:
      "Deflagrada em março de 2014 pela Polícia Federal e pelo Ministério Público Federal, a Operação Lava Jato teve início a partir da apuração de uma rede de doleiros que utilizava postos de combustíveis e lavanderias para lavagem de dinheiro. A investigação expandiu-se rapidamente ao revelar um megaesquema sistêmico de corrupção, cartelização e propinas envolvendo a Petrobras, grandes empreiteiras nacionais, órgãos públicos e lideranças de diversos partidos políticos.",
    mechanism:
      "As maiores empreiteiras do país organizavam-se em um cartel (conhecido como 'Clube') para fraudar licitações de grandes obras da Petrobras, definindo previamente as vencedoras e inflando os preços contratados. Em contrapartida, as empresas repassavam propinas de 1% a 3% do valor dos contratos para diretores da estatal cooptados e apadrinhados por agremiações políticas. Os recursos ilícitos eram lavados por meio de doleiros, contratos fictícios de consultoria, emissão de notas fiscais frias e remessas para contas bancárias mantidas em paradisíacos fiscais no exterior, financiando caixa dois eleitoral e o enriquecimento ilegal de agentes públicos e privados.",
    impact:
      "R$ 42.800.000.000 (Estimativa total de prejuízos financeiros e propinas movimentadas apurados nas investigações e balanços da Petrobras, com mais de R$ 25 bilhões recuperados via acordos de leniência e delações premiadas)",
    legalStatus:
      "A operação resultou em centenas de prisões, mais de 150 acordos de colaboração premiada e diversas condenações impostas a executivos, doleiros e influentes figuras políticas. A partir de 2019, o Supremo Tribunal Federal (STF) anulou diversos processos e condenações — declarando a incompetência territorial da 13ª Vara Federal de Curitiba e a suspeição do ex-juiz Sérgio Moro —, o que levou à remessa de casos para outras jurisdições e à prescrição de várias acusações. Em 2021, o modelo de força-tarefa da Lava Jato foi oficialmente encerrado e incorporado aos Grupos de Atuação Especial de Combate ao Crime Organizado (Gaeco) do MPF.",
    sources: [
      {
        title: "Grandes Casos: Operação Lava Jato - Ministério Público Federal (MPF)",
        url: "https://www.mpf.mp.br/atuacao/grandes-casos/casos-historicos/operacao-lava-jato"
      },
      {
        title: "Linha do Tempo das Fases e Processos da Lava Jato - Ministério Público Federal (MPF)",
        url: "https://linhadotempo.mpf.mp.br/www/linha-do-tempo/2014"
      }
    ]
  },

  esquema_bolsolao_mec: {
    context:
      "O escândalo do 'Bolsolão do MEC' veio à tona no início de 2022, durante o governo Jair Bolsonaro, revelando a existência de um gabinete paralelo no Ministério da Educação gerido por religiosos e lobistas sem cargo formal. O caso ganhou repercussão nacional após o vazamento de um áudio no qual o então ministro Milton Ribeiro afirmava direcionar verbas públicas do Fundo Nacional de Desenvolvimento da Educação (FNDE) prioritariamente para municípios indicados por pastores, a pedido pessoal do presidente da República.",
    mechanism:
      "A estrutura paralela operava por meio da intermediação ilícita entre prefeitos municipais e a cúpula do MEC/FNDE para a liberação célere de recursos orçamentários e emendas parlamentares (orçamento secreto). Em troca da facilitação no repasse de fundos para obras de creches, escolas e aquisição de ônibus escolares, os intermediários cobravam propina dos gestores locais em dinheiro vivo, propina em ouro e a compra de Bíblias personalizadas para distribuição regional.",
    impact:
      "R$ 1.300.000.000 (Estimativa total de emendas e verbas do FNDE negociadas e em apuração quanto ao direcionamento e superfaturamento)",
    legalStatus:
      "A Polícia Federal deflagrou a Operação Acesso Pago em junho de 2022, resultando na prisão preventiva do ex-ministro Milton Ribeiro e dos pastores investigados por crimes como corrupção passiva, advocacia administrativa, prevaricação e tráfico de influência. Embora soltos em seguida por decisão do TRF-1, o processo foi remetido ao Supremo Tribunal Federal (STF) e à Justiça Federal após constatação de indícios de interferência no trabalho da PF, permanecendo em tramitação com apurações paralelas no TCU e na CGU.",
    sources: [
      {
        title: "Inquéritos e Procedimentos sobre o MEC - Ministério Público Federal (MPF)",
        url: "https://www.mpf.mp.br/"
      },
      {
        title: "Relatórios de Auditoria do Fundo Nacional de Desenvolvimento da Educação - Tribunal de Contas da União (TCU)",
        url: "https://portal.tcu.gov.br/"
      }
    ]
  },

  esquema_venire_joias: {
    context:
      "Deflagradas pela Polícia Federal em 2023 e 2024 no âmbito dos inquéritos das milícias digitais e de desvio de patrimônio público, as investigações da Operação Venire e do Caso das Joias apuraram a atuação de uma estrutura paralela no gabinete presidencial para fraude em sistemas do Ministério da Saúde e a apropriação indevida de bens de alto valor recebidos de autoridades estrangeiras.",
    mechanism:
      "O esquema desdobrou-se em duas frentes operacionais: no fraude vacinal, servidores e assessores utilizaram credenciais privilegiadas para inserir dados falsos de imunização contra a COVID-19 nos sistemas SI-PNI e RNDS do Ministério da Saúde, emitindo certificados internacionais fraudulentos; na vertente dos bens públicos, kits de joias luxuosas ofertados pela Arábia Saudita e por outros países ao Estado brasileiro foram desviados do acervo público da Presidência, transportados para os Estados Unidos em aeronaves oficiais e vendidos por intermediários em leilões e lojas especializadas, com repasse do dinheiro em espécie aos envolvidos e operação de resgate das peças após determinações do Tribunal de Contas da União (TCU).",
    impact:
      "R$ 6.800.000 (Valor estimado do patrimônio público desviado e negociado ilegalmente em joias e relógios de luxo)",
    legalStatus:
      "A Polícia Federal indiciou o ex-presidente Jair Bolsonaro, o tenente-coronel Mauro Cid e diversos ex-assessores militares e civis pelos crimes de associação criminosa, inserção de dados falsos em sistema de informações, peculato e lavagem de dinheiro. O relatório conclusivo das investigações foi homologado e encaminhado pelo Supremo Tribunal Federal (STF) à Procuradoria-Geral da República (PGR) para análise e deliberação sobre o oferecimento de denúncia criminal.",
    sources: [
      {
        title: "Relatórios de Inquéritos e Operações da Polícia Federal (PF)",
        url: "https://www.gov.br/pf/"
      },
      {
        title: "Decisões e Inquéritos do Supremo Tribunal Federal (STF)",
        url: "https://portal.stf.jus.br/"
      }
    ]
  },

  esquema_banco_master_inss: {
    context:
      "A fraude envolvendo o Banco Master e o Instituto Nacional do Seguro Social (INSS) foi revelada a partir de investigações do próprio INSS, da Polícia Federal e do Banco Central sobre concessões massivas de empréstimos consignados irregulares a aposentados e pensionistas, além da captação ilícita de recursos de regimes próprios de previdência social (RPPS). Sob a gestão do ex-banqueiro Daniel Vorcaro, a instituição financeira operou uma rede de emissão de créditos consignados sem consentimento de segurados e alocação de fundos previdenciários públicos em papéis de alto risco.",
    mechanism:
      "O esquema estruturou-se em duas frentes principais: na vertente dos consignados (operada via plataforma Credcesta), a instituição averbou mais de 254 mil contratos de empréstimo consignado no INSS com graves indícios de fraude, nos quais auditorias identificaram que mais de 90% das operações não possuíam assinatura idônea dos aposentados ou apresentavam inconsistências nos mecanismos e QR Codes de validação biométrica; na vertente de previdência, o banco atraía aportes de fundos de pensão municipais e estaduais para aplicação em Letras Financeiras e fundos de investimento sem garantias adequadas, maquiando balanços por meio de triangulações operacionais e cessões de crédito fraudulentas com instituições parceiras.",
    impact:
      "R$ 51.000.000.000 (Rombo e impacto financeiro total estimado gerado pelo Banco Master no sistema bancário, fundos de pensão, Fundo Garantidor de Créditos e centenas de milhares de contratos consignados do INSS)",
    legalStatus:
      "O Banco Central decretou a liquidação extrajudicial da instituição. A Polícia Federal deflagrou operações e indiciou controladores e ex-executivos do Banco Master e de instituições financeiras parceiras pelos crimes de gestão fraudulenta, organização criminosa e lavagem de dinheiro. No Supremo Tribunal Federal (STF) e no Tribunal de Contas da União (TCU), inquéritos e apurações sobre os descontos indevidos em benefícios do INSS e as aplicações de regimes de previdência seguem sob relatoria da Presidência do STF e de ministros relatores.",
    sources: [
      {
        title: "Apuração sobre Consignados e Auditoria no Banco Master - Portal UOL Economia",
        url: "https://economia.uol.com.br/noticias/redacao/2026/01/16/inss---banco-master.ghtm"
      },
      {
        title: "Relatório e Inquéritos de Fraudes Financeiras - Polícia Federal (PF)",
        url: "https://www.gov.br/pf/"
      },
      {
        title: "Decisões e Inquéritos Processuais no Supremo Tribunal Federal (STF)",
        url: "https://portal.stf.jus.br/"
      }
    ]
  },

  esquema_pc_farias: {
    context:
      "O Escândalo PC Farias eclodiu no início dos anos 1990 durante a presidência de Fernando Collor de Mello, articulado a partir das revelações do irmão do presidente, Pedro Collor. Tratou-se de um amplo esquema de corrupção e tráfico de influência comandado por Paulo César Farias (PC Farias), tesoureiro da campanha presidencial de 1989, que operava um governo paralelo dentro da administração federal.",
    mechanism:
      "O esquema operava por meio da cobrança sistemática de propinas de empresários em troca da facilitação de contratos governamentais, liberação de verbas públicas e concessão de favores administrativos em órgãos federais. Os recursos ilícitos eram lavados através de empresas de fachada (como a Trada Consultoria), contas bancárias fantasmas e a emissão de cheques falsos, sendo posteriormente destinados ao enriquecimento pessoal e ao custeio de despesas pessoais da família presidencial e de aliados políticos.",
    impact:
      "R$ 1.400.000.000 (Estimativa total de propinas e valores movimentados ilegalmente pelo esquema ao longo da gestão)",
    legalStatus:
      "As investigações culminaram na instalação da CPI do PC Farias e no processo de Impeachment de Fernando Collor em 1992, que renunciou antes da conclusão do julgamento no Senado. PC Farias foi condenado por sonegação fiscal e falsidade ideológica, cumprindo pena até ser encontrado morto em 1996. Na esfera penal junto ao STF, Fernando Collor foi absolvido das acusações criminais diretas por falta de provas materiais cabais na época, embora tenha tido seus direitos políticos suspensos.",
    sources: [
      {
        title: "Relatórios da CPI do PC Farias - Congresso Nacional",
        url: "https://www.congressonacional.leg.br/"
      },
      {
        title: "Acórdãos e Processos Históricos - Supremo Tribunal Federal (STF)",
        url: "https://portal.stf.jus.br/"
      }
    ]
  },

  esquema_anoes_orcamento: {
    context:
      "O Escândalo dos Anões do Orçamento eclodiu no final de 1993, durante o governo Itamar Franco, a partir das denúncias feitas pelo ex-assessor da Comissão Mista de Orçamento (CMO), José Carlos Alves dos Santos. O escândalo envolveu um grupo de parlamentares — apelidados de 'Anões do Orçamento' devido à baixa projeção política da maioria de seus integrantes — que manipulava a elaboração da Lei Orçamentária Anual para enriquecimento próprio e financiamento ilícito.",
    mechanism:
      "O esquema operava por meio do direcionamento de emendas parlamentares individuais e de bancada na Comissão Mista de Orçamento para municípios e entidades sociais fantasmas ou controladas por aliados. Empregava-se a inflação proposital dos valores repassados para a aquisição de bens e obras públicas, com posterior cobrança de propinas e propinas pagas por empreiteiras (como a Andrade Gutierrez e a Odebrecht) contratadas sem licitação idônea. Parte das quantias arrecadadas era lavada mediante a compra de bilhetes premiados da Loteria Federal pelo deputado João Alves.",
    impact:
      "R$ 100.000.000 (Estimativa total de recursos públicos desviados e propinas movimentadas pelo grupo de parlamentares)",
    legalStatus:
      "O Congresso Nacional instaurou a CPI dos Anões do Orçamento entre 1993 e 1994, cujo relatório final recomendou a cassação de 18 parlamentares. Como resultado político, 6 deputados foram cassados e 4 renunciaram aos mandatos para evitar a perda dos direitos políticos. Na esfera judicial, diversos envolvidos enfrentaram ações penais e de improbidade administrativa movidas pelo Ministério Público Federal, resultando no bloqueio de bens, restituição parcial de valores e condenações em instâncias federais.",
    sources: [
      {
        title: "Relatório Final da CPI Mista do Orçamento - Congresso Nacional",
        url: "https://www.congressonacional.leg.br/"
      },
      {
        title: "Memória das Investigações da CPI dos Anões do Orçamento - Câmara dos Deputados",
        url: "https://www.camara.leg.br/"
      }
    ]
  },

  esquema_trt_sp: {
    context:
      "O Escândalo do TRT-SP refere-se ao desvio sistemático de verbas públicas destinadas à construção da sede do Tribunal Regional do Trabalho da 2ª Região (TRT-SP) no bairro da Barra Funda, em São Paulo, durante a década de 1990. O esquema ganhou enorme repercussão nacional a partir das apurações do Ministério Público Federal e da CPI do Judiciário no Senado, revelando a atuação conjunta do então presidente da comissão de obras do tribunal, o juiz Nicolau dos Santos Neto ('Juiz Lalau'), do ex-senador Luiz Estevão e de executivos do Grupo Incal Monteiro de Barros.",
    mechanism:
      "O esquema operava por meio de fraudes no processo licitatório e superfaturamento das obras do Fórum Trabalhista de São Paulo, contratadas junto à construtora Incal Alimentos. A comissão de construção presidida por Nicolau dos Santos Neto liberava medições falsas e autorizava o repasse contínuo de verbas do orçamento federal por etapas da construção que jamais foram concluídas. As quantias desviadas eram pulverizadas e lavadas por meio de empresas de fachada, remessas clandestinas para contas mantidas na Suíça e repasses financeiros para o Grupo OK, conglomerado de empresas pertencente a Luiz Estevão.",
    impact:
      "R$ 169.500.000 (Valor nominal total desviado apurado pelo Ministério Público Federal à época, representando quase 80% do montante repassado para a obra e superando R$ 1 bilhão em valores corrigidos)",
    legalStatus:
      "A atuação do Ministério Público Federal e da Justiça Federal resultou na condenação dos réus Nicolau dos Santos Neto, Luiz Estevão e dos empresários Fábio Monteiro de Barros e José Eduardo Corrêa Ribeiro por crimes de peculato, estelionato, corrupção, lavagem de dinheiro e uso de documento falso. Luiz Estevão teve o mandato cassado pelo Senado Federal e cumpriu pena em regime fechado. A Justiça Federal promoveu a alienação judicial dos imóveis abandonados do Fórum e obteve a repatriação de dezenas de milhões de dólares mantidos em contas bancárias na Suíça para ressarcimento aos cofres públicos.",
    sources: [
      {
        title: "Relatórios de Atuação e Processos do Caso TRT-SP - Ministério Público Federal (MPF)",
        url: "https://www.mpf.mp.br/"
      },
      {
        title: "Execuções e Repatriamento de Valores - Justiça Federal de São Paulo (JFSP)",
        url: "https://www.jfsp.jus.br/"
      }
    ]
  },

  esquema_grampos_bndes: {
    context:
      "O Escândalo dos Grampos do BNDES ocorreu em 1998, durante o governo Fernando Henrique Cardoso (FHC), no contexto da privatização do Sistema Telebrás — o maior processo de desestatização da história do país. O caso ganhou repercussão nacional após a divulgação de mais de 40 fitas gravadas clandestinamente na sede do BNDES e em telefones de autoridades, revelando tratativas diretas de membros da cúpula do governo federal para favorecer consórcios específicos no leilão das concessionárias de telecomunicações.",
    mechanism:
      "Integrantes da alta cúpula governamental — como o Ministro das Comunicações Luiz Carlos Mendonça de Barros, o presidente do BNDES André Lara Resende e o diretor do Banco do Brasil Ricardo Sérgio de Oliveira — atuaram nos bastidores para influenciar a composição dos consórcios concorrentes. As interceptações telefônicas demonstraram articulações para pressionar fundos de pensão de estatais (como a Previ) a integrarem o consórcio liderado pelo Banco Opportunity e pela Telecom Italia no leilão da Tele Norte Leste (Telemar), visando inviabilizar grupos concorrentes considerados indesejados pelo governo.",
    impact:
      "R$ 22.000.000.000 (Montante total arrecadado no leilão de privatização do Sistema Telebrás sob investigações de favorecimento e direcionamento de consórcios)",
    legalStatus:
      "O escândalo resultou no pedido de demissão do Ministro das Comunicações Luiz Carlos Mendonça de Barros, do presidente do BNDES André Lara Resende, de diretores do banco e de executivos do Banco do Brasil. A Polícia Federal e o Ministério Público Federal abriram inquéritos para apurar a autoria dos grampos ilegais e improbidade administrativa na condução dos leilões. Em 2010, a Justiça Federal absolveu os ex-dirigentes e ex-ministros das acusações de improbidade, concluindo pela ausência de lesão comprovada ao patrimônio público na alienação das estatais.",
    sources: [
      {
        title: "Inquéritos e Procedimentos sobre a Privatização do Sistema Telebrás - Ministério Público Federal (MPF)",
        url: "https://www.mpf.mp.br/"
      },
      {
        title: "Decisões Processuais e Ações de Improbidade - Tribunal Regional Federal da 1ª Região (TRF-1)",
        url: "https://www.trf1.jus.br/"
      }
    ]
  }

};