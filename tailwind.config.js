/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          50: '#fbfbfa',
          100: '#f6f5f0',
          200: '#eeebe2',
          300: '#e1dccf',
          800: '#423f37',
          900: '#23221e',
        },
        ink: {
          950: '#0c0d0e',
          900: '#14171a',
          800: '#26292d',
          700: '#3e4348',
          600: '#5c636b',
        },
        forest: {
          900: '#0d2818',
          800: '#164328',
          700: '#1f5936',
          600: '#2d7a4c',
          500: '#3d9961',
          100: '#e7f5ec',
          50: '#f2faf5',
        },
        gilded: {
          600: '#b45309',
          500: '#d97706',
          400: '#f59e0b',
          100: '#fef3c7',
          50: '#fffbeb',
        }
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans: ['var(--font-jakarta)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'book': '0 8px 24px -4px rgba(20, 23, 26, 0.12), 0 2px 6px -1px rgba(20, 23, 26, 0.08)',
        'book-spine': 'inset 4px 0 8px -2px rgba(0, 0, 0, 0.25), 0 10px 20px -3px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
}
