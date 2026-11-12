'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { LawyerShell } from '@/components/layout/LawyerShell';
import { useMattersList } from '@/hooks/useLawyerMatters';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { MatterStatusBadge } from '@/components/ui/Badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { formatDate } from '@/lib/utils';
import { Search, RotateCcw, Briefcase, ArrowUpRight, FolderOpen } from 'lucide-react';

export default function MyMattersPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');

  const { data, isLoading } = useMattersList({
    page,
    limit,
    search: search || undefined,
    status: status || undefined,
    category: category || undefined
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleReset = () => {
    setSearch('');
    setSearchInput('');
    setStatus('');
    setCategory('');
    setPage(1);
  };

  return (
    <LawyerShell
      title="My Legal Matters"
      subtitle="Comprehensive matter docket for active cases, client status updates, and private advocate notes"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]">
          <div>
            <h2 className="text-xl font-bold text-[#172033]">Active Case Docket</h2>
            <p className="text-xs text-[#64748B]">All ongoing legal engagements assigned to your chambers</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="p-4 bg-white rounded-xl border border-[#E2E8F0] shadow-sm space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="Search matters by reference, title, client name, or email..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>
            <Button type="submit" variant="primary" size="md">
              Search
            </Button>
            {(search || status || category) && (
              <Button type="button" variant="outline" size="md" onClick={handleReset} leftIcon={<RotateCcw className="w-4 h-4" />}>
                Reset
              </Button>
            )}
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#E2E8F0]">
            <Select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              options={[
                { value: '', label: 'All Matter Statuses' },
                { value: 'active', label: 'Active Matter' },
                { value: 'pending_court', label: 'Pending Court' },
                { value: 'under_negotiation', label: 'Under Negotiation' },
                { value: 'intake', label: 'Intake' },
                { value: 'resolved', label: 'Resolved' },
                { value: 'closed', label: 'Closed' }
              ]}
            />

            <Select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              options={[
                { value: '', label: 'All Categories' },
                { value: 'Property Dispute', label: 'Property Dispute' },
                { value: 'Civil Litigation', label: 'Civil Litigation' },
                { value: 'Corporate & Commercial Law', label: 'Corporate Law' },
                { value: 'Family & Matrimonial Law', label: 'Family Law' },
                { value: 'Criminal Defense', label: 'Criminal Defense' }
              ]}
            />
          </div>
        </div>

        {/* Matters Table */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Matter Reference</TableHead>
                <TableHead>Matter Title & Category</TableHead>
                <TableHead>Client Details</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-[#64748B]">
                    Loading legal matters...
                  </TableCell>
                </TableRow>
              ) : data?.data && data.data.length > 0 ? (
                data.data.map((matter) => (
                  <TableRow key={matter._id}>
                    <TableCell>
                      <span className="font-mono text-xs font-bold text-[#172033] block">
                        {matter.matterReference}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-0.5 max-w-sm">
                        <Link
                          href={`/matters/${matter._id}`}
                          className="font-semibold text-xs text-[#172033] hover:text-[#172554] hover:underline"
                        >
                          {matter.title}
                        </Link>
                        <p className="text-[11px] text-[#64748B]">{matter.category}</p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-0.5 text-xs">
                        <span className="font-medium text-[#172033]">{matter.customer.name}</span>
                        <p className="text-[#64748B]">{matter.customer.phone}</p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <MatterStatusBadge status={matter.status} />
                    </TableCell>

                    <TableCell className="text-xs text-[#64748B] whitespace-nowrap">
                      {formatDate(matter.updatedAt)}
                    </TableCell>

                    <TableCell className="text-right">
                      <Link href={`/matters/${matter._id}`}>
                        <Button variant="outline" size="sm" rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>
                          Workspace
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-[#64748B] space-y-1">
                    <p className="font-semibold text-sm text-[#172033]">No Legal Matters Found</p>
                    <p className="text-xs">Matters will be created automatically when you accept incoming queries.</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

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
    </LawyerShell>
  );
}

