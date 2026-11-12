import React, { TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, required, ...props }, ref) => {
    const textareaId = id || props.name;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-xs font-semibold text-[#172033] uppercase tracking-wider"
          >
            {label}
            {required && <span className="text-[#DC2626] ml-1">*</span>}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          required={required}
          className={cn(
            'block w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#172033] placeholder-[#94A3B8] transition-colors focus:border-[#172554] focus:outline-none focus:ring-1 focus:ring-[#172554] disabled:bg-[#F8FAFC] disabled:text-[#94A3B8] disabled:cursor-not-allowed',
            error && 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-[#DC2626] font-medium">{error}</p>}
        {!error && helperText && <p className="text-xs text-[#64748B]">{helperText}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

