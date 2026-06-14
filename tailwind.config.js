/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50:  '#fdfbf0',
          100: '#faf4d3',
          200: '#f4e89a',
          300: '#edd561',
          400: '#e5c137',
          500: '#c9a227',
          600: '#a07d1c',
          700: '#7a5c15',
          800: '#573f10',
          900: '#3a290b',
        },
        obsidian: {
          50:  '#f5f5f6',
          100: '#e5e5e7',
          200: '#c8c8cc',
          300: '#a0a0a8',
          400: '#71717d',
          500: '#55555f',
          600: '#3e3e47',
          700: '#2a2a31',
          800: '#18181e',
          900: '#0d0d10',
          950: '#08080a',
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #c9a227 0%, #e5c137 50%, #a07d1c 100%)',
      },
    },
  },
  plugins: [],
}
