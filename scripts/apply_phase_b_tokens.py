import os

# 1. Update tailwind.config.js
tailwind_config = '''/** @type {import('tailwindcss').Config} */
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
'''

with open('frontend/tailwind.config.js', 'w', encoding='utf-8') as f:
    f.write(tailwind_config)
print('Wrote frontend/tailwind.config.js')

# 2. Update src/index.css
index_css = '''@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

/* ==========================================================================
   SEMANTIC DESIGN TOKENS (LIGHT & DARK DUAL THEME)
   ========================================================================== */

:root {
  /* Surface Palette (Light Theme) */
  --color-canvas: #FFFFFF;
  --color-canvas-soft: #F8FAFC;
  --color-surface-card: #FFFFFF;
  --color-surface-elevated: #F1F5F9;
  --color-surface-soft: #F8FAFC;
  --color-surface-dark: #0F172A;
  
  /* Hairline Borders (1px Precision) */
  --color-hairline: #E2E8F0;
  --color-hairline-soft: #F1F5F9;
  --color-hairline-strong: #CBD5E1;
  
  /* Typography & Ink */
  --color-ink: #0F172A;
  --color-ink-deep: #020617;
  --color-body: #475569;
  --color-body-strong: #1E293B;
  --color-muted: #94A3B8;
  --color-muted-soft: #CBD5E1;
  
  /* Primary Action Pill (Pure Ink Pill on Light) */
  --color-primary: #0F172A;
  --color-primary-active: #1E293B;
  --color-primary-foreground: #FFFFFF;
  
  /* Semantic Operational Status */
  --color-intent-primary: #0284C7;
  --color-intent-success: #059669;
  --color-intent-warning: #D97706;
  --color-intent-danger: #DC2626;
  --color-intent-info: #2563EB;
  
  /* Focus & Elevation */
  --color-focus-ring: rgba(2, 132, 199, 0.4);
  --color-backdrop: rgba(15, 23, 42, 0.4);
  --color-scroll-thumb: #CBD5E1;
}

.dark {
  /* Surface Palette (Dark Theme - Deep Obsidian Hierarchy) */
  --color-canvas: #0B0F14;
  --color-canvas-soft: #11161D;
  --color-surface-card: #161D26;
  --color-surface-elevated: #1E2734;
  --color-surface-soft: #141B24;
  --color-surface-dark: #070A0D;
  
  /* Hairline Borders (1px Precision) */
  --color-hairline: #222E3C;
  --color-hairline-soft: #19222D;
  --color-hairline-strong: #2D3D50;
  
  /* Typography & Ink */
  --color-ink: #F8FAFC;
  --color-ink-deep: #FFFFFF;
  --color-body: #94A3B8;
  --color-body-strong: #E2E8F0;
  --color-muted: #64748B;
  --color-muted-soft: #475569;
  
  /* Primary Action Pill (Clean Crisp Pill on Dark) */
  --color-primary: #F8FAFC;
  --color-primary-active: #E2E8F0;
  --color-primary-foreground: #0B0F14;
  
  /* Semantic Operational Status */
  --color-intent-primary: #38BDF8;
  --color-intent-success: #10B981;
  --color-intent-warning: #F59E0B;
  --color-intent-danger: #EF4444;
  --color-intent-info: #60A5FA;
  
  /* Focus & Elevation */
  --color-focus-ring: rgba(56, 189, 248, 0.4);
  --color-backdrop: rgba(0, 0, 0, 0.7);
  --color-scroll-thumb: #222E3C;
}

/* ==========================================================================
   GLOBAL BASE STYLES
   ========================================================================== */

html, body, #root {
  background-color: var(--color-canvas);
  color: var(--color-ink);
  margin: 0 !important;
  padding: 0 !important;
  min-height: 100vh;
  width: 100%;
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Subdued Tactile Grain */
.anti-ai-grain {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
  opacity: 0.02;
  mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
}

/* ==========================================================================
   COMPONENT PRIMITIVES & REUSABLE CLASSES
   ========================================================================== */

/* Modern Precision Card (12px rounded-lg with 1px hairline) */
.foundry-card {
  background-color: var(--color-surface-card);
  border: 1px solid var(--color-hairline);
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  transition: border-color 0.15s ease, background-color 0.15s ease;
}

.foundry-card:hover {
  border-color: var(--color-hairline-strong);
}

/* Geometric Pill Classification Badge */
.foundry-badge {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.02em;
  padding: 3px 10px;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  line-height: 14px;
}

/* Precision Geometric Button */
.foundry-btn {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  font-size: 13px;
  font-weight: 500;
  border-radius: 9999px;
  padding: 8px 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.15s cubic-bezier(0.16, 1, 0.3, 1);
  outline: none;
}

.foundry-btn:focus-visible {
  box-shadow: 0 0 0 2px var(--color-canvas), 0 0 0 4px var(--color-focus-ring);
}

.foundry-btn:active {
  transform: scale(0.98);
}

/* Data Table Tabular Numerals */
.tabular-nums {
  font-variant-numeric: tabular-nums;
}

/* Minimalist Dual-Theme Scrollbar */
::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--color-scroll-thumb);
  border-radius: 9999px;
}

/* Hide MapLibre attribution */
.mapboxgl-ctrl-attrib {
  display: none !important;
}
'''

with open('frontend/src/index.css', 'w', encoding='utf-8') as f:
    f.write(index_css)
print('Wrote frontend/src/index.css')