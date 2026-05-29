import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ow: {
          orange: '#F99E1A',
          blue: '#218FFE',
          dark: '#1A1A2E',
          darker: '#16213E',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
