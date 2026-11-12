import React from 'react';
import { ShieldCheck } from 'lucide-react-native';
import { Colors } from '@/theme/tokens';
import { AppBadge } from '../ui/AppBadge';

export interface VerificationBadgeProps {
  verified?: boolean;
  label?: string;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  verified = true,
  label = 'Bar Verified'
}) => {
  if (!verified) return null;
  return (
    <AppBadge
      label={label}
      tone="success"
      icon={<ShieldCheck size={12} color={Colors.success} />}
    />
  );
};

