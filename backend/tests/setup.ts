import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { AuthService } from '../src/modules/auth/auth.service';
import { IAdmin, Admin } from '../src/modules/auth/auth.model';

let mongoServer: MongoMemoryServer | null = null;

export const setupTestDb = () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, {
      driverInfo: { name: 'node', version: '1.0' }
    });
  }, 60000);

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (mongoServer) {
      await mongoServer.stop();
      mongoServer = null;
    }
  }, 30000);

  afterEach(async () => {
    if (mongoose.connection.readyState !== 0 && mongoose.connection.db) {
      const collections = await mongoose.connection.db.collections();
      for (const collection of collections) {
        await collection.deleteMany({});
      }
    }
  });
};

export const createTestAdmin = async (
  role: 'super_admin' | 'admin' = 'admin',
  isActive = true
): Promise<{ admin: IAdmin; token: string }> => {
  const email = `test.${role}.${Date.now()}@legaldost.com`;
  const password = 'Password@123';
  const passwordHash = await AuthService.hashPassword(password);

  const admin = await Admin.create({
    name: `Test ${role}`,
    email,
    passwordHash,
    role,
    isActive
  });

  const token = AuthService.generateToken(admin as IAdmin);
  return { admin: admin as IAdmin, token };
};
