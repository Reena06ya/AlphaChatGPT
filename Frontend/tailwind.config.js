/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#10A37F',
          dark: '#0e8f6e',
          light: '#2ec49f',
        },
        secondary: {
          DEFAULT: '#06B6D4',
        },
        darkBg: '#0D1117',
        darkCard: '#161B22',
        darkBorder: '#21262D',
        darkText: '#C9D1D9',
        darkTextMuted: '#8B949E',
      },
      borderRadius: {
        'premium': '18px',
      },
      backgroundImage: {
        'gradient-premium': 'linear-gradient(135deg, #10A37F 0%, #06B6D4 100%)',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}
