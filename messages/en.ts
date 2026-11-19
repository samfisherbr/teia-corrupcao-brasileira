/**
 * TEXTOS DA INTERFACE — INGLÊS (REINO UNIDO).
 * Mesmas chaves de messages/pt.ts (o TypeScript reprova o build se faltar
 * alguma). Grafia britânica; rótulos em "sentence case".
 */
import type { Messages } from './pt';

export const en: Messages = {
  site: {
    tagline: 'interactive map of corruption schemes in Brazil',
    description:
      'Interactive map of corruption schemes in Brazil since 1989: politicians, parties, companies and operators, with the legal status and the source of every link.',
    defaultDescription: 'Mapping the networks behind corruption investigations in Brazil',
    ogAlt: 'Teia da Corrupção: interactive map of corruption schemes in Brazil',
    ogEyebrow: 'Interactive map',
    ogTitle: 'Corruption schemes in Brazil, from 1989 to today',
    ogFooter: 'The legal status and the source of every link',
    ogDossier: 'Dossier',
  },

  common: {
    backToPanel: 'Back to the map',
    close: 'Close',
    clearSearch: 'Clear search',
    advertising: 'Advertisement',
    tryAgain: 'Try again',
    notAvailable: 'N/A',
    correctionsAndUpdates: 'Corrections and updates',
    termsOfUse: 'Terms of use',
    privacyPolicy: 'Privacy policy',
  },

  language: {
    label: 'Language',
  },

  nodeType: {
    scheme: { label: 'Corruption scheme', plural: 'Corruption schemes' },
    party: { label: 'Party', plural: 'Parties' },
    company: { label: 'Company', plural: 'Companies' },
    politician: { label: 'Politician', plural: 'Politicians' },
    operator: { label: 'Operator', plural: 'Operators' },
  },

  status: {
    confirmed: 'Documented facts',
    under_investigation: 'Under investigation',
    convicted_appealing: 'Convicted (subject to appeal)',
    convicted_final: 'Convicted (final judgment)',
    annulled: 'Convictions annulled',
    acquitted: 'Acquitted',
  },

  linkType: {
    transaction: 'Financial transaction',
    contract: 'Contract / Tie',
    process: 'Proceedings / Political',
  },

  header: {
    backToGraph: 'Back to the graph',
    infographics: 'Infographics',
    glossary: 'Glossary',
    dossiers: 'Dossiers',
  },

  sidebar: {
    title: 'Control panel',
    searchLabel: 'Search entity',
    searchPlaceholder: 'Politician, party or company...',
    startYear: 'Start year (of the facts)',
    startYearAria: 'Start year',
    entityTypes: 'Entity types',
    legalStatus: 'Legal status',
    schemeIndex: 'Scheme index',
    seeAll: 'See all →',
    noSchemes: 'No schemes found',
    clearFilters: 'Clear filters',
    nodes: 'Nodes',
    connections: 'Connections',
  },

  timeline: {
    since: 'Since',
    valueText: (year, nodes) => `From ${year}, ${nodes} nodes visible`,
  },

  app: {
    loading: 'Loading the web…',
    loadFailed: 'Failed to load the data',
    loadFailedGeneric: 'The map data could not be loaded. Please try again in a moment.',
    apiStatus: (status) => `The API returned status ${status}.`,
    badFormat: 'The API response was in an unexpected format.',
    timeout: 'The server took too long to respond. Check your connection and try again.',
    offline: 'Could not connect to the server. Check your connection and try again.',
    emptyTitle: 'Database connected, no data yet',
    emptyBody:
      'Insert the Phase 2 SQL of an approved dossier (nodes before links). The data will appear here as soon as the page is reloaded.',
  },

  graph: {
    showDetails: 'Show details',
    linkLegend: 'Connection key',
    nodeLegend: 'Circle key',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    recenter: 'recentre',
    fullscreen: 'Full screen',
    legalInfo: 'Legal information',
    menuDossiers: 'Scheme dossiers',
    menuAbout: 'About us',
    legalMenuAria: 'Legal pages menu',
    termsAndPrivacy: 'Terms & Privacy',
    toggle25dAria: '2.5D view when zooming in',
  },

  inspector: {
    entityTitle: 'Entity dossier',
    linkTitle: 'Link details',
    closeDetails: 'Close details',
    photo: 'Photo:',
    summary: 'Factual summary',
    readDossier: 'Read the full dossier',
    connections: 'Mapped connections',
    noConnections: 'No connections visible with the current filters.',
    others: 'Others',
    connectedEntities: 'Connected entities',
    source: 'From',
    target: 'To',
    category: 'Type of relationship:',
    legalStatus: 'Legal status:',
    reviewedOn: 'Status checked on:',
    year: 'Year of the facts:',
    amount: 'Amount involved:',
    description: 'Description of the link',
    documentSource: 'Documentary source',
  },

  infographics: {
    eyebrow: 'Data analysis panel',
    title: 'Infographics & visual intelligence',
    intro: 'Aggregate metrics from the database on networks of influence, operational flows and financial volume.',
    mappedVolume: 'Mapped volume',
    registeredSchemes: 'Schemes on record',
    cases: (n) => `${n} cases`,
    activeConnections: 'Active connections',
    links: (n) => `${n} links`,
    rankingTitle: '1. Centrality ranking by party',
    rankingBadge: 'Degree of connections',
    rankingIntro: 'Number of nodes and connections associated with each party in the database.',
    rankingEmpty: 'No party with links on record.',
    politiciansCount: (n) => `(${n} politicians)`,
    linksCount: (n) => `${n} links`,
    insightLabel: 'Insight:',
    insight: 'Shows which parties have the most ties across the different schemes investigated.',
    flowTitle: '2. Operational flow diagram',
    flowBadge: 'Share of links',
    flowIntro: 'Breakdown of connections by type of operation and legal status.',
    connections: 'Connections',
    categoryTransaction: 'Transactions & bribes',
    categoryContract: 'Contracts & tenders',
    categoryProcess: 'Proceedings & investigations',
    legalStatus: 'Legal status:',
    heatmapTitle: '3. Financial heat map by scheme',
    total: 'Total:',
    heatmapIntro: 'Comparison of the weight and financial volume attributed to each operation in the database.',
    heatmapEmpty: 'No financial scheme loaded.',
    schemeNumber: (n) => `SCHEME #${n}`,
    estimatedFigure: 'Estimated figure:',
    amountPending: 'Being established',
    totalPending: 'Being compiled',
  },

  glossary: {
    title: 'Glossary and scheme dossiers',
    intro:
      'Factual documentation, historical background, operating mechanism and judicial status of the corruption schemes on record.',
    searchLabel: 'Search the glossary',
    empty: 'No schemes in the database yet.',
    collapse: 'Collapse dossier',
    expand: 'Expand dossier',
    impactPending: 'Being established',
    politicians: 'Politicians linked:',
    companies: 'Companies involved:',
    operators: 'Financial operators:',
    context: 'Historical background and origin',
    mechanism: 'How the scheme worked',
    entities: 'Entities mapped in the database',
    legal: 'Legal developments & current status',
    sources: 'Documentary sources & press reports',
    openPage: "Open this dossier's page",
  },

  search: {
    placeholder: 'Search scheme, politician, party, company or term...',
    countFiltered: (found, total) => `${found} of ${total} schemes found`,
    countAll: (total) => `${total} schemes on record`,
    noneFor: 'No scheme found for',
  },

  schemesIndex: {
    metaTitle: 'Corruption schemes',
    metaDescription:
      'Dossiers on the corruption schemes mapped: historical background, how each worked, financial impact, legal developments and sources.',
    title: 'Corruption schemes',
    intro: (n) =>
      `${n} schemes documented, with historical background, how each worked, financial impact, legal status and sources — from the most recent case to the oldest.`,
    searchLabel: 'Search the dossiers',
    badge: 'Dossier',
  },

  dossier: {
    notFoundTitle: 'Scheme not found',
    fallbackDescription: (title) => `Dossier on the ${title} scheme.`,
    breadcrumbSchemes: 'Schemes',
    allSchemes: 'All schemes',
    reviewedOn: 'Reviewed on',
    editedBy: 'Edited by',
    impact: 'Impact:',
    context: 'Historical background and origin',
    mechanism: 'How the scheme worked',
    who: 'Who appears in the case: role, legal status and source',
    whoNote:
      'Each item is a person, company or party linked to the scheme. When more than one fact is documented, they are listed in chronological order, each with its own legal status and source. An investigation or a charge is not a conviction, and the annulment of a conviction is not an acquittal.',
    /** Quantos fatos (vínculos) a entidade tem no esquema; só aparece com 2 ou mais. */
    factsCount: (n: number) => `${n} facts`,
    amountCited: 'Amount cited:',
    source: 'Source:',
    statusCheckedOn: 'Status checked on',
    legal: 'Legal developments and current status',
    sources: 'Documentary sources and press reports',
    explore: 'Explore the connections on the web',
    translationPending:
      'This dossier has been updated in Portuguese and the English translation is being revised. The original text is shown in the meantime.',
    sourcesInPortuguese: 'The sources cited are in Portuguese.',
  },

  corrections: {
    metaDescription: (site) =>
      `Public record of the corrections and updates made to the ${site} dossiers: what changed, when and why.`,
    intro:
      'Every change of content in the dossiers — an error corrected, a new court ruling, a source replaced or a statement added at the request of a person named — is recorded here, with the date and the reason.',
    empty: 'No corrections recorded so far.',
    kind: {
      correcao: 'Correction',
      atualizacao: 'Update',
      direito_de_resposta: 'Right of reply',
    },
    footerBefore: 'Found an error or a more recent ruling? Write to',
    footerMiddle: ', indicating the link and the source. See also the',
    footerTerms: 'Terms of Use',
    footerAfter: '(corrections and right of reply).',
  },

  home: {
    h1: (site) => `${site}: interactive map of corruption schemes in Brazil`,
    legalNote:
      'Every link on the map shows the legal stage the matter has reached. An investigation or a charge is not a conviction, and the annulment of a conviction is not an acquittal. The map is drawn as an interactive image; the same content is available as text in the dossiers below.',
    dossiersNav: 'Scheme dossiers',
    allSchemes: 'All schemes, from the most recent to the oldest',
    aboutNav: 'About the site',
    aboutLink: 'About and methodology',
    scrollCue: 'How to read the map',
    aboutMapTitle: 'What this map is',
    aboutMapBody:
      'Teia da Corrupção brings together, on a single map, the major corruption schemes investigated in Brazil since 1989 and the people, companies and parties linked to each one. Every link records the role attributed to that entity, the legal stage the matter has reached and the public source that supports it: court rulings, charges brought by prosecutors, congressional inquiry reports and reporting by established news outlets. The aim is to show how the cases intersect over time without presuming guilt: the map also records acquittals, annulled convictions and the positions of the defence.',
    howToReadTitle: 'How to read the map',
    circlesIntro: 'Each circle is an entity, and its colour shows the type:',
    nodeTypeHelp: {
      scheme: 'the case investigated or tried, at the centre of each cluster;',
      party: 'parties linked to the case as an institution or through members who were named;',
      company: 'private companies, state-owned companies and banks involved;',
      politician: 'people who hold or held elected or political office;',
      operator: 'money changers, lobbyists, aides and other intermediaries.',
    },
    linesIntro:
      'Each line links an entity to a scheme, and its colour shows the legal stage of that specific link; the same person may have been convicted in one case and acquitted in another:',
    howToUse:
      'Tap or click a circle to highlight its links and use “Show details” to read each person’s role, the legal status and the source. On a computer, the sidebar filters by name, year, type and status; the Infographics and Glossary buttons show the same data as charts and as text.',
    recentTitle: 'Recently reviewed dossiers',
    reviewedOn: 'Reviewed on',
    correctionsTitle: 'Latest corrections and updates',
    seeAllCorrections: 'See the full corrections log',
  },

  notFound: {
    metaTitle: 'Page not found',
    code: 'Error 404',
    title: 'Page not found',
    body: 'The address may have changed or the dossier may have been renamed.',
    openGraph: 'Open the web',
    seeSchemes: 'See all schemes',
  },

  error: {
    title: 'Something went wrong',
    body: 'An unexpected error occurred while building this page. Try again; if it persists, reload the site.',
    seeSchemes: 'See the schemes as text',
  },

  legal: {
    lastUpdated: 'Last updated:',
    aboutMetaTitle: 'About',
    aboutMetaDescription: (site) =>
      `About ${site}, a viewer of the networks of relationships in political corruption cases in Brazil.`,
    aboutTitle: (site) => `About ${site}`,
    aboutSubtitle: 'A viewer of political corruption networks in Brazil',
    termsTitle: 'Terms of Use',
    termsMetaDescription: (site) => `Terms and conditions of use of ${site}.`,
    privacyTitle: 'Privacy Policy',
    privacyMetaDescription: (site) => `Privacy and cookie policy of ${site}.`,
  },
};
