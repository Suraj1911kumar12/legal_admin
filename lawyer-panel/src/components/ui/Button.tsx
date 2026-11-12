import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

    const variants = {
      primary:
        'bg-[#172554] text-white hover:bg-[#1E3A8A] focus:ring-[#172554] shadow-sm',
      secondary:
        'bg-[#F1F5F9] text-[#172033] hover:bg-[#E2E8F0] focus:ring-[#94A3B8]',
      accent:
        'bg-[#C49A45] text-white hover:bg-[#A37B30] focus:ring-[#C49A45] shadow-sm',
      outline:
        'border border-[#E2E8F0] bg-white text-[#172033] hover:bg-[#F8FAFC] focus:ring-[#172554]',
      danger:
        'bg-[#DC2626] text-white hover:bg-[#B91C1C] focus:ring-[#DC2626] shadow-sm',
      success:
        'bg-[#15803D] text-white hover:bg-[#166534] focus:ring-[#15803D] shadow-sm',
      ghost:
        'bg-transparent text-[#64748B] hover:text-[#172033] hover:bg-[#F1F5F9] focus:ring-[#94A3B8]'
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 gap-1.5',
      md: 'text-sm px-4 py-2 gap-2',
      lg: 'text-base px-5 py-2.5 gap-2.5'
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

