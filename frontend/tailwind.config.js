/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#010714',
        panel: '#1e293b',
        accent: '#2ffffc',
      },
    },
  },
  plugins: [],
};
