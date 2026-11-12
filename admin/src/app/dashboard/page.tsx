'use client';

import React from 'react';
import Link from 'next/link';
import { AdminShell } from '@/components/layout/AdminShell';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { RecentLawyersTable } from '@/components/dashboard/RecentLawyersTable';
import { Button } from '@/components/ui/Button';
import { useDashboardStats } from '@/hooks/useLawyers';
import {
  Users,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  UserPlus,
  ArrowRight
} from 'lucide-react';

export default function DashboardPage() {
  const { data: stats, isLoading, isError, error, refetch } = useDashboardStats();

  return (
    <AdminShell
      title="Platform Operations Overview"
      subtitle="Real-time legal-tech platform registry metrics and recent lawyer registrations"
    >
      <div className="space-y-8">
        {/* Top Header Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
          <div>
            <h2 className="text-xl font-bold text-[#172033]">Operational Metrics</h2>
            <p className="text-xs text-[#64748B]">Database-derived records and verification queues</p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/verification">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<ShieldCheck className="w-4 h-4 text-[#2563EB]" />}
              >
                Verification Queue
              </Button>
            </Link>

            <Link href="/lawyers/new">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<UserPlus className="w-4 h-4 text-[#C49A45]" />}
              >
                Add Lawyer
              </Button>
            </Link>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Total Lawyers"
            value={isLoading ? '—' : stats?.totalLawyers ?? 0}
            icon={<Users className="w-5 h-5" />}
            variant="primary"
            subtitle="Registered across all states"
          />

          <MetricCard
            label="Pending Review"
            value={isLoading ? '—' : stats?.pendingVerification ?? 0}
            icon={<Clock className="w-5 h-5" />}
            variant="warning"
            subtitle="Awaiting initial verification"
          />

          <MetricCard
            label="Verified Lawyers"
            value={isLoading ? '—' : stats?.verified ?? 0}
            icon={<CheckCircle2 className="w-5 h-5" />}
            variant="success"
            subtitle="Credentials verified & authorized"
          />

          <MetricCard
            label="Suspended Accounts"
            value={isLoading ? '—' : stats?.suspendedLawyers ?? 0}
            icon={<AlertTriangle className="w-5 h-5" />}
            variant="danger"
            subtitle="Placed on compliance hold"
          />
        </div>

        {/* Secondary Status Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-[#64748B]">Under Active Review</p>
                <p className="text-lg font-bold text-[#172033]">{stats?.underReview ?? 0}</p>
              </div>
            </div>
            <Link href="/verification" className="text-xs font-semibold text-[#2563EB] hover:underline">
              Review &rarr;
            </Link>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#ECFDF5] text-[#15803D] flex items-center justify-center font-bold">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-[#64748B]">Active Standing</p>
                <p className="text-lg font-bold text-[#172033]">{stats?.activeLawyers ?? 0}</p>
              </div>
            </div>
            <span className="text-[11px] font-medium text-[#15803D] bg-[#ECFDF5] px-2 py-0.5 rounded">
              Operating
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-[#64748B]">Rejected Applications</p>
                <p className="text-lg font-bold text-[#172033]">{stats?.rejected ?? 0}</p>
              </div>
            </div>
            <Link href="/lawyers?verificationStatus=rejected" className="text-xs font-semibold text-[#DC2626] hover:underline">
              Inspect &rarr;
            </Link>
          </div>
        </div>

        {/* Recent Lawyers Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#172033]">Recently Enrolled Lawyers</h3>
              <p className="text-xs text-[#64748B]">Latest 5 lawyer profiles submitted to the platform</p>
            </div>

            <Link
              href="/lawyers"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#172554] hover:text-[#C49A45] transition-colors"
            >
              <span>View All Lawyers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
            <RecentLawyersTable lawyers={stats?.recentLawyers || []} />
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

