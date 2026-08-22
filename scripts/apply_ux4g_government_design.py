import os

def write(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content.strip() + '\n')
    print(f'Wrote {path}')

# ==============================================================================
# 1. frontend/index.html (Noto Sans Typography & Government Meta)
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
 <title>KYZER — Healthcare Supply Management System | Pune District</title>
 <!-- Noto Sans & Noto Sans Mono (Official UX4G / GIGW Indian Public Health Standard) -->
 <link rel="preconnect" href="https://fonts.googleapis.com">
 <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
 <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Mono:wght@400;500;600&family=Noto+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">
 <link href="https://unpkg.com/maplibre-gl@4.1.1/dist/maplibre-gl.css" rel="stylesheet" />
 </head>
 <body class="bg-[#F7F7F7] text-[#202124] font-sans antialiased selection:bg-[#174A7C]/15 selection:text-[#174A7C]">
 <div id="root"></div>
 <script type="module" src="/src/main.tsx"></script>
 </body>
</html>'''

write('frontend/index.html', index_html)

# ==============================================================================
# 2. frontend/src/index.css (UX4G / GIGW 3.0 Government Health Palette & 2px Geometry)
# ==============================================================================
index_css = '''@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Mono:wght@400;500;600&family=Noto+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

/* ==========================================================================
   UX4G & GIGW 3.0 GOVERNMENT OF INDIA DESIGN TOKENS (LIGHT & DARK)
   ========================================================================== */

:root {
  /* Surface Palette (Light Theme: Neutral Public Health Portal) */
  --color-canvas: #F7F7F7;
  --color-canvas-soft: #EDEDED;
  --color-surface-card: #FFFFFF;
  --color-surface-elevated: #FFFFFF;
  --color-surface-soft: #F9F9F9;
  --color-surface-dark: #202124;
  
  /* Hairline Borders (1px Neutral Border) */
  --color-hairline: #D6D6D6;
  --color-hairline-soft: #E5E5E5;
  --color-hairline-strong: #9AA0A6;
  
  /* Text & Ink */
  --color-ink: #202124;
  --color-ink-deep: #000000;
  --color-body: #5F6368;
  --color-body-strong: #202124;
  --color-muted: #70757A;
  --color-muted-soft: #9AA0A6;
  
  /* Primary Accent: UX4G Government Navy */
  --color-primary: #174A7C;
  --color-primary-active: #123B63;
  --color-primary-foreground: #FFFFFF;
  
  /* Subtle Government Operational Status (Restrained) */
  --color-intent-primary: #174A7C;
  --color-intent-success: #2F6B45;
  --color-intent-warning: #8A6418;
  --color-intent-danger: #A33A3A;
  --color-intent-info: #174A7C;
  
  /* Focus Ring */
  --color-focus-ring: #174A7C;
  --color-backdrop: rgba(32, 33, 36, 0.4);
  --color-scroll-thumb: #D6D6D6;
}

.dark {
  /* Dark Mode (Functional Public Sector Dark Theme) */
  --color-canvas: #1B1B1B;
  --color-canvas-soft: #141414;
  --color-surface-card: #242424;
  --color-surface-elevated: #2D2D2D;
  --color-surface-soft: #242424;
  --color-surface-dark: #121212;
  
  /* Hairline Borders */
  --color-hairline: #3A3A3A;
  --color-hairline-soft: #2E2E2E;
  --color-hairline-strong: #5A5A5A;
  
  /* Typography & Ink */
  --color-ink: #F2F2F2;
  --color-ink-deep: #FFFFFF;
  --color-body: #B8B8B8;
  --color-body-strong: #F2F2F2;
  --color-muted: #8E8E8E;
  --color-muted-soft: #707070;
  
  /* Primary Accent */
  --color-primary: #6EA8D8;
  --color-primary-active: #5394C9;
  --color-primary-foreground: #1B1B1B;
  
  /* Subtle Status */
  --color-intent-primary: #6EA8D8;
  --color-intent-success: #4E9A68;
  --color-intent-warning: #D4A338;
  --color-intent-danger: #D96565;
  --color-intent-info: #6EA8D8;
  
  /* Focus Ring */
  --color-focus-ring: #6EA8D8;
  --color-backdrop: rgba(0, 0, 0, 0.7);
  --color-scroll-thumb: #3A3A3A;
}

/* ==========================================================================
   BASE STYLES & TYPOGRAPHY
   ========================================================================== */

html, body, #root {
  background-color: var(--color-canvas);
  color: var(--color-ink);
  margin: 0 !important;
  padding: 0 !important;
  min-height: 100vh;
  width: 100%;
  font-family: 'Noto Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ==========================================================================
   UX4G COMPONENT PRIMITIVES (2px RECTANGULAR GEOMETRY, 0 GRADIENTS)
   ========================================================================== */

/* Government Card (2px Micro-radius, 1px Hairline, 0 Shadow) */
.foundry-card, .gov-card {
  background-color: var(--color-surface-card);
  border: 1px solid var(--color-hairline);
  border-radius: 2px !important;
  box-shadow: none !important;
  transition: border-color 0.12s ease;
}

.foundry-card:hover, .gov-card:hover {
  border-color: var(--color-hairline-strong);
}

/* Government Status Badge (Subtle 2px Rectangular Chip) */
.foundry-badge, .gov-badge {
  font-family: 'Noto Sans', sans-serif;
  font-size: 11px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 2px !important;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  line-height: 16px;
}

/* Government Button (2px Rectangular, Plain & Functional) */
.foundry-btn, .gov-btn {
  font-family: 'Noto Sans', sans-serif;
  font-size: 13px;
  font-weight: 500;
  border-radius: 2px !important;
  padding: 7px 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.12s ease;
  outline: none;
  border: 1px solid transparent;
}

.foundry-btn:focus-visible, .gov-btn:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 1px;
}

.foundry-btn:active, .gov-btn:active {
  transform: none;
}

/* Form Input */
.gov-input {
  background-color: var(--color-surface-card);
  color: var(--color-ink);
  border: 1px solid var(--color-hairline);
  border-radius: 2px !important;
  padding: 7px 12px;
  font-family: 'Noto Sans', sans-serif;
  font-size: 13px;
  outline: none;
  transition: border-color 0.12s ease;
}

.gov-input:focus {
  border-color: var(--color-primary);
  outline: 1px solid var(--color-primary);
}

/* Monospace numerals */
.tabular-nums {
  font-family: 'Noto Sans Mono', monospace;
  font-variant-numeric: tabular-nums;
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--color-scroll-thumb);
  border-radius: 2px;
}

.mapboxgl-ctrl-attrib {
  display: none !important;
}'''

write('frontend/src/index.css', index_css)

# ==============================================================================
# 3. frontend/src/components/ui/Button.tsx (UX4G Government Button)
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
  primary: 'bg-[#174A7C] hover:bg-[#123B63] text-white border-transparent shadow-none',
  secondary: 'bg-white dark:bg-[#242424] hover:bg-[#F7F7F7] dark:hover:bg-[#2D2D2D] text-[#202124] dark:text-[#F2F2F2] border-[#D6D6D6] dark:border-[#3A3A3A]',
  tertiary: 'bg-transparent text-[#174A7C] dark:text-[#6EA8D8] hover:underline border-transparent px-0',
  success: 'bg-[#2F6B45] hover:bg-[#235335] text-white border-transparent',
  danger: 'bg-[#A33A3A] hover:bg-[#802D2D] text-white border-transparent',
  ghost: 'bg-transparent hover:bg-[#EDEDED] dark:hover:bg-[#2D2D2D] text-[#5F6368] dark:text-[#B8B8B8] hover:text-[#202124] dark:hover:text-white border-transparent',
  outline: 'bg-transparent text-[#202124] dark:text-[#F2F2F2] border-[#D6D6D6] dark:border-[#3A3A3A] hover:bg-[#EDEDED] dark:hover:bg-[#2D2D2D]',
};

const sizeClasses: Record<ButtonSize, string> = {
  xs: 'text-xs px-2.5 py-1 gap-1',
  sm: 'text-xs px-3 py-1.5 gap-1.5',
  md: 'text-xs px-4 py-2 gap-2 font-medium',
  lg: 'text-sm px-5 py-2.5 gap-2 font-medium',
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
      className={`foundry-btn rounded-[2px] font-sans select-none disabled:opacity-40 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
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
# 4. frontend/src/components/ui/Badge.tsx (UX4G Government Status Chip)
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
    bg: 'bg-[#174A7C]/10 dark:bg-[#174A7C]/20',
    text: 'text-[#174A7C] dark:text-[#6EA8D8]',
    border: 'border-[#174A7C]/30',
    dot: 'bg-[#174A7C]',
  },
  success: {
    bg: 'bg-[#2F6B45]/10 dark:bg-[#2F6B45]/20',
    text: 'text-[#2F6B45] dark:text-[#4E9A68]',
    border: 'border-[#2F6B45]/30',
    dot: 'bg-[#2F6B45]',
  },
  warning: {
    bg: 'bg-[#8A6418]/10 dark:bg-[#8A6418]/20',
    text: 'text-[#8A6418] dark:text-[#D4A338]',
    border: 'border-[#8A6418]/30',
    dot: 'bg-[#8A6418]',
  },
  danger: {
    bg: 'bg-[#A33A3A]/10 dark:bg-[#A33A3A]/20',
    text: 'text-[#A33A3A] dark:text-[#D96565]',
    border: 'border-[#A33A3A]/30',
    dot: 'bg-[#A33A3A]',
  },
  neutral: {
    bg: 'bg-[#F7F7F7] dark:bg-[#242424]',
    text: 'text-[#5F6368] dark:text-[#B8B8B8]',
    border: 'border-[#D6D6D6] dark:border-[#3A3A3A]',
    dot: 'bg-[#70757A]',
  },
  purple: {
    bg: 'bg-[#174A7C]/10',
    text: 'text-[#174A7C]',
    border: 'border-[#174A7C]/30',
    dot: 'bg-[#174A7C]',
  },
};

const sizeStyles = {
  xs: 'text-[11px] px-2 py-0.5 leading-tight',
  sm: 'text-xs px-2.5 py-0.5 leading-tight',
  md: 'text-xs px-3 py-1 leading-tight',
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
      className={`foundry-badge rounded-[2px] font-sans font-medium border ${styles.bg} ${styles.text} ${styles.border} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5">
          <span className={`inline-flex h-1.5 w-1.5 rounded-full ${styles.dot}`} />
        </span>
      )}
      {children}
    </span>
  );
};'''

write('frontend/src/components/ui/Badge.tsx', badge_code)

# ==============================================================================
# 5. frontend/src/components/tactical/TacticalHeader.tsx (UX4G Government Header)
# ==============================================================================
header_code = '''import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Clock, 
  Camera, 
  Zap, 
  CheckCircle2,
  BookOpen,
  PhoneCall
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
    <div className="flex flex-col z-30 shrink-0 select-none font-sans">
      {/* 1. Top Government of India Public-Service Ribbon (UX4G Standard) */}
      <div className="h-6 bg-[#EFEFEF] dark:bg-[#141414] border-b border-[#D6D6D6] dark:border-[#3A3A3A] px-4 flex items-center justify-between text-[11px] text-[#5F6368] dark:text-[#B8B8B8]">
        <div className="flex items-center gap-3">
          <span className="font-medium text-[#202124] dark:text-[#F2F2F2]">
            Government of India
          </span>
          <span className="hidden sm:inline text-[#9AA0A6]">|</span>
          <span className="hidden sm:inline">
            Ministry of Health & Family Welfare · Public Health Infrastructure
          </span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="hidden md:inline">Helpline: <strong className="text-[#202124] dark:text-[#F2F2F2]">104 / 14555</strong></span>
          <span>District: <strong className="text-[#174A7C] dark:text-[#6EA8D8]">Pune (MH)</strong></span>
          <span>English</span>
        </div>
      </div>

      {/* 2. Main Portal Header */}
      <header className="h-13 bg-[#FFFFFF] dark:bg-[#242424] border-b border-[#D6D6D6] dark:border-[#3A3A3A] px-4 py-2 flex items-center justify-between text-[#202124] dark:text-[#F2F2F2]">
        {/* Left: KYZER System Branding & District Context */}
        <div className="flex items-center gap-3.5">
          <div className="w-7 h-7 rounded-[2px] bg-[#174A7C] flex items-center justify-center font-bold text-white text-sm">
            K
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-[#174A7C] dark:text-[#6EA8D8] leading-none">
                KYZER
              </span>
              <span className="text-xs text-[#5F6368] dark:text-[#B8B8B8] font-normal leading-none">
                Healthcare Supply Management System
              </span>
            </div>
            <span className="text-[11px] text-[#5F6368] dark:text-[#B8B8B8] leading-none mt-1">
              Pune District Health Administration · 18 Health Facilities
            </span>
          </div>
        </div>

        {/* Right: Operational Actions */}
        <div className="flex items-center gap-2.5 text-xs">
          <div className="hidden lg:flex items-center gap-1 text-[#5F6368] dark:text-[#B8B8B8] font-mono text-[11px] px-2.5 py-1 bg-[#F7F7F7] dark:bg-[#1B1B1B] border border-[#D6D6D6] dark:border-[#3A3A3A] rounded-[2px]">
            <Clock className="w-3 h-3 text-[#70757A]" />
            <span>{timeStr || '19:58'} IST</span>
          </div>

          {/* Recording Guide */}
          {onOpenDemoGuide && (
            <button
              onClick={onOpenDemoGuide}
              className="flex items-center gap-1.5 px-3 py-1 text-xs text-[#202124] dark:text-[#F2F2F2] bg-[#F7F7F7] dark:bg-[#1B1B1B] hover:bg-[#EDEDED] dark:hover:bg-[#2D2D2D] border border-[#D6D6D6] dark:border-[#3A3A3A] rounded-[2px] transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#174A7C] dark:text-[#6EA8D8]" />
              <span className="hidden sm:inline">Recording Guide</span>
            </button>
          )}

          {/* Scan Logbook CTA */}
          {onOpenOcrModal && (
            <button
              onClick={onOpenOcrModal}
              className="flex items-center gap-1.5 px-3.5 py-1 text-xs font-medium text-white bg-[#174A7C] hover:bg-[#123B63] rounded-[2px] transition-colors"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Scan Paper Logbook</span>
            </button>
          )}

          {/* Test Shortage Simulation */}
          {isScenarioActive ? (
            <button
              onClick={onResetScenario}
              className="flex items-center gap-1 px-3 py-1 text-xs text-[#8A6418] bg-[#8A6418]/10 border border-[#8A6418]/40 rounded-[2px]"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Reset Test</span>
            </button>
          ) : onOpenScenarioModal ? (
            <button
              onClick={onOpenScenarioModal}
              className="flex items-center gap-1 px-3 py-1 text-xs text-[#5F6368] dark:text-[#B8B8B8] hover:text-[#202124] dark:hover:text-white bg-[#F7F7F7] dark:bg-[#1B1B1B] hover:bg-[#EDEDED] dark:hover:bg-[#2D2D2D] border border-[#D6D6D6] dark:border-[#3A3A3A] rounded-[2px] transition-colors"
            >
              <Zap className="w-3.5 h-3.5 text-[#8A6418]" />
              <span className="hidden md:inline">Test Shortage</span>
            </button>
          ) : null}
        </div>
      </header>
    </div>
  );
};'''

write('frontend/src/components/tactical/TacticalHeader.tsx', header_code)

# ==============================================================================
# 6. frontend/src/components/tactical/TacticalNavRail.tsx (UX4G Navigation)
# ==============================================================================
nav_code = '''import React from 'react';
import { 
  LayoutDashboard, 
  Map, 
  Package, 
  ArrowLeftRight, 
  Camera, 
  ChevronLeft, 
  ChevronRight,
  Landmark
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
      label: 'Dashboard',
      sublabel: 'District supply status',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'network',
      label: 'Facilities Map',
      sublabel: '18 centres & transit',
      icon: <Map className="w-4 h-4" />,
    },
    {
      id: 'intelligence',
      label: 'Inventory',
      sublabel: 'Stock on hand & batches',
      icon: <Package className="w-4 h-4" />,
    },
    {
      id: 'operations',
      label: 'Redistribution',
      sublabel: 'Peer stock transfers',
      icon: <ArrowLeftRight className="w-4 h-4" />,
    },
    {
      id: 'ingestion',
      label: 'Logbook Scan',
      sublabel: 'Paper register entry',
      icon: <Camera className="w-4 h-4" />,
    },
  ];

  return (
    <nav
      className={`h-full bg-[#FFFFFF] dark:bg-[#242424] border-r border-[#D6D6D6] dark:border-[#3A3A3A] flex flex-col justify-between select-none transition-all duration-120 z-20 shrink-0 font-sans ${
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
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-[2px] transition-colors text-left border-l-3 ${
                isActive
                  ? 'bg-[#174A7C]/10 dark:bg-[#174A7C]/25 text-[#174A7C] dark:text-[#6EA8D8] border-[#174A7C] dark:border-[#6EA8D8] font-medium'
                  : 'text-[#5F6368] dark:text-[#B8B8B8] hover:text-[#202124] dark:hover:text-white hover:bg-[#F7F7F7] dark:hover:bg-[#2D2D2D] border-transparent'
              }`}
            >
              <div className={`shrink-0 ${isActive ? 'text-[#174A7C] dark:text-[#6EA8D8]' : 'text-[#70757A]'}`}>
                {item.icon}
              </div>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="text-xs truncate">{item.label}</span>
                  <span className="text-[11px] text-[#70757A] dark:text-[#8E8E8E] truncate">{item.sublabel}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Collapse Footer */}
      {onToggleCollapse && (
        <div className="p-2 border-t border-[#D6D6D6] dark:border-[#3A3A3A]">
          <button
            onClick={onToggleCollapse}
            className="w-full flex items-center justify-center p-2 text-[#70757A] hover:text-[#202124] dark:hover:text-white hover:bg-[#F7F7F7] dark:hover:bg-[#2D2D2D] rounded-[2px] transition-colors"
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
# 7. frontend/src/components/tactical/KpiStrip.tsx (UX4G Government Strip)
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
    <div className="h-8 bg-[#FFFFFF] dark:bg-[#242424] border-t border-[#D6D6D6] dark:border-[#3A3A3A] px-4 flex items-center justify-between text-xs text-[#5F6368] dark:text-[#B8B8B8] select-none z-20 shrink-0 overflow-x-auto gap-4 font-sans">
      {/* Left: Operational Metrics */}
      <div className="flex items-center gap-6 shrink-0">
        <div className="flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5 text-[#70757A]" />
          <span>Pune District: <strong>{totalFacilities} Health Facilities</strong></span>
        </div>

        <div className="flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-[#A33A3A]" />
          <span className="text-[#A33A3A] dark:text-[#D96565]"><strong>{criticalCount}</strong> below minimum stock</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Truck className="w-3.5 h-3.5 text-[#2F6B45]" />
          <span><strong>{activeTransfersCount}</strong> transfer in transit</span>
        </div>

        <div className="flex items-center gap-1.5">
          <ThermometerSnowflake className="w-3.5 h-3.5 text-[#174A7C] dark:text-[#6EA8D8]" />
          <span>Cold-chain storage: <strong className="text-[#202124] dark:text-[#F2F2F2] font-mono">{coldChainTemp}</strong> (Safe)</span>
        </div>
      </div>

      {/* Right: Operational Freshness */}
      <div className="flex items-center gap-3 shrink-0 text-[11px] text-[#70757A] dark:text-[#8E8E8E]">
        <span>Last updated 2 min ago</span>
        <span className="flex items-center gap-1 text-[#2F6B45]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2F6B45]" />
          <span>National Health Portal Sync</span>
        </span>
      </div>
    </div>
  );
};'''

write('frontend/src/components/tactical/KpiStrip.tsx', kpi_code)

# ==============================================================================
# 8. frontend/src/components/tabs/DashboardTab.tsx (Complete UX4G + Ecosystem Layer)
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
  CheckCircle2,
  Info,
  ChevronDown,
  ChevronUp,
  Landmark,
  ShieldCheck,
  Activity
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

interface OpenRequest {
  id: string;
  facilityId: string;
  facilityName: string;
  item: string;
  qtyNeeded: number;
  urgency: string;
  nearbySource: string;
  distanceKm: number;
  transitTimeMin: number;
  status: 'OPEN' | 'RESOLVED';
}

const INITIAL_REQUESTS: OpenRequest[] = [
  {
    id: 'REQ-001',
    facilityId: 'PHC-PUN-002',
    facilityName: 'Pune PHC (Koregaon Bhima)',
    item: 'Paracetamol 500mg Tablets',
    qtyNeeded: 50,
    urgency: 'Likely shortage in 3 days',
    nearbySource: 'Pune Rural Centre (Talegaon Dhamdhere)',
    distanceKm: 8.4,
    transitTimeMin: 18,
    status: 'OPEN',
  },
  {
    id: 'REQ-002',
    facilityId: 'PHC-PUN-006',
    facilityName: 'Manchar Community Health Centre',
    item: 'IV Infusion Set 0.9% Normal Saline',
    qtyNeeded: 20,
    urgency: 'Stock low (4.2 days remaining)',
    nearbySource: 'Khed Primary Health Centre',
    distanceKm: 14.2,
    transitTimeMin: 24,
    status: 'OPEN',
  },
  {
    id: 'REQ-003',
    facilityId: 'PHC-PUN-003',
    facilityName: 'Shikrapur Health Centre',
    item: 'Oral Rehydration Salts (ORS) Sachets',
    qtyNeeded: 100,
    urgency: 'Buffer warning (5.6 days remaining)',
    nearbySource: 'Shirur Sub-District Hospital Depot',
    distanceKm: 22.0,
    transitTimeMin: 32,
    status: 'OPEN',
  },
];

const DISTRICT_CENTRES: HealthCentre[] = [
  { id: 'PHC-PUN-002', name: 'Pune PHC (Koregaon Bhima)', district: 'Pune Rural', stockLevel: 130, status: 'CRITICAL', daysLeft: 2.8, dailyRunRate: 46, lat: 18.6534, lng: 74.0624 },
  { id: 'PHC-PUN-004', name: 'Pune Rural Centre (Talegaon Dhamdhere)', district: 'Pune Rural', stockLevel: 820, status: 'STABLE', daysLeft: 16.4, dailyRunRate: 50, lat: 18.6789, lng: 74.1512 },
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
  const [requests, setRequests] = useState<OpenRequest[]>(INITIAL_REQUESTS);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showDetails, setShowDetails] = useState<boolean>(false);

  const openRequestsCount = requests.filter(r => r.status === 'OPEN').length;
  const belowStockCount = centres.filter(c => c.daysLeft < 5).length;
  const redistributionCount = requests.filter(r => r.status === 'OPEN').length;

  const handleApproveTransfer = async (reqId: string) => {
    setIsLoading(true);
    try {
      await apiClient.allocateStock('PHC-PUN-002', 'MED-PCM-500', 50);
    } catch (e) {
      console.warn('Simulating local transfer for demo');
    }

    setTimeout(() => {
      setRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: 'RESOLVED' } : r));
      setCentres(prev => prev.map(c => {
        if (c.id === 'PHC-PUN-002') return { ...c, stockLevel: 180, status: 'STABLE', daysLeft: 3.9 };
        if (c.id === 'PHC-PUN-004') return { ...c, stockLevel: 770, daysLeft: 15.4 };
        return c;
      }));
      setIsLoading(false);
    }, 800);
  };

  const filteredCentres = searchFilter
    ? centres.filter(c => c.name.toLowerCase().includes(searchFilter.toLowerCase()) || c.id.toLowerCase().includes(searchFilter.toLowerCase()))
    : centres;

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6 font-sans text-[#202124] dark:text-[#F2F2F2]">
      
      {/* 1. Administrative Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D6D6D6] dark:border-[#3A3A3A]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#174A7C] dark:text-[#6EA8D8]">
            District Health Supply Dashboard
          </h1>
          <p className="text-xs text-[#5F6368] dark:text-[#B8B8B8] mt-1">
            Pune District Health Administration · Tracking medicine stock, run-rates, and peer redistribution across 18 health centres.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onSimulateOutbreak && (
            <button
              onClick={onSimulateOutbreak}
              className="px-3.5 py-1.5 text-xs text-[#5F6368] dark:text-[#B8B8B8] hover:text-[#202124] dark:hover:text-white bg-white dark:bg-[#242424] hover:bg-[#EDEDED] dark:hover:bg-[#2D2D2D] border border-[#D6D6D6] dark:border-[#3A3A3A] rounded-[2px] transition-colors"
            >
              Test Shortage Surge
            </button>
          )}
        </div>
      </div>

      {/* 2. Public Health Operational Summary Strip (UX4G Clean Tiles) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white dark:bg-[#242424] border border-[#D6D6D6] dark:border-[#3A3A3A] rounded-[2px]">
          <div className="text-xs text-[#5F6368] dark:text-[#B8B8B8]">Health Centres</div>
          <div className="text-2xl font-bold text-[#202124] dark:text-[#F2F2F2] mt-1 font-mono">18 Active</div>
          <div className="text-[11px] text-[#2F6B45] mt-1">All reporting today</div>
        </div>

        <div className="p-4 bg-white dark:bg-[#242424] border border-[#D6D6D6] dark:border-[#3A3A3A] rounded-[2px]">
          <div className="text-xs text-[#5F6368] dark:text-[#B8B8B8]">Open Requests</div>
          <div className="text-2xl font-bold text-[#A33A3A] dark:text-[#D96565] mt-1 font-mono">
            {openRequestsCount} Pending
          </div>
          <div className="text-[11px] text-[#5F6368] dark:text-[#B8B8B8] mt-1">{belowStockCount} facilities below buffer</div>
        </div>

        <div className="p-4 bg-white dark:bg-[#242424] border border-[#D6D6D6] dark:border-[#3A3A3A] rounded-[2px]">
          <div className="text-xs text-[#5F6368] dark:text-[#B8B8B8]">Redistribution</div>
          <div className="text-2xl font-bold text-[#2F6B45] dark:text-[#4E9A68] mt-1 font-mono">
            {redistributionCount > 0 ? `${redistributionCount} Available` : 'All Resolved'}
          </div>
          <div className="text-[11px] text-[#5F6368] dark:text-[#B8B8B8] mt-1">Matched within 15 km</div>
        </div>

        <div className="p-4 bg-white dark:bg-[#242424] border border-[#D6D6D6] dark:border-[#3A3A3A] rounded-[2px]">
          <div className="text-xs text-[#5F6368] dark:text-[#B8B8B8]">Cold-Chain Storage</div>
          <div className="text-2xl font-bold text-[#174A7C] dark:text-[#6EA8D8] mt-1 font-mono">+4.2°C</div>
          <div className="text-[11px] text-[#2F6B45] mt-1">Safe (+2°C to +8°C window)</div>
        </div>
      </div>

      {/* 3. The Core Redistribution Workflow (Government Operational Action) */}
      <div className="p-5 bg-white dark:bg-[#242424] border border-[#D6D6D6] dark:border-[#3A3A3A] rounded-[2px] space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#E5E5E5] dark:border-[#3A3A3A]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-[2px] bg-[#174A7C]" />
            <h2 className="text-sm font-bold text-[#202124] dark:text-[#F2F2F2] uppercase tracking-wide">
              Redistribution Recommendation (Case REQ-001)
            </h2>
          </div>
          <span className="text-xs text-[#5F6368] dark:text-[#B8B8B8] font-mono">Status: Ready for Approval</span>
        </div>

        {requests[0].status === 'RESOLVED' ? (
          <div className="p-4 bg-[#2F6B45]/10 border border-[#2F6B45]/40 rounded-[2px] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#2F6B45] shrink-0" />
              <div>
                <div className="text-sm font-bold text-[#202124] dark:text-[#F2F2F2]">Transfer Approved & Recorded in Ledger</div>
                <div className="text-xs text-[#5F6368] dark:text-[#B8B8B8] mt-0.5">
                  50 units Paracetamol 500mg dispatched from Pune Rural Centre to Pune PHC. Distance: 8.4 km (18 min).
                </div>
              </div>
            </div>
            <span className="text-xs font-mono font-medium text-[#2F6B45] px-3 py-1 bg-[#2F6B45]/20 border border-[#2F6B45]/40 rounded-[2px]">
              RESOLVED
            </span>
          </div>
        ) : (
          <div className="p-4 bg-[#F7F7F7] dark:bg-[#1B1B1B] border border-[#D6D6D6] dark:border-[#3A3A3A] rounded-[2px] space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Step 1: Stock Request */}
              <div className="space-y-1">
                <div className="text-[11px] font-bold text-[#A33A3A] dark:text-[#D96565] uppercase">1. Stock Request</div>
                <div className="text-sm font-bold text-[#202124] dark:text-[#F2F2F2]">Pune PHC (Koregaon Bhima)</div>
                <div className="text-xs text-[#5F6368] dark:text-[#B8B8B8] leading-relaxed">
                  Required: <strong className="text-[#202124] dark:text-[#F2F2F2]">50 units</strong> Paracetamol 500mg.
                  <br />
                  Current stock: <span className="font-mono">130 units</span> (2.8 days remaining).
                </div>
              </div>

              {/* Step 2: Suggested Source */}
              <div className="space-y-1">
                <div className="text-[11px] font-bold text-[#2F6B45] dark:text-[#4E9A68] uppercase">2. Suggested Source</div>
                <div className="text-sm font-bold text-[#202124] dark:text-[#F2F2F2]">Pune Rural Centre (Talegaon)</div>
                <div className="text-xs text-[#5F6368] dark:text-[#B8B8B8] leading-relaxed">
                  Available: <strong className="text-[#202124] dark:text-[#F2F2F2]">820 units</strong> · After transfer: <span className="font-mono">770 units</span>.
                  <br />
                  Distance: <span className="font-mono">8.4 km</span> · Travel: <span className="font-mono">18 min</span>.
                </div>
              </div>

              {/* Step 3: Action */}
              <div className="space-y-1">
                <div className="text-[11px] font-bold text-[#174A7C] dark:text-[#6EA8D8] uppercase">3. Recommended Action</div>
                <div className="text-xs text-[#5F6368] dark:text-[#B8B8B8] leading-relaxed">
                  Transfer <strong className="text-[#202124] dark:text-[#F2F2F2]">50 units</strong> to prevent clinic stockout.
                </div>
                <button
                  onClick={() => handleApproveTransfer('REQ-001')}
                  disabled={isLoading}
                  className="mt-2 w-full px-4 py-2 text-xs font-medium text-white bg-[#174A7C] hover:bg-[#123B63] rounded-[2px] transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>{isLoading ? 'Recording transfer...' : 'Approve Transfer (50 units)'}</span>
                </button>
              </div>
            </div>

            {/* Why this facility? Explanation Block */}
            <div className="pt-3 border-t border-[#D6D6D6] dark:border-[#3A3A3A] space-y-2">
              <div className="flex items-start gap-2 text-xs text-[#5F6368] dark:text-[#B8B8B8] leading-relaxed bg-white dark:bg-[#242424] p-3 border border-[#D6D6D6] dark:border-[#3A3A3A] rounded-[2px]">
                <Info className="w-4 h-4 text-[#174A7C] dark:text-[#6EA8D8] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#202124] dark:text-[#F2F2F2]">Reason for suggestion: </strong>
                  The facility has sufficient stock (820 units) to fulfil the request while remaining well above its safety threshold (770 units buffer). It is also the closest available source at 8.4 km.
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => setShowDetails(prev => !prev)}
                  className="text-xs text-[#174A7C] dark:text-[#6EA8D8] hover:underline flex items-center gap-1 font-medium"
                >
                  <span>{showDetails ? 'Hide calculation details' : 'How was this calculated?'}</span>
                  {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
                <span className="text-[11px] text-[#70757A] dark:text-[#8E8E8E] font-mono">PostGIS KNN · OSRM Road Router · FEFO Ledger</span>
              </div>

              {showDetails && (
                <div className="p-3 bg-white dark:bg-[#242424] border border-[#D6D6D6] dark:border-[#3A3A3A] text-xs text-[#5F6368] dark:text-[#B8B8B8] font-mono space-y-1 leading-relaxed rounded-[2px]">
                  <div>• Forecast model: Evaluated 7-day consumption curve at 46 units/day</div>
                  <div>• Safety threshold: Enforced donor minimum 7-day buffer (required = 350 units; remaining = 770 units)</div>
                  <div>• Road routing: Resolved 8.4 km road corridor with +4.2°C cold-chain preservation</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 4. Government & Public Health Ecosystem Section (Institutional Context) */}
      <div className="p-5 bg-white dark:bg-[#242424] border border-[#D6D6D6] dark:border-[#3A3A3A] rounded-[2px] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E5E5E5] dark:border-[#3A3A3A]">
          <div>
            <h2 className="text-sm font-bold text-[#174A7C] dark:text-[#6EA8D8] uppercase tracking-wide flex items-center gap-2">
              <Landmark className="w-4 h-4 text-[#174A7C] dark:text-[#6EA8D8]" />
              <span>Government & Public Health Ecosystem</span>
            </h2>
            <p className="text-xs text-[#5F6368] dark:text-[#B8B8B8] mt-0.5">
              KYZER operates as a facility-level operational layer within the broader national healthcare delivery framework.
            </p>
          </div>
          <span className="text-xs text-[#70757A] dark:text-[#8E8E8E] font-mono">Public Health Hierarchy</span>
        </div>

        {/* Leadership & Administrative Hierarchy Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* National Level: Prime Minister */}
          <div className="p-3.5 bg-[#F7F7F7] dark:bg-[#1B1B1B] border border-[#D6D6D6] dark:border-[#3A3A3A] rounded-[2px] flex items-start gap-3.5">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Prime_Minister_of_India_Narendra_Modi.jpg/330px-Prime_Minister_of_India_Narendra_Modi.jpg"
              alt="Shri Narendra Modi"
              className="w-16 h-20 object-cover object-top border border-[#D6D6D6] dark:border-[#3A3A3A] rounded-[2px] shrink-0 bg-white"
            />
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase text-[#174A7C] dark:text-[#6EA8D8]">National Leadership</div>
              <div className="text-sm font-bold text-[#202124] dark:text-[#F2F2F2]">Shri Narendra Modi</div>
              <div className="text-xs text-[#5F6368] dark:text-[#B8B8B8]">Hon'ble Prime Minister of India</div>
              <p className="text-[11px] text-[#5F6368] dark:text-[#B8B8B8] leading-relaxed pt-1">
                National digital health programmes increasingly rely on real-time data and coordinated delivery across healthcare facilities.
              </p>
            </div>
          </div>

          {/* Health Ministry Level */}
          <div className="p-3.5 bg-[#F7F7F7] dark:bg-[#1B1B1B] border border-[#D6D6D6] dark:border-[#3A3A3A] rounded-[2px] flex items-start gap-3.5">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/J_P_Nadda_official_portrait.jpg/330px-J_P_Nadda_official_portrait.jpg"
              alt="Shri Jagat Prakash Nadda"
              className="w-16 h-20 object-cover object-top border border-[#D6D6D6] dark:border-[#3A3A3A] rounded-[2px] shrink-0 bg-white"
            />
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase text-[#174A7C] dark:text-[#6EA8D8]">Health Administration</div>
              <div className="text-sm font-bold text-[#202124] dark:text-[#F2F2F2]">Shri Jagat Prakash Nadda</div>
              <div className="text-xs text-[#5F6368] dark:text-[#B8B8B8]">Hon'ble Union Minister of Health & Family Welfare</div>
              <p className="text-[11px] text-[#5F6368] dark:text-[#B8B8B8] leading-relaxed pt-1">
                Ministry of Health & Family Welfare policy prioritizes zero-stockout delivery at primary health centres through regional supply coordination.
              </p>
            </div>
          </div>

        </div>

        {/* Public Health Supply Hierarchy Chain */}
        <div className="p-3 bg-[#F7F7F7] dark:bg-[#1B1B1B] border border-[#D6D6D6] dark:border-[#3A3A3A] rounded-[2px]">
          <div className="text-xs font-bold text-[#202124] dark:text-[#F2F2F2] mb-2">
            Healthcare Supply Chain Integration Chain
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
            <div className="p-2 bg-white dark:bg-[#242424] border border-[#D6D6D6] dark:border-[#3A3A3A] rounded-[2px]">
              <div className="text-[10px] text-[#70757A] dark:text-[#8E8E8E] uppercase">Level 1</div>
              <div className="font-bold text-[#174A7C] dark:text-[#6EA8D8] mt-0.5">National</div>
              <div className="text-[11px] text-[#5F6368] dark:text-[#B8B8B8]">MoHFW Policy</div>
            </div>
            <div className="p-2 bg-white dark:bg-[#242424] border border-[#D6D6D6] dark:border-[#3A3A3A] rounded-[2px]">
              <div className="text-[10px] text-[#70757A] dark:text-[#8E8E8E] uppercase">Level 2</div>
              <div className="font-bold text-[#174A7C] dark:text-[#6EA8D8] mt-0.5">State</div>
              <div className="text-[11px] text-[#5F6368] dark:text-[#B8B8B8]">MH Health Dept</div>
            </div>
            <div className="p-2 bg-white dark:bg-[#242424] border border-[#D6D6D6] dark:border-[#3A3A3A] rounded-[2px]">
              <div className="text-[10px] text-[#70757A] dark:text-[#8E8E8E] uppercase">Level 3</div>
              <div className="font-bold text-[#174A7C] dark:text-[#6EA8D8] mt-0.5">District</div>
              <div className="text-[11px] text-[#5F6368] dark:text-[#B8B8B8]">Pune Admin</div>
            </div>
            <div className="p-2 bg-white dark:bg-[#242424] border border-[#D6D6D6] dark:border-[#3A3A3A] rounded-[2px]">
              <div className="text-[10px] text-[#70757A] dark:text-[#8E8E8E] uppercase">Level 4</div>
              <div className="font-bold text-[#174A7C] dark:text-[#6EA8D8] mt-0.5">Facilities</div>
              <div className="text-[11px] text-[#5F6368] dark:text-[#B8B8B8]">18 PHCs / CHCs</div>
            </div>
            <div className="p-2 bg-[#174A7C] text-white rounded-[2px]">
              <div className="text-[10px] text-[#D6D6D6] uppercase">Execution</div>
              <div className="font-bold mt-0.5">KYZER Layer</div>
              <div className="text-[11px] text-[#E0E0E0]">Stock Redistribution</div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Open Stock Requests Dense Table */}
      <div className="p-5 bg-white dark:bg-[#242424] border border-[#D6D6D6] dark:border-[#3A3A3A] rounded-[2px] space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#E5E5E5] dark:border-[#3A3A3A]">
          <div>
            <h2 className="text-sm font-bold text-[#202124] dark:text-[#F2F2F2]">Open Stock Requests (District-Wide)</h2>
            <p className="text-xs text-[#5F6368] dark:text-[#B8B8B8]">Active medicine replenishment requests across district primary health centres</p>
          </div>
          <span className="text-xs text-[#70757A] dark:text-[#8E8E8E] font-mono">{openRequestsCount} Requests Open</span>
        </div>

        <div className="overflow-x-auto border border-[#D6D6D6] dark:border-[#3A3A3A] rounded-[2px]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F7F7] dark:bg-[#1B1B1B] text-[#5F6368] dark:text-[#B8B8B8] border-b border-[#D6D6D6] dark:border-[#3A3A3A]">
              <tr>
                <th className="p-3 font-semibold text-[#202124] dark:text-[#F2F2F2]">Facility Name</th>
                <th className="p-3 font-semibold text-[#202124] dark:text-[#F2F2F2]">Item Requested</th>
                <th className="p-3 font-semibold text-[#202124] dark:text-[#F2F2F2]">Quantity</th>
                <th className="p-3 font-semibold text-[#202124] dark:text-[#F2F2F2]">Urgency / Status</th>
                <th className="p-3 font-semibold text-[#202124] dark:text-[#F2F2F2]">Suggested Source</th>
                <th className="p-3 font-semibold text-[#202124] dark:text-[#F2F2F2]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5] dark:divide-[#3A3A3A]">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-[#F9F9F9] dark:hover:bg-[#2D2D2D] transition-colors">
                  <td className="p-3 text-[#202124] dark:text-[#F2F2F2]">
                    <div className="font-medium">{req.facilityName}</div>
                    <div className="text-[11px] text-[#70757A] dark:text-[#8E8E8E] font-mono">{req.facilityId}</div>
                  </td>
                  <td className="p-3 text-[#202124] dark:text-[#F2F2F2]">{req.item}</td>
                  <td className="p-3 font-mono font-medium text-[#202124] dark:text-[#F2F2F2]">{req.qtyNeeded} units</td>
                  <td className="p-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-[2px] border ${
                      req.status === 'RESOLVED'
                        ? 'bg-[#2F6B45]/10 text-[#2F6B45] border-[#2F6B45]/30'
                        : 'bg-[#A33A3A]/10 text-[#A33A3A] border-[#A33A3A]/30'
                    }`}>
                      {req.status === 'RESOLVED' ? 'Transfer Approved' : req.urgency}
                    </span>
                  </td>
                  <td className="p-3 text-[#5F6368] dark:text-[#B8B8B8]">
                    <div className="text-[#202124] dark:text-[#F2F2F2]">{req.nearbySource}</div>
                    <div className="text-[11px] text-[#2F6B45] font-mono">{req.distanceKm} km · {req.transitTimeMin} min transit</div>
                  </td>
                  <td className="p-3">
                    {req.status === 'RESOLVED' ? (
                      <span className="text-xs text-[#2F6B45] font-medium">Completed</span>
                    ) : (
                      <button
                        onClick={() => handleApproveTransfer(req.id)}
                        disabled={isLoading}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-[#174A7C] hover:bg-[#123B63] rounded-[2px] transition-colors"
                      >
                        Approve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Facility Inventory Registry Table */}
      <div className="p-5 bg-white dark:bg-[#242424] border border-[#D6D6D6] dark:border-[#3A3A3A] rounded-[2px] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E5E5E5] dark:border-[#3A3A3A]">
          <div>
            <h2 className="text-sm font-bold text-[#202124] dark:text-[#F2F2F2]">Pune District Facility Stock Register</h2>
            <p className="text-xs text-[#5F6368] dark:text-[#B8B8B8]">Current essential medicine stock on hand and estimated days to buffer replenishment</p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#70757A]" />
            <input
              type="text"
              placeholder="Search facility name or ID..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-[#1B1B1B] border border-[#D6D6D6] dark:border-[#3A3A3A] rounded-[2px] text-[#202124] dark:text-[#F2F2F2] placeholder-[#70757A] focus:outline-none focus:border-[#174A7C]"
            />
          </div>
        </div>

        <div className="overflow-x-auto border border-[#D6D6D6] dark:border-[#3A3A3A] rounded-[2px]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F7F7] dark:bg-[#1B1B1B] text-[#5F6368] dark:text-[#B8B8B8] border-b border-[#D6D6D6] dark:border-[#3A3A3A]">
              <tr>
                <th className="p-3 font-semibold text-[#202124] dark:text-[#F2F2F2]">Health Facility</th>
                <th className="p-3 font-semibold text-[#202124] dark:text-[#F2F2F2]">Sub-District</th>
                <th className="p-3 font-semibold text-[#202124] dark:text-[#F2F2F2]">Paracetamol Stock</th>
                <th className="p-3 font-semibold text-[#202124] dark:text-[#F2F2F2]">Daily Consumption</th>
                <th className="p-3 font-semibold text-[#202124] dark:text-[#F2F2F2]">Estimated Days Left</th>
                <th className="p-3 font-semibold text-[#202124] dark:text-[#F2F2F2]">Stock Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5] dark:divide-[#3A3A3A]">
              {filteredCentres.map((c) => (
                <tr key={c.id} className="hover:bg-[#F9F9F9] dark:hover:bg-[#2D2D2D] transition-colors">
                  <td className="p-3 text-[#202124] dark:text-[#F2F2F2]">
                    <div className="font-medium">{c.name}</div>
                    <div className="text-[11px] text-[#70757A] dark:text-[#8E8E8E] font-mono">{c.id}</div>
                  </td>
                  <td className="p-3 text-[#5F6368] dark:text-[#B8B8B8]">{c.district}</td>
                  <td className="p-3 font-mono font-medium text-[#202124] dark:text-[#F2F2F2]">{c.stockLevel} units</td>
                  <td className="p-3 font-mono text-[#5F6368] dark:text-[#B8B8B8]">{c.dailyRunRate} / day</td>
                  <td className="p-3 font-mono">
                    <span className={c.daysLeft <= 3 ? 'text-[#A33A3A] font-bold' : c.daysLeft <= 6 ? 'text-[#8A6418]' : 'text-[#2F6B45]'}>
                      {c.daysLeft} days
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-[2px] border ${
                      c.status === 'CRITICAL' 
                        ? 'bg-[#A33A3A]/10 text-[#A33A3A] border-[#A33A3A]/30' 
                        : c.status === 'WARNING' 
                        ? 'bg-[#8A6418]/10 text-[#8A6418] border-[#8A6418]/30' 
                        : 'bg-[#2F6B45]/10 text-[#2F6B45] border-[#2F6B45]/30'
                    }`}>
                      {c.status === 'CRITICAL' ? 'Likely Shortage' : c.status === 'WARNING' ? 'Low Stock' : 'Adequate'}
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

# ==============================================================================
# 9. frontend/src/components/tactical/PriorityActionCard.tsx
# ==============================================================================
card_code = '''import React, { useState } from 'react';
import { ArrowRight, ChevronDown, ChevronUp, Info } from 'lucide-react';
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
  const [showExplanation, setShowExplanation] = useState(false);
  const isCritical = action.tier === 'P0_CRITICAL';

  return (
    <div
      className={`p-4 rounded-[2px] border transition-all space-y-3 font-sans ${
        isSelected 
          ? 'bg-white dark:bg-[#2D2D2D] border-[#174A7C] dark:border-[#6EA8D8]' 
          : 'bg-white dark:bg-[#242424] border-[#D6D6D6] dark:border-[#3A3A3A] hover:border-[#9AA0A6]'
      }`}
    >
      {/* 1. Something is wrong */}
      <div className="flex items-center justify-between gap-2">
        <span className={`text-[11px] font-sans font-medium px-2 py-0.5 rounded-[2px] border ${
          isCritical 
            ? 'bg-[#A33A3A]/10 text-[#A33A3A] border-[#A33A3A]/30' 
            : 'bg-[#8A6418]/10 text-[#8A6418] border-[#8A6418]/30'
        }`}>
          {isCritical ? 'Likely shortage in 3 days' : 'Buffer Warning'}
        </span>
        <span className="text-[11px] text-[#70757A] dark:text-[#8E8E8E] font-mono">
          {action.facilityId}
        </span>
      </div>

      <div>
        <h4 className="text-sm font-bold text-[#202124] dark:text-[#F2F2F2] truncate">
          {action.facilityName}
        </h4>
        <p className="text-xs text-[#5F6368] dark:text-[#B8B8B8] mt-0.5 leading-relaxed">
          Needs <strong className="text-[#202124] dark:text-[#F2F2F2]">{action.recommendedUnits} units</strong> {action.medicineName.split(' ')[0]} ({action.currentStock} on hand, {action.daysRemaining.toFixed(1)} days left)
        </p>
      </div>

      {/* 2. Investigation & 3. Best Match */}
      <div className="p-3 bg-[#F7F7F7] dark:bg-[#1B1B1B] border border-[#D6D6D6] dark:border-[#3A3A3A] rounded-[2px] text-xs space-y-1">
        <div className="text-[11px] text-[#70757A] dark:text-[#8E8E8E]">
          Found 3 possible sources nearby · Nearest source:
        </div>
        <div className="text-xs font-bold text-[#202124] dark:text-[#F2F2F2]">
          {action.donorFacilityName}
        </div>
        <div className="text-[11px] text-[#2F6B45] font-mono">
          Available: 820 units · Distance: {action.distanceKm} km · Travel: {action.transitTimeMin} min
        </div>
      </div>

      {/* 4. Why this facility? (Progressive Disclosure) */}
      <div className="border border-[#D6D6D6] dark:border-[#3A3A3A] bg-white dark:bg-[#242424] p-2.5 rounded-[2px] space-y-2">
        <div className="flex items-start gap-2 text-xs text-[#5F6368] dark:text-[#B8B8B8] leading-relaxed">
          <Info className="w-3.5 h-3.5 text-[#174A7C] dark:text-[#6EA8D8] shrink-0 mt-0.5" />
          <div>
            <strong className="text-[#202124] dark:text-[#F2F2F2]">Reason for suggestion: </strong>
            It has sufficient stock to fulfil the request while remaining well above its safety threshold. It is also the closest available source.
          </div>
        </div>

        <button
          onClick={() => setShowExplanation(prev => !prev)}
          className="text-xs text-[#174A7C] dark:text-[#6EA8D8] hover:underline flex items-center gap-1 font-medium pt-1"
        >
          <span>{showExplanation ? 'Hide calculation details' : 'How was this calculated?'}</span>
          {showExplanation ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        {showExplanation && (
          <div className="pt-2 border-t border-[#E5E5E5] dark:border-[#3A3A3A] text-[11px] text-[#70757A] dark:text-[#8E8E8E] space-y-1 font-mono leading-relaxed">
            <div>• Consumption run-rate: 46 units/day (forecast model)</div>
            <div>• Safety constraint: Donor keeps &gt;7-day reserve ({action.recommendedUnits === 50 ? '770 units' : '370 units'} buffer)</div>
            <div>• Real-road routing: OSRM corridor + WHO cold-chain temperature limit (+4.2°C)</div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          onClick={() => onReviewDecision(action)}
          className="px-3 py-1.5 text-xs text-[#5F6368] dark:text-[#B8B8B8] hover:text-[#202124] dark:hover:text-white bg-[#F7F7F7] dark:bg-[#1B1B1B] hover:bg-[#EDEDED] dark:hover:bg-[#2D2D2D] border border-[#D6D6D6] dark:border-[#3A3A3A] rounded-[2px] transition-colors text-center"
        >
          View on Map
        </button>
        <button
          onClick={() => onDispatchRoute(action)}
          className="px-3 py-1.5 text-xs font-medium text-white bg-[#174A7C] hover:bg-[#123B63] rounded-[2px] transition-colors flex items-center justify-center gap-1"
        >
          <span>Approve Transfer</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};'''

write('frontend/src/components/tactical/PriorityActionCard.tsx', card_code)

print('UX4G Government Health Design System & Ecosystem Layer applied successfully!')