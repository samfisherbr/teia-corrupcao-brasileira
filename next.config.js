/**
 * Configuração do Next.js.
 *  - reactStrictMode: roda efeitos 2x em desenvolvimento para achar bugs.
 *  - transpilePackages: força o Next a compilar o react-force-graph-2d
 *    (distribuído só como ESM moderno).
 *  - headers: cabeçalhos de segurança em todas as respostas (ver abaixo).
 *  - redirects: o endereço de produção *.pages.dev manda para o domínio próprio.
 */

/** Endereço de produção do Cloudflare Pages (o nome do projeto em wrangler.toml). */
const PAGES_DEV_HOST = 'teia-corrupcao-brasileira.pages.dev';
const SITE_DOMAIN = process.env.NEXT_PUBLIC_SITE_DOMAIN || 'teiadacorrupcao.io';

/**
 * Cabeçalhos de segurança.
 *  - HSTS: o navegador só usa HTTPS neste domínio e nos subdomínios (img.) por 1 ano.
 *  - CSP: só diretivas que não afetam scripts, estilos, imagens ou anúncios
 *    (o Google AdSense carrega código e iframes de muitos domínios; uma lista de
 *    scripts permitidos quebraria os anúncios). Impede que o site seja aberto
 *    dentro de iframe de outro site (clickjacking), <base> e <object> injetados,
 *    formulários enviados para fora e conteúdo http:// misturado.
 *  - Permissions-Policy: desliga câmera, microfone, localização etc., que o site
 *    não usa. Tela cheia continua permitida (botão do grafo). Não restrinja aqui
 *    recursos de anúncio (attribution-reporting, browsing-topics…): o AdSense usa.
 */
const SECURITY_HEADERS = [
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  {
    key: 'Content-Security-Policy',
    value: "frame-ancestors 'self'; base-uri 'self'; object-src 'none'; form-action 'self'; upgrade-insecure-requests",
  },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), serial=(), hid=(), bluetooth=(), fullscreen=(self)',
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Não anuncia "X-Powered-By: Next.js" em cada resposta.
  poweredByHeader: false,
  transpilePackages: ['react-force-graph-2d'],

  async headers() {
    return [{ source: '/:path*', headers: SECURITY_HEADERS }];
  },

  /**
   * teia-corrupcao-brasileira.pages.dev → teiadacorrupcao.io (301).
   * As regras do WAF (bloqueio de robôs de IA, limite de requisições) só valem
   * no domínio próprio; sem isto, o endereço *.pages.dev servia o mesmo site
   * sem essas proteções. Só o endereço EXATO de produção: os previews
   * (<hash>.teia-corrupcao-brasileira.pages.dev, <branch>.…) continuam abrindo.
   */
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: PAGES_DEV_HOST }],
        destination: `https://${SITE_DOMAIN}/:path*`,
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
