import React from 'react';
import Link from 'next/link';
import { Lawyer } from '@/types/lawyer';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../ui/Table';
import { VerificationBadge, AccountStatusBadge } from '../ui/Badge';
import { formatDate } from '@/lib/utils';
import { ArrowUpRight } from 'lucide-react';

interface RecentLawyersTableProps {
  lawyers: Lawyer[];
}

export const RecentLawyersTable: React.FC<RecentLawyersTableProps> = ({ lawyers }) => {
  if (!lawyers || lawyers.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-[#64748B]">
        No recent lawyer registrations found.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Lawyer</TableHead>
          <TableHead>Enrollment No.</TableHead>
          <TableHead>Practice Areas</TableHead>
          <TableHead>Verification</TableHead>
          <TableHead>Account</TableHead>
          <TableHead>Registered</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {lawyers.map((lawyer) => (
          <TableRow key={lawyer._id}>
            <TableCell>
              <div>
                <span className="font-semibold text-sm text-[#172033]">{lawyer.fullName}</span>
                <p className="text-xs text-[#64748B]">{lawyer.email}</p>
              </div>
            </TableCell>
            <TableCell className="font-mono text-xs font-medium text-[#172033]">
              {lawyer.barEnrollmentNumber}
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1 max-w-xs">
                {lawyer.practiceAreas.slice(0, 2).map((pa) => (
                  <span
                    key={pa}
                    className="text-[11px] px-1.5 py-0.5 rounded bg-[#F1F5F9] text-[#475569]"
                  >
                    {pa}
                  </span>
                ))}
                {lawyer.practiceAreas.length > 2 && (
                  <span className="text-[11px] px-1.5 py-0.5 rounded bg-[#F1F5F9] text-[#64748B]">
                    +{lawyer.practiceAreas.length - 2}
                  </span>
                )}
              </div>
            </TableCell>
            <TableCell>
              <VerificationBadge status={lawyer.verificationStatus} />
            </TableCell>
            <TableCell>
              <AccountStatusBadge status={lawyer.accountStatus} />
            </TableCell>
            <TableCell className="text-xs text-[#64748B] whitespace-nowrap">
              {formatDate(lawyer.createdAt)}
            </TableCell>
            <TableCell className="text-right">
              <Link
                href={`/lawyers/${lawyer._id}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#172554] hover:text-[#C49A45] transition-colors"
              >
                <span>View</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

