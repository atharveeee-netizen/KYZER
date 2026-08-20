import sys

def write_file(path, content):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'Wrote {path}')

# 1. Badge.tsx
write_file('frontend/src/components/ui/Badge.tsx', '''import React from 'react';

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
      className={inline-flex items-center gap-1.5 font-mono font-bold tracking-wider uppercase rounded-[2px] border     }
      {...props}
    >
      {dot && (
        <span className={w-1.5 h-1.5 rounded-full shrink-0  } />
      )}
      {children}
    </span>
  );
};
''')

# 2. Button.tsx
write_file('frontend/src/components/ui/Button.tsx', '''import React from 'react';
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
      className={oundry-btn font-medium transition-all select-none disabled:opacity-50 disabled:cursor-not-allowed   }
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
write_file('frontend/src/components/ui/Card.tsx', '''import React from 'react';

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
      className={oundry-card overflow-hidden  }
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
write_file('frontend/src/components/ui/StatCard.tsx', '''import React from 'react';
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
        <div className={	ext-xl sm:text-2xl font-bold font-mono tracking-tight }>
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
write_file('frontend/src/components/ui/Drawer.tsx', '''import React from 'react';
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
        className={w-full  h-full bg-[#182026] border-l border-[#293742] shadow-2xl flex flex-col transform transition-transform animate-in slide-in-from-right duration-200}
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
write_file('frontend/src/components/ui/Modal.tsx', '''import React from 'react';
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
        className={w-full  bg-[#182026] border border-[#293742] rounded-[3px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]}
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
write_file('frontend/src/components/ui/index.ts', '''export * from './Badge';
export * from './Button';
export * from './Card';
export * from './StatCard';
export * from './Drawer';
export * from './Modal';
export * from './CommandPalette';
''')
