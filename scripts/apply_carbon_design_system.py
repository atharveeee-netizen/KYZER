import os

def write(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content.strip() + '\n')
    print(f'Wrote {path}')

# ==============================================================================
# 1. frontend/index.html (IBM Plex Sans & Mono fonts)
# ==============================================================================
index_html = '''<!doctype html>
<html lang="en">
 <head>
 <meta charset="UTF-8" />
 <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
 <meta name="viewport" content="width=device-width, initial-scale=1.0" />
 <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
 <meta http-equiv="Pragma" content="no-cache" />
 <meta http-equiv="Expires" content="0" />
 <title>KYZER - Health Centre Supply Logistics (Carbon Design)</title>
 <!-- IBM Plex Sans & IBM Plex Mono Fonts (Official Carbon Typography) -->
 <link rel="preconnect" href="https://fonts.googleapis.com">
 <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
 <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
 <link href="https://unpkg.com/maplibre-gl@4.1.1/dist/maplibre-gl.css" rel="stylesheet" />
 </head>
 <body class="bg-canvas text-ink font-sans antialiased selection:bg-primary/20 selection:text-ink">
 <div id="root"></div>
 <script type="module" src="/src/main.tsx"></script>
 </body>
</html>'''

write('frontend/index.html', index_html)

# ==============================================================================
# 2. frontend/src/index.css (IBM Carbon Design Tokens & 0px Geometry)
# ==============================================================================
index_css = '''@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

/* ==========================================================================
   IBM CARBON DESIGN SYSTEM TOKENS (LIGHT & DARK DUAL THEME)
   ========================================================================== */

:root {
  /* Carbon Surface Palette (White Canvas + Gray-10 Elevation) */
  --color-canvas: #FFFFFF;
  --color-canvas-soft: #F4F4F4;
  --color-surface-card: #FFFFFF;
  --color-surface-elevated: #F4F4F4;
  --color-surface-soft: #F4F4F4;
  --color-surface-dark: #161616;
  
  /* Hairline Borders (1px Carbon Precision) */
  --color-hairline: #E0E0E0;
  --color-hairline-soft: #F4F4F4;
  --color-hairline-strong: #8D8D8D;
  
  /* Carbon Typography & Ink */
  --color-ink: #161616;
  --color-ink-deep: #000000;
  --color-body: #525252;
  --color-body-strong: #161616;
  --color-muted: #6F6F6F;
  --color-muted-soft: #8D8D8D;
  
  /* IBM Blue Primary Action (Flat 0px Carbon CTA) */
  --color-primary: #0F62FE;
  --color-primary-active: #0043CE;
  --color-primary-foreground: #FFFFFF;
  
  /* Carbon Semantic Operational Status */
  --color-intent-primary: #0F62FE;
  --color-intent-success: #24A148;
  --color-intent-warning: #F1C21B;
  --color-intent-danger: #DA1E28;
  --color-intent-info: #0043CE;
  
  /* Focus Ring */
  --color-focus-ring: #0F62FE;
  --color-backdrop: rgba(22, 22, 22, 0.5);
  --color-scroll-thumb: #8D8D8D;
}

.dark {
  /* Carbon Gray-100 Theme (Obsidian & Charcoal Enterprise Hierarchy) */
  --color-canvas: #161616;
  --color-canvas-soft: #121212;
  --color-surface-card: #262626;
  --color-surface-elevated: #393939;
  --color-surface-soft: #262626;
  --color-surface-dark: #0F0F0F;
  
  /* Hairline Borders (1px Precision) */
  --color-hairline: #393939;
  --color-hairline-soft: #262626;
  --color-hairline-strong: #6F6F6F;
  
  /* Typography & Ink */
  --color-ink: #F4F4F4;
  --color-ink-deep: #FFFFFF;
  --color-body: #C6C6C6;
  --color-body-strong: #F4F4F4;
  --color-muted: #8D8D8D;
  --color-muted-soft: #6F6F6F;
  
  /* IBM Blue Primary Action (Carbon Blue-60 on Dark) */
  --color-primary: #0F62FE;
  --color-primary-active: #0043CE;
  --color-primary-foreground: #FFFFFF;
  
  /* Carbon Semantic Status */
  --color-intent-primary: #4589FF;
  --color-intent-success: #42BE65;
  --color-intent-warning: #F1C21B;
  --color-intent-danger: #FA4D56;
  --color-intent-info: #78A9FF;
  
  /* Focus Ring */
  --color-focus-ring: #4589FF;
  --color-backdrop: rgba(0, 0, 0, 0.75);
  --color-scroll-thumb: #525252;
}

/* ==========================================================================
   CARBON BASE STYLES & TYPOGRAPHY
   ========================================================================== */

html, body, #root {
  background-color: var(--color-canvas);
  color: var(--color-ink);
  margin: 0 !important;
  padding: 0 !important;
  min-height: 100vh;
  width: 100%;
  font-family: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  letter-spacing: 0.16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Carbon Light Display Treatment (Signature 300 Weight) */
.carbon-display-xl {
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 76px;
  font-weight: 300;
  line-height: 1.17;
  letter-spacing: -0.5px;
}

.carbon-display-lg {
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 60px;
  font-weight: 300;
  line-height: 1.17;
  letter-spacing: -0.4px;
}

.carbon-display-md {
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 42px;
  font-weight: 300;
  line-height: 1.20;
  letter-spacing: 0;
}

.carbon-headline-light {
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 28px;
  font-weight: 300;
  line-height: 1.25;
}

/* ==========================================================================
   CARBON COMPONENT PRIMITIVES (0px FLAT GEOMETRY)
   ========================================================================== */

/* Flat Carbon Card (0px Border Radius, 1px Hairline) */
.foundry-card, .carbon-card {
  background-color: var(--color-surface-card);
  border: 1px solid var(--color-hairline);
  border-radius: 0px !important;
  box-shadow: none !important;
  transition: border-color 0.11s ease, background-color 0.11s ease;
}

.foundry-card:hover, .carbon-card:hover {
  border-color: var(--color-hairline-strong);
}

/* Carbon Flat Badge */
.foundry-badge, .carbon-badge {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.16px;
  padding: 2px 8px;
  border-radius: 0px !important;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  line-height: 14px;
}

/* Carbon Button Primitive (0px Square Geometry, 12px 16px Padding) */
.foundry-btn, .carbon-btn {
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 0.16px;
  border-radius: 0px !important;
  padding: 10px 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background-color 0.11s ease, border-color 0.11s ease;
  outline: none;
  border: 1px solid transparent;
}

.foundry-btn:focus-visible, .carbon-btn:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: -2px;
}

.foundry-btn:active, .carbon-btn:active {
  transform: none;
}

/* Carbon Input Field (Square with Bottom Focus Underline) */
.carbon-input {
  background-color: var(--color-surface-elevated);
  color: var(--color-ink);
  border: none;
  border-bottom: 1px solid var(--color-hairline-strong);
  border-radius: 0px !important;
  padding: 11px 16px;
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 14px;
  letter-spacing: 0.16px;
  outline: none;
  transition: border-color 0.11s ease;
}

.carbon-input:focus {
  border-bottom: 2px solid var(--color-primary);
}

/* Tabular Numerals for Healthcare Inventory */
.tabular-nums {
  font-family: 'IBM Plex Mono', monospace;
  font-variant-numeric: tabular-nums;
}

/* Carbon Scrollbar */
::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--color-scroll-thumb);
  border-radius: 0px;
}

.mapboxgl-ctrl-attrib {
  display: none !important;
}'''

write('frontend/src/index.css', index_css)

# ==============================================================================
# 3. frontend/src/components/ui/Button.tsx (Carbon 0px Button)
# ==============================================================================
button_code = '''import React from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'success' | 'danger' | 'ghost' | 'outline';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-[#0F62FE] hover:bg-[#0043CE] active:bg-[#002D9C] text-white border-transparent',
  secondary: 'bg-[#393939] hover:bg-[#4C4C4C] active:bg-[#262626] text-white border-transparent',
  tertiary: 'bg-transparent hover:bg-[#0F62FE] text-[#0F62FE] hover:text-white border-[#0F62FE]',
  success: 'bg-[#24A148] hover:bg-[#198038] text-white border-transparent',
  danger: 'bg-[#DA1E28] hover:bg-[#BA1B23] text-white border-transparent',
  ghost: 'bg-transparent hover:bg-surface-elevated text-ink hover:text-primary border-transparent',
  outline: 'bg-transparent hover:bg-surface-elevated text-ink border-hairline hover:border-hairline-strong',
};

const sizeClasses: Record<ButtonSize, string> = {
  xs: 'text-[11px] px-2.5 py-1 gap-1.5',
  sm: 'text-xs px-3.5 py-1.5 gap-2',
  md: 'text-sm px-4 py-2.5 gap-2',
  lg: 'text-sm px-5 py-3 gap-2.5',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'secondary',
  size = 'sm',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  children,
  ...props
}) => {
  return (
    <button
      disabled={disabled || isLoading}
      className={`foundry-btn rounded-none font-normal select-none disabled:opacity-40 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
};'''

write('frontend/src/components/ui/Button.tsx', button_code)

# ==============================================================================
# 4. frontend/src/components/ui/Badge.tsx (Carbon 0px Flat Badge)
# ==============================================================================
badge_code = '''import React from 'react';

export type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'purple';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
  pulse?: boolean;
  size?: 'xs' | 'sm' | 'md';
  children: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string; border: string; dot: string }> = {
  primary: {
    bg: 'bg-[#0F62FE]/10',
    text: 'text-[#0F62FE] dark:text-[#4589FF]',
    border: 'border-[#0F62FE]/30',
    dot: 'bg-[#0F62FE]',
  },
  success: {
    bg: 'bg-[#24A148]/10',
    text: 'text-[#24A148] dark:text-[#42BE65]',
    border: 'border-[#24A148]/30',
    dot: 'bg-[#24A148]',
  },
  warning: {
    bg: 'bg-[#F1C21B]/15',
    text: 'text-[#B28600] dark:text-[#F1C21B]',
    border: 'border-[#F1C21B]/40',
    dot: 'bg-[#F1C21B]',
  },
  danger: {
    bg: 'bg-[#DA1E28]/10',
    text: 'text-[#DA1E28] dark:text-[#FA4D56]',
    border: 'border-[#DA1E28]/30',
    dot: 'bg-[#DA1E28]',
  },
  neutral: {
    bg: 'bg-surface-elevated',
    text: 'text-body',
    border: 'border-hairline',
    dot: 'bg-muted',
  },
  purple: {
    bg: 'bg-[#8A3FFC]/10',
    text: 'text-[#8A3FFC] dark:text-[#A56EFF]',
    border: 'border-[#8A3FFC]/30',
    dot: 'bg-[#8A3FFC]',
  },
};

const sizeStyles = {
  xs: 'text-[10px] px-2 py-0.5 leading-3',
  sm: 'text-[11px] px-2.5 py-0.5 leading-3.5',
  md: 'text-xs px-3 py-1 leading-4',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  dot = false,
  pulse = false,
  size = 'sm',
  className = '',
  children,
  ...props
}) => {
  const styles = variantStyles[variant];

  return (
    <span
      className={`foundry-badge rounded-none font-mono uppercase tracking-normal border ${styles.bg} ${styles.text} ${styles.border} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5">
          {pulse && (
            <span className={`animate-ping absolute inline-flex h-full w-full opacity-75 ${styles.dot}`} />
          )}
          <span className={`relative inline-flex h-1.5 w-1.5 ${styles.dot}`} />
        </span>
      )}
      {children}
    </span>
  );
};'''

write('frontend/src/components/ui/Badge.tsx', badge_code)

# ==============================================================================
# 5. frontend/src/components/tactical/TacticalHeader.tsx (Carbon 48px Header)
# ==============================================================================
header_code = '''import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Clock, 
  Camera, 
  Zap, 
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import { Button } from '../ui/Button';

interface TacticalHeaderProps {
  districtName?: string;
  countryCode?: 'IND' | 'ZAF' | 'BRA';
  onCountryChange?: (code: 'IND' | 'ZAF' | 'BRA') => void;
  onOpenOcrModal?: () => void;
  onOpenScenarioModal?: () => void;
  onOpenAlertsDrawer?: () => void;
  onOpenDemoGuide?: () => void;
  activeAlertCount?: number;
  isScenarioActive?: boolean;
  onResetScenario?: () => void;
}

export const TacticalHeader: React.FC<TacticalHeaderProps> = ({
  districtName = 'Pune District (MH)',
  countryCode = 'IND',
  onCountryChange,
  onOpenOcrModal,
  onOpenScenarioModal,
  onOpenAlertsDrawer,
  onOpenDemoGuide,
  activeAlertCount = 4,
  isScenarioActive = false,
  onResetScenario,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-12 bg-[#161616] border-b border-[#393939] px-4 flex items-center justify-between select-none z-30 shrink-0 text-[#F4F4F4] font-sans">
      {/* Left: Carbon Brand Logomark & Operational Subtitle */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-none bg-[#0F62FE] flex items-center justify-center font-mono font-bold text-white text-xs">
            K
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm tracking-tight text-white leading-none">
              KYZER
            </span>
            <span className="text-[11px] text-[#C6C6C6] font-light leading-none mt-0.5">
              Healthcare Supply Chain & Logistics
            </span>
          </div>
        </div>

        <div className="h-4 w-[1px] bg-[#393939] hidden sm:block mx-1" />

        {/* Live Network Status */}
        <div className="hidden md:flex items-center gap-2 text-xs text-[#C6C6C6]">
          <span className="w-2 h-2 rounded-none bg-[#24A148]" />
          <span>Pune District · 18 health centres online</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 text-xs">
        <div className="hidden lg:flex items-center gap-1.5 text-[#C6C6C6] font-mono text-[11px] px-2.5 py-1 bg-[#262626] border border-[#393939] rounded-none">
          <Clock className="w-3 h-3 text-[#8D8D8D]" />
          <span>{timeStr || '19:58'} IST</span>
        </div>

        {/* Demo Recording Guide */}
        {onOpenDemoGuide && (
          <button
            onClick={onOpenDemoGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white bg-[#262626] hover:bg-[#393939] border border-[#393939] rounded-none transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#0F62FE]" />
            <span className="hidden sm:inline">Recording Guide</span>
          </button>
        )}

        {/* Register Ingestion CTA */}
        {onOpenOcrModal && (
          <button
            onClick={onOpenOcrModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-normal text-white bg-[#0F62FE] hover:bg-[#0043CE] rounded-none transition-colors"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Scan Logbook</span>
          </button>
        )}

        {/* Test Shortage Simulation */}
        {isScenarioActive ? (
          <button
            onClick={onResetScenario}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#F1C21B] bg-[#F1C21B]/10 border border-[#F1C21B]/40 rounded-none"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Reset Test</span>
          </button>
        ) : onOpenScenarioModal ? (
          <button
            onClick={onOpenScenarioModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#C6C6C6] hover:text-white bg-[#262626] hover:bg-[#393939] border border-[#393939] rounded-none transition-colors"
          >
            <Zap className="w-3.5 h-3.5 text-[#F1C21B]" />
            <span className="hidden md:inline">Simulate Shortage</span>
          </button>
        ) : null}
      </div>
    </header>
  );
};'''

write('frontend/src/components/tactical/TacticalHeader.tsx', header_code)

# ==============================================================================
# 6. frontend/src/components/tactical/TacticalNavRail.tsx (Carbon Flat Rail)
# ==============================================================================
nav_code = '''import React from 'react';
import { 
  LayoutDashboard, 
  Map, 
  Package, 
  ArrowLeftRight, 
  Camera, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';

export type NavViewId = 'command' | 'network' | 'intelligence' | 'operations' | 'scenario' | 'ingestion';

interface TacticalNavRailProps {
  activeView: NavViewId;
  onViewChange: (view: NavViewId) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface NavItem {
  id: NavViewId;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
}

export const TacticalNavRail: React.FC<TacticalNavRailProps> = ({
  activeView,
  onViewChange,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const navItems: NavItem[] = [
    {
      id: 'command',
      label: 'Overview',
      sublabel: 'District status & needs',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'network',
      label: 'Facilities Map',
      sublabel: '18 centres & live routes',
      icon: <Map className="w-4 h-4" />,
    },
    {
      id: 'intelligence',
      label: 'Inventory',
      sublabel: 'Batches & expiry dates',
      icon: <Package className="w-4 h-4" />,
    },
    {
      id: 'operations',
      label: 'Redistribution',
      sublabel: 'Nearby stock transfers',
      icon: <ArrowLeftRight className="w-4 h-4" />,
    },
    {
      id: 'ingestion',
      label: 'Logbook Scan',
      sublabel: 'Digitize paper records',
      icon: <Camera className="w-4 h-4" />,
    },
  ];

  return (
    <nav
      className={`h-full bg-[#161616] border-r border-[#393939] flex flex-col justify-between select-none transition-all duration-150 z-20 shrink-0 ${
        isCollapsed ? 'w-14' : 'w-52'
      }`}
    >
      {/* Navigation Links */}
      <div className="py-2 space-y-0.5">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-none transition-colors text-left border-l-2 ${
                isActive
                  ? 'bg-[#262626] text-white border-[#0F62FE] font-medium'
                  : 'text-[#C6C6C6] hover:text-white hover:bg-[#262626]/60 border-transparent'
              }`}
            >
              <div className={`shrink-0 ${isActive ? 'text-[#0F62FE]' : 'text-[#8D8D8D]'}`}>
                {item.icon}
              </div>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="text-xs truncate">{item.label}</span>
                  <span className="text-[11px] text-[#8D8D8D] font-light truncate">{item.sublabel}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Collapse Footer */}
      {onToggleCollapse && (
        <div className="p-2 border-t border-[#393939]">
          <button
            onClick={onToggleCollapse}
            className="w-full flex items-center justify-center p-2 text-[#8D8D8D] hover:text-white hover:bg-[#262626] rounded-none transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      )}
    </nav>
  );
};'''

write('frontend/src/components/tactical/TacticalNavRail.tsx', nav_code)

# ==============================================================================
# 7. frontend/src/components/tactical/KpiStrip.tsx (Carbon Telemetry Bar)
# ==============================================================================
kpi_code = '''import React from 'react';
import { 
  Building2, 
  AlertCircle, 
  Truck, 
  ThermometerSnowflake 
} from 'lucide-react';

interface KpiStripProps {
  totalFacilities?: number;
  criticalCount?: number;
  warningCount?: number;
  activeTransfersCount?: number;
  coldChainTemp?: string;
  isAiLive?: boolean;
}

export const KpiStrip: React.FC<KpiStripProps> = ({
  totalFacilities = 18,
  criticalCount = 4,
  warningCount = 3,
  activeTransfersCount = 1,
  coldChainTemp = '+4.2°C',
  isAiLive = true,
}) => {
  return (
    <div className="h-9 bg-[#161616] border-t border-[#393939] px-4 flex items-center justify-between text-xs text-[#C6C6C6] select-none z-20 shrink-0 overflow-x-auto gap-4 font-sans">
      {/* Left: Operational Metrics */}
      <div className="flex items-center gap-6 shrink-0">
        <div className="flex items-center gap-2">
          <Building2 className="w-3.5 h-3.5 text-[#8D8D8D]" />
          <span>{totalFacilities} health centres tracked</span>
        </div>

        <div className="flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-[#DA1E28]" />
          <span className="text-[#DA1E28] font-normal">{criticalCount} low on stock</span>
        </div>

        <div className="flex items-center gap-2">
          <Truck className="w-3.5 h-3.5 text-[#24A148]" />
          <span>{activeTransfersCount} transfer in progress</span>
        </div>

        <div className="flex items-center gap-2">
          <ThermometerSnowflake className="w-3.5 h-3.5 text-[#0F62FE]" />
          <span>Cold chain: <strong className="text-white font-mono">{coldChainTemp}</strong> (Safe)</span>
        </div>
      </div>

      {/* Right: Operational Freshness */}
      <div className="flex items-center gap-4 shrink-0 text-[11px] text-[#8D8D8D]">
        <span>Last updated 2 min ago</span>
        <span className="flex items-center gap-1.5 text-[#24A148]">
          <span className="w-1.5 h-1.5 rounded-none bg-[#24A148]" />
          <span>Live sync</span>
        </span>
      </div>
    </div>
  );
};'''

write('frontend/src/components/tactical/KpiStrip.tsx', kpi_code)

# ==============================================================================
# 8. frontend/src/components/tactical/PriorityActionCard.tsx (Carbon Card)
# ==============================================================================
card_code = '''import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export interface PriorityAction {
  id: string;
  tier: 'P0_CRITICAL' | 'P1_WARNING';
  facilityId: string;
  facilityName: string;
  medicineName: string;
  medicineCode: string;
  currentStock: number;
  daysRemaining: number;
  donorFacilityId: string;
  donorFacilityName: string;
  recommendedUnits: number;
  distanceKm: number;
  transitTimeMin: number;
}

interface PriorityActionCardProps {
  action: PriorityAction;
  onReviewDecision: (action: PriorityAction) => void;
  onDispatchRoute: (action: PriorityAction) => void;
  isSelected?: boolean;
}

export const PriorityActionCard: React.FC<PriorityActionCardProps> = ({
  action,
  onReviewDecision,
  onDispatchRoute,
  isSelected = false,
}) => {
  const isCritical = action.tier === 'P0_CRITICAL';

  return (
    <div
      className={`p-4 rounded-none border transition-all space-y-3 font-sans ${
        isSelected 
          ? 'bg-[#262626] border-[#0F62FE]' 
          : 'bg-[#161616] border-[#393939] hover:border-[#6F6F6F]'
      }`}
    >
      {/* Header: Facility & Shortage Level */}
      <div className="flex items-center justify-between gap-2">
        <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-none border ${
          isCritical 
            ? 'bg-[#DA1E28]/15 text-[#FA4D56] border-[#DA1E28]/40' 
            : 'bg-[#F1C21B]/15 text-[#F1C21B] border-[#F1C21B]/40'
        }`}>
          {isCritical ? 'Urgent Shortage' : 'Low Stock'}
        </span>
        <span className="text-[11px] text-[#8D8D8D] font-mono">
          {action.facilityId}
        </span>
      </div>

      <div>
        <h4 className="text-sm font-normal text-white truncate">
          {action.facilityName}
        </h4>
        <p className="text-xs text-[#C6C6C6] mt-0.5 font-light">
          Needs <strong className="text-white font-mono">{action.recommendedUnits} units</strong> {action.medicineName.split(' ')[0]} ({action.daysRemaining.toFixed(1)} days left)
        </p>
      </div>

      {/* Nearby Solution Finding */}
      <div className="p-3 bg-[#262626] border border-[#393939] rounded-none text-xs space-y-1">
        <div className="text-[11px] text-[#C6C6C6]">
          Nearby source: <strong className="text-white">{action.donorFacilityName}</strong>
        </div>
        <div className="text-[11px] text-[#24A148] font-mono">
          Available: {action.distanceKm} km away · {action.transitTimeMin} min transit
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          onClick={() => onReviewDecision(action)}
          className="px-3 py-2 text-xs text-[#C6C6C6] hover:text-white bg-[#262626] hover:bg-[#393939] border border-[#393939] rounded-none transition-colors text-center"
        >
          View on Map
        </button>
        <button
          onClick={() => onDispatchRoute(action)}
          className="px-3 py-2 text-xs font-normal text-white bg-[#0F62FE] hover:bg-[#0043CE] rounded-none transition-colors flex items-center justify-center gap-1.5"
        >
          <span>Approve Transfer</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};'''

write('frontend/src/components/tactical/PriorityActionCard.tsx', card_code)

# ==============================================================================
# 9. frontend/src/components/tabs/DashboardTab.tsx (Carbon Light Display & Table)
# ==============================================================================
dashboard_code = '''import React, { useState } from 'react';
import { 
  Building2, 
  AlertCircle, 
  Truck, 
  ThermometerSnowflake, 
  ArrowRight, 
  Search, 
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { apiClient } from '../../services/api';
import { SystemAlert, HealthFacility } from '../../types';

interface HealthCentre {
  id: string;
  name: string;
  district: string;
  stockLevel: number;
  status: 'CRITICAL' | 'WARNING' | 'STABLE';
  daysLeft: number;
  dailyRunRate: number;
  lat: number;
  lng: number;
}

const DISTRICT_CENTRES: HealthCentre[] = [
  { id: 'PHC-PUN-002', name: 'Koregaon Bhima PHC', district: 'Pune Rural', stockLevel: 130, status: 'CRITICAL', daysLeft: 2.8, dailyRunRate: 46, lat: 18.6534, lng: 74.0624 },
  { id: 'PHC-PUN-004', name: 'Talegaon Dhamdhere PHC', district: 'Pune Rural', stockLevel: 820, status: 'STABLE', daysLeft: 16.4, dailyRunRate: 50, lat: 18.6789, lng: 74.1512 },
  { id: 'PHC-PUN-003', name: 'Shikrapur Health Centre', district: 'Pune Rural', stockLevel: 280, status: 'WARNING', daysLeft: 5.6, dailyRunRate: 50, lat: 18.7368, lng: 74.1567 },
  { id: 'PHC-PUN-001', name: 'Shirur Sub-District Hospital Depot', district: 'Pune District', stockLevel: 12000, status: 'STABLE', daysLeft: 42.0, dailyRunRate: 285, lat: 18.8265, lng: 74.3789 },
  { id: 'PHC-PUN-005', name: 'Khed Primary Health Centre', district: 'Pune Rural', stockLevel: 450, status: 'STABLE', daysLeft: 11.2, dailyRunRate: 40, lat: 18.8475, lng: 73.9167 },
  { id: 'PHC-PUN-006', name: 'Manchar Community Health Centre', district: 'Pune Rural', stockLevel: 190, status: 'WARNING', daysLeft: 4.2, dailyRunRate: 45, lat: 19.0062, lng: 73.9442 },
];

interface DashboardTabProps {
  facilities?: HealthFacility[];
  alerts?: SystemAlert[];
  onNavigateTab?: (tab: string) => void;
  onSimulateOutbreak?: () => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  facilities: initialFacilities,
  alerts,
  onNavigateTab,
  onSimulateOutbreak,
}) => {
  const [centres, setCentres] = useState<HealthCentre[]>(DISTRICT_CENTRES);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [transferApproved, setTransferApproved] = useState<boolean>(false);

  const criticalCount = centres.filter(c => c.status === 'CRITICAL').length;
  const warningCount = centres.filter(c => c.status === 'WARNING').length;

  const handleApproveTransfer = async () => {
    setIsLoading(true);
    try {
      await apiClient.allocateStock('PHC-PUN-002', 'MED-PCM-500', 450);
    } catch (e) {
      console.warn('Simulating local transfer for demo');
    }

    setTimeout(() => {
      setCentres(prev => prev.map(c => {
        if (c.id === 'PHC-PUN-002') return { ...c, stockLevel: 580, status: 'STABLE', daysLeft: 12.6 };
        if (c.id === 'PHC-PUN-004') return { ...c, stockLevel: 370, daysLeft: 7.4 };
        return c;
      }));
      setTransferApproved(true);
      setIsLoading(false);
    }, 900);
  };

  const filteredCentres = searchFilter
    ? centres.filter(c => c.name.toLowerCase().includes(searchFilter.toLowerCase()) || c.id.toLowerCase().includes(searchFilter.toLowerCase()))
    : centres;

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6 font-sans text-[#F4F4F4]">
      
      {/* 1. Page Header with Carbon Light Display Headline */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#393939]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-white">
            District Supply Overview
          </h1>
          <p className="text-xs text-[#C6C6C6] mt-1 font-light">
            Tracking essential medicine stock, run-rates, and peer redistribution across 18 health centres.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onSimulateOutbreak && (
            <button
              onClick={onSimulateOutbreak}
              className="px-3.5 py-2 text-xs text-[#C6C6C6] hover:text-white bg-[#262626] hover:bg-[#393939] border border-[#393939] rounded-none transition-colors"
            >
              Test Shortage Surge
            </button>
          )}
        </div>
      </div>

      {/* 2. Today's Network Summary Strip (Carbon 0px Tiles) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-[#161616] border border-[#393939] rounded-none">
          <div className="text-[11px] text-[#8D8D8D]">Health centres</div>
          <div className="text-2xl font-light text-white mt-1 font-mono">18 active</div>
          <div className="text-[11px] text-[#24A148] mt-1">All reporting today</div>
        </div>

        <div className="p-4 bg-[#161616] border border-[#393939] rounded-none">
          <div className="text-[11px] text-[#8D8D8D]">Stock status</div>
          <div className="text-2xl font-light text-[#DA1E28] mt-1 font-mono">
            {criticalCount > 0 ? `${criticalCount} urgent shortage` : 'Normal'}
          </div>
          <div className="text-[11px] text-[#C6C6C6] mt-1">{warningCount} low-stock items</div>
        </div>

        <div className="p-4 bg-[#161616] border border-[#393939] rounded-none">
          <div className="text-[11px] text-[#8D8D8D]">Redistribution</div>
          <div className="text-2xl font-light text-[#24A148] mt-1 font-mono">
            {transferApproved ? '1 resolved' : '1 available nearby'}
          </div>
          <div className="text-[11px] text-[#C6C6C6] mt-1">Talegaon → Koregaon (9.8 km)</div>
        </div>

        <div className="p-4 bg-[#161616] border border-[#393939] rounded-none">
          <div className="text-[11px] text-[#8D8D8D]">Cold-chain integrity</div>
          <div className="text-2xl font-light text-[#0F62FE] mt-1 font-mono">+4.2°C</div>
          <div className="text-[11px] text-[#24A148] mt-1">Within +2°C to +8°C window</div>
        </div>
      </div>

      {/* 3. Hero Operational Section: Active Shortage & Recommended Transfer */}
      <div className="p-5 bg-[#161616] border border-[#393939] rounded-none space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-normal text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-none bg-[#DA1E28]" />
            <span>Active Shortage & Recommended Transfer</span>
          </h2>
          <span className="text-xs text-[#8D8D8D] font-mono">Source: Real-time clinic stock</span>
        </div>

        {transferApproved ? (
          <div className="p-4 bg-[#24A148]/10 border border-[#24A148]/40 rounded-none flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#24A148] shrink-0" />
              <div>
                <div className="text-sm font-medium text-white">Transfer Approved & Recorded</div>
                <div className="text-xs text-[#C6C6C6] mt-0.5 font-light">
                  450 units Paracetamol 500mg dispatched from Talegaon Dhamdhere (PHC-PUN-004) to Koregaon Bhima (PHC-PUN-002). ETA: 18 minutes.
                </div>
              </div>
            </div>
            <span className="text-xs font-mono text-[#24A148] px-3 py-1 bg-[#24A148]/20 border border-[#24A148]/40 rounded-none">
              RESOLVED
            </span>
          </div>
        ) : (
          <div className="p-4 bg-[#262626] border border-[#393939] rounded-none space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Problem */}
              <div className="space-y-1.5">
                <div className="text-[11px] text-[#FA4D56] font-mono uppercase">1. Shortage at Centre</div>
                <div className="text-sm font-normal text-white">Koregaon Bhima PHC</div>
                <div className="text-xs text-[#C6C6C6] font-light leading-relaxed">
                  Has <strong className="text-white font-mono">130 units</strong> Paracetamol 500mg (2.8 days left at 46 units/day). Needs 450 units.
                </div>
              </div>

              {/* Nearby Source */}
              <div className="space-y-1.5">
                <div className="text-[11px] text-[#24A148] font-mono uppercase">2. Found Nearby Surplus</div>
                <div className="text-sm font-normal text-white">Talegaon Dhamdhere PHC</div>
                <div className="text-xs text-[#C6C6C6] font-light leading-relaxed">
                  Has <strong className="text-white font-mono">820 units</strong> available. Distance: <strong className="text-white font-mono">9.8 km</strong> (18 min road transit).
                </div>
              </div>

              {/* Recommendation & Action */}
              <div className="space-y-1.5">
                <div className="text-[11px] text-[#0F62FE] font-mono uppercase">3. Recommendation</div>
                <div className="text-xs text-[#C6C6C6] font-light leading-relaxed">
                  Transfer <strong className="text-white font-mono">450 units</strong>. Source still keeps 370 units (7.4 days buffer).
                </div>
                <button
                  onClick={handleApproveTransfer}
                  disabled={isLoading}
                  className="mt-2 w-full px-4 py-2.5 text-xs font-normal text-white bg-[#0F62FE] hover:bg-[#0043CE] rounded-none transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>{isLoading ? 'Recording transfer...' : 'Approve Transfer (450 units)'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Practical Facility Inventory Table (Carbon 1px Hairline Table) */}
      <div className="p-5 bg-[#161616] border border-[#393939] rounded-none space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-normal text-white">Facility Stock & Run-Rates</h2>
            <p className="text-xs text-[#C6C6C6] font-light">Essential medicines inventory across Pune District</p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#8D8D8D]" />
            <input
              type="text"
              placeholder="Search facility name or ID..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="pl-8 pr-4 py-2 text-xs bg-[#262626] border-b border-[#6F6F6F] focus:border-[#0F62FE] rounded-none text-white placeholder-[#8D8D8D] focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto border border-[#393939] rounded-none">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#262626] text-[#C6C6C6] border-b border-[#393939]">
              <tr>
                <th className="p-3 font-normal">Health Centre</th>
                <th className="p-3 font-normal">District</th>
                <th className="p-3 font-normal">Paracetamol 500mg</th>
                <th className="p-3 font-normal">Daily Consumption</th>
                <th className="p-3 font-normal">Days Remaining</th>
                <th className="p-3 font-normal">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#393939]">
              {filteredCentres.map((c) => (
                <tr key={c.id} className="hover:bg-[#262626]/50 transition-colors">
                  <td className="p-3 text-white">
                    <div className="font-normal">{c.name}</div>
                    <div className="text-[10px] text-[#8D8D8D] font-mono">{c.id}</div>
                  </td>
                  <td className="p-3 text-[#C6C6C6] font-light">{c.district}</td>
                  <td className="p-3 font-mono text-white">{c.stockLevel} units</td>
                  <td className="p-3 font-mono text-[#C6C6C6]">{c.dailyRunRate} / day</td>
                  <td className="p-3 font-mono">
                    <span className={c.daysLeft <= 3 ? 'text-[#FA4D56]' : c.daysLeft <= 6 ? 'text-[#F1C21B]' : 'text-[#24A148]'}>
                      {c.daysLeft} days
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-none border ${
                      c.status === 'CRITICAL' 
                        ? 'bg-[#DA1E28]/15 text-[#FA4D56] border-[#DA1E28]/40' 
                        : c.status === 'WARNING' 
                        ? 'bg-[#F1C21B]/15 text-[#F1C21B] border-[#F1C21B]/40' 
                        : 'bg-[#24A148]/15 text-[#24A148] border-[#24A148]/40'
                    }`}>
                      {c.status === 'CRITICAL' ? 'Urgent Shortage' : c.status === 'WARNING' ? 'Low Stock' : 'Adequate'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};'''

write('frontend/src/components/tabs/DashboardTab.tsx', dashboard_code)

print('IBM Carbon Design System applied successfully!')