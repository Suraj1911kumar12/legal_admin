'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AdminShell } from '@/components/layout/AdminShell';
import { useLawyerDetails, useDeleteLawyer } from '@/hooks/useLawyers';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { VerificationBadge, AccountStatusBadge } from '@/components/ui/Badge';
import { VerificationModal } from '@/components/lawyers/VerificationModal';
import { AccountStatusModal } from '@/components/lawyers/AccountStatusModal';
import { Dialog } from '@/components/ui/Dialog';
import { formatDate, formatDateTime } from '@/lib/utils';
import {
  ArrowLeft,
  Edit,
  ShieldCheck,
  UserX,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Award,
  Calendar,
  Clock,
  FileText
} from 'lucide-react';

export default function LawyerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: lawyer, isLoading, isError, error } = useLawyerDetails(id);
  const deleteMutation = useDeleteLawyer();

  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(id);
      router.push('/lawyers');
    } catch (err: any) {
      alert(err.message || 'Failed to archive record');
    }
  };

  if (isLoading) {
    return (
      <AdminShell title="Lawyer Profile Details">
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
          <h3 className="text-base font-bold text-[#172033]">Practitioner Profile Not Found</h3>
          <p className="text-xs text-[#64748B]">The requested lawyer record could not be found or has been archived.</p>
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
      title={`Adv. ${lawyer.fullName}`}
      subtitle={`Bar Council of ${lawyer.enrollmentState} • ${lawyer.barEnrollmentNumber}`}
    >
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Back and Action Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-3">
            <Link
              href="/lawyers"
              className="p-1.5 rounded-lg text-[#64748B] hover:text-[#172033] hover:bg-[#F1F5F9] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#172033]">{lawyer.fullName}</h2>
                <VerificationBadge status={lawyer.verificationStatus} />
                <AccountStatusBadge status={lawyer.accountStatus} />
              </div>
              <p className="text-xs text-[#64748B]">Enrolled with {lawyer.barCouncil}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/lawyers/${lawyer._id}/edit`}>
              <Button variant="outline" size="sm" leftIcon={<Edit className="w-4 h-4" />}>
                Edit Profile
              </Button>
            </Link>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setVerificationModalOpen(true)}
              leftIcon={<ShieldCheck className="w-4 h-4 text-[#2563EB]" />}
            >
              Verification
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setStatusModalOpen(true)}
              leftIcon={<UserX className="w-4 h-4 text-[#D97706]" />}
            >
              Account Status
            </Button>

            <Button
              variant="danger"
              size="sm"
              onClick={() => setDeleteConfirmOpen(true)}
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              Archive
            </Button>
          </div>
        </div>

        {/* Verification Alert Banner if Rejected or Under Review */}
        {lawyer.verificationStatus === 'rejected' && (
          <div className="p-4 rounded-xl border border-[#FECACA] bg-[#FEF2F2] text-[#DC2626] text-xs space-y-1">
            <span className="font-bold uppercase tracking-wider">Verification Rejected</span>
            <p className="text-sm font-medium">Reason: {lawyer.rejectionReason || 'No reason specified'}</p>
          </div>
        )}

        {lawyer.accountStatus === 'suspended' && (
          <div className="p-4 rounded-xl border border-[#FDE68A] bg-[#FFFBEB] text-[#D97706] text-xs space-y-1">
            <span className="font-bold uppercase tracking-wider">Account Placed on Administrative Hold</span>
            <p className="text-sm font-medium">Reason: {lawyer.statusReason || 'Pending compliance resolution'}</p>
          </div>
        )}

        {/* 2-Column Overview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column (Contact & Personal) */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Personal & Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3.5 text-xs">
                <div>
                  <span className="text-[#64748B]">Full Name</span>
                  <p className="font-semibold text-sm text-[#172033] mt-0.5">{lawyer.fullName}</p>
                </div>

                <div className="flex items-center gap-2 text-[#172033]">
                  <Mail className="w-4 h-4 text-[#64748B] shrink-0" />
                  <a href={`mailto:${lawyer.email}`} className="hover:underline font-medium">
                    {lawyer.email}
                  </a>
                </div>

                <div className="flex items-center gap-2 text-[#172033]">
                  <Phone className="w-4 h-4 text-[#64748B] shrink-0" />
                  <span className="font-medium">{lawyer.phone}</span>
                </div>

                {lawyer.gender && (
                  <div>
                    <span className="text-[#64748B]">Gender</span>
                    <p className="font-medium capitalize text-[#172033] mt-0.5">{lawyer.gender.replace('_', ' ')}</p>
                  </div>
                )}

                <div>
                  <span className="text-[#64748B]">Languages</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {lawyer.languages.map((l) => (
                      <span key={l} className="px-2 py-0.5 bg-[#FAF6ED] text-[#C49A45] font-medium rounded text-[11px] border border-[#ECD9A7]">
                        {l}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Chamber / Office Location</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#64748B] shrink-0 mt-0.5" />
                  <div className="space-y-0.5 text-[#172033]">
                    <p className="font-medium">{lawyer.officeAddress?.addressLine1}</p>
                    {lawyer.officeAddress?.addressLine2 && <p className="text-[#64748B]">{lawyer.officeAddress.addressLine2}</p>}
                    {lawyer.officeAddress?.landmark && <p className="text-[#94A3B8]">Landmark: {lawyer.officeAddress.landmark}</p>}
                    <p className="font-semibold pt-1">
                      {lawyer.city}, {lawyer.state} — {lawyer.pincode}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column (Credentials, Verification, Bio) */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Professional Bar Credentials</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4 p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
                  <div>
                    <span className="text-[#64748B]">Enrollment Number</span>
                    <p className="font-mono text-sm font-bold text-[#172033] mt-0.5">
                      {lawyer.barEnrollmentNumber}
                    </p>
                  </div>
                  <div>
                    <span className="text-[#64748B]">Enrollment State</span>
                    <p className="font-semibold text-sm text-[#172033] mt-0.5">{lawyer.enrollmentState}</p>
                  </div>
                  <div>
                    <span className="text-[#64748B]">Bar Council Authority</span>
                    <p className="font-medium text-[#172033] mt-0.5">{lawyer.barCouncil}</p>
                  </div>
                  <div>
                    <span className="text-[#64748B]">Standing Experience</span>
                    <p className="font-semibold text-[#172033] mt-0.5">{lawyer.yearsOfExperience} Years Active</p>
                  </div>
                </div>

                <div>
                  <span className="text-[#64748B] font-semibold uppercase tracking-wider block mb-1.5">
                    Practice Areas & Specializations
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {lawyer.practiceAreas.map((pa) => (
                      <span
                        key={pa}
                        className="px-2.5 py-1 rounded-md bg-[#172554] text-white text-xs font-medium shadow-xs"
                      >
                        {pa}
                      </span>
                    ))}
                  </div>
                </div>

                {lawyer.professionalBio && (
                  <div>
                    <span className="text-[#64748B] font-semibold uppercase tracking-wider block mb-1">
                      Professional Background & Bio
                    </span>
                    <p className="text-sm leading-relaxed text-[#172033] whitespace-pre-line p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                      {lawyer.professionalBio}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Verification & Administrative Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Verification Record & Audit Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[#64748B]">Current Verification Status</span>
                    <div className="mt-1">
                      <VerificationBadge status={lawyer.verificationStatus} />
                    </div>
                  </div>

                  <div>
                    <span className="text-[#64748B]">Account Standing</span>
                    <div className="mt-1">
                      <AccountStatusBadge status={lawyer.accountStatus} />
                    </div>
                  </div>

                  {lawyer.verifiedAt && (
                    <div>
                      <span className="text-[#64748B]">Verified On</span>
                      <p className="font-medium text-[#172033] mt-0.5">{formatDate(lawyer.verifiedAt)}</p>
                    </div>
                  )}

                  {lawyer.verifiedBy && (
                    <div>
                      <span className="text-[#64748B]">Verified By Admin</span>
                      <p className="font-medium text-[#172033] mt-0.5">{lawyer.verifiedBy.name} ({lawyer.verifiedBy.email})</p>
                    </div>
                  )}
                </div>

                {lawyer.verificationNotes && (
                  <div className="p-3 bg-[#FAF6ED] border border-[#ECD9A7] rounded-lg">
                    <span className="font-semibold text-[#C49A45] uppercase tracking-wider block mb-0.5">
                      Admin Verification Notes:
                    </span>
                    <p className="text-xs text-[#172033]">{lawyer.verificationNotes}</p>
                  </div>
                )}

                <div className="pt-2 border-t border-[#E2E8F0] text-[11px] text-[#94A3B8] flex flex-wrap gap-4">
                  <span>Created: {formatDateTime(lawyer.createdAt)}</span>
                  <span>Updated: {formatDateTime(lawyer.updatedAt)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Verification Dialog */}
      <VerificationModal
        isOpen={verificationModalOpen}
        onClose={() => setVerificationModalOpen(false)}
        lawyer={lawyer}
      />

      {/* Account Standing Dialog */}
      <AccountStatusModal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        lawyer={lawyer}
      />

      {/* Soft Delete Dialog */}
      <Dialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Archive Lawyer Profile"
        description={`Confirm archiving for ${lawyer.fullName}`}
      >
        <div className="space-y-4">
          <p className="text-xs text-[#64748B] leading-relaxed">
            This operation will soft-delete the lawyer's profile and record the acting admin in the platform audit log.
          </p>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              isLoading={deleteMutation.isPending}
              onClick={handleDelete}
            >
              Confirm Archive
            </Button>
          </div>
        </div>
      </Dialog>
    </AdminShell>
  );
}

