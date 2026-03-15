/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./*.js"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        netflix: {
          red: '#e50914',
          dark: '#141414',
          gray: '#181818',
          lightGray: '#222222'
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      }
    },
  },
  plugins: [],
}
