/**
 * /ads.txt — declara publicamente quem pode vender os espaços de anúncio do
 * site (padrão IAB). O AdSense avisa "ganhos em risco" sem ele.
 *
 * Gerado no build a partir do ID de editor em lib/site.ts (ADSENSE_CLIENT).
 * f08c47fec0942fa0 é o identificador fixo do Google na rede de anúncios.
 */
import { ADSENSE_CLIENT } from '@/lib/site';

export const dynamic = 'force-static';

export function GET() {
  const publisher = ADSENSE_CLIENT.replace(/^ca-/, '');
  const body = `google.com, ${publisher}, DIRECT, f08c47fec0942fa0\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
