'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AdminShell } from '@/components/layout/AdminShell';
import { LawyerForm } from '@/components/lawyers/LawyerForm';
import { useLawyerDetails, useUpdateLawyer } from '@/hooks/useLawyers';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function EditLawyerPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: lawyer, isLoading, isError } = useLawyerDetails(id);
  const updateMutation = useUpdateLawyer();

  const handleUpdate = async (data: any) => {
    await updateMutation.mutateAsync({ id, data });
    router.push(`/lawyers/${id}`);
  };

  if (isLoading) {
    return (
      <AdminShell title="Edit Lawyer Profile">
        <div className="p-12 text-center bg-white border border-[#E2E8F0] rounded-xl">
          <p className="text-sm text-[#64748B]">Loading advocate credentials...</p>
        </div>
      </AdminShell>
    );
  }

  if (isError || !lawyer) {
    return (
      <AdminShell title="Lawyer Not Found">
        <div className="p-12 text-center bg-white border border-[#E2E8F0] rounded-xl space-y-3">
          <h3 className="text-base font-bold text-[#172033]">Practitioner Not Found</h3>
          <p className="text-xs text-[#64748B]">The lawyer record you are trying to edit does not exist.</p>
          <Link href="/lawyers">
            <Button variant="outline" size="sm">
              Back to Lawyers List
            </Button>
          </Link>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title={`Edit Profile: ${lawyer.fullName}`}
      subtitle={`Bar Enrollment: ${lawyer.barEnrollmentNumber}`}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href={`/lawyers/${id}`}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#172033] hover:bg-[#F1F5F9] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-xl font-bold text-[#172033]">Edit Practitioner Profile</h2>
            <p className="text-xs text-[#64748B]">
              Update contact information, practice domains, and office locations safely.
            </p>
          </div>
        </div>

        <LawyerForm
          initialData={lawyer}
          onSubmit={handleUpdate}
          isLoading={updateMutation.isPending}
          isEdit
        />
      </div>
    </AdminShell>
  );
}

