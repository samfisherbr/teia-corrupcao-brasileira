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
npx wrangler d1 create teia-corrupcao
npx wrangler d1 execute teia-corrupcao --remote --file=./schema.sql
```
O binding do D1 no Cloudflare Pages deve se chamar `DB`. O schema segue o Master Prompt v2; `schema.sql` traz também consultas de verificação (nós órfãos, referências fantasma, ids inválidos).

### Variáveis de ambiente (opcionais)
| Variável | Uso |
|---|---|
| `NEXT_PUBLIC_ADSENSE_CLIENT` | ID `ca-pub-…` do AdSense. Sem ela, o banner não é renderizado. |
| `NEXT_PUBLIC_ADSENSE_SLOT` | ID do bloco de anúncio. |
| `NEXT_PUBLIC_SITE_DOMAIN` | Domínio exibido nas páginas legais (padrão em `lib/site.ts`). |

### Ajustando o layout do grafo
Os parâmetros do layout radial (tamanho do anel, distância de cada tipo ao centro, força de ancoragem, repulsão) estão no topo de `lib/layout.ts`, com comentários. Cores, tamanhos de círculo e de rótulo ficam em `lib/graphConfig.ts`.

### Scripts
- `npm run dev` — desenvolvimento
- `npm run typecheck` — checagem de tipos
- `npm run pages:build` — build para Cloudflare Pages

O prompt de geração de dossiês (Fase 1 / Fase 2) está em `docs/prompt-dossie.md`.
