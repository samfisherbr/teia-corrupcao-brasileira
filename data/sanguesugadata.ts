import { GraphData } from '../types/graph';

export const INITIAL_DATA: GraphData = {
  nodes: [
    {
      id: "esquema_sanguessugas",
      label: "Operação Sanguessuga (Máfia das Ambulâncias)",
      type: "scheme",
      party: "N/A",
      image_url: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=300&q=80",
      summary: "Esquema criminoso articulado entre empresários, parlamentares e servidores federais para superfaturar ambulâncias adquiridas com verbas de emendas orçamentárias."
    },
    {
      id: "emp_planam",
      label: "Grupo Planam (Planam Comércio e Representação Ltda.)",
      type: "company",
      party: "N/A",
      image_url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=300&q=80",
      summary: "Empresa de Mato Grosso que liderava o consórcio de firmas de fachada para vencer licitações direcionadas e pagar propina a agentes públicos."
    },
    {
      id: "emp_luiz_vedoin",
      label: "Luiz Antônio Trevisan Vedoin",
      type: "company",
      party: "N/A",
      image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
      summary: "Empresário apontado como um dos mentores e operadores do esquema, responsável pelos acordos de propina e colaboração com as investigações federais."
    },
    {
      id: "emp_darci_vedoin",
      label: "Darci José Vedoin",
      type: "company",
      party: "N/A",
      image_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
      summary: "Patriarca da família Vedoin, criador da estrutura empresarial utilizada no superfaturamento de licitações hospitalares."
    },
    {
      id: "pol_penha_lino",
      label: "Maria da Penha Lino",
      type: "politician",
      party: "N/A",
      image_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80",
      summary: "Servidora apontada como o braço do esquema no Ministério da Saúde, responsável por acelerar a liberação de emendas mediante vantagens indevidas."
    },
    {
      id: "pol_lino_rossi",
      label: "Lino Rossi",
      type: "politician",
      party: "PP",
      image_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80",
      summary: "Deputado apontado nas apurações como um dos principais cooptadores de parlamentares para a destinação de emendas ao esquema da Planam."
    },
    {
      id: "pol_nilton_capixaba",
      label: "Nilton Balbino (Nilton Capixaba)",
      type: "politician",
      party: "PTB",
      image_url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80",
      summary: "Parlamentar condenado pelo STF a pena de reclusão por envolvimento e recebimento de propinas do esquema das ambulâncias."
    },
    {
      id: "pol_cabo_julio",
      label: "Júlio César Gomes dos Santos (Cabo Júlio)",
      type: "politician",
      party: "PMDB",
      image_url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80",
      summary: "Ex-parlamentar condenado pela Justiça Federal por atos de improbidade e corrupção passiva vinculados às emendas da Planam."
    },
    {
      id: "pol_ney_suassuna",
      label: "Ney Suassuna",
      type: "politician",
      party: "PMDB",
      image_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
      summary: "Investigado na CPI e em inquéritos judiciais devido ao envolvimento de assessores; foi absolvido no Conselho de Ética do Senado por ausência de provas."
    },
    {
      id: "party_pp",
      label: "Partido Progressista (PP)",
      type: "party",
      party: "PP",
      image_url: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=300&q=80",
      summary: "Partidário de parlamentares investigados e citados na CPI das Ambulâncias por destinação de emendas superfaturadas."
    },
    {
      id: "party_ptb",
      label: "Partido Trabalhista Brasileiro (PTB)",
      type: "party",
      party: "PTB",
      image_url: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=300&q=80",
      summary: "Agremiação com diversos parlamentares citados na comissão parlamentar e processados por envolvimento no caso."
    }
  ],
  links: [
    {
      id: 1,
      source: "emp_luiz_vedoin",
      target: "esquema_sanguessugas",
      relation: "Réu confesso e operador financeiro do esquema de propinas",
      status: "confirmed",
      amount: "R$ 110.000.000",
      year: 2001,
      source_url: "https://www.congressoemfoco.com.br/noticia/62450/juiz-condena-mentores-da-mafia-dos-sanguessugas"
    },
    {
      id: 2,
      source: "emp_darci_vedoin",
      target: "emp_planam",
      relation: "Proprietário e organizador da rede de empresas para fraudes licitatórias",
      status: "confirmed",
      amount: "R$ 110.000.000",
      year: 2001,
      source_url: "https://www.congressoemfoco.com.br/noticia/62450/juiz-condena-mentores-da-mafia-dos-sanguessugas"
    },
    {
      id: 3,
      source: "pol_penha_lino",
      target: "esquema_sanguessugas",
      relation: "Recebeu propina para facilitar a liberação de recursos orçamentários no Ministério da Saúde",
      status: "confirmed",
      amount: "R$ 110.000.000",
      year: 2003,
      source_url: "https://www.olhardireto.com.br/noticias/pivo-de-escandalo-sanguessuga-ex-servidora-do-ministerio-da-saude-e-condenada-por-corrupcao-mas-se-livra-da-maioria-das-acusacoes"
    },
    {
      id: 4,
      source: "pol_lino_rossi",
      target: "esquema_sanguessugas",
      relation: "Acusado de intermediar o esquema e receber vantagem indevida em emendas",
      status: "confirmed",
      amount: "R$ 3.040.000",
      year: 2000,
      source_url: "https://www1.folha.uol.com.br/folha/brasil/ult96u81266.shtml"
    },
    {
      id: 5,
      source: "pol_nilton_capixaba",
      target: "esquema_sanguessugas",
      relation: "Condenado por corrupção passiva e recebimento de propina por emissão de emendas",
      status: "confirmed",
      amount: "Não especificado",
      year: 2001,
      source_url: "https://www.congressoemfoco.com.br/noticia/33009/stf-determina-execucao-de-pena-de-deputado-condenado-a-prisao-na-mafia-das-ambulancias"
    },
    {
      id: 6,
      source: "pol_cabo_julio",
      target: "esquema_sanguessugas",
      relation: "Condenado por improbidade e corrupção em fraude licitatória",
      status: "confirmed",
      amount: "R$ 100.000",
      year: 2002,
      source_url: "https://g1.globo.com/mg/minas-gerais/noticia/deputado-cabo-julio-tem-prisao-determina-em-processo-da-mafia-dos-sanguessugas.ghtml"
    },
    {
      id: 7,
      source: "pol_ney_suassuna",
      target: "esquema_sanguessugas",
      relation: "Citado em investigações sobre atuação de assessores; absolvido politicamente e na Justiça",
      status: "acquitted",
      amount: "N/A",
      year: 2006,
      source_url: "https://imirante.com/noticias/brasil/amp/2006/11/28/senado-absolve-tres-acusados-de-ligacao-com-sanguessugas"
    },
    {
      id: 8,
      source: "pol_lino_rossi",
      target: "party_pp",
      relation: "Filiado à legenda durante o período dos fatos",
      status: "confirmed",
      amount: "N/A",
      year: 2006,
      source_url: "https://www1.folha.uol.com.br/folha/brasil/ult96u81266.shtml"
    },
    {
      id: 9,
      source: "pol_nilton_capixaba",
      target: "party_ptb",
      relation: "Filiado à legenda durante a apuração dos fatos",
      status: "confirmed",
      amount: "N/A",
      year: 2006,
      source_url: "https://www.congressoemfoco.com.br/noticia/33792/stf-condena-deputado-nilton-capixaba-a-seis-anos-de-prisao-por-envolvimento-na-mafia-dos-sanguessugas"
    }
  ]
};
