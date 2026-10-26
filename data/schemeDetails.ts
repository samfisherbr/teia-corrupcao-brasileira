export interface SchemeDetail {
  context: string;
  mechanism: string;
  impact: string;
  legalStatus: string;
  sources: { title: string; url: string }[];
}

export const SCHEME_DETAILS: Record<string, SchemeDetail> = {
  esquema_sanguessugas: {
    context:
      'A Operação Sanguessuga (Máfia das Ambulâncias) foi deflagrada pela Polícia Federal em 2006 para desarticular uma quadrilha envolvida na aquisição superfaturada de ambulâncias e equipamentos médicos no Brasil.',
    mechanism:
      'Empresários do Grupo Planam acertavam a destinação de emendas parlamentares com deputados e senadores. Os parlamentares direcionavam verbas do orçamento da saúde para municípios específicos, onde licitações eram fraudadas e direcionadas para as empresas do grupo.',
    impact: 'R$ 110.000.000 (Estimado em superfaturamento de emendas)',
    legalStatus:
      'Condenações mantidas pelo STF e Justiça Federal para os mentores empresariais e parlamentares envolvidos, com perda de mandato e ressarcimento ao erário.',
    sources: [
      {
        title: 'Wikipédia – Escândalo dos Sanguessugas',
        url: 'https://pt.wikipedia.org/wiki/Esc%C3%A2ndalo_dos_Sanguessugas'
      },
      {
        title: 'G1 – Entenda a CPI dos Sanguessugas',
        url: 'https://g1.globo.com/Noticias/Politica/0,,AA1251927-5601,00.html'
      }
    ]
  },

  esquema_mensalao: {
    context:
      "O Escândalo do Mensalão estourou em 2005 durante o primeiro mandato do governo Luiz Inácio Lula da Silva, a partir de denúncias do então deputado federal Roberto Jefferson. Tratou-se de um amplo esquema de cooptação política no Congresso Nacional, com a compra de apoio parlamentar de diversos partidos para a aprovação de projetos de interesse do Poder Executivo, financiado por recursos públicos e valerioduto de publicidade.",
    mechanism:
      "O esquema operava por meio da utilização de contratos de publicidade da administração pública e de empresas estatais com agências de publicidade do empresário Marcos Valério (como a SMP&B e a DNA Propaganda). Recursos provenientes dessas agências, somados a empréstimos bancários fictícios ou fraudulentos (em instituições como o Banco Rural e BMG), eram repassados periodicamente a parlamentares e dirigentes partidários em troca de sustentação e votos em matérias legislativas de interesse do governo.",
    impact:
      "R$ 101.600.000 (Valores repassados e movimentados ilegalmente apurados no âmbito da Ação Penal 470)",
    legalStatus:
      "A apuração principal culminou no julgamento do STF na Ação Penal 470 (AP 470), resultando na condenação de 24 réus por crimes como corrupção ativa, corrupção passiva, lavagem de dinheiro, peculato e formação de quadrilha, incluindo importantes figuras políticas e empresariais. Ao longo dos anos seguintes, diversos condenados cumpriram penas e tiveram suas penas extintas ou perdoadas por indutos presidenciais.",
    sources: [
      {
        title: "Julgamento da Ação Penal 470 - Supremo Tribunal Federal (STF)",
        url: "https://noticias.stf.jus.br/postsnoticias/cronologia-do-inquerito-do-mensalao-no-stf/"
      },
      {
        title: "Memória e Histórico das Investigações do Mensalão - Ministério Público Federal (MPF)",
        url: "https://linhadotempo.mpf.mp.br/www/linha-do-tempo/2006"
      }
    ]
  }
};