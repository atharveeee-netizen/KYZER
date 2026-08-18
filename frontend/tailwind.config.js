/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: '#f7f7f4',
          soft: '#fafaf7',
        },
        surface: {
          card: '#ffffff',
          strong: '#e6e5e0',
        },
        hairline: {
          DEFAULT: '#e6e5e0',
          soft: '#efeee8',
          strong: '#cfcdc4',
        },
        ink: '#26251e',
        body: {
          DEFAULT: '#5a5852',
          strong: '#26251e',
        },
        muted: {
          DEFAULT: '#807d72',
          soft: '#a09c92',
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
          success: '#1f8a65',
          error: '#cf2d56',
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
