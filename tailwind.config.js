/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          crimson: '#C52222',
          'crimson-dark': '#9E1B1B',
          sand: '#C2B280',
          'sand-light': '#D2C29D',
          dark: '#000000',
          darker: '#000000',
          card: '#080808',
          border: '#181818'
        }
      },
      fontFamily: {
        gothic: ['UnifrakturCook', 'Pirata One', 'Grenze Gotisch', 'cursive', 'serif'],
        pirata: ['Pirata One', 'cursive', 'serif'],
        condensed: ['Oswald', 'sans-serif'],
        bebas: ['Bebas Neue', 'sans-serif'],
        sans: ['Inter', 'sans-serif']
      }
    },
  },
  plugins: [],
}
