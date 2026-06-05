/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#FBFBF9', // soft warm cream prose
        surface: '#FFFFFF', // pure white canvas
        primary: {
          DEFAULT: '#4A6B5D', // muted serene sage green
        },
        text: {
          primary: '#2A2A2A', // warm charcoal
          secondary: '#767676', // soft dynamic gray
        },
        alert: {
          DEFAULT: '#DCE4E0', // ultra-soft sage mist
        }
      },
      borderRadius: {
        'lg': '1rem',
        'xl': '1.5rem',
      },
      boxShadow: {
        'natural': '0 10px 40px -10px rgba(42,42,42,0.04)',
      }
    },
  },
  plugins: [],
}
