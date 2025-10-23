/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#0d1b2a',
        'card-bg': '#112240',
        'primary': '#38bdf8',
        'muted': '#6c7680',
      },
    },
  },
  plugins: [],
};