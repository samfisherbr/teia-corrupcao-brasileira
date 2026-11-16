/**
 * Configuração do ESLint (formato "flat", ESLint 9).
 *
 * Roda pelo CLI do ESLint (`npm run lint`), não pelo `next lint`: o `next lint`
 * foi descontinuado no Next 15.5 e sai no Next 16.
 *
 * Regras: as recomendadas do Next (core-web-vitals + TypeScript), com dois
 * ajustes documentados abaixo.
 */
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });

const config = [
  { ignores: ['.next/**', '.vercel/**', 'node_modules/**', 'next-env.d.ts'] },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
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
    // Arquivos de configuração em CommonJS: require() é o normal aqui.
    files: ['*.config.js'],
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
];

export default config;
