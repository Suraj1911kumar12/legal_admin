import request from 'supertest';
import app from '../src/app';
import { setupTestDb, createTestAdmin } from './setup';
import { Admin } from '../src/modules/auth/auth.model';
import { AuthService } from '../src/modules/auth/auth.service';

setupTestDb();

describe('Authentication Module Tests', () => {
  it('should successfully log in an active admin and set HttpOnly cookie', async () => {
    const password = 'SecurePassword123!';
    const passwordHash = await AuthService.hashPassword(password);
    await Admin.create({
      name: 'Super Admin',
      email: 'admin@legaldost.com',
      passwordHash,
      role: 'super_admin',
      isActive: true
    });

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@legaldost.com',
        password
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.admin.email).toBe('admin@legaldost.com');
    expect(response.body.data.admin.passwordHash).toBeUndefined();
    expect(response.body.data.token).toBeDefined();

    // Check cookie
    const cookies = response.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies[0]).toContain('admin_token=');
    expect(cookies[0]).toContain('HttpOnly');
  });

  it('should reject login with invalid password', async () => {
    const passwordHash = await AuthService.hashPassword('CorrectPassword123!');
    await Admin.create({
      name: 'Admin User',
      email: 'user@legaldost.com',
      passwordHash,
      role: 'admin',
      isActive: true
    });

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'user@legaldost.com',
        password: 'WrongPassword'
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Invalid email or password');
  });

  it('should reject login for inactive / deactivated admin', async () => {
    const password = 'SecretPassword123!';
    const passwordHash = await AuthService.hashPassword(password);
    await Admin.create({
      name: 'Inactive Admin',
      email: 'inactive@legaldost.com',
      passwordHash,
      role: 'admin',
      isActive: false
    });

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'inactive@legaldost.com',
        password
      });

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('deactivated');
  });

  it('should get current authenticated admin profile with valid token', async () => {
    const { admin, token } = await createTestAdmin('admin');

    const response = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe(admin.email);
    expect(response.body.data.name).toBe(admin.name);
  });

  it('should reject /auth/me when unauthenticated', async () => {
    const response = await request(app).get('/api/v1/auth/me');
    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('should clear authentication cookie on logout', async () => {
    const response = await request(app).post('/api/v1/auth/logout');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    const cookies = response.headers['set-cookie'];
    expect(cookies).toBeDefined();
    // Cookie cleared usually sets expires in past or empty
    expect(cookies[0]).toContain('admin_token=;');
  });
});

