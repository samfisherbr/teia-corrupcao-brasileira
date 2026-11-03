/**
 * Configuração do Tailwind CSS.
 *  - content: pastas onde o Tailwind procura classes. Se criar uma pasta nova
 *    com componentes (ex.: `features/`), inclua-a aqui ou as classes somem do CSS.
 *  - darkMode 'class': o tema escuro é ativado pela classe `dark` no <html>.
 *  - theme.extend: cores/fontes próprias (ex.: colors: { marca: '#ff00c8' }).
 */
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
    },
  },
  // Provides the animate-in / fade-in / slide-in-from-right classes already used in the JSX.
  plugins: [require('tailwindcss-animate')],
};