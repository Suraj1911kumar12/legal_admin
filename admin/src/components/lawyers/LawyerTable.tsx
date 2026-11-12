'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Lawyer } from '@/types/lawyer';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../ui/Table';
import { VerificationBadge, AccountStatusBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import { VerificationModal } from './VerificationModal';
import { AccountStatusModal } from './AccountStatusModal';
import { useDeleteLawyer } from '@/hooks/useLawyers';
import { formatDate } from '@/lib/utils';
import {
  Eye,
  Edit,
  ShieldCheck,
  UserX,
  Trash2,
  MoreVertical,
  CheckCircle2
} from 'lucide-react';

interface LawyerTableProps {
  lawyers: Lawyer[];
  isLoading?: boolean;
}

export const LawyerTable: React.FC<LawyerTableProps> = ({ lawyers, isLoading }) => {
  const [selectedLawyerForVerification, setSelectedLawyerForVerification] = useState<Lawyer | null>(null);
  const [selectedLawyerForStatus, setSelectedLawyerForStatus] = useState<Lawyer | null>(null);
  const [lawyerToDelete, setLawyerToDelete] = useState<Lawyer | null>(null);

  const deleteMutation = useDeleteLawyer();

  const handleConfirmDelete = async () => {
    if (!lawyerToDelete) return;
    try {
      await deleteMutation.mutateAsync(lawyerToDelete._id);
      setLawyerToDelete(null);
    } catch (err: any) {
      alert(err.message || 'Failed to archive lawyer');
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center bg-white border border-[#E2E8F0] rounded-xl">
        <p className="text-sm text-[#64748B]">Loading lawyers registry...</p>
      </div>
    );
  }

  if (lawyers.length === 0) {
    return (
      <div className="p-12 text-center bg-white border border-[#E2E8F0] rounded-xl space-y-3">
        <p className="text-base font-semibold text-[#172033]">No Lawyers Found</p>
        <p className="text-xs text-[#64748B]">
          No lawyer profiles matched your search or filter parameters.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lawyer Name & Contact</TableHead>
              <TableHead>Bar Enrollment</TableHead>
              <TableHead>Experience & Practice</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Verification</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lawyers.map((lawyer) => (
              <TableRow key={lawyer._id}>
                {/* Lawyer Info */}
                <TableCell>
                  <div className="space-y-0.5">
                    <Link
                      href={`/lawyers/${lawyer._id}`}
                      className="font-semibold text-sm text-[#172033] hover:text-[#172554] hover:underline"
                    >
                      {lawyer.fullName}
                    </Link>
                    <p className="text-xs text-[#64748B]">{lawyer.email}</p>
                    <p className="text-xs text-[#94A3B8]">{lawyer.phone}</p>
                  </div>
                </TableCell>

                {/* Enrollment */}
                <TableCell>
                  <div className="space-y-0.5">
                    <span className="font-mono text-xs font-bold text-[#172033]">
                      {lawyer.barEnrollmentNumber}
                    </span>
                    <p className="text-xs text-[#64748B]">{lawyer.barCouncil}</p>
                    <span className="text-[11px] font-medium text-[#94A3B8]">{lawyer.enrollmentState}</span>
                  </div>
                </TableCell>

                {/* Experience & Practice */}
                <TableCell>
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-[#172033]">
                      {lawyer.yearsOfExperience} yrs experience
                    </span>
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {lawyer.practiceAreas.slice(0, 2).map((area) => (
                        <span
                          key={area}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-[#F1F5F9] text-[#475569] font-medium"
                        >
                          {area}
                        </span>
                      ))}
                      {lawyer.practiceAreas.length > 2 && (
                        <span className="text-[10px] px-1 py-0.5 text-[#64748B]">
                          +{lawyer.practiceAreas.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                </TableCell>

                {/* Location */}
                <TableCell>
                  <div className="text-xs">
                    <span className="font-medium text-[#172033]">{lawyer.city}</span>
                    <p className="text-[#64748B]">{lawyer.state}</p>
                  </div>
                </TableCell>

                {/* Verification Status */}
                <TableCell>
                  <VerificationBadge status={lawyer.verificationStatus} />
                </TableCell>

                {/* Account Status */}
                <TableCell>
                  <AccountStatusBadge status={lawyer.accountStatus} />
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Link href={`/lawyers/${lawyer._id}`}>
                      <Button variant="ghost" size="sm" className="p-1.5 h-8 w-8 text-[#172554]">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>

                    <Link href={`/lawyers/${lawyer._id}/edit`}>
                      <Button variant="ghost" size="sm" className="p-1.5 h-8 w-8 text-[#64748B]">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>

                    <Button
                      variant="ghost"
                      size="sm"
                      title="Update Verification"
                      onClick={() => setSelectedLawyerForVerification(lawyer)}
                      className="p-1.5 h-8 w-8 text-[#2563EB]"
                    >
                      <ShieldCheck className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      title="Update Account Standing"
                      onClick={() => setSelectedLawyerForStatus(lawyer)}
                      className="p-1.5 h-8 w-8 text-[#D97706]"
                    >
                      <UserX className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      title="Archive / Soft Delete"
                      onClick={() => setLawyerToDelete(lawyer)}
                      className="p-1.5 h-8 w-8 text-[#DC2626] hover:bg-[#FEF2F2]"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Verification Dialog */}
      {selectedLawyerForVerification && (
        <VerificationModal
          isOpen={!!selectedLawyerForVerification}
          onClose={() => setSelectedLawyerForVerification(null)}
          lawyer={selectedLawyerForVerification}
        />
      )}

      {/* Account Standing Dialog */}
      {selectedLawyerForStatus && (
        <AccountStatusModal
          isOpen={!!selectedLawyerForStatus}
          onClose={() => setSelectedLawyerForStatus(null)}
          lawyer={selectedLawyerForStatus}
        />
      )}

      {/* Confirm Soft Delete Dialog */}
      {lawyerToDelete && (
        <Dialog
          isOpen={!!lawyerToDelete}
          onClose={() => setLawyerToDelete(null)}
          title="Archive Lawyer Record"
          description={`Are you sure you want to archive ${lawyerToDelete.fullName}?`}
        >
          <div className="space-y-4">
            <p className="text-xs text-[#64748B] leading-relaxed">
              This action will soft-delete the lawyer profile and mark the account status as inactive.
              Historical audit records will remain preserved.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
              <Button variant="outline" onClick={() => setLawyerToDelete(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                isLoading={deleteMutation.isPending}
                onClick={handleConfirmDelete}
              >
                Archive Record
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </>
  );
};

