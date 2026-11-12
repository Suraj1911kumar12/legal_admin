'use client';

import React from 'react';
import { Menu, LogOut, User, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '../ui/Button';

interface HeaderProps {
  onMenuToggle: () => void;
  title?: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle, title, subtitle }) => {
  const { admin, logout, isLoggingOut } = useAuth();

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

      <div className="flex items-center gap-4">
        {admin && (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="flex items-center justify-end gap-1.5">
                <span className="text-xs font-semibold text-[#172033]">{admin.name}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] uppercase">
                  {admin.role.replace('_', ' ')}
                </span>
              </div>
              <p className="text-[11px] text-[#64748B]">{admin.email}</p>
            </div>

            <div className="w-8 h-8 rounded-full bg-[#172554] text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
              {admin.name.charAt(0)}
            </div>

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
          </div>
        )}
      </div>
    </header>
  );
};

