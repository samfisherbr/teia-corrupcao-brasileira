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
| `NEXT_PUBLIC_ADSENSE_CLIENT` | ID `ca-pub-…` do AdSense. Sozinha, já coloca em todas as páginas a meta tag de verificação e o script do AdSense (o que a análise do Google exige) e gera o `/ads.txt`. |
| `NEXT_PUBLIC_ADSENSE_SLOT` | ID do bloco de anúncio (só existe depois da aprovação). Com as duas variáveis, aparece o banner fixo sobre o grafo. |
| `NEXT_PUBLIC_SITE_DOMAIN` | Domínio público, sem `https://` (padrão em `lib/site.ts`). Usado nas páginas legais, nos endereços canônicos, no `sitemap.xml` e no `robots.txt`. |

As variáveis `NEXT_PUBLIC_*` são lidas **no build**: depois de mudar uma no Cloudflare Pages, faça um novo deploy.

### Páginas para busca e AdSense
- `/esquemas` e `/esquemas/<slug>` — um dossiê por esquema, renderizado no servidor a partir do D1 e de `data/schemeDetails.ts` (o grafo é um `<canvas>` e o Glossário só abre com clique, então os robôs não leem nenhum dos dois). O slug é o id sem `esquema_`, com hífens: `esquema_anoes_orcamento` → `/esquemas/anoes-orcamento`.
- `/sitemap.xml`, `/robots.txt` e `/ads.txt` — gerados no build (`app/sitemap.ts`, `app/robots.ts`, `app/ads.txt/route.ts`).

### Bloqueio de robôs de IA
- Lista única em `lib/aiBots.ts` (GPTBot, ClaudeBot, PerplexityBot, CCBot, Google-Extended…).
- `robots.txt` pede a todos eles que não acessem o site; `middleware.ts` responde **403** aos que se identificam, e toda página leva `X-Robots-Tag: noai, noimageai` e `tdm-reservation: 1`.
- Busca e AdSense (Googlebot, Mediapartners-Google, Bingbot) **não** são bloqueados.
- Robôs que fingem ser navegadores passam por essas camadas: ative também no Cloudflare **Security → Bots → Block AI bots** (ou **AI Crawl Control**).

### Ajustando o layout do grafo
Os parâmetros do layout radial (tamanho do anel, distância de cada tipo ao centro, força de ancoragem, repulsão) estão no topo de `lib/layout.ts`, com comentários. Cores, tamanhos de círculo e de rótulo ficam em `lib/graphConfig.ts`.

### Scripts
- `npm run dev` — desenvolvimento
- `npm run typecheck` — checagem de tipos
- `npm run pages:build` — build para Cloudflare Pages

O prompt de geração de dossiês (Fase 1 / Fase 2) está em `docs/prompt-dossie.md`.
