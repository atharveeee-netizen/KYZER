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
};
