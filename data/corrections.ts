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
    date: '2026-11-19',
    scheme: 'esquema_operacao_placebo',
    kind: 'atualizacao',
    summary:
      'Incluída a sentença de 19/09/2025 da Justiça do Rio que condenou Edmar Santos e Gabriell Neves por improbidade administrativa pelo superfaturamento na compra de insumos na pandemia (decisão de primeira instância; a defesa de Edmar anunciou recurso e a de Gabriell afirma não haver provas). Também foram incluídas as prisões de 2020 na Operação Mercadores do Caos, a auditoria da Secretaria de Saúde sobre a compra de respiradores e a cassação do registro médico de Edmar Santos em 2023. O texto anterior não registrava a sentença de 2025.',
    translations: {
      en: "Added the 19 September 2025 ruling of the Rio de Janeiro courts convicting Edmar Santos and Gabriell Neves of administrative misconduct over overpricing in the purchase of supplies during the pandemic (a first-instance decision; Santos's defence announced an appeal and Neves's defence says there is no evidence). Also added the 2020 arrests in Operation Mercadores do Caos, the Health Secretariat's audit of the ventilator purchases and the revocation of Edmar Santos's medical licence in 2023. The previous text did not record the 2025 ruling.",
      es: 'Se incluyó la sentencia del 19 de septiembre de 2025 de la Justicia de Río que condenó a Edmar Santos y Gabriell Neves por improbidad administrativa por el sobreprecio en la compra de insumos durante la pandemia (decisión de primera instancia; la defensa de Santos anunció recurso y la de Neves afirma que no hay pruebas). También se incluyeron las detenciones de 2020 en la Operación Mercadores do Caos, la auditoría de la Secretaría de Sanidad sobre la compra de respiradores y la revocación de la licencia médica de Edmar Santos en 2023. El texto anterior no recogía la sentencia de 2025.',
    },
  },
  {
    date: '2026-11-19',
    scheme: 'esquema_operacao_porto_seguro',
    kind: 'atualizacao',
    summary:
      'Dossiê ampliado com a origem da investigação (relato de um auditor do TCU sobre oferta de propina ligada à Tecondi, que depois também foi acusado), os números da operação de novembro de 2012 e o recebimento, em fevereiro de 2014, da denúncia contra 18 acusados pela Justiça Federal em São Paulo, com a divisão do processo em núcleos. O texto anterior não trazia esses fatos; nada do que constava foi alterado.',
    translations: {
      en: 'Dossier expanded with the origin of the investigation (an account by a TCU auditor of a bribe offer linked to Tecondi, who was later accused himself), the figures for the November 2012 operation and the acceptance, in February 2014, of the charges against 18 defendants by the Federal Court in São Paulo, with the case split into strands. The previous text did not include these facts; nothing already in it was changed.',
      es: 'Dosier ampliado con el origen de la investigación (el relato de un auditor del TCU sobre una oferta de soborno vinculada a Tecondi, que después también fue acusado), las cifras de la operación de noviembre de 2012 y la admisión, en febrero de 2014, de la acusación contra 18 imputados por la Justicia Federal de São Paulo, con la división del proceso en bloques. El texto anterior no recogía estos hechos; no se modificó nada de lo que ya figuraba.',
    },
  },
  {
    date: '2026-11-19',
    scheme: 'esquema_operacao_navalha',
    kind: 'atualizacao',
    summary:
      'Dossiê ampliado com os números da operação de maio de 2007 (46 presos, 48 mandados de prisão preventiva e 84 de busca e apreensão), as áreas e os órgãos atingidos e o desmembramento da ação pela Corte Especial do STJ em março de 2010. O texto anterior não trazia esses fatos; nada do que constava foi alterado.',
    translations: {
      en: 'Dossier expanded with the figures for the May 2007 operation (46 arrests, 48 pre-trial detention warrants and 84 search and seizure warrants), the areas and bodies affected and the splitting of the case by the STJ Special Court in March 2010. The previous text did not include these facts; nothing already in it was changed.',
      es: 'Dosier ampliado con las cifras de la operación de mayo de 2007 (46 detenidos, 48 órdenes de prisión preventiva y 84 de registro e incautación), las áreas y los organismos afectados y la división del proceso por la Corte Especial del STJ en marzo de 2010. El texto anterior no recogía estos hechos; no se modificó nada de lo que ya figuraba.',
    },
  },
  {
    date: '2026-11-18',
    scheme: 'esquema_caixa_pandora',
    kind: 'atualizacao',
    summary:
      'Incluída a decisão de 13/10/2026 da 1ª Turma Cível do TJDFT, que afastou a condenação por improbidade de José Roberto Arruda, José Geraldo Maciel, Nerci Soares de Souza e da Uni Repro em uma das ações do caso, por considerar ilícitas as gravações de Durval Barbosa. O texto anterior não registrava essa decisão; Arruda segue condenado em outras ações.',
    translations: {
      en: "Added the 13 October 2026 ruling of the 1st Civil Panel of the Federal District Court of Justice (TJDFT), which set aside the administrative misconduct convictions of José Roberto Arruda, José Geraldo Maciel, Nerci Soares de Souza and Uni Repro in one of the actions in the case, holding Durval Barbosa's recordings unlawful. The previous text did not record this ruling; Arruda remains convicted in other actions.",
      es: 'Se incluyó la decisión del 13 de octubre de 2026 de la 1.ª Sala Civil del Tribunal de Justicia del Distrito Federal (TJDFT), que anuló las condenas por improbidad de José Roberto Arruda, José Geraldo Maciel, Nerci Soares de Souza y Uni Repro en una de las acciones del caso, al considerar ilícitas las grabaciones de Durval Barbosa. El texto anterior no recogía esta decisión; Arruda sigue condenado en otras acciones.',
    },
  },
  {
    date: '2026-11-18',
    scheme: 'esquema_caixa_pandora',
    kind: 'atualizacao',
    summary:
      'O vínculo da Call Tecnologia passou a citar a decisão de junho de 2026 da 6ª Turma Cível do TJDFT, que manteve a condenação por improbidade da empresa, de Arruda, de José Geraldo Maciel e de José Celso Valadares Gontijo. Antes, o vínculo citava apenas a sentença de primeira instância de 2024.',
    translations: {
      en: 'The Call Tecnologia link now cites the June 2026 ruling of the 6th Civil Panel of the Federal District Court of Justice (TJDFT), which upheld the administrative misconduct conviction of the company, Arruda, José Geraldo Maciel and José Celso Valadares Gontijo. Previously the link cited only the 2024 first-instance judgment.',
      es: 'El vínculo de Call Tecnologia pasó a citar la decisión de junio de 2026 de la 6.ª Sala Civil del Tribunal de Justicia del Distrito Federal (TJDFT), que mantuvo la condena por improbidad de la empresa, de Arruda, de José Geraldo Maciel y de José Celso Valadares Gontijo. Antes, el vínculo citaba solo la sentencia de primera instancia de 2024.',
    },
  },
  {
    date: '2026-11-18',
    scheme: 'esquema_operacao_venire_joias_presidencia',
    kind: 'atualizacao',
    summary:
      'Incluídas as decisões de julho e outubro de 2026 do ministro Alexandre de Moraes (custódia das joias transferida à Receita e intimação de Bolsonaro sobre cobrança fiscal). O pedido de arquivamento da PGR, de março de 2026, segue sem decisão localizada; a fonte do vínculo foi trocada por reportagem da CNN Brasil.',
    translations: {
      en: "Added Justice Alexandre de Moraes's rulings of July and October 2026 (custody of the jewellery transferred to the Federal Revenue Service and Bolsonaro served notice of a tax charge). The Prosecutor General's Office (PGR) March 2026 request to close the case still has no ruling located; the link's source was replaced with a CNN Brasil report.",
      es: 'Se incluyeron las decisiones de julio y octubre de 2026 del magistrado Alexandre de Moraes (custodia de las joyas transferida a la Receita Federal y notificación a Bolsonaro de un cargo fiscal). La petición de archivo de la Fiscalía General (PGR), de marzo de 2026, sigue sin decisión localizada; la fuente del vínculo se sustituyó por un reportaje de CNN Brasil.',
    },
  },
  {
    date: '2026-11-17',
    scheme: 'esquema_operacao_porto_seguro',
    kind: 'correcao',
    summary:
      'Fonte trocada: a reportagem do G1 de 2012 sobre a deflagração da operação saiu do ar (erro 404) e foi substituída pela cronologia do UOL de 3 de dezembro de 2012, que registra a operação de 23 de novembro de 2012 e as exonerações de Rosemary Noronha e José Weber.',
    translations: {
      en: 'Source replaced: the 2012 G1 report on the launch of the operation went offline (404 error) and was replaced with the UOL timeline of 3 December 2012, which records the operation of 23 November 2012 and the dismissals of Rosemary Noronha and José Weber.',
      es: 'Fuente sustituida: el reportaje de G1 de 2012 sobre el inicio de la operación dejó de estar disponible (error 404) y se sustituyó por la cronología de UOL del 3 de diciembre de 2012, que recoge la operación del 23 de noviembre de 2012 y las destituciones de Rosemary Noronha y José Weber.',
    },
  },
  {
    date: '2026-11-17',
    scheme: 'esquema_operacao_navalha',
    kind: 'correcao',
    summary:
      'Revisão do caso: o vínculo de Zuleido Veras passou de "Fatos documentados" para "Condenações anuladas", com registro da decisão do TRF-5 de 2018 e do recurso do MPF; fontes de outros vínculos foram trocadas por páginas que sustentam o estágio afirmado; a Wikipédia saiu da lista de fontes; resumos de pessoas e empresas deixaram de citar acusações e passaram a dizer só quem elas são.',
    translations: {
      en: 'Case review: Zuleido Veras\'s link moved from "Documented facts" to "Convictions annulled", recording the 2018 TRF-5 decision and the MPF appeal; sources for other links were replaced with pages that support the stage stated; Wikipedia was removed from the list of sources; summaries of people and companies no longer mention accusations and now state only who they are.',
      es: 'Revisión del caso: el vínculo de Zuleido Veras pasó de "Hechos documentados" a "Condenas anuladas", con la decisión del TRF-5 de 2018 y el recurso del MPF; se sustituyeron fuentes de otros vínculos por páginas que sostienen la fase afirmada; Wikipedia salió de la lista de fuentes; los resúmenes de personas y empresas dejaron de citar acusaciones y ahora solo dicen quiénes son.',
    },
  },
  {
    date: '2026-11-17',
    scheme: 'esquema_caixa_pandora',
    kind: 'correcao',
    summary:
      'Revisão do caso: o vínculo da Call Tecnologia passou de "Fatos documentados" para "Condenados (cabe recurso)", por condenação em ação de improbidade (esfera cível), com a posição da defesa de Arruda; a cifra do vínculo de Durval Barbosa e o destaque do dossiê, antes R$ 600 milhões sem fonte que os sustentasse, passaram a citar a estimativa mínima de R$ 110 milhões da PGR; resumos de pessoas e empresas foram neutralizados.',
    translations: {
      en: 'Case review: Call Tecnologia\'s link moved from "Documented facts" to "Convicted (subject to appeal)", for a conviction in an administrative misconduct (civil) case, with Arruda\'s defence position; the figure on Durval Barbosa\'s link and the dossier highlight, previously R$ 600 million without a supporting source, now cite the PGR\'s minimum estimate of R$ 110 million; summaries of people and companies were made neutral.',
      es: 'Revisión del caso: el vínculo de Call Tecnologia pasó de "Hechos documentados" a "Condenados (cabe recurso)", por una condena en una acción de improbidad (vía civil), con la posición de la defensa de Arruda; la cifra del vínculo de Durval Barbosa y el dato destacado del dosier, antes 600 millones de reales sin fuente que los sostuviera, ahora citan la estimación mínima de 110 millones de la PGR; se neutralizaron los resúmenes de personas y empresas.',
    },
  },
  {
    date: '2026-11-17',
    scheme: 'esquema_operacao_porto_seguro',
    kind: 'correcao',
    summary:
      'Revisão do caso: o vínculo da Tecondi passou de "Fatos documentados" para "Sob investigação", por ação de improbidade do MPF de 2013, com a resposta da empresa; o destaque do dossiê, antes de R$ 1,3 bilhão a R$ 2 bilhões sem fonte localizada, passou a ser o pedido de devolução de R$ 38 milhões feito pelo MPF; resumos foram neutralizados.',
    translations: {
      en: 'Case review: Tecondi\'s link moved from "Documented facts" to "Under investigation", for a 2013 MPF administrative misconduct suit, with the company\'s response; the dossier highlight, previously R$ 1.3 billion to R$ 2 billion with no source found, is now the MPF\'s request to recover R$ 38 million; summaries were made neutral.',
      es: 'Revisión del caso: el vínculo de Tecondi pasó de "Hechos documentados" a "En investigación", por una acción de improbidad del MPF de 2013, con la respuesta de la empresa; el dato destacado del dosier, antes de 1.300 a 2.000 millones de reales sin fuente localizada, pasa a ser la petición del MPF de devolver 38 millones; se neutralizaron los resúmenes.',
    },
  },
  {
    date: '2026-11-17',
    scheme: 'esquema_trensalao',
    kind: 'correcao',
    summary:
      'Revisão do caso: cifras em dólares ganharam a nota de conversão exigida e valores em reais corrigidos pela cotação média de 2014; cifras sem fonte específica em vínculos de empresas foram retiradas; o vínculo de Robson Marinho passou a citar sua volta ao TCE-SP em 2021; resumos foram neutralizados.',
    translations: {
      en: 'Case review: dollar amounts gained the required conversion note and real amounts were corrected at the 2014 average rate; figures without a specific source on company links were removed; Robson Marinho\'s link now cites his return to the TCE-SP in 2021; summaries were made neutral.',
      es: 'Revisión del caso: las cifras en dólares recibieron la nota de conversión exigida y los importes en reales se corrigieron al tipo medio de 2014; se retiraron cifras sin fuente específica en vínculos de empresas; el vínculo de Robson Marinho ahora cita su regreso al TCE-SP en 2021; se neutralizaron los resúmenes.',
    },
  },
  {
    date: '2026-11-17',
    scheme: 'esquema_lava_jato',
    kind: 'atualizacao',
    summary:
      'Revisão do caso: o vínculo de José Dirceu passou de "Condenados (cabe recurso)" para "Condenações anuladas", porque o STF anulou em 2024 atos de duas ações penais contra ele (o texto anterior dizia que a pena estava prescrita); a fonte do vínculo de Renato Duque passou a registrar o julgamento interrompido no STF em novembro de 2025; a multa da Odebrecht passou a citar a decisão do STF de 2023 sobre as provas do acordo.',
    translations: {
      en: 'Case review: José Dirceu\'s link moved from "Convicted (subject to appeal)" to "Convictions annulled", because the STF annulled acts in two criminal cases against him in 2024 (the previous text said the sentence was time-barred); the source for Renato Duque\'s link now records the STF ruling interrupted in November 2025; the Odebrecht fine now cites the STF\'s 2023 decision on the evidence from the agreement.',
      es: 'Revisión del caso: el vínculo de José Dirceu pasó de "Condenados (cabe recurso)" a "Condenas anuladas", porque el STF anuló en 2024 actos de dos procesos penales contra él (el texto anterior decía que la pena había prescrito); la fuente del vínculo de Renato Duque ahora registra el juicio interrumpido en el STF en noviembre de 2025; la multa de Odebrecht ahora cita la decisión del STF de 2023 sobre las pruebas del acuerdo.',
    },
  },
  {
    date: '2026-11-17',
    scheme: 'esquema_operacao_zelotes',
    kind: 'correcao',
    summary:
      'Revisão do caso: os vínculos de José Ricardo da Silva e da MMC passaram de "Sob investigação" para "Absolvidos", com a decisão do TRF-1 de 2020, que condenou por advocacia administrativa o ex-diretor do Senado Fernando Mesquita; o do Bradesco passou a registrar o arquivamento da ação contra seu presidente em 2017; o de Guido Mantega passou a explicar que a ação foi encerrada por prescrição em 2025, o que não é absolvição; cifras atribuídas a pessoas e empresas sem fonte específica foram retiradas; resumos foram neutralizados. O vínculo direto da consultoria S3 Gestão com o esquema, sem fonte que o sustentasse, foi retirado.',
    translations: {
      en: 'Case review: the links of José Ricardo da Silva and MMC moved from "Under investigation" to "Acquitted", with the 2020 TRF-1 decision, which convicted former Senate director Fernando Mesquita of advocacia administrativa; Bradesco\'s now records the 2017 closure of the case against its chairman; Guido Mantega\'s link now explains that the case was closed as time-barred in 2025, which is not an acquittal; figures attributed to people and companies without a specific source were removed; summaries were made neutral. The direct link between the consultancy S3 Gestão and the scheme, which had no supporting source, was removed.',
      es: 'Revisión del caso: los vínculos de José Ricardo da Silva y de MMC pasaron de "En investigación" a "Absueltos", con la decisión del TRF-1 de 2020, que condenó por advocacia administrativa al exdirector del Senado Fernando Mesquita; el de Bradesco ahora registra el archivo del proceso contra su presidente en 2017; el de Guido Mantega ahora explica que el proceso se cerró por prescripción en 2025, lo que no es una absolución; se retiraron cifras atribuidas a personas y empresas sin fuente específica; se neutralizaron los resúmenes. Se retiró el vínculo directo de la consultora S3 Gestão con la trama, que no tenía fuente que lo sostuviera.',
    },
  },
  {
    date: '2026-11-17',
    scheme: 'esquema_operacao_greenfield',
    kind: 'correcao',
    summary:
      'Revisão do caso: Guilherme Lacerda, João Vaccari Neto e Carlos Caser passaram a ter o registro de que se tornaram réus em 2017, com fonte própria; os vínculos de Joesley e Wesley Batista passaram de "Fatos documentados" para "Sob investigação" e deixaram de atribuir a eles o acordo de leniência de R$ 10,3 bilhões, que é da empresa J&F; o bloqueio global de R$ 8 bilhões deixou de ser atribuído à Funcef e à Petros; foi incluída a revisão da multa da J&F; resumos foram neutralizados. Geddel Vieira Lima e o PMDB saíram do grafo do caso, porque as fontes lidas não registram investigação formal de Geddel na Greenfield.',
    translations: {
      en: 'Case review: Guilherme Lacerda, João Vaccari Neto and Carlos Caser now record that they became defendants in 2017, with their own source; the links for Joesley and Wesley Batista moved from "Documented facts" to "Under investigation" and no longer attribute to them the R$ 10.3 billion leniency agreement, which belongs to the company J&F; the global R$ 8 billion asset freeze is no longer attributed to Funcef and Petros; the review of J&F\'s fine was added; summaries were made neutral. Geddel Vieira Lima and the PMDB were removed from the case graph, because the sources read record no formal investigation of Geddel in Greenfield.',
      es: 'Revisión del caso: Guilherme Lacerda, João Vaccari Neto y Carlos Caser ahora registran que pasaron a ser acusados en 2017, con fuente propia; los vínculos de Joesley y Wesley Batista pasaron de "Hechos documentados" a "En investigación" y dejaron de atribuirles el acuerdo de clemencia de 10.300 millones de reales, que es de la empresa J&F; el bloqueo global de 8.000 millones dejó de atribuirse a Funcef y Petros; se añadió la revisión de la multa de J&F; se neutralizaron los resúmenes. Geddel Vieira Lima y el PMDB salieron del grafo del caso, porque las fuentes consultadas no registran ninguna investigación formal de Geddel en Greenfield.',
    },
  },
  {
    date: '2026-11-17',
    scheme: 'esquema_jbs_mala_rocha_loures',
    kind: 'correcao',
    summary:
      'Revisão do caso: o dossiê dizia que Rodrigo Rocha Loures foi absolvido no caso da mala, o que não foi localizado em nenhuma fonte; o texto passou a dizer que a sentença não foi localizada. O vínculo de Michel Temer passou a citar o arquivamento pelo TRF-1 em 2021 e a decisão do ministro Fachin de 2024; o de Aécio Neves, a absolvição de 2022 confirmada pelo TRF-3; a cifra de Joesley Batista passou a ser a das doações declaradas na delação, como alegação do colaborador; resumos foram neutralizados.',
    translations: {
      en: 'Case review: the dossier said Rodrigo Rocha Loures had been acquitted in the bag case, which was not found in any source; the text now says the judgment was not found. Michel Temer\'s link now cites the TRF-1\'s closure of the case in 2021 and Justice Fachin\'s 2024 decision; Aécio Neves\'s, the 2022 acquittal upheld by the TRF-3; Joesley Batista\'s figure is now the donations declared in his plea deal, as a cooperating witness\'s allegation; summaries were made neutral.',
      es: 'Revisión del caso: el dosier decía que Rodrigo Rocha Loures había sido absuelto en el caso de la maleta, algo que no se localizó en ninguna fuente; el texto ahora dice que no se ha localizado la sentencia. El vínculo de Michel Temer ahora cita el archivo del TRF-1 en 2021 y la decisión del magistrado Fachin de 2024; el de Aécio Neves, la absolución de 2022 confirmada por el TRF-3; la cifra de Joesley Batista pasa a ser la de las donaciones declaradas en la delación, como alegación del delator; se neutralizaron los resúmenes.',
    },
  },
  {
    date: '2026-11-17',
    scheme: 'esquema_operacao_cadeia_velha',
    kind: 'correcao',
    summary:
      'Revisão do caso: os vínculos de Paulo Melo e Edson Albertassi passaram de "Absolvidos" para "Condenações anuladas", porque o arquivamento de 2023 foi da ação de improbidade, não da ação penal, cujos atos decisórios o TRF-2 anulou em 2022; o dossiê dizia que as acusações penais tinham sido arquivadas. Os vínculos de Picciani, Barata Filho, Lélis Teixeira e Felipe Picciani passaram a ter o ano e a fonte da anulação; as cifras passaram a ser identificadas como alegações da acusação.',
    translations: {
      en: 'Case review: the links of Paulo Melo and Edson Albertassi moved from "Acquitted" to "Convictions annulled", because the 2023 closure concerned the administrative misconduct suit, not the criminal case, whose decisions the TRF-2 annulled in 2022; the dossier said the criminal charges had been dropped. The links of Picciani, Barata Filho, Lélis Teixeira and Felipe Picciani now carry the year and source of the annulment; the figures are now identified as prosecution allegations.',
      es: 'Revisión del caso: los vínculos de Paulo Melo y Edson Albertassi pasaron de "Absueltos" a "Condenas anuladas", porque el archivo de 2023 fue de la acción de improbidad, no del proceso penal, cuyos actos decisorios anuló el TRF-2 en 2022; el dosier decía que se habían archivado las acusaciones penales. Los vínculos de Picciani, Barata Filho, Lélis Teixeira y Felipe Picciani ahora tienen el año y la fuente de la anulación; las cifras pasan a identificarse como alegaciones de la acusación.',
    },
  },
  {
    date: '2026-11-17',
    scheme: 'esquema_caso_queiroz_rachadinhas',
    kind: 'correcao',
    summary:
      'Revisão do caso: o dossiê dizia que a denúncia foi anulada; o TJ-RJ a rejeitou por falta de justa causa em 2022, a pedido do MP, sem impedir nova investigação, e em 2025 o ministro Gilmar Mendes negou recursos para reabrir o caso. As cifras de desvio saíram dos vínculos de pessoas e foram mantidas no dossiê como alegações da acusação; o resumo de Flávio Bolsonaro deixou de citar a acusação.',
    translations: {
      en: 'Case review: the dossier said the indictment had been annulled; the TJ-RJ rejected it for lack of just cause in 2022, at the prosecutors\' request, without ruling out a new investigation, and in 2025 Justice Gilmar Mendes rejected appeals to reopen the case. The embezzlement figures were removed from the links of individuals and kept in the dossier as prosecution allegations; Flávio Bolsonaro\'s summary no longer mentions the accusation.',
      es: 'Revisión del caso: el dosier decía que la acusación había sido anulada; el TJ-RJ la rechazó por falta de causa justa en 2022, a petición de la Fiscalía, sin impedir una nueva investigación, y en 2025 el magistrado Gilmar Mendes rechazó recursos para reabrir el caso. Las cifras de desvío salieron de los vínculos de personas y se mantuvieron en el dosier como alegaciones de la acusación; el resumen de Flávio Bolsonaro dejó de citar la acusación.',
    },
  },
  {
    date: '2026-11-17',
    scheme: 'esquema_laranjas_do_psl',
    kind: 'atualizacao',
    summary:
      'Revisão do caso: os vínculos de Marcelo Álvaro Antônio, Mateus Von Rondon e Roberto Soares passaram de "Sob investigação" para "Absolvidos", porque o ministro Gilmar Mendes arquivou o inquérito em junho de 2026 (convenção do projeto para arquivamento); o de Maria de Lourdes Paixão, pela absolvição na Justiça Eleitoral em 2022. O de Luciano Bivar passou a registrar que, segundo a defesa, ele não foi denunciado. O dossiê dizia que as acusações seguiam em tramitação.',
    translations: {
      en: 'Case review: the links of Marcelo Álvaro Antônio, Mateus Von Rondon and Roberto Soares moved from "Under investigation" to "Acquitted", because Justice Gilmar Mendes closed the investigation in June 2026 (the project\'s convention for closed investigations); Maria de Lourdes Paixão\'s, for her acquittal by the Electoral Courts in 2022. Luciano Bivar\'s now records that, according to his defence, he was not charged. The dossier said the charges were still pending.',
      es: 'Revisión del caso: los vínculos de Marcelo Álvaro Antônio, Mateus Von Rondon y Roberto Soares pasaron de "En investigación" a "Absueltos", porque el magistrado Gilmar Mendes archivó la investigación en junio de 2026 (convención del proyecto para los archivos); el de Maria de Lourdes Paixão, por su absolución en la Justicia Electoral en 2022. El de Luciano Bivar ahora registra que, según su defensa, no fue acusado. El dosier decía que las acusaciones seguían en trámite.',
    },
  },
  {
    date: '2026-11-17',
    scheme: 'esquema_operacao_placebo',
    kind: 'correcao',
    summary:
      'Revisão do caso: os vínculos de Wilson Witzel e Helena Witzel passaram a registrar que se tornaram réus em junho de 2021, com fonte própria; cifras da acusação atribuídas a pessoas e à Iabas saíram dos vínculos; textos que tratavam suspeitas como fatos passaram a identificá-las como acusações e a registrar quando a posição da defesa não foi localizada; resumos foram neutralizados.',
    translations: {
      en: 'Case review: the links of Wilson Witzel and Helena Witzel now record that they became defendants in 2021, with their own source; prosecution figures attributed to individuals and to Iabas were removed from the links; texts that treated suspicions as facts now identify them as accusations and note when the defence position was not found; summaries were made neutral.',
      es: 'Revisión del caso: los vínculos de Wilson Witzel y Helena Witzel ahora registran que pasaron a ser acusados en 2021, con fuente propia; las cifras de la acusación atribuidas a personas y a Iabas salieron de los vínculos; los textos que trataban sospechas como hechos ahora las identifican como acusaciones y señalan cuándo no se localizó la posición de la defensa; se neutralizaron los resúmenes.',
    },
  },
  {
    date: '2026-11-17',
    scheme: 'esquema_orcamento_secreto_rp9',
    kind: 'correcao',
    summary:
      'Revisão do caso: o vínculo de Arthur Lira passou de "Sob investigação" para "Fatos documentados", porque não foi localizado registro de investigação formal contra ele; o texto registra a acareação autorizada pelo ministro Flávio Dino em 2026 e a resposta da assessoria de Lira. A cifra de R$ 53 bilhões saiu do vínculo de Jair Bolsonaro e ficou no dossiê como total de dotações, sem equivaler a desvio; as notas das cifras da Operação Quebra Ossos passaram a dizer o que medem. A Codevasf saiu do grafo do caso: seu vínculo tinha status de investigação e cifra de R$ 1,4 bilhão sem fonte que os sustentasse.',
    translations: {
      en: 'Case review: Arthur Lira\'s link moved from "Under investigation" to "Documented facts", because no record of a formal investigation of him was found; the text records the confrontation authorised by Justice Flávio Dino in 2026 and the response of Lira\'s office. The R$ 53 billion figure was removed from Jair Bolsonaro\'s link and kept in the dossier as total allocations, not embezzlement; the notes on the Operation Quebra Ossos figures now state what they measure. Codevasf was removed from the case graph: its link had an investigation status and a R$ 1.4 billion figure with no supporting source.',
      es: 'Revisión del caso: el vínculo de Arthur Lira pasó de "En investigación" a "Hechos documentados", porque no se ha localizado registro de una investigación formal contra él; el texto registra el careo autorizado por el magistrado Flávio Dino en 2026 y la respuesta de la oficina de Lira. La cifra de 53.000 millones de reales salió del vínculo de Jair Bolsonaro y quedó en el dosier como total de dotaciones, sin equivaler a desvío; las notas de las cifras de la Operación Quebra Ossos ahora dicen qué miden. Codevasf salió del grafo del caso: su vínculo tenía estado de investigación y una cifra de 1.400 millones de reales sin fuente que los sostuviera.',
    },
  },
  {
    date: '2026-11-17',
    scheme: 'esquema_bolsolao_do_mec',
    kind: 'correcao',
    summary:
      'Revisão do caso: o vínculo do prefeito Gilberto Braga passou de "Sob investigação" para "Fatos documentados", porque ele relatou o pedido de propina e não é acusado; o do FNDE também passou para "Fatos documentados", sem acusação à autarquia. O vínculo de Milton Ribeiro passou a ter fonte sobre a abertura do inquérito pelo STF; o de Luciano Musse, a distinguir a punição administrativa da CGU do processo penal, sem desfecho localizado.',
    translations: {
      en: 'Case review: Mayor Gilberto Braga\'s link moved from "Under investigation" to "Documented facts", because he reported the bribe request and is not accused; the FNDE\'s link also moved to "Documented facts", with no accusation against the agency. Milton Ribeiro\'s link now has a source on the opening of the STF investigation; Luciano Musse\'s now distinguishes the CGU\'s administrative penalty from the criminal case, with no outcome found.',
      es: 'Revisión del caso: el vínculo del alcalde Gilberto Braga pasó de "En investigación" a "Hechos documentados", porque denunció la petición de soborno y no está acusado; el del FNDE también pasó a "Hechos documentados", sin acusación al organismo. El vínculo de Milton Ribeiro ahora tiene una fuente sobre la apertura de la investigación en el STF; el de Luciano Musse ahora distingue la sanción administrativa de la CGU del proceso penal, sin desenlace localizado.',
    },
  },
  {
    date: '2026-11-17',
    scheme: 'esquema_operacao_venire_joias_presidencia',
    kind: 'atualizacao',
    summary:
      'Revisão do caso: o dossiê passou a registrar o arquivamento, em março de 2025, do inquérito do cartão de vacinação em relação a Jair Bolsonaro e o pedido de arquivamento do inquérito das joias feito pela PGR em março de 2026; dizia que os inquéritos aguardavam decisão sobre denúncia. Cifras atribuídas a pessoas foram retiradas dos vínculos; a fonte de baixa qualidade saiu da lista; resumos foram neutralizados.',
    translations: {
      en: 'Case review: the dossier now records the closure, in March 2025, of the vaccination card investigation with respect to Jair Bolsonaro and the PGR\'s request in March 2026 to close the jewellery investigation; it previously said the investigations were awaiting a decision on charges. Figures attributed to individuals were removed from the links; the low-quality source was removed from the list; summaries were made neutral.',
      es: 'Revisión del caso: el dosier ahora registra el archivo, en marzo de 2025, de la investigación de la cartilla de vacunación respecto a Jair Bolsonaro y la petición de la PGR, en marzo de 2026, de archivar la investigación de las joyas; antes decía que las investigaciones esperaban una decisión sobre la acusación. Se retiraron de los vínculos las cifras atribuidas a personas; la fuente de baja calidad salió de la lista; se neutralizaron los resúmenes.',
    },
  },
  {
    date: '2026-11-17',
    scheme: 'esquema_inss_sem_desconto',
    kind: 'correcao',
    summary:
      'Revisão do caso: a fonte do vínculo de Antônio Carlos Camilo Antunes foi trocada por reportagem do G1 sobre o relatório da PF de julho de 2026, que lista os 48 indiciados, e a reportagem passou a constar entre as fontes do dossiê.',
    translations: {
      en: 'Case review: the source for Antônio Carlos Camilo Antunes\'s link was replaced with a G1 report on the July 2026 Federal Police report, which lists the 48 people named as suspects, and the report was added to the dossier\'s sources.',
      es: 'Revisión del caso: la fuente del vínculo de Antônio Carlos Camilo Antunes se sustituyó por un reportaje de G1 sobre el informe de la Policía Federal de julio de 2026, que enumera a los 48 imputados, y el reportaje se añadió a las fuentes del dosier.',
    },
  },
  {
    date: '2026-11-17',
    scheme: 'esquema_banco_master_inss',
    kind: 'correcao',
    summary:
      'Retirados do grafo do caso: Edson Yamada, cujo vínculo vinha de uma única fonte que não o sustentava, sem investigação formal dele no caso Master localizada; o senador Carlos Viana e o Podemos, que apareciam porque ele preside a CPMI que investiga o caso, o que não é envolvimento; e Ibaneis Rocha e o vínculo do MDB com o caso, porque não há investigação formal aberta contra ele (o pedido da oposição foi encaminhado pelo STJ à PGR). O infográfico de valores somava cifras que se sobrepõem, como o total de carteiras cedidas ao BRB, a parte apontada como fraude e o valor retido pelo INSS, e chegou a exibir R$ 59,4 bilhões; passou a exibir R$ 12 bilhões, o mínimo de fraude apontado pela PF.',
    translations: {
      en: 'Removed from the case graph: Edson Yamada, whose link rested on a single source that did not support it, with no formal investigation of him in the Master case found; Senator Carlos Viana and the Podemos party, which appeared because he chairs the joint parliamentary inquiry (CPMI) investigating the case, which is not involvement; and Ibaneis Rocha and the MDB\'s link to the case, because no formal investigation has been opened against him (the opposition\'s request was forwarded by the STJ to the PGR). The amounts infographic was adding up overlapping figures, such as the total portfolios assigned to BRB, the share identified as fraud and the amount withheld by the INSS, and showed as much as R$ 59.4 billion; it now shows R$ 12 billion, the minimum fraud identified by the Federal Police.',
      es: 'Retirados del grafo del caso: Edson Yamada, cuyo vínculo se basaba en una única fuente que no lo sustentaba, sin que se haya localizado una investigación formal sobre él en el caso Master; el senador Carlos Viana y el partido Podemos, que aparecían porque él preside la comisión parlamentaria mixta de investigación (CPMI) que investiga el caso, lo que no es implicación; e Ibaneis Rocha y el vínculo del MDB con el caso, porque no hay investigación formal abierta contra él (la petición de la oposición fue remitida por el STJ a la PGR). La infografía de importes sumaba cifras que se solapan, como el total de carteras cedidas al BRB, la parte señalada como fraude y el importe retenido por el INSS, y llegó a mostrar 59.400 millones de reales; ahora muestra 12.000 millones, el mínimo de fraude señalado por la Policía Federal.',
    },
  },
  {
    date: '2026-11-17',
    scheme: 'esquema_banco_master_inss',
    kind: 'correcao',
    summary:
      'Revisão completa do caso. Ibaneis Rocha constava como "Sob investigação"; não foi localizada investigação formal aberta (o STJ apenas encaminhou à PGR um pedido da oposição), e o vínculo passou a "Fatos documentados", com a negativa dele. O vínculo do BRB também passou de "Sob investigação" a "Fatos documentados": as fontes tratam o banco como a parte lesada, e os indiciados são pessoas. O impacto citava R$ 12,2 bilhões e uma projeção de até R$ 51 bilhões sem fonte verificada; a cifra de R$ 51 bilhões foi retirada, e o texto passou a usar os números do relatório da PF: R$ 17,5 bilhões em carteiras cedidas ao BRB, fraude em pelo menos R$ 12 bilhões e prejuízo mínimo de R$ 2,7 bilhões. Fontes fracas (Brasil Paralelo, Sintrajufe, ND Mais, Gazeta do Paraná) foram substituídas, o ano da saída de Augusto Lima do Master foi corrigido para 2024 e os resumos das pessoas deixaram de citar estágio processual. Foi registrada a liquidação do Master pelo Banco Central, em 18/11/2025.',
    translations: {
      en: 'Full review of the case. Ibaneis Rocha was listed as "Under investigation"; no formal investigation was found (the STJ only forwarded an opposition request to the PGR), and the link is now "Documented facts", with his denial. BRB\'s link has also moved from "Under investigation" to "Documented facts": the sources treat the bank as the injured party, and those named as suspects are individuals. The impact section cited R$ 12.2 billion and an unverified projection of up to R$ 51 billion; the R$ 51 billion figure has been removed and the text now uses the Federal Police report\'s figures: R$ 17.5 billion in portfolios assigned to BRB, fraud in at least R$ 12 billion and a minimum loss of R$ 2.7 billion. Weak sources (Brasil Paralelo, Sintrajufe, ND Mais, Gazeta do Paraná) were replaced, the year Augusto Lima left Master was corrected to 2024 and the summaries of the people involved no longer mention procedural stages. The Central Bank\'s liquidation of Master on 18 November 2025 has been recorded.',
      es: 'Revisión completa del caso. Ibaneis Rocha figuraba como "En investigación"; no se localizó ninguna investigación formal abierta (el STJ solo remitió a la PGR una petición de la oposición), y el vínculo pasó a "Hechos documentados", con su negativa. El vínculo del BRB también pasó de "En investigación" a "Hechos documentados": las fuentes tratan al banco como la parte perjudicada, y los imputados son personas. El impacto citaba 12.200 millones de reales y una proyección de hasta 51.000 millones sin fuente verificada; la cifra de 51.000 millones se ha retirado y el texto usa ahora los datos del informe de la Policía Federal: 17.500 millones de reales en carteras cedidas al BRB, fraude en al menos 12.000 millones y un perjuicio mínimo de 2.700 millones. Se sustituyeron fuentes débiles (Brasil Paralelo, Sintrajufe, ND Mais, Gazeta do Paraná), se corrigió a 2024 el año de la salida de Augusto Lima del Master y los resúmenes de las personas dejaron de mencionar etapas procesales. Se registró la liquidación del Master por el Banco Central el 18 de noviembre de 2025.',
    },
  },
  {
    date: '2026-11-17',
    scheme: 'esquema_banco_master_inss',
    kind: 'atualizacao',
    summary:
      'Situação jurídica atualizada até 17/11/2026: a PGR defendeu no STF, em 11/11/2026, a manutenção da prisão preventiva de Daniel Vorcaro; Paulo Henrique Costa está preso desde abril de 2026, e o vínculo dele passou a trazer o indiciamento e a posição da defesa; o INSS retinha, em janeiro de 2026, cerca de R$ 2 bilhões de 254 mil contratos de consignado do Master; Augusto Lima foi registrado como criador do Credcesta, em 2018. Até esta data não foi localizada denúncia da PGR.',
    translations: {
      en: 'Legal status updated to 17 November 2026: on 11 November 2026 the PGR told the STF that Daniel Vorcaro should remain in pre-trial detention; Paulo Henrique Costa has been in custody since April 2026, and his link now records the police report and his defence\'s position; in January 2026 the INSS was withholding about R$ 2 billion from 254,000 Master payroll-loan contracts; Augusto Lima has been recorded as the creator of Credcesta, in 2018. No PGR indictment had been found by this date.',
      es: 'Situación jurídica actualizada a 17 de noviembre de 2026: el 11 de noviembre de 2026 la PGR defendió ante el STF que Daniel Vorcaro siga en prisión preventiva; Paulo Henrique Costa está en prisión desde abril de 2026, y su vínculo recoge ahora la imputación y la posición de su defensa; en enero de 2026 el INSS retenía cerca de 2.000 millones de reales de 254.000 contratos de préstamos del Master; se registró a Augusto Lima como creador de Credcesta, en 2018. Hasta esa fecha no se había localizado ninguna acusación de la PGR.',
    },
  },
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
