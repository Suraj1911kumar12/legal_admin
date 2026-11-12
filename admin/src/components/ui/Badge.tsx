import React from 'react';
import { cn } from '@/lib/utils';
import { VerificationStatus, AccountStatus } from '@/types/lawyer';
import { CheckCircle2, Clock, AlertCircle, XCircle, ShieldCheck } from 'lucide-react';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'gold' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className,
  dot = false
}) => {
  const variants = {
    default: 'bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]',
    success: 'bg-[#ECFDF5] text-[#15803D] border-[#BBF7D0]',
    warning: 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]',
    danger: 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]',
    info: 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]',
    gold: 'bg-[#FAF6ED] text-[#A37B30] border-[#ECD9A7]',
    outline: 'bg-transparent text-[#64748B] border-[#E2E8F0]'
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 gap-1 font-medium',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border shrink-0 select-none tracking-tight',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {dot && (
        <span
          className={cn('w-1.5 h-1.5 rounded-full shrink-0', {
            'bg-[#475569]': variant === 'default' || variant === 'outline',
            'bg-[#15803D]': variant === 'success',
            'bg-[#D97706]': variant === 'warning',
            'bg-[#DC2626]': variant === 'danger',
            'bg-[#2563EB]': variant === 'info',
            'bg-[#A37B30]': variant === 'gold'
          })}
        />
      )}
      {children}
    </span>
  );
};

export const VerificationBadge: React.FC<{ status: VerificationStatus; className?: string }> = ({
  status,
  className
}) => {
  switch (status) {
    case 'verified':
      return (
        <Badge variant="success" className={className}>
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>Verified</span>
        </Badge>
      );
    case 'under_review':
      return (
        <Badge variant="info" className={className}>
          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
          <span>Under Review</span>
        </Badge>
      );
    case 'rejected':
      return (
        <Badge variant="danger" className={className}>
          <XCircle className="w-3.5 h-3.5 shrink-0" />
          <span>Rejected</span>
        </Badge>
      );
    case 'pending':
    default:
      return (
        <Badge variant="warning" className={className}>
          <Clock className="w-3.5 h-3.5 shrink-0" />
          <span>Pending</span>
        </Badge>
      );
  }
};

export const AccountStatusBadge: React.FC<{ status: AccountStatus; className?: string }> = ({
  status,
  className
}) => {
  switch (status) {
    case 'active':
      return (
        <Badge variant="success" dot className={className}>
          Active
        </Badge>
      );
    case 'suspended':
      return (
        <Badge variant="danger" dot className={className}>
          Suspended
        </Badge>
      );
    case 'inactive':
    default:
      return (
        <Badge variant="default" dot className={className}>
          Inactive
        </Badge>
      );
  }
};

