'use client';

import React, { useState, useEffect } from 'react';
import { useLawyerAuth } from '@/hooks/useLawyerAuth';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Loader2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

interface LawyerShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  requireVerification?: boolean;
}

export const LawyerShell: React.FC<LawyerShellProps> = ({
  children,
  title,
  subtitle,
  requireVerification = true
}) => {
  const { lawyer, isLoading, isAuthenticated, isVerified } = useLawyerAuth();
  const router = useRouter();
  const pathname = usePathname();
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
          <span className="text-sm font-medium text-[#172033]">Loading advocate credentials...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // If page requires approved verification, but lawyer is pending/rejected
  const showVerificationGate = requireVerification && !isVerified && pathname !== '/onboarding' && pathname !== '/profile';

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <div className="flex flex-col flex-1 min-w-0">
        <Header
          onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          title={title}
          subtitle={subtitle}
        />

        {/* Global Warning Banner if unverified */}
        {!isVerified && (
          <div className="bg-[#FAF6ED] border-b border-[#ECD9A7] px-6 py-3 flex items-center justify-between text-xs text-[#7C5B23]">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#C49A45] shrink-0" />
              <span>
                Your bar enrollment credentials are currently{' '}
                <strong className="uppercase font-bold tracking-wide">{lawyer?.verificationStatus.replace('_', ' ')}</strong>.
                Full platform matching is unlocked once an administrator reviews your registry data.
              </span>
            </div>
            <Link href="/onboarding" className="font-semibold underline hover:text-[#35250E]">
              View Status Details &rarr;
            </Link>
          </div>
        )}

        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {showVerificationGate ? (
            <div className="p-12 text-center bg-white border border-[#E2E8F0] rounded-2xl shadow-sm max-w-xl mx-auto space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#FAF6ED] text-[#C49A45] flex items-center justify-center mx-auto">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#172033]">Verification In Progress</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                This workflow requires an approved advocate license. The LegalDost credential verification team
                is validating your Bar Council enrollment (<span className="font-mono font-semibold">{lawyer?.barEnrollmentNumber}</span>).
              </p>
              <div className="pt-2">
                <Link
                  href="/onboarding"
                  className="inline-flex items-center px-4 py-2 rounded-lg bg-[#172554] text-white text-xs font-semibold hover:bg-[#1E3A8A]"
                >
                  Check Verification Status
                </Link>
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
};

