import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertCircle, XCircle, Info, X } from 'lucide-react';

interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
  className?: string;
}

export const Toast: React.FC<ToastProps> = ({ type, message, onClose, className }) => {
  const styles = {
    success: 'bg-[#ECFDF5] text-[#15803D] border-[#BBF7D0]',
    error: 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]',
    warning: 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]',
    info: 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]'
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 shrink-0 text-[#15803D]" />,
    error: <XCircle className="w-5 h-5 shrink-0 text-[#DC2626]" />,
    warning: <AlertCircle className="w-5 h-5 shrink-0 text-[#D97706]" />,
    info: <Info className="w-5 h-5 shrink-0 text-[#2563EB]" />
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3.5 rounded-lg border text-sm shadow-sm transition-all',
        styles[type],
        className
      )}
    >
      {icons[type]}
      <div className="flex-1 font-medium leading-relaxed">{message}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-black/5 text-current transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

