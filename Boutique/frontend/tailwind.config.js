/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta sobria con acento llamativo
        ink: {
          DEFAULT: '#0f0f10',
          soft: '#1c1c1f',
        },
        accent: {
          DEFAULT: '#c8a24a', // dorado boutique
          dark: '#a9863a',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'serif'],
      },
      boxShadow: {
        card: '0 4px 24px -8px rgba(0,0,0,0.15)',
        soft: '0 2px 12px -4px rgba(0,0,0,0.10)',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(12px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeUp: 'fadeUp 0.5s ease forwards',
      },
    },
  },
  plugins: [],
};
