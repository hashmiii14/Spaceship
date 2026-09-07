/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          cyan: '#00f0ff',
          magenta: '#ff0055',
          gold: '#facc15',
          purple: '#a855f7',
          dark: '#030712',
        }
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        rajdhani: ['Rajdhani', 'sans-serif'],
        chakra: ['"Chakra Petch"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
