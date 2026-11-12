import { Lawyer } from '../lawyers/lawyer.model';

export interface DashboardStats {
  totalLawyers: number;
  pendingVerification: number;
  underReview: number;
  verified: number;
  rejected: number;
  activeLawyers: number;
  suspendedLawyers: number;
  inactiveLawyers: number;
  recentLawyers: any[];
}

export class DashboardService {
  static async getStats(): Promise<DashboardStats> {
    const [result] = await Lawyer.aggregate([
      {
        $match: { deletedAt: null }
      },
      {
        $facet: {
          total: [{ $count: 'count' }],
          pending: [
            { $match: { verificationStatus: 'pending' } },
            { $count: 'count' }
          ],
          underReview: [
            { $match: { verificationStatus: 'under_review' } },
            { $count: 'count' }
          ],
          verified: [
            { $match: { verificationStatus: 'verified' } },
            { $count: 'count' }
          ],
          rejected: [
            { $match: { verificationStatus: 'rejected' } },
            { $count: 'count' }
          ],
          active: [
            { $match: { accountStatus: 'active' } },
            { $count: 'count' }
          ],
          suspended: [
            { $match: { accountStatus: 'suspended' } },
            { $count: 'count' }
          ],
          inactive: [
            { $match: { accountStatus: 'inactive' } },
            { $count: 'count' }
          ],
          recent: [
            { $sort: { createdAt: -1 } },
            { $limit: 5 },
            {
              $project: {
                fullName: 1,
                email: 1,
                phone: 1,
                barEnrollmentNumber: 1,
                practiceAreas: 1,
                verificationStatus: 1,
                accountStatus: 1,
                city: 1,
                state: 1,
                createdAt: 1
              }
            }
          ]
        }
      }
    ]);

    const getCount = (arr: any[]) => (arr && arr.length > 0 ? arr[0].count : 0);

    return {
      totalLawyers: getCount(result?.total),
      pendingVerification: getCount(result?.pending),
      underReview: getCount(result?.underReview),
      verified: getCount(result?.verified),
      rejected: getCount(result?.rejected),
      activeLawyers: getCount(result?.active),
      suspendedLawyers: getCount(result?.suspended),
      inactiveLawyers: getCount(result?.inactive),
      recentLawyers: result?.recent || []
    };
  }
}

