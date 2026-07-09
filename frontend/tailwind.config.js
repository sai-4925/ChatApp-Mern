/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#F0F0FE',
          100: '#E1E1FD',
          200: '#C3C4FB',
          300: '#A5A6F8',
          400: '#8183F4',
          500: '#5B5FEF',
          600: '#4448C9',
          700: '#3335A0',
          800: '#252677',
          900: '#191A52',
        },
        accent: {
          400: '#FF8A7D',
          500: '#FF6B5B',
          600: '#E5493A',
        },
        mint: {
          400: '#5EE8BE',
          500: '#2ED8A7',
          600: '#1FAF86',
        },
        surface: {
          light: '#FFFFFF',
          dark: '#1C1C2A',
        },
        canvas: {
          light: '#F7F7FB',
          dark: '#12121B',
        },
        ink: {
          light: '#16161F',
          dark: '#EDEDF4',
        },
        muted: {
          light: '#6E6E82',
          dark: '#9A9AB0',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        'bubble-sent': '18px 18px 4px 18px',
        'bubble-received': '18px 18px 18px 4px',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(46, 216, 167, 0.55)' },
          '50%': { boxShadow: '0 0 0 5px rgba(46, 216, 167, 0)' },
        },
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '0.6' },
          '100%': { transform: 'scale(2.5)', opacity: '0' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'pulse-glow': 'pulse-glow 2.2s ease-in-out infinite',
        ripple: 'ripple 0.6s ease-out',
        'fade-in-up': 'fade-in-up 0.25s ease-out',
      },
    },
  },
  plugins: [],
};
