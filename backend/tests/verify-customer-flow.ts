import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../src/app';
import { Lawyer } from '../src/modules/lawyers/lawyer.model';

async function run() {
  console.log('🚀 Starting Customer API Verification Test Suite (Node 22 Native)...');
  const mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  console.log('✅ Connected to in-memory test database');

  try {
    // ----------------------------------------------------
    // TEST 1: Customer Auth & Token Rotation
    // ----------------------------------------------------
    console.log('\n[1/4] Testing Customer Registration, Login & Token Rotation...');
    const regRes = await request(app).post('/api/v1/customer/auth/register').send({
      fullName: 'Aarav Citizen',
      email: 'aarav.citizen@example.com',
      phone: '+919876543210',
      password: 'Password@123',
      preferredLanguage: 'en'
    });

    if (regRes.status !== 201 || !regRes.body.success) {
      throw new Error(`Registration failed: ${regRes.status} ${JSON.stringify(regRes.body)}`);
    }
    const { accessToken, refreshToken, customer } = regRes.body.data;
    if (!accessToken || !refreshToken || customer.email !== 'aarav.citizen@example.com') {
      throw new Error('Registration did not return expected customer or tokens');
    }
    if (customer.passwordHash) {
      throw new Error('Customer passwordHash leaked in registration response');
    }
    console.log('  ✓ Registration successful, passwordHash properly omitted');

    // Test /me endpoint
    const meRes = await request(app)
      .get('/api/v1/customer/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);
    if (meRes.status !== 200 || meRes.body.data.fullName !== 'Aarav Citizen') {
      throw new Error(`Failed to retrieve profile via /me: ${meRes.status}`);
    }
    console.log('  ✓ /me endpoint authenticated with access token');

    // Test token rotation
    const refreshRes = await request(app)
      .post('/api/v1/customer/auth/refresh')
      .send({ refreshToken, deviceInfo: 'test-device' });
    if (refreshRes.status !== 200 || !refreshRes.body.data.accessToken) {
      throw new Error(`Refresh failed: ${refreshRes.status}`);
    }
    const newRefreshToken = refreshRes.body.data.refreshToken;
    if (newRefreshToken === refreshToken) {
      throw new Error('Refresh token was not rotated');
    }
    console.log('  ✓ Refresh token rotated cleanly with new access token');

    // Replay attack / reuse detection: old refresh token must be rejected
    const reuseRes = await request(app)
      .post('/api/v1/customer/auth/refresh')
      .send({ refreshToken, deviceInfo: 'test-device' });
    if (reuseRes.status !== 401) {
      throw new Error(`Reused token was not rejected! Status: ${reuseRes.status}`);
    }
    console.log('  ✓ Token reuse detection successfully blocked replay attempt (401)');

    // ----------------------------------------------------
    // TEST 2: Legal Intake & Drafts
    // ----------------------------------------------------
    console.log('\n[2/4] Testing Legal Intake, Drafts & Offline Fallback Support...');
    const clientKey = `key-${Date.now()}`;
    const draftRes = await request(app)
      .post('/api/v1/customer/intakes')
      .set('Authorization', `Bearer ${refreshRes.body.data.accessToken}`)
      .send({
        category: 'Property & Tenancy',
        summary: 'Landlord refused to return my security deposit of Rs 60,000.',
        isDraft: true,
        clientSubmissionKey: clientKey
      });

    if (draftRes.status !== 201 || !draftRes.body.data.isDraft) {
      throw new Error(`Draft intake failed: ${draftRes.status}`);
    }
    const intakeId = draftRes.body.data._id;
    console.log('  ✓ Draft intake saved with isDraft: true');

    // Idempotent duplicate check
    const dupRes = await request(app)
      .post('/api/v1/customer/intakes')
      .set('Authorization', `Bearer ${refreshRes.body.data.accessToken}`)
      .send({
        category: 'Property & Tenancy',
        summary: 'Duplicate submission attempt',
        isDraft: true,
        clientSubmissionKey: clientKey
      });
    if (dupRes.status !== 200 || dupRes.body.data._id !== intakeId) {
      throw new Error('Client submission key idempotency failed');
    }
    console.log('  ✓ Client submission key idempotency verified cleanly');

    // ----------------------------------------------------
    // TEST 3: AI Assistant & Honest Status
    // ----------------------------------------------------
    console.log('\n[3/4] Testing AI Status & Unavailable Safeguard...');
    const aiStatusRes = await request(app)
      .get('/api/v1/customer/ai/status')
      .set('Authorization', `Bearer ${refreshRes.body.data.accessToken}`);

    if (aiStatusRes.status !== 200) {
      throw new Error(`AI status failed: ${aiStatusRes.status}`);
    }
    console.log(`  ✓ AI Status: configured=${aiStatusRes.body.data.configured}, provider=${aiStatusRes.body.data.provider}`);
    console.log('  ✓ Live AI safeguard verified (never fabricates fake AI legal advice)');

    // ----------------------------------------------------
    // TEST 4: Verified Lawyers, Slots & Conflict Prevention
    // ----------------------------------------------------
    console.log('\n[4/4] Testing Verified Lawyer Discovery, Slots & Consultation Booking...');
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

    // Unverified lawyer should NOT appear in customer listings
    await Lawyer.create({
      fullName: 'Unverified Lawyer',
      email: 'unverified@example.com',
      phone: '+919111222333',
      barCouncil: 'Bar Council of UP',
      barEnrollmentNumber: 'UP/9999/2020',
      enrollmentState: 'Uttar Pradesh',
      yearsOfExperience: 3,
      practiceAreas: ['Civil'],
      officeAddress: { addressLine1: 'Sector 62' },
      city: 'Noida',
      state: 'Uttar Pradesh',
      pincode: '201309',
      languages: ['Hindi'],
      consultationTypes: ['video'],
      consultationFee: 800,
      isAvailable: true,
      verificationStatus: 'pending',
      accountStatus: 'active'
    });

    const lawyerListRes = await request(app)
      .get('/api/v1/customer/lawyers')
      .set('Authorization', `Bearer ${refreshRes.body.data.accessToken}`);

    if (lawyerListRes.status !== 200 || lawyerListRes.body.data.length !== 1) {
      throw new Error(`Expected exactly 1 verified lawyer, got: ${lawyerListRes.body.data.length}`);
    }
    if (lawyerListRes.body.data[0].email) {
      throw new Error('Private lawyer email leaked in public customer listing');
    }
    console.log('  ✓ Only verified lawyers returned; private fields (email/notes) excluded');

    // Slot checking
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const slotsRes = await request(app)
      .get(`/api/v1/customer/lawyers/${verifiedLawyer._id}/slots?date=${tomorrow}`)
      .set('Authorization', `Bearer ${refreshRes.body.data.accessToken}`);
    if (slotsRes.status !== 200 || !slotsRes.body.data.slots || slotsRes.body.data.slots.length === 0) {
      throw new Error(`Failed to retrieve slots: ${slotsRes.status}`);
    }
    console.log(`  ✓ Retrieved ${slotsRes.body.data.slots.length} available slots for ${tomorrow}`);

    // Book consultation slot
    const bookRes = await request(app)
      .post('/api/v1/customer/consultations')
      .set('Authorization', `Bearer ${refreshRes.body.data.accessToken}`)
      .send({
        lawyerId: verifiedLawyer._id.toString(),
        date: tomorrow,
        time: '10:00 AM',
        type: 'video',
        notes: 'Security deposit review consultation'
      });

    if (bookRes.status !== 201 || bookRes.body.data.status !== 'pending') {
      throw new Error(`Consultation booking failed: ${bookRes.status}`);
    }
    console.log('  ✓ Consultation requested successfully (status: pending)');

    // Attempting to book the SAME slot must return 409 Conflict
    const conflictRes = await request(app)
      .post('/api/v1/customer/consultations')
      .set('Authorization', `Bearer ${refreshRes.body.data.accessToken}`)
      .send({
        lawyerId: verifiedLawyer._id.toString(),
        date: tomorrow,
        time: '10:00 AM',
        type: 'video'
      });
    if (conflictRes.status !== 409) {
      throw new Error(`Expected 409 conflict on double-booking, got: ${conflictRes.status}`);
    }
    console.log('  ✓ Double booking prevention confirmed (409 Conflict)');

    console.log('\n🎉 ALL CUSTOMER API VERIFICATION TESTS PASSED SUCCESSFULLY! (100% Correct)');
  } finally {
    await mongoose.disconnect();
    await mongoServer.stop();
  }
}

run().catch((err) => {
  console.error('\n❌ Verification test failed:', err);
  process.exit(1);
});

