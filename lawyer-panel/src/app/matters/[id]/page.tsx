'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { LawyerShell } from '@/components/layout/LawyerShell';
import {
  useMatterDetails,
  useUpdateMatterStatus,
  useAddInternalNote,
  useAddClientUpdate,
  useAddMatterTask,
  useToggleMatterTask
} from '@/hooks/useLawyerMatters';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { MatterStatusBadge } from '@/components/ui/Badge';
import { formatDate, formatDateTime } from '@/lib/utils';
import {
  ArrowLeft,
  Lock,
  Share2,
  CheckSquare,
  Square,
  Calendar,
  MessageSquare,
  Plus,
  Mail,
  Phone,
  Clock,
  ShieldCheck
} from 'lucide-react';

export default function MatterWorkspacePage() {
  const params = useParams();
  const id = params.id as string;

  const { data: matter, isLoading, isError } = useMatterDetails(id);
  const statusMutation = useUpdateMatterStatus();
  const noteMutation = useAddInternalNote();
  const updateMutation = useAddClientUpdate();
  const taskMutation = useAddMatterTask();
  const toggleTaskMutation = useToggleMatterTask();

  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'updates' | 'tasks'>('overview');

  // Form states
  const [noteContent, setNoteContent] = useState('');
  const [updateTitle, setUpdateTitle] = useState('');
  const [updateMessage, setUpdateMessage] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');

  const handleStatusChange = async (newStatus: string) => {
    try {
      await statusMutation.mutateAsync({ id, status: newStatus });
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    try {
      await noteMutation.mutateAsync({ id, content: noteContent.trim() });
      setNoteContent('');
    } catch (err: any) {
      alert(err.message || 'Failed to record note');
    }
  };

  const handleAddUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateTitle.trim() || !updateMessage.trim()) return;
    try {
      await updateMutation.mutateAsync({
        id,
        title: updateTitle.trim(),
        message: updateMessage.trim(),
        isShared: true
      });
      setUpdateTitle('');
      setUpdateMessage('');
    } catch (err: any) {
      alert(err.message || 'Failed to publish client update');
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    try {
      await taskMutation.mutateAsync({
        id,
        title: taskTitle.trim(),
        dueDate: taskDueDate || undefined
      });
      setTaskTitle('');
      setTaskDueDate('');
    } catch (err: any) {
      alert(err.message || 'Failed to create task');
    }
  };

  if (isLoading) {
    return (
      <LawyerShell title="Matter Workspace">
        <div className="p-12 text-center bg-white border border-[#E2E8F0] rounded-xl">
          <p className="text-sm text-[#64748B]">Loading legal matter dossier...</p>
        </div>
      </LawyerShell>
    );
  }

  if (isError || !matter) {
    return (
      <LawyerShell title="Matter Not Found">
        <div className="p-12 text-center bg-white border border-[#E2E8F0] rounded-xl space-y-3">
          <h3 className="text-base font-bold text-[#172033]">Matter File Not Found</h3>
          <p className="text-xs text-[#64748B]">This matter does not exist or has been archived.</p>
          <Link href="/matters">
            <Button variant="outline" size="sm">
              Back to My Matters
            </Button>
          </Link>
        </div>
      </LawyerShell>
    );
  }

  return (
    <LawyerShell
      title={`Matter ${matter.matterReference}`}
      subtitle={`${matter.title} • Client: ${matter.customer.name}`}
    >
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Top Header & Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-3">
            <Link
              href="/matters"
              className="p-1.5 rounded-lg text-[#64748B] hover:text-[#172033] hover:bg-[#F1F5F9] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#172033]">{matter.title}</h2>
                <MatterStatusBadge status={matter.status} />
              </div>
              <p className="text-xs text-[#64748B]">
                {matter.matterReference} • {matter.category} • Client: {matter.customer.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-44">
              <Select
                value={matter.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                options={[
                  { value: 'active', label: 'Active Matter' },
                  { value: 'pending_court', label: 'Pending Court' },
                  { value: 'under_negotiation', label: 'Under Negotiation' },
                  { value: 'intake', label: 'Intake' },
                  { value: 'resolved', label: 'Resolved' },
                  { value: 'closed', label: 'Closed' }
                ]}
              />
            </div>

            <Link href="/messages">
              <Button variant="outline" size="md" leftIcon={<MessageSquare className="w-4 h-4 text-[#2563EB]" />}>
                Message Client
              </Button>
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#E2E8F0] gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'overview'
                ? 'border-[#172554] text-[#172554]'
                : 'border-transparent text-[#64748B] hover:text-[#172033]'
            }`}
          >
            Overview & Client
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'notes'
                ? 'border-[#172554] text-[#172554]'
                : 'border-transparent text-[#64748B] hover:text-[#172033]'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-[#C49A45]" />
            <span>Private Notes ({matter.internalNotes?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('updates')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'updates'
                ? 'border-[#172554] text-[#172554]'
                : 'border-transparent text-[#64748B] hover:text-[#172033]'
            }`}
          >
            <Share2 className="w-3.5 h-3.5 text-[#15803D]" />
            <span>Client Updates ({matter.clientUpdates?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'tasks'
                ? 'border-[#172554] text-[#172554]'
                : 'border-transparent text-[#64748B] hover:text-[#172033]'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Tasks ({matter.tasks?.length || 0})</span>
          </button>
        </div>

        {/* Tab Content */}

        {/* 1. Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Client Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div>
                  <span className="text-[#64748B]">Client Name</span>
                  <p className="font-semibold text-sm text-[#172033] mt-0.5">{matter.customer.name}</p>
                </div>

                <div className="flex items-center gap-2 text-[#172033]">
                  <Mail className="w-4 h-4 text-[#64748B] shrink-0" />
                  <span className="font-medium">{matter.customer.email}</span>
                </div>

                <div className="flex items-center gap-2 text-[#172033]">
                  <Phone className="w-4 h-4 text-[#64748B] shrink-0" />
                  <span className="font-medium">{matter.customer.phone}</span>
                </div>

                <div className="pt-2 border-t border-[#E2E8F0]">
                  <Link href="/messages">
                    <Button variant="outline" size="sm" className="w-full" leftIcon={<MessageSquare className="w-3.5 h-3.5" />}>
                      Open Conversation
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Matter Summary & Category</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-xs">
                  <div>
                    <span className="text-[#64748B]">Legal Classification</span>
                    <p className="font-semibold text-sm text-[#172033] mt-0.5">{matter.category}</p>
                  </div>

                  <div>
                    <span className="text-[#64748B]">Engagement Title</span>
                    <p className="text-xs text-[#172033] p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg mt-0.5">
                      {matter.title}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-4 pt-2 border-t border-[#E2E8F0] text-[11px] text-[#94A3B8]">
                    <span>Initiated: {formatDate(matter.createdAt)}</span>
                    <span>Last Updated: {formatDateTime(matter.updatedAt)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* 2. Confidential Private Notes */}
        {activeTab === 'notes' && (
          <div className="space-y-6">
            <div className="p-3 bg-[#FAF6ED] border border-[#ECD9A7] rounded-xl text-xs text-[#7C5B23] flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#C49A45] shrink-0" />
              <span>
                <strong>Confidential Advocate Workplace:</strong> Notes in this section are private to your chambers and will never be shared with clients.
              </span>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Record Private Case Note</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddNote} className="space-y-3">
                  <Textarea
                    placeholder="Enter internal trial strategy, witness review notes, research references, or personal reminders..."
                    rows={3}
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                  />
                  <div className="flex justify-end">
                    <Button type="submit" variant="primary" size="sm" isLoading={noteMutation.isPending}>
                      Save Confidential Note
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Note Archive</h3>
              {matter.internalNotes && matter.internalNotes.length > 0 ? (
                matter.internalNotes.map((note, idx) => (
                  <Card key={idx} className="p-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-[#64748B]">
                      <span className="font-semibold text-[#172033]">{note.createdBy}</span>
                      <span>{formatDateTime(note.createdAt)}</span>
                    </div>
                    <p className="text-xs text-[#172033] leading-relaxed whitespace-pre-line">{note.content}</p>
                  </Card>
                ))
              ) : (
                <p className="text-xs text-[#94A3B8]">No private internal notes recorded yet.</p>
              )}
            </div>
          </div>
        )}

        {/* 3. Client Updates */}
        {activeTab === 'updates' && (
          <div className="space-y-6">
            <div className="p-3 bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl text-xs text-[#1E3A8A] flex items-center gap-2">
              <Share2 className="w-4 h-4 text-[#2563EB] shrink-0" />
              <span>
                <strong>Client-Visible Timeline:</strong> Updates posted here are visible to the client to keep them informed of filing dates, hearings, or negotiations.
              </span>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Publish Client Update</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddUpdate} className="space-y-3">
                  <Input
                    label="Update Headline"
                    placeholder="e.g. Rejoinder Filed in Court / Notice Served"
                    value={updateTitle}
                    onChange={(e) => setUpdateTitle(e.target.value)}
                  />
                  <Textarea
                    label="Client Message"
                    rows={3}
                    placeholder="Provide a clear, reassuring summary for the client regarding recent case progress..."
                    value={updateMessage}
                    onChange={(e) => setUpdateMessage(e.target.value)}
                  />
                  <div className="flex justify-end">
                    <Button type="submit" variant="accent" size="sm" isLoading={updateMutation.isPending}>
                      Publish Client Update
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Client Updates Timeline</h3>
              {matter.clientUpdates && matter.clientUpdates.length > 0 ? (
                matter.clientUpdates.map((upd, idx) => (
                  <Card key={idx} className="p-4 space-y-1.5 border-l-4 border-l-[#15803D]">
                    <div className="flex items-center justify-between text-xs text-[#64748B]">
                      <span className="font-bold text-[#172033]">{upd.title}</span>
                      <span>{formatDateTime(upd.createdAt)}</span>
                    </div>
                    <p className="text-xs text-[#172033] leading-relaxed">{upd.message}</p>
                  </Card>
                ))
              ) : (
                <p className="text-xs text-[#94A3B8]">No client updates published yet.</p>
              )}
            </div>
          </div>
        )}

        {/* 4. Tasks */}
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Add Action Item / Task</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddTask} className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <Input
                      placeholder="e.g. Draft Written Statement, procure certified order copy..."
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                    />
                  </div>
                  <div className="w-48">
                    <Input
                      type="date"
                      value={taskDueDate}
                      onChange={(e) => setTaskDueDate(e.target.value)}
                    />
                  </div>
                  <Button type="submit" variant="primary" size="md" isLoading={taskMutation.isPending} leftIcon={<Plus className="w-4 h-4" />}>
                    Add Task
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-2">
              {matter.tasks && matter.tasks.length > 0 ? (
                matter.tasks.map((task) => (
                  <div
                    key={task._id}
                    onClick={() => toggleTaskMutation.mutate({ id, taskId: task._id })}
                    className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                      task.isCompleted
                        ? 'bg-[#F8FAFC] border-[#E2E8F0] opacity-75'
                        : 'bg-white border-[#E2E8F0] hover:border-[#172554]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {task.isCompleted ? (
                        <CheckSquare className="w-4 h-4 text-[#15803D]" />
                      ) : (
                        <Square className="w-4 h-4 text-[#64748B]" />
                      )}
                      <span className={`text-xs font-medium ${task.isCompleted ? 'line-through text-[#64748B]' : 'text-[#172033]'}`}>
                        {task.title}
                      </span>
                    </div>

                    {task.dueDate && (
                      <span className="text-[11px] text-[#64748B] flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Due {formatDate(task.dueDate)}
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#94A3B8]">No pending tasks for this matter.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </LawyerShell>
  );
}

