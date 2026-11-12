import React from 'react';
import { Card } from '../ui/Card';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  variant?: 'primary' | 'gold' | 'success' | 'warning' | 'info' | 'danger';
  subtitle?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  icon,
  variant = 'primary',
  subtitle
}) => {
  const iconBg = {
    primary: 'bg-[#F0F4F8] text-[#172554]',
    gold: 'bg-[#FAF6ED] text-[#C49A45]',
    success: 'bg-[#ECFDF5] text-[#15803D]',
    warning: 'bg-[#FFFBEB] text-[#D97706]',
    info: 'bg-[#EFF6FF] text-[#2563EB]',
    danger: 'bg-[#FEF2F2] text-[#DC2626]'
  };

  return (
    <Card className="p-5 flex items-start justify-between transition-all hover:shadow-sm">
      <div className="space-y-1">
        <p className="text-xs font-semibold text-[#64748B] tracking-wide uppercase">{label}</p>
        <p className="text-2xl font-bold text-[#172033] tracking-tight">{value}</p>
        {subtitle && <p className="text-[11px] text-[#94A3B8]">{subtitle}</p>}
      </div>

      <div className={cn('p-2.5 rounded-xl shrink-0', iconBg[variant])}>
        {icon}
      </div>
    </Card>
  );
};

