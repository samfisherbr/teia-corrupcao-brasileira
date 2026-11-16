// PostCSS: processa o CSS com o Tailwind 4 (que já cuida dos prefixos de navegador;
// o autoprefixer não é mais necessário).
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
