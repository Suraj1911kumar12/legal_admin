import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Admin, IAdmin } from './auth.model';
import { ApiError } from '../../utils/ApiError';
import { env } from '../../config/env';
import { LoginInput, CreateAdminInput } from './auth.validation';

export interface TokenPayload {
  id: string;
  email: string;
  role: string;
}

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
  }

  static generateToken(admin: IAdmin): string {
    const payload: TokenPayload = {
      id: admin._id.toString(),
      email: admin.email,
      role: admin.role
    };

    const options: SignOptions = {
      expiresIn: env.JWT_EXPIRES_IN as any
    };

    return jwt.sign(payload, env.JWT_SECRET, options);
  }

  static verifyToken(token: string): TokenPayload {
    return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
  }

  static async login(input: LoginInput): Promise<{ token: string; admin: IAdmin }> {
    const { email, password } = input;

    const admin = await Admin.findOne({ email }).select('+passwordHash');
    if (!admin) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    if (!admin.isActive) {
      throw ApiError.forbidden('Your account is deactivated. Please contact an administrator.');
    }

    // Update last login timestamp
    admin.lastLoginAt = new Date();
    await admin.save();

    const token = this.generateToken(admin);

    // Remove passwordHash before returning
    const safeAdmin = admin.toJSON() as IAdmin;

    return { token, admin: safeAdmin };
  }

  static async getAdminById(id: string): Promise<IAdmin> {
    const admin = await Admin.findById(id);
    if (!admin) {
      throw ApiError.notFound('Admin profile not found');
    }
    if (!admin.isActive) {
      throw ApiError.forbidden('Account is deactivated');
    }
    return admin;
  }

  static async createAdmin(input: CreateAdminInput): Promise<IAdmin> {
    const existing = await Admin.findOne({ email: input.email });
    if (existing) {
      throw ApiError.conflict('An administrator with this email already exists');
    }

    const passwordHash = await this.hashPassword(input.password);
    const admin = await Admin.create({
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role,
      isActive: true
    });

    return admin;
  }

  static async seedSuperAdmin(
    name = env.SUPER_ADMIN_NAME,
    email = env.SUPER_ADMIN_EMAIL,
    password = env.SUPER_ADMIN_PASSWORD
  ): Promise<IAdmin> {
    const existing = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      console.log(`[Seed] Super Admin already exists: ${existing.email}`);
      return existing;
    }

    const passwordHash = await this.hashPassword(password);
    const admin = await Admin.create({
      name,
      email: email.toLowerCase().trim(),
      passwordHash,
      role: 'super_admin',
      isActive: true
    });

    console.log(`[Seed] Initial Super Admin created successfully: ${admin.email}`);
    return admin;
  }
}

