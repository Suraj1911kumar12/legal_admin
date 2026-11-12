import request from 'supertest';
import app from '../src/app';
import { setupTestDb, createTestAdmin } from './setup';
import { Lawyer } from '../src/modules/lawyers/lawyer.model';
import { describe } from 'node:test';

setupTestDb();

const sampleLawyer = {
  fullName: 'Advocate Sneha Sharma',
  email: 'sneha.sharma@example.com',
  phone: '+919876543210',
  languages: ['English', 'Hindi'],
  barEnrollmentNumber: 'D/4567/2018',
  barCouncil: 'Bar Council of Delhi',
  enrollmentState: 'Delhi',
  yearsOfExperience: 6,
  practiceAreas: ['Civil Litigation', 'Family Law'],
  officeAddress: {
    addressLine1: 'Chamber 101, Patiala House Courts',
    addressLine2: 'India Gate',
    landmark: 'Gate 4'
  },
  city: 'New Delhi',
  state: 'Delhi',
  pincode: '110001'
};

describe('Lawyer Management Module Tests', () => {
  let adminToken: string;

  beforeEach(async () => {
    const { token } = await createTestAdmin('admin');
    adminToken = token;
  });

  describe('POST /api/v1/admin/lawyers (Create)', () => {
    it('should create a new lawyer defaulting to pending verification status', async () => {
      const res = await request(app)
        .post('/api/v1/admin/lawyers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(sampleLawyer);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.fullName).toBe('Advocate Sneha Sharma');
      expect(res.body.data.email).toBe('sneha.sharma@example.com');
      expect(res.body.data.verificationStatus).toBe('pending');
      expect(res.body.data.accountStatus).toBe('active');
      expect(res.body.data.deletedAt).toBeNull();
    });

    it('should fail validation if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/v1/admin/lawyers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          fullName: 'Test Lawyer'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
    });

    it('should prevent duplicate email registration', async () => {
      await request(app)
        .post('/api/v1/admin/lawyers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(sampleLawyer);

      const duplicateRes = await request(app)
        .post('/api/v1/admin/lawyers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ...sampleLawyer,
          barEnrollmentNumber: 'D/9999/2020'
        });

      expect(duplicateRes.status).toBe(409);
      expect(duplicateRes.body.success).toBe(false);
      expect(duplicateRes.body.message).toContain('already exists');
    });

    it('should prevent duplicate bar enrollment number in same state', async () => {
      await request(app)
        .post('/api/v1/admin/lawyers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(sampleLawyer);

      const duplicateRes = await request(app)
        .post('/api/v1/admin/lawyers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ...sampleLawyer,
          email: 'different.email@example.com'
        });

      expect(duplicateRes.status).toBe(409);
      expect(duplicateRes.body.success).toBe(false);
      expect(duplicateRes.body.message).toContain('already exists in state');
    });
  });

  describe('GET /api/v1/admin/lawyers (List & Filters)', () => {
    beforeEach(async () => {
      // Create 3 lawyers with varied fields
      await request(app)
        .post('/api/v1/admin/lawyers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(sampleLawyer);

      await request(app)
        .post('/api/v1/admin/lawyers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ...sampleLawyer,
          fullName: 'Advocate Amit Verma',
          email: 'amit.verma@example.com',
          barEnrollmentNumber: 'MH/1111/2012',
          enrollmentState: 'Maharashtra',
          city: 'Mumbai',
          state: 'Maharashtra',
          practiceAreas: ['Corporate Law']
        });
    });

    it('should return paginated list of lawyers', async () => {
      const res = await request(app)
        .get('/api/v1/admin/lawyers?page=1&limit=10')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(2);
      expect(res.body.pagination.total).toBe(2);
      expect(res.body.pagination.page).toBe(1);
    });

    it('should filter lawyers by search keyword', async () => {
      const res = await request(app)
        .get('/api/v1/admin/lawyers?search=Amit')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].fullName).toBe('Advocate Amit Verma');
    });

    it('should filter lawyers by practice area', async () => {
      const res = await request(app)
        .get('/api/v1/admin/lawyers?practiceArea=Corporate Law')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].fullName).toBe('Advocate Amit Verma');
    });
  });

  describe('GET /api/v1/admin/lawyers/:id (Details)', () => {
    it('should return complete lawyer details for valid id', async () => {
      const created = await request(app)
        .post('/api/v1/admin/lawyers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(sampleLawyer);

      const lawyerId = created.body.data._id;

      const res = await request(app)
        .get(`/api/v1/admin/lawyers/${lawyerId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(lawyerId);
      expect(res.body.data.officeAddress.addressLine1).toBe('Chamber 101, Patiala House Courts');
    });

    it('should return 400 for invalid ObjectId format', async () => {
      const res = await request(app)
        .get('/api/v1/admin/lawyers/invalid-id-123')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 404 for non-existent ObjectId', async () => {
      const res = await request(app)
        .get('/api/v1/admin/lawyers/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PATCH /api/v1/admin/lawyers/:id (Update)', () => {
    it('should safely update editable profile fields', async () => {
      const created = await request(app)
        .post('/api/v1/admin/lawyers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(sampleLawyer);

      const lawyerId = created.body.data._id;

      const res = await request(app)
        .patch(`/api/v1/admin/lawyers/${lawyerId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          yearsOfExperience: 8,
          professionalBio: 'Updated professional bio description.'
        });

      expect(res.status).toBe(200);
      expect(res.body.data.yearsOfExperience).toBe(8);
      expect(res.body.data.professionalBio).toBe('Updated professional bio description.');
    });
  });

  describe('PATCH /api/v1/admin/lawyers/:id/verification (Verification Workflow)', () => {
    it('should reject direct jump from pending to verified', async () => {
      const created = await request(app)
        .post('/api/v1/admin/lawyers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(sampleLawyer);

      const lawyerId = created.body.data._id;

      const res = await request(app)
        .patch(`/api/v1/admin/lawyers/${lawyerId}/verification`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'verified'
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('must be marked \'under_review\' before it can be verified');
    });

    it('should transition from pending -> under_review -> verified successfully', async () => {
      const created = await request(app)
        .post('/api/v1/admin/lawyers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(sampleLawyer);

      const lawyerId = created.body.data._id;

      // 1. Move to under_review
      const reviewRes = await request(app)
        .patch(`/api/v1/admin/lawyers/${lawyerId}/verification`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'under_review',
          verificationNotes: 'Initiated background verification with Bar Council.'
        });

      expect(reviewRes.status).toBe(200);
      expect(reviewRes.body.data.verificationStatus).toBe('under_review');

      // 2. Move to verified
      const verifyRes = await request(app)
        .patch(`/api/v1/admin/lawyers/${lawyerId}/verification`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'verified',
          verificationNotes: 'Verified against Bar Council registry.'
        });

      expect(verifyRes.status).toBe(200);
      expect(verifyRes.body.data.verificationStatus).toBe('verified');
      expect(verifyRes.body.data.verifiedAt).toBeDefined();
    });

    it('should require a rejectionReason when rejecting a verification', async () => {
      const created = await request(app)
        .post('/api/v1/admin/lawyers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(sampleLawyer);

      const lawyerId = created.body.data._id;

      // Move to under_review first
      await request(app)
        .patch(`/api/v1/admin/lawyers/${lawyerId}/verification`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'under_review' });

      // Reject without reason should fail validation
      const rejectRes = await request(app)
        .patch(`/api/v1/admin/lawyers/${lawyerId}/verification`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'rejected'
        });

      expect(rejectRes.status).toBe(400);
      expect(rejectRes.body.message).toContain('Validation failed');
    });

    it('should reject with mandatory reason and allow reopening to under_review', async () => {
      const created = await request(app)
        .post('/api/v1/admin/lawyers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(sampleLawyer);

      const lawyerId = created.body.data._id;

      await request(app)
        .patch(`/api/v1/admin/lawyers/${lawyerId}/verification`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'under_review' });

      const rejectRes = await request(app)
        .patch(`/api/v1/admin/lawyers/${lawyerId}/verification`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'rejected',
          rejectionReason: 'Enrollment certificate photocopy not clear'
        });

      expect(rejectRes.status).toBe(200);
      expect(rejectRes.body.data.verificationStatus).toBe('rejected');
      expect(rejectRes.body.data.rejectionReason).toBe('Enrollment certificate photocopy not clear');

      // Reopen rejected record
      const reopenRes = await request(app)
        .patch(`/api/v1/admin/lawyers/${lawyerId}/verification`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'under_review',
          verificationNotes: 'Reopened for review after clearer document submitted'
        });

      expect(reopenRes.status).toBe(200);
      expect(reopenRes.body.data.verificationStatus).toBe('under_review');
    });
  });

  describe('PATCH /api/v1/admin/lawyers/:id/status (Account Status)', () => {
    it('should require a reason when suspending an account', async () => {
      const created = await request(app)
        .post('/api/v1/admin/lawyers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(sampleLawyer);

      const lawyerId = created.body.data._id;

      const res = await request(app)
        .patch(`/api/v1/admin/lawyers/${lawyerId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'suspended'
        });

      expect(res.status).toBe(400);
    });

    it('should suspend and reactivate account with valid reason', async () => {
      const created = await request(app)
        .post('/api/v1/admin/lawyers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(sampleLawyer);

      const lawyerId = created.body.data._id;

      // Suspend
      const suspendRes = await request(app)
        .patch(`/api/v1/admin/lawyers/${lawyerId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'suspended',
          reason: 'Pending compliance review'
        });

      expect(suspendRes.status).toBe(200);
      expect(suspendRes.body.data.accountStatus).toBe('suspended');
      expect(suspendRes.body.data.statusReason).toBe('Pending compliance review');

      // Reactivate
      const activeRes = await request(app)
        .patch(`/api/v1/admin/lawyers/${lawyerId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'active'
        });

      expect(activeRes.status).toBe(200);
      expect(activeRes.body.data.accountStatus).toBe('active');
    });
  });

  describe('DELETE /api/v1/admin/lawyers/:id (Soft Delete)', () => {
    it('should soft delete lawyer and exclude from active listings', async () => {
      const created = await request(app)
        .post('/api/v1/admin/lawyers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(sampleLawyer);

      const lawyerId = created.body.data._id;

      const deleteRes = await request(app)
        .delete(`/api/v1/admin/lawyers/${lawyerId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.data.deletedAt).toBeDefined();

      // Ensure not found in normal list
      const listRes = await request(app)
        .get('/api/v1/admin/lawyers')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(listRes.body.data.length).toBe(0);

      // Direct get should return 404
      const getRes = await request(app)
        .get(`/api/v1/admin/lawyers/${lawyerId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(getRes.status).toBe(404);
    });
  });
});

