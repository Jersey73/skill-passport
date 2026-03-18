import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body:    ['Outfit', 'sans-serif'],
        mono:    ['DM Mono', 'monospace'],
      },
      colors: {
        accent: {
          primary:   '#00d4c8',
          secondary: '#0891b2',
        },
        surface: {
          void:     '#03030a',
          base:     '#07070f',
          elevated: '#111124',
        },
      },
      animation: {
        'fade-up':  'fade-up 0.6s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in':  'fade-in 0.5s ease both',
        'scale-in': 'scale-in 0.5s cubic-bezier(0.16,1,0.3,1) both',
        'float':    'float-slow 20s ease-in-out infinite',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.94)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}

export default config
