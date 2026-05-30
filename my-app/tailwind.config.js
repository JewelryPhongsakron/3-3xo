/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'handwriting': ['"Patrick Hand"', 'cursive'],
      },
      colors: {
        'paper': '#FFF8DC',
        'line-blue': '#a5d8ff',
        'marker-pink': '#ff87ab',
        'marker-blue': '#4cc9f0',
      }
    },
  },
  plugins: [],
}
