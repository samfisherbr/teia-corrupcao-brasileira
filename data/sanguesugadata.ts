import { GraphData } from '../types/graph';

export const INITIAL_DATA: GraphData = {
  nodes: [
    {
      id: "pol_carlos_alves",
      label: "Sen. Carlos Alves",
      type: "politician",
      party: "PLD",
      status: "under_investigation",
      estimatedImpact: "$450,000,000",
      image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
      summary: "Allegedly coordinated the redirect of public infrastructure funds to shell companies between 2018–2022. Under active federal prosecution."
    },
    {
      id: "pol_alves_sub1",
      label: "SEN. ALVES",
      type: "politician",
      party: "PLD",
      image_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80",
      summary: "Regional coordinator involved in emenda allocations."
    },
    {
      id: "pol_alves_sub2",
      label: "SEN. ALVES",
      type: "politician",
      party: "PLD",
      image_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80",
      summary: "State deputy co-signing budget amendments."
    },
    {
      id: "pol_alves_sub3",
      label: "SEN. ALVES",
      type: "politician",
      party: "PLD",
      image_url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80",
      summary: "Key intermediary in congressional finance committee."
    },
    {
      id: "pol_alves_sub4",
      label: "SEN. ALVES",
      type: "politician",
      party: "PLD",
      image_url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80",
      summary: "Former municipal representative linked to kickback disbursements."
    },
    {
      id: "pol_alves_sub5",
      label: "SEN. ALVESS",
      type: "politician",
      party: "PLD",
      image_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
      summary: "Adviser to the finance minister on public works contracts."
    },
    {
      id: "pol_alves_sub6",
      label: "SEN. ALVES",
      type: "politician",
      party: "PLD",
      image_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
      summary: "Committee secretary overseeing infrastructure bids."
    },
    {
      id: "comp_construtora_x",
      label: "CONSTRUTORA X",
      type: "company",
      party: "N/A",
      image_url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=300&q=80",
      summary: "Primary infrastructure contractor receiving uncompetitive public works tenders."
    },
    {
      id: "comp_construtora_x2",
      label: "CONSTRUTORA X",
      type: "company",
      party: "N/A",
      image_url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=300&q=80",
      summary: "Secondary shell construction outfit."
    },
    {
      id: "comp_s",
      label: "COMPANIE S",
      type: "company",
      party: "N/A",
      image_url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=300&q=80",
      summary: "Offshore vehicle used for money laundering and asset concealment."
    },
    {
      id: "comp_cluster_bottom",
      label: "COMPANIES",
      type: "company",
      party: "N/A",
      image_url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=300&q=80",
      summary: "Consortium of sub-contracted shell entities."
    },
    {
      id: "scheme_desvio",
      label: "DESVIO DE VERBAS",
      type: "scheme",
      party: "N/A",
      image_url: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=300&q=80",
      summary: "Overbilling scheme involving healthcare and ambulance procurement."
    }
  ],
  links: [
    {
      id: 1,
      source: "pol_alves_sub1",
      target: "pol_carlos_alves",
      relation: "Direct Campaign Transfer",
      type: "direct_financing",
      status: "confirmed",
      amount: "R$ 45.000.000",
      year: 2016,
      source_url: "https://g1.globo.com"
    },
    {
      id: 2,
      source: "pol_alves_sub2",
      target: "pol_carlos_alves",
      relation: "Direct Party Financing",
      type: "direct_financing",
      status: "confirmed",
      amount: "R$ 12.000.000",
      year: 2017,
      source_url: "https://g1.globo.com"
    },
    {
      id: 3,
      source: "pol_alves_sub3",
      target: "pol_carlos_alves",
      relation: "Undeclared Cash Transfer",
      type: "direct_financing",
      status: "confirmed",
      amount: "R$ 8.500.000",
      year: 2018,
      source_url: "https://g1.globo.com"
    },
    {
      id: 4,
      source: "pol_alves_sub4",
      target: "pol_carlos_alves",
      relation: "Direct Campaign Grant",
      type: "direct_financing",
      status: "confirmed",
      amount: "R$ 22.000.000",
      year: 2019,
      source_url: "https://g1.globo.com"
    },
    {
      id: 5,
      source: "pol_alves_sub5",
      target: "pol_carlos_alves",
      relation: "Suspect Sub-account Wire",
      type: "suspect_transactions",
      status: "under_investigation",
      amount: "R$ 14.000.000",
      year: 2020,
      source_url: "https://g1.globo.com"
    },
    {
      id: 6,
      source: "pol_alves_sub6",
      target: "pol_carlos_alves",
      relation: "Direct Campaign Grant",
      type: "direct_financing",
      status: "confirmed",
      amount: "R$ 31.000.000",
      year: 2021,
      source_url: "https://g1.globo.com"
    },
    {
      id: 7,
      source: "pol_carlos_alves",
      target: "comp_construtora_x",
      relation: "Suspect Tender Award",
      type: "suspect_transactions",
      status: "under_investigation",
      amount: "R$ 210.000.000",
      year: 2018,
      source_url: "https://g1.globo.com"
    },
    {
      id: 8,
      source: "pol_carlos_alves",
      target: "scheme_desvio",
      relation: "Direct Fund Diversion",
      type: "direct_financing",
      status: "confirmed",
      amount: "R$ 450.000.000",
      year: 2022,
      source_url: "https://g1.globo.com"
    },
    {
      id: 9,
      source: "comp_construtora_x",
      target: "comp_construtora_x2",
      relation: "Suspect Sub-contract Transfer",
      type: "suspect_transactions",
      status: "under_investigation",
      amount: "R$ 95.000.000",
      year: 2021,
      source_url: "https://g1.globo.com"
    },
    {
      id: 10,
      source: "comp_construtora_x2",
      target: "comp_s",
      relation: "Direct Offshore Transfer",
      type: "direct_financing",
      status: "confirmed",
      amount: "R$ 130.000.000",
      year: 2022,
      source_url: "https://g1.globo.com"
    },
    {
      id: 11,
      source: "pol_carlos_alves",
      target: "comp_cluster_bottom",
      relation: "Suspect Kickback Flow",
      type: "suspect_transactions",
      status: "under_investigation",
      amount: "R$ 68.000.000",
      year: 2023,
      source_url: "https://g1.globo.com"
    }
  ]
};