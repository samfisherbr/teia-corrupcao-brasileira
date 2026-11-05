/**
 * /ads.txt — declara publicamente quem pode vender os espaços de anúncio do
 * site (padrão IAB). O AdSense avisa "ganhos em risco" sem ele.
 *
 * Gerado no build a partir de NEXT_PUBLIC_ADSENSE_CLIENT (ca-pub-…): basta
 * definir a variável no Cloudflare Pages e fazer um novo deploy. Sem ela, o
 * arquivo sai só com um comentário (ads.txt sem registros é válido).
 * f08c47fec0942fa0 é o identificador fixo do Google na rede de anúncios.
 */
export const dynamic = 'force-static';

export function GET() {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim();
  const publisher = client?.replace(/^ca-/, '');
  const body = publisher?.startsWith('pub-')
    ? `google.com, ${publisher}, DIRECT, f08c47fec0942fa0\n`
    : '# Nenhum ID de editor do AdSense configurado (NEXT_PUBLIC_ADSENSE_CLIENT).\n';
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
