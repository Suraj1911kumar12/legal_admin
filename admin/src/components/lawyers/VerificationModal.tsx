'use client';

import React, { useState } from 'react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { Lawyer, VerificationStatus } from '@/types/lawyer';
import { useUpdateVerification } from '@/hooks/useLawyers';
import { Toast } from '../ui/Toast';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  lawyer: Lawyer;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  isOpen,
  onClose,
  lawyer
}) => {
  const currentStatus = lawyer.verificationStatus;

  // Determine allowed target statuses based on business rules
  let allowedTargets: { value: VerificationStatus; label: string }[] = [];

  if (currentStatus === 'pending') {
    allowedTargets = [
      { value: 'under_review', label: 'Mark Under Review (Begin Review)' }
    ];
  } else if (currentStatus === 'under_review') {
    allowedTargets = [
      { value: 'verified', label: 'Verify Lawyer (Approve)' },
      { value: 'rejected', label: 'Reject Verification' }
    ];
  } else if (currentStatus === 'rejected') {
    allowedTargets = [
      { value: 'under_review', label: 'Reopen for Review' }
    ];
  } else if (currentStatus === 'verified') {
    allowedTargets = [
      { value: 'under_review', label: 'Reopen Under Review' }
    ];
  }

  const [targetStatus, setTargetStatus] = useState<VerificationStatus>(
    allowedTargets[0]?.value || 'under_review'
  );
  const [verificationNotes, setVerificationNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const updateMutation = useUpdateVerification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (targetStatus === 'rejected' && (!rejectionReason || rejectionReason.trim().length === 0)) {
      setErrorMsg('Rejection reason is mandatory when rejecting verification.');
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: lawyer._id,
        status: targetStatus,
        verificationNotes: verificationNotes.trim() || undefined,
        rejectionReason: targetStatus === 'rejected' ? rejectionReason.trim() : undefined
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update verification status');
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Update Lawyer Verification"
      description={`Manage credential verification for ${lawyer.fullName}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && <Toast type="error" message={errorMsg} />}

        <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs space-y-1">
          <div>
            <span className="text-[#64748B]">Enrollment Number:</span>{' '}
            <span className="font-mono font-bold text-[#172033]">{lawyer.barEnrollmentNumber}</span>
          </div>
          <div>
            <span className="text-[#64748B]">Bar Council:</span>{' '}
            <span className="font-semibold text-[#172033]">{lawyer.barCouncil} ({lawyer.enrollmentState})</span>
          </div>
          <div>
            <span className="text-[#64748B]">Current Status:</span>{' '}
            <span className="font-semibold uppercase tracking-wider text-[#172033]">{lawyer.verificationStatus}</span>
          </div>
        </div>

        <Select
          label="Target Verification Status"
          required
          value={targetStatus}
          onChange={(e) => setTargetStatus(e.target.value as VerificationStatus)}
          options={allowedTargets}
        />

        {targetStatus === 'rejected' && (
          <Textarea
            label="Rejection Reason (Required)"
            required
            rows={3}
            placeholder="Specify why verification is rejected (e.g., bar council enrollment mismatch, invalid proof document)..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
        )}

        <Textarea
          label="Internal Verification Notes (Admin-only)"
          rows={3}
          placeholder="Add optional internal notes regarding checks performed, registry confirmation, etc..."
          value={verificationNotes}
          onChange={(e) => setVerificationNotes(e.target.value)}
        />

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant={targetStatus === 'rejected' ? 'danger' : 'primary'}
            isLoading={updateMutation.isPending}
          >
            Confirm Status Update
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

