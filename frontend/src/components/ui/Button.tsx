import React from 'react';
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
