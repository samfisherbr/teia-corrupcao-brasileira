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

  esquema_lavajato: {
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
  }

};