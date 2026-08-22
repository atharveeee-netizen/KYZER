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
};
