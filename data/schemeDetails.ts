/**
 * ============================================================================
 * TEXTOS DO GLOSSÁRIO — um registro por esquema
 * ============================================================================
 * A CHAVE de cada registro precisa ser idêntica ao `id` do nó `scheme` no
 * banco (ex.: esquema_lava_jato). Se não bater, o cartão do Glossário aparece
 * sem o dossiê e o infográfico financeiro não encontra o `impact`.
 *
 * Novos registros vêm da Fase 2 do Master Prompt (mantido fora do repositório). Regras de formato:
 *  - impact: comece pela cifra principal ("R$ 6.200.000.000 (…)") — o
 *    infográfico lê a PRIMEIRA cifra do texto quando os links não têm valor.
 *  - legalStatus: termine com a situação do caso e a data da verificação.
 *  - aspas duplas dentro do texto: escape com \".
 *  - title: igual ao `label` do nó no banco. É o título usado quando o banco
 *    não responde e nas páginas geradas no build (página inicial, imagem de
 *    compartilhamento).
 *  - reviewedAt: data (AAAA-MM-DD) da última revisão do texto. ATUALIZE ao
 *    mexer no registro: aparece no dossiê como "Revisado em", vai para o
 *    sitemap (lastModified) e para os dados estruturados (dateModified).
 *    Mudar a data também tira do ar as traduções deste registro até serem
 *    atualizadas (ver SchemeDetailTranslation, abaixo).
 *
 *  - timeline: início e fim do esquema (tipo SchemeTimeline, types/graph.ts).
 *    A FONTE DA VERDADE é a tabela `scheme_timelines` do D1; este campo é a
 *    cópia de reserva (páginas geradas sem banco, banco fora do ar), como o
 *    `title` em relação ao `label`. Mudou aqui, mude no D1 (e vice-versa) e
 *    rode `npm run check:timeline-sync`. Regras:
 *      start: quando o esquema começou a operar. basis = documented_start
 *        (a fonte diz), first_known_act (ato ilícito mais antigo datado) ou
 *        enabling_act (nomeação, contrato ou norma que o tornou possível,
 *        quando nenhuma fonte data o primeiro ato).
 *      end: quando a atividade terminou (documented_end). Sem fim documentado,
 *        o PRIMEIRO ATO OFICIAL PÚBLICO: operação/prisão/inquérito público
 *        (police_investigation), CPI instalada (parliamentary_inquiry), órgão
 *        de controle (oversight) ou decisão judicial (court_ruling), o que vier
 *        antes. Reportagem sozinha não é ato oficial. Inquérito sigiloso não
 *        conta (não parou nada); cite-o em `note`.
 *      exposed: só se o esquema parou antes de ser descoberto — o primeiro ato
 *        oficial, posterior ao `end`.
 *    Datas 'AAAA', 'AAAA-MM' ou 'AAAA-MM-DD', com a precisão da fonte.
 *    `sourceUrl` é obrigatório e pode estar fora de `sources`; `note` é
 *    justificativa interna em português, não aparece no site e não é traduzida.
 *    A linha do tempo não é texto visível: mexer nela NÃO muda o reviewedAt.
 *    `npm run check:timelines` confere formato e ordem das datas.
 *
 * TRADUÇÕES: data/schemeDetails.en.ts (inglês) e data/schemeDetails.es.ts
 * (espanhol), com as mesmas chaves. Dossiê novo sem tradução aparece em
 * português nos outros idiomas.
 * ============================================================================
 */
import type { SchemeTimeline } from '@/types/graph';

/** Formato de cada registro (Glossário, páginas de dossiê, sitemap). */
export interface SchemeDetail {
  title: string;
  reviewedAt: string;
  context: string;
  mechanism: string;
  impact: string;
  legalStatus: string;
  sources: { title: string; url: string }[];
  /** Início e fim do esquema; cópia de reserva da tabela scheme_timelines do D1. */
  timeline: SchemeTimeline;
}

/**
 * Tradução de um registro (data/schemeDetails.en.ts e .es.ts). Só os textos:
 * as fontes e a lista de dossiês vêm sempre deste arquivo.
 *  - reviewedAt: COPIE o `reviewedAt` do registro em português que foi
 *    traduzido. Se o português for revisto depois (data diferente), o site
 *    volta a mostrar o português neste dossiê até a tradução ser atualizada
 *    (ver lib/dossiers.ts).
 *  - impact: comece pela mesma cifra, com os números por extenso em algarismos
 *    ("R$ 6,200,000,000" em inglês; "R$ 6.200.000.000" em espanhol).
 */
export interface SchemeDetailTranslation {
  title: string;
  reviewedAt: string;
  context: string;
  mechanism: string;
  impact: string;
  legalStatus: string;
}

export const SCHEME_DETAILS: Record<string, SchemeDetail> = {

  "esquema_pc_farias": {
    title: "Esquema PC Farias",
    reviewedAt: "2026-11-04",
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
    ],
    timeline: {
      start: {
        date: "1990-03-15",
        basis: "enabling_act",
        sourceUrl: "https://www.tse.jus.br/jurisprudencia/julgados-historicos/collor",
        note: "Posse de Collor; PC Farias, tesoureiro da campanha de 1989, passa a operar no governo. O início exato da cobrança não é datado nas fontes.",
      },
      end: {
        date: "1992-06-01",
        basis: "parliamentary_inquiry",
        sourceUrl: "https://www2.camara.leg.br/atividade-legislativa/plenario/discursos/escrevendohistoria/20-anos-do-impeachment/cpmi-pc-farias",
        note: "Instalação da CPMI. A entrevista de Pedro Collor à Veja (maio de 1992) foi revelação da imprensa, não ato oficial.",
      },
    },
  },

  "esquema_anoes_orcamento": {
    title: "Anões do Orçamento",
    reviewedAt: "2026-11-04",
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
    ],
    timeline: {
      start: {
        date: "1989",
        basis: "documented_start",
        sourceUrl: "https://pt.wikipedia.org/wiki/An%C3%B5es_do_Or%C3%A7amento",
        note: "Fontes situam as fraudes no \"final dos anos 80\", depois da Constituição de 1988; 1989 é o primeiro ano possível, não data exata.",
      },
      end: {
        date: "1993-10",
        basis: "parliamentary_inquiry",
        sourceUrl: "https://www2.senado.leg.br/bdsf/handle/id/610023",
        note: "CPMI do Orçamento (Requerimento 151/1993) instalada depois das denúncias de José Carlos Alves dos Santos.",
      },
    },
  },

  "esquema_sivam": {
    title: "Caso Sivam",
    reviewedAt: "2026-11-13",
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
    ],
    timeline: {
      start: {
        date: "1994-12-27",
        basis: "enabling_act",
        sourceUrl: "https://www2.camara.leg.br/legin/fed/ressen/1994/resolucao-97-27-dezembro-1994-392017-publicacaooriginal-1-pl.html",
        note: "Resolução do Senado que nomeou a Raytheon fornecedora; o lobby gravado é de 1995.",
      },
      end: {
        date: "1995-11",
        basis: "police_investigation",
        sourceUrl: "https://www.spokesman.com/stories/1995/nov/19/raytheon-denies-bribery-in-brazil/",
        note: "Grampo da PF (setembro de 1995, sigiloso) vem a público; embaixador exonerado em 17/11/1995 e CPI do Sivam em seguida.",
      },
    },
  },

  "esquema_trt_sp": {
    title: "Escândalo do TRT-SP",
    reviewedAt: "2026-11-15",
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
    ],
    timeline: {
      start: {
        date: "1992",
        basis: "first_known_act",
        sourceUrl: "https://agenciabrasil.ebc.com.br/geral/noticia/2017-09/mpf-pede-ressarcimento-de-r-1-bilhao-por-desvios-em-obra-do-trt-de-sao-paulo",
        note: "Licitação do Fórum Trabalhista vencida pela Incal.",
      },
      end: {
        date: "1998",
        basis: "police_investigation",
        sourceUrl: "https://agenciabrasil.ebc.com.br/geral/noticia/2017-09/mpf-pede-ressarcimento-de-r-1-bilhao-por-desvios-em-obra-do-trt-de-sao-paulo",
        note: "Ex-genro do juiz denuncia o patrimônio ao MPF; CPI do Judiciário em 1999.",
      },
    },
  },

  "esquema_compra_reeleicao": {
    title: "Compra de Votos da Reeleição",
    reviewedAt: "2026-11-15",
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
    ],
    timeline: {
      start: {
        date: "1997-01",
        basis: "first_known_act",
        sourceUrl: "https://www.congressoemfoco.com.br/noticia/101937/ecos-de-um-escandalo",
        note: "Votação em primeiro turno da emenda da reeleição na Câmara (28/1/1997).",
      },
      end: {
        date: "1997-05",
        basis: "police_investigation",
        sourceUrl: "https://www.congressoemfoco.com.br/noticia/101937/ecos-de-um-escandalo",
        note: "Mês da revelação pela Folha e das renúncias; a PF abriu inquérito (depois arquivado), mês exato não confirmado. A CPI foi barrada.",
      },
    },
  },

  "esquema_grampos_bndes": {
    title: "Grampos do BNDES",
    reviewedAt: "2026-11-05",
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
    ],
    timeline: {
      start: {
        date: "1998-07",
        basis: "first_known_act",
        sourceUrl: "https://www.correiobraziliense.com.br/app/noticia/economia/2008/07/29/internas_economia,22069/amp.shtml",
        note: "Articulações gravadas nas semanas do leilão da Telebrás.",
      },
      end: {
        date: "1998-07-29",
        basis: "documented_end",
        sourceUrl: "https://www.bndes.gov.br/wps/portal/site/home/transparencia/desestatizacao/projetos-encerrados/privatizacao-federais-telecomunicacoes",
        note: "Leilões da Telebrás concluídos; o favorecimento suspeito se esgota no leilão.",
      },
      exposed: {
        date: "1998-11",
        basis: "police_investigation",
        sourceUrl: "https://www1.folha.uol.com.br/fsp/brasil/fc28119813.htm",
        note: "Fitas reveladas por Elio Gaspari em 8/11/1998; a PF investigou a autoria do grampo, não o conteúdo.",
      },
    },
  },

  "esquema_mensalao_mineiro": {
    title: "Mensalão Mineiro",
    reviewedAt: "2026-11-05",
    context: "O caso nasceu na campanha de reeleição de Eduardo Azeredo (PSDB) ao governo de Minas Gerais em 1998, disputa que ele perdeu para Itamar Franco. O esquema só veio a público sete anos depois, como subproduto das investigações do mensalão federal, quando se constatou que Marcos Valério já operava em Minas um circuito semelhante. A peça que destravou a apuração foi a chamada \"Lista Cláudio Mourão\", elaborada pelo tesoureiro da campanha. Em 2007 o procurador-geral da República Antônio Fernando de Souza denunciou quinze pessoas por peculato e lavagem de dinheiro; doze se tornaram rés por decisão do STF em dezembro de 2009.",
    mechanism: "Segundo o voto do relator no STF, empréstimos tidos como fictícios obtidos pelas agências SMP&B e DNA Propaganda no Banco Rural foram usados para aplicar na campanha recursos públicos da Copasa, da Comig e do Bemge, repassados a título de patrocínio ao Enduro Internacional da Independência. Um ato do governo mineiro autorizou o uso de contrato público como garantia dos mútuos, viabilizando o crédito. A ocultação se deu por pagamentos em espécie, transferências entre empresas dos próprios acusados e cheques da SMP&B nominais a ela mesma, tendo como beneficiários reais os prestadores de serviço da campanha. A Carbo, empresa do candidato a vice Clésio Andrade, recebeu R$ 325 mil da SMP&B e repassou R$ 200 mil à conta de campanha como doação.",
    impact: "R$ 3,5 milhões foi o desvio de recursos de estatais mineiras imputado na denúncia do MPF e adotado nas sentenças, dos quais R$ 1,5 milhão atribuído à Copasa. As demais cifras do caso medem coisas distintas e não se somam: R$ 12 milhões de caixa dois admitidos por Cláudio Mourão em depoimento à CPI; R$ 28,5 milhões em empréstimos bancários segundo laudo da Polícia Federal; e R$ 13,9 milhões de mútuos no Banco Rural, depois liquidados por um acordo de R$ 2 milhões que levou o Banco Central a inabilitar os dirigentes do banco por oito anos. Não há registro público de valor efetivamente ressarcido ao erário mineiro.",
    legalStatus: "Azeredo foi condenado em primeira instância em dezembro de 2015 a 20 anos e 10 meses, pena mantida pelo TJMG em 2017 e fixada em 20 anos e 1 mês; ele se entregou em maio de 2018 e foi solto em novembro de 2019 após o STF derrubar a execução da pena em segunda instância. O STJ reduziu a pena a 15 anos, 7 meses e 20 dias em fevereiro de 2020. Em 29 de junho de 2021 a Segunda Turma do STF declarou a incompetência da Justiça comum e remeteu o processo à Justiça Eleitoral, suspendendo a execução da condenação. Marcos Valério, Cristiano Paz e Ramon Hollerbach foram condenados a 16 anos e 9 meses em junho de 2018, com recurso; Clésio Andrade e Eduardo Guedes tiveram os processos anulados pelo TJMG em outubro de 2019; Walfrido dos Mares Guia e Cláudio Mourão tiveram a punibilidade extinta por prescrição em 2012 e 2014. Situação em novembro de 2026: não há condenação penal transitada em julgado contra Eduardo Azeredo, que nega a existência do esquema, e o desfecho na Justiça Eleitoral não é público.",
    sources: [
      { title: "Ministro Joaquim Barbosa acolhe denúncia contra Eduardo Azeredo também por lavagem de dinheiro", url: "https://noticias.stf.jus.br/postsnoticias/ministro-joaquim-barbosa-acolhe-denuncia-contra-eduardo-azeredo-tambem-por-lavagem-de-dinheiro/" },
      { title: "Mensalão Tucano: o escândalo mineiro que antecedeu o mensalão do PT", url: "https://www.itatiaia.com.br/politica/mensalao-tucano-o-escandalo-mineiro-que-antecedeu-o-mensalao-do-pt/" },
      { title: "Justiça condena Marcos Valério a 16 anos de prisão", url: "https://agenciabrasil.ebc.com.br/justica/noticia/2018-06/justica-condena-marcos-valerio-16-anos-de-prisao" },
      { title: "Justiça mineira mantém condenação de Eduardo Azeredo em segunda instância", url: "https://agenciabrasil.ebc.com.br/politica/noticia/2017-08/justica-mineira-mantem-condenacao-de-eduardo-azeredo-em-segunda-instancia" },
      { title: "STJ reduz pena, mas mantém condenação de Eduardo Azeredo", url: "https://agenciabrasil.ebc.com.br/justica/noticia/2020-02/stj-reduz-pena-mas-mantem-condenacao-de-eduardo-azeredo" },
      { title: "STF envia para Justiça Eleitoral processo sobre ex-governador de Minas", url: "https://agenciabrasil.ebc.com.br/justica/noticia/2021-06/stf-envia-para-justica-eleitoral-processo-sobre-ex-governador-de-minas" },
      { title: "TJ-MG anula processo contra Clésio Andrade por mensalão", url: "https://conjur.com.br/2019-dez-04/tj-mg-anula-processo-clesio-andrade-mensalao/" },
      { title: "STF manda processo de Azeredo para primeira instância", url: "https://www.conjur.com.br/2014-mar-27/stf-manda-processo-eduardo-azeredo-primeira-instancia/" }
    ],
    timeline: {
      start: {
        date: "1998",
        basis: "documented_start",
        sourceUrl: "https://www.itatiaia.com.br/politica/mensalao-tucano-o-escandalo-mineiro-que-antecedeu-o-mensalao-do-pt/",
        note: "Campanha de reeleição de Eduardo Azeredo.",
      },
      end: {
        date: "1998-10",
        basis: "documented_end",
        sourceUrl: "https://www.itatiaia.com.br/politica/mensalao-tucano-o-escandalo-mineiro-que-antecedeu-o-mensalao-do-pt/",
        note: "Eleição de outubro de 1998, perdida por Azeredo.",
      },
      exposed: {
        date: "2005",
        basis: "parliamentary_inquiry",
        sourceUrl: "https://www.itatiaia.com.br/politica/mensalao-tucano-o-escandalo-mineiro-que-antecedeu-o-mensalao-do-pt/",
        note: "Vem à tona sete anos depois, nas investigações do mensalão federal (CPMI dos Correios).",
      },
    },
  },

  "esquema_sudam_sudene": {
    title: "Fraudes na Sudam e na Sudene",
    reviewedAt: "2026-11-05",
    context: "A Sudam e a Sudene administravam o Finam e o Finor, fundos alimentados por renúncia fiscal que financiavam projetos privados na Amazônia e no Nordeste com fiscalização frágil sobre a execução das obras. Em 2000, um Grupo Especial de Trabalho do Ministério da Integração Nacional auditou a Sudam e encontrou irregularidades em 29 empreendimentos. O caso ganhou dimensão nacional pela rivalidade entre o então presidente do Senado, Jader Barbalho, e Antônio Carlos Magalhães, e levou a Câmara a instalar a CPI do Finor sobre o lado nordestino do mesmo mecanismo.",
    mechanism: "A empresa apresentava projeto em que se comprometia a aportar recursos próprios em proporção ao financiamento público. Para sacar as parcelas sem investir, simulava o aporte com notas fiscais, cheques, recibos e contratos falsos, repassando parte do dinheiro a laranjas e empresas de fachada. Sobre essa camada operacional havia a intermediação política: segundo o MPF, empresários acertavam com agentes políticos a interveniência junto a servidores da Sudam para aprovar projetos e liberar recursos, mediante percentual da verba. Os acusados negam.",
    impact: "R$ 1,5 bilhão foi o montante apurado pelo interventor nomeado pelo governo em 2001, somando cerca de R$ 1 bilhão em dívidas de empresas com a Sudam e aproximadamente R$ 600 milhões em projetos novos aprovados com irregularidade. A auditoria inicial falava em R$ 108 milhões em 29 projetos, o Correio Braziliense trabalhou com pelo menos R$ 4 bilhões e o Ministério da Integração chegou a estimar R$ 16 bilhões somando Finam e Finor. São critérios distintos de medição e não devem ser unificados. A Sudam e a Sudene foram extintas em 2001 e recriadas em 2007.",
    legalStatus: "Jader Barbalho renunciou à presidência do Senado em setembro de 2001 e ao mandato em outubro, foi preso por 13 horas em fevereiro de 2002 e condenado em 2013 pela Justiça Federal do Tocantins a ressarcir R$ 2,2 milhões; em 2019 o TRF-1 reformou a sentença por prescrição do ressarcimento e ausência de comprovação de improbidade. Na esfera criminal, o STF arquivou as denúncias sobre a Sudam e oito acusações prescreveram depois de 2014, o que é extinção da punibilidade e não juízo sobre culpa. Roseana Sarney e Jorge Murad foram investigados no desdobramento maranhense e negam irregularidade. Situação em novembro de 2026: o caso segue produzindo condenações cíveis isoladas, a mais recente em 27 de outubro de 2026, quando o MPF obteve o ressarcimento de R$ 1,48 milhão referente ao projeto da Ráfia do Maranhão, com recurso cabível.",
    sources: [
      { title: "MPF consegue na Justiça o ressarcimento de R$ 1,4 milhão desviados em projeto industrial no MA", url: "https://www.mpf.mp.br/o-mpf/unidades/pr-ma/noticias/mpf-consegue-na-justica-o-ressarcimento-de-r-1-4-milhao-desviados-em-projeto-industrial-no-ma" },
      { title: "Justiça Federal condena 11 pessoas por desvios de verbas repassadas pela SUDAM", url: "https://www.trf1.jus.br/sjto/noticias/justica-federal-condena-11-pessoas-por-desvios-de-verbas-repassadas-pela-sudam" },
      { title: "STF recebe Reclamação de procuradores de Jader Barbalho, preso em Palmas", url: "https://noticias.stf.jus.br/postsnoticias/stf-recebe-reclamacao-de-procuradores-de-jader-barbalho-preso-em-palmas-republicacao/" },
      { title: "Justiça Federal inocenta Jader Barbalho no caso Sudam por falta de provas", url: "https://dol.com.br/noticias/para/543446/justica-federal-inocenta-jader-barbalho-no-caso-sudam-por-falta-de-provas" },
      { title: "STF deixa processos contra políticos prescreverem", url: "https://www.congressoemfoco.com.br/noticia/52433/stf-deixa-processos-contra-politicos-prescreverem" },
      { title: "Superintendência do Desenvolvimento da Amazônia (Sudam) - verbete temático", url: "https://www18.fgv.br/cpdoc/acervo/dicionarios/verbete-tematico/superintendencia-do-desenvolvimento-da-amazonia-sudam" },
      { title: "Escândalo da Lunus, há 20 anos, tirou Roseana Sarney da sucessão presidencial", url: "https://jornalpequeno.com.br/2022/03/01/escandalo-da-lunus-ha-20-anos-tirou-roseana-sarney-da-sucessao-presidencial/" }
    ],
    timeline: {
      start: {
        date: "1997",
        basis: "documented_start",
        sourceUrl: "https://brasil.mongabay.com/2025/03/o-escandalo-da-sudam-ou-como-o-desmatamento-foi-apoiado-pelo-governo/",
        note: "A investigação se concentrou em atos de 1997 a 1999; fraudes anteriores são presumidas, não documentadas.",
      },
      end: {
        date: "1999",
        basis: "documented_end",
        sourceUrl: "https://brasil.mongabay.com/2025/03/o-escandalo-da-sudam-ou-como-o-desmatamento-foi-apoiado-pelo-governo/",
        note: "Fim do período investigado (1997-1999).",
      },
      exposed: {
        date: "2000",
        basis: "oversight",
        sourceUrl: "https://www18.fgv.br/cpdoc/acervo/dicionarios/verbete-tematico/superintendencia-do-desenvolvimento-da-amazonia-sudam",
        note: "Auditoria do Grupo Especial de Trabalho do Ministério da Integração Nacional.",
      },
    },
  },

  "esquema_vampiro": {
    title: "Operação Vampiro",
    reviewedAt: "2026-11-15",
    context: "Desde o início dos anos 90 a Polícia Federal investigava irregularidades em licitações do Ministério da Saúde. Em 2003, o ministro Humberto Costa pediu averiguação à PF e ao MPF, e as investigações se intensificaram após denúncia de uma fornecedora sobre licitação de hemoderivados. Em maio de 2004 a PF deflagrou a Operação Vampiro e prendeu 17 pessoas, entre servidores, lobistas e empresários.",
    mechanism: "Segundo o MPF, servidores cooptados ocupavam postos estratégicos e facilitavam fraudes nas concorrências em troca de propina, com lobistas ligados a políticos como intermediários. A PF comprovou fraudes em quatro concorrências no primeiro inquérito, e a acusação de 2006 descreve pagamentos em dinheiro vivo e em malas. Em ação de improbidade, o MPF também aponta acordo de divisão do mercado de hemoderivados entre empresários; as defesas contestam as interceptações.",
    impact: "US$ 100 milhões (cerca de R$ 280 milhões) em perdas com hemoderivados, estimativa do procurador Marlon Weichert, do MPF, em dezembro de 2004. O Ministério da Saúde estimou R$ 2 bilhões em 13 anos, valor que a PF não confirmou no primeiro inquérito, e uma reportagem de 2007 cita R$ 120 milhões entre 1997 e 2004 sem indicar quem apurou. A ação de improbidade pede ressarcimento de R$ 27,5 milhões.",
    legalStatus: "Em 2004 a Justiça Federal acolheu denúncia contra 20 pessoas, e em setembro de 2006 o MPF denunciou 33, entre elas o ex-ministro Humberto Costa e o ex-tesoureiro do PT Delúbio Soares, que negam as acusações. O TRF-5 absolveu Costa por unanimidade em 24 de março de 2010, por falta de provas; em 2020 o TRF1 decidiu pela impossibilidade de punir o empresário Marcelo Pitta, e a ação penal segue em segredo de justiça contra outros réus. Situação em novembro de 2026: não localizei sentenças dos demais denunciados nem o desfecho de Delúbio Soares neste caso.",
    sources: [
      { title: "Investigação na compra de hemoderivados leva à prisão de 14 pessoas", url: "https://www.saudebusiness.com/artigos/investigao-na-compra-de-hemoderivados-leva-priso-de-14-pessoas/" },
      { title: "Operação Vampiro: Fraudes não se limitam à Saúde", url: "https://www.correioforense.com.br/poder-publico/operacao-vampiro-fraudes-nao-se-limitam-a-saude/" },
      { title: "Prejuízo com fraudes na saúde chega a US$ 100 milhões", url: "https://portal.cfm.org.br/noticias/prejuizo-com-fraudes-na-saude-chega-a-us-100-milhoes/" },
      { title: "Polícia Federal indicia ex-ministro da Saúde", url: "https://www.congressoemfoco.com.br/noticia/92686/policia-federal-indicia-ex-ministro-da-saude" },
      { title: "Relatório da PF liga Delúbio a vampiros, diz Folha", url: "https://www.congressoemfoco.com.br/noticia/89040/relatorio-da-pf-liga-delubio-a-vampiros-diz-folha" },
      { title: "Procurador denuncia Humberto Costa e Delúbio Soares", url: "https://www.congressoemfoco.com.br/noticia/1398/procurador-denuncia-humberto-costa-e-delubio-soares" },
      { title: "TRF absolve Humberto Costa em processo da \"Operação Vampiro\"", url: "https://www.gazetadopovo.com.br/vida-publica/trf-absolve-humberto-costa-em-processo-da-operacao-vampiro-0492eins3ozcmheju8md0wnke/" },
      { title: "Preso na Operação Vampiro fechou R$ 647 mi em contratos sob Bolsonaro", url: "https://www.metropoles.com/brasil/preso-na-operacao-vampiro-fechou-r-647-mi-em-contratos-sob-bolsonaro" }
    ],
    timeline: {
      start: {
        date: "1990",
        basis: "documented_start",
        sourceUrl: "https://memorialdademocracia.com.br/card/deflagrada-a-operacao-vampiro",
        note: "PF: quadrilha atuava desde 1990 em fraudes contra o Ministério da Saúde.",
      },
      end: {
        date: "2004-05-19",
        basis: "police_investigation",
        sourceUrl: "https://www1.folha.uol.com.br/fsp/cotidian/ff2005200401.htm",
        note: "Operação Vampiro (Folha de 20/5/2004: \"prendeu ontem\"). Pedido de averiguação à PF em 2003 não foi público.",
      },
    },
  },

  "esquema_banestado": {
    title: "Caso Banestado",
    reviewedAt: "2026-11-05",
    context: "As contas CC-5, criadas pelo Banco Central em 1965 para não residentes, foram liberalizadas em 1992 e viraram canal de remessa ao exterior. Em 10 de abril de 1996 o então diretor da Área Internacional do BC, Gustavo Franco, assinou a Circular 2.677 e, em seguida, autorizou cinco bancos a aceitar depósitos em espécie acima de R$ 10 mil em Foz do Iguaçu, até o limite de R$ 100 mil. O caso veio à tona pelo próprio Banco Central, cujos fiscais notaram que os depósitos superavam o dinheiro transportado pelos carros-fortes que cruzavam a Ponte da Amizade.",
    mechanism: "O dinheiro entrava em contas-correntes comuns abertas em nome de laranjas nas agências do Banestado em Foz do Iguaçu, era transferido para contas CC5 de casas de câmbio e bancos estrangeiros e saía do país pela filial do banco em Nova York. A maior CC5 do esquema era a do Banco del Paraná. No exterior, boa parte dos recursos passava pela Beacon Hill Services Corporation, uma conta-ônibus de subcontas brasileiras em Nova York, fechada por ordem da Justiça americana. A venda do Banestado ao Itaú em 2000 abriu os cadastros da agência nova-iorquina à polícia.",
    impact: "US$ 24,059 bilhões saíram do país por contas CC5 entre abril de 1996 e janeiro de 2000, segundo cálculo da Polícia Federal, dos quais US$ 5,68 bilhões por contas mantidas no Banestado por meios fraudulentos. A CPMI trabalhou com estimativa maior, de cerca de US$ 32 bilhões entre 1996 e 2002. A ação penal principal teve por objeto R$ 2,44 bilhões depositados entre 1996 e 1997 por meio de 91 contas de laranjas. São critérios distintos: movimentação apurada, parcela fraudulenta e objeto processual.",
    legalStatus: "O relatório final da CPMI, do deputado José Mentor, citou 500 nomes e recomendou 91 indiciamentos, mas nunca foi votado. Em 2011 o STJ confirmou a condenação de 15 dirigentes e assessores do Banestado por gestão fraudulenta e evasão de divisas, com penas reduzidas pelo TRF4; houve absolvições em 2004, inclusive do ex-presidente do banco, e o último acusado foi absolvido em dezembro de 2009. Alberto Youssef, autor do primeiro acordo de colaboração premiada do país, teve o acordo rompido e foi condenado em 2014 a 4 anos e 4 meses por corrupção ativa, com absolvição parcial. Situação em novembro de 2026: sem novas condenações conhecidas, o caso é lembrado pelo alto índice de prescrições e como antecedente metodológico da Lava Jato.",
    sources: [
      { title: "Contas CC5 viabilizaram as movimentações ilegais", url: "https://www.camara.leg.br/noticias/58274-contas-cc5-viabilizaram-as-movimentacoes-ilegais/" },
      { title: "Para Gustavo Franco, criação de contas CC-5 foi revolução no câmbio", url: "https://www12.senado.leg.br/noticias/materias/2003/07/22/para-gustavo-franco-criacao-de-contas-cc-5-foi-revolucao-no-cambio" },
      { title: "CPI do Banestado recomenda indiciamento de Celso Pitta e Gustavo Franco. Nome de Maluf não aparece no relatório", url: "https://www12.senado.leg.br/noticias/materias/2004/12/14/cpi-do-banestado-recomenda-indiciamento-de-celso-pitta-e-gustavo-franco-nome-de-maluf-nao-aparece-no-relatorio" },
      { title: "STJ condena 15 por fraude no caso Banestado", url: "https://www.trf4.jus.br/trf4/controlador.php?acao=noticia_visualizar&id_noticia=16727" },
      { title: "José Mentor apresenta relatório final da CPI do Banestado", url: "https://www.camara.leg.br/radio/radioagencia/253434-jose-mentor-apresenta-relatorio-final-da-cpi-do-banestado-02-53/" },
      { title: "Justiça condena Alberto Youssef a 4 anos e 4 meses de prisão", url: "https://www.tribunapr.com.br/noticias/politica/justica-condena-alberto-youssef-a-4-anos-e-4-meses-de-prisao/" },
      { title: "Doleiros do caso Banestado são condenados a prisão", url: "https://conjur.com.br/2008-dez-15/doleiros_banestado_sao_condenados_prisao/" },
      { title: "Juiz absolve último acusado por evasão de divisas no caso Banestado", url: "https://www.conjur.com.br/2009-dez-24/juiz-absolve-ultimo-acusado-evasao-divisas-banestado/" }
    ],
    timeline: {
      start: {
        date: "1996-04-10",
        basis: "enabling_act",
        sourceUrl: "https://www.camara.leg.br/noticias/58274-contas-cc5-viabilizaram-as-movimentacoes-ilegais/",
        note: "Circular 2.677 do Banco Central libera depósitos em espécie nas CC5 de Foz do Iguaçu.",
      },
      end: {
        date: "2003-05",
        basis: "police_investigation",
        sourceUrl: "https://www.jusbrasil.com.br/noticias/mpf-pr-balanco-sobre-o-caso-banestado/21051",
        note: "Criação da força-tarefa CC5 do MPF, primeiro ato público localizado. Antes, alerta da fiscalização do BC levou o MP a pedir inquérito à PF (ano não localizado).",
      },
    },
  },

  "esquema_waldomiro_diniz": {
    title: "Caso Waldomiro Diniz",
    reviewedAt: "2026-11-05",
    context: "O caso veio a público em fevereiro de 2004, quando a revista Época divulgou gravação de 2002 em que Waldomiro Diniz, então presidente da Loterj, pedia propina e dinheiro de campanha ao empresário Carlinhos Cachoeira. Waldomiro era subchefe de Assuntos Parlamentares da Casa Civil e foi exonerado em 13 de fevereiro de 2004, no primeiro escândalo do governo Lula. A gravação levou à CPI da Loterj, à CPI dos Bingos e a investigações sobre a renovação do contrato da Caixa com a Gtech.",
    mechanism: "Na Loterj, em fevereiro de 2002, Waldomiro solicitou 1% do contrato com o Consórcio Combralog, representado por Cachoeira, e ajuda a campanhas eleitorais, segundo a denúncia do MP-RJ. Em 2003, já na Casa Civil, participou de três reuniões com dirigentes da Gtech sobre a renovação do contrato de loterias da Caixa. Segundo o TRF-1, ele condicionou a assinatura à contratação do advogado Rogério Buratti como consultor, que teria exigido valores milionários; Waldomiro alega ter sido chantageado e Buratti nega ter sido intermediário.",
    impact: "R$ 1,7 milhão correspondem ao 1% do contrato da Loterj solicitado por Waldomiro, segundo a denúncia do MP-RJ; as fontes lidas não registram pagamento. Na frente da Caixa, o TCU apontou prejuízo de R$ 433 milhões no contrato com a Gtech, mas a AGU esclareceu que a multa por improbidade (R$ 273 mil para Waldomiro e R$ 94 mil para Buratti em 2013) não tem relação com esse valor. A cifra da consultoria de Buratti varia entre mais de R$ 10 milhões (denúncia), R$ 16 milhões (CPI dos Bingos) e R$ 6 milhões (último valor exigido, segundo a Gtech).",
    legalStatus: "Na Loterj, Waldomiro e Cachoeira foram condenados em 2012 e, em 2013, o TJ-RJ reduziu as penas para 6 anos e 8 meses e os absolveu da fraude à licitação; em 2018 o STJ mandou executar a pena de Cachoeira, mas não a de Waldomiro, por haver recurso pendente. Na ação de improbidade, Waldomiro e Buratti foram condenados pelo TRF-1 em 2011 e recorreram ao STJ; a ação penal federal na 10ª Vara de Brasília segue sem desfecho localizado. Os acusados negam as imputações. Situação em novembro de 2026: sem informação posterior a 2018 sobre os recursos; última atualização verificada em maio de 2018.",
    sources: [
      { title: "Lula demite assessor acusado de corrupção e manda abrir inquérito", url: "https://www.tribunapr.com.br/noticias/lula-demite-assessor-acusado-de-corrupcao-e-manda-abrir-inquerito/" },
      { title: "Em sua defesa, Carlinhos Cachoeira alegou ilicitude da prova que apresentou", url: "https://conjur.com.br/2012-mar-01/defesa-carlinhos-cachoeira-alegou-ilicitude-prova-apresentou/" },
      { title: "TJ reduz penas de Waldomiro e Cachoeira no caso Loterj", url: "https://atarde.com.br/politica/tj-reduz-penas-de-waldomiro-e-cachoeira-no-caso-loterj-510900" },
      { title: "STJ antecipa execução da pena de prisão de Carlinhos Cachoeira", url: "https://conjur.com.br/2018-mai-04/stj-antecipa-execucao-pena-prisao-carlinhos-cachoeira/" },
      { title: "Condenados no caso Gtech resistem a pagar à União", url: "https://www.congressoemfoco.com.br/noticia/105209/condenados-no-caso-gtech-nao-pagam-multa-a-uniao" },
      { title: "Justiça Federal recebe denúncia contra Waldomiro Diniz por corrupção", url: "https://conjur.com.br/2011-jan-28/justica-federal-recebe-denuncia-waldomiro-diniz-corrupcao/" },
      { title: "Waldomiro nega ter extorquido dinheiro de Cachoeira", url: "https://www.gazetadopovo.com.br/vida-publica/waldomiro-nega-ter-extorquido-dinheiro-de-cachoeira-9ngu7h1a8g242i04wuxv1ci1a" }
    ],
    timeline: {
      start: {
        date: "2002-02",
        basis: "first_known_act",
        sourceUrl: "https://atarde.com.br/politica/tj-reduz-penas-de-waldomiro-e-cachoeira-no-caso-loterj-510900",
        note: "Pedido de propina gravado na Loterj.",
      },
      end: {
        date: "2004-02-13",
        basis: "police_investigation",
        sourceUrl: "https://www.tribunapr.com.br/noticias/lula-demite-assessor-acusado-de-corrupcao-e-manda-abrir-inquerito/",
        note: "Exoneração e ordem de abertura de inquérito, dias depois da revelação pela Época.",
      },
    },
  },

  "esquema_santo_andre": {
    title: "Esquema de Propinas de Santo André",
    reviewedAt: "2026-11-05",
    context: "Celso Daniel (PT) foi prefeito de Santo André em 1989-1992, 1997-2000 e no mandato iniciado em 2001. Em 18 de janeiro de 2002 foi sequestrado ao sair de um jantar com o empresário Sérgio Gomes da Silva, o Sombra, e executado com oito tiros dois dias depois, em Juquitiba. A Polícia Civil tratou o caso como crime comum; o Ministério Público de São Paulo sustentou motivação política, ligada a um esquema de propinas na prefeitura. Desse segundo fio nasceram uma ação penal, uma ação de improbidade e, mais de uma década depois, um desdobramento da Operação Lava Jato.",
    mechanism: "Segundo a denúncia do MP-SP, concessionárias de transporte coletivo pagavam propina mensal sob ameaça de ter os contratos com a prefeitura suspensos, contribuindo na proporção do número de ônibus de cada frota. O núcleo apontado reunia o secretário de Serviços Municipais e vereador Klinger Luiz de Oliveira Sousa, o assessor pessoal do prefeito Sérgio Gomes da Silva e o empresário de ônibus Ronan Maria Pinto, com intermediação de um funcionário da associação das empresas de transporte. Em 2004, segundo o MPF, um empréstimo simulado de R$ 12,1 milhões do Banco Schahin a José Carlos Bumlai levou recursos à Expresso Nova Santo André, tendo Ronan como destinatário final — operação que a Procuradoria descreveu como compra de silêncio, hipótese que o próprio TRF4 registrou não ter sido esclarecida nos autos.",
    impact: "R$ 3.566.805,11 é o valor que a 1ª Vara da Fazenda Pública de Santo André mandou restituir ao erário municipal em maio de 2016, referente à propina arrecadada das viações entre 1997 e 2001, em condenação solidária do PT e dos demais réus. O empréstimo bancário apontado como veículo de repasses posteriores foi de R$ 12.176.850,80, dos quais o MPF estima que mais de R$ 5 milhões chegaram a Ronan Maria Pinto, enquanto o TRF4 descreve o repasse como metade do total. As cifras seguem critérios distintos e não devem ser somadas.",
    legalStatus: "Seis integrantes da quadrilha foram condenados pelo júri de Itapecerica da Serra entre 2010 e 2012, com penas de 18 a 24 anos. Sérgio Gomes da Silva, denunciado como mandante, teve a ação penal anulada pelo STF em 2014, nunca foi a júri e morreu em 2016 — anulação por cerceamento de defesa não equivale a absolvição. No processo sobre o esquema de propinas, o TJ-SP confirmou em novembro de 2017 as condenações de Klinger Luiz de Oliveira Sousa (17 anos), Ronan Maria Pinto (14), Luiz Marcondes de Freitas Júnior (8) e Humberto Tarcísio de Castro (5), todos com recursos anunciados; outros réus foram absolvidos em primeira instância. Na frente de lavagem, o TRF4 confirmou as condenações em 2018, mas o STJ anulou a de Delúbio Soares em 3 de março de 2023 por incompetência da Justiça Federal, remetendo o caso à Justiça Eleitoral. Ronan Maria Pinto, José Dirceu, Gilberto Carvalho e José Carlos Bumlai negam envolvimento. Situação em novembro de 2026: nenhum mandante do assassinato foi julgado; as condenações criminais pelo esquema seguem pendentes de recurso e o desfecho da ação remetida à Justiça Eleitoral não foi localizado em fonte aberta.",
    sources: [
      { title: "Justiça de Santo André condena três envolvidos em esquema de propina no setor de transportes", url: "https://www.tjsp.jus.br/Noticias/Noticia?codigoNoticia=28793" },
      { title: "Condenado mais um acusado pela morte de Celso Daniel", url: "https://www.tjsp.jus.br/Noticias/noticia?codigoNoticia=15329" },
      { title: "PT é condenado a pagar R$ 3,5 mi por esquema de propina na gestão de Celso Daniel", url: "https://www.migalhas.com.br/quentes/239417/pt-e-condenado-a-pagar-r--3-5-mi-por-esquema-de-propina-na-gestao-de-celso-daniel" },
      { title: "Ronan Maria Pinto é preso por desvios em Santo André", url: "https://exame.com/brasil/ronan-maria-pinto-e-preso-por-desvios-em-santo-andre/" },
      { title: "No parecer contra Lula, Lava Jato reabre velha ferida do PT", url: "https://exame.com/brasil/no-parecer-contra-lula-lava-jato-reabre-velha-ferida-do-pt/" },
      { title: "Operação Lava Jato: TRF4 confirma condenação de Ronan Maria Pinto, Delúbio Soares e outros réus envolvidos com lavagem de dinheiro", url: "https://www.trf4.jus.br/trf4/controlador.php?acao=noticia_visualizar&id_noticia=13529" },
      { title: "Sombra, acusado pela morte de Celso Daniel, morre em São Paulo", url: "https://agenciabrasil.ebc.com.br/geral/noticia/2016-09/sombra-acusado-pela-morte-de-celso-daniel-morre-em-sao-paulo" },
      { title: "Ministro do STJ anula condenação de Delúbio na Lava Jato e remete caso à Justiça Eleitoral", url: "https://www.cnnbrasil.com.br/politica/ministro-do-stj-anula-condenacao-de-delubio-na-lava-jato-e-remete-caso-a-justica-eleitoral/" }
    ],
    timeline: {
      start: {
        date: "1997",
        basis: "documented_start",
        sourceUrl: "https://www.migalhas.com.br/quentes/239417/pt-e-condenado-a-pagar-r--3-5-mi-por-esquema-de-propina-na-gestao-de-celso-daniel",
        note: "Esquema montado na gestão Celso Daniel, de 1997 a 2001, segundo a sentença cível.",
      },
      end: {
        date: "2001",
        basis: "documented_end",
        sourceUrl: "https://www.migalhas.com.br/quentes/239417/pt-e-condenado-a-pagar-r--3-5-mi-por-esquema-de-propina-na-gestao-de-celso-daniel",
      },
      exposed: {
        date: "2002-01",
        basis: "police_investigation",
        sourceUrl: "https://www1.folha.uol.com.br/folha/brasil/ult96u60988.shtml",
        note: "Assassinato de Celso Daniel; a investigação do crime pelo MP-SP leva ao esquema de propinas.",
      },
    },
  },
  "esquema_dolares_na_cueca": {
    title: "Caso dos Dólares na Cueca",
    reviewedAt: "2026-11-05",
    context: "Em 8 de julho de 2005, a Polícia Federal prendeu no Aeroporto de Congonhas, em São Paulo, José Adalberto Vieira da Silva, assessor parlamentar na Assembleia do Ceará e dirigente do PT cearense, com R$ 209 mil e US$ 100.559 sem origem comprovada. O Ministério Público Federal sustentou que o dinheiro era propina ligada a um financiamento do Banco do Nordeste ao consórcio Sistema de Transmissão Nordeste. Adalberto alegou que o dinheiro veio de um amigo não identificado, para abrir dois negócios, e que nada tinha a ver com o financiamento.",
    mechanism: "Segundo o MPF, o consórcio STN, que tem a Alusa como acionista majoritária, obteve do BNB, com recursos do FNE, um financiamento aprovado em 25 de junho de 2004, após alteração de regras internas. O assessor especial da Presidência do banco, Kennedy Moura Ramos, teria articulado o contrato por indicação do então deputado estadual José Guimarães, e a consultora Enphase teria recebido cerca de R$ 1,97 milhão contra R$ 20 mil previstos. As defesas negam, e o TCU atestou em dezembro de 2005 a regularidade da operação.",
    impact: "R$ 447 mil foi o valor apreendido em Congonhas (R$ 209 mil em espécie e US$ 100.559 convertidos pela PTAX de R$ 2,3675 de 8 de julho de 2005), enquanto o financiamento investigado somou R$ 299.995.032,33 segundo a petição do MPF, valor que não corresponde à suposta propina. As fontes lidas divergem sobre a conversão do dinheiro apreendido: cerca de R$ 252 mil para US$ 100 mil no Congresso em Foco e cerca de R$ 600 mil em valores corrigidos na decisão de 2019. Não foi localizado prejuízo apurado nem valor recuperado; a sentença de 2012 fixou multas civis de R$ 10 mil a Roberto Smith e de R$ 300 mil ao STN.",
    legalStatus: "Em 2012, o STJ tirou José Guimarães da ação de improbidade, e a sentença de 14 de dezembro de 2012 reconheceu violação da impessoalidade, sem provar pagamento de propina, e multou Roberto Smith e o STN. Segundo o Aos Fatos e o O Povo, o TRF-5 aplicou multas a Adalberto, Smith e Kennedy Moura em 2014, e o desfecho final desses recursos não foi localizado. No inquérito penal, a Justiça Federal rejeitou o arquivamento em 2019 e, em agosto de 2021, declarou extinta a punibilidade por prescrição, sem julgamento de mérito. Situação em 5 de novembro de 2026: esfera penal encerrada por prescrição e desfecho definitivo da ação de improbidade não localizado.",
    sources: [
      { title: "Dólares na cueca: MP denuncia irmão de Genoino", url: "https://www.congressoemfoco.com.br/noticia/101576/dolares-na-cueca-mp-denuncia-irmao-de-genoino" },
      { title: "BNB conclui sindicância sobre Kennedy Moura", url: "https://diariodonordeste.verdesmares.com.br/politica/bnb-conclui-sindicancia-sobre-kennedy-moura-1.312211" },
      { title: "STJ livra deputado no caso \"dólares na cueca\"", url: "https://www.gazetadopovo.com.br/vida-publica/stj-livra-deputado-no-caso-dolares-na-cueca-3ig6sji2bm99fzob05hqbwea6/" },
      { title: "A sentença do caso do escândalo dos dólares na cueca", url: "https://www.blogdolauriberto.com/2013/01/a-sentenca-do-caso-do-escandalo-dos.html" },
      { title: "Deputado José Guimarães não foi flagrado com dólares na cueca nem preso", url: "https://www.aosfatos.org/noticias/deputado-jose-guimaraes-nao-foi-flagrado-com-dolares-na-cueca-nem-preso/" },
      { title: "Juiz nega arquivar caso de assessor flagrado com dólares", url: "https://conjur.com.br/2019-out-22/juiz-nega-arquivamento-assessor-flagrado-dolares/" },
      { title: "'Dólares na cueca': sentença exime deputado federal cearense José Guimarães após 16 anos do caso", url: "https://diariodonordeste.verdesmares.com.br/pontopoder/dolares-na-cueca-sentenca-exime-deputado-federal-cearense-jose-guimaraes-apos-16-anos-do-caso-1.3125857" },
      { title: "Após 16 anos, caso dos dólares na cueca de assessor do PT cearense prescreve", url: "https://www.opovo.com.br/noticias/politica/2021/08/20/apos-16-anos-caso-dos-dolares-na-cueca-de-assessor-do-pt-prescreve-na-justica.html" }
    ],
    timeline: {
      start: {
        date: "2004-06-25",
        basis: "first_known_act",
        sourceUrl: "https://www.congressoemfoco.com.br/noticia/101576/dolares-na-cueca-mp-denuncia-irmao-de-genoino",
        note: "Aprovação do financiamento do BNB ao consórcio STN.",
      },
      end: {
        date: "2005-07-08",
        basis: "police_investigation",
        sourceUrl: "https://www.aosfatos.org/noticias/deputado-jose-guimaraes-nao-foi-flagrado-com-dolares-na-cueca-nem-preso/",
        note: "Prisão do assessor no Aeroporto de Congonhas.",
      },
    },
  },

  "esquema_mensalao": {
    title: "Mensalão (Ação Penal 470)",
    reviewedAt: "2026-11-05",
    context: "Em maio de 2005, a revista Veja divulgou um vídeo de propina nos Correios que citava o deputado Roberto Jefferson (PTB). Em 6 de junho de 2005, Jefferson disse à Folha que o PT pagava mesadas a parlamentares da base aliada. A CPMI dos Correios foi instalada em 9 de junho, e Jefferson e José Dirceu perderam o mandato na Câmara em 2005. A PGR denunciou 40 pessoas ao STF em 2006 e a Ação Penal 470 foi aberta em 2007.",
    mechanism: "Segundo a PGR, uma organização com núcleos político-partidário, publicitário e financeiro usava as agências de Marcos Valério (SMP&B e DNA Propaganda), contratos com a Câmara e o Banco do Brasil, verbas do fundo Visanet e empréstimos simulados do Banco Rural para repassar dinheiro a partidos aliados. Parte dos réus sustentou tratar-se de caixa dois eleitoral, tese rejeitada pela maioria do STF. Não se constatou o pagamento mensal que deu nome ao caso.",
    impact: "R$ 55 milhões em empréstimos simulados de Banco Rural e BMG ao grupo de Marcos Valério, segundo a denúncia da PGR. O STF também reconheceu desvio no contrato da Câmara com a SMP&B e na verba do Banco do Brasil e do fundo Visanet, com R$ 73 milhões liberados à DNA segundo a Conjur. As cifras têm naturezas diferentes e não são somáveis; outras estimativas, como mais de R$ 150 milhões de operadoras de telefonia às agências de Valério, não entraram na primeira denúncia.",
    legalStatus: "O STF recebeu a denúncia em agosto de 2007, julgou o caso entre agosto e dezembro de 2012 e condenou 25 dos 38 réus. Em fevereiro e março de 2014, os embargos infringentes afastaram a formação de quadrilha, por 6 votos a 5, e a lavagem de João Paulo Cunha, e o processo terminou com 24 condenados e 13 absolvidos, entre eles Duda Mendonça e Luiz Gushiken. Entre 2015 e 2019 o STF extinguiu penas por indulto, de José Genoino a José Dirceu e aos dirigentes do Banco Rural; Henrique Pizzolato, extraditado da Itália em 2015, obteve livramento condicional em 2017. Situação em novembro de 2026: processo encerrado, com penas cumpridas ou extintas nos casos verificados; situação de Pedro Corrêa após outubro de 2016 e regime atual de Marcos Valério não verificados.",
    sources: [
      { title: "PGR diz que é inafastável reconhecimento de eficiente sistema de repasse ilícito de recursos", url: "https://noticias.stf.jus.br/postsnoticias/pgr-diz-que-e-inafastavel-reconhecimento-de-eficiente-sistema-de-repasse-ilicito-de-recursos/" },
      { title: "20 anos de Mensalão: entenda como tudo começou", url: "https://www.cnnbrasil.com.br/politica/20-anos-de-mensalao-entenda-como-tudo-comecou/" },
      { title: "Mensalão 20 anos: onde estão os personagens de um dos maiores escândalos do Brasil (até então)", url: "https://mais.opovo.com.br/reportagens-especiais/2025/06/04/mensalao-20-anos-onde-estao-os-personagens-de-um-dos-maiores-escandalos-do-brasil-ate-entao.html" },
      { title: "STF diz que não houve formação de quadrilha no mensalão", url: "https://exame.com/brasil/stf-diz-que-nao-houve-formacao-de-quadrilha-no-mensalao/" },
      { title: "Mensalão termina com 20 presos e 13 absolvições", url: "https://www.congressoemfoco.com.br/noticia/50711/mensalao-termina-com-20-presos-e-13-absolvicoes" },
      { title: "STF concede perdão a todo o núcleo político do mensalão", url: "https://www.congressoemfoco.com.br/noticia/46068/stf-concede-perdao-de-penas-a-todo-o-nucleo-politico-do-mensalao" },
      { title: "Barroso concede livramento condicional a Henrique Pizzolato", url: "https://conjur.com.br/2017-dez-27/barroso-concede-livramento-condicional-henrique-pizzolato/" },
      { title: "Barroso revoga punibilidade de ex-dirigentes do Rural baseado em indulto de Temer", url: "https://www.dgabc.com.br/Noticia/3068843/barroso-revoga-punibilidade-de-ex-dirigentes-do-rural-baseado-em-indulto-de-temer" }
    ],
    timeline: {
      start: {
        date: "2003",
        basis: "first_known_act",
        sourceUrl: "https://noticias.stf.jus.br/postsnoticias/pgr-diz-que-e-inafastavel-reconhecimento-de-eficiente-sistema-de-repasse-ilicito-de-recursos/",
        note: "Primeiros repasses descritos pela PGR e pelo STF (2003).",
      },
      end: {
        date: "2005-06-09",
        basis: "parliamentary_inquiry",
        sourceUrl: "https://www.cnnbrasil.com.br/politica/20-anos-de-mensalao-entenda-como-tudo-comecou/",
        note: "Instalação da CPMI dos Correios, três dias depois da entrevista de Roberto Jefferson. Um inquérito da PF sobre o vídeo dos Correios (maio de 2005) não foi confirmado.",
      },
    },
  },

  "esquema_sanguessugas": {
    title: "Máfia dos Sanguessugas",
    reviewedAt: "2026-11-05",
    context: "Em maio de 2006 a Polícia Federal deflagrou a Operação Sanguessuga, que investigou fraudes na compra de ambulâncias e equipamentos de saúde por prefeituras e entidades com recursos de emendas parlamentares ao Orçamento da União. A colaboração premiada de Luiz Antônio Vedoin, sócio da Planam, levou à criação de uma CPI, cujo relatório final foi aprovado em dezembro de 2006.",
    mechanism: "Segundo o MPF e a PF, a Planam, empresa da família Vedoin em Mato Grosso, vencia licitações direcionadas e pagava propina a parlamentares em troca de emendas. Os pedidos de liberação seguiam ao Ministério da Saúde, onde, segundo a CPI, uma assessora aprovava convênios e facilitava a liberação dos recursos; ela nega ter sido indicada pelos Vedoin e diz que foi usada pela família. Os parlamentares citados que se manifestaram negam as acusações ou afirmam que os valores eram ajuda de campanha.",
    impact: "R$ 110 milhões é a estimativa feita à época da operação para o total movimentado pelo grupo Planam, e não um valor de prejuízo comprovado. A CGU e o Denasus apuraram prejuízo mínimo de R$ 15,5 milhões, o relatório parcial da CPI contabilizou R$ 9,46 milhões em propinas e o relatório final da CPI fala em mais de R$ 100 milhões desviados. As cifras medem grandezas diferentes e não foram unificadas; o valor recuperado não foi localizado.",
    legalStatus: "Luiz Antônio Vedoin foi condenado na ação principal, mas o TRF-1 declarou extinta sua punibilidade por prescrição em 2021; Darci Vedoin, segundo o FolhaMax, teve a prescrição da lavagem reconhecida pelo STF em 2022. O STF condenou os ex-deputados Paulo Feijó (2017) e Nilton Capixaba (2018), com trânsito em julgado, e absolveu Jefferson Campos em 2014; no Senado, Serys Slhessarenko e Magno Malta foram absolvidos e Ney Suassuna recebeu apenas advertência em 2006. Os desfechos de Lino Rossi, Ney Suassuna (denúncia de 2008) e Magno Malta (indiciamento de 2007) não foram localizados. Situação em novembro de 2026: última atualização verificada em 24 de setembro de 2022 (FolhaMax); sem informação posterior localizada.",
    sources: [
      { title: "Entenda o caso: o que foi a Operação Sanguessuga", url: "https://www.congressoemfoco.com.br/noticia/71007/entenda-o-caso-o-que-foi-a-operacao-sanguessuga" },
      { title: "Aprovado relatório final da CPI dos Sanguessugas", url: "https://www.congressoemfoco.com.br/noticia/87457/aprovado-relatorio-final-da-cpi-dos-sanguessugas" },
      { title: "STF condena deputado Paulo Feijó por corrupção e lavagem de dinheiro", url: "https://www.congressoemfoco.com.br/noticia/40533/stf-condena-deputado-paulo-feijo-por-corrupcao-e-lavagem-de-dinheiro" },
      { title: "STF determina execução de pena de deputado condenado à prisão na Máfia das Ambulâncias", url: "https://www.congressoemfoco.com.br/noticia/33009/stf-determina-execucao-de-pena-de-deputado-condenado-a-prisao-na-mafia-das-ambulancias" },
      { title: "TRF-1 vê prescrição na ação principal da Máfia dos Sanguessugas", url: "https://conjur.com.br/2021-fev-17/trf-ve-prescricao-acao-principal-mafia-sanguessugas/" },
      { title: "STF reconhece prescrição e anula condenação de mentor de Máfia em MT", url: "https://www.folhamax.com/politica/stf-reconhece-prescricao-e-anula-condenacao-de-mentor-de-mafia-em-mt/368253" },
      { title: "Deputado é absolvido de envolvimento com Máfia dos Sanguessugas", url: "https://www2.oabrs.org.br/jornalDaOrdem/deputado-eacute-absolvido-de-envolvimento-com-maacute-fia-dos-sanguessugas/35634" },
      { title: "Conselho absolve senadores citados na CPI", url: "https://www.congressoemfoco.com.br/noticia/100560/conselho-absolve-senadores-citados-na-cpi" }
    ],
    timeline: {
      start: {
        date: "2000",
        basis: "documented_start",
        sourceUrl: "https://www12.senado.leg.br/noticias/materias/2006/07/31/cpi-dos-sanguessugas-deve-decidir-proximos-passos-nesta-terca-feira",
        note: "CPMI: provas de que o esquema funcionava pelo menos desde 2000.",
      },
      end: {
        date: "2006-05",
        basis: "police_investigation",
        sourceUrl: "https://www.congressoemfoco.com.br/noticia/71007/entenda-o-caso-o-que-foi-a-operacao-sanguessuga",
        note: "Operação Sanguessuga. Órgãos de controle apuravam o caso desde 2004, sem ato público.",
      },
    },
  },

  "esquema_operacao_navalha": {
    title: "Operação Navalha / Máfia das Obras",
    reviewedAt: "2026-11-19",
    context: "A Operação Navalha foi deflagrada pela Polícia Federal em maio de 2007 para desarticular uma rede de corrupção voltada a fraudes em licitações, superfaturamento e repasses de propinas em obras públicas federais e estaduais (como no PAC e no programa Luz Para Todos). O centro empresarial do esquema era a Construtora Gautama, pertencente ao empresário Zuleido Soares de Veras. Conduzida por ordem da ministra Eliana Calmon, do STJ, a operação teve 48 mandados de prisão preventiva e 84 de busca e apreensão e levou à prisão de 46 pessoas, entre elas o chefe de gabinete do Ministério de Minas e Energia, um ex-governador do Maranhão, um deputado distrital, cinco secretários do governo de Alagoas e um conselheiro do Tribunal de Contas de Sergipe.",
    mechanism: "A Construtora Gautama direcionava editais de licitação públicos em governos estaduais (Maranhão, Alagoas, Sergipe, Piauí) e órgãos federais. Executivos da empresa pagavam vantagens indevidas a servidores e assessores públicos (como Ivo Almeida Costa no Ministério de Minas e Energia) para acelerar liberações orçamentárias, aprovar aditivos contratuais e atestar medições irregulares. Segundo a investigação, a rede atuou em obras do programa Luz para Todos, de saneamento, estradas e pontes, com recursos dos ministérios de Minas e Energia, da Integração Nacional, das Cidades e do Planejamento e do Dnit, em nove estados e no Distrito Federal, e usava como meios de aliciamento o custeio de viagens, presentes como carros de luxo e pagamentos em dinheiro.",
    impact: "R$ 178.700.000 de prejuízo auditado e valor em contratos com irregularidades apurados pela Controladoria-Geral da União (CGU) na Construtora Gautama.",
    legalStatus: "O escândalo provocou a saída do ministro de Minas e Energia, Silas Rondeau, que negou a acusação, e a exoneração de secretários estaduais. Em 2008, a PGR denunciou 61 investigados ao STJ. Em março de 2010, diante do tamanho da denúncia — 128 páginas, 28 volumes e 215 apensos —, a Corte Especial do STJ desmembrou a ação por unanimidade: o \"evento Sergipe\", que envolvia um conselheiro do Tribunal de Contas do estado, ficou inicialmente no tribunal; os fatos do Maranhão e do programa Luz para Todos foram enviados à Justiça Federal no Maranhão e no Distrito Federal, e os de Alagoas, à Justiça de Alagoas. O caso havia chegado ao STJ porque os então governadores de Alagoas e do Maranhão estavam entre os investigados, mas as assembleias legislativas não autorizaram ação penal contra eles. Com o desmembramento das ações, os processos enfrentaram anulação de interceptações telefônicas, absolvições e prescrições; em 2018 o TRF-5 votou pelo arquivamento da ação contra Zuleido Veras e outros réus do \"evento Sergipe\", e o MPF recorreu; em 2019 o processo do evento Sergipe não estava encerrado. Situação em novembro de 2026: desfecho do recurso do MPF não localizado; sem condenação definitiva localizada.",
    sources: [
      { title: "Confira a lista de presos na Operação Navalha - G1", url: "https://g1.globo.com/Noticias/Politica/0,,MUL38115-5601,00.html" },
      { title: "Especial Máfia das Obras - Folha Online", url: "https://www1.folha.uol.com.br/folha/especial/2007/mafiadasobras/" },
      { title: "Acusado pela PF, Silas Rondeau entrega o cargo a Lula - Senado Notícias", url: "https://www2.senado.leg.br/bdsf/bitstream/handle/id/406619/noticia.htm?sequence=1&isAllowed=y" },
      { title: "Réus da Operação Navalha voltam a ser julgados pelo STJ - Infonet", url: "https://infonet.com.br/noticias/politica/reus-da-operacao-navalha-voltam-a-ser-julgados-pelo-stj/" },
      { title: "Mantida decisão que aceitou denúncia contra acusados na Operação Navalha - Migalhas", url: "https://www.migalhas.com.br/quentes/178584/mantida-decisao-que-aceitou-denuncia-contra-acusados-na-operacao-navalha" },
      { title: "Corte Especial do STJ decide desmembrar ação da Operação Navalha - Consultor Jurídico", url: "https://conjur.com.br/2010-mar-22/corte-especial-stj-decide-desmembrar-acao-operacao-navalha/" },
      { title: "Operação Navalha - O Estado de S. Paulo (19/05/2007), via Senado Federal", url: "https://www2.senado.leg.br/bdsf/bitstream/handle/id/327540/noticia.htm?sequence=1&isAllowed=y" }
    ],
    timeline: {
      start: {
        date: "2003-11",
        basis: "enabling_act",
        sourceUrl: "https://www.planalto.gov.br/ccivil_03/decreto/2003/d4873.htm",
        note: "Criação do Luz para Todos, um dos programas fraudados. O início das fraudes da Gautama não é datado nas fontes.",
      },
      end: {
        date: "2007-05-17",
        basis: "police_investigation",
        sourceUrl: "https://g1.globo.com/Noticias/Politica/0,,MUL48053-5601,00.html",
        note: "Deflagração da operação. A PF investigava em sigilo desde novembro de 2006.",
      },
    },
  },

  "esquema_caixa_pandora": {
    title: "Operação Caixa de Pandora / Mensalão do DF",
    reviewedAt: "2026-11-18",
    context: "A Operação Caixa de Pandora (Mensalão do DF) foi deflagrada pela Polícia Federal em novembro de 2009. A investigação desarticulou uma ampla rede de corrupção instalada no Governo do Distrito Federal durante a gestão do governador José Roberto Arruda (DEM) e do vice Paulo Octávio (DEM).",
    mechanism: "Empresas prestadoras de serviços (especialmente de tecnologia e logística) repassavam entre 10% e 20% do valor de faturas e contratos públicos como retorno ilícito. O ex-secretário Durval Barbosa centralizava a arrecadação e distribuía o dinheiro vivo em mesadas para deputados distritais e secretários para garantir apoio parlamentar e aprovação de contas. A operação teve enorme repercussão pública por contar com dezenas de vídeos gravados pelo próprio delator registrando o recebimento de propina.",
    impact: "R$ 110 milhões é a estimativa mínima de desvio feita pela PGR na denúncia de 2012 contra integrantes do esquema; as investigações mencionaram valores maiores em movimentações sob suspeita, não comprovados em sentença.",
    legalStatus: "Na esfera cível, José Roberto Arruda acumula condenações colegiadas por improbidade administrativa: em junho de 2026 a 6ª Turma Cível do TJDFT manteve, por unanimidade, a condenação dele, de José Geraldo Maciel, de José Celso Valadares Gontijo e da Call Tecnologia, com R$ 1 milhão por réu em danos morais coletivos, e manteve a absolvição de Paulo Octávio nessa ação. Com base nessas condenações, o TSE manteve em 24/09/2026 o indeferimento da candidatura de Arruda ao governo do DF. Em 13/10/2026, a 1ª Turma Cível do TJDFT afastou as condenações de Arruda, Maciel, Nerci Soares de Souza e da Uni Repro em outra ação, por considerar ilícitas as gravações de Durval Barbosa, e manteve apenas a condenação do delator ao ressarcimento de R$ 152,5 mil; a defesa de Arruda chamou a decisão de justa e sustenta que as provas foram declaradas ilícitas pela Justiça Eleitoral. Situação em novembro de 2026: condenações cíveis sujeitas a recurso, sem trânsito em julgado localizado.",
    sources: [
      { title: "Mensalão do DEM desviou pelo menos R$ 110 milhões, diz PGR - G1", url: "https://g1.globo.com/politica/noticia/2012/06/mensalao-do-dem-desviou-pelo-menos-r-110-milhoes-diz-pgr.html" },
      { title: "Caixa de Pandora: ex-governador Arruda é condenado à suspensão de direitos políticos por 12 anos - G1 DF", url: "https://g1.globo.com/df/distrito-federal/noticia/2024/09/06/caixa-de-pandora-ex-governador-arruda-e-condenado-a-suspensao-de-direitos-politicos-por-12-anos.ghtml" },
      { title: "Caixa de Pandora: Justiça do DF absolve Arruda por improbidade administrativa - G1 DF", url: "https://g1.globo.com/df/distrito-federal/noticia/2026/10/22/caixa-de-pandora-justica-do-df-absolve-arruda-e-outros-tres-reus-por-improbidade-administrativa.ghtml" },
      { title: "Condenado a devolver R$ 594 milhões ao erário, Arruda levaria 2.001 anos para quitar dívida - Metrópoles", url: "https://www.metropoles.com/colunas/grande-angular/condenado-a-devolver-r-594-milhoes-ao-erario-arruda-levaria-2-001-anos-para-quitar-divida" },
      { title: "Arruda, Paulo Octávio e a coligação que dilapidou os cofres do DF - Metrópoles", url: "https://www.metropoles.com/materias-especiais/arruda-paulo-octavio-e-a-coligacao-que-dilapidou-os-cofres-do-df" }
    ],
    timeline: {
      start: {
        date: "2007-01",
        basis: "enabling_act",
        sourceUrl: "https://www.congressoemfoco.com.br/noticia/77253/esquema-de-durval-comecou-no-governo-roriz",
        note: "Posse de José Roberto Arruda, recorte do dossiê. O esquema de Durval Barbosa começou antes, no governo Roriz (ano não especificado).",
      },
      end: {
        date: "2009-11-27",
        basis: "police_investigation",
        sourceUrl: "https://g1.globo.com/politica/noticia/2012/06/mensalao-do-dem-desviou-pelo-menos-r-110-milhoes-diz-pgr.html",
        note: "Deflagração da operação.",
      },
    },
  },

  "esquema_operacao_porto_seguro": {
    title: "Operação Porto Seguro",
    reviewedAt: "2026-11-19",
    context: "A Operação Porto Seguro foi deflagrada pela Polícia Federal e pelo Ministério Público Federal em novembro de 2012 para desarticular uma organização criminosa incrustada na administração pública federal encarregada da negociação, encomenda e elaboração de pareceres técnicos e jurídicos fraudulentos. A investigação partiu do relato de um auditor do Tribunal de Contas da União, Cyonil da Cunha Borges, que disse à PF ter recebido de Paulo Vieira, em 2007, uma oferta de R$ 300 mil para emitir parecer favorável à Tecondi, operadora de um terminal de contêineres no Porto de Santos; o próprio auditor passou a ser acusado de receber propina. Deflagrada em 23 de novembro de 2012, a operação mobilizou 180 agentes em Brasília e em cidades paulistas, cumpriu 43 mandados de busca e apreensão e prendeu seis pessoas; 18 foram indiciadas.",
    mechanism: "O grupo utilizava a influência de Rosemary Noronha, chefe do escritório da Presidência em SP, para nomear e manter aliados em cargos diretivos de agências reguladoras (como Paulo Vieira na ANA e Rubens Vieira na ANAC). A rede cooptou autoridades como o vice-advogado-geral da União, José Weber Holanda, expedindo pareceres sob encomenda para beneficiar empresas privadas em contratos no Porto de Santos e empreendimentos nas ilhas de Bagre e das Cabras. Segundo a PF, Paulo Vieira aproximava empresários com pendências em órgãos públicos de servidores dispostos a favorecê-los, e Rosemary Noronha costumava marcar as reuniões, recebendo em troca, segundo a investigação, viagens de navio, apoio jurídico e dinheiro.",
    impact: "R$ 38 milhões é o valor cuja devolução o MPF pediu em 2013, em ação de improbidade contra investigados e a empresa Tecondi; o desfecho da ação não foi localizado.",
    legalStatus: "A eclosão do caso levou à exoneração de Rosemary Noronha e José Weber, além da demissão dos irmãos Vieira das agências reguladoras. O MPF ofereceu denúncias criminais contra 24 investigados. Em fevereiro de 2014, a 5ª Vara Federal Criminal de São Paulo recebeu a denúncia contra 18 acusados, entre eles Rosemary Noronha e os irmãos Paulo e Rubens Vieira, por formação de quadrilha, tráfico de influência e corrupção ativa, e dividiu o processo em núcleos: os pareceres do TCU sobre a Tecondi; empreendimentos da Codesp nas ilhas dos Bagres e das Cabras, em que, segundo o MPF, Paulo Vieira pagou propina a servidores da Secretaria do Patrimônio da União para beneficiar empresas ligadas ao ex-senador Gilberto Miranda; uma tentativa de fraude em licitações dos Correios, enviada a Brasília; a aprovação de cursos de uma faculdade de Paulo Vieira no Ministério da Educação; e a relação entre Rosemary e os irmãos Vieira. Em outubro de 2021, a Justiça Federal em SP encerrou as ações penais e trancou os processos contra os réus devido ao reconhecimento da anulação das escutas telefônicas por ilegalidade probatória.",
    sources: [
      { title: "Veja os principais fatos da Operação Porto Seguro - UOL", url: "https://noticias.uol.com.br/politica/ultimas-noticias/2012/12/03/confira-os-principais-fatos-relacionados-a-operacao-porto-seguro.htm" },
      { title: "Polícia Federal entrega relatório final da Operação Porto Seguro - G1", url: "https://g1.globo.com/politica/noticia/2012/12/policia-federal-entrega-relatorio-final-da-operacao-porto-seguro.html" },
      { title: "MPF denuncia 24 investigados na Operação Porto Seguro - G1", url: "https://g1.globo.com/sao-paulo/noticia/2012/12/mpf-denuncia-24-investigados-na-operacao-porto-seguro.html" },
      { title: "Procuradoria apresenta nova denúncia da Operação Porto Seguro - Folha de S.Paulo", url: "https://www1.folha.uol.com.br/poder/2014/05/1462837-procuradoria-apresenta-nova-denuncia-da-operacao-porto-seguro.shtml" },
      { title: "Justiça Federal em SP encerra ação penal contra Rosemary Noronha - G1", url: "https://g1.globo.com/sp/sao-paulo/noticia/2021/10/19/justica-federal-em-sp-encerra-acao-penal-contra-rosemary-noronha-ex-assessora-de-lula.ghtml" },
      { title: "MPF pede devolução de R$ 38 milhões de investigados na Operação Porto Seguro - O Globo", url: "https://oglobo.globo.com/politica/mpf-pede-devolucao-de-38-milhoes-de-investigados-na-operacao-porto-seguro-8355189" },
      { title: "Denúncia de propina de auditor levou PF a investigar diretor da ANA - G1", url: "https://g1.globo.com/politica/noticia/2012/11/denuncia-de-propina-de-auditor-levou-pf-investigar-diretor-de-estatal.html" },
      { title: "Justiça Federal aceita denúncia contra investigados da Operação Porto Seguro - Agência Brasil", url: "https://agenciabrasil.ebc.com.br/politica/noticia/2014-02/justica-federal-aceita-denuncia-contra-investigados-da-operacao-porto" }
    ],
    timeline: {
      start: {
        date: "2007",
        basis: "first_known_act",
        sourceUrl: "https://g1.globo.com/politica/noticia/2012/11/denuncia-de-propina-de-auditor-levou-pf-investigar-diretor-de-estatal.html",
        note: "Oferta de R$ 300 mil ao auditor do TCU, primeiro ato datado.",
      },
      end: {
        date: "2012-11-23",
        basis: "police_investigation",
        sourceUrl: "https://noticias.uol.com.br/politica/ultimas-noticias/2012/12/03/confira-os-principais-fatos-relacionados-a-operacao-porto-seguro.htm",
        note: "Deflagração da operação.",
      },
    },
  },

  "esquema_trensalao": {
    title: "Trensalão / Máfia dos Trens de SP",
    reviewedAt: "2026-11-17",
    context: "O Trensalão (ou Máfia dos Trens de SP) veio a público em maio de 2013, quando a multinacional alemã Siemens assinou acordo de leniência com o CADE e o Ministério Público Federal. A empresa revelou a existência de um cartel formado por fabricantes globais para manipular licitações de compra, modernização e manutenção de trens da CPTM e do Metrô de SP entre 1998 e 2008.",
    mechanism: "As multinacionais envolvidas (Siemens, Alstom, CAF, Bombardier, entre outras) reuniam-se previamente para definir o consórcio vencedor de cada edital, apresentando propostas de cobertura inflacionadas para simular concorrência. As empresas derrotadas eram compensadas por subcontratações cruzadas. Os repasses de propinas a diretores estatais e políticos ocorriam via contratos simulados de consultoria com empresas de fachada (como a Procint) e contas bancárias secretas na Suíça.",
    impact: "R$ 9.400.000.000 (Soma dos contratos licitatórios auditados pelo CADE sob suspeita de manipulação, gerando sobrepreço estimado entre R$ 800 milhões e R$ 1,5 bilhão aos cofres públicos paulistas)",
    legalStatus: "Em julho de 2019, o CADE aplicou R$ 535 milhões em multas administrativas a 11 empresas e 42 pessoas físicas, proibindo a Alstom de participar de licitações federais por 5 anos. Na esfera penal e de improbidade, a apuração desmembrou-se em diversas ações, com bloqueios de contas no exterior, absolvições e prescrições. O conselheiro do TCE-SP Robson Marinho, afastado em 2014 sob suspeita de receber propina da Alstom, voltou ao cargo em 2022, depois que a Justiça Federal declarou extinta a punibilidade por prescrição em dezembro de 2021. Situação em novembro de 2026: sem condenação penal definitiva localizada.",
    sources: [
      { title: "Cade condena 11 empresas e 42 pessoas por cartel de trens e metrôs - G1", url: "https://g1.globo.com/economia/noticia/2019/07/08/cade-condena-11-empresas-e-42-pessoas-por-cartel-de-trens-e-metros.ghtml" },
      { title: "PF conclui inquérito do cartel dos trens em SP e indicia 33 pessoas - G1", url: "https://g1.globo.com/sao-paulo/noticia/2014/12/pf-conclui-inquerito-do-cartel-dos-trens-e-indicia-33-pessoas.html" },
      { title: "PF indicia consultor por lavagem de dinheiro em cartel no Metrô de SP - G1", url: "https://g1.globo.com/sao-paulo/noticia/2013/11/pf-indicia-consultor-por-lavagem-de-dinheiro-em-cartel-no-metro-de-sp.html" },
      { title: "Consultor confirma ter pago US$ 250 mil para ex-diretor da CPTM - Jornal Nacional", url: "https://g1.globo.com/jornal-nacional/noticia/2014/01/consultor-confirma-ter-pago-us-250-mil-para-ex-diretor-da-cptm.html" },
      { title: "O cartel dos trens leva a maré anticorrupção para São Paulo - EL PAÍS Brasil", url: "https://brasil.elpais.com/brasil/2014/12/05/politica/1417813172_432211.html" },
      { title: "Após 7 anos afastado por suspeita de corrupção, Robson Marinho volta ao TCE-SP - IstoÉ Dinheiro/Estadão Conteúdo", url: "https://istoedinheiro.com.br/apos-7-anos-afastado-por-suspeita-de-corrupcao-robson-marinho-volta-ao-tce-sp" }
    ],
    timeline: {
      start: {
        date: "1998",
        basis: "documented_start",
        sourceUrl: "https://g1.globo.com/economia/noticia/2019/07/08/cade-condena-11-empresas-e-42-pessoas-por-cartel-de-trens-e-metros.ghtml",
        note: "Cartel em licitações da CPTM e do Metrô entre 1998 e 2008.",
      },
      end: {
        date: "2008",
        basis: "documented_end",
        sourceUrl: "https://g1.globo.com/economia/noticia/2019/07/08/cade-condena-11-empresas-e-42-pessoas-por-cartel-de-trens-e-metros.ghtml",
      },
      exposed: {
        date: "2013-05",
        basis: "oversight",
        sourceUrl: "https://brasil.elpais.com/brasil/2014/12/05/politica/1417813172_432211.html",
        note: "Acordo de leniência da Siemens com o CADE e o MPF.",
      },
    },
  },

  "esquema_lava_jato": {
    title: "Operação Lava Jato / Escândalo do Petrolão",
    reviewedAt: "2026-11-17",
    context: "A Operação Lava Jato foi deflagrada pela Polícia Federal em março de 2014, com a prisão do doleiro Alberto Youssef, e expôs um esquema de corrupção em contratos da Petrobras. Em delação homologada pelo STF em setembro de 2014, o ex-diretor de Abastecimento Paulo Roberto Costa, que disse ter sido indicado ao cargo pelo PP, descreveu repasses de contratos da estatal a partidos.",
    mechanism: "Segundo colaboradores, empreiteiras pagavam percentuais sobre contratos de diretorias da Petrobras distribuídas entre partidos, e o dinheiro chegava a políticos e a caixa dois de campanhas por meio de operadores e doleiros como Alberto Youssef e Fernando Baiano. Em depoimento de 2014, Costa afirmou que o PT recebia 3% de contratos pela Diretoria de Serviços e que PMDB e PP também se beneficiavam; são alegações de colaboradores.",
    impact: "R$ 6.200.000.000 (perdas com corrupção reconhecidas pela Petrobras no balanço de 2014). Nos acordos de leniência de dezembro de 2016 com Brasil, EUA e Suíça, Odebrecht e Braskem comprometeram-se a pagar cerca de R$ 6,9 bilhões, dos quais cerca de R$ 3,82 bilhões cabem à Odebrecht; em 2023 o STF declarou imprestáveis as provas obtidas a partir do acordo da Odebrecht. O MPF pede R$ 2,3 bilhões ao PP em ação civil de improbidade, ainda sem decisão localizada.",
    legalStatus: "A operação produziu condenações em Curitiba, mas o STF anulou boa parte delas ou os atos que as sustentavam: as condenações de Lula (2021), as duas de Eduardo Cunha, os atos de duas ações penais contra José Dirceu (2024) e os atos contra Marcelo Odebrecht (2024), Léo Pinheiro (2025), Alberto Youssef (2025) e João Vaccari Neto (2025). Fernando Collor cumpre pena de 8 anos e 10 meses por condenação definitiva do STF, e Renato Duque voltou à prisão em 2024 e passou ao semiaberto em 2025, com julgamento sobre a anulação de seus processos interrompido no STF em novembro de 2025. Situação em novembro de 2026: delações e acordos de leniência não foram anulados, embora as provas obtidas a partir do acordo da Odebrecht tenham sido declaradas imprestáveis em 2023, e não foi localizado desfecho da ação de improbidade contra o PP, que nega as acusações.",
    sources: [
      { title: "Petrobras reconhece perda de 6,2 bilhões de reais com a corrupção - EL PAÍS Brasil", url: "https://brasil.elpais.com/brasil/2015/04/23/politica/1429744001_078177.html" },
      { title: "Partidos receberam propina por contratos na Petrobras - Congresso em Foco", url: "https://www.congressoemfoco.com.br/noticias/partidos-receberam-propina-por-contratos-na-petrobras/" },
      { title: "Odebrecht e Braskem assinam acordos de leniência com EUA e Suíça - G1", url: "https://g1.globo.com/politica/operacao-lava-jato/noticia/odebrecht-e-braskem-fecham-acordo-com-suica.ghtml" },
      { title: "STF mantém tramitação de ações penais contra ex-deputado Eduardo Cunha - STF", url: "https://noticias.stf.jus.br/postsnoticias/stf-mantem-tramitacao-de-acoes-penais-contra-ex-deputado-eduardo-cunha/" },
      { title: "Moraes manda prender ex-presidente Fernando Collor - Agência Brasil", url: "https://agenciabrasil.ebc.com.br/justica/noticia/2025-04/moraes-manda-prender-ex-presidente-fernando-collor" },
      { title: "STF mantém nulidade de atos da Lava Jato contra Marcelo Odebrecht - STF", url: "https://noticias.stf.jus.br/?p=93703" },
      { title: "Dias Toffoli anula todos os atos da Lava Jato contra doleiro Alberto Youssef - SBT News", url: "https://sbtnews.sbt.com.br/noticia/politica/dias-toffoli-anula-todos-os-atos-da-lava-jato-contra-doleiro-alberto-youssef" },
      { title: "STF anula atos processuais de duas ações penais contra José Dirceu - STF", url: "https://noticias.stf.jus.br/postsnoticias/stf-anula-atos-processuais-de-duas-acoes-penais-contra-jose-dirceu/" }
    ],
    timeline: {
      start: {
        date: "2004",
        basis: "enabling_act",
        sourceUrl: "https://www.congressoemfoco.com.br/noticias/partidos-receberam-propina-por-contratos-na-petrobras/",
        note: "Paulo Roberto Costa assume a Diretoria de Abastecimento por indicação do PP; o início dos repasses não tem data única nas fontes.",
      },
      end: {
        date: "2014-03-17",
        basis: "police_investigation",
        sourceUrl: "https://brasil.elpais.com/brasil/2015/04/23/politica/1429744001_078177.html",
        note: "Deflagração da operação. O inquérito sobre doleiros corria em sigilo desde antes.",
      },
    },
  },

  "esquema_operacao_zelotes": {
    title: "Operação Zelotes / Escândalo do CARF",
    reviewedAt: "2026-11-17",
    context: "A Operação Zelotes foi deflagrada pela Polícia Federal em março de 2015 para desarticular um esquema criminoso atuante no Conselho Administrativo de Recursos Fiscais (CARF), órgão do Ministério da Fazenda responsável por julgar recursos tributários. Em fases subsequentes, a operação expandiu seu escopo para apurar a suposta compra e venda de Medidas Provisórias destinadas à concessão de incentivos fiscais ao setor automotivo.",
    mechanism: "O esquema no CARF funcionava mediante o vazamento de informações sigilosas sobre pautas de julgamento por conselheiros e servidores cooptados para escritórios de advocacia e consultorias privadas (como S3 Gestão). Intermediários contatavam grandes devedores do Fisco oferecendo decisões favoráveis e anulação de autuações bilionárias mediante pagamento de propinas maquiadas como honorários. Na frente legislativa, investigaram-se pagamentos de montadoras a escritórios de consultoria para obter prorrogações de benefícios tributários via Medidas Provisórias (como a MP 471/2009 e a MP 627/2013).",
    impact: "R$ 19.000.000.000 (Soma dos débitos cobrados pela Receita Federal em processos fiscais sob suspeita no CARF, com prejuízo direto auditado de R$ 5,7 bilhões e R$ 32 milhões rastreados em repasses de consultorias do setor automotivo)",
    legalStatus: "O escândalo motivou a reformulação do regimento interno do CARF. Na ação sobre a suposta compra de medidas provisórias, o TRF-1 absolveu em abril de 2020 os nove réus, entre eles ex-conselheiros e lobistas, das acusações de corrupção, lavagem e associação criminosa, e condenou o ex-diretor do Senado Fernando Mesquita por advocacia administrativa, e em junho de 2021 a Justiça Federal de Brasília absolveu Lula e Gilberto Carvalho. Em junho de 2017 o TRF-1 arquivou a ação penal contra o presidente do Bradesco, Luiz Carlos Trabuco, por falta de provas; o desfecho para os demais denunciados nesse caso não foi localizado. A ação contra Guido Mantega, réu desde 2018 no caso Cimentos Penha, foi encerrada por prescrição em fevereiro de 2025. Situação em novembro de 2026: sem condenação definitiva localizada nas ações citadas.",
    sources: [
      { title: "Entenda a Operação Zelotes - G1", url: "https://g1.globo.com/politica/noticia/2016/02/entenda-operacao-zelotes.html" },
      { title: "Entenda a Operação Zelotes da Polícia Federal - Folha de S.Paulo", url: "https://www1.folha.uol.com.br/mercado/2015/04/1611246-entenda-a-operacao-zelotes-da-policia-federal.shtml" },
      { title: "TRF-1 absolve nove condenados por venda de medidas provisórias - Migalhas", url: "https://www.migalhas.com.br/quentes/325747/trf-1-absolve-nove-condenados-por-venda-de-medidas-provisorias-nos-governos-lula-e-dilma" },
      { title: "Justiça Federal absolve Lula e Gilberto Carvalho na operação Zelotes - Migalhas", url: "https://www.migalhas.com.br/quentes/347371/justica-federal-absolve-lula-e-gilberto-carvalho-na-operacao-zelotes" },
      { title: "TRF1 absolve três ex-conselheiros do Carf denunciados na Operação Zelotes - JOTA", url: "https://www.jota.info/tributos/trf1-absolve-tres-ex-conselheiros-do-carf-denunciados-na-operacao-zelotes" },
      { title: "Justiça arquiva ação penal contra presidente do Bradesco - Agência Brasil", url: "https://agenciabrasil.ebc.com.br/politica/noticia/2017-06/justica-arquiva-acao-penal-contra-presidente-do-bradesco" }
    ],
    timeline: {
      start: {
        date: "2005",
        basis: "documented_start",
        sourceUrl: "https://www.politize.com.br/operacao-zelotes-crime-investigado/",
        note: "Há indícios de que o esquema começou em 2005.",
      },
      end: {
        date: "2015-03-26",
        basis: "police_investigation",
        sourceUrl: "https://www1.folha.uol.com.br/mercado/2015/04/1611246-entenda-a-operacao-zelotes-da-policia-federal.shtml",
        note: "Deflagração da operação; investigação sigilosa desde 2013.",
      },
    },
  },

  "esquema_operacao_greenfield": {
    title: "Operação Greenfield / Fraudes nos Fundos de Pensão",
    reviewedAt: "2026-11-17",
    context: "A Operação Greenfield foi deflagrada pela Polícia Federal e pelo Ministério Público Federal em setembro de 2016 com base em auditorias e investigações da CPI dos Fundos de Pensão. O objetivo foi desarticular esquemas de gestão temerária, superfaturamento de ativos e fraudes em aportes efetuados pelos quatro maiores fundos de previdência de estatais do país: Funcef, Petros, Previ e Postalis.",
    mechanism: "Diretores e conselheiros de investimentos dos fundos de pensão estatais — indicados politicamente por legendas como PT e PMDB — atuavam em conluio com gestores de Fundos de Investimento em Participações (FIPs) e executivos de grandes conglomerados privados (como o Grupo J&F). O grupo aprovava a compra de quotas de participação e aportes bilionários em ativos sobreavaliados mediante laudos técnicos simulados, recebendo em troca vantagens ilícitas e taxas de intermediação dissimuladas em contratos de consultoria.",
    impact: "R$ 8.000.000.000 em bens bloqueados pela Justiça Federal na deflagração da operação, em 2016; o bloqueio é global e não equivale a prejuízo comprovado. A primeira denúncia aceita, em 2017, aponta prejuízo de R$ 402 milhões à Funcef. A J&F firmou acordo de leniência de R$ 10,3 bilhões em 2017.",
    legalStatus: "Em maio de 2017, a Justiça Federal aceitou a primeira denúncia e tornou réus 14 investigados, entre eles João Vaccari Neto e ex-dirigentes da Funcef, por crimes contra o sistema financeiro, gestão fraudulenta e temerária, lavagem de dinheiro e tráfico de influência; os desfechos dessas ações não foram localizados. Em dezembro de 2023, o ministro Dias Toffoli suspendeu o pagamento da multa da leniência da J&F e, em novembro de 2025, a Justiça Federal de Brasília anulou cláusula penal do acordo e mandou recalcular o valor. Situação em novembro de 2026: ações penais remanescentes sem desfecho localizado.",
    sources: [
      { title: "PF faz operação em 8 estados e no DF contra fraude em fundos de pensão - G1 DF", url: "https://g1.globo.com/distrito-federal/noticia/2016/09/operacao-contra-fraude-em-fundos-de-pensao-leva-pf-8-estados-e-df.html" },
      { title: "Operação da PF mira 4 maiores fundos de pensão do Brasil e bloqueia R$ 8 bi - Folha de S.Paulo", url: "https://www1.folha.uol.com.br/mercado/2016/09/1810338-operacao-da-pf-mira-4-maiores-fundos-de-pensao-do-brasil-e-bloqueia-r-8-bi.shtml" },
      { title: "Operação Greenfield revela fraudes nos fundos de pensão - Senado Notícias", url: "https://www2.senado.leg.br/bdsf/bitstream/handle/id/525541/noticia.html?sequence=1&isAllowed=y" },
      { title: "Toffoli suspende pagamento de multa de R$ 10 bilhões do acordo de leniência da J&F - G1", url: "https://g1.globo.com/politica/noticia/2023/12/20/toffoli-suspende-pagamento-de-multa-de-r-10-bilhoes-do-acordo-de-leniencia-da-jandf.ghtml" },
      { title: "Juiz vê coação em acordo de leniência da J&F e reduz multa bilionária - Migalhas", url: "https://www.migalhas.com.br/quentes/443706/juiz-ve-coacao-em-acordo-de-leniencia-da-j-f-e-reduz-multa-bilionaria" },
      { title: "TRF-1 tranca investigação contra Paulo Guedes em operação sobre fraudes em fundos de pensão - Migalhas", url: "https://www.migalhas.com.br/quentes/334506/trf-1-tranca-investigacao-contra-paulo-guedes-em-operacao-sobre-fraudes-em-fundos-de-pensao" },
      { title: "Vaccari e ex-diretores da Funcef se tornam réus na Operação Greenfield - Agência Brasil", url: "https://agenciabrasil.ebc.com.br/geral/noticia/2017-05/vaccari-e-ex-diretores-da-funcef-se-tornam-reus-na-operacao-greenfield" }
    ],
    timeline: {
      start: {
        date: "2011",
        basis: "documented_start",
        sourceUrl: "https://mpmt.mp.br/conteudo/726/93125/ft-greenfield-aciona-13-pessoas-por-improbidade-administrativa-pela-gestao-temeraria-dos-fundos-de-pensao-petros-funcef-e-previ",
        note: "Investimentos questionados feitos entre 2011 e 2016.",
      },
      end: {
        date: "2016-09",
        basis: "police_investigation",
        sourceUrl: "https://www2.senado.leg.br/bdsf/bitstream/handle/id/525541/noticia.html?sequence=1&isAllowed=y",
        note: "Deflagração da operação.",
      },
    },
  },

  "esquema_jbs_mala_rocha_loures": {
    title: "Escândalo da JBS / Mala do Rocha Loures",
    reviewedAt: "2026-11-17",
    context: "O Escândalo da JBS e o episódio da Mala do Rocha Loures vieram a público em maio de 2017 após a homologação das delações premiadas dos executivos do Grupo J&F (Joesley Batista, Wesley Batista e Ricardo Saud) no STF. As apurações da Operação Patmos revelaram gravações de conversas entre Joesley e o presidente Michel Temer no Palácio do Jaburu e ações controladas de entregas de propina efetuadas pela Polícia Federal.",
    mechanism: "De acordo com a denúncia, o presidente Michel Temer teria indicado o deputado e assessor especial Rodrigo Rocha Loures para atuar em benefício do Grupo J&F perante o CADE em processo relativo ao preço do gás fornecido à termelétrica Âmbar Energia. Para intermediar o pleito, acertou-se o repasse semanal de R$ 500 mil em propina durante 20 anos, tendo a Polícia Federal filmado a entrega da primeira parcela em uma mala carregada por Rocha Loures em São Paulo.",
    impact: "R$ 500.000 é o valor da mala entregue a Rodrigo Rocha Loures e filmada pela PF em ação controlada, em 2017. O grupo J&F firmou acordo de leniência de R$ 10,3 bilhões com o MPF, e Joesley Batista declarou em delação cerca de R$ 500 milhões em doações oficiais, dos quais R$ 400 milhões seriam, segundo ele, contrapartida a ajustes ilícitos; é alegação de colaborador.",
    legalStatus: "A Câmara barrou em 2017 as duas denúncias da PGR contra Michel Temer. Depois do mandato, o caso da mala foi à Justiça Federal; em 2021 o TRF-1 arquivou a ação contra Temer por falta de provas, decisão mantida pelo STJ, e em maio de 2024 o ministro Edson Fachin rejeitou recurso do MPF. Na ação de obstrução de Justiça, Temer foi absolvido em 2019. Aécio Neves foi absolvido em 2022 da acusação de pedir R$ 2 milhões a Joesley Batista, com absolvição confirmada pelo TRF-3 em 2023. A sentença da ação contra Rodrigo Rocha Loures não foi localizada. Situação em novembro de 2026: sem condenação localizada dos políticos citados.",
    sources: [
      { title: "Rocha Loures entrega mala de R$ 500 mil na sede da PF em SP - G1", url: "https://g1.globo.com/sao-paulo/noticia/rocha-loures-entrega-mala-de-r-500-mil-na-sede-da-pf-em-sao-paulo.ghtml" },
      { title: "Delação da JBS: veja todos os VÍDEOS e os principais pontos - G1", url: "https://g1.globo.com/politica/noticia/delacao-da-jbs-veja-os-videos-dos-depoimentos.ghtml" },
      { title: "STF libera conteúdo da delação dos donos da JBS - G1", url: "https://g1.globo.com/politica/noticia/stf-libera-conteudo-da-delacao-dos-donos-da-jbs.ghtml" },
      { title: "Câmara rejeita denúncia e livra Temer de responder a processo no Supremo - G1", url: "https://g1.globo.com/politica/noticia/votacao-denuncia-temer-camara.ghtml" },
      { title: "Juiz absolve Michel Temer da acusação de obstruir Justiça - G1", url: "https://g1.globo.com/politica/noticia/2019/10/16/tem-que-manter-isso-viu-juiz-absolve-temer-da-acusacao-de-obstruir-a-justica-apos-conversa-com-joesley.ghtml" },
      { title: "Justiça Federal do DF absolve Temer e mais cinco de suposto esquema em portos - G1", url: "https://g1.globo.com/politica/noticia/2021/03/19/justica-federal-do-df-absolve-temer-e-mais-cinco-de-suposto-esquema-de-corrupcao-em-portos.ghtml" },
      { title: "Fachin nega recurso e confirma fim de investigação contra Temer em caso da mala com dinheiro - CartaCapital", url: "https://www.cartacapital.com.br/justica/fachin-nega-recurso-e-confirma-fim-de-investigacao-contra-temer-em-caso-da-mala-com-dinheiro/" },
      { title: "Justiça Federal absolve deputado federal Aécio Neves da acusação de corrupção passiva no caso J&F - TRF-3", url: "https://web.trf3.jus.br/noticias-sjsp/Noticiar/ExibirNoticia/227-justica-federal-absolve-deputado-federal-aecio-neves" }
    ],
    timeline: {
      start: {
        date: "2017-03",
        basis: "first_known_act",
        sourceUrl: "https://g1.globo.com/politica/noticia/delacao-da-jbs-veja-os-videos-dos-depoimentos.ghtml",
        note: "Conversa gravada de Joesley Batista com Michel Temer no Jaburu.",
      },
      end: {
        date: "2017-05-18",
        basis: "police_investigation",
        sourceUrl: "https://g1.globo.com/politica/noticia/stf-libera-conteudo-da-delacao-dos-donos-da-jbs.ghtml",
        note: "Operação Patmos. A entrega da mala, em abril, foi ação controlada sigilosa.",
      },
    },
  },

  "esquema_operacao_cadeia_velha": {
    title: "Operação Cadeia Velha",
    reviewedAt: "2026-11-17",
    context: "A Operação Cadeia Velha foi deflagrada pela Polícia Federal e pelo Ministério Público Federal em novembro de 2017 como desdobramento da Lava Jato no Rio de Janeiro. A investigação mirou um esquema institucionalizado de propinas na Assembleia Legislativa do Estado do Rio de Janeiro (Alerj) mantido pela cúpula do PMDB fluminense em conluio com empresas de transporte urbano e empreiteiras.",
    mechanism: "A Federação das Empresas de Transportes de Passageiros (Fetranspor) operava uma caixinha de propinas em dinheiro vivo para garantir a aprovação de leis de isenção fiscal (IPVA e ICMS) e manter tarifas favoráveis. A cúpula da Alerj (composta pelos deputados Jorge Picciani, Paulo Melo e Edson Albertassi) direcionava a pauta legislativa em troca de mesadas ilícitas, cujos valores eram lavados por meio de vendas fictícias de gado superfaturado pela empresa Agrobilara.",
    impact: "R$ 348.700.000 em movimentações que, segundo o MPF, passaram pela caixa de propinas da Fetranspor, com repasses atribuídos de R$ 69,5 milhões a Jorge Picciani, R$ 55,7 milhões a Paulo Melo e R$ 1,7 milhão a Edson Albertassi; são cifras da acusação, cujos atos decisórios foram anulados em 2022.",
    legalStatus: "Em 2019, o TRF-2 condenou os deputados por corrupção, lavagem de dinheiro e organização criminosa, e o juiz Marcelo Bretas condenou empresários e operadores em primeira instância. Jorge Picciani morreu em maio de 2021. Em 2022 o STF anulou a condenação de Paulo Melo por vício processual e, em agosto de 2022, o TRF-2 enviou o caso à Justiça estadual e anulou todos os atos decisórios, inclusive o recebimento da denúncia. Em novembro de 2023 a Justiça do Rio arquivou, por falta de provas, a ação de improbidade contra Paulo Melo e Edson Albertassi. Situação em novembro de 2026: sem condenação válida localizada.",
    sources: [
      { title: "MPF antecipou operação 'Cadeia Velha' após indicação de Albertassi ao TCE - G1", url: "https://g1.globo.com/rio-de-janeiro/noticia/operacao-cadeia-velha-investiga-cupula-da-alerj.ghtml" },
      { title: "TRF2 condena ex-presidente da Alerj e dois ex-deputados por corrupção - Agência Brasil", url: "https://agenciabrasil.ebc.com.br/justica/noticia/2019-03/trf2-condena-ex-presidente-da-alerj-e-dois-ex-deputados-por-corrupcao" },
      { title: "STF anula condenação do ex-presidente da Alerj Paulo Melo a 12 anos de prisão na Lava Jato - G1", url: "https://g1.globo.com/rj/rio-de-janeiro/noticia/2022/03/17/por-3-votos-a-2-stf-anula-condenacao-do-ex-presidente-da-alerj-paulo-melo-a-12-anos-de-prisao-na-lava-jato.ghtml" },
      { title: "Justiça arquiva acusações da operação Cadeia Velha contra Edson Albertassi e Paulo Melo - G1", url: "https://g1.globo.com/rj/sul-do-rio-costa-verde/noticia/2023/11/29/justica-arquiva-acusacoes-da-operacao-cadeia-velha-contra-edson-albertassi-e-paulo-melo.ghtml" },
      { title: "TRF-2 manda para a Justiça estadual processo da operação Cadeia Velha - Migalhas", url: "https://www.migalhas.com.br/quentes/371799/trf-2-manda-para-a-justica-estadual-processo-da-operacao-cadeia-velha" }
    ],
    timeline: {
      start: {
        date: "1990",
        basis: "documented_start",
        sourceUrl: "http://combateacorrupcao.mpf.mp.br/feeder_novo/lava-jato/4c37f792bb76be936cab4ef9e67f3bc4",
        note: "MPF: Picciani recebia propinas \"desde os anos 1990\"; 1990 é aproximação da década.",
      },
      end: {
        date: "2017-03",
        basis: "documented_end",
        sourceUrl: "https://oglobo.globo.com/politica/mpf-picciani-albertassi-receberam-propina-da-fetranspor-ate-2017-22070175",
        note: "Último pagamento da Fetranspor apontado pelo MPF.",
      },
      exposed: {
        date: "2017-11-14",
        basis: "police_investigation",
        sourceUrl: "https://g1.globo.com/rio-de-janeiro/noticia/operacao-cadeia-velha-investiga-cupula-da-alerj.ghtml",
        note: "Deflagração da operação.",
      },
    },
  },

  "esquema_caso_queiroz_rachadinhas": {
    title: "Escândalo das Rachadinhas / Caso Queiroz",
    reviewedAt: "2026-11-17",
    context: "O Escândalo das Rachadinhas (Caso Queiroz) veio à tona em dezembro de 2018 a partir da divulgação de um relatório do Coaf produzido no âmbito dos desdobramentos da Lava Jato no Rio de Janeiro. O documento apontou movimentações atípicas de R$ 1,2 milhão na conta bancária de Fabrício Queiroz, ex-assessor do então deputado estadual Flávio Bolsonaro na Alerj.",
    mechanism: "De acordo com as investigações do MP-RJ, assessores parlamentares nomeados no gabinete do deputado estadual sacavam em dinheiro vivo a maior parte de seus proventos e devolviam as quantias ao ex-PM Fabrício Queiroz. O operador financeiro centralizava os recursos arrecadados para pagar despesas pessoais do parlamentar e lavar os valores mediante aquisições imobiliárias e depósitos em espécie em uma franquia comercial de chocolates.",
    impact: "R$ 6.100.000 é o valor de desvio estimado na denúncia do MP-RJ de 2020, que apontou R$ 2,07 milhões recebidos por Fabrício Queiroz em depósitos de assessores; são cifras da acusação, cuja denúncia foi rejeitada pelo TJ-RJ em 2022.",
    legalStatus: "O MP-RJ denunciou Flávio Bolsonaro, Fabrício Queiroz e outras 15 pessoas em 2020. Entre 2021 e 2022, o STJ e o STF anularam quebras de sigilo e decisões do juízo de primeira instância, e em 16/05/2022 o Órgão Especial do TJ-RJ rejeitou a denúncia por falta de justa causa, a pedido do próprio MP, sem impedir nova investigação. Em fevereiro de 2025 o ministro Gilmar Mendes negou recursos do MP-RJ para reabrir o caso. Flávio Bolsonaro sempre negou as acusações. Situação em novembro de 2026: sem denúncia em curso localizada.",
    sources: [
      { title: "Caso Fabrício Queiroz: o que é, cronologia dos fatos, envolvidos - G1", url: "https://g1.globo.com/rj/rio-de-janeiro/noticia/2019/01/18/caso-fabricio-queiroz-o-que-e-cronologia-dos-fatos-personagens.ghtml" },
      { title: "Queiroz recebeu R$ 2 milhões em 483 depósitos de assessores ligados a Flávio, diz MP - G1", url: "https://g1.globo.com/rj/rio-de-janeiro/noticia/2019/12/18/queiroz-recebeu-r-2-milhoes-em-483-depositos-de-assessores-ligados-a-flavio-bolsonaro-diz-mp.ghtml" },
      { title: "Ex-PM era suspeito de chefiar grupo que cometeu dezenas de homicídios - G1 JN", url: "https://g1.globo.com/jornal-nacional/noticia/2020/02/10/ex-pm-era-suspeito-de-chefiar-grupo-que-cometeu-dezenas-de-homicidios.ghtml" },
      { title: "STJ anula todas as decisões de juiz contra Flávio Bolsonaro no caso das rachadinhas - G1", url: "https://g1.globo.com/politica/noticia/2021/11/09/stj-anula-todas-as-decisoes-de-juiz-contra-flavio-bolsonaro-nas-rachadinhas.ghtml" },
      { title: "STF mantém foro privilegiado de Flávio Bolsonaro e anula provas - G1 JN", url: "https://g1.globo.com/jornal-nacional/noticia/2021/11/30/stf-mantem-foro-privilegiado-de-flavio-bolsonaro-e-anula-provas-no-caso-das-rachadinhas.ghtml" },
      { title: "MPRJ pede anulação da denúncia contra Flávio Bolsonaro no caso das rachadinhas - G1", url: "https://g1.globo.com/rj/rio-de-janeiro/noticia/2022/05/11/mp-pede-anulacao-da-denuncia-contra-flavio-bolsonaro-no-caso-das-rachadinhas-sem-prejuizo-do-reinicio-das-investigacoes.ghtml" },
      { title: "Órgão Especial rejeita denúncia no caso das rachadinhas depois da anulação de provas no STJ e STF e de MP pedir extinção do processo - TJ-RJ", url: "https://portaltj.tjrj.jus.br/noticias/noticia/-/visualizar-conteudo/5111210/92111643" },
      { title: "Gilmar Mendes nega recursos para reabrir caso da rachadinha contra Flávio Bolsonaro - Folha", url: "https://www1.folha.uol.com.br/blogs/brasilia-hoje/2025/02/gilmar-mendes-nega-recursos-para-reabrir-caso-da-rachadinha-contra-flavio-bolsonaro.shtml" }
    ],
    timeline: {
      start: {
        date: "2007",
        basis: "documented_start",
        sourceUrl: "https://conjur.com.br/2020-nov-04/mp-denuncia-flavio-bolsonaro-esquema-rachadinha-alerj/",
        note: "Denúncia do MP-RJ: esquema entre 2007 e 2018.",
      },
      end: {
        date: "2018-12",
        basis: "oversight",
        sourceUrl: "https://g1.globo.com/rj/rio-de-janeiro/noticia/2019/01/18/caso-fabricio-queiroz-o-que-e-cronologia-dos-fatos-personagens.ghtml",
        note: "Relatório do Coaf vem a público. A denúncia situa o fim do esquema no mesmo ano (2018).",
      },
    },
  },

  "esquema_laranjas_do_psl": {
    title: "Escândalo dos Laranjas do PSL",
    reviewedAt: "2026-11-17",
    context: "O Escândalo dos Laranjas do PSL veio à tona em fevereiro de 2019 em reportagens investigativas da Folha de S.Paulo. As matérias apontaram que o Partido Social Liberal (PSL) lançou candidaturas femininas fictícias nas eleições de 2018 para simular o cumprimento da cota compulsória de 30% de mulheres fixada pelo TSE e desviar verbas públicas do Fundo Especial de Financiamento de Campanha.",
    mechanism: "Dirigentes estaduais do PSL registravam mulheres como candidatas sem que houvesse atos efetivos de campanha. Repasses expressivos do fundo eleitoral eram feitos a essas candidatas e rapidamente transferidos para gráficas de fachada ou empresas vinculadas a assessores de lideranças partidárias em Minas Gerais e Pernambuco, retornando para o caixa dois de campanhas masculinas ou enriquecimento ilícito.",
    impact: "R$ 400.000 do fundo eleitoral foram repassados a uma candidata do PSL em Pernambuco que obteve 274 votos, e R$ 279.000 a candidatas investigadas em Minas Gerais, segundo as investigações; a candidata de Pernambuco foi absolvida pela Justiça Eleitoral em 2022.",
    legalStatus: "O escândalo causou a demissão do ministro Gustavo Bebianno em fevereiro de 2019. Em Minas Gerais, o MP denunciou o então ministro do Turismo Marcelo Álvaro Antônio e assessores; em junho de 2026 o ministro Gilmar Mendes, do STF, arquivou o inquérito. Em Pernambuco, a PF indiciou o presidente do PSL, Luciano Bivar, cuja defesa afirma que ele não foi denunciado, e a Justiça Eleitoral absolveu candidatas em junho de 2022, com possibilidade de recurso. Os acusados negam irregularidades. Situação em novembro de 2026: sem condenação localizada.",
    sources: [
      { title: "Entenda as investigações sobre candidaturas laranjas do PSL - G1", url: "https://g1.globo.com/politica/noticia/2019/04/29/entenda-as-investigacoes-sobre-candidatos-laranja.ghtml" },
      { title: "Ministro do Turismo é denunciado pelo MP-MG por candidaturas-laranja do PSL - G1", url: "https://g1.globo.com/mg/minas-gerais/noticia/2019/10/04/ministro-do-turismo-e-denunciado-pelo-ministerio-publico-de-mg-por-candidaturas-laranja-do-psl-1.ghtml" },
      { title: "PF indicia Luciano Bivar e mais 3 por suspeita no caso de candidatura laranja - Poder360", url: "https://www.poder360.com.br/justica/pf-indicia-luciano-bivar-e-mais-3-por-suspeita-no-caso-de-candidatura-laranja/" },
      { title: "PF prende assessor e dois ex-auxiliares do ministro do Turismo - Senado Notícias", url: "https://www2.senado.leg.br/bdsf/bitstream/handle/id/563676/noticia.html?sequence=1&isAllowed=y" },
      { title: "TSE decide que candidatura laranja de mulheres gera cassação integral da chapa - Congresso em Foco", url: "https://www.congressoemfoco.com.br/noticia/32161/tse-decide-que-candidatura-laranja-de-mulheres-gera-cassacao-integral-da-chapa" },
      { title: "Candidatas do PSL são absolvidas na Justiça eleitoral no caso das laranjas de 2018 - O Globo", url: "https://oglobo.globo.com/politica/noticia/2022/06/candidatas-do-psl-sao-absolvidas-na-justica-eleitoral-no-caso-das-laranjas-de-2018.ghtml" },
      { title: "Gilmar arquiva inquérito contra ex-ministro de Bolsonaro por candidaturas laranjas - Amado Mundo", url: "https://amadomundo.com/gilmar-arquiva-inquerito-contra-ex-ministro-de-bolsonaro-por-candidaturas-laranjas/" }
    ],
    timeline: {
      start: {
        date: "2018",
        basis: "first_known_act",
        sourceUrl: "https://g1.globo.com/politica/noticia/2019/04/29/entenda-as-investigacoes-sobre-candidatos-laranja.ghtml",
        note: "Candidaturas fictícias nas eleições de 2018.",
      },
      end: {
        date: "2019-02-27",
        basis: "police_investigation",
        sourceUrl: "https://www.poder360.com.br/governo/pf-abre-inquerito-sobre-suspeitas-de-candidaturas-laranjas-do-psl-em-minas/",
        note: "PF abre inquérito em Minas, depois das reportagens da Folha.",
      },
    },
  },

  "esquema_operacao_placebo": {
    title: "Operação Placebo / Compras da Pandemia no RJ",
    reviewedAt: "2026-11-19",
    context: "A Operação Placebo foi deflagrada pela Polícia Federal em maio de 2020 por ordem do Superior Tribunal de Justiça. As investigações apuraram esquemas de corrupção, fraudes em compras emergenciais sem licitação e loteamento de cargos na Secretaria de Estado de Saúde do Rio de Janeiro durante a pandemia de Covid-19. Em paralelo, o Ministério Público do Rio investigou contratos da mesma Secretaria na Operação Mercadores do Caos, que levou à prisão do ex-subsecretário executivo Gabriell Neves, em maio de 2020, e do ex-secretário Edmar Santos, exonerado em maio, em 10 de julho de 2020; Edmar foi solto por decisão do STJ em 7 de agosto do mesmo ano.",
    mechanism: "A Secretaria de Saúde do RJ dispensou concorrências públicas e efetuou contratos milionários com dispensa de licitação para a construção de hospitais de campanha e aquisição de respiradores superfaturados. Paralelamente, uma rede de operadores e agentes públicos centralizava o recolhimento de propinas junto a Organizações Sociais (como o IABAS) e fornecedores privados, maquiando os repasses ilícitos por meio de contratos simulados de serviços advocatícios. Dos sete hospitais de campanha prometidos para a Covid-19, apenas dois foram inaugurados. Para a compra de mil respiradores, contratada por R$ 183,3 milhões em três contratos, auditoria da própria Secretaria de Saúde concluída em julho de 2020 apontou fraude, prejuízo de R$ 123 milhões e omissão do então secretário, e registrou que as empresas escolhidas valiam menos de 1% do valor dos contratos; segundo a Agência Brasil, só 52 aparelhos foram entregues, e nenhum servia para pacientes graves de Covid-19. Procurados à época, Edmar Santos e Gabriell Neves não se manifestaram.",
    impact: "R$ 835.700.000 é o valor do contrato emergencial, sem licitação, firmado com a organização social Iabas para hospitais de campanha, alvo de buscas por atrasos e suspeitas de fraude. Segundo denúncia do MPF, o grupo investigado teria pedido R$ 53 milhões em propinas; é cifra da acusação, sem sentença localizada.",
    legalStatus: "Wilson Witzel foi afastado do cargo pelo STJ em agosto de 2020 e cassado por impeachment pelo Tribunal Especial Misto em abril de 2021, ficando inabilitado para funções públicas. Em junho de 2021 tornou-se réu por organização criminosa na 7ª Vara Federal Criminal do Rio, com a ex-primeira-dama Helena Witzel. Witzel sempre afirmou ser inocente e pediu ao STF o trancamento da ação por organização criminosa. Na esfera cível, sentença de 19 de setembro de 2025 do juiz Daniel Calafate Brito, da Justiça do Rio, condenou Edmar Santos e Gabriell Neves por improbidade administrativa pelo superfaturamento na compra de insumos na pandemia, com prejuízo de R$ 5,8 milhões: multa de R$ 11,7 milhões, suspensão dos direitos políticos por oito anos e proibição de contratar com o poder público por cinco anos. A defesa de Edmar rejeitou a sentença e anunciou recurso, e a de Gabriell afirmou não haver provas para condená-lo. Em junho de 2023, o Conselho Regional de Medicina do Rio cassou o registro médico de Edmar Santos. Situação em novembro de 2026: ações penais sem sentença localizada; a condenação por improbidade de Edmar Santos e Gabriell Neves é de primeira instância e cabe recurso, sem decisão de segunda instância localizada.",
    sources: [
      { title: "PF faz buscas contra governador do RJ, Wilson Witzel - G1", url: "https://g1.globo.com/politica/noticia/2020/05/26/bolsonaro-ri-ao-ser-questionado-sobre-operacao-contra-witzel-e-da-parabens-a-pf.ghtml" },
      { title: "Operação Placebo aprofunda investigações sobre corrupção na saúde - Agência Brasil", url: "https://agenciabrasil.ebc.com.br/geral/noticia/2020-05/operacao-placebo-aprofunda-investigacoes-sobre-corrupcao-na-saude" },
      { title: "Pastor Everaldo é preso em operação que afastou Witzel do governo de RJ - G1", url: "https://g1.globo.com/rj/rio-de-janeiro/noticia/2020/08/28/pastor-everaldo-e-preso-em-operacao-que-afastou-witzel-do-governo-de-rj.ghtml" },
      { title: "Witzel, pastor Everaldo e mais 11 são denunciados pelo MPF por corrupção e lavagem de dinheiro - G1", url: "https://g1.globo.com/rj/rio-de-janeiro/noticia/2020/12/15/wilson-witzel-pastor-everaldo-e-mais-11-sao-denunciados-pelo-mpf-por-corrupcao-e-lavagem-de-dinheiro.ghtml" },
      { title: "Entenda o processo de impeachment que resultou na cassação de Wilson Witzel - CNN Brasil", url: "https://www.cnnbrasil.com.br/politica/entenda-o-processo-de-impeachment-que-resultou-na-cassacao-de-wilson-witzel/" },
      { title: "Com ação por organização criminosa de volta ao STJ, Witzel aciona STF para trancá-la - PlatôBR", url: "https://platobr.com.br/com-acao-por-organizacao-criminosa-de-volta-ao-stj-witzel-aciona-stf-para-tranca-la" },
      { title: "RJ: Witzel vira réu por organização criminosa na Justiça Federal - Agência Brasil", url: "https://agenciabrasil.ebc.com.br/geral/noticia/2021-06/ex-governador-do-rio-wilson-witzel-vira-reu-por-organizacao-criminosa" },
      { title: "Em relatório, governo do RJ vê omissão de Edmar Santos na compra de respiradores - CNN Brasil", url: "https://www.cnnbrasil.com.br/politica/em-relatorio-governo-do-rj-ve-omissao-de-edmar-santos-na-compra-de-respiradores/" },
      { title: "Conselho de Medicina cassa registro de ex-secretário de Saúde do RJ - Agência Brasil", url: "https://agenciabrasil.ebc.com.br/geral/noticia/2023-06/conselho-de-medicina-cassa-registro-de-ex-secretario-de-saude-do-rj" },
      { title: "Justiça do RJ condena ex-secretário Edmar Santos e ex-subsecretário por superfaturamento na pandemia - G1", url: "https://g1.globo.com/rj/rio-de-janeiro/noticia/2025/10/02/justica-do-rj-condena-ex-secretario-edmar-santos-e-ex-subsecretario-por-superfaturamento-na-pandemia.ghtml" }
    ],
    timeline: {
      start: {
        date: "2020-03",
        basis: "first_known_act",
        sourceUrl: "https://www.cnnbrasil.com.br/politica/em-relatorio-governo-do-rj-ve-omissao-de-edmar-santos-na-compra-de-respiradores/",
        note: "Contratações emergenciais da Saúde do RJ no início da pandemia.",
      },
      end: {
        date: "2020-05-26",
        basis: "police_investigation",
        sourceUrl: "https://g1.globo.com/politica/noticia/2020/05/26/bolsonaro-ri-ao-ser-questionado-sobre-operacao-contra-witzel-e-da-parabens-a-pf.ghtml",
        note: "Deflagração da operação.",
      },
    },
  },

  "esquema_orcamento_secreto_rp9": {
    title: "Orçamento Secreto / Emendas de Relator",
    reviewedAt: "2026-11-17",
    context: "O Escândalo do Orçamento Secreto consistiu no uso intensivo das emendas do relator-geral do Orçamento da União (rubrica RP9) entre os anos de 2020 e 2022, durante a gestão do ex-presidente Jair Bolsonaro. O mecanismo permitia a distribuição de bilhões de reais do orçamento federal a parlamentares aliados do Congresso Nacional sem a obrigatoriedade de identificação do deputado ou senador que solicitava o repasse.",
    mechanism: "Ao contrário das emendas individuais e de bancada, a indicação formal dos recursos RP9 era assinada genericamente pelo Relator-Geral da Comissão Mista de Orçamento (CMO). A cúpula do Congresso e do Governo Federal utilizava as cotas orçamentárias como barganha política para garantir maiorias em votações parlamentares. Verbas expressivas foram canalizadas para estatais (como a Codevasf) e fundos municipais de saúde (SUS), gerando investigações policiais sobre fraudes em exames médicos e superfaturamento em obras de pavimentação.",
    impact: "R$ 53.000.000.000 em autorizações orçamentárias de emendas de relator (RP9) entre 2020 e 2022, segundo levantamentos de imprensa; a cifra é de dotações e não equivale a desvio. Investigações locais apuram fraudes em casos específicos, como a Operação Quebra Ossos, sobre solicitações de emendas para a saúde no Maranhão.",
    legalStatus: "Em 19 de dezembro de 2022, o STF julgou procedentes as ADPFs 850, 851, 854 e 1014 e declarou inconstitucionais as emendas de relator nos moldes do orçamento secreto, por afronta à publicidade e à transparência. A partir de 2023 os valores foram redistribuídos entre emendas individuais e programações dos ministérios. O ministro Flávio Dino conduz no STF a fiscalização do cumprimento da decisão e, em fevereiro de 2026, autorizou acareação entre Arthur Lira e um deputado que o acusou de indicar emendas irregularmente; não foi localizado registro de investigação formal contra Lira, cuja assessoria afirma que as declarações não foram confirmadas por outros depoentes. Situação em novembro de 2026: PF, CGU e TCU mantêm apurações sobre casos locais.",
    sources: [
      { title: "Entenda a decisão do Supremo que considerou o orçamento secreto inconstitucional - G1", url: "https://g1.globo.com/politica/noticia/2022/12/19/entenda-a-decisao-do-supremo-que-considerou-o-orcamento-secreto-inconstitucional.ghtml" },
      { title: "Ministra Rosa Weber suspende execução de emendas do 'orçamento secreto' - G1", url: "https://g1.globo.com/politica/noticia/2021/11/05/rosa-weber-suspende-execucao-de-emendas-do-orcamento-secreto.ghtml" },
      { title: "Resumo de Julgamento: ADPFs 850, 851, 854 e 1014 — Orçamento Secreto - STF", url: "https://www.stf.jus.br/arquivo/cms/publicacaoBOInternet/anexo/link_download/casos_relevantes/pt/ADPF_850_ADPF_851_ADPF_854_ADPF_1014.pdf" },
      { title: "Em quase 3 anos, 'orçamento secreto' pago supera emendas individuais - CNN Brasil", url: "https://www.cnnbrasil.com.br/politica/em-quase-3-anos-orcamento-secreto-pago-supera-emendas-individuais-e-e-mais-que-o-dobro-das-de-bancada/" },
      { title: "PF prende dois em operação sobre suposto desvio de verbas do orçamento secreto no Maranhão - G1", url: "https://g1.globo.com/pi/piaui/noticia/2022/10/14/pf-cumpre-mandados-em-parnaiba-e-teresina-em-investigacoes-da-operacao-quebra-ossos.ghtml" },
      { title: "PF faz operação para investigar suspeita de desvios na Codevasf - G1 JN", url: "https://g1.globo.com/jornal-nacional/noticia/2022/07/20/pf-faz-operacao-para-investigar-suspeita-de-desvios-na-codevasf.ghtml" },
      { title: "O que é este tal Orçamento Secreto - Jornal Extra Classe", url: "https://www.extraclasse.org.br/politica/2022/10/o-que-e-este-tal-orcamento-secreto/" },
      { title: "Lira ficará frente a frente com deputado que denunciou indicação irregular de emendas, decide Dino - G1", url: "https://g1.globo.com/politica/noticia/2026/02/04/dino-autoriza-acareacao-entre-lira-e-deputado-que-denunciou-indicacao-irregular-de-emendas.ghtml" }
    ],
    timeline: {
      start: {
        date: "2020",
        basis: "enabling_act",
        sourceUrl: "https://www.cnnbrasil.com.br/politica/em-quase-3-anos-orcamento-secreto-pago-supera-emendas-individuais-e-e-mais-que-o-dobro-das-de-bancada/",
        note: "Emendas de relator (RP9) usadas a partir do Orçamento de 2020.",
      },
      end: {
        date: "2022-12-19",
        basis: "court_ruling",
        sourceUrl: "https://g1.globo.com/politica/noticia/2022/12/19/entenda-a-decisao-do-supremo-que-considerou-o-orcamento-secreto-inconstitucional.ghtml",
        note: "STF declara inconstitucional o modelo. A suspensão liminar de novembro de 2021 não encerrou as emendas.",
      },
    },
  },

  "esquema_bolsolao_do_mec": {
    title: "Escândalo do Ministério da Educação / \"Bolsolão do MEC\"",
    reviewedAt: "2026-11-17",
    context: "O Escândalo do Ministério da Educação (Bolsolão do MEC) veio a público em março de 2022 após reportagens investigativas revelarem a atuação de um gabinete paralelo operado por pastores evangélicos sem cargo público na destinação de verbas orçamentárias do FNDE. O caso ganhou forte repercussão com a divulgação de áudio em que o então ministro Milton Ribeiro afirmava repassar recursos a municípios indicados por pastores a pedido do presidente Jair Bolsonaro.",
    mechanism: "Pastores sem vínculo formal com o governo controlavam a agenda de autoridades do MEC e organizavam encontros com prefeitos no interior do país, cobrando propinas em dinheiro vivo, Bíblias personalizadas com suas fotos e até pedidos de 1 kg de ouro em troca do destravamento de recursos do FNDE para obras educacionais. Servidores da pasta atuavam na triagem das prefeituras favorecidas.",
    impact: "R$ 9.700.000 em repasses do FNDE empenhados ou liberados a municípios nos dias posteriores a reuniões intermediadas por pastores, além de solicitações de propina em ouro equivalentes a R$ 304.000 e pagamentos de R$ 20.000 a servidores intermediários.",
    legalStatus: "Depois da divulgação do áudio, a ministra Cármen Lúcia determinou a abertura de inquérito em março de 2022, e Milton Ribeiro deixou o ministério. Em junho de 2022 a PF deflagrou a Operação Acesso Pago e prendeu Ribeiro e os pastores, soltos no dia seguinte por decisão do TRF-1; o caso foi enviado ao STF por suspeita de vazamento da operação. O prefeito Gilberto Braga, que relatou o pedido de propina, não é acusado. Em janeiro de 2024 o governo destituiu do cargo o ex-gerente Luciano Musse, após processo da CGU. Situação em novembro de 2026: investigação sem denúncia localizada.",
    sources: [
      { title: "Escândalo do MEC: veja a cronologia do caso que levou à prisão de Milton Ribeiro - G1", url: "https://g1.globo.com/politica/noticia/2022/06/25/escandalo-do-mec-veja-a-cronologia-do-caso-que-levou-a-prisao-de-milton-ribeiro-e-ao-pedido-de-investigacao-contra-bolsonaro.ghtml" },
      { title: "Ministro da Educação diz em áudio que, a pedido de Bolsonaro, repassa verba a municípios indicados por pastores - G1", url: "https://g1.globo.com/politica/noticia/2022/03/22/ministro-diz-em-audio-que-a-pedido-de-bolsonaro-repassa-verba-a-municipios-indicados-por-pastores.ghtml" },
      { title: "PF prende ex-ministro Milton Ribeiro por suspeita de tráfico de influência e corrupção no MEC - G1 JN", url: "https://g1.globo.com/jornal-nacional/noticia/2022/06/22/pf-prende-ex-ministro-milton-ribeiro-por-suspeita-de-trafico-de-influencia-e-corrupcao-no-mec.ghtml" },
      { title: "Desembargador manda soltar Milton Ribeiro, pastores e os outros presos em investigação sobre escândalo do MEC - G1 DF", url: "https://g1.globo.com/df/distrito-federal/noticia/2022/06/23/desembargador-concede-liberdade-a-ex-ministro-milton-ribeiro.ghtml" },
      { title: "Prefeito diz que não pagou por Bíblias com fotos de Milton Ribeiro e pastores distribuídas em evento no Pará - G1 PA", url: "https://g1.globo.com/pa/para/noticia/2022/03/30/prefeito-diz-que-nao-pagou-por-biblias-distribuidas-com-fotos-milton-ribeiro-e-pastores-durante-evento-no-para.ghtml" },
      { title: "Governo destitui servidor envolvido em esquema de propina com pastores - Agência Brasil", url: "https://agenciabrasil.ebc.com.br/politica/noticia/2024-01/governo-destitui-servidor-envolvido-em-esquema-de-propina-com-pastores" },
      { title: "Cármen determina inquérito para apurar áudio do ministro da Educação - Migalhas", url: "https://www.migalhas.com.br/quentes/362361/carmen-determina-inquerito-para-apurar-audio-do-ministro-da-educacao" }
    ],
    timeline: {
      start: {
        date: "2021-01",
        basis: "first_known_act",
        sourceUrl: "https://legis.senado.leg.br/sdleg-getter/documento?dm=9096890",
        note: "Pastores negociavam com prefeituras \"ao menos desde janeiro de 2021\".",
      },
      end: {
        date: "2022-03",
        basis: "police_investigation",
        sourceUrl: "https://www.migalhas.com.br/quentes/362361/carmen-determina-inquerito-para-apurar-audio-do-ministro-da-educacao",
        note: "Cármen Lúcia determina inquérito no STF, dias depois das reportagens.",
      },
    },
  },

  "esquema_operacao_venire_joias_presidencia": {
    title: "Operação Venire e Caso das Joias da Presidência",
    reviewedAt: "2026-11-18",
    context: "A Operação Venire e o Caso das Joias da Presidência são investigações conexas deflagradas pela Polícia Federal no Supremo Tribunal Federal entre 2023 e 2024. As apurações miraram o núcleo próximo do ex-presidente Jair Bolsonaro por fraudes nos sistemas vacinais da Covid-19 e pelo desvio e alienação clandestina de joias e presentes de estado recebidos de governos do Oriente Médio.",
    mechanism: "Na Operação Venire, assessores da Ajudantaria de Ordens acionaram intermediários em municípios fluminenses e goianos para inserir registros falsos de vacinação no sistema SI-PNI/ConecteSUS, emitindo certificados para viagens aos EUA e apagando os dados em seguida. No caso das joias, o grupo omitiu o registro de bens de alto valor (como relógios Rolex e Patek Philippe e kits Chopard) ou reclassificou-os indevidamente como bens personalíssimos, transportando-os em aviões oficiais para serem avaliados e leiloados nos EUA com recebimento em dinheiro vivo. Diante de ordens do TCU, montou-se uma operação resgate para recomprar itens vendidos.",
    impact: "US$ 1,2 milhão (cerca de R$ 6,8 milhões) é o valor global dos bens e joias que, segundo relatório da PF de julho de 2024, teriam sido desviados; o kit de joias retido pela Receita em Guarulhos foi avaliado em R$ 16,5 milhões. São cifras da investigação, sem denúncia localizada.",
    legalStatus: "A PF indiciou Jair Bolsonaro e outras 11 pessoas no inquérito das joias em julho de 2024; Bolsonaro nega irregularidades. Em março de 2025, Alexandre de Moraes arquivou, a pedido da PGR e por falta de provas, a investigação sobre o cartão de vacinação em relação a ele. Em março de 2026, a PGR pediu o arquivamento do inquérito das joias, alegando lacuna legal sobre a propriedade de presentes recebidos por presidentes, e Moraes pediu novo parecer sobre o material relativo a Frederick Wassef. Em julho, Moraes transferiu a custódia das joias à Receita Federal para o procedimento fiscal de perdimento e, em outubro, mandou intimar Bolsonaro sobre cobrança por infração fiscal. Situação em novembro de 2026: pedido de arquivamento sem decisão localizada; ninguém foi denunciado.",
    sources: [
      { title: "STF tira sigilo de operação de fraude em cartão de vacina de Bolsonaro - Agência Brasil", url: "https://agenciabrasil.ebc.com.br/justica/noticia/2023-05/stf-tira-sigilo-de-operacao-de-fraude-em-cartao-de-vacina-de-bolsonaro" },
      { title: "Bolsonaro é indiciado por fraude em cartão de vacinação de covid - Migalhas", url: "https://www.migalhas.com.br/quentes/403750/bolsonaro-e-indiciado-por-fraude-em-cartao-de-vacinacao-de-covid" },
      { title: "PF indicia Bolsonaro e mais 11 em inquérito das joias sauditas - Migalhas", url: "https://www.migalhas.com.br/quentes/410720/pf-indicia-bolsonaro-e-mais-11-em-inquerito-das-joias-sauditas" },
      { title: "PF indicia Bolsonaro em inquérito das joias - G1", url: "https://g1.globo.com/politica/noticia/2024/07/04/pf-indicia-bolsonaro-em-inquerito-das-joias.ghtml" },
      { title: "PF indicia Bolsonaro e Mauro Cid no caso das joias sauditas - Agência Brasil", url: "https://agenciabrasil.ebc.com.br/justica/noticia/2024-07/pf-indicia-bolsonaro-no-caso-das-joias-sauditas" },
      { title: "Moraes decide arquivar caso do cartão de vacina de Bolsonaro - Congresso em Foco", url: "https://www.congressoemfoco.com.br/noticia/107333/moraes-decide-arquivar-caso-do-cartao-de-vacina-de-bolsonaro" },
      { title: "PGR pede arquivamento de investigação sobre joias dadas a Bolsonaro - Congresso em Foco", url: "https://www.congressoemfoco.com.br/noticia/116979/pgr-pede-arquivamento-de-investigacao-sobre-joias-dadas-a-bolsonaro" }
    ],
    timeline: {
      start: {
        date: "2021-10",
        basis: "first_known_act",
        sourceUrl: "https://g1.globo.com/politica/noticia/2024/07/04/pf-indicia-bolsonaro-em-inquerito-das-joias.ghtml",
        note: "Retenção das joias sauditas em Guarulhos.",
      },
      end: {
        date: "2023-03",
        basis: "police_investigation",
        sourceUrl: "https://www.estadao.com.br/150-anos/150-momentos/caso-das-joias-veio-a-publico-pela-primeira-vez-no-estadao/",
        note: "Estadão revela o caso no início de março de 2023 e a PF abre inquérito no mesmo mês.",
      },
    },
  },

  "esquema_banco_master_inss": {
    title: "Caso Banco Master / BRB",
    reviewedAt: "2026-11-17",
    context: "A Operação Compliance Zero, da Polícia Federal, foi deflagrada em 18 de novembro de 2025, a partir de investigação iniciada em 2024 a pedido do MPF sobre suspeitas de venda de carteiras de crédito sem lastro pelo Banco Master ao Banco de Brasília (BRB), banco público do Distrito Federal. No mesmo dia, o Banco Central decretou a liquidação extrajudicial do Master; o banqueiro Daniel Vorcaro havia sido preso na noite anterior no Aeroporto de Guarulhos. O BRB anunciara em março de 2025 a compra de parte do Master, operação vetada pelo Banco Central em setembro de 2025. Em paralelo, o INSS apura consignados do Master a aposentados, tema distinto da Operação Sem Desconto.",
    mechanism: "Segundo a PF, a Tirreno, que uma perícia descreve como vinda de uma empresa de prateleira sem estrutura nem funcionários, aparecia como originadora de créditos consignados que o Master cedia ao BRB, e as operações fictícias foram estruturadas com produção massiva de documentos falsos. O Master cedeu ao BRB R$ 17,5 bilhões em carteiras entre julho de 2024 e outubro de 2025, inclusive depois do veto do Banco Central. A PF suspeita que o então presidente do BRB, Paulo Henrique Costa, recebeu de Vorcaro imóveis avaliados em R$ 146 milhões como propina; a defesa de Costa afirma que ele não cometeu crime algum, e a posição de Vorcaro sobre esse ponto não foi localizada. No INSS, contratos do cartão Credcesta e de outros consignados do Master estão sob apuração por falta de informações sobre juros e falhas na validação de assinaturas; a defesa de Vorcaro afirma que o banco sempre seguiu as normas do INSS.",
    impact: "R$ 17,5 bilhões em carteiras de crédito cedidas pelo Master ao BRB, segundo a PF, que aponta fraude em pelo menos R$ 12 bilhões desse total e prejuízo mínimo de R$ 2,7 bilhões ao banco público, afirmando que o valor final pode ser maior. A defesa de Paulo Henrique Costa afirma que, de uma carteira de R$ 12,2 bilhões, R$ 10,5 bilhões foram substituídos por ativos sólidos, e a de Vorcaro diz que não houve prejuízo ao BRB. Em janeiro de 2026, o INSS retinha cerca de R$ 2 bilhões referentes a aproximadamente 254 mil contratos de consignado do Master até que a regularidade das operações fosse comprovada.",
    legalStatus: "Em 28 de outubro de 2026, a PF indiciou 15 pessoas, entre elas Vorcaro, apontado pela PF como líder do esquema, Paulo Henrique Costa e Augusto Lima, ex-sócio do Master; não há políticos entre os indiciados. Vorcaro, preso em novembro de 2025 e solto dias depois por habeas corpus do TRF-1, está em prisão preventiva desde março de 2026, por ordem do ministro André Mendonça, e Costa está preso desde abril. Em 11 de novembro de 2026, a PGR defendeu no STF a manutenção da prisão de Vorcaro, cuja defesa classifica o indiciamento como açodado e afoito e pede a soltura. João Carlos Mansur, fundador da Reag e investigado no caso, teve delação homologada por Edson Fachin em 6 de novembro de 2026, o que não comprova as alegações do colaborador. O pedido da oposição para investigar o ex-governador Ibaneis Rocha foi encaminhado pelo STJ à PGR, sem abertura de inquérito localizada; ele nega irregularidades. Situação em novembro de 2026: investigação em curso, sem denúncia da PGR localizada até 17 de novembro, quando ainda corria o prazo de 15 dias aberto em 4 de novembro para a PGR se manifestar sobre o indiciamento.",
    sources: [
      { title: "Entenda operação que prendeu Daniel Vorcaro, dono do Banco Master - CNN Brasil", url: "https://www.cnnbrasil.com.br/economia/mercado/entenda-operacao-que-prendeu-daniel-vorcaro-dono-do-banco-master/" },
      { title: "INSS bloqueia repasses a Master por problemas em consignados - Agência Brasil", url: "https://agenciabrasil.ebc.com.br/geral/noticia/2026-01/inss-bloqueia-repasses-master-por-problemas-em-consignados" },
      { title: "Credcesta, do Master, é irregular, omite juros e contratos serão cancelados, diz presidente do INSS - Folhapress / Jornal de Brasília", url: "https://jornaldebrasilia.com.br/noticias/economia/credcesta-do-master-e-irregular-omite-juros-e-contratos-serao-cancelados-diz-presidente-do-inss/" },
      { title: "Saiba quem são os 15 primeiros indiciados pela PF sob suspeita de crimes no Banco Master - Folhapress / TNH1", url: "https://www.tnh1.com.br/noticia/nid/saiba-quem-sao-os-15-primeiros-indiciados-pela-pf-sob-suspeita-de-crimes-no-banco-master/" },
      { title: "Ex-presidente do BRB passa primeira noite preso na Papuda - CNN Brasil", url: "https://www.cnnbrasil.com.br/politica/ex-presidente-do-brb-passa-primeira-noite-preso-na-papuda/" },
      { title: "PF indicia Vorcaro e ex-presidente do BRB por crimes financeiros - Estadão Conteúdo / Diário do Grande ABC", url: "https://www.dgabc.com.br/Noticia/4365628/pf-indicia-vorcaro-e-ex-presidente-do-brb-por-crimes-financeiros" },
      { title: "Fachin homologa delação de fundador da Reag, investigado no caso Master - G1", url: "https://g1.globo.com/politica/noticia/2026/11/06/fachin-homologa-delacao-de-fundador-da-reag-investigado-no-caso-master.ghtml" },
      { title: "PGR envia ao Supremo parecer favorável a manter prisão de Vorcaro - Agência Brasil", url: "https://agenciabrasil.ebc.com.br/justica/noticia/2026-11/pgr-envia-ao-supremo-parecer-favoravel-manter-prisao-de-vorcaro" }
    ],
    timeline: {
      start: {
        date: "2024-07",
        basis: "documented_start",
        sourceUrl: "https://www.cnnbrasil.com.br/economia/mercado/entenda-operacao-que-prendeu-daniel-vorcaro-dono-do-banco-master/",
        note: "Primeiras cessões de carteiras do Master ao BRB.",
      },
      end: {
        date: "2025-11-18",
        basis: "police_investigation",
        sourceUrl: "https://www.cnnbrasil.com.br/economia/mercado/entenda-operacao-que-prendeu-daniel-vorcaro-dono-do-banco-master/",
        note: "Operação Compliance Zero e liquidação do Master. O veto do BC à compra (setembro de 2025) não interrompeu as cessões.",
      },
    },
  },

  "esquema_inss_sem_desconto": {
    title: "Operação Sem Desconto",
    reviewedAt: "2026-11-17",
    context: "A Operação Sem Desconto foi deflagrada pela Polícia Federal e pela CGU em 23 de abril de 2025, a partir de investigação iniciada em 2023, contra um esquema nacional de descontos de mensalidades associativas não autorizados em aposentadorias e pensões do INSS. Seis servidores foram afastados, entre eles o então presidente do INSS.",
    mechanism: "Entidades associativas com Acordos de Cooperação Técnica com o INSS lançavam mensalidades nos benefícios de aposentados e pensionistas; segundo PF e CGU, a grande maioria dos descontos era fraudada, com falsificação de assinaturas e outros artifícios para simular a autorização. A PF afirma que dirigentes do INSS receberam propina para não fiscalizar ou permitir os descontos, o que os investigados negam.",
    impact: "R$ 6.300.000.000 (cobrados de forma suspeita por entidades entre 2019 e 2024, segundo estimativa da PF e da CGU). O montante reúne descontos sob análise dos investigadores e não equivale a prejuízo já comprovado; onze entidades foram alvo de ações judiciais na primeira fase.",
    legalStatus: "A operação teve novas fases e, até novembro de 2025, ao menos 18 prisões, entre elas a do ex-presidente do INSS Alessandro Stefanutto e a do empresário Antônio Carlos Camilo Antunes. Em julho de 2026 a PF concluiu o primeiro inquérito com 48 indiciados, incluindo Stefanutto, Antunes e o ex-ministro José Carlos Oliveira, e o relatório seguiu para a PGR decidir sobre denúncia. Oliveira rejeita as acusações, e a defesa de Stefanutto afirma que ele provará a inocência. Situação em novembro de 2026: investigação em curso, sem denúncia localizada.",
    sources: [
      { title: "'Proteção aos aposentados', diz Lewandowski sobre operação contra fraudes em descontos no INSS - Agência Gov", url: "https://agenciagov.ebc.com.br/noticias/202504/201cprotecao-aos-aposentados201d-diz-lewandowski-sobre-operacao-contra-fraudes-em-descontos-no-inss" },
      { title: "Ao menos 18 pessoas foram presas em operações da PF sobre fraudes no INSS - CNN Brasil", url: "https://www.cnnbrasil.com.br/politica/prisoes-fraudes-inss-operacoes-pf/" },
      { title: "INSS: PF indicia ex-presidente, \"Careca\" e mais 46 por corrupção - Metrópoles", url: "https://www.metropoles.com/brasil/inss-pf-indicia-ex-presidente-careca-e-mais" },
      { title: "PF indicia ex-presidente do INSS por corrupção em desvio de aposentadorias - Viva", url: "https://viva.com.br/noticias/pf-indicia-ex-presidente-do-inss-por-corrupcao-em-desvio-de-aposentadorias.html" },
      { title: "INSS: veja o que a PF diz sobre os indiciados na primeira investigação sobre descontos indevidos - G1", url: "https://g1.globo.com/politica/noticia/2026/07/15/inss-veja-o-que-a-pf-diz-sobre-os-indiciados-na-primeira-investigacao-sobre-descontos-indevidos.ghtml" }
    ],
    timeline: {
      start: {
        date: "2019",
        basis: "documented_start",
        sourceUrl: "https://agenciabrasil.ebc.com.br/geral/noticia/2025-05/inss-descontos-indevidos-partir-de-marco-de-2020-serao-restituidos",
        note: "PF e CGU apontam descontos indevidos de 2019 a 2024.",
      },
      end: {
        date: "2025-04-23",
        basis: "police_investigation",
        sourceUrl: "https://agenciagov.ebc.com.br/noticias/202504/201cprotecao-aos-aposentados201d-diz-lewandowski-sobre-operacao-contra-fraudes-em-descontos-no-inss",
        note: "Deflagração da operação; investigação desde 2023, sem ato público.",
      },
    },
  },

  "esquema_faroeste": {
    title: "Operação Faroeste",
    reviewedAt: "2026-11-17",
    context: "A Operação Faroeste foi deflagrada pela Polícia Federal em 19 de novembro de 2019 para apurar um esquema de venda de decisões judiciais ligado à grilagem de terras no oeste da Bahia, com afastamento de seis magistrados, entre eles o presidente do TJ-BA da época. Segundo o CNJ, as apurações remontam a 2015, no âmbito do Ministério Público da Bahia, e o caso envolve disputas por áreas rurais em Formosa do Rio Preto e Santa Rita de Cássia.",
    mechanism: "Segundo o STJ, o grupo usava ordens judiciais de bloqueio e anulação de matrículas de imóveis, obtidas mediante propina a magistrados, para transformar produtores rurais em ocupantes irregulares das áreas reivindicadas pelo grupo, que os forçava a acordos milionários de destinação da produção, parte dos quais custeava a propina. O pagamento era ocultado por meio de terceiros, inclusive uma pessoa em situação de vulnerabilidade usada como laranja; o relator afirmou que o esquema começou com a pretensão de um borracheiro a extensas áreas rurais e foi replicado na Fazenda do Estrondo, em Formosa do Rio Preto.",
    impact: "R$ 2,4 milhões em propina que, segundo o MPF, teriam sido efetivamente pagos aos réus da ação penal 953, de cerca de R$ 4 milhões prometidos; segundo o STJ, a PF apreendeu R$ 250 mil desse fluxo na casa da desembargadora Sandra Inês Azevedo e do filho. Na ação penal 985, segundo o MPF, a desembargadora Maria do Socorro Santiago e o juiz Sérgio Sampaio receberam mais de R$ 400 mil e R$ 600 mil, respectivamente, por meio de terceiros, em casos de grilagem de 405 mil hectares. São cifras da acusação, não um prejuízo total apurado: os valores desviado, movimentado e recuperado não constam das fontes lidas. A extensão da área grilada varia: o g1 cita suspeita de mais de 360 mil hectares e a decisão do STJ citada pela Mongabay em 2019 falava em mais de 800 mil hectares.",
    legalStatus: "Em 21/10/2026, a Corte Especial do STJ, na ação penal 985, condenou a desembargadora Maria do Socorro Santiago (14 anos e 11 meses), o juiz aposentado Sérgio Sampaio (15 anos e 8 meses), Adailton Maturino dos Santos (21 anos e 7 meses), Geciane Maturino (16 anos e 4 meses) e o advogado Ricardo Três (10 anos e 9 meses), e absolveu Amanda Santiago, Valdete Aparecida Stresser e Márcio Duarte Miranda por insuficiência de provas; em 04/11/2026, na ação penal 953, condenou a desembargadora aposentada Sandra Inês Azevedo (14 anos e 20 dias), o filho Vasco Azevedo (13 anos e 11 meses), Nelson Vigolo e Vanderlei Chilante, aplicou perdão judicial ao colaborador Júlio César Cavalcanti Ferreira e declarou extinta a punibilidade de Sandra Inês pelo crime de associação criminosa, por prescrição. As defesas de Maria do Socorro Santiago e de Sérgio Sampaio negam as acusações e dizem que buscarão reverter as condenações; a defesa de Sandra Inês alegou decisões lícitas, patrimônio compatível com a renda e nulidade de provas; Nelson Vigolo afirma ter sido vítima de extorsão; as fontes lidas não registram manifestação das defesas de Adailton e Geciane Maturino, Ricardo Três, Vasco Azevedo e Vanderlei Chilante. Gesivaldo Britto, José Olegário Caldas, Maria da Graça Leal, Marivalda Moutinho e Márcio Braga tornaram-se réus em maio de 2020, e as fontes lidas não registram julgamento de mérito. Em 27/10/2026, o CNJ aplicou pena de disponibilidade a cinco magistrados, com proposta de perda do cargo a ser pleiteada pela AGU no STF, extinguiu a pretensão disciplinar contra Gesivaldo Britto por falecimento e julgou improcedentes as imputações contra Márcio Braga. As condenações, a perda do cargo e a cassação de aposentadorias estão sujeitas a recurso, e o JOTA registra outras ações penais derivadas da operação no STJ. Situação em novembro de 2026, com última verificação em 17/11/2026.",
    sources: [
      { title: "Operação Faroeste: Corte Especial condena magistrados por venda de decisões judiciais na Bahia", url: "https://www.stj.jus.br/sites/portalp/Paginas/Comunicacao/Noticias/2026/21102026-Operacao-Faroeste-Corte-Especial-condena-magistrados-por-venda-de-decisoes-judiciais-na-Bahia.aspx" },
      { title: "Operação Faroeste: STJ condena mais uma desembargadora do TJBA e cassa aposentadoria", url: "https://www.stj.jus.br/sites/portalp/Paginas/Comunicacao/Noticias/2026/04112026-Operacao-Faroeste-STJ-condena-mais-uma-desembargadora-do-TJBA-e-cassa-aposentadoria.aspx" },
      { title: "Operação Faroeste: STJ condena cinco denunciados pelo MPF por venda de decisões judiciais na Bahia", url: "https://www.mpf.mp.br/o-mpf/unidades/procuradoria-geral-da-republica-pgr/noticias/operacao-faroeste-stj-condena-cinco-denunciados-pelo-mpf-por-venda-de-decisoes-judiciais-na-bahia" },
      { title: "Operação Faroeste: STJ condena desembargadora do TJ-BA e outros três réus por corrupção e lavagem de dinheiro", url: "https://g1.globo.com/ba/bahia/noticia/2026/11/04/operacao-faroeste-mpf-pede-condenacao-dos-reus-e-defende-perdao-judicial-do-delator.ghtml" },
      { title: "Cinco magistrados do TJBA são penalizados pelo CNJ por envolvimento na Operação Faroeste", url: "https://www.cnj.jus.br/cinco-magistrados-do-tjba-sao-penalizados-pelo-cnj-por-envolvimento-na-operacao-faroeste/" },
      { title: "Operação Faroeste: MPF pede manutenção da prisão preventiva de seis investigados", url: "https://g1.globo.com/ba/bahia/noticia/2020/07/02/operacao-faroeste-mpf-requer-manutencao-da-prisao-preventiva-de-seis-investigados.ghtml" },
      { title: "Investigação revela esquema de corrupção entre juízes e ruralistas no oeste da Bahia", url: "https://brasil.mongabay.com/2019/11/investigacao-revela-esquema-de-corrupcao-entre-juizes-e-ruralistas-no-oeste-da-bahia/" },
      { title: "STJ condena desembargadora e juiz em primeiras punições da operação Faroeste", url: "https://www.jota.info/justica/stj-condena-desembargadora-e-juiz-em-primeiras-punicoes-da-operacao-faroeste" }
    ],
    timeline: {
      start: {
        date: "2013-01",
        basis: "first_known_act",
        sourceUrl: "https://brasil.mongabay.com/2019/11/investigacao-revela-esquema-de-corrupcao-entre-juizes-e-ruralistas-no-oeste-da-bahia/",
        note: "Início das movimentações financeiras investigadas (janeiro de 2013).",
      },
      end: {
        date: "2019-11-19",
        basis: "police_investigation",
        sourceUrl: "https://www.stj.jus.br/sites/portalp/Paginas/Comunicacao/Noticias/2026/21102026-Operacao-Faroeste-Corte-Especial-condena-magistrados-por-venda-de-decisoes-judiciais-na-Bahia.aspx",
        note: "Deflagração da operação; apurações do MP-BA desde 2015, sem ato público.",
      },
    },
  },
  "esquema_operacao_calicute": {
    title: "Operação Calicute",
    reviewedAt: "2026-11-24",
    context: "A Operação Calicute foi deflagrada pela Polícia Federal em 17 de novembro de 2016, em ação coordenada das forças-tarefa da Lava Jato no Rio de Janeiro e no Paraná, e prendeu o ex-governador Sérgio Cabral (PMDB), que governou o estado de 2007 a 2014. A investigação partiu das delações de executivos da Andrade Gutierrez feitas no caso Eletronuclear e se apoiou também nas colaborações da Carioca Engenharia e de Fernando Cavendish, ex-dono da Delta. O nome faz referência à região da Índia onde Pedro Álvares Cabral enfrentou uma de suas maiores tormentas.",
    mechanism: "Segundo a PF, o esquema tinha quatro núcleos: um econômico, formado por um cartel de empreiteiras; um político, liderado por Cabral; um administrativo, com os secretários Wilson Carlos e Hudson Braga; e um operacional, com Carlos Miranda, Luiz Carlos Bezerra e Wagner Jordão Garcia. Delatores relataram a cobrança de 5% sobre o valor de grandes contratos, como a reforma do Maracanã, o PAC Favelas e o Arco Metropolitano, com entregas de dinheiro em espécie. Segundo a sentença, a lavagem ocorria pela compra de joias sem nota fiscal e por contratos fictícios de consultoria e do escritório Ancelmo Advogados.",
    impact: "R$ 220 milhões em propinas pagas por empreiteiras para garantir obras públicas, segundo o inquérito concluído pela PF em dezembro de 2016. As cifras seguem critérios diferentes e não se somam: na deflagração, o G1 relatou que, segundo as investigações, só a Carioca Engenharia teria pago mais de R$ 176 milhões ao grupo, enquanto Ricardo Pernambuco, então controlador da empresa, disse em colaboração premiada que a propina a Cabral chegou a R$ 30 milhões. Na sentença de 2017, a Procuradoria apontou provas de pagamento de ao menos R$ 7,7 milhões, e o juiz considerou lavados R$ 6.562.270 em joias.",
    legalStatus: "Em setembro de 2017 o juiz Marcelo Bretas condenou Cabral (45 anos e 2 meses), Adriana Ancelmo (18 anos e 3 meses) e outros réus, e absolveu Pedro Ramos Miranda; em dezembro de 2018 o TRF-2 confirmou 11 condenações, elevou a pena de Cabral para 45 anos e 9 meses e reduziu a de Adriana para 12 anos e 11 meses, e Pedro Ramos e José Orlando Rabelo terminaram absolvidos. A defesa de Cabral negou as acusações; ele admitiu propinas em 2019, teve a delação firmada com a PF anulada pelo STF em 2021 e voltou a negar as denúncias depois de sair da prisão, em dezembro de 2022. No braço de Curitiba, a condenação imposta por Sergio Moro (14 anos e 2 meses, caso Comperj) foi mantida pelo TRF-4; em dezembro de 2022 o STF validou os atos de Moro no processo, e em maio de 2023 o TRF-4 derrubou a anulação da sentença decidida pelo juiz Eduardo Appio. O TRF-2 reconheceu em 2024 que a Calicute é de competência da 7ª Vara Federal Criminal do Rio. Situação em novembro de 2026: as fontes lidas não registram trânsito em julgado nem anulação da condenação da Calicute; em maio de 2025, após o STF ampliar o foro especial, ações contra Cabral começaram a ser enviadas ao STJ.",
    sources: [
      { title: "Ex-governador Sérgio Cabral é preso pela PF na Zona Sul do Rio", url: "https://g1.globo.com/rio-de-janeiro/noticia/2016/11/ex-governador-sergio-cabral-e-preso-pela-pf-na-zona-sul-do-rio.html" },
      { title: "Polícia Federal indicia Sérgio Cabral e mais 15 pessoas na Operação Calicute", url: "https://agenciabrasil.ebc.com.br/politica/noticia/2016-12/policia-federal-indicia-sergio-cabral-e-mais-15-pessoas-na-operacao" },
      { title: "Cabral é condenado a 45 anos de prisão por crimes investigados na Operação Calicute", url: "https://g1.globo.com/rio-de-janeiro/noticia/cabral-e-condenado-a-45-anos-de-prisao-por-crimes-investigados-na-operacao-calicute.ghtml" },
      { title: "TRF-2 mantém condenações de Cabral e mulher, mas altera as penas", url: "https://noticias.uol.com.br/politica/ultimas-noticias/2018/12/04/pena-sergio-cabral-adriana-ancelmo-segunda-instancia-prisao.htm" },
      { title: "STF decide soltar Sérgio Cabral, último preso da Lava Jato", url: "https://www1.folha.uol.com.br/poder/2022/12/stf-decide-soltar-sergio-cabral-ultimo-preso-da-lava-jato.shtml" },
      { title: "TRF-4 derruba decisão de juiz que anulou sentença de Moro contra Cabral", url: "https://g1.globo.com/rs/rio-grande-do-sul/noticia/2023/05/16/trf-4-derruba-decisao-de-juiz-que-anulou-sentenca-de-moro-contra-cabral.ghtml" },
      { title: "Justiça Federal anula três condenações do ex-governador Sergio Cabral", url: "https://agenciabrasil.ebc.com.br/justica/noticia/2024-03/justica-federal-anula-tres-condenacoes-do-ex-governador-sergio-cabral" },
      { title: "Ações contra Cabral são enviadas ao STJ após decisão do STF sobre foro especial", url: "https://www1.folha.uol.com.br/poder/2025/05/acoes-contra-cabral-sao-enviadas-ao-stj-apos-decisao-do-stf-sobre-foro-especial.shtml" }
    ],
    timeline: {
      start: {
        date: "2007",
        basis: "first_known_act",
        sourceUrl: "https://g1.globo.com/rio-de-janeiro/noticia/cabral-e-condenado-a-45-anos-de-prisao-por-crimes-investigados-na-operacao-calicute.ghtml",
        note: "Segundo a sentença, Cabral pediu propina a Rogério Nora (Andrade Gutierrez) em reunião no início de 2007.",
      },
      end: {
        date: "2016-11-17",
        basis: "police_investigation",
        sourceUrl: "https://g1.globo.com/rio-de-janeiro/noticia/2016/11/ex-governador-sergio-cabral-e-preso-pela-pf-na-zona-sul-do-rio.html",
        note: "Deflagração da operação e prisão de Cabral.",
      },
    },
  },
  esquema_operacao_unha_e_carne: {
    title: "Operação Unha e Carne",
    reviewedAt: "2026-11-24",
    context: "A Operação Unha e Carne foi deflagrada pela Polícia Federal em 3 de dezembro de 2025, por ordem do ministro Alexandre de Moraes, do STF, no inquérito aberto a partir da ADPF 635 (ADPF das Favelas) para apurar conexões de grupos criminosos violentos do Rio de Janeiro com agentes públicos. O alvo inicial foi o então presidente da Alerj, Rodrigo Bacellar (União Brasil), suspeito de ter vazado ao então deputado TH Joias informações sigilosas da Operação Zargun, que prendeu TH Joias em setembro de 2025. Até outubro de 2026, a operação teve nove fases, que se estenderam a compras da Seeduc, ao jogo do bicho e a uma rede de postos de combustíveis.",
    mechanism: "Segundo a denúncia da PGR, o desembargador Macário Júdice Neto, relator do caso Zargun no TRF-2, repassou a Bacellar num jantar informações sobre as medidas sigilosas, e Bacellar alertou TH Joias, cuja casa e cujo gabinete foram esvaziados na véspera. Nas fases seguintes, a PF passou a investigar o direcionamento de contratações de escolas da Seeduc para empresas ligadas ao deputado Thiago Rangel (Avante), pagamentos do jogo do bicho e da Máfia do Cigarro a agentes públicos e o uso de uma rede de postos de combustíveis como plataforma de lavagem de dinheiro, com o ex-prefeito de Belford Roxo Márcio Canella (União Brasil) apontado como articulador político; na frente do jogo do bicho, o ex-deputado federal Marco Antônio Cabral (MDB) foi alvo de buscas. Os citados negam irregularidades ou disseram que só se manifestariam após ter acesso aos autos.",
    impact: "R$ 7,6 bilhões: valor movimentado entre 2020 e 2026 pelo grupo ligado à rede de postos de combustíveis, segundo relatório do Coaf citado pela PF; é dinheiro movimentado, não prejuízo apurado. Na 5ª fase, o STF determinou o sequestro de até R$ 22 milhões em bens e valores, e na 9ª a PF apreendeu joias avaliadas em cerca de R$ 900 mil. A Operação Zargun, cujo vazamento deu origem ao caso, havia determinado o sequestro de R$ 40 milhões em bens.",
    legalStatus: "Em agosto de 2026, a 1ª Turma do STF recebeu por unanimidade a denúncia da PGR, e Bacellar, TH Joias, Macário Júdice Neto, a esposa de TH Joias e um ex-assessor tornaram-se réus por obstrução de investigação contra organização criminosa armada; as defesas alegaram inépcia da denúncia e cerceamento de defesa, e os acusados negam as acusações. Bacellar, cassado pelo TSE em março de 2026 no caso Ceperj, foi preso de novo naquele mês; Thiago Rangel, Márcio Canella e o ex-chefe da Polícia Civil Marcus Amim foram presos preventivamente e são investigados, sem denúncia localizada. Márcio Poncio teve a preventiva convertida em domiciliar, e Canella, preso em flagrante em julho, foi solto em três dias antes da nova prisão em outubro. Situação verificada em 24 de novembro de 2026.",
    sources: [
      { title: "Rodrigo Bacellar, presidente da Alerj, é preso pela PF por suspeita de ter avisado a TH Joias sobre prisão iminente em setembro (G1, 03/12/2025)", url: "https://g1.globo.com/rj/rio-de-janeiro/noticia/2025/12/03/pf-deflagra-operacao-unha-e-carne-no-rj.ghtml" },
      { title: "PGR denuncia Bacellar, TH Joias, desembargador e mais 2 por obstrução de investigação ligada ao CV (G1, 16/03/2026)", url: "https://g1.globo.com/rj/rio-de-janeiro/noticia/2026/03/16/pgr-denuncia-bacellar-th-joias-e-desembargador-por-obstrucao-de-investigacao-ligada-ao-cv.ghtml" },
      { title: "STF aceita denúncia contra ex-deputados estaduais Rodrigo Bacellar e TH Joias (STF, 20/08/2026)", url: "https://noticias.stf.jus.br/postsnoticias/stf-aceita-denuncia-contra-ex-deputados-estaduais-rodrigo-bacellar-e-th-joias/" },
      { title: "Deputado estadual Thiago Rangel é preso pela PF na 4ª fase da Operação Unha e Carne (G1, 05/05/2026)", url: "https://g1.globo.com/rj/rio-de-janeiro/noticia/2026/05/05/pf-deflagra-4a-fase-da-operacao-unha-e-carne-no-rj.ghtml" },
      { title: "Pastor Márcio Poncio é preso na 5ª fase da Operação Unha e Carne, da PF, investigado por ligação com a Máfia do Cigarro (G1, 02/07/2026)", url: "https://g1.globo.com/rj/rio-de-janeiro/noticia/2026/07/02/pf-deflagra-a-5a-fase-da-operacao-unha-e-carne.ghtml" },
      { title: "PF aponta Canella como articulador político de organização criminosa que movimentou 7,6 bilhões em 6 anos (G1, 15/10/2026)", url: "https://g1.globo.com/rj/rio-de-janeiro/noticia/2026/10/15/investigacao-pf-marcio-canella.ghtml" },
      { title: "PF deflagra 9ª fase da Operação Unha e Carne para apurar lavagem de dinheiro e outros crimes (Polícia Federal, 29/10/2026)", url: "https://www.gov.br/pf/pt-br/assuntos/noticias/2026/10/pf-deflagra-9a-fase-da-operacao-unha-e-carne-para-apurar-lavagem-de-dinheiro-e-outros-crimes" },
      { title: "Unha e Carne 9: Márcio Poncio e sobrinho de Adilsinho são alvo de buscas da PF (G1, 29/10/2026)", url: "https://g1.globo.com/rj/rio-de-janeiro/noticia/2026/10/29/pf-deflagra-9a-fase-da-operacao-unha-e-carne.ghtml" },
    ],
    timeline: {
      start: {
        date: "2020",
        basis: "first_known_act",
        sourceUrl: "https://g1.globo.com/rj/rio-de-janeiro/noticia/2026/10/15/investigacao-pf-marcio-canella.ghtml",
        note: "Fato datado mais antigo entre os núcleos da operação: segundo a PF, o grupo da rede de postos movimentou R$ 7,6 bilhões entre 2020 e 2026. O vazamento ao TH Joias, núcleo original, é de 2 de setembro de 2025.",
      },
      end: {
        date: "2025-12-03",
        basis: "police_investigation",
        sourceUrl: "https://g1.globo.com/rj/rio-de-janeiro/noticia/2025/12/03/pf-deflagra-operacao-unha-e-carne-no-rj.ghtml",
        note: "Primeira fase pública da operação (prisão de Bacellar). Os núcleos da Seeduc (maio de 2026), do jogo do bicho (julho de 2026) e dos postos (julho de 2026) só foram alvo de atos públicos depois; sem fim documentado para eles.",
      },
    },
  },
};
