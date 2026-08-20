import os

def write(p, c):
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, 'w', encoding='utf-8') as f:
        f.write(c.strip() + '\n')
    print(f'Wrote {p}')

# 1. Button.tsx
button_code = '''import React from 'react';
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
  primary: 'bg-primary hover:bg-primary-active text-primary-foreground border border-primary shadow-subtle',
  secondary: 'bg-surface-card hover:bg-surface-elevated text-ink border border-hairline hover:border-hairline-strong shadow-subtle',
  success: 'bg-intent-success hover:opacity-90 text-white border border-intent-success shadow-subtle',
  danger: 'bg-intent-danger hover:opacity-90 text-white border border-intent-danger shadow-subtle',
  ghost: 'bg-transparent hover:bg-surface-elevated text-body hover:text-ink',
  outline: 'bg-transparent hover:bg-surface-elevated text-ink border border-hairline hover:border-hairline-strong',
};

const sizeClasses: Record<ButtonSize, string> = {
  xs: 'text-[11px] px-2.5 py-1 gap-1.5',
  sm: 'text-xs px-3.5 py-1.5 gap-2',
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
      className={`foundry-btn font-medium select-none disabled:opacity-40 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
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
'''

write('frontend/src/components/ui/Button.tsx', button_code)

# 2. Badge.tsx
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
    bg: 'bg-intent-primary/10',
    text: 'text-intent-primary',
    border: 'border-intent-primary/30',
    dot: 'bg-intent-primary',
  },
  success: {
    bg: 'bg-intent-success/10',
    text: 'text-intent-success',
    border: 'border-intent-success/30',
    dot: 'bg-intent-success',
  },
  warning: {
    bg: 'bg-intent-warning/10',
    text: 'text-intent-warning',
    border: 'border-intent-warning/30',
    dot: 'bg-intent-warning',
  },
  danger: {
    bg: 'bg-intent-danger/10',
    text: 'text-intent-danger',
    border: 'border-intent-danger/30',
    dot: 'bg-intent-danger',
  },
  neutral: {
    bg: 'bg-surface-elevated',
    text: 'text-body',
    border: 'border-hairline',
    dot: 'bg-muted',
  },
  purple: {
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    border: 'border-purple-500/30',
    dot: 'bg-purple-400',
  },
};

const sizeStyles = {
  xs: 'text-[9px] px-2 py-0.5 leading-3',
  sm: 'text-[10px] px-2.5 py-0.5 leading-3.5',
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
      className={`foundry-badge border ${styles.bg} ${styles.text} ${styles.border} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5">
          {pulse && (
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${styles.dot}`}
            />
          )}
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${styles.dot}`} />
        </span>
      )}
      {children}
    </span>
  );
};
'''

write('frontend/src/components/ui/Badge.tsx', badge_code)

# 3. Card.tsx
card_code = '''import React from 'react';

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
      className={`foundry-card overflow-hidden ${isInteractive ? 'cursor-pointer hover:border-hairline-strong' : ''} ${className}`}
      {...props}
    >
      {header && (
        <div className="px-4 py-2.5 border-b border-hairline bg-surface-elevated/40 flex items-center justify-between">
          {header}
        </div>
      )}
      <div className="p-4">{children}</div>
      {footer && (
        <div className="px-4 py-2 border-t border-hairline bg-surface-elevated/20 text-xs text-body">
          {footer}
        </div>
      )}
    </div>
  );
};
'''

write('frontend/src/components/ui/Card.tsx', card_code)

# 4. StatCard.tsx
stat_card_code = '''import React from 'react';
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
    primary: 'text-intent-primary',
    success: 'text-intent-success',
    warning: 'text-intent-warning',
    danger: 'text-intent-danger',
  };

  return (
    <div className="foundry-card p-4 flex flex-col justify-between space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-muted">
          {label}
        </span>
        {badge ? (
          <Badge variant={badge.variant} size="xs">{badge.text}</Badge>
        ) : icon ? (
          <span className="text-muted">{icon}</span>
        ) : null}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <div className={`text-xl sm:text-2xl font-bold font-mono tabular-nums tracking-tight ${colorMap[statusColor]}`}>
          {value}
        </div>
        {subValue && (
          <div className="text-xs font-mono text-muted">{subValue}</div>
        )}
      </div>

      {(trend || trendLabel) && (
        <div className="flex items-center gap-1 text-[10px] font-mono text-muted border-t border-hairline pt-2">
          {trend === 'up' && <ArrowUpRight className="w-3 h-3 text-intent-danger" />}
          {trend === 'down' && <ArrowDownRight className="w-3 h-3 text-intent-success" />}
          {trend === 'neutral' && <Minus className="w-3 h-3 text-muted" />}
          <span>{trendLabel}</span>
        </div>
      )}
    </div>
  );
};
'''

write('frontend/src/components/ui/StatCard.tsx', stat_card_code)

# 5. Drawer.tsx
drawer_code = '''import React from 'react';
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
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className={`w-full ${widthClasses[width]} h-full bg-surface-card border-l border-hairline shadow-panel flex flex-col transform transition-transform animate-in slide-in-from-right duration-200`}
      >
        {/* Header */}
        <div className="p-4 border-b border-hairline bg-surface-card flex items-center justify-between shrink-0">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold tracking-tight text-ink">
                {title}
              </h2>
              {badge}
            </div>
            {subtitle && (
              <p className="text-xs text-body">{subtitle}</p>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-muted hover:text-ink hover:bg-surface-elevated rounded-full transition-colors"
            title="Close Drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-ink">
          {children}
        </div>
      </div>
    </div>
  );
};
'''

write('frontend/src/components/ui/Drawer.tsx', drawer_code)

# 6. Modal.tsx
modal_code = '''import React from 'react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className={`w-full ${maxWidthClasses[maxWidth]} bg-surface-card border border-hairline rounded-lg shadow-panel overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]`}
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-hairline bg-surface-card flex items-center justify-between shrink-0">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold tracking-tight text-ink">
                {title}
              </h3>
              {badge}
            </div>
            {subtitle && (
              <p className="text-xs text-body">{subtitle}</p>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-muted hover:text-ink hover:bg-surface-elevated rounded-full transition-colors"
            title="Close Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-ink">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-5 py-3 border-t border-hairline bg-surface-elevated/30 flex items-center justify-end gap-2 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
'''

write('frontend/src/components/ui/Modal.tsx', modal_code)
print('UI primitives updated successfully!')