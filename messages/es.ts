/**
 * TEXTOS DA INTERFACE — ESPANHOL (ESPANHA).
 * Mesmas chaves de messages/pt.ts (o TypeScript reprova o build se faltar
 * alguma). "Esquema" (de corrupção) = "trama" no uso da Espanha.
 */
import type { Messages } from './pt';

export const es: Messages = {
  site: {
    tagline: 'mapa interactivo de las tramas de corrupción en Brasil',
    description:
      'Mapa interactivo de las tramas de corrupción en Brasil desde 1989: políticos, partidos, empresas y operadores, con la situación judicial y la fuente de cada vínculo.',
    defaultDescription: 'Mapa de las redes de relaciones en las investigaciones de corrupción en Brasil',
    ogAlt: 'Teia da Corrupção: mapa interactivo de las tramas de corrupción en Brasil',
    ogEyebrow: 'Mapa interactivo',
    ogTitle: 'Tramas de corrupción en Brasil, de 1989 a hoy',
    ogFooter: 'La situación judicial y la fuente de cada vínculo',
    ogDossier: 'Dosier',
  },

  common: {
    backToPanel: 'Volver al mapa',
    close: 'Cerrar',
    clearSearch: 'Borrar búsqueda',
    advertising: 'Publicidad',
    tryAgain: 'Reintentar',
    notAvailable: 'N/D',
    correctionsAndUpdates: 'Correcciones y actualizaciones',
    termsOfUse: 'Términos de uso',
    privacyPolicy: 'Política de privacidad',
  },

  language: {
    label: 'Idioma',
  },

  nodeType: {
    scheme: { label: 'Trama de corrupción', plural: 'Tramas de corrupción' },
    party: { label: 'Partido', plural: 'Partidos' },
    company: { label: 'Empresa', plural: 'Empresas' },
    politician: { label: 'Político', plural: 'Políticos' },
    operator: { label: 'Operador', plural: 'Operadores' },
  },

  status: {
    confirmed: 'Hechos documentados',
    under_investigation: 'En investigación',
    convicted_appealing: 'Condenados (cabe recurso)',
    convicted_final: 'Condenados (sentencia firme)',
    annulled: 'Condenas anuladas',
    acquitted: 'Absueltos',
  },

  linkType: {
    transaction: 'Transacción financiera',
    contract: 'Contrato / Vínculo',
    process: 'Proceso / Político',
  },

  header: {
    backToGraph: 'Volver al grafo',
    infographics: 'Infografías',
    glossary: 'Glosario',
    dossiers: 'Dosieres',
  },

  sidebar: {
    title: 'Panel de control',
    searchLabel: 'Buscar entidad',
    searchPlaceholder: 'Político, partido o empresa...',
    startYear: 'Año de inicio (hecho)',
    startYearAria: 'Año de inicio',
    entityTypes: 'Tipos de entidad',
    legalStatus: 'Situación judicial',
    schemeIndex: 'Índice de tramas',
    seeAll: 'Ver todas →',
    noSchemes: 'No se ha encontrado ninguna trama',
    clearFilters: 'Quitar filtros',
    nodes: 'Nodos',
    connections: 'Conexiones',
  },

  timeline: {
    since: 'Desde',
    valueText: (year, nodes) => `A partir de ${year}, ${nodes} nodos visibles`,
  },

  app: {
    loading: 'Cargando la red…',
    loadFailed: 'Error al cargar los datos',
    loadFailedGeneric: 'No se han podido cargar los datos del mapa. Inténtelo de nuevo en unos instantes.',
    apiStatus: (status) => `La API ha devuelto el estado ${status}.`,
    badFormat: 'La respuesta de la API tiene un formato inesperado.',
    timeout: 'El servidor ha tardado demasiado en responder. Compruebe la conexión e inténtelo de nuevo.',
    offline: 'No se ha podido conectar con el servidor. Compruebe la conexión e inténtelo de nuevo.',
    emptyTitle: 'Base de datos conectada, aún sin datos',
    emptyBody:
      'Inserte el SQL de la Fase 2 de un dosier aprobado (nodes antes que links). Los datos aparecerán aquí en cuanto se recargue la página.',
  },

  graph: {
    showDetails: 'Ver detalles',
    linkLegend: 'Leyenda de las conexiones',
    nodeLegend: 'Leyenda de los círculos',
    zoomIn: 'Acercar',
    zoomOut: 'Alejar',
    recenter: 'recentrar',
    fullscreen: 'Pantalla completa',
    legalInfo: 'Información legal',
    menuDossiers: 'Dosieres de las tramas',
    menuAbout: 'Quiénes somos',
    legalMenuAria: 'Menú de páginas legales',
    termsAndPrivacy: 'Términos y privacidad',
  },

  inspector: {
    entityTitle: 'Dosier de la entidad',
    linkTitle: 'Detalles del vínculo',
    closeDetails: 'Cerrar detalles',
    photo: 'Foto:',
    summary: 'Resumen de los hechos',
    readDossier: 'Leer el dosier completo',
    connections: 'Conexiones registradas',
    noConnections: 'Ninguna conexión visible con los filtros actuales.',
    others: 'Otros',
    connectedEntities: 'Entidades conectadas',
    source: 'Origen',
    target: 'Destino',
    category: 'Categoría de la relación:',
    legalStatus: 'Situación judicial:',
    reviewedOn: 'Situación comprobada el:',
    year: 'Año del hecho:',
    amount: 'Importe implicado:',
    description: 'Descripción del vínculo',
    documentSource: 'Fuente documental',
  },

  infographics: {
    eyebrow: 'Panel de análisis de datos',
    title: 'Infografías e inteligencia visual',
    intro:
      'Métricas agregadas de la base de datos sobre redes de influencia, flujos operativos y volumen financiero.',
    mappedVolume: 'Volumen registrado',
    registeredSchemes: 'Tramas registradas',
    cases: (n) => `${n} casos`,
    activeConnections: 'Conexiones activas',
    links: (n) => `${n} vínculos`,
    rankingTitle: '1. Clasificación de centralidad por partido',
    rankingBadge: 'Grado de conexiones',
    rankingIntro: 'Número de nodos y conexiones asociados a cada sigla de partido en la base.',
    rankingEmpty: 'Ningún partido con vínculos registrados.',
    politiciansCount: (n) => `(${n} políticos)`,
    linksCount: (n) => `${n} vínculos`,
    insightLabel: 'Clave:',
    insight: 'Muestra qué partidos tienen más conexiones entre las distintas tramas investigadas.',
    flowTitle: '2. Diagrama de flujo operativo',
    flowBadge: 'Proporción de vínculos',
    flowIntro: 'Distribución de las conexiones por categoría de operación y situación judicial.',
    connections: 'Conexiones',
    categoryTransaction: 'Transacciones y sobornos',
    categoryContract: 'Contratos y licitaciones',
    categoryProcess: 'Procesos e investigaciones',
    legalStatus: 'Situación judicial:',
    heatmapTitle: '3. Mapa de calor financiero por trama',
    total: 'Total:',
    heatmapIntro: 'Comparativa del peso y del volumen financiero atribuido a cada operación en la base de datos.',
    heatmapEmpty: 'Ninguna trama financiera cargada.',
    schemeNumber: (n) => `TRAMA N.º ${n}`,
    estimatedFigure: 'Cifra estimada:',
    amountPending: 'Por determinar',
    totalPending: 'En elaboración',
  },

  glossary: {
    title: 'Glosario y dosier de las tramas',
    intro:
      'Documentación de los hechos, contexto histórico, mecanismo de funcionamiento y situación judicial de las tramas de corrupción registradas.',
    searchLabel: 'Buscar en el glosario',
    empty: 'Aún no hay ninguna trama registrada en la base de datos.',
    collapse: 'Contraer dosier',
    expand: 'Desplegar dosier',
    impactPending: 'Por determinar',
    politicians: 'Políticos vinculados:',
    companies: 'Empresas implicadas:',
    operators: 'Operadores financieros:',
    context: 'Contexto histórico y origen',
    mechanism: 'Funcionamiento de la trama',
    entities: 'Entidades registradas en la base de datos',
    legal: 'Evolución judicial y situación actual',
    sources: 'Fuentes documentales y reportajes',
    openPage: 'Abrir la página de este dosier',
  },

  search: {
    placeholder: 'Buscar trama, político, partido, empresa o término...',
    countFiltered: (found, total) => `${found} de ${total} tramas encontradas`,
    countAll: (total) => `${total} tramas registradas`,
    noneFor: 'No se ha encontrado ninguna trama para',
  },

  schemesIndex: {
    metaTitle: 'Tramas de corrupción',
    metaDescription:
      'Dosieres de las tramas de corrupción registradas: contexto histórico, funcionamiento, impacto financiero, evolución judicial y fuentes.',
    title: 'Tramas de corrupción',
    intro: (n) =>
      `${n} tramas documentadas, con contexto histórico, funcionamiento, impacto financiero, situación judicial y fuentes, del caso más reciente al más antiguo.`,
    searchLabel: 'Buscar en los dosieres',
    badge: 'Dosier',
  },

  dossier: {
    notFoundTitle: 'Trama no encontrada',
    fallbackDescription: (title) => `Dosier de la trama ${title}.`,
    breadcrumbSchemes: 'Tramas',
    allSchemes: 'Todas las tramas',
    reviewedOn: 'Revisado el',
    impact: 'Impacto:',
    context: 'Contexto histórico y origen',
    mechanism: 'Funcionamiento de la trama',
    who: 'Quién aparece en el caso: papel, situación judicial y fuente',
    whoNote:
      'Cada elemento es un vínculo documentado con la trama, con la situación judicial de ese vínculo. Una investigación o una acusación no equivale a una condena, y la anulación de una condena no equivale a una absolución.',
    amountCited: 'Importe citado:',
    source: 'Fuente:',
    statusCheckedOn: 'Situación comprobada el',
    legal: 'Evolución judicial y situación actual',
    sources: 'Fuentes documentales y reportajes',
    explore: 'Explorar las conexiones en la red',
    translationPending:
      'Este dosier se ha actualizado en portugués y la traducción al español está en revisión. Mientras tanto se muestra el texto original.',
    sourcesInPortuguese: 'Las fuentes citadas están en portugués.',
  },

  corrections: {
    metaDescription: (site) =>
      `Registro público de las correcciones y actualizaciones realizadas en los dosieres de ${site}: qué ha cambiado, cuándo y por qué.`,
    intro:
      'Todo cambio de contenido en los dosieres —un error corregido, una nueva resolución judicial, una fuente sustituida o una declaración incluida a petición de una persona citada— queda registrado aquí, con la fecha y el motivo.',
    empty: 'Hasta el momento no se ha registrado ninguna corrección.',
    kind: {
      correcao: 'Corrección',
      atualizacao: 'Actualización',
      direito_de_resposta: 'Derecho de réplica',
    },
    footerBefore: '¿Ha encontrado un error o una resolución más reciente? Escriba a',
    footerMiddle: ', indicando el vínculo y la fuente. Consulte también los',
    footerTerms: 'Términos de uso',
    footerAfter: '(correcciones y derecho de réplica).',
  },

  home: {
    h1: (site) => `${site}: mapa interactivo de las tramas de corrupción en Brasil`,
    legalNote:
      'Cada vínculo del mapa indica la fase judicial en la que se encuentra el hecho. Una investigación o una acusación no equivale a una condena, y la anulación de una condena no equivale a una absolución. El mapa se dibuja como imagen interactiva; el mismo contenido está disponible en texto en los dosieres que siguen.',
    dossiersNav: 'Dosieres de las tramas',
    allSchemes: 'Todas las tramas, de la más reciente a la más antigua',
    aboutNav: 'Sobre el sitio',
    aboutLink: 'Quiénes somos y metodología',
  },

  notFound: {
    metaTitle: 'Página no encontrada',
    code: 'Error 404',
    title: 'Página no encontrada',
    body: 'Puede que la dirección haya cambiado o que el dosier haya cambiado de nombre.',
    openGraph: 'Abrir la red',
    seeSchemes: 'Ver todas las tramas',
  },

  error: {
    title: 'Algo ha fallado',
    body: 'Se ha producido un error inesperado al montar esta página. Inténtelo de nuevo; si continúa, recargue el sitio.',
    seeSchemes: 'Ver las tramas en texto',
  },

  legal: {
    lastUpdated: 'Última actualización:',
    aboutMetaTitle: 'Quiénes somos',
    aboutMetaDescription: (site) =>
      `Conozca ${site}, un visualizador de las redes de relaciones en los casos de corrupción política en Brasil.`,
    aboutTitle: (site) => `Sobre ${site}`,
    aboutSubtitle: 'Visualizador de redes de corrupción política en Brasil',
    termsTitle: 'Términos de uso',
    termsMetaDescription: (site) => `Términos y condiciones de uso de ${site}.`,
    privacyTitle: 'Política de privacidad',
    privacyMetaDescription: (site) => `Política de privacidad y uso de cookies de ${site}.`,
  },
};
