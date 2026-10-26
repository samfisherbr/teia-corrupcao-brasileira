/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#080d16',
          panel: 'rgba(14, 23, 38, 0.85)',
          cyan: '#00f0ff',
          green: '#0aff96',
          magenta: '#ff00c8',
        },
      },
    },
  },
  plugins: [],
};