'use client';

import React, { useState } from 'react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { Lawyer, AccountStatus } from '@/types/lawyer';
import { useUpdateAccountStatus } from '@/hooks/useLawyers';
import { Toast } from '../ui/Toast';

interface AccountStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  lawyer: Lawyer;
}

export const AccountStatusModal: React.FC<AccountStatusModalProps> = ({
  isOpen,
  onClose,
  lawyer
}) => {
  const [targetStatus, setTargetStatus] = useState<AccountStatus>(
    lawyer.accountStatus === 'active' ? 'suspended' : 'active'
  );
  const [reason, setReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const statusMutation = useUpdateAccountStatus();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if ((targetStatus === 'suspended' || targetStatus === 'inactive') && (!reason || reason.trim().length === 0)) {
      setErrorMsg('A reason is required when suspending or deactivating an account.');
      return;
    }

    try {
      await statusMutation.mutateAsync({
        id: lawyer._id,
        status: targetStatus,
        reason: reason.trim() || undefined
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update account status');
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Update Lawyer Account Status"
      description={`Change account standing for ${lawyer.fullName}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && <Toast type="error" message={errorMsg} />}

        <Select
          label="Account Status"
          required
          value={targetStatus}
          onChange={(e) => setTargetStatus(e.target.value as AccountStatus)}
          options={[
            { value: 'active', label: 'Active (Full Platform Access)' },
            { value: 'suspended', label: 'Suspended (Temporary Hold)' },
            { value: 'inactive', label: 'Inactive (Deactivated)' }
          ]}
        />

        {(targetStatus === 'suspended' || targetStatus === 'inactive') && (
          <Textarea
            label="Reason for Status Change (Required)"
            required
            rows={3}
            placeholder="Explain why this account is being suspended or deactivated..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant={targetStatus === 'active' ? 'primary' : 'danger'}
            isLoading={statusMutation.isPending}
          >
            Update Account Status
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

