'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [isLoading, isAuthenticated, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#F8FAFC]">
      <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-sm">
        <Loader2 className="w-5 h-5 animate-spin text-[#172554]" />
        <span className="text-sm font-medium text-[#172033]">Redirecting to LegalDost Portal...</span>
      </div>
    </div>
  );
}

