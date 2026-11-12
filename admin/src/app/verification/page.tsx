'use client';

import React, { useState } from 'react';
import { AdminShell } from '@/components/layout/AdminShell';
import { useLawyersList } from '@/hooks/useLawyers';
import { LawyerTable } from '@/components/lawyers/LawyerTable';
import { Pagination } from '@/components/ui/Pagination';
import { Button } from '@/components/ui/Button';
import { ShieldCheck, Clock, CheckCircle2, XCircle } from 'lucide-react';

export default function VerificationQueuePage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'under_review' | 'rejected'>('pending');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const { data, isLoading } = useLawyersList({
    page,
    limit,
    verificationStatus: activeTab,
    sortBy: 'createdAt',
    sortOrder: 'asc' // Oldest pending first
  });

  return (
    <AdminShell
      title="Lawyer Verification Queue"
      subtitle="Dedicated administrative portal to examine bar enrollment credentials and authorize practitioners"
    >
      <div className="space-y-6">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[#E2E8F0] pb-3">
          <Button
            variant={activeTab === 'pending' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => {
              setActiveTab('pending');
              setPage(1);
            }}
            leftIcon={<Clock className="w-4 h-4" />}
          >
            Pending Review
          </Button>

          <Button
            variant={activeTab === 'under_review' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => {
              setActiveTab('under_review');
              setPage(1);
            }}
            leftIcon={<ShieldCheck className="w-4 h-4" />}
          >
            Under Active Review
          </Button>

          <Button
            variant={activeTab === 'rejected' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => {
              setActiveTab('rejected');
              setPage(1);
            }}
            leftIcon={<XCircle className="w-4 h-4" />}
          >
            Rejected Records
          </Button>
        </div>

        {/* Workflow Instruction Box */}
        <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] text-xs text-[#64748B] space-y-1">
          <p className="font-semibold text-[#172033]">Verification Process Guidelines:</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>
              <strong>Pending:</strong> Advocate newly entered. Must be moved to <em>Under Review</em> before approving.
            </li>
            <li>
              <strong>Under Review:</strong> Verify enrollment ID against the respective State Bar Council roster.
            </li>
            <li>
              <strong>Approve:</strong> Confirms advocate as verified practitioner on LegalDost.
            </li>
            <li>
              <strong>Reject:</strong> Requires a mandatory documented reason. Rejected records can be reopened if documents are rectified.
            </li>
          </ul>
        </div>

        {/* Queue Table */}
        <LawyerTable lawyers={data?.data || []} isLoading={isLoading} />

        {/* Pagination */}
        {data && (
          <Pagination
            currentPage={data.pagination.page}
            totalPages={data.pagination.totalPages}
            totalRecords={data.pagination.total}
            pageSize={limit}
            onPageChange={(p) => setPage(p)}
          />
        )}
      </div>
    </AdminShell>
  );
}

