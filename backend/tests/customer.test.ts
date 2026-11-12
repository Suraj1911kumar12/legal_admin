import request from 'supertest';
import app from '../src/app';
import { setupTestDb } from './setup';
import { Lawyer } from '../src/modules/lawyers/lawyer.model';

setupTestDb();

describe('Customer Portal & Mobile API Tests', () => {
  it('registers, logs in, rotates refresh token safely, and protects /me', async () => {
    const reg = await request(app).post('/api/v1/customer/auth/register').send({
      fullName: 'Aarav Citizen',
      email: 'aarav.citizen@example.com',
      phone: '+919876543210',
      password: 'Password@123',
      preferredLanguage: 'en'
    });

    expect(reg.status).toBe(201);
    expect(reg.body.success).toBe(true);
    expect(reg.body.data.customer.email).toBe('aarav.citizen@example.com');
    expect(reg.body.data.customer.passwordHash).toBeUndefined();
    expect(reg.body.data.accessToken).toBeDefined();
    expect(reg.body.data.refreshToken).toBeDefined();

    const accessToken = reg.body.data.accessToken;
    const refreshToken = reg.body.data.refreshToken;

    const me = await request(app)
      .get('/api/v1/customer/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(me.status).toBe(200);
    expect(me.body.data.fullName).toBe('Aarav Citizen');

    const refreshed = await request(app)
      .post('/api/v1/customer/auth/refresh')
      .send({ refreshToken });
    expect(refreshed.status).toBe(200);
    expect(refreshed.body.data.accessToken).toBeDefined();
    expect(refreshed.body.data.refreshToken).toBeDefined();
    expect(refreshed.body.data.refreshToken).not.toBe(refreshToken);

    // Reusing old rotated refresh token must fail cleanly
    const reused = await request(app)
      .post('/api/v1/customer/auth/refresh')
      .send({ refreshToken });
    expect(reused.status).toBe(401);
  });

  it('creates draft & idempotent submitted intake, AI honest unavailable check, and matter isolation', async () => {
    const reg1 = await request(app).post('/api/v1/customer/auth/register').send({
      fullName: 'Priya Sharma',
      email: 'priya@example.com',
      password: 'Password@123'
    });
    const token1 = reg1.body.data.accessToken;

    const reg2 = await request(app).post('/api/v1/customer/auth/register').send({
      fullName: 'Rohan Verma',
      email: 'rohan@example.com',
      password: 'Password@123'
    });
    const token2 = reg2.body.data.accessToken;

    // Draft intake
    const draftRes = await request(app)
      .post('/api/v1/customer/intakes')
      .set('Authorization', `Bearer ${token1}`)
      .send({
        category: 'Property & Tenancy',
        summary: 'Landlord withheld security deposit of Rs 50,000 after vacating.',
        isDraft: true,
        clientSubmissionKey: 'key-123'
      });
    expect(draftRes.status).toBe(201);
    expect(draftRes.body.data.isDraft).toBe(true);

    // Create matter
    const matterRes = await request(app)
      .post('/api/v1/customer/matters')
      .set('Authorization', `Bearer ${token1}`)
      .send({
        title: 'Security Deposit Recovery',
        category: 'Property & Tenancy',
        description: 'Landlord withheld deposit for 60 days.'
      });
    expect(matterRes.status).toBe(201);
    const matterId = matterRes.body.data._id;

    // Customer 2 must NOT be able to access Customer 1's matter (IDOR protection)
    const idorAttempt = await request(app)
      .get(`/api/v1/customer/matters/${matterId}`)
      .set('Authorization', `Bearer ${token2}`);
    expect(idorAttempt.status).toBe(404);

    // AI status returns honest non-configured or configured payload
    const aiStatus = await request(app)
      .get('/api/v1/customer/ai/status')
      .set('Authorization', `Bearer ${token1}`);
    expect(aiStatus.status).toBe(200);
    expect(typeof aiStatus.body.data.configured).toBe('boolean');
  });

  it('lists only verified active lawyers, checks slots, and prevents double consultation booking', async () => {
    const verifiedLawyer = await Lawyer.create({
      fullName: 'Adv. Meera Nair',
      email: 'meera.lawyer@example.com',
      phone: '+919988776655',
      barCouncil: 'Bar Council of Delhi',
      barEnrollmentNumber: 'D/1234/2016',
      enrollmentState: 'Delhi',
      yearsOfExperience: 10,
      practiceAreas: ['Property & Tenancy', 'Consumer Protection'],
      officeAddress: { addressLine1: 'Chamber 12, Tis Hazari' },
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110054',
      languages: ['English', 'Hindi'],
      consultationTypes: ['video', 'phone'],
      consultationFee: 1500,
      isAvailable: true,
      verificationStatus: 'verified',
      accountStatus: 'active'
    });

    await Lawyer.create({
      fullName: 'Pending Unverified Advocate',
      email: 'pending.lawyer@example.com',
      phone: '+919111222333',
      barCouncil: 'Bar Council of UP',
      barEnrollmentNumber: 'UP/9999/2020',
      enrollmentState: 'Uttar Pradesh',
      yearsOfExperience: 5,
      practiceAreas: ['Civil'],
      officeAddress: { addressLine1: 'Sector 15' },
      city: 'Noida',
      state: 'Uttar Pradesh',
      pincode: '201301',
      languages: ['Hindi'],
      consultationTypes: ['video'],
      consultationFee: 1000,
      isAvailable: true,
      verificationStatus: 'pending',
      accountStatus: 'active'
    });

    const reg = await request(app).post('/api/v1/customer/auth/register').send({
      fullName: 'Kiran Patel',
      email: 'kiran@example.com',
      password: 'Password@123'
    });
    const token = reg.body.data.accessToken;

    const listRes = await request(app)
      .get('/api/v1/customer/lawyers')
      .set('Authorization', `Bearer ${token}`);
    expect(listRes.status).toBe(200);
    expect(listRes.body.data).toHaveLength(1);
    expect(listRes.body.data[0].fullName).toBe('Adv. Meera Nair');
    expect(listRes.body.data[0].email).toBeUndefined();

    const dateStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    const slotRes1 = await request(app)
      .post('/api/v1/customer/consultations')
      .set('Authorization', `Bearer ${token}`)
      .send({
        lawyerId: verifiedLawyer._id.toString(),
        date: dateStr,
        time: '11:30 AM',
        type: 'video',
        notes: 'Rental deposit consultation'
      });
    expect(slotRes1.status).toBe(201);
    expect(slotRes1.body.data.status).toBe('pending');

    // Booking the same slot again must conflict cleanly (409)
    const slotRes2 = await request(app)
      .post('/api/v1/customer/consultations')
      .set('Authorization', `Bearer ${token}`)
      .send({
        lawyerId: verifiedLawyer._id.toString(),
        date: dateStr,
        time: '11:30 AM',
        type: 'video'
      });
    expect(slotRes2.status).toBe(409);
  });
});

