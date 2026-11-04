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
};
