'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { LawyerShell } from '@/components/layout/LawyerShell';
import { useQueryDetails, useAcceptQuery, useDeclineQuery } from '@/hooks/useLawyerQueries';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Textarea } from '@/components/ui/Textarea';
import { Toast } from '@/components/ui/Toast';
import { QueryStatusBadge, UrgencyBadge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  FileText,
  MapPin,
  Mail,
  Phone,
  Sparkles,
  AlertCircle,
  HelpCircle,
  ArrowRight
} from 'lucide-react';

export default function QueryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: query, isLoading, isError } = useQueryDetails(id);
  const acceptMutation = useAcceptQuery();
  const declineMutation = useDeclineQuery();

  const [declineModalOpen, setDeclineModalOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleAccept = async () => {
    setErrorMessage('');
    try {
      const res = await acceptMutation.mutateAsync(id);
      router.push(`/matters/${res.matter._id}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to accept query');
    }
  };

  const handleDecline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!declineReason || declineReason.trim().length === 0) {
      setErrorMessage('Decline reason is mandatory');
      return;
    }

    try {
      await declineMutation.mutateAsync({ id, reason: declineReason.trim() });
      setDeclineModalOpen(false);
      router.push('/queries');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to decline query');
    }
  };

  if (isLoading) {
    return (
      <LawyerShell title="Customer Intake Review">
        <div className="p-12 text-center bg-white border border-[#E2E8F0] rounded-xl">
          <p className="text-sm text-[#64748B]">Loading customer intake summary...</p>
        </div>
      </LawyerShell>
    );
  }

  if (isError || !query) {
    return (
      <LawyerShell title="Query Not Found">
        <div className="p-12 text-center bg-white border border-[#E2E8F0] rounded-xl space-y-3">
          <h3 className="text-base font-bold text-[#172033]">Query Not Found</h3>
          <p className="text-xs text-[#64748B]">This inquiry does not exist or has been withdrawn.</p>
          <Link href="/queries">
            <Button variant="outline" size="sm">
              Back to Queries
            </Button>
          </Link>
        </div>
      </LawyerShell>
    );
  }

  const isEligibleToAct = query.status === 'pending' || query.status === 'assigned';

  return (
    <LawyerShell
      title={`Intake Review: ${query.queryReference}`}
      subtitle={`${query.category} • ${query.customerLocation}`}
    >
      <div className="space-y-6 max-w-5xl mx-auto">
        {errorMessage && <Toast type="error" message={errorMessage} onClose={() => setErrorMessage('')} />}

        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-3">
            <Link
              href="/queries"
              className="p-1.5 rounded-lg text-[#64748B] hover:text-[#172033] hover:bg-[#F1F5F9] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#172033]">{query.queryReference}</h2>
                <UrgencyBadge urgency={query.urgency} />
                <QueryStatusBadge status={query.status} />
              </div>
              <p className="text-xs text-[#64748B]">
                Received {formatDate(query.createdAt)} from {query.customerName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isEligibleToAct && (
              <>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setDeclineModalOpen(true)}
                  leftIcon={<XCircle className="w-4 h-4 text-[#DC2626]" />}
                >
                  Decline Query
                </Button>

                <Button
                  variant="primary"
                  size="md"
                  isLoading={acceptMutation.isPending}
                  onClick={handleAccept}
                  leftIcon={<CheckCircle2 className="w-4 h-4 text-[#C49A45]" />}
                >
                  Accept Matter
                </Button>
              </>
            )}

            {query.status === 'accepted' && query.associatedMatterId && (
              <Link href={`/matters/${query.associatedMatterId}`}>
                <Button variant="accent" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Open Matter Workspace
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Citizen Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Citizen Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div>
                  <span className="text-[#64748B]">Customer Name</span>
                  <p className="font-semibold text-sm text-[#172033] mt-0.5">{query.customerName}</p>
                </div>

                <div className="flex items-center gap-2 text-[#172033]">
                  <Mail className="w-4 h-4 text-[#64748B] shrink-0" />
                  <span className="font-medium">{query.customerEmail}</span>
                </div>

                <div className="flex items-center gap-2 text-[#172033]">
                  <Phone className="w-4 h-4 text-[#64748B] shrink-0" />
                  <span className="font-medium">{query.customerPhone}</span>
                </div>

                <div className="flex items-center gap-2 text-[#172033]">
                  <MapPin className="w-4 h-4 text-[#64748B] shrink-0" />
                  <span className="font-medium">{query.customerLocation}</span>
                </div>
              </CardContent>
            </Card>

            {/* Document Attachments */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Citizen Uploaded Documents</CardTitle>
                <CardDescription>Files provided during initial problem submission</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                {query.documents && query.documents.length > 0 ? (
                  query.documents.map((doc, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-4 h-4 text-[#172554] shrink-0" />
                        <span className="font-medium text-[#172033] truncate">{doc.name}</span>
                      </div>
                      <span className="text-[10px] text-[#64748B] uppercase">{doc.type}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#94A3B8]">No files attached to this inquiry.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Problem Brief & AI Intake Summary */}
          <div className="md:col-span-2 space-y-6">
            {/* Citizen Statement */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Citizen Problem Statement</CardTitle>
                <CardDescription>Verbatim problem submitted by citizen</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div>
                  <span className="text-[#64748B] font-semibold uppercase tracking-wider block mb-1">
                    Problem Summary
                  </span>
                  <p className="text-sm text-[#172033] leading-relaxed p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
                    {query.summary}
                  </p>
                </div>

                <div>
                  <span className="text-[#64748B] font-semibold uppercase tracking-wider block mb-1">
                    Specific Legal Question
                  </span>
                  <div className="p-3 bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg text-sm font-medium text-[#1E3A8A] flex items-start gap-2">
                    <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>"{query.specificQuestion}"</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Structured Customer Intake Summary */}
            <Card className="border-[#C49A45]/40 shadow-xs">
              <CardHeader className="bg-[#FAF6ED]/50 border-b border-[#ECD9A7]/50">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#C49A45]" />
                  <CardTitle className="text-sm text-[#172033]">Customer Intake Summary</CardTitle>
                </div>
                <CardDescription>
                  Verified intake facts and structured triage analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                {/* AI Summary */}
                <div>
                  <span className="text-[#64748B] font-semibold uppercase tracking-wider block mb-1">
                    Structured Case Digest
                  </span>
                  <p className="text-xs leading-relaxed text-[#172033] p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
                    {query.intakeSummary?.aiSummary || 'Intake summary generated from citizen interview.'}
                  </p>
                </div>

                {/* Missing Info & Next Steps */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 bg-[#FEF2F2]/60 border border-[#FECACA] rounded-xl space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-[#DC2626]">
                      <AlertCircle className="w-4 h-4" />
                      <span>Missing Information Identified</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-[#172033]">
                      {query.intakeSummary?.missingInformation?.length ? (
                        query.intakeSummary.missingInformation.map((item, i) => <li key={i}>{item}</li>)
                      ) : (
                        <li>Verify dates of notice receipt</li>
                      )}
                    </ul>
                  </div>

                  <div className="p-3.5 bg-[#ECFDF5]/60 border border-[#BBF7D0] rounded-xl space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-[#15803D]">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Recommended Initial Steps</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-[#172033]">
                      {query.intakeSummary?.recommendedNextSteps?.length ? (
                        query.intakeSummary.recommendedNextSteps.map((step, i) => <li key={i}>{step}</li>)
                      ) : (
                        <li>Request registered copy of title deeds</li>
                      )}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Decline Dialog with Mandatory Reason */}
      <Dialog
        isOpen={declineModalOpen}
        onClose={() => setDeclineModalOpen(false)}
        title="Decline Customer Query"
        description="Provide a reason why you cannot accept this inquiry at this time."
      >
        <form onSubmit={handleDecline} className="space-y-4">
          <Textarea
            label="Mandatory Decline Reason"
            required
            rows={3}
            placeholder="e.g. Conflict of interest, outside specialized practice jurisdiction, calendar fully booked..."
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
            <Button type="button" variant="outline" onClick={() => setDeclineModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" isLoading={declineMutation.isPending}>
              Confirm Decline
            </Button>
          </div>
        </form>
      </Dialog>
    </LawyerShell>
  );
}

