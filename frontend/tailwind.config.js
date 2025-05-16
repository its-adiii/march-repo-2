/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#F4694C',
        secondary: '#4A90E2',
        background: '#F5F7FA',
      },
      boxShadow: {
        'custom': '0 4px 6px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
}
