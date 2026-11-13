/**
 * MIDDLEWARE — bloqueio de robôs de IA no servidor (roda antes de toda página).
 *
 *  - User-Agent de robô de IA conhecido (lista em lib/aiBots.ts) → 403, em
 *    qualquer endereço. Só /robots.txt continua acessível, para o robô ler
 *    as regras.
 *  - Toda resposta leva cabeçalhos de reserva de direitos para IA:
 *      X-Robots-Tag: noai, noimageai  (convenção adotada por vários robôs)
 *      tdm-reservation: 1             (protocolo TDMRep do W3C: mineração de
 *                                      texto e dados reservada)
 *
 * Robôs de busca e do AdSense (Googlebot, Mediapartners-Google, Bingbot…)
 * NÃO estão na lista e passam normalmente.
 *
 * O idioma NÃO passa por aqui: cada idioma tem a sua pasta de rotas
 * (app/(pt), app/en, app/es — ver lib/i18n.ts), sem redirecionamento.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { AI_BOT_UA_PATTERN } from '@/lib/aiBots';

export function middleware(request: NextRequest) {
  const ua = request.headers.get('user-agent') ?? '';
  const isRobotsTxt = request.nextUrl.pathname === '/robots.txt';

  if (!isRobotsTxt && AI_BOT_UA_PATTERN.test(ua)) {
    return new NextResponse('Acesso negado a robôs de IA. Veja /robots.txt.\n', {
      status: 403,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Robots-Tag': 'noai, noimageai',
      },
    });
  }

  const response = NextResponse.next();
  response.headers.set('X-Robots-Tag', 'noai, noimageai');
  response.headers.set('tdm-reservation', '1');
  return response;
}

// Arquivos internos do Next (JS/CSS com hash) ficam de fora: não têm texto
// do site e assim o middleware não roda à toa em cada um deles.
export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
