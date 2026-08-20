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
