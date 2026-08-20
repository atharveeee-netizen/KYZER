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
          DEFAULT: 'var(--color-surface-card)',
          card: 'var(--color-surface-card)',
          elevated: 'var(--color-surface-elevated)',
          dark: 'var(--color-surface-dark)',
          soft: 'var(--color-surface-soft)',
        },
        hairline: {
          DEFAULT: 'var(--color-hairline)',
          soft: 'var(--color-hairline-soft)',
          strong: 'var(--color-hairline-strong)',
        },
        ink: {
          DEFAULT: 'var(--color-ink)',
          deep: 'var(--color-ink-deep)',
        },
        body: {
          DEFAULT: 'var(--color-body)',
          strong: 'var(--color-body-strong)',
        },
        muted: {
          DEFAULT: 'var(--color-muted)',
          soft: 'var(--color-muted-soft)',
        },
        primary: {
          DEFAULT: 'var(--color-primary)',
          active: 'var(--color-primary-active)',
          foreground: 'var(--color-primary-foreground)',
        },
        intent: {
          primary: 'var(--color-intent-primary)',
          success: 'var(--color-intent-success)',
          warning: 'var(--color-intent-warning)',
          danger: 'var(--color-intent-danger)',
          info: 'var(--color-intent-info)',
        },
        semantic: {
          success: 'var(--color-intent-success)',
          warning: 'var(--color-intent-warning)',
          error: 'var(--color-intent-danger)',
          info: 'var(--color-intent-info)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      borderRadius: {
        none: '0px',
        xs: '4px',
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        pill: '9999px',
        full: '9999px',
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        elevated: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        panel: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        none: 'none',
      }
    },
  },
  plugins: [],
};
