'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Scale,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      active: pathname === '/dashboard'
    },
    {
      name: 'Lawyers',
      href: '/lawyers',
      icon: Users,
      active: pathname === '/lawyers' || (pathname.startsWith('/lawyers') && !pathname.includes('verification'))
    },
    {
      name: 'Verification Queue',
      href: '/verification',
      icon: ShieldCheck,
      active: pathname === '/verification'
    }
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-[#E2E8F0]">
      {/* Brand Logo & Name */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-[#E2E8F0]">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#172554] text-[#C49A45]">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold tracking-tight text-[#172033]">LegalDost</span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-[#FAF6ED] text-[#C49A45] border border-[#ECD9A7]">
                ADMIN
              </span>
            </div>
            <p className="text-[11px] text-[#64748B]">Legal-Tech Platform</p>
          </div>
        </Link>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-[#64748B] hover:bg-[#F1F5F9] md:hidden"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-2 pb-2 text-[11px] font-semibold tracking-wider text-[#94A3B8] uppercase">
          Navigation
        </div>
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors select-none',
                item.active
                  ? 'bg-[#172554] text-white shadow-sm'
                  : 'text-[#64748B] hover:text-[#172033] hover:bg-[#F8FAFC]'
              )}
            >
              <Icon className={cn('w-4 h-4 shrink-0', item.active ? 'text-[#C49A45]' : 'text-current')} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Subtle Platform Version Footer */}
      <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFC]">
        <div className="text-xs text-[#64748B]">
          <span className="font-semibold text-[#172033]">Phase 1 Production</span>
          <p className="text-[11px] text-[#94A3B8]">Core Admin & Lawyer Registry</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 h-screen sticky top-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="fixed inset-y-0 left-0 w-64 shadow-xl z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

