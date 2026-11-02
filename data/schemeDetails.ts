export interface SchemeDetail {
  context: string;
  mechanism: string;
  impact: string;
  legalStatus: string;
  sources: { title: string; url: string }[];
}

export const SCHEME_DETAILS: Record<string, SchemeDetail> = {
  esquema_pc_farias: {
    context: "O Esquema PC Farias estruturou-se durante a campanha presidencial de 1989 e consolidou-se ao longo do governo de Fernando Collor de Mello (1990–1992). Operado pelo ex-tesoureiro de campanha Paulo César Farias, o esquema montou um balcão paralelo de negócios no governo federal para extorquir empreiteiras e empresários privados em troca de facilidades contratuais, verbas orçamentárias e crédito público.",
    mechanism: "A rede funcionava por meio de cobrança de propina sobre obras públicas e liberação de verbas. Os recursos eram lavados através de empresas de fachada (como a EPC e a Brasil Jet) e movimentados em dezenas de contas bancárias em nome de pessoas fictícias ('fantasmas'), gerenciadas pela secretária Rosinete Melanias. O saldo financiava despesas pessoais e residenciais do presidente Fernando Collor e familiares, sob intermediação de seu secretário particular Cláudio Vieira.",
    impact: "US$ 88.000.000 a US$ 100.000.000 (Estimativa total de propinas e depósitos não contabilizados arrecadados pela CPI do PC durante o governo Collor)",
    legalStatus: "O escândalo resultou no impeachment e na renúncia de Fernando Collor em 1992, além da cassação de seus direitos políticos por 8 anos. Na esfera criminal, o STF absolveu Collor em 1994 (Ação Penal 307) por falta de provas de ato de ofício direto. PC Farias foi condenado por falsidade ideológica e sonegação fiscal em 1994. Em 1996, PC Farias foi encontrado morto em Maceió em circunstâncias controversas.",
    sources: [
      { title: "Esquema PC Farias - Wikipédia", url: "https://pt.wikipedia.org/wiki/Esquema_PC_Farias" },
      { title: "As acusações contra PC - Folha de S.Paulo", url: "https://www1.folha.uol.com.br/fsp/1996/6/24/brasil/11.html" },
      { title: "Relembre casos do governo Collor que envolveram PC Farias - G1", url: "https://g1.globo.com/politica/noticia/2013/05/relembre-casos-do-governo-collor-que-envolveram-pc-farias.html" },
      { title: "Supremo absolveu Collor e condenou PC a 7 anos - Folha de S.Paulo", url: "https://www1.folha.uol.com.br/fsp/1994/12/18/brasil/4.html" },
      { title: "STF condena PC, Bandeira e Rosinete - Folha de S.Paulo", url: "https://www1.folha.uol.com.br/fsp/1994/12/14/brasil/20.html" },
      { title: "PC pega quatro anos por sonegação - Folha de S.Paulo", url: "http://almanaque.folha.uol.com.br/brasil_08jan1994.htm" }
    ]
  },

  

};