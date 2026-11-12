'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AdminShell } from '@/components/layout/AdminShell';
import { LawyerTable } from '@/components/lawyers/LawyerTable';
import { Pagination } from '@/components/ui/Pagination';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useLawyersList } from '@/hooks/useLawyers';
import { UserPlus, Search, Filter, RotateCcw } from 'lucide-react';

const practiceAreaFilterOptions = [
  { value: '', label: 'All Practice Areas' },
  { value: 'Civil Litigation', label: 'Civil Litigation' },
  { value: 'Criminal Law', label: 'Criminal Law' },
  { value: 'Corporate & Commercial Law', label: 'Corporate Law' },
  { value: 'Family & Matrimonial Law', label: 'Family Law' },
  { value: 'Property & Real Estate', label: 'Property Law' },
  { value: 'Taxation & GST', label: 'Taxation & GST' },
  { value: 'Intellectual Property (IPR)', label: 'Intellectual Property' },
  { value: 'Labour & Employment Law', label: 'Labour Law' },
  { value: 'Banking & Finance', label: 'Banking & Finance' },
  { value: 'Cyber Law & Data Privacy', label: 'Cyber Law' }
];

export default function LawyersPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('');
  const [accountStatus, setAccountStatus] = useState('');
  const [practiceArea, setPracticeArea] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const { data, isLoading, refetch } = useLawyersList({
    page,
    limit,
    search: search || undefined,
    verificationStatus: verificationStatus || undefined,
    accountStatus: accountStatus || undefined,
    practiceArea: practiceArea || undefined,
    sortBy,
    sortOrder
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setSearchInput('');
    setVerificationStatus('');
    setAccountStatus('');
    setPracticeArea('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
  };

  return (
    <AdminShell
      title="Lawyer Registry Management"
      subtitle="Comprehensive practitioner database with verification oversight and account status controls"
    >
      <div className="space-y-6">
        {/* Page Top Heading & CTA */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]">
          <div>
            <h2 className="text-xl font-bold text-[#172033]">Verified Practitioner Registry</h2>
            <p className="text-xs text-[#64748B]">Manage bar admissions, credential reviews, and account active statuses</p>
          </div>

          <Link href="/lawyers/new">
            <Button
              variant="primary"
              size="md"
              leftIcon={<UserPlus className="w-4 h-4 text-[#C49A45]" />}
            >
              Add New Lawyer
            </Button>
          </Link>
        </div>

        {/* Search and Filters Bar */}
        <div className="p-4 bg-white rounded-xl border border-[#E2E8F0] shadow-sm space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="Search by name, email, phone, enrollment no., or city..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>
            <Button type="submit" variant="primary" size="md">
              Search
            </Button>
            {(search || verificationStatus || accountStatus || practiceArea) && (
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={handleResetFilters}
                leftIcon={<RotateCcw className="w-4 h-4" />}
              >
                Reset
              </Button>
            )}
          </form>

          {/* Filters Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-[#E2E8F0]">
            <Select
              value={verificationStatus}
              onChange={(e) => {
                setVerificationStatus(e.target.value);
                setPage(1);
              }}
              options={[
                { value: '', label: 'All Verification Statuses' },
                { value: 'pending', label: 'Pending' },
                { value: 'under_review', label: 'Under Review' },
                { value: 'verified', label: 'Verified' },
                { value: 'rejected', label: 'Rejected' }
              ]}
            />

            <Select
              value={accountStatus}
              onChange={(e) => {
                setAccountStatus(e.target.value);
                setPage(1);
              }}
              options={[
                { value: '', label: 'All Account Statuses' },
                { value: 'active', label: 'Active' },
                { value: 'suspended', label: 'Suspended' },
                { value: 'inactive', label: 'Inactive' }
              ]}
            />

            <Select
              value={practiceArea}
              onChange={(e) => {
                setPracticeArea(e.target.value);
                setPage(1);
              }}
              options={practiceAreaFilterOptions}
            />

            <Select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-');
                setSortBy(sb);
                setSortOrder(so as 'asc' | 'desc');
                setPage(1);
              }}
              options={[
                { value: 'createdAt-desc', label: 'Sort: Newest First' },
                { value: 'createdAt-asc', label: 'Sort: Oldest First' },
                { value: 'fullName-asc', label: 'Sort: Name (A-Z)' },
                { value: 'fullName-desc', label: 'Sort: Name (Z-A)' },
                { value: 'yearsOfExperience-desc', label: 'Sort: Experience (High-Low)' }
              ]}
            />
          </div>
        </div>

        {/* Lawyer Table */}
        <LawyerTable lawyers={data?.data || []} isLoading={isLoading} />

        {/* Pagination */}
        {data && (
          <Pagination
            currentPage={data.pagination.page}
            totalPages={data.pagination.totalPages}
            totalRecords={data.pagination.total}
            pageSize={limit}
            onPageChange={(p) => setPage(p)}
          />
        )}
      </div>
    </AdminShell>
  );
}

