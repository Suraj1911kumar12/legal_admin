'use client';

import React from 'react';
import Link from 'next/link';
import { Menu, LogOut, Bell, ShieldCheck, Clock, AlertCircle } from 'lucide-react';
import { useLawyerAuth } from '@/hooks/useLawyerAuth';
import { useNotificationsList } from '@/hooks/useLawyerNotifications';
import { Button } from '../ui/Button';
import { VerificationBadge } from '../ui/Badge';

interface HeaderProps {
  onMenuToggle: () => void;
  title?: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle, title, subtitle }) => {
  const { lawyer, logout, isLoggingOut } = useLawyerAuth();
  const { data: notifications } = useNotificationsList();

  const unreadCount = notifications?.filter((n) => !n.isRead).length || 0;

  return (
    <header className="h-16 px-6 border-b border-[#E2E8F0] bg-white flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="p-1.5 rounded-lg text-[#64748B] hover:bg-[#F1F5F9] md:hidden focus:outline-none"
        >
          <Menu className="w-5 h-5" />
        </button>

        {title && (
          <div>
            <h1 className="text-base font-semibold text-[#172033] leading-tight">{title}</h1>
            {subtitle && <p className="text-xs text-[#64748B]">{subtitle}</p>}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3.5">
        {lawyer && (
          <>
            <div className="hidden sm:block">
              <VerificationBadge status={lawyer.verificationStatus} />
            </div>

            {/* Notification Bell */}
            <Link
              href="/notifications"
              className="relative p-2 rounded-lg text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#172033] transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#DC2626]" />
              )}
            </Link>

            {/* Logout Action */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => logout()}
              isLoading={isLoggingOut}
              className="text-[#DC2626] hover:text-[#DC2626] hover:bg-[#FEF2F2]"
              leftIcon={<LogOut className="w-4 h-4" />}
            >
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </>
        )}
      </div>
    </header>
  );
};

