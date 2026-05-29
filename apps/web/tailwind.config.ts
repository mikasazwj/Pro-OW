import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: { DEFAULT: '#F99E1A', light: '#FBBF24', dark: '#D97706', muted: 'rgba(249,158,26,0.15)' },
          blue: { DEFAULT: '#218FFE', light: '#60A5FA', dark: '#1D4ED8', muted: 'rgba(33,143,254,0.15)' },
          purple: { DEFAULT: '#8B5CF6', muted: 'rgba(139,92,246,0.15)' },
          pink: { DEFAULT: '#EC4899', muted: 'rgba(236,72,153,0.15)' },
        },
        surface: {
          root: '#0F0F1A',
          base: '#1A1A2E',
          elevated: '#222240',
          card: '#2A2A4A',
          hover: '#33335A',
          border: '#3A3A5C',
        },
        text: {
          primary: '#F1F5F9',
          secondary: '#94A3B8',
          muted: '#64748B',
          inverse: '#0F0F1A',
        },
        semantic: {
          success: '#22C55E',
          error: '#EF4444',
          warning: '#F59E0B',
          info: '#3B82F6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)',
        elevated: '0 4px 16px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.3)',
        glow: '0 0 20px rgba(249,158,26,0.3)',
        'glow-blue': '0 0 20px rgba(33,143,254,0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-right': 'slideRight 0.2s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'scale-in': 'scaleIn 0.15s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideRight: { '0%': { opacity: '0', transform: 'translateX(-8px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
        pulseSoft: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.7' } },
        scaleIn: { '0%': { opacity: '0', transform: 'scale(0.95)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
      },
    },
  },
  plugins: [],
} satisfies Config;
