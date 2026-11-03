# 🛡️ Mapeamento de Redes & Esquemas de Corrupção no Brasil

Aplicação interativa em React / Next.js com D3 e React-Force-Graph para visualização de grafos relacionais entre políticos, partidos, empresas e esquemas de corrupção.

## 🚀 Tecnologias
- **Next.js (App Router)**
- **Tailwind CSS & Lucide Icons**
- **React-Force-Graph-2D & D3-Force**
- **Cloudflare D1 Database & Cloudflare Pages (Wrangler)**

## ⚙️ Configuração

### Banco de dados (D1)
```bash
npx wrangler d1 execute <DB_NAME> --remote --file=./schema.sql
```
O binding do D1 deve se chamar `DB`. Veja os comentários em `schema.sql` para migrar um banco existente (dedup de links e conversão de `'NULL'` em `NULL`).

### Variáveis de ambiente (opcionais)
| Variável | Uso |
|---|---|
| `NEXT_PUBLIC_ADSENSE_CLIENT` | ID `ca-pub-…` do AdSense. Sem ela, o banner não é renderizado. |
| `NEXT_PUBLIC_ADSENSE_SLOT` | ID do bloco de anúncio. |

### Scripts
- `npm run dev` — desenvolvimento
- `npm run typecheck` — checagem de tipos
- `npm run pages:build` — build para Cloudflare Pages

O prompt de geração de dossiês (Fase 1 / Fase 2) está em `docs/prompt-dossie.md`.
