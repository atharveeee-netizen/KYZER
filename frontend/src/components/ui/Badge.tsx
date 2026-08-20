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
