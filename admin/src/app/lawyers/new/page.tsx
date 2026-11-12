'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AdminShell } from '@/components/layout/AdminShell';
import { LawyerForm } from '@/components/lawyers/LawyerForm';
import { useCreateLawyer } from '@/hooks/useLawyers';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewLawyerPage() {
  const router = useRouter();
  const createMutation = useCreateLawyer();

  const handleCreate = async (payload: any) => {
    const newLawyer = await createMutation.mutateAsync(payload);
    router.push(`/lawyers/${newLawyer._id}`);
  };

  return (
    <AdminShell
      title="Create Lawyer Profile"
      subtitle="Enter advocate credentials to register in the central LegalDost database"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/lawyers"
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#172033] hover:bg-[#F1F5F9] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-xl font-bold text-[#172033]">New Practitioner Onboarding</h2>
            <p className="text-xs text-[#64748B]">
              Newly registered profiles default to 'pending' verification status until review is performed.
            </p>
          </div>
        </div>

        <LawyerForm onSubmit={handleCreate} isLoading={createMutation.isPending} />
      </div>
    </AdminShell>
  );
}

