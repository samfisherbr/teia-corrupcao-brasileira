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
    date: '2026-11-15',
    scheme: 'esquema_trt_sp',
    kind: 'correcao',
    summary:
      'Removidos 19 vínculos que apareciam em duplicidade. Por causa deles, o infográfico de valores somava R$ 2.579.672.000 para o esquema, o dobro dos R$ 1.289.836.000 registrados nos vínculos.',
    translations: {
      en: 'Nineteen links that appeared twice have been removed. Because of them, the amounts infographic added up R$ 2,579,672,000 for the scheme, double the R$ 1,289,836,000 recorded in the links.',
      es: 'Se han eliminado 19 vínculos que aparecían duplicados. Por su causa, la infografía de importes sumaba 2.579.672.000 reales para el esquema, el doble de los 1.289.836.000 reales registrados en los vínculos.',
    },
  },
  {
    date: '2026-11-15',
    scheme: 'esquema_compra_reeleicao',
    kind: 'correcao',
    summary:
      'Removidos 14 vínculos que apareciam em duplicidade. Por causa deles, o infográfico de valores somava R$ 1.000.000 para o esquema, o dobro dos R$ 500.000 registrados nos vínculos.',
    translations: {
      en: 'Fourteen links that appeared twice have been removed. Because of them, the amounts infographic added up R$ 1,000,000 for the scheme, double the R$ 500,000 recorded in the links.',
      es: 'Se han eliminado 14 vínculos que aparecían duplicados. Por su causa, la infografía de importes sumaba 1.000.000 de reales para el esquema, el doble de los 500.000 reales registrados en los vínculos.',
    },
  },
  {
    date: '2026-11-15',
    scheme: 'esquema_vampiro',
    kind: 'correcao',
    summary:
      'Passou a constar no dossiê a afirmação de Delúbio Soares, à época, de que o PT recebeu doações de campanha de laboratórios, cerca de R$ 1,5 milhão ou R$ 1,6 milhão, todas declaradas na prestação de contas. Antes, ela aparecia só num vínculo repetido entre Delúbio e o PT, que foi removido.',
    translations: {
      en: "Delúbio Soares's statement at the time that the PT had received campaign donations from laboratories, about R$ 1.5 million or R$ 1.6 million, all declared in its campaign accounts, now appears in the dossier. Previously it appeared only in a repeated link between Delúbio and the PT, which has been removed.",
      es: 'Pasa a figurar en el dosier la afirmación de Delúbio Soares, en su momento, de que el PT recibió donaciones de campaña de laboratorios, unos 1,5 o 1,6 millones de reales, todas declaradas en la rendición de cuentas. Antes solo aparecía en un vínculo repetido entre Delúbio y el PT, que se ha eliminado.',
    },
  },
  {
    date: '2026-11-15',
    kind: 'correcao',
    summary:
      'Removidos dois vínculos repetidos da filiação de Jair Bolsonaro ao PL. A fonte do vínculo mantido foi trocada por notícia da Agência Brasil de 30 de novembro de 2021 sobre a filiação; a anterior, sobre o escândalo do MEC, não tratava do tema.',
    translations: {
      en: "Two repeated links for Jair Bolsonaro's membership of the PL have been removed. The source of the remaining link has been replaced with an Agência Brasil report of 30 November 2021 on his joining the party; the previous one, about the Education Ministry (MEC) scandal, did not cover the subject.",
      es: 'Se han eliminado dos vínculos repetidos de la afiliación de Jair Bolsonaro al PL. La fuente del vínculo que se mantiene se ha sustituido por una noticia de Agência Brasil del 30 de noviembre de 2021 sobre la afiliación; la anterior, sobre el escándalo del Ministerio de Educación (MEC), no trataba el tema.',
    },
  },
  {
    date: '2026-11-15',
    scheme: 'esquema_compra_reeleicao',
    kind: 'correcao',
    summary:
      'Incluída a negativa de Zila Bezerra, que antes constava como não localizada; fontes de sete vínculos trocadas por reportagens da Folha de S.Paulo de maio de 1997 e por uma página da Câmara. As fontes anteriores, do Congresso em Foco, continuam no ar: a primeira versão desta nota dizia, por engano, que elas não exibiam mais o texto.',
    translations: {
      en: "Zila Bezerra's denial, previously listed as not found, was added; sources for seven links were replaced with Folha de S.Paulo reports from May 1997 and a Chamber of Deputies page. The previous sources, from Congresso em Foco, are still online: the first version of this note wrongly said they no longer displayed the text.",
      es: 'Se incluyó la negativa de Zila Bezerra, que antes figuraba como no localizada; se sustituyeron las fuentes de siete vínculos por reportajes de Folha de S.Paulo de mayo de 1997 y por una página de la Cámara. Las fuentes anteriores, de Congresso em Foco, siguen disponibles: la primera versión de esta nota decía, por error, que ya no mostraban el texto.',
    },
  },
  {
    date: '2026-11-13',
    kind: 'correcao',
    summary:
      'Corrigida a conversão para reais de dois valores em dólares usados nos infográficos: US$ 35 mil (Anões do Orçamento) e US$ 4 milhões (Escândalo do TRT-SP) estavam somados como valores cem vezes maiores, porque os centavos foram lidos como dígitos. Um vínculo do TRT-SP que exibia US$ 146.546.960,00 passou a exibir R$ 800.000.000, a cifra da AGU descrita na própria nota. Também foram padronizados no formato brasileiro valores que estavam escritos no formato inglês e corrigido o espaçamento de textos de 12 registros, sem mudança de conteúdo.',
    translations: {
      en: 'The conversion into reais of two US-dollar amounts used in the infographics has been corrected: US$ 35,000 (Budget Dwarfs) and US$ 4 million (TRT-SP scandal) were being added up as amounts a hundred times larger, because the cents had been read as digits. A TRT-SP link that showed US$ 146,546,960.00 now shows R$ 800,000,000, the AGU figure described in its own note. Amounts written in English number format were also standardised to the Brazilian format and the spacing of 12 records was corrected, with no change of content.',
      es: 'Se ha corregido la conversión a reales de dos importes en dólares utilizados en las infografías: 35.000 dólares (Enanos del Presupuesto) y 4 millones de dólares (escándalo del TRT-SP) se sumaban como importes cien veces mayores, porque los céntimos se habían leído como dígitos. Un vínculo del TRT-SP que mostraba 146.546.960,00 dólares pasa a mostrar 800.000.000 de reales, la cifra de la AGU descrita en su propia nota. También se han normalizado al formato brasileño importes escritos en formato inglés y se ha corregido el espaciado de 12 registros, sin cambios de contenido.',
    },
  },
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
