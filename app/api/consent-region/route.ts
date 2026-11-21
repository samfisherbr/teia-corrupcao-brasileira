/**
 * GET /api/consent-region — { consentRequired: boolean }
 *
 * Diz ao navegador se o visitante está numa região em que os anúncios só podem
 * ser pedidos depois do consentimento (lib/consentRegions.ts). O país vem da
 * geolocalização do Cloudflare: cabeçalho CF-IPCountry (o Cloudflare o
 * sobrescreve, o visitante não consegue forjá-lo) e, na falta dele,
 * request.cf.country. Sem país conhecido, responde true.
 *
 * Usado por components/AdSenseLoader.tsx. A resposta depende do visitante,
 * então não pode ficar em cache compartilhado (no-store).
 */
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { consentRequiredFor } from '@/lib/consentRegions';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  let country = request.headers.get('cf-ipcountry');
  if (!country) {
    try {
      const cf = getCloudflareContext().cf as { country?: string } | undefined;
      country = cf?.country ?? null;
    } catch {
      // Fora do Worker (ex.: next build) não há contexto do Cloudflare.
    }
  }

  return Response.json(
    { consentRequired: consentRequiredFor(country) },
    { headers: { 'Cache-Control': 'private, no-store' } },
  );
}
