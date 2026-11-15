/**
 * Configuração do Tailwind CSS — e FONTE ÚNICA dos tokens de interface.
 *  - content: pastas onde o Tailwind procura classes. Se criar uma pasta nova
 *    com componentes (ex.: `features/`), inclua-a aqui ou as classes somem do CSS.
 *  - darkMode 'class': o tema escuro é ativado pela classe `dark` no <html>.
 *  - theme.extend: as cores e a fonte próprias do site (abaixo). Use-as pelas
 *    classes (`bg-surface-field`, `text-muted`, `font-sans`), nunca com hex
 *    solto (`bg-[#0e1726]`). app/globals.css lê os mesmos valores com theme().
 *
 * As cores do GRAFO (tipos de entidade, status jurídico, categoria do vínculo)
 * ficam em lib/graphConfig.ts, porque o canvas e os estilos inline as usam em
 * JavaScript.
 */
const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './content/**/*.{js,ts,jsx,tsx,mdx}',
    './views/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        /**
         * Superfícies, da mais funda à mais alta. Aceitam opacidade:
         * `bg-surface-field/95`.
         */
        surface: {
          canvas: '#080d16',  // fundo da página e do grafo (= BG_COLOR em NetworkGraph.tsx)
          sidebar: '#090f1b', // barra lateral e faixa da linha do tempo
          drawer: '#0c1322',  // painel de detalhes (InspectorDrawer), a 95%
          field: '#0e1726',   // campos, painéis flutuantes do mapa, menus
        },
        /**
         * Texto secundário de baixa ênfase: placeholders, contagens, notas,
         * marcas de ano. Contraste ≥ 4,5:1 (WCAG AA) em todas as superfícies
         * acima e em slate-800/900. Substitui text-slate-500 (4,1:1) e o
         * text-slate-600 usado em texto. slate-600 fica só para desabilitado.
         */
        muted: '#8090a6',
      },
      fontFamily: {
        /** Inter, carregada por next/font em views/layout.tsx (variável --font-inter). */
        sans: ['var(--font-inter)', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  // Provides the animate-in / fade-in / slide-in-from-right classes already used in the JSX.
  plugins: [require('tailwindcss-animate')],
};
