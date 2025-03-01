/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      keyframes: {
        'page-turn-out-left': {
          '0%': { transform: 'translateX(0) rotateY(0)' },
          '100%': { transform: 'translateX(-100%) rotateY(-90deg)' }
        },
        'page-turn-in-right': {
          '0%': { transform: 'translateX(100%) rotateY(90deg)' },
          '100%': { transform: 'translateX(0) rotateY(0)' }
        },
        'page-turn-out-right': {
          '0%': { transform: 'translateX(0) rotateY(0)' },
          '100%': { transform: 'translateX(100%) rotateY(90deg)' }
        },
        'page-turn-in-left': {
          '0%': { transform: 'translateX(-100%) rotateY(-90deg)' },
          '100%': { transform: 'translateX(0) rotateY(0)' }
        }
      },
      animation: {
        'page-turn-out-left': 'page-turn-out-left 0.3s ease-in-out forwards',
        'page-turn-in-right': 'page-turn-in-right 0.3s ease-in-out forwards',
        'page-turn-out-right': 'page-turn-out-right 0.3s ease-in-out forwards',
        'page-turn-in-left': 'page-turn-in-left 0.3s ease-in-out forwards'
      }
    },
  },
  plugins: [],
};