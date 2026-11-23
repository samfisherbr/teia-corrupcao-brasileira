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

/** Formato que a API `/api/graph` devolve e que o grafo consome. */
export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}
