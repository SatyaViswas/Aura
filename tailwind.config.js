/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // Enable manual dark mode toggling via the `dark` class on <html>
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ── Theme adaptation via CSS variables ──────────────────────────────
        background: 'var(--color-background)',
        surface:    'var(--color-surface)',
        border:     'var(--color-border)',
        primary: {
          DEFAULT:  'var(--color-primary)',
        },
        text: {
          primary:   'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
        },
        alert: {
          DEFAULT:  'var(--color-alert)',
        },

        // ── Direct hex aliases for dark mode fallback/compatibility ─────────
        dark: {
          background: '#1A1A1A',
          surface:    '#262626',
          primary:    '#6D8C7E',
          text:       '#FBFBF9',
          secondary:  '#A3A3A3',
          mist:       '#2E3A35',
        },
      },
      borderRadius: {
        'lg': '1rem',
        'xl': '1.5rem',
      },
      boxShadow: {
        'natural':      'var(--shadow-natural)',
      }
    },
  },
  plugins: [],
}
