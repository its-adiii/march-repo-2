/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Cormorant Garamond', 'serif'],
      },
      colors: {
        charcoal: {
          900: '#0A0A0A',
          800: '#141414',
          700: '#1E1E1E',
          600: '#2C2C2C',
          500: '#3D3D3D',
        },
        gold: {
          300: '#FDE68A',
          400: '#D4AF37', // Refined classic gold
          500: '#B8860B', // Dark goldenrod
          600: '#AA6C39',
        },
        cream: {
          50: '#FDFBF7',
          100: '#F6F3EC',
          200: '#E8E2D2',
        }
      },
      animation: {
        'blob': 'blob 10s infinite',
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        }
      }
    },
  },
  plugins: [],
}
