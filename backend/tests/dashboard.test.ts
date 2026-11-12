import request from 'supertest';
import app from '../src/app';
import { setupTestDb, createTestAdmin } from './setup';
import { Lawyer } from '../src/modules/lawyers/lawyer.model';

setupTestDb();

describe('Dashboard Module Tests', () => {
  it('should return real aggregated database metrics matching counts', async () => {
    const { token, admin } = await createTestAdmin('admin');

    // Create 3 lawyers in different states:
    // 1 pending, 1 verified, 1 rejected
    await Lawyer.create([
      {
        fullName: 'Lawyer One',
        email: 'lawyer1@example.com',
        phone: '+919876543211',
        languages: ['English'],
        barEnrollmentNumber: 'D/001/2020',
        barCouncil: 'Bar Council of Delhi',
        enrollmentState: 'Delhi',
        yearsOfExperience: 5,
        practiceAreas: ['Civil Law'],
        officeAddress: { addressLine1: 'Delhi' },
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001',
        verificationStatus: 'pending',
        accountStatus: 'active',
        createdBy: admin._id
      },
      {
        fullName: 'Lawyer Two',
        email: 'lawyer2@example.com',
        phone: '+919876543212',
        languages: ['English'],
        barEnrollmentNumber: 'D/002/2020',
        barCouncil: 'Bar Council of Delhi',
        enrollmentState: 'Delhi',
        yearsOfExperience: 8,
        practiceAreas: ['Criminal Law'],
        officeAddress: { addressLine1: 'Delhi' },
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001',
        verificationStatus: 'verified',
        accountStatus: 'active',
        verifiedAt: new Date(),
        createdBy: admin._id
      },
      {
        fullName: 'Lawyer Three',
        email: 'lawyer3@example.com',
        phone: '+919876543213',
        languages: ['English'],
        barEnrollmentNumber: 'D/003/2020',
        barCouncil: 'Bar Council of Delhi',
        enrollmentState: 'Delhi',
        yearsOfExperience: 3,
        practiceAreas: ['Taxation'],
        officeAddress: { addressLine1: 'Delhi' },
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001',
        verificationStatus: 'rejected',
        accountStatus: 'suspended',
        statusReason: 'Disciplinary violation',
        createdBy: admin._id
      }
    ]);

    const res = await request(app)
      .get('/api/v1/admin/dashboard/stats')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalLawyers).toBe(3);
    expect(res.body.data.pendingVerification).toBe(1);
    expect(res.body.data.verified).toBe(1);
    expect(res.body.data.rejected).toBe(1);
    expect(res.body.data.activeLawyers).toBe(2);
    expect(res.body.data.suspendedLawyers).toBe(1);
    expect(res.body.data.recentLawyers.length).toBe(3);
  });

  it('should reject unauthenticated request to dashboard stats', async () => {
    const res = await request(app).get('/api/v1/admin/dashboard/stats');
    expect(res.status).toBe(401);
  });
});

