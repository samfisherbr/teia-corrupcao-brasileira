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
O binding do D1 no Cloudflare Pages deve se chamar `DB`. `schema.sql` é a fonte da verdade do formato dos dados; o prompt de geração (`docs/prompt-dossie.md`) precisa acompanhá-lo.

**Banco criado antes de 12/11/2026?** Rode uma vez a migração que acrescenta a data de conferência dos vínculos (`links.reviewed_at`) e o crédito das fotos (`nodes.image_credit`, `nodes.image_source_url`):
```bash
npx wrangler d1 execute corruption_graph_db --remote --file=./migrations/0002_review_dates_and_credits.sql
```
O site funciona sem essas colunas; com elas, passa a mostrar "Situação conferida em…" em cada vínculo e o crédito sob cada foto, conforme forem preenchidas.

### Cache da API
`/api/graph` fica 60 s no cache de borda do Cloudflare (e nunca no navegador). Depois de um INSERT/UPDATE no D1, o site leva até 1 minuto para mostrar o dado novo. Ajuste em `CACHE_TTL_SECONDS` (`app/api/graph/route.ts`; `0` desliga).

### Variáveis de ambiente (opcionais)
| Variável | Uso |
|---|---|
| `NEXT_PUBLIC_ADSENSE_CLIENT` | Substitui o ID de editor do AdSense (padrão `ca-pub-5667235064220150`, em `lib/site.ts`). O script e a meta tag de verificação já saem com o ID padrão; só defina para trocar de conta (e atualize também `public/ads.txt`). |
| `NEXT_PUBLIC_ADSENSE_SLOT` | Substitui o ID do banner fixo 728×90 sobre o grafo (padrão `2182726962`). O anúncio no artigo dos dossiês usa `1991155274`. Ambos ficam em `ADSENSE_SLOTS`, em `lib/site.ts`. |
| `NEXT_PUBLIC_SITE_DOMAIN` | Domínio público, sem `https://` (padrão em `lib/site.ts`). Usado nas páginas legais, nos endereços canônicos, no `sitemap.xml` e no `robots.txt`. |

As variáveis `NEXT_PUBLIC_*` são lidas **no build**: depois de mudar uma no Cloudflare Pages, faça um novo deploy.

### Páginas para busca e AdSense
- `/esquemas` e `/esquemas/<slug>` — um dossiê por esquema, renderizado no servidor a partir do D1 e de `data/schemeDetails.ts` (o grafo é um `<canvas>` e o Glossário só abre com clique, então os robôs não leem nenhum dos dois). O slug é o id sem `esquema_`, com hífens: `esquema_anoes_orcamento` → `/esquemas/anoes-orcamento`.
  Cada dossiê lista **quem aparece no caso**, com o papel, o status jurídico, o ano e a fonte de cada vínculo, a data "Revisado em" (`reviewedAt`), dados estruturados (JSON-LD) e uma imagem de compartilhamento própria (`opengraph-image.tsx`).
- `/` — além do grafo, a página inicial sai do servidor com título, apresentação e a lista de dossiês em HTML (visualmente oculta, lida por buscadores e leitores de tela). A parte interativa fica em `components/GraphApp.tsx`.
- `/correcoes` — registro público de correções e atualizações, gerado de `data/corrections.ts`.
- `/sitemap.xml` e `/robots.txt` — gerados no build (`app/sitemap.ts`, `app/robots.ts`). O `lastModified` de cada dossiê é o `reviewedAt` dele, não a data do build.
- `/ads.txt` — arquivo de texto simples em `public/ads.txt`, servido na raiz do site como o AdSense pede. Trocou de conta do AdSense? Cole ali a linha nova copiada em **Sites → Ads.txt snippet**.

### Ao corrigir ou atualizar um dossiê
1. Edite o texto em `data/schemeDetails.ts` e **atualize o `reviewedAt`** do registro.
2. No banco, atualize o `status` e o `reviewed_at` dos vínculos afetados.
3. Acrescente uma entrada em `data/corrections.ts` (o que mudou e por quê) — aparece em `/correcoes`.
4. Rode `npm run check:data` e `npm run check:links`.

### Consentimento de cookies (visitantes da Europa)
O Google exige uma mensagem de consentimento certificada para exibir anúncios a visitantes do Espaço Econômico Europeu, Reino Unido e Suíça. Isso não é código do site: ative no painel do AdSense em **Privacidade e mensagens → Regulamentações europeias → Criar mensagem**. Para o Brasil não é exigido.

### Bloqueio de robôs de IA
- Lista única em `lib/aiBots.ts` (GPTBot, PerplexityBot, CCBot, Google-Extended…). Exceção: os robôs da Anthropic (ClaudeBot, Claude-User, Claude-SearchBot…) estão em `ALLOWED_AI_BOTS` e são liberados.
- `robots.txt` pede a todos eles que não acessem o site; `middleware.ts` responde **403** aos que se identificam, e toda página leva `X-Robots-Tag: noai, noimageai` e `tdm-reservation: 1`.
- Busca e AdSense (Googlebot, Mediapartners-Google, Bingbot) **não** são bloqueados.
- Robôs que fingem ser navegadores passam por essas camadas: ative também no Cloudflare **Security → Bots → Block AI bots** (ou **AI Crawl Control**).

### Ajustando o layout do grafo
Os parâmetros do layout radial (tamanho do anel, distância de cada tipo ao centro, força de ancoragem, repulsão) estão no topo de `lib/layout.ts`, com comentários. Cores, tamanhos de círculo e de rótulo ficam em `lib/graphConfig.ts`.

### Scripts
- `npm run dev` — desenvolvimento
- `npm run typecheck` — checagem de tipos
- `npm run pages:build` — build para Cloudflare Pages
- `npm run check:data` — roda `scripts/verify-data.sql` no D1 (nós órfãos, referências fantasma, ids inválidos, fontes que não são links; avisa de vínculos sem data de conferência e fotos sem crédito)
- `npm run check:links` — confere se as fontes dos dossiês ainda respondem; com `-- --site https://teiadacorrupcao.io` confere também as fontes dos vínculos e as fotos

### Checagens automáticas (GitHub Actions)
- **CI** (`.github/workflows/ci.yml`) — tipos + build a cada push e pull request.
- **Links** (`.github/workflows/links.yml`) — toda segunda-feira confere os links de fonte; se algum estiver quebrado (404, domínio morto), o workflow falha e o GitHub avisa por e-mail. Portais que bloqueiam robôs (403) saem como "inconclusivos" e não reprovam.

O `package-lock.json` é versionado: o Cloudflare Pages e o CI instalam exatamente as mesmas versões das dependências.

O prompt de geração de dossiês (Fase 1 / Fase 2) está em `docs/prompt-dossie.md` e lista os mesmos tipos, status e colunas de `schema.sql` — mude os dois juntos.
