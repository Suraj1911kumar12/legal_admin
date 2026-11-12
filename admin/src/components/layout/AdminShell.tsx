'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Loader2 } from 'lucide-react';

interface AdminShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const AdminShell: React.FC<AdminShellProps> = ({ children, title, subtitle }) => {
  const { admin, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8FAFC]">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-sm">
          <Loader2 className="w-5 h-5 animate-spin text-[#172554]" />
          <span className="text-sm font-medium text-[#172033]">Verifying administrator session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <div className="flex flex-col flex-1 min-w-0">
        <Header
          onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          title={title}
          subtitle={subtitle}
        />

        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
};

