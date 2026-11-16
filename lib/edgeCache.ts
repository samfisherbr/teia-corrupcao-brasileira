/**
 * CACHE DE BORDA para resultados do banco (Cloudflare Cache API).
 *
 * Por que existe: no plano gratuito, o D1 tem limite de leituras de linhas por
 * dia e as Functions têm limite de requisições e de CPU. Sem cache, cada visita
 * ao índice de dossiês ou a um dossiê consultava o banco. Com ele, cada data
 * center consulta o banco no máximo uma vez a cada `freshSeconds` por chave.
 *
 * Como funciona ("stale-while-revalidate" DENTRO da função, nunca no navegador):
 *   - cópia com menos de `freshSeconds`  → devolvida direto (hit);
 *   - cópia mais velha, até `maxAgeSeconds` → devolvida na hora (stale) e o banco
 *     é consultado em segundo plano para a próxima visita;
 *   - sem cópia (ou mais velha que `maxAgeSeconds`) → consulta o banco (miss).
 * Se o banco falhar na atualização em segundo plano, a cópia antiga continua.
 *
 * Depois de um INSERT/UPDATE no D1, o dado novo aparece em até `freshSeconds`
 * (mais o intervalo até a próxima visita, se ela vier dentro de `maxAgeSeconds`).
 * Fora do Cloudflare (`next dev`) não há cache: sempre consulta.
 *
 * Mudou o FORMATO do que é guardado (campos, consultas)? Troque CACHE_VERSION:
 * as cópias antigas deixam de ser lidas.
 */
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { SITE_DOMAIN } from '@/lib/site';

const CACHE_VERSION = 'v1';

export type CacheState = 'hit' | 'stale' | 'miss' | 'bypass';

export interface EdgeCacheOptions<T> {
  /** Segundos em que a cópia é usada sem atualizar. */
  freshSeconds: number;
  /** Segundos até a cópia ser descartada (deve ser > freshSeconds). */
  maxAgeSeconds: number;
  /** Guardar este resultado? (ex.: não guardar "não encontrado"). Padrão: sempre. */
  shouldCache?: (value: T) => boolean;
}

/** Atualizações em andamento neste isolate: evita várias consultas iguais ao mesmo tempo. */
const inflight = new Map<string, Promise<unknown>>();

const edgeCache = (): Cache | undefined =>
  (globalThis as unknown as { caches?: { default?: Cache } }).caches?.default;

/** Mantém a tarefa viva depois da resposta (ctx.waitUntil), quando houver contexto. */
function waitUntil(p: Promise<unknown>) {
  try {
    const { ctx } = getCloudflareContext() as unknown as { ctx?: { waitUntil(p: Promise<unknown>): void } };
    ctx?.waitUntil?.(p);
  } catch {
    // Fora do Cloudflare: a promessa segue sozinha.
  }
}

/**
 * Texto guardado no cache de borda sob `key` (ex.: "api-graph/en").
 * `load` só é chamado quando necessário; se ele lançar erro num miss, o erro
 * sobe para quem chamou (e nada é guardado).
 */
export async function edgeCachedText(
  key: string,
  load: () => Promise<string>,
  opts: EdgeCacheOptions<string>
): Promise<{ text: string; state: CacheState }> {
  const cache = edgeCache();
  if (!cache || opts.freshSeconds <= 0) return { text: await load(), state: 'bypass' };

  const cacheKey = new Request(`https://${SITE_DOMAIN}/__edge-cache/${CACHE_VERSION}/${key}`);
  const store = async (text: string) => {
    if (opts.shouldCache && !opts.shouldCache(text)) return;
    await cache.put(
      cacheKey,
      new Response(text, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': `public, max-age=${opts.maxAgeSeconds}`,
          'X-Stored-At': String(Date.now()),
        },
      })
    );
  };

  let hit: Response | undefined;
  try {
    hit = await cache.match(cacheKey);
  } catch {
    hit = undefined; // cache indisponível: segue para o banco
  }

  if (hit) {
    const text = await hit.text();
    const ageSeconds = (Date.now() - Number(hit.headers.get('X-Stored-At') || 0)) / 1000;
    if (ageSeconds < opts.freshSeconds) return { text, state: 'hit' };
    if (!inflight.has(key)) {
      const refresh = load()
        .then(store)
        .catch((e) => console.error(`[edgeCache] falha ao atualizar "${key}":`, e))
        .finally(() => inflight.delete(key));
      inflight.set(key, refresh);
      waitUntil(refresh);
    }
    return { text, state: 'stale' };
  }

  const text = await load();
  waitUntil(store(text).catch(() => {}));
  return { text, state: 'miss' };
}

/** Igual a edgeCachedText, para valores serializáveis em JSON (sem Map/Set/Date). */
export async function edgeCachedJson<T>(key: string, load: () => Promise<T>, opts: EdgeCacheOptions<T>): Promise<T> {
  const { text } = await edgeCachedText(key, async () => JSON.stringify(await load()), {
    freshSeconds: opts.freshSeconds,
    maxAgeSeconds: opts.maxAgeSeconds,
    shouldCache: opts.shouldCache ? (text) => opts.shouldCache!(JSON.parse(text) as T) : undefined,
  });
  return JSON.parse(text) as T;
}
