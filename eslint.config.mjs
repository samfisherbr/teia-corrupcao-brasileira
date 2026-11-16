/**
 * Configuração do ESLint (formato "flat", ESLint 9).
 *
 * Roda pelo CLI do ESLint (`npm run lint`), não pelo `next lint`: o `next lint`
 * foi descontinuado no Next 15.5 e sai no Next 16.
 *
 * Regras: as recomendadas do Next (core-web-vitals + TypeScript), com dois
 * ajustes documentados abaixo.
 */
import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const config = defineConfig([
  globalIgnores(['.next/**', '.open-next/**', '.wrangler/**', 'node_modules/**', 'next-env.d.ts', 'cloudflare-env.d.ts']),
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // O desenho do grafo (components/NetworkGraph.tsx, lib/layout.ts) usa
      // `any` onde o react-force-graph e o d3 acrescentam campos aos objetos
      // em tempo de execução (x, y, vx, fx…). Fica como aviso, para seguir
      // visível e ser tipado aos poucos, sem travar o CI.
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  {
    // Regras do React Compiler (vieram com o Next 16). O site não usa o
    // compilador, e o código do grafo faz de propósito o que elas proíbem:
    // atualiza refs durante o render ("latest ref") e altera os nós da
    // simulação do d3 no lugar (x, y, __depth). Nesses dois arquivos ficam como
    // aviso; no resto do código continuam valendo como erro.
    files: ['components/NetworkGraph.tsx', 'components/GraphApp.tsx'],
    rules: {
      'react-hooks/refs': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
    },
  },
  {
    // Arquivos de configuração em CommonJS: require() é o normal aqui.
    files: ['*.config.js'],
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
]);

export default config;
