/**
 * ============================================================================
 * ROBÔS DE IA BLOQUEADOS — fonte única para robots.txt e middleware
 * ============================================================================
 * Dois níveis de bloqueio:
 *  1. app/robots.ts lista TODOS os nomes abaixo com `Disallow: /` (pedido
 *     formal; robôs sérios — OpenAI, Anthropic, Google, Common Crawl —
 *     obedecem).
 *  2. middleware.ts responde 403 a qualquer requisição cujo User-Agent
 *     contenha um dos nomes com `ua: true` (bloqueio de fato, para quem
 *     ignora o robots.txt mas se identifica).
 *
 * Nomes com `ua: false` são só "tokens" de robots.txt: não aparecem no
 * User-Agent (ex.: Google-Extended — o rastreamento é feito pelo Googlebot,
 * e o token apenas proíbe o uso do conteúdo para treinar o Gemini).
 *
 * NÃO adicione aqui robôs de busca ou de anúncios — Googlebot,
 * Mediapartners-Google (AdSense), AdsBot-Google, Bingbot, Applebot — ou o
 * site some das buscas e o AdSense deixa de funcionar.
 *
 * Limite honesto: um robô que finja ser um navegador comum passa por estas
 * duas camadas. Para isso, ative também no Cloudflare: Security → Bots →
 * "Block AI bots" (ou AI Crawl Control), que verifica IPs e assinaturas.
 * ============================================================================
 */
export const AI_BOTS: { name: string; ua: boolean; owner: string }[] = [
  // OpenAI
  { name: 'GPTBot', ua: true, owner: 'OpenAI (treino)' },
  { name: 'ChatGPT-User', ua: true, owner: 'OpenAI (ChatGPT navegando a pedido)' },
  { name: 'OAI-SearchBot', ua: true, owner: 'OpenAI (busca do ChatGPT)' },
  // Anthropic
  { name: 'ClaudeBot', ua: true, owner: 'Anthropic (treino)' },
  { name: 'Claude-User', ua: true, owner: 'Anthropic (Claude navegando a pedido)' },
  { name: 'Claude-SearchBot', ua: true, owner: 'Anthropic (busca)' },
  { name: 'Claude-Web', ua: true, owner: 'Anthropic (antigo)' },
  { name: 'anthropic-ai', ua: true, owner: 'Anthropic (antigo)' },
  // Google / Apple (só tokens: não bloqueiam a busca)
  { name: 'Google-Extended', ua: false, owner: 'Google (treino do Gemini)' },
  { name: 'GoogleOther', ua: true, owner: 'Google (pesquisa e desenvolvimento, fora da busca)' },
  { name: 'Applebot-Extended', ua: false, owner: 'Apple (treino de IA)' },
  // Perplexity
  { name: 'PerplexityBot', ua: true, owner: 'Perplexity' },
  { name: 'Perplexity-User', ua: true, owner: 'Perplexity (a pedido)' },
  // Meta
  { name: 'meta-externalagent', ua: true, owner: 'Meta (treino)' },
  { name: 'meta-externalfetcher', ua: true, owner: 'Meta (a pedido)' },
  { name: 'FacebookBot', ua: true, owner: 'Meta (treino de fala)' },
  // Outros modelos, bases de treino e raspadores de IA
  { name: 'CCBot', ua: true, owner: 'Common Crawl (base de treino de muitos modelos)' },
  { name: 'Bytespider', ua: true, owner: 'ByteDance' },
  { name: 'Amazonbot', ua: true, owner: 'Amazon' },
  { name: 'cohere-ai', ua: true, owner: 'Cohere' },
  { name: 'cohere-training-data-crawler', ua: true, owner: 'Cohere' },
  { name: 'MistralAI-User', ua: true, owner: 'Mistral' },
  { name: 'DuckAssistBot', ua: true, owner: 'DuckDuckGo (respostas de IA)' },
  { name: 'YouBot', ua: true, owner: 'You.com' },
  { name: 'AI2Bot', ua: true, owner: 'Allen Institute for AI' },
  { name: 'Ai2Bot-Dolma', ua: true, owner: 'Allen Institute for AI' },
  { name: 'Diffbot', ua: true, owner: 'Diffbot' },
  { name: 'Timpibot', ua: true, owner: 'Timpi' },
  { name: 'ImagesiftBot', ua: true, owner: 'ImageSift' },
  { name: 'Omgilibot', ua: true, owner: 'Webz.io' },
  { name: 'Omgili', ua: true, owner: 'Webz.io' },
  { name: 'Webzio-Extended', ua: false, owner: 'Webz.io (treino de IA)' },
  { name: 'Kangaroo Bot', ua: true, owner: 'Kangaroo LLM' },
  { name: 'iaskspider', ua: true, owner: 'iAsk' },
  { name: 'img2dataset', ua: true, owner: 'ferramenta de raspagem para datasets' },
  { name: 'FirecrawlAgent', ua: true, owner: 'Firecrawl (raspagem para LLMs)' },
];

/** Expressão que acha qualquer nome com `ua: true` no User-Agent (sem diferenciar maiúsculas). */
export const AI_BOT_UA_PATTERN = new RegExp(
  AI_BOTS.filter((b) => b.ua)
    .map((b) => b.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|'),
  'i'
);
