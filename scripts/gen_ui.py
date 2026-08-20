import os

def write(p, c):
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, 'w', encoding='utf-8') as f:
        f.write(c.strip() + '\n')
    print(f'Wrote {p}')

# 1. Badge.tsx
write('frontend/src/components/ui/Badge.tsx', '''import React from 'react';

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
    bg: 'bg-[#106BA3]/15',
    text: 'text-[#106BA3]',
    border: 'border-[#106BA3]/40',
    dot: 'bg-[#106BA3]',
  },
  success: {
    bg: 'bg-[#0D8050]/15',
    text: 'text-[#0D8050]',
    border: 'border-[#0D8050]/40',
    dot: 'bg-[#0D8050]',
  },
  warning: {
    bg: 'bg-[#D9822B]/15',
    text: 'text-[#D9822B]',
    border: 'border-[#D9822B]/40',
    dot: 'bg-[#D9822B]',
  },
  danger: {
    bg: 'bg-[#C23030]/15',
    text: 'text-[#C23030]',
    border: 'border-[#C23030]/40',
    dot: 'bg-[#C23030]',
  },
  neutral: {
    bg: 'bg-[#293742]/40',
    text: 'text-[#A7B6C2]',
    border: 'border-[#293742]',
    dot: 'bg-[#A7B6C2]',
  },
  purple: {
    bg: 'bg-[#8F3985]/15',
    text: 'text-[#C678DD]',
    border: 'border-[#8F3985]/40',
    dot: 'bg-[#C678DD]',
  },
};

const sizeStyles = {
  xs: 'text-[9px] px-1.5 py-0.5 leading-3',
  sm: 'text-[10px] px-2 py-0.5 leading-3.5',
  md: 'text-xs px-2.5 py-1 leading-4',
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
  const v = variantStyles[variant];
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-bold tracking-wider uppercase rounded-[2px] border ${v.bg} ${v.text} ${v.border} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${v.dot} ${pulse ? 'animate-pulse' : ''}`} />
      )}
      {children}
    </span>
  );
};
''')

# 2. Button.tsx
write('frontend/src/components/ui/Button.tsx', '''import React from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'ghost' | 'outline';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-[#106BA3] hover:bg-[#0E5A8A] text-white border border-[#106BA3]',
  secondary: 'bg-[#202B33] hover:bg-[#293742] text-[#F5F8FA] border border-[#293742]',
  success: 'bg-[#0D8050] hover:bg-[#0A6640] text-white border border-[#0D8050]',
  danger: 'bg-[#C23030] hover:bg-[#A82A2A] text-white border border-[#C23030]',
  ghost: 'bg-transparent hover:bg-[#202B33] text-[#A7B6C2] hover:text-[#F5F8FA]',
  outline: 'bg-transparent hover:bg-[#202B33] text-[#F5F8FA] border border-[#293742] hover:border-[#394B59]',
};

const sizeClasses: Record<ButtonSize, string> = {
  xs: 'text-[11px] px-2 py-1 gap-1.5',
  sm: 'text-xs px-3 py-1.5 gap-2',
  md: 'text-xs px-4 py-2 gap-2',
  lg: 'text-sm px-5 py-2.5 gap-2.5',
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
      className={`foundry-btn font-medium transition-all select-none disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
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
};
''')

# 3. Card.tsx
write('frontend/src/components/ui/Card.tsx', '''import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  isInteractive?: boolean;
}

export const Card: React.FC<CardProps> = ({
  header,
  footer,
  isInteractive = false,
  className = '',
  children,
  ...props
}) => {
  return (
    <div
      className={`foundry-card overflow-hidden ${isInteractive ? 'cursor-pointer hover:border-[#106BA3]' : ''} ${className}`}
      {...props}
    >
      {header && (
        <div className="px-4 py-2.5 border-b border-[#293742] bg-[#182026]/50 flex items-center justify-between">
          {header}
        </div>
      )}
      <div className="p-4">{children}</div>
      {footer && (
        <div className="px-4 py-2 border-t border-[#293742] bg-[#182026]/30 text-xs text-[#A7B6C2]">
          {footer}
        </div>
      )}
    </div>
  );
};
''')

# 4. StatCard.tsx
write('frontend/src/components/ui/StatCard.tsx', '''import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { Badge, BadgeVariant } from './Badge';

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
  badge?: { text: string; variant: BadgeVariant };
  icon?: React.ReactNode;
  statusColor?: 'primary' | 'success' | 'warning' | 'danger';
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subValue,
  trend,
  trendLabel,
  badge,
  icon,
  statusColor = 'primary',
}) => {
  const colorMap = {
    primary: 'text-[#106BA3]',
    success: 'text-[#0D8050]',
    warning: 'text-[#D9822B]',
    danger: 'text-[#C23030]',
  };

  return (
    <div className="foundry-card p-3.5 flex flex-col justify-between space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#A7B6C2]">
          {label}
        </span>
        {badge ? (
          <Badge variant={badge.variant} size="xs">{badge.text}</Badge>
        ) : icon ? (
          <span className="text-[#A7B6C2]">{icon}</span>
        ) : null}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <div className={`text-xl sm:text-2xl font-bold font-mono tracking-tight ${colorMap[statusColor]}`}>
          {value}
        </div>
        {subValue && (
          <div className="text-xs font-mono text-[#A7B6C2]">{subValue}</div>
        )}
      </div>

      {(trend || trendLabel) && (
        <div className="flex items-center gap-1 text-[10px] font-mono text-[#A7B6C2] border-t border-[#293742] pt-1.5">
          {trend === 'up' && <ArrowUpRight className="w-3 h-3 text-[#C23030]" />}
          {trend === 'down' && <ArrowDownRight className="w-3 h-3 text-[#0D8050]" />}
          {trend === 'neutral' && <Minus className="w-3 h-3 text-[#A7B6C2]" />}
          <span>{trendLabel}</span>
        </div>
      )}
    </div>
  );
};
''')

# 5. Drawer.tsx
write('frontend/src/components/ui/Drawer.tsx', '''import React from 'react';
import { X } from 'lucide-react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  width?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  badge,
  width = 'md',
  children,
}) => {
  if (!isOpen) return null;

  const widthClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
      <div
        className={`w-full ${widthClasses[width]} h-full bg-[#182026] border-l border-[#293742] shadow-2xl flex flex-col transform transition-transform animate-in slide-in-from-right duration-200`}
      >
        {/* Header */}
        <div className="p-4 border-b border-[#293742] bg-[#202B33] flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#F5F8FA] font-mono">
                {title}
              </h2>
              {badge}
            </div>
            {subtitle && (
              <p className="text-xs text-[#A7B6C2]">{subtitle}</p>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1 text-[#A7B6C2] hover:text-[#F5F8FA] hover:bg-[#293742] rounded-[2px] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
};
''')

# 6. Modal.tsx
write('frontend/src/components/ui/Modal.tsx', '''import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  badge,
  maxWidth = 'lg',
  children,
  footer,
}) => {
  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div
        className={`w-full ${maxWidthClasses[maxWidth]} bg-[#182026] border border-[#293742] rounded-[3px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]`}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-[#293742] bg-[#202B33] flex items-center justify-between shrink-0">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#F5F8FA] font-mono">
                {title}
              </h3>
              {badge}
            </div>
            {subtitle && (
              <p className="text-xs text-[#A7B6C2]">{subtitle}</p>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1 text-[#A7B6C2] hover:text-[#F5F8FA] hover:bg-[#293742] rounded-[2px] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-4 py-3 border-t border-[#293742] bg-[#202B33]/50 flex items-center justify-end gap-2 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
''')

# 7. ui/index.ts
write('frontend/src/components/ui/index.ts', '''export * from './Badge';
export * from './Button';
export * from './Card';
export * from './StatCard';
export * from './Drawer';
export * from './Modal';
export * from './CommandPalette';
''')

# 8. TacticalHeader.tsx
write('frontend/src/components/tactical/TacticalHeader.tsx', '''import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  ShieldCheck, 
  Globe2, 
  UploadCloud, 
  Zap, 
  Bell, 
  Clock, 
  Radio,
  ChevronDown
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface TacticalHeaderProps {
  districtName?: string;
  countryCode?: 'IND' | 'ZAF' | 'BRA';
  onCountryChange?: (code: 'IND' | 'ZAF' | 'BRA') => void;
  onOpenOcrModal?: () => void;
  onOpenScenarioModal?: () => void;
  onOpenAlertsDrawer?: () => void;
  activeAlertCount?: number;
  isScenarioActive?: boolean;
  onResetScenario?: () => void;
}

export const TacticalHeader: React.FC<TacticalHeaderProps> = ({
  districtName = 'Pune District (MH, India)',
  countryCode = 'IND',
  onCountryChange,
  onOpenOcrModal,
  onOpenScenarioModal,
  onOpenAlertsDrawer,
  activeAlertCount = 4,
  isScenarioActive = false,
  onResetScenario,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' IST');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-12 bg-[#182026] border-b border-[#293742] px-4 flex items-center justify-between select-none z-30 shrink-0 text-[#F5F8FA] font-sans">
      {/* Left: Brand + Telemetry Status */}
      <div className="flex items-center gap-3.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-[2px] bg-[#106BA3] flex items-center justify-center font-mono font-black text-white text-xs tracking-tighter shadow-sm">
            K
          </div>
          <div className="flex flex-col">
            <span className="font-mono font-black text-sm tracking-wider text-[#F5F8FA] leading-none">
              KYZER
            </span>
            <span className="text-[9px] text-[#A7B6C2] font-mono tracking-tight leading-none mt-0.5">
              HEALTH LOGISTICS OS
            </span>
          </div>
        </div>

        <div className="h-4 w-[1px] bg-[#293742] hidden sm:block" />

        {/* Live Pulse Indicator */}
        <div className="hidden md:flex items-center gap-2">
          <Badge variant="success" dot pulse size="xs">
            SYSTEM ONLINE
          </Badge>
          <Badge variant="primary" size="xs">
            AI SERVICE B (LIVE)
          </Badge>
        </div>
      </div>

      {/* Center: District Switcher & Clock */}
      <div className="flex items-center gap-3 font-mono text-xs">
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-[#111418] border border-[#293742] rounded-[2px] text-[#A7B6C2]">
          <Clock className="w-3.5 h-3.5 text-[#106BA3]" />
          <span>{timeStr || '19:58:00 IST'}</span>
        </div>

        {/* BRICS Sovereign Switcher */}
        <div className="flex items-center gap-1 bg-[#111418] border border-[#293742] rounded-[2px] p-0.5">
          <button
            onClick={() => onCountryChange && onCountryChange('IND')}
            className={`px-2 py-0.5 text-[11px] rounded-[1px] transition-colors ${
              countryCode === 'IND' ? 'bg-[#106BA3] text-white font-bold' : 'text-[#A7B6C2] hover:text-[#F5F8FA]'
            }`}
          >
            IND (Pune)
          </button>
          <button
            onClick={() => onCountryChange && onCountryChange('ZAF')}
            className={`px-2 py-0.5 text-[11px] rounded-[1px] transition-colors ${
              countryCode === 'ZAF' ? 'bg-[#106BA3] text-white font-bold' : 'text-[#A7B6C2] hover:text-[#F5F8FA]'
            }`}
          >
            ZAF (Tshwane)
          </button>
          <button
            onClick={() => onCountryChange && onCountryChange('BRA')}
            className={`px-2 py-0.5 text-[11px] rounded-[1px] transition-colors ${
              countryCode === 'BRA' ? 'bg-[#106BA3] text-white font-bold' : 'text-[#A7B6C2] hover:text-[#F5F8FA]'
            }`}
          >
            BRA (Amazonas)
          </button>
        </div>
      </div>

      {/* Right: Quick Action Triggers */}
      <div className="flex items-center gap-2">
        {/* Scenario Lab Status */}
        {isScenarioActive ? (
          <Button
            variant="danger"
            size="xs"
            onClick={onResetScenario}
            leftIcon={<Zap className="w-3 h-3 animate-pulse" />}
          >
            RESET SCENARIO
          </Button>
        ) : (
          <Button
            variant="secondary"
            size="xs"
            onClick={onOpenScenarioModal}
            leftIcon={<Zap className="w-3 h-3 text-[#D9822B]" />}
            className="hidden sm:inline-flex"
          >
            SCENARIO LAB
          </Button>
        )}

        {/* OCR Register Import Trigger */}
        <Button
          variant="primary"
          size="xs"
          onClick={onOpenOcrModal}
          leftIcon={<UploadCloud className="w-3 h-3" />}
        >
          <span className="hidden sm:inline">IMPORT REGISTER</span>
          <span className="sm:hidden">OCR</span>
        </Button>

        {/* Alerts Badge Trigger */}
        <button
          onClick={onOpenAlertsDrawer}
          className="relative p-1.5 text-[#A7B6C2] hover:text-[#F5F8FA] hover:bg-[#202B33] border border-[#293742] rounded-[2px] transition-colors"
          title="Actionable Triage Alerts"
        >
          <Bell className="w-4 h-4" />
          {activeAlertCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#C23030] text-white font-mono text-[9px] font-bold flex items-center justify-center shadow-xs">
              {activeAlertCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
''')

# 9. TacticalNavRail.tsx
write('frontend/src/components/tactical/TacticalNavRail.tsx', '''import React from 'react';
import { 
  LayoutDashboard, 
  Map, 
  LineChart, 
  Truck, 
  Camera, 
  Zap, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck
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
  badge?: string;
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
      label: 'COMMAND CENTER',
      sublabel: 'District Digital Twin',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'network',
      label: 'NETWORK GRAPH',
      sublabel: '18 Facility Nodes',
      icon: <Map className="w-4 h-4" />,
    },
    {
      id: 'intelligence',
      label: 'INTELLIGENCE',
      sublabel: 'LightGBM + TreeSHAP',
      icon: <LineChart className="w-4 h-4" />,
      badge: 'ML',
    },
    {
      id: 'operations',
      label: 'OPERATIONS',
      sublabel: 'FEFO & QAOA VRP',
      icon: <Truck className="w-4 h-4" />,
      badge: 'VRP',
    },
    {
      id: 'scenario',
      label: 'SCENARIO LAB',
      sublabel: 'Monsoon Surge Test',
      icon: <Zap className="w-4 h-4 text-[#D9822B]" />,
    },
    {
      id: 'ingestion',
      label: 'DATA INGESTION',
      sublabel: 'Physical Register OCR',
      icon: <Camera className="w-4 h-4 text-[#106BA3]" />,
    },
  ];

  return (
    <nav
      className={`h-full bg-[#182026] border-r border-[#293742] flex flex-col justify-between select-none transition-all duration-200 z-20 shrink-0 ${
        isCollapsed ? 'w-14' : 'w-56'
      }`}
    >
      {/* Navigation Links */}
      <div className="p-2 space-y-1">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-[2px] transition-all text-left font-mono ${
                isActive
                  ? 'bg-[#106BA3]/20 border-l-2 border-[#106BA3] text-[#F5F8FA] font-bold'
                  : 'hover:bg-[#202B33] text-[#A7B6C2] hover:text-[#F5F8FA] border-l-2 border-transparent'
              }`}
            >
              <div className={`shrink-0 ${isActive ? 'text-[#106BA3]' : 'text-[#A7B6C2]'}`}>
                {item.icon}
              </div>

              {!isCollapsed && (
                <div className="flex-1 min-w-0 flex items-center justify-between">
                  <div className="truncate">
                    <div className="text-xs leading-tight font-bold tracking-wider">
                      {item.label}
                    </div>
                    <div className="text-[9px] text-[#A7B6C2] leading-none mt-0.5 truncate">
                      {item.sublabel}
                    </div>
                  </div>

                  {item.badge && (
                    <span className="ml-1 px-1 py-0.2 text-[8px] font-bold rounded-[1px] bg-[#293742] text-[#A7B6C2]">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer / Collapse Toggle */}
      <div className="p-2 border-t border-[#293742] flex items-center justify-between text-xs font-mono text-[#A7B6C2]">
        {!isCollapsed && (
          <div className="flex items-center gap-1.5 text-[10px] text-[#0D8050]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>DPDP & ABDM READY</span>
          </div>
        )}

        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-1.5 hover:bg-[#202B33] rounded-[2px] text-[#A7B6C2] hover:text-[#F5F8FA] transition-colors ml-auto"
            title={isCollapsed ? 'Expand Navigation' : 'Collapse Navigation'}
          >
            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>
    </nav>
  );
};
''')

# 10. PriorityActionCard.tsx
write('frontend/src/components/tactical/PriorityActionCard.tsx', '''import React from 'react';
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
      className={`foundry-card p-3.5 space-y-2.5 transition-all ${
        isSelected ? 'border-[#106BA3] bg-[#202B33]' : 'hover:border-[#394B59]'
      }`}
    >
      {/* Top Tag & Facility Name */}
      <div className="flex items-center justify-between gap-2">
        <Badge variant={isCritical ? 'danger' : 'warning'} dot pulse size="xs">
          {isCritical ? 'P0 CRITICAL STOCKOUT' : 'P1 BUFFER WARNING'}
        </Badge>
        <span className="font-mono text-[10px] text-[#A7B6C2]">
          {action.facilityId}
        </span>
      </div>

      <div>
        <h4 className="text-xs font-bold text-[#F5F8FA] truncate font-sans">
          {action.facilityName}
        </h4>
        <div className="text-[11px] font-mono text-[#D9822B] mt-0.5">
          {action.medicineName} ({action.medicineCode})
        </div>
      </div>

      {/* Metric Breakdown Strip */}
      <div className="grid grid-cols-2 gap-2 p-2 bg-[#111418] border border-[#293742] rounded-[2px] font-mono text-xs">
        <div>
          <div className="text-[9px] text-[#A7B6C2]">STOCK LEVEL</div>
          <div className="font-bold text-[#C23030]">
            {action.currentStock} units ({action.daysRemaining.toFixed(1)}d)
          </div>
        </div>
        <div>
          <div className="text-[9px] text-[#A7B6C2]">DONOR CANDIDATE</div>
          <div className="font-bold text-[#0D8050] truncate">
            {action.donorFacilityId} ({action.distanceKm} km)
          </div>
        </div>
      </div>

      {/* Proposed Transfer Action */}
      <div className="flex items-center justify-between text-xs font-mono text-[#A7B6C2] pt-0.5">
        <span>PROPOSED TRANSFER:</span>
        <span className="font-bold text-[#F5F8FA]">
          {action.recommendedUnits} units ({action.transitTimeMin}m ETA)
        </span>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#293742]">
        <Button
          variant="secondary"
          size="xs"
          onClick={() => onReviewDecision(action)}
        >
          REVIEW AI
        </Button>
        <Button
          variant="primary"
          size="xs"
          onClick={() => onDispatchRoute(action)}
          rightIcon={<ArrowRight className="w-3 h-3" />}
        >
          DISPATCH
        </Button>
      </div>
    </div>
  );
};
''')

# 11. tactical/index.ts
write('frontend/src/components/tactical/index.ts', '''export * from './TacticalHeader';
export * from './TacticalNavRail';
export * from './PriorityActionCard';
''')

print('Phase 2 UI foundation written successfully!')