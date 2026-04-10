/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      colors: {
        brand: {
          50:  '#f0f0ff',
          100: '#e4e4ff',
          200: '#cecefd',
          300: '#b7b4fb', // 2. Added this missing color
          400: '#9b94f8',
          500: '#7c6ff1',
          600: '#6a57e8',
          700: '#5a45d4',
          800: '#4737ab',
          900: '#3a2d87',
        },
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'spin-slow':   'spin 3s linear infinite',
        'wiggle':      'wiggle 0.5s ease-in-out',
        'float':       'float 3s ease-in-out infinite',
      },
      keyframes: {
        wiggle: {
          '0%,100%': { transform: 'rotate(-3deg)' },
          '50%':     { transform: 'rotate(3deg)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%':     { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
}
