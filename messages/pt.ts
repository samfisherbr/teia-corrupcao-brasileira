/**
 * ============================================================================
 * TEXTOS DA INTERFACE — PORTUGUÊS (BRASIL)
 * ============================================================================
 * Este arquivo define o FORMATO: messages/en.ts e messages/es.ts precisam ter
 * exatamente as mesmas chaves (o TypeScript reprova o build se faltar alguma).
 * Para mudar um texto do site, altere aqui e nos outros dois arquivos.
 *
 * Aqui ficam só os textos curtos da interface (botões, títulos, rótulos).
 * Textos longos ficam em outros lugares:
 *   - dossiês dos esquemas ........ data/schemeDetails*.ts
 *   - Sobre, Termos e Privacidade . content/legal/
 *   - correções ................... data/corrections.ts
 *   - nós e vínculos do grafo ..... banco D1 (nodes, links e as tabelas *_translations)
 *
 * Textos com número ou nome no meio são funções: (n) => `${n} esquemas`.
 * ============================================================================
 */
import type { LinkStatus, LinkType, NodeType } from '@/types/graph';

export const pt = {
  site: {
    /** Título da aba da página inicial (depois do nome do site). */
    tagline: 'mapa interativo dos esquemas de corrupção no Brasil',
    description:
      'Mapa interativo dos esquemas de corrupção no Brasil desde 1989: políticos, partidos, empresas e operadores, com a situação jurídica e a fonte de cada vínculo.',
    defaultDescription: 'Mapeamento de Redes Relacionais e Investigação de Corrupção no Brasil',
    ogAlt: 'Teia da Corrupção: mapa interativo de esquemas de corrupção no Brasil',
    ogEyebrow: 'Mapa interativo',
    ogTitle: 'Esquemas de corrupção no Brasil, de 1989 até hoje',
    ogFooter: 'A situação jurídica e a fonte de cada vínculo',
    ogDossier: 'Dossiê',
  },

  common: {
    backToPanel: 'Voltar ao painel',
    close: 'Fechar',
    clearSearch: 'Limpar busca',
    advertising: 'Publicidade',
    tryAgain: 'Tentar novamente',
    notAvailable: 'N/A',
    correctionsAndUpdates: 'Correções e atualizações',
    termsOfUse: 'Termos de uso',
    privacyPolicy: 'Política de privacidade',
  },

  language: {
    /** Nome acessível do seletor de idioma. */
    label: 'Idioma',
  },

  /** Tipos de entidade (legenda, filtros, etiquetas). `plural` = título das seções no painel de detalhes. */
  nodeType: {
    scheme: { label: 'Esquema de Corrupção', plural: 'Esquemas de Corrupção' },
    party: { label: 'Partido', plural: 'Partidos' },
    company: { label: 'Empresa', plural: 'Empresas' },
    politician: { label: 'Político', plural: 'Políticos' },
    operator: { label: 'Operador', plural: 'Operadores' },
  } satisfies Record<NodeType, { label: string; plural: string }>,

  /** Status jurídico do vínculo (legenda, filtros, dossiês). */
  status: {
    confirmed: 'Fatos documentados',
    under_investigation: 'Sob investigação',
    convicted_appealing: 'Condenados (cabe recurso)',
    convicted_final: 'Condenados (trânsito em julgado)',
    annulled: 'Condenações anuladas',
    acquitted: 'Absolvidos',
  } satisfies Record<LinkStatus, string>,

  /** Categoria do vínculo (painel de detalhes). */
  linkType: {
    transaction: 'Transação Financeira',
    contract: 'Contrato / Vínculo',
    process: 'Processo / Político',
  } satisfies Record<LinkType, string>,

  header: {
    backToGraph: 'Voltar ao grafo',
    infographics: 'Infográficos',
    glossary: 'Glossário',
    dossiers: 'Dossiês',
  },

  sidebar: {
    title: 'Painel de Controle',
    searchLabel: 'Buscar Entidade',
    searchPlaceholder: 'Político, partido ou empresa...',
    startYear: 'Ano de Início (Fato)',
    startYearAria: 'Ano de início',
    entityTypes: 'Tipos de Entidade',
    legalStatus: 'Status Jurídico',
    schemeIndex: 'Índice de Esquemas',
    seeAll: 'Ver todos →',
    noSchemes: 'Nenhum esquema encontrado',
    clearFilters: 'Limpar filtros',
    nodes: 'Nós',
    connections: 'Conexões',
  },

  timeline: {
    since: 'Desde',
    valueText: (year: number, nodes: number) => `A partir de ${year}, ${nodes} nós visíveis`,
  },

  app: {
    loading: 'Carregando a teia…',
    loadFailed: 'Falha ao carregar os dados',
    /** Mostrado nos outros idiomas no lugar do diagnóstico técnico (que a API devolve em português). */
    loadFailedGeneric: 'Não foi possível carregar os dados do mapa. Tente de novo em instantes.',
    apiStatus: (status: number) => `A API retornou status ${status}.`,
    badFormat: 'Resposta da API em formato inesperado.',
    timeout: 'O servidor demorou demais para responder. Verifique a conexão e tente de novo.',
    offline: 'Não foi possível conectar ao servidor. Verifique a conexão e tente de novo.',
    emptyTitle: 'Banco conectado, ainda sem dados',
    emptyBody:
      'Insira o SQL da Fase 2 de um dossiê aprovado (nodes antes de links). Os dados aparecem aqui assim que a página for recarregada.',
  },

  graph: {
    showDetails: 'Exibir detalhes',
    linkLegend: 'Legenda das Conexões',
    nodeLegend: 'Legenda dos Círculos',
    zoomIn: 'Aproximar',
    zoomOut: 'Afastar',
    recenter: 'recentralizar',
    fullscreen: 'Tela cheia',
    legalInfo: 'Informações Legais',
    menuDossiers: 'Dossiês dos esquemas',
    menuAbout: 'Sobre nós',
    legalMenuAria: 'Menu de páginas legais',
    termsAndPrivacy: 'Termos & Privacidade',
  },

  inspector: {
    entityTitle: 'Dossiê da Entidade',
    linkTitle: 'Detalhes do Vínculo',
    closeDetails: 'Fechar detalhes',
    photo: 'Foto:',
    summary: 'Resumo Factual',
    readDossier: 'Ler o dossiê completo',
    connections: 'Conexões Mapeadas',
    noConnections: 'Nenhuma conexão visível com os filtros atuais.',
    others: 'Outros',
    connectedEntities: 'Entidades Conectadas',
    source: 'Origem',
    target: 'Destino',
    category: 'Categoria da Relação:',
    legalStatus: 'Status Jurídico:',
    reviewedOn: 'Situação conferida em:',
    year: 'Ano do Fato:',
    amount: 'Montante Envolvido:',
    description: 'Descrição do Vínculo',
    documentSource: 'Fonte Documental',
  },

  infographics: {
    eyebrow: 'Painel de Análise de Dados',
    title: 'Infográficos & Inteligência Visual',
    intro: 'Métricas agregadas do banco de dados sobre redes de influência, fluxos operacionais e volume financeiro.',
    mappedVolume: 'Volume Mapeado',
    registeredSchemes: 'Esquemas Registrados',
    cases: (n: number) => `${n} Casos`,
    activeConnections: 'Conexões Ativas',
    links: (n: number) => `${n} Vínculos`,
    rankingTitle: '1. Ranking de centralidade por partido',
    rankingBadge: 'Grau de Conexões',
    rankingIntro: 'Volume de nós e conexões associadas a cada sigla partidária na base.',
    rankingEmpty: 'Nenhum partido com vínculos registrado.',
    politiciansCount: (n: number) => `(${n} políticos)`,
    linksCount: (n: number) => `${n} vínculos`,
    insightLabel: 'Insight:',
    insight: 'Revela quais partidos possuem maior número de ligações entre diferentes esquemas investigados.',
    flowTitle: '2. Diagrama de fluxo operacional',
    flowBadge: 'Proporção de Vínculos',
    flowIntro: 'Distribuição das conexões por categoria de operação e status jurídico.',
    connections: 'Conexões',
    categoryTransaction: 'Transações & Propinas',
    categoryContract: 'Contratos & Licitações',
    categoryProcess: 'Processos & Investigações',
    legalStatus: 'Status jurídico:',
    heatmapTitle: '3. Mapa de calor financeiro por esquema',
    total: 'Total:',
    heatmapIntro: 'Comparativo de peso e volume financeiro atribuído a cada operação no banco de dados.',
    heatmapEmpty: 'Nenhum esquema financeiro carregado.',
    schemeNumber: (n: number) => `ESQUEMA #${n}`,
    estimatedFigure: 'Cifra Estimada:',
    /** Esquema sem valor conhecido / total ainda não calculável. */
    amountPending: 'Em apuração',
    totalPending: 'Em levantamento',
  },

  glossary: {
    title: 'Glossário e Dossiê dos Esquemas',
    intro:
      'Documentação factual, contexto histórico, mecanismo operacional e status judicial dos esquemas de corrupção cadastrados.',
    searchLabel: 'Buscar no glossário',
    empty: 'Nenhum esquema cadastrado no banco de dados ainda.',
    collapse: 'Recolher dossiê',
    expand: 'Expandir dossiê',
    impactPending: 'Em Apuração',
    politicians: 'Políticos Vinculados:',
    companies: 'Empresas Envolvidas:',
    operators: 'Operadores Financeiros:',
    context: 'Contexto Histórico e Origem',
    mechanism: 'Funcionamento do Esquema',
    entities: 'Entidades Mapeadas no Banco de Dados',
    legal: 'Desdobramentos Jurídicos & Situação Atual',
    sources: 'Fontes Documentais & Reportagens',
    openPage: 'Abrir a página deste dossiê',
  },

  /** Busca de esquemas (Glossário e /esquemas). */
  search: {
    placeholder: 'Buscar esquema, político, partido, empresa ou termo...',
    countFiltered: (found: number, total: number) => `${found} de ${total} esquemas encontrados`,
    countAll: (total: number) => `${total} esquemas cadastrados`,
    /** Seguido do termo buscado entre aspas. */
    noneFor: 'Nenhum esquema encontrado para',
  },

  schemesIndex: {
    metaTitle: 'Esquemas de corrupção',
    metaDescription:
      'Dossiês dos esquemas de corrupção mapeados: contexto histórico, funcionamento, impacto financeiro, desdobramentos jurídicos e fontes.',
    title: 'Esquemas de corrupção',
    intro: (n: number) =>
      `${n} esquemas documentados, com contexto histórico, funcionamento, impacto financeiro, situação jurídica e fontes — do caso mais recente ao mais antigo.`,
    searchLabel: 'Buscar nos dossiês',
    badge: 'Dossiê',
  },

  dossier: {
    notFoundTitle: 'Esquema não encontrado',
    fallbackDescription: (title: string) => `Dossiê do esquema ${title}.`,
    breadcrumbSchemes: 'Esquemas',
    allSchemes: 'Todos os esquemas',
    reviewedOn: 'Revisado em',
    impact: 'Impacto:',
    context: 'Contexto histórico e origem',
    mechanism: 'Funcionamento do esquema',
    who: 'Quem aparece no caso: papel, situação jurídica e fonte',
    whoNote:
      'Cada item é um vínculo documentado com o esquema, com a situação jurídica daquele vínculo. Investigação ou denúncia não equivale a condenação, e anulação de condenação não equivale a absolvição.',
    amountCited: 'Valor citado:',
    source: 'Fonte:',
    statusCheckedOn: 'Situação conferida em',
    legal: 'Desdobramentos jurídicos e situação atual',
    sources: 'Fontes documentais e reportagens',
    explore: 'Explorar as conexões na teia',
    /** Aviso quando o texto em português mudou e a tradução ainda não foi refeita (não aparece em português). */
    translationPending: '',
    /** Aviso de que as fontes citadas estão em português (não aparece em português). */
    sourcesInPortuguese: '',
  },

  corrections: {
    metaDescription: (site: string) =>
      `Registro público das correções e atualizações feitas nos dossiês da ${site}: o que mudou, quando e por quê.`,
    intro:
      'Toda mudança de conteúdo nos dossiês — erro corrigido, decisão judicial nova, fonte trocada ou posicionamento incluído a pedido de pessoa citada — fica registrada aqui, com a data e o motivo.',
    empty: 'Nenhuma correção registrada até o momento.',
    kind: {
      correcao: 'Correção',
      atualizacao: 'Atualização',
      direito_de_resposta: 'Direito de resposta',
    },
    footerBefore: 'Encontrou um erro ou uma decisão mais recente? Escreva para',
    footerMiddle: ', indicando o vínculo e a fonte. Veja também os',
    footerTerms: 'Termos de Uso',
    footerAfter: '(correções e direito de resposta).',
  },

  home: {
    h1: (site: string) => `${site}: mapa interativo dos esquemas de corrupção no Brasil`,
    legalNote:
      'Cada vínculo do mapa indica o estágio jurídico em que o fato se encontra. Investigação ou denúncia não equivale a condenação, e anulação de condenação não equivale a absolvição. O mapa é desenhado como imagem interativa; o mesmo conteúdo está disponível em texto nos dossiês abaixo.',
    dossiersNav: 'Dossiês dos esquemas',
    allSchemes: 'Todos os esquemas, do mais recente ao mais antigo',
    aboutNav: 'Sobre o site',
    aboutLink: 'Sobre e metodologia',
  },

  notFound: {
    metaTitle: 'Página não encontrada',
    code: 'Erro 404',
    title: 'Página não encontrada',
    body: 'O endereço pode ter mudado ou o dossiê pode ter sido renomeado.',
    openGraph: 'Abrir a teia',
    seeSchemes: 'Ver todos os esquemas',
  },

  error: {
    title: 'Algo deu errado',
    body: 'Ocorreu um erro inesperado ao montar esta página. Tente de novo; se continuar, recarregue o site.',
    seeSchemes: 'Ver os esquemas em texto',
  },

  /** Títulos e cabeçalhos das páginas Sobre, Termos e Privacidade (o corpo está em content/legal/). */
  legal: {
    lastUpdated: 'Última atualização:',
    aboutMetaTitle: 'Sobre',
    aboutMetaDescription: (site: string) =>
      `Conheça o ${site}, visualizador de redes de relacionamento em casos de corrupção política no Brasil.`,
    aboutTitle: (site: string) => `Sobre a ${site}`,
    aboutSubtitle: 'Visualizador de redes de corrupção política no Brasil',
    termsTitle: 'Termos de Uso',
    termsMetaDescription: (site: string) => `Termos e condições de uso da ${site}.`,
    privacyTitle: 'Política de Privacidade',
    privacyMetaDescription: (site: string) =>
      `Política de privacidade e uso de cookies da ${site}.`,
  },
};

export type Messages = typeof pt;
