/**
 * Leitura dos textos do banco no idioma da página (inglês e espanhol).
 * Usado pela API do grafo (app/api/graph/route.ts) e pelas páginas de dossiê
 * (lib/db.ts). Tabelas: migrations/0003_translations.sql.
 *
 * Como funciona: as consultas trazem a linha em português (nodes / links) e,
 * ao lado, a tradução daquele idioma, se existir (LEFT JOIN). Depois,
 * applyNodeTranslation / applyLinkTranslation trocam os textos — mas só se a
 * tradução estiver EM DIA (`_tr = 1`): a cópia do português guardada junto da
 * tradução (source_text) ainda é igual ao português atual. Texto corrigido em
 * português e ainda não retraduzido → aparece em português, nunca a tradução
 * velha. Campo traduzido NULL → mantém o português (ex.: nome de pessoa).
 *
 * Em português (ou idioma desconhecido) nada disto é usado: nodeSelect() e
 * linkSelect() devolvem as consultas simples de sempre.
 */
import { TRANSLATED_LOCALES, type Locale } from '@/lib/i18n';

type Row = Record<string, unknown>;

/** `lang` gravado no banco para o idioma, ou null se o idioma é o português. */
export const dbLang = (locale: Locale | null | undefined): string | null =>
  locale && (TRANSLATED_LOCALES as readonly string[]).includes(locale) ? locale : null;

/** Formato de source_text: precisa ser IGUAL ao usado nos INSERTs (migração 0003). */
const NODE_SOURCE_TEXT = "n.label || char(10) || COALESCE(n.summary, '')";
const LINK_SOURCE_TEXT = "l.relation || char(10) || COALESCE(l.amount, '') || char(10) || COALESCE(l.amount_note, '')";

/**
 * SELECT dos nós (alias `n`). `lang` é um valor fixo vindo de dbLang() —
 * nunca texto do visitante —, por isso pode ir direto na consulta.
 * `SELECT n.*` de propósito: funciona com qualquer versão da tabela.
 */
export function nodeSelect(lang: string | null): string {
  if (!lang) return 'SELECT n.* FROM nodes n';
  return `SELECT n.*,
       CASE WHEN t.source_text = ${NODE_SOURCE_TEXT} THEN 1 ELSE 0 END AS _tr,
       t.label AS _tr_label, t.summary AS _tr_summary
  FROM nodes n
  LEFT JOIN node_translations t ON t.node_id = n.id AND t.lang = '${lang}'`;
}

/** SELECT dos vínculos (alias `l`), com `_rowid` para tabelas antigas sem coluna id. */
export function linkSelect(lang: string | null): string {
  if (!lang) return 'SELECT l.rowid AS _rowid, l.* FROM links l';
  return `SELECT l.rowid AS _rowid, l.*,
       CASE WHEN t.source_text = ${LINK_SOURCE_TEXT} THEN 1 ELSE 0 END AS _tr,
       t.relation AS _tr_relation, t.amount AS _tr_amount, t.amount_note AS _tr_amount_note
  FROM links l
  LEFT JOIN link_translations t ON t.link_id = l.id AND t.lang = '${lang}'`;
}

const text = (v: unknown): string | null => (typeof v === 'string' && v.trim() !== '' ? v : null);

/** Troca label/summary pela tradução em dia, se houver. Devolve uma cópia sem as colunas auxiliares. */
export function applyNodeTranslation(r: Row): Row {
  const { _tr, _tr_label, _tr_summary, ...node } = r;
  if (Number(_tr) !== 1) return node;
  return { ...node, label: text(_tr_label) ?? node.label, summary: text(_tr_summary) ?? node.summary };
}

/** Troca relation/amount/amount_note pela tradução em dia, se houver. */
export function applyLinkTranslation(r: Row): Row {
  const { _tr, _tr_relation, _tr_amount, _tr_amount_note, ...link } = r;
  if (Number(_tr) !== 1) return link;
  return {
    ...link,
    relation: text(_tr_relation) ?? link.relation,
    amount: text(_tr_amount) ?? link.amount,
    amount_note: text(_tr_amount_note) ?? link.amount_note,
  };
}

/** Erro de banco sem as tabelas de tradução (migração 0003 ainda não rodada)? */
export const isMissingTranslationTables = (e: unknown): boolean =>
  /no such table: (node|link)_translations|no such column: (t\.|l\.id)/i.test(e instanceof Error ? `${e.message} ${String(e.cause ?? '')}` : String(e));
