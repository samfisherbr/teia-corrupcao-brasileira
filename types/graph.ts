/**
 * Tipos de dados do grafo. Espelham EXATAMENTE as tabelas `nodes` e `links`
 * do Cloudflare D1 definidas em `schema.sql`.
 *
 * Para adicionar um novo valor (ex.: um novo status jurídico):
 *   1. inclua-o no CHECK correspondente em `schema.sql`;
 *   2. inclua-o no tipo abaixo;
 *   3. dê a ele cor e rótulo em `lib/graphConfig.ts` (STATUS_STYLE / NODE_STYLE).
 * O TypeScript vai apontar qualquer lugar que precise ser atualizado.
 */

/** Categoria da entidade (coluna `nodes.type`). */
export type NodeType = 'politician' | 'party' | 'scheme' | 'company' | 'operator';

/**
 * Estágio jurídico/documental do vínculo (coluna `links.status`).
 *  - confirmed            fato documental sem juízo criminal (contrato, filiação, cargo, leniência)
 *  - under_investigation  investigado, indiciado ou denunciado, sem sentença
 *  - convicted_appealing  condenado em 1ª/2ª instância, com recurso pendente
 *  - convicted_final      condenação transitada em julgado
 *  - annulled             condenação anulada por decisão superior (≠ absolvição)
 *  - acquitted            absolvido no mérito ou denúncia rejeitada
 */
export type LinkStatus =
  | 'confirmed'
  | 'under_investigation'
  | 'convicted_appealing'
  | 'convicted_final'
  | 'annulled'
  | 'acquitted';

/**
 * Natureza do vínculo (coluna `links.type`).
 *  - transaction  fluxo de dinheiro
 *  - contract     vínculo contratual, societário ou funcional
 *  - process      vínculo político, institucional ou judicial
 */
export type LinkType = 'transaction' | 'contract' | 'process';

/**
 * Natureza do valor de um vínculo (coluna `links.amount_kind`, migração 0007).
 * Só some cifras do mesmo tipo: um valor de contrato não é dinheiro desviado.
 *  - bribe         propina ou vantagem indevida (paga, recebida ou pedida)
 *  - damage        prejuízo ou desvio estimado de dinheiro público
 *  - illicit_flow  dinheiro movimentado, lavado, remetido; caixa dois
 *  - contract      valor de contrato, financiamento ou verba envolvido
 *  - recovery      acordo, multa, ressarcimento, bloqueio ou apreensão
 *  - other         qualquer outro
 */
export const AMOUNT_KINDS = ['bribe', 'damage', 'illicit_flow', 'contract', 'recovery', 'other'] as const;
export type AmountKind = (typeof AMOUNT_KINDS)[number];

/** O valor como AmountKind, ou null se ausente ou desconhecido. */
export const toAmountKind = (v: unknown): AmountKind | null =>
  typeof v === 'string' && (AMOUNT_KINDS as readonly string[]).includes(v) ? (v as AmountKind) : null;

/**
 * LINHA DO TEMPO DE UM ESQUEMA (tabela `scheme_timelines`, migração 0010; cópia
 * de reserva em `timeline` de data/schemeDetails.ts — as duas precisam bater:
 * `npm run check:timeline-sync`).
 *
 * Datas no formato ISO com a precisão que a fonte permite: 'AAAA', 'AAAA-MM'
 * ou 'AAAA-MM-DD'.
 *
 * Âncoras (regras completas no cabeçalho de data/schemeDetails.ts):
 *  - start   quando o esquema começou a operar, segundo a documentação.
 *  - end     quando a atividade terminou. Sem data documentada de fim, é o
 *            PRIMEIRO ATO OFICIAL PÚBLICO (operação, prisão, CPI instalada,
 *            decisão judicial, relatório de órgão de controle). Reportagem
 *            sozinha não conta; inquérito sigiloso também não (vai na nota).
 *  - exposed só quando o esquema já tinha parado antes de ser descoberto
 *            (ex.: Mensalão Mineiro, 1998 → 2005): o primeiro ato oficial.
 */
export const START_BASES = [
  'documented_start', // fontes dizem quando começou
  'first_known_act', //  ato ilícito mais antigo datado nas fontes
  'enabling_act', //     nomeação, contrato ou norma que tornou o esquema possível (sem data do 1º ato)
] as const;
export const END_BASES = [
  'documented_end', //        fontes dizem quando a atividade parou
  'police_investigation', //  operação, prisão ou inquérito público da PF/MP
  'parliamentary_inquiry', // CPI/CPMI instalada
  'oversight', //             auditoria, Coaf, CADE, Banco Central, CGU
  'court_ruling', //          decisão judicial que encerrou a prática
] as const;
export type StartBasis = (typeof START_BASES)[number];
export type EndBasis = (typeof END_BASES)[number];
export type ExposedBasis = Exclude<EndBasis, 'documented_end'>;

/** 'AAAA', 'AAAA-MM' ou 'AAAA-MM-DD'. */
export type TimelineDate = `${number}` | `${number}-${number}` | `${number}-${number}-${number}`;
export const TIMELINE_DATE_RE = /^\d{4}(-(0[1-9]|1[0-2])(-(0[1-9]|[12]\d|3[01]))?)?$/;

export interface TimelinePoint<B extends string> {
  date: TimelineDate;
  basis: B;
  /** Página que sustenta a data (pode estar fora de `sources` do dossiê). */
  sourceUrl: string;
  /** Justificativa editorial em português; não aparece no site. */
  note?: string;
}

export interface SchemeTimeline {
  start: TimelinePoint<StartBasis>;
  end: TimelinePoint<EndBasis>;
  exposed?: TimelinePoint<ExposedBasis>;
}

/** Ano de uma TimelineDate. */
export const timelineYear = (d: string): number => Number(d.slice(0, 4));

/**
 * Linha do D1 (colunas start_date, start_basis…) → SchemeTimeline, ou null se
 * faltar algo obrigatório ou vier fora do formato (nunca lança).
 */
export function timelineFromRow(r: Record<string, unknown>): SchemeTimeline | null {
  const point = <B extends string>(prefix: string, bases: readonly B[]): TimelinePoint<B> | null => {
    const date = r[`${prefix}_date`];
    const basis = r[`${prefix}_basis`];
    const url = r[`${prefix}_source_url`];
    const note = r[`${prefix}_note`];
    if (typeof date !== 'string' || !TIMELINE_DATE_RE.test(date)) return null;
    if (typeof basis !== 'string' || !(bases as readonly string[]).includes(basis)) return null;
    if (typeof url !== 'string' || !/^https?:\/\//i.test(url)) return null;
    return { date: date as TimelineDate, basis: basis as B, sourceUrl: url, ...(typeof note === 'string' && note ? { note } : {}) };
  };
  const start = point('start', START_BASES);
  const end = point('end', END_BASES);
  if (!start || !end) return null;
  const exposed = point('exposed', END_BASES.filter((b): b is ExposedBasis => b !== 'documented_end'));
  return exposed ? { start, end, exposed } : { start, end };
}

/** Erro de banco sem a tabela scheme_timelines (migração 0010 não rodada): tratar como "sem linha do tempo". */
export const isMissingTimelineTable = (e: unknown): boolean =>
  /no such table: scheme_timelines/i.test(e instanceof Error ? `${e.message} ${String(e.cause ?? '')}` : String(e));

/** Uma linha da tabela `nodes`. O D1 devolve NULL do SQL como `null`. */
export interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  party: string | null;
  summary: string | null;
  image_url: string | null;
  /** Crédito da foto (autor e licença), ex.: "Fulano / Wikimedia Commons, CC BY-SA 4.0". */
  image_credit?: string | null;
  /** Página de origem da foto (onde constam autor e licença). */
  image_source_url?: string | null;
  /** Só em nós `scheme`: linha do tempo (tabela scheme_timelines). Ausente/null = sem registro. */
  timeline?: SchemeTimeline | null;
  // Coordenadas preenchidas pelo layout/d3-force em tempo de execução.
  // (Não existem no banco.)
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

/**
 * Uma linha da tabela `links`.
 * `source`/`target` chegam da API como string (id) e o d3-force os substitui
 * pelo objeto do nó depois que resolve o grafo — por isso o tipo união.
 * Use `getLinkEnds()` de `lib/graphConfig.ts` para ler os ids com segurança.
 */
export interface GraphLink {
  id?: number | string;
  source: string | GraphNode;
  target: string | GraphNode;
  relation: string;
  type: LinkType | null;
  status: LinkStatus;
  /** Texto de exibição com moeda, ex.: "R$ 6.200.000.000" ou "US$ 5.000.000". */
  amount: string | null;
  /** O mesmo valor em reais como inteiro (para somas). NULL se não houver conversão na fonte. */
  amount_brl: number | null;
  /** Ressalva sobre o número (estimativa, moeda estrangeira, total de acordo…). */
  amount_note: string | null;
  /** O que o valor representa (propina, prejuízo, contrato…). NULL sem valor ou antes da migração 0007. */
  amount_kind: AmountKind | null;
  year: number | null;
  source_url: string | null;
  /** Data (AAAA-MM-DD) em que o status foi conferido pela última vez. NULL = não registrada. */
  reviewed_at?: string | null;
}

/** Presidente da República (tabela `presidents`, migração 0011). Datas 'AAAA-MM-DD'; end null = no cargo. */
export interface PresidentTerm {
  id: string;
  name: string;
  party: string;
  start: string;
  end: string | null;
}

/** Linha do D1 → PresidentTerm, ou null se vier fora do formato (nunca lança). */
export function presidentFromRow(r: Record<string, unknown>): PresidentTerm | null {
  const day = /^\d{4}-\d{2}-\d{2}$/;
  const { id, name, party, term_start: start, term_end: end } = r;
  if (typeof id !== 'string' || typeof name !== 'string' || typeof party !== 'string') return null;
  if (typeof start !== 'string' || !day.test(start)) return null;
  if (end !== null && end !== undefined && (typeof end !== 'string' || !day.test(end))) return null;
  return { id, name, party, start, end: typeof end === 'string' ? end : null };
}

/** Erro de banco sem a tabela presidents (migração 0011 não rodada): usar a lista de reserva. */
export const isMissingPresidentsTable = (e: unknown): boolean =>
  /no such table: presidents/i.test(e instanceof Error ? `${e.message} ${String(e.cause ?? '')}` : String(e));

/** Formato que a API `/api/graph` devolve e que o grafo consome. */
export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
  /** Mandatos presidenciais do D1; ausente = banco sem a tabela (usa-se a lista de reserva). */
  presidents?: PresidentTerm[];
}
