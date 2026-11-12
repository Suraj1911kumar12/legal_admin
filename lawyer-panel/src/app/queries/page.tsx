'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { LawyerShell } from '@/components/layout/LawyerShell';
import { useQueriesList } from '@/hooks/useLawyerQueries';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { QueryStatusBadge, UrgencyBadge } from '@/components/ui/Badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { formatDate } from '@/lib/utils';
import { Search, RotateCcw, FileText, ArrowUpRight, MapPin } from 'lucide-react';

export default function IncomingQueriesPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [urgency, setUrgency] = useState('');

  const { data, isLoading } = useQueriesList({
    page,
    limit,
    search: search || undefined,
    status: status || undefined,
    category: category || undefined,
    urgency: urgency || undefined
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
    setUrgency('');
    setPage(1);
  };

  return (
    <LawyerShell
      title="Incoming Customer Queries"
      subtitle="Examine citizen problem briefs, review customer intake summaries, and accept cases"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]">
          <div>
            <h2 className="text-xl font-bold text-[#172033]">Citizen Legal Inquiries</h2>
            <p className="text-xs text-[#64748B]">
              Queries matched with your practice profile. Accepting an inquiry initiates an active matter.
            </p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 bg-white rounded-xl border border-[#E2E8F0] shadow-sm space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="Search queries by reference, category, customer name, summary, or city..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>
            <Button type="submit" variant="primary" size="md">
              Search
            </Button>
            {(search || status || category || urgency) && (
              <Button type="button" variant="outline" size="md" onClick={handleReset} leftIcon={<RotateCcw className="w-4 h-4" />}>
                Reset
              </Button>
            )}
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#E2E8F0]">
            <Select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              options={[
                { value: '', label: 'All Query Statuses' },
                { value: 'pending', label: 'Open for Review' },
                { value: 'assigned', label: 'Assigned to You' },
                { value: 'accepted', label: 'Accepted by You' },
                { value: 'declined', label: 'Declined' }
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
                { value: 'Family & Matrimonial Law', label: 'Family Law' },
                { value: 'Corporate & Commercial Law', label: 'Corporate Law' },
                { value: 'Criminal Defense', label: 'Criminal Defense' },
                { value: 'Consumer Disputes', label: 'Consumer Disputes' }
              ]}
            />

            <Select
              value={urgency}
              onChange={(e) => {
                setUrgency(e.target.value);
                setPage(1);
              }}
              options={[
                { value: '', label: 'All Urgency Levels' },
                { value: 'urgent', label: 'Urgent' },
                { value: 'high', label: 'High' },
                { value: 'medium', label: 'Medium' },
                { value: 'low', label: 'Low' }
              ]}
            />
          </div>
        </div>

        {/* Queries Table */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference & Urgency</TableHead>
                <TableHead>Legal Category & Summary</TableHead>
                <TableHead>Citizen / Location</TableHead>
                <TableHead>Documents</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Received</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-[#64748B]">
                    Loading incoming customer queries...
                  </TableCell>
                </TableRow>
              ) : data?.data && data.data.length > 0 ? (
                data.data.map((query) => (
                  <TableRow key={query._id}>
                    <TableCell>
                      <div className="space-y-1">
                        <span className="font-mono text-xs font-bold text-[#172033] block">
                          {query.queryReference}
                        </span>
                        <UrgencyBadge urgency={query.urgency} />
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-0.5 max-w-sm">
                        <span className="font-semibold text-xs text-[#172033] block">{query.category}</span>
                        <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed">{query.summary}</p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-0.5 text-xs">
                        <span className="font-medium text-[#172033]">{query.customerName}</span>
                        <div className="flex items-center gap-1 text-[#64748B]">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span>{query.customerLocation}</span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      {query.documents && query.documents.length > 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-[#172554] bg-[#F0F4F8] px-2 py-0.5 rounded">
                          <FileText className="w-3.5 h-3.5" />
                          <span>{query.documents.length} File(s)</span>
                        </span>
                      ) : (
                        <span className="text-xs text-[#94A3B8]">None</span>
                      )}
                    </TableCell>

                    <TableCell>
                      <QueryStatusBadge status={query.status} />
                    </TableCell>

                    <TableCell className="text-xs text-[#64748B] whitespace-nowrap">
                      {formatDate(query.createdAt)}
                    </TableCell>

                    <TableCell className="text-right">
                      <Link href={`/queries/${query._id}`}>
                        <Button variant="primary" size="sm" rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>
                          Review
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-[#64748B] space-y-1">
                    <p className="font-semibold text-sm text-[#172033]">No Incoming Queries Found</p>
                    <p className="text-xs">No customer queries currently match your filter criteria.</p>
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

