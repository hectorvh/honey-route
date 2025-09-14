/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      height: { card: '720px' },
      height: {
        card: '720px', // ← altura estándar de tu Onboarding
      },
      colors: {
        honey: { 500: '#FFB703', 600: '#E09E00' },
        leaf: { 500: '#2A9D8F' },
      },
      borderRadius: { xl: '12px', '2xl': '16px' },
    },
  },
  plugins: [],
};
