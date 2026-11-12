'use client';

import React from 'react';
import Link from 'next/link';
import { LawyerShell } from '@/components/layout/LawyerShell';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { QueryStatusBadge, MatterStatusBadge, UrgencyBadge } from '@/components/ui/Badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table';
import { useLawyerDashboardStats } from '@/hooks/useLawyerQueries';
import { formatDate } from '@/lib/utils';
import {
  Inbox,
  Briefcase,
  Calendar,
  FileText,
  Clock,
  ArrowRight,
  MessageSquare,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function LawyerDashboardPage() {
  const { data: stats, isLoading } = useLawyerDashboardStats();

  return (
    <LawyerShell
      title="Advocate Dashboard"
      subtitle="Operational command center for intake queries, active client matters, and consultations"
    >
      <div className="space-y-8">
        {/* Top Operational Metrics */}
        <div>
          <div className="flex items-center justify-between pb-3">
            <div>
              <h2 className="text-xl font-bold text-[#172033]">Operational Metrics</h2>
              <p className="text-xs text-[#64748B]">Real-time matter workload and customer queries</p>
            </div>
            <Link href="/queries">
              <Button variant="accent" size="sm" leftIcon={<Inbox className="w-4 h-4" />}>
                Review Queries ({stats?.newQueries ?? 0})
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5 flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-[#64748B] uppercase">Active Matters</p>
                <p className="text-2xl font-bold text-[#172033]">{isLoading ? '—' : stats?.activeMatters ?? 0}</p>
                <p className="text-[11px] text-[#94A3B8]">In progress or court pending</p>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F0F4F8] text-[#172554]">
                <Briefcase className="w-5 h-5" />
              </div>
            </Card>

            <Card className="p-5 flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-[#64748B] uppercase">New Queries</p>
                <p className="text-2xl font-bold text-[#172033]">{isLoading ? '—' : stats?.newQueries ?? 0}</p>
                <p className="text-[11px] text-[#C49A45] font-medium">Eligible for acceptance</p>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FAF6ED] text-[#C49A45]">
                <Inbox className="w-5 h-5" />
              </div>
            </Card>

            <Card className="p-5 flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-[#64748B] uppercase">Pending Consultations</p>
                <p className="text-2xl font-bold text-[#172033]">{isLoading ? '—' : stats?.pendingConsultations ?? 0}</p>
                <p className="text-[11px] text-[#94A3B8]">Client requests awaiting confirmation</p>
              </div>
              <div className="p-2.5 rounded-xl bg-[#EFF6FF] text-[#2563EB]">
                <Calendar className="w-5 h-5" />
              </div>
            </Card>

            <Card className="p-5 flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-[#64748B] uppercase">Docs Awaiting Review</p>
                <p className="text-2xl font-bold text-[#172033]">{isLoading ? '—' : stats?.docsAwaitingReview ?? 0}</p>
                <p className="text-[11px] text-[#94A3B8]">Client uploaded case files</p>
              </div>
              <div className="p-2.5 rounded-xl bg-[#ECFDF5] text-[#15803D]">
                <FileText className="w-5 h-5" />
              </div>
            </Card>
          </div>
        </div>

        {/* Quick Action Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <Link href="/queries">
            <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs hover:border-[#172554] transition-all flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#FAF6ED] text-[#C49A45]">
                <Inbox className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-[#172033] block">Incoming Queries</span>
                <span className="text-[#64748B]">Review & accept cases</span>
              </div>
            </div>
          </Link>

          <Link href="/matters">
            <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs hover:border-[#172554] transition-all flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#F0F4F8] text-[#172554]">
                <Briefcase className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-[#172033] block">My Matters</span>
                <span className="text-[#64748B]">Track legal files</span>
              </div>
            </div>
          </Link>

          <Link href="/messages">
            <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs hover:border-[#172554] transition-all flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#EFF6FF] text-[#2563EB]">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-[#172033] block">Direct Messages</span>
                <span className="text-[#64748B]">Client conversations</span>
              </div>
            </div>
          </Link>

          <Link href="/consultations">
            <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs hover:border-[#172554] transition-all flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#ECFDF5] text-[#15803D]">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-[#172033] block">Consultations</span>
                <span className="text-[#64748B]">Schedule & video calls</span>
              </div>
            </div>
          </Link>
        </div>

        {/* 2-Section Split: Recent Queries & Active Matters */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Queries */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-sm">Recent Incoming Queries</CardTitle>
                <CardDescription>Legal problems awaiting advocate intake</CardDescription>
              </div>
              <Link href="/queries" className="text-xs font-semibold text-[#172554] hover:text-[#C49A45]">
                View All &rarr;
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {stats?.recentQueries && stats.recentQueries.length > 0 ? (
                <div className="divide-y divide-[#E2E8F0]">
                  {stats.recentQueries.map((query) => (
                    <div key={query._id} className="p-4 hover:bg-[#F8FAFC] transition-colors flex items-center justify-between gap-4">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#172033]">{query.queryReference}</span>
                          <UrgencyBadge urgency={query.urgency} />
                        </div>
                        <p className="text-xs font-semibold text-[#172033] truncate">{query.category}</p>
                        <p className="text-xs text-[#64748B] line-clamp-1">{query.summary}</p>
                      </div>

                      <Link href={`/queries/${query._id}`}>
                        <Button variant="outline" size="sm" className="shrink-0">
                          Review
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-[#64748B]">
                  No pending customer queries in your practice areas at this moment.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Matters */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-sm">Active Legal Matters</CardTitle>
                <CardDescription>Recently updated client matters</CardDescription>
              </div>
              <Link href="/matters" className="text-xs font-semibold text-[#172554] hover:text-[#C49A45]">
                View All &rarr;
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {stats?.recentMatters && stats.recentMatters.length > 0 ? (
                <div className="divide-y divide-[#E2E8F0]">
                  {stats.recentMatters.map((matter) => (
                    <div key={matter._id} className="p-4 hover:bg-[#F8FAFC] transition-colors flex items-center justify-between gap-4">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#172033]">{matter.matterReference}</span>
                          <MatterStatusBadge status={matter.status} />
                        </div>
                        <p className="text-xs font-semibold text-[#172033] truncate">{matter.title}</p>
                        <p className="text-xs text-[#64748B]">Client: {matter.customer.name}</p>
                      </div>

                      <Link href={`/matters/${matter._id}`}>
                        <Button variant="outline" size="sm" className="shrink-0">
                          Open
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-[#64748B]">
                  No active matters assigned yet. Accept a query to initiate your first matter.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </LawyerShell>
  );
}

