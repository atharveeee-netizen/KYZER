/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: 'var(--color-canvas)',
          soft: 'var(--color-canvas-soft)',
        },
        surface: {
          card: 'var(--color-surface-card)',
          strong: 'var(--color-surface-strong)',
        },
        hairline: {
          DEFAULT: 'var(--color-hairline)',
          soft: 'var(--color-hairline-soft)',
          strong: 'var(--color-hairline-strong)',
        },
        ink: 'var(--color-ink)',
        body: {
          DEFAULT: 'var(--color-body)',
          strong: 'var(--color-body-strong)',
        },
        muted: {
          DEFAULT: 'var(--color-muted)',
          soft: 'var(--color-muted-soft)',
        },
        primary: {
          DEFAULT: '#f54e00',
          active: '#d04200',
        },
        timeline: {
          thinking: '#dfa88f', // Peach
          grep: '#9fc9a2',     // Mint
          read: '#9fbbe0',     // Pastel blue
          edit: '#c0a8dd',     // Lavender
          done: '#c08532',     // Warm gold
        },
        semantic: {
          success: '#10b981',
          error: '#ef4444',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        xs: '4px',
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        pill: '9999px',
      }
    },
  },
  plugins: [],
};
