import React from 'react';

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
