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
};
