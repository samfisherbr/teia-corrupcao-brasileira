1. TABELA DE ENTIDADES (NÓS / NODES):
Apresente uma tabela com as seguintes colunas exatas:
| id | label | type | party | summary | image_url |

Regras para os campos da Tabela de Entidades:
- id: Identificador único em minúsculas e sem espaços (ex: pol_fulano, partido_pt, empresa_planam, esquema_sanguessugas).
- label: Nome completo ou oficial da pessoa/instituição.
- type: Selecione EXATAMENTE um dos valores: politician | party | scheme | company
- party: Sigla oficial do partido (se for político) ou NULL.
- summary: Descrição curta e objetiva sobre a entidade e sua história.
- image_url: Link direto para imagem pública válida (Wikipedia/Commons ou portal governamental terminando em .jpg, .png, .svg) ou a palavra NULL (não invente links nem use svgs genéricos).

2. TABELA DE CONEXÕES E VÍNCULOS (LINKS):
Apresente uma tabela com as seguintes colunas exatas:
| source | target | relation | type | status | amount | year | source_url |

Regras para os campos da Tabela de Conexões:
- source: ID do nó de origem (ex: pol_fulano ou empresa_planam).
- target: ID do nó de destino (ex: esquema_sanguessugas ou pol_sicrano).
- relation: Resumo factual neutro de 1 a 2 frases sobre a atuação no caso.
- type: Categoria operacional obrigatória — selecione EXATAMENTE um:
  - transaction (fluxos financeiros, propinas, transferências)
  - contract (licitações, compras públicas, acordos comerciais)
  - process (investigações judiciais, CPIs, indiciamentos, denúncias)
- status: Status jurídico — selecione EXATAMENTE um:
  - confirmed (condenado, réu confesso ou delação homologada)
  - under_investigation (suspeito, investigado, indiciado ou citado)
  - acquitted (absolvido, processo arquivado ou anulado)
- amount: Cifra financeira citada (ex: "R$ 5.000.000") ou NULL.
- year: Ano principal do fato (ex: 2004) ou NULL.
- source_url: Link/URL direta e exata da reportagem ou documento oficial que comprova o vínculo.