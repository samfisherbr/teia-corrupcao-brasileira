# Prompt de geração de dossiê (Fase 1 → Fase 2)

Este arquivo acompanha `schema.sql`, que é a fonte da verdade. **Se o schema
mudar (novo tipo, novo status, nova coluna), atualize este prompt no mesmo
commit** — um prompt desatualizado faz o modelo rotular errado o estágio
jurídico de uma pessoa, que é o erro mais grave que este site pode cometer.

- **Fase 1:** o modelo pesquisa e devolve as duas tabelas abaixo. Você confere
  cada linha — **abrindo cada `source_url`** — antes de aprovar.
- **Fase 2:** só depois da aprovação, o modelo converte as tabelas em
  `INSERT OR IGNORE` (nodes antes de links) e no registro de
  `data/schemeDetails.ts`.

Depois de inserir: `npm run check:data` e `npm run check:links`.

---

## 1. TABELA DE ENTIDADES (NÓS / NODES)

Apresente uma tabela com as seguintes colunas exatas:

| id | label | type | party | summary | image_url | image_credit | image_source_url |

Regras para os campos:

- **id:** identificador único só com `a-z`, `0-9` e `_` (sem acentos, espaços,
  hífens ou maiúsculas). Prefixos: `pol_`, `partido_`, `empresa_`, `op_`,
  `esquema_` (ex.: `pol_fulano`, `partido_pt`, `empresa_planam`,
  `op_fulano`, `esquema_sanguessugas`). Se a entidade já existe no banco,
  **reutilize o id existente**.
- **label:** nome completo ou oficial da pessoa/instituição.
- **type:** EXATAMENTE um dos valores:
  - `politician` — quem exerce ou exerceu mandato eletivo ou cargo político;
  - `party` — partido político;
  - `scheme` — o esquema/caso em si;
  - `company` — empresa, banco, estatal, fundo ou órgão;
  - `operator` — operador sem mandato: doleiro, lobista, tesoureiro,
    assessor, empresário atuando como pessoa física.
- **party:** sigla oficial do partido à época dos fatos (só para políticos) ou
  NULL.
- **summary:** descrição curta, factual e neutra da entidade e do seu papel.
  Obrigatório.
- **image_url:** link direto para imagem pública válida (`.jpg`, `.png`,
  `.svg`) ou NULL. Não invente links nem use ícones genéricos.
- **image_credit:** autor e licença da foto, como constam na página de origem
  (ex.: `Fulano de Tal / Wikimedia Commons, CC BY-SA 4.0`; `Agência Brasil,
  CC BY 3.0 BR`; `Domínio público`). NULL só se `image_url` for NULL.
- **image_source_url:** página onde a foto foi obtida e onde constam autor e
  licença (ex.: a página `File:` do Wikimedia Commons). NULL só se
  `image_url` for NULL.

Regras de conjunto:

- Nenhum nó sem vínculo: toda entidade listada aparece em pelo menos uma linha
  da tabela de conexões.
- Todo político tem um vínculo com o seu partido e um com o esquema.

## 2. TABELA DE CONEXÕES E VÍNCULOS (LINKS)

Apresente uma tabela com as seguintes colunas exatas:

| source | target | relation | type | status | amount | amount_brl | amount_note | year | source_url | reviewed_at |

Regras para os campos:

- **source / target:** ids de nós da tabela acima (ou já existentes no banco).
- **relation:** resumo factual e neutro, de 1 a 2 frases, da atuação no caso.
  Quando houver, inclua a posição da defesa ("nega as acusações").
- **type:** natureza do vínculo — EXATAMENTE um:
  - `transaction` — fluxo de dinheiro (propina, repasse, transferência);
  - `contract` — vínculo contratual, societário ou funcional (licitação,
    contrato, sociedade, cargo);
  - `process` — vínculo político, institucional ou judicial (filiação,
    investigação, CPI, denúncia, sentença).
- **status:** estágio jurídico **deste vínculo, hoje** — EXATAMENTE um dos
  seis. Na dúvida entre dois, escolha o **menos grave** e explique em
  `relation`.
  - `confirmed` — fato documental **sem juízo criminal**: contrato assinado,
    filiação partidária, cargo ocupado, acordo de leniência ou delação
    homologada. **Não** use para condenações.
  - `under_investigation` — investigado, indiciado ou denunciado, **sem
    sentença**.
  - `convicted_appealing` — condenado em 1ª ou 2ª instância, **com recurso
    pendente ou ainda cabível**.
  - `convicted_final` — condenação **transitada em julgado**.
  - `annulled` — condenação **anulada** por decisão superior (vício
    processual, incompetência, suspeição). **Não é absolvição.**
  - `acquitted` — **absolvido no mérito**, denúncia rejeitada ou punibilidade
    extinta por prescrição reconhecida em decisão.
- **amount:** cifra citada na fonte, com moeda (ex.: `R$ 5.000.000`,
  `US$ 5.000.000`) ou NULL.
- **amount_brl:** o mesmo valor em reais, como número inteiro sem pontos
  (ex.: `5000000`). NULL se a fonte não der o valor em reais — **não converta
  moeda por conta própria**.
- **amount_note:** ressalva sobre o número (estimativa, valor pedido pela
  acusação, total de um acordo, valor da época) ou NULL.
- **year:** ano principal do fato (ex.: 2004) ou NULL.
- **source_url:** URL direta e exata do documento oficial ou da reportagem que
  comprova **este vínculo e este status**. Obrigatório. Preferência:
  decisão/denúncia/relatório oficial (STF, STJ, MPF, PF, CGU, TCU, Câmara,
  Senado) e, depois, imprensa de referência. Nunca blogs partidários. **Não
  invente nem "reconstrua" URLs**: se não tiver o link exato, deixe a linha
  de fora e avise.
- **reviewed_at:** data (`AAAA-MM-DD`) em que o status foi conferido — a data
  de hoje ao gerar a tabela.

## 3. REGISTRO DO DOSSIÊ (Fase 2 — `data/schemeDetails.ts`)

Um registro por esquema, com a chave idêntica ao `id` do nó `scheme`:

- **title:** igual ao `label` do nó.
- **reviewedAt:** data de hoje (`AAAA-MM-DD`).
- **context**, **mechanism:** um parágrafo cada, factual e neutro.
- **impact:** comece pela cifra principal (`R$ 6.200.000.000 (…)`) e diga de
  quem é a estimativa e qual o critério.
- **legalStatus:** termine com `Situação em <mês> de <ano>: …`.
- **sources:** `{ title, url }` de cada documento e reportagem usados.

Ao **corrigir** um dossiê já publicado: atualize `reviewedAt`, o
`reviewed_at` dos vínculos afetados e acrescente uma entrada em
`data/corrections.ts` (aparece em `/correcoes`).
