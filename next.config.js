/**
 * Configuração do Next.js.
 *  - reactStrictMode: roda efeitos 2x em desenvolvimento para achar bugs.
 *  - transpilePackages: força o Next a compilar o react-force-graph-2d
 *    (distribuído só como ESM moderno).
 */
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Não anuncia "X-Powered-By: Next.js" em cada resposta.
  poweredByHeader: false,
  transpilePackages: ['react-force-graph-2d'],
};

module.exports = nextConfig;
