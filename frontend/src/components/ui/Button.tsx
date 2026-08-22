import React from 'react';
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
};
