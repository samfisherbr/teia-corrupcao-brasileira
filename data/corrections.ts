/**
 * ============================================================================
 * REGISTRO PÚBLICO DE CORREÇÕES — exibido em /correcoes
 * ============================================================================
 * Toda correção de CONTEÚDO (fato, cifra, status jurídico, fonte, direito de
 * resposta) ganha uma entrada aqui, a mais recente primeiro. Mudanças de
 * visual ou de código não entram.
 *
 *  - date:    AAAA-MM-DD em que a correção foi publicada.
 *  - scheme:  id do esquema afetado (liga a entrada ao dossiê); omita se a
 *             correção não for de um esquema específico.
 *  - kind:    'correcao'           erro corrigido (fato, cifra, fonte quebrada);
 *             'atualizacao'        fato novo (decisão judicial, novo desdobramento);
 *             'direito_de_resposta' posicionamento incluído a pedido de citado.
 *  - summary: o que mudou e por quê, em tom neutro. Diga o que estava antes.
 *
 * Ao mexer num dossiê, atualize também o `reviewedAt` dele em
 * data/schemeDetails.ts.
 * ============================================================================
 */
export type CorrectionKind = 'correcao' | 'atualizacao' | 'direito_de_resposta';

export interface Correction {
  date: string;
  scheme?: string;
  kind: CorrectionKind;
  summary: string;
}

export const CORRECTION_KIND_LABEL: Record<CorrectionKind, string> = {
  correcao: 'Correção',
  atualizacao: 'Atualização',
  direito_de_resposta: 'Direito de resposta',
};

export const CORRECTIONS: Correction[] = [
  {
    date: '2026-11-11',
    scheme: 'esquema_lava_jato',
    kind: 'correcao',
    summary:
      'Retirada a cifra de R$ 42 bilhões, que não tinha fonte, e substituídas fontes que estavam fora do ar (erro 404 no G1).',
  },
  {
    date: '2026-11-11',
    scheme: 'esquema_lava_jato',
    kind: 'atualizacao',
    summary:
      'Situação jurídica atualizada: anulações das condenações de Eduardo Cunha, Marcelo Odebrecht, Léo Pinheiro, Alberto Youssef e João Vaccari Neto; prescrição no caso de José Dirceu; condenação definitiva de Fernando Collor; recurso de Renato Duque pendente no STF.',
  },
  {
    date: '2026-11-11',
    scheme: 'esquema_inss_sem_desconto',
    kind: 'correcao',
    summary:
      'A Operação Sem Desconto (descontos associativos no INSS) passou a ter dossiê próprio. Antes, aparecia como parte do caso Banco Master, ao qual não pertence.',
  },
  {
    date: '2026-11-11',
    scheme: 'esquema_banco_master_inss',
    kind: 'correcao',
    summary:
      'O texto deixou de atribuir a Operação Sem Desconto ao caso Banco Master. Retiradas a menção à CPMI do INSS, já encerrada, e a afirmação de rompimento do convênio com o INSS, que não pôde ser verificada. Incluídos o prazo dado pelo ministro Edson Fachin à PGR e a homologação da delação do fundador da Reag.',
  },
];
