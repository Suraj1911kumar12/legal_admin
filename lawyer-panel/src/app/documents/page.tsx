'use client';

import React, { useState } from 'react';
import { LawyerShell } from '@/components/layout/LawyerShell';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { useDocumentsList, useReviewDocument } from '@/hooks/useLawyerDocuments';
import {
  FileText,
  FileCheck,
  AlertTriangle,
  Download,
  Eye,
  Search,
  Filter,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { formatDate, formatFileSize } from '@/lib/utils';
import { DocumentRecord } from '@/types/lawyer';

export default function DocumentsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  // Review modal
  const [selectedDoc, setSelectedDoc] = useState<DocumentRecord | null>(null);
  const [reviewStatus, setReviewStatus] = useState<string>('reviewed');
  const [reviewComments, setReviewComments] = useState('');

  const queryParams: Record<string, any> = { page, limit: 12 };
  if (statusFilter) queryParams.reviewStatus = statusFilter;
  if (search.trim()) queryParams.search = search.trim();

  const { data: res, isLoading } = useDocumentsList(queryParams);
  const reviewMutation = useReviewDocument();

  const documents = res?.data || [];

  const handleOpenReview = (doc: DocumentRecord) => {
    setSelectedDoc(doc);
    setReviewStatus(doc.reviewStatus === 'pending' ? 'reviewed' : doc.reviewStatus);
    setReviewComments(doc.reviewComments || '');
  };

  const handleConfirmReview = async () => {
    if (!selectedDoc) return;
    try {
      await reviewMutation.mutateAsync({
        id: selectedDoc._id,
        reviewStatus,
        reviewComments: reviewComments.trim()
      });
      setSelectedDoc(null);
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'reviewed':
        return <Badge variant="success">Reviewed</Badge>;
      case 'action_required':
        return <Badge variant="warning">Action Required</Badge>;
      case 'pending':
        return <Badge variant="default">Pending Review</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <LawyerShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Case Documents & Evidence</h1>
          <p className="text-sm text-slate-500">
            Review, annotate, and verify evidentiary files submitted by clients.
          </p>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { value: '', label: 'All Review Statuses' },
                { value: 'pending', label: 'Pending Review' },
                { value: 'reviewed', label: 'Reviewed / Verified' },
                { value: 'action_required', label: 'Action Required' }
              ]}
              className="w-48 text-xs"
            />
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search document name, client..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500"
            />
          </div>
        </div>

        {/* Documents Grid */}
        {isLoading ? (
          <div className="p-12 text-center text-sm text-slate-400">Loading documents...</div>
        ) : documents.length === 0 ? (
          <Card className="text-center py-16">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">No Documents Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              There are no case files matching your selected criteria.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <Card key={doc._id} className="hover:shadow-md transition-shadow flex flex-col justify-between">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-lg bg-navy-50 text-navy-800 flex items-center justify-center font-bold">
                      <FileText className="w-5 h-5 text-navy-700" />
                    </div>
                    {getStatusBadge(doc.reviewStatus)}
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-sm truncate" title={doc.name}>
                      {doc.name}
                    </h3>
                    <p className="text-xs text-slate-500 capitalize">
                      {doc.documentType?.replace('_', ' ')} • {formatFileSize(doc.fileSize)}
                    </p>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg text-xs space-y-1">
                    <div className="flex justify-between text-slate-600">
                      <span>Client:</span>
                      <span className="font-medium text-slate-800">{doc.customerName}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Uploaded:</span>
                      <span className="font-medium text-slate-800">{formatDate(doc.uploadedAt)}</span>
                    </div>
                  </div>

                  {doc.reviewComments && (
                    <div className="p-2 bg-amber-50 rounded border border-amber-200 text-xs">
                      <span className="font-semibold text-amber-900">Lawyer Review: </span>
                      <span className="text-amber-800">{doc.reviewComments}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenReview(doc)}
                      className="text-xs flex-1"
                    >
                      <FileCheck className="w-3.5 h-3.5 mr-1" />
                      Review File
                    </Button>
                    <a
                      href={`#download-${doc._id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        alert(`Opening secure download stream for: ${doc.name}`);
                      }}
                      className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
                      title="Download File"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Review Dialog */}
        <Dialog
          isOpen={!!selectedDoc}
          onClose={() => setSelectedDoc(null)}
          title={`Review Document: ${selectedDoc?.name || ''}`}
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Provide formal counsel verification or mark this file as needing additional documentation or correction from the client.
            </p>

            <Select
              label="Review Verdict"
              value={reviewStatus}
              onChange={(e) => setReviewStatus(e.target.value)}
              options={[
                { value: 'reviewed', label: 'Reviewed & Verified (Accepted)' },
                { value: 'action_required', label: 'Action Required (Deficiencies Noted)' },
                { value: 'pending', label: 'Keep as Pending' }
              ]}
            />

            <Textarea
              label="Counsel Review Comments"
              value={reviewComments}
              onChange={(e) => setReviewComments(e.target.value)}
              placeholder="e.g. Document verified against registry; page 4 stamp confirmed..."
              rows={3}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setSelectedDoc(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmReview}
                isLoading={reviewMutation.isPending}
              >
                Save Review
              </Button>
            </div>
          </div>
        </Dialog>
      </div>
    </LawyerShell>
  );
}
