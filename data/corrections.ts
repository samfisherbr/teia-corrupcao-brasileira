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
 *  - translations: o mesmo `summary` em inglês (en) e espanhol (es). Sem
 *             tradução, a entrada aparece em português nos outros idiomas.
 *             Rótulos de status citados no texto: use os de messages/en.ts e
 *             messages/es.ts ("Fatos documentados" = "Documented facts" /
 *             "Hechos documentados").
 *
 * Ao mexer num dossiê, atualize também o `reviewedAt` dele em
 * data/schemeDetails.ts.
 *
 * Os nomes dos tipos ("Correção", "Atualização"…) ficam em
 * `corrections.kind`, em messages/pt.ts, en.ts e es.ts.
 * ============================================================================
 */
export type CorrectionKind = 'correcao' | 'atualizacao' | 'direito_de_resposta';

export interface Correction {
  date: string;
  scheme?: string;
  kind: CorrectionKind;
  summary: string;
  translations?: { en?: string; es?: string };
}

export const CORRECTIONS: Correction[] = [
  {
    date: '2026-11-13',
    scheme: 'esquema_sivam',
    kind: 'correcao',
    summary:
      'O arquivamento, em 1996, do processo administrativo disciplinar do Itamaraty contra o embaixador Júlio César Gomes dos Santos estava classificado como "Absolvidos". Foi reclassificado como "Fatos documentados": a decisão foi da Corregedoria do Serviço Exterior, de natureza administrativa, e não uma absolvição judicial.',
    translations: {
      en: 'The shelving, in 1996, of the administrative disciplinary proceedings brought by the Itamaraty (Brazil\'s foreign ministry) against Ambassador Júlio César Gomes dos Santos had been classified as "Acquitted". It has been reclassified as "Documented facts": the decision was taken by the Foreign Service\'s internal affairs office (Corregedoria do Serviço Exterior) and was administrative in nature, not a judicial acquittal.',
      es: 'El archivo, en 1996, del expediente administrativo disciplinario del Itamaraty (Ministerio de Asuntos Exteriores de Brasil) contra el embajador Júlio César Gomes dos Santos estaba clasificado como «Absueltos». Se ha reclasificado como «Hechos documentados»: la decisión fue de la Corregedoria do Serviço Exterior (órgano de asuntos internos del Servicio Exterior), de naturaleza administrativa, y no una absolución judicial.',
    },
  },
  {
    date: '2026-11-11',
    scheme: 'esquema_lava_jato',
    kind: 'correcao',
    summary:
      'Retirada a cifra de R$ 42 bilhões, que não tinha fonte, e substituídas fontes que estavam fora do ar (erro 404 no G1).',
    translations: {
      en: 'The figure of R$ 42 billion, which had no source, has been removed, and sources that were offline (404 error on G1) have been replaced.',
      es: 'Se ha retirado la cifra de 42.000 millones de reales, que carecía de fuente, y se han sustituido fuentes que ya no estaban disponibles (error 404 en G1).',
    },
  },
  {
    date: '2026-11-11',
    scheme: 'esquema_lava_jato',
    kind: 'atualizacao',
    summary:
      'Situação jurídica atualizada: anulações das condenações de Eduardo Cunha, Marcelo Odebrecht, Léo Pinheiro, Alberto Youssef e João Vaccari Neto; prescrição no caso de José Dirceu; condenação definitiva de Fernando Collor; recurso de Renato Duque pendente no STF.',
    translations: {
      en: 'Legal status updated: annulment of the convictions of Eduardo Cunha, Marcelo Odebrecht, Léo Pinheiro, Alberto Youssef and João Vaccari Neto; time-barring (prescrição) in the case of José Dirceu; final conviction of Fernando Collor; appeal by Renato Duque pending before the Supreme Federal Court (STF).',
      es: 'Situación judicial actualizada: anulación de las condenas de Eduardo Cunha, Marcelo Odebrecht, Léo Pinheiro, Alberto Youssef y João Vaccari Neto; prescripción en el caso de José Dirceu; condena firme de Fernando Collor; recurso de Renato Duque pendiente ante el Supremo Tribunal Federal (STF).',
    },
  },
  {
    date: '2026-11-11',
    scheme: 'esquema_inss_sem_desconto',
    kind: 'correcao',
    summary:
      'A Operação Sem Desconto (descontos associativos no INSS) passou a ter dossiê próprio. Antes, aparecia como parte do caso Banco Master, ao qual não pertence.',
    translations: {
      en: 'Operation Sem Desconto (association fees deducted from INSS social security benefits) now has its own dossier. Previously it appeared as part of the Banco Master case, to which it does not belong.',
      es: 'La Operación Sem Desconto (descuentos asociativos en las prestaciones del INSS, la seguridad social brasileña) pasa a tener dosier propio. Antes aparecía como parte del caso Banco Master, al que no pertenece.',
    },
  },
  {
    date: '2026-11-11',
    scheme: 'esquema_banco_master_inss',
    kind: 'correcao',
    summary:
      'O texto deixou de atribuir a Operação Sem Desconto ao caso Banco Master. Retiradas a menção à CPMI do INSS, já encerrada, e a afirmação de rompimento do convênio com o INSS, que não pôde ser verificada. Incluídos o prazo dado pelo ministro Edson Fachin à PGR e a homologação da delação do fundador da Reag.',
    translations: {
      en: 'The text no longer attributes Operation Sem Desconto to the Banco Master case. The reference to the joint parliamentary inquiry into the INSS (CPMI do INSS), which has since closed, has been removed, as has the statement that the agreement with the INSS had been terminated, which could not be verified. Added: the deadline set by Justice Edson Fachin for the Prosecutor General\'s Office (PGR) and the court\'s ratification of the plea agreement of the founder of Reag.',
      es: 'El texto ha dejado de atribuir la Operación Sem Desconto al caso Banco Master. Se han retirado la mención a la comisión parlamentaria mixta de investigación del INSS (CPMI do INSS), ya concluida, y la afirmación de que se había roto el convenio con el INSS, que no pudo verificarse. Se han incluido el plazo dado por el magistrado Edson Fachin a la Fiscalía General (PGR) y la homologación del acuerdo de colaboración del fundador de Reag.',
    },
  },
];
