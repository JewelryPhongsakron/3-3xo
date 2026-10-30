import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        handwriting: ['var(--font-handwriting)', 'cursive'],
      },
      colors: {
        paper: '#FFF8DC',
        'line-blue': '#a5d8ff',
        'marker-pink': '#ff87ab',
        'marker-blue': '#4cc9f0',
      },
    },
  },
  plugins: [],
} satisfies Config;
