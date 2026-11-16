/**
 * Configuração do adaptador OpenNext para Cloudflare.
 *
 * Cache incremental: as páginas pré-geradas no build (sobre, termos, página
 * inicial…) são servidas dos arquivos estáticos do Worker. O site não usa ISR
 * (`revalidate`), então não precisa de R2/KV para isso. As páginas que leem o
 * D1 são `force-dynamic` e têm o próprio cache (lib/edgeCache.ts).
 */
import { defineCloudflareConfig } from '@opennextjs/cloudflare';
import staticAssetsIncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache';

export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
});
