'use client';

import React, { useState } from 'react';
import { LawyerShell } from '@/components/layout/LawyerShell';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import {
  useConsultationsList,
  useAcceptConsultation,
  useDeclineConsultation,
  useUpdateConsultationStatus
} from '@/hooks/useLawyerConsultations';
import {
  Calendar,
  Clock,
  Video,
  Phone,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  DollarSign,
  User,
  ExternalLink,
  Search,
  Filter
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Consultation } from '@/types/lawyer';

export default function ConsultationsPage() {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Modals state
  const [acceptingItem, setAcceptingItem] = useState<Consultation | null>(null);
  const [meetingLink, setMeetingLink] = useState('');
  const [decliningItem, setDecliningItem] = useState<Consultation | null>(null);
  const [declineReason, setDeclineReason] = useState('');

  const queryParams: Record<string, any> = { page, limit: 10 };
  if (activeTab !== 'all') {
    queryParams.status = activeTab;
  }
  if (search.trim()) {
    queryParams.search = search.trim();
  }

  const { data: res, isLoading } = useConsultationsList(queryParams);
  const acceptMutation = useAcceptConsultation();
  const declineMutation = useDeclineConsultation();
  const updateStatusMutation = useUpdateConsultationStatus();

  const consultations = res?.data || [];

  const handleOpenAccept = (c: Consultation) => {
    setAcceptingItem(c);
    setMeetingLink(c.meetingLink || 'https://meet.google.com/ldp-' + c.consultationReference.toLowerCase());
  };

  const handleConfirmAccept = async () => {
    if (!acceptingItem) return;
    try {
      await acceptMutation.mutateAsync({
        id: acceptingItem._id,
        meetingLink: meetingLink.trim()
      });
      setAcceptingItem(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenDecline = (c: Consultation) => {
    setDecliningItem(c);
    setDeclineReason('');
  };

  const handleConfirmDecline = async () => {
    if (!decliningItem || !declineReason.trim()) return;
    try {
      await declineMutation.mutateAsync({
        id: decliningItem._id,
        reason: declineReason.trim()
      });
      setDecliningItem(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateStatusMutation.mutateAsync({ id, status });
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge variant="success">Confirmed</Badge>;
      case 'pending':
        return <Badge variant="warning">Awaiting Lawyer</Badge>;
      case 'completed':
        return <Badge variant="info">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="danger">Cancelled</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4 text-navy-600" />;
      case 'phone':
        return <Phone className="w-4 h-4 text-emerald-600" />;
      case 'in_person':
        return <MapPin className="w-4 h-4 text-amber-600" />;
      default:
        return <Calendar className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <LawyerShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Consultation Management</h1>
          <p className="text-sm text-slate-500">
            Schedule, manage, and conduct legal consultations with verified clients.
          </p>
        </div>

        {/* Tab Filters and Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
            {['all', 'pending', 'accepted', 'completed', 'cancelled'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setPage(1);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${
                  activeTab === tab
                    ? 'bg-navy-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reference, client..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500"
            />
          </div>
        </div>

        {/* Consultations List */}
        {isLoading ? (
          <div className="p-12 text-center text-sm text-slate-400">Loading consultations...</div>
        ) : consultations.length === 0 ? (
          <Card className="text-center py-16">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">No Consultations Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              There are currently no consultation appointments matching your current filter.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {consultations.map((c) => (
              <Card key={c._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-navy-800">
                          {c.consultationReference}
                        </span>
                        {getStatusBadge(c.status)}
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {c.customer?.name}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {c.customer?.phone} • {c.customer?.email}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-900">
                        ₹{c.fee?.toLocaleString('en-IN') || 0}
                      </div>
                      <span className="text-[10px] text-slate-400">Consultation Fee</span>
                    </div>
                  </div>

                  {/* Date & Mode info */}
                  <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-lg text-xs">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Calendar className="w-4 h-4 text-navy-600" />
                      <span>{c.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <Clock className="w-4 h-4 text-navy-600" />
                      <span>{c.time} ({c.timeZone || 'IST'})</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 capitalize col-span-2">
                      {getTypeIcon(c.type)}
                      <span>Mode: {c.type?.replace('_', ' ')}</span>
                    </div>
                  </div>

                  {c.notes && (
                    <p className="text-xs text-slate-600 bg-amber-50/50 p-2 rounded border border-amber-100">
                      <span className="font-semibold text-amber-900">Client Note: </span>
                      {c.notes}
                    </p>
                  )}

                  {c.meetingLink && (
                    <div className="text-xs flex items-center justify-between p-2 bg-blue-50/60 rounded border border-blue-100">
                      <span className="text-blue-900 font-medium truncate max-w-[200px]">
                        Link: {c.meetingLink}
                      </span>
                      <a
                        href={c.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-navy-700 hover:text-navy-900 font-semibold inline-flex items-center gap-1 text-[11px]"
                      >
                        Join <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                    {c.status === 'pending' && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDecline(c)}
                          className="text-red-600 hover:bg-red-50 text-xs"
                        >
                          Decline
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleOpenAccept(c)}
                          className="text-xs"
                        >
                          Accept Consultation
                        </Button>
                      </>
                    )}

                    {c.status === 'accepted' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(c._id, 'completed')}
                          disabled={updateStatusMutation.isPending}
                          className="text-xs"
                        >
                          Mark Completed
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusChange(c._id, 'cancelled')}
                          disabled={updateStatusMutation.isPending}
                          className="text-red-600 hover:bg-red-50 text-xs"
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Accept Modal */}
        <Dialog
          isOpen={!!acceptingItem}
          onClose={() => setAcceptingItem(null)}
          title="Confirm Consultation Appointment"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Confirming this appointment will notify <strong>{acceptingItem?.customer?.name}</strong> and schedule the session on your legal docket.
            </p>

            <Input
              label="Meeting Link / Instructions"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              placeholder="e.g. Google Meet URL or office floor instructions"
              helperText="The client will receive this in their confirmation alert."
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setAcceptingItem(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmAccept}
                isLoading={acceptMutation.isPending}
              >
                Confirm & Accept
              </Button>
            </div>
          </div>
        </Dialog>

        {/* Decline Modal */}
        <Dialog
          isOpen={!!decliningItem}
          onClose={() => setDecliningItem(null)}
          title="Decline Consultation Request"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Please specify the professional reason for declining this request. The client will be informed and can reschedule.
            </p>

            <Textarea
              label="Decline Reason"
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="e.g. Conflict of interest, schedule fully booked, or outside jurisdictional practice..."
              rows={3}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDecliningItem(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmDecline}
                disabled={!declineReason.trim()}
                isLoading={declineMutation.isPending}
              >
                Confirm Decline
              </Button>
            </div>
          </div>
        </Dialog>
      </div>
    </LawyerShell>
  );
}
