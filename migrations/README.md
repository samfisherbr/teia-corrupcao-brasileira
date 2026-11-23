# Migrações do D1

## Regra: vínculos se identificam pela chave natural, nunca pelo id

O `id` de `links` é autoincremento: só vale no banco onde nasceu. Num banco
restaurado, reconstruído ou de teste, o mesmo id aponta para outro vínculo, e um
`UPDATE ... WHERE id = 123` grava no vínculo errado, sem erro.

A chave natural de um vínculo é a do índice único `idx_links_unique`:

```sql
source = '…' AND target = '…' AND type = '…' AND status = '…' AND COALESCE(year, -1) = <ano ou -1>
```

Use-a em todo `UPDATE`, `DELETE` e `INSERT … SELECT` que mire vínculos ou as
traduções deles (`link_translations`):

```sql
UPDATE link_translations SET relation = '…', source_text = (…)
 WHERE link_id IN (SELECT id FROM links WHERE source = '…' AND target = '…' AND type = '…' AND status = '…' AND COALESCE(year, -1) = 2004)
   AND lang = 'en';
```

Nós têm id de texto estável (`pol_fulano`, `esquema_x`) e podem ser citados por ele.

`npm run check:migrations` (roda no CI) reprova migração de 0007 em diante e o
seed de traduções que usem `id = 123`, `id IN (…)` ou `link_id = 123`. As
migrações 0002 a 0006 já foram aplicadas e ficam de fora.

## O limite da chave natural: o status faz parte dela

Quando o status de um vínculo muda em produção (por exemplo, de
`under_investigation` para `convicted_appealing`), a chave dele muda. Um comando
escrito com a chave antiga deixa de casar: **não altera nada** (falha segura) e
não grava no vínculo errado. Consequências:

- **Migração é única.** Descreve o estado de um dia e roda uma vez. Reaplicá-la
  depois que um status mudou pode pular esse vínculo; `npm run check:data` mostra
  o que ficou faltando (por exemplo, "vínculo com valor sem amount_kind").
- **Arquivo que envelhece é exportado, não editado.** O seed de traduções
  `data/translations/links.en-es.sql` é gerado do D1 de produção por
  `npm run export:translations`. Regere-o antes de usá-lo.
- O site não usa a chave natural: as traduções se juntam pelo `link_id`, e uma
  mudança de status aparece depois que o cache da API expira.

## Arquivos

| Arquivo | Situação |
|---|---|
| 0002 a 0006 | Aplicadas. Usam ids (histórico); não reescrever. |
| 0007 `amount_kind` | Aplicada em 22/11/2026. Chave natural. |
| 0008 correções de 23/11/2026 | Aplicada em 23/11/2026. Chave natural. |
| 0009 valor de Sandra Inês Azevedo (Faroeste) | Aplicada em 23/11/2026. Chave natural. |
| 0010 tabela `scheme_timelines` (linha do tempo dos esquemas) | **Não aplicada.** Chave: `scheme_id` (id de texto do nó). Pode rodar de novo (`INSERT OR REPLACE`). Depois: `npm run check:timeline-sync`. |
