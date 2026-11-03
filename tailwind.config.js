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