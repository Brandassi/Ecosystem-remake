/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 0 0 1px rgba(125, 211, 252, 0.12), 0 24px 70px rgba(0,0,0,0.35)',
      },
      colors: {
        brand: {
          50: '#effaf6',
          100: '#d7f5e8',
          200: '#aeebcf',
          300: '#74dbad',
          400: '#3cc98a',
          500: '#18b474',
          600: '#10955f',
          700: '#0f774d',
          800: '#105d41',
          900: '#0d4c35',
        },
        ink: {
          950: '#08111d',
        },
      },
      borderRadius: {
        '2xl': '1.25rem',
      },
      backgroundImage: {
        'hero-grid': 'radial-gradient(circle at top left, rgba(56, 189, 248, 0.14), transparent 30%), radial-gradient(circle at top right, rgba(52, 211, 153, 0.14), transparent 28%), linear-gradient(180deg, #09111d 0%, #07111d 100%)',
      },
    },
  },
  plugins: [],
};
