import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Customer, ICustomer } from './customer.model';
import { ApiError } from '../../utils/ApiError';
import { env } from '../../config/env';

export interface CustomerAuthTokens {
  accessToken: string;
  refreshToken: string;
}

const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

const signAccessToken = (customer: ICustomer): string => {
  return jwt.sign(
    {
      id: customer._id.toString(),
      email: customer.email,
      role: 'customer' as const
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
  );
};

const signRefreshToken = (customer: ICustomer): string => {
  return jwt.sign(
    {
      id: customer._id.toString(),
      role: 'customer' as const,
      jti: crypto.randomUUID()
    },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
  );
};

export class CustomerAuthService {
  static async issueTokens(customer: ICustomer, deviceInfo?: string): Promise<CustomerAuthTokens> {
    const accessToken = signAccessToken(customer);
    const refreshToken = signRefreshToken(customer);
    const refreshTokenHash = hashToken(refreshToken);

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Keep at most 10 active device sessions per customer, pruning expired ones
    const now = new Date();
    const validExisting = (customer.refreshTokens || [])
      .filter((t) => t.expiresAt > now)
      .slice(-9);

    validExisting.push({
      tokenHash: refreshTokenHash,
      expiresAt,
      createdAt: now,
      deviceInfo: deviceInfo || 'mobile-app'
    });

    customer.refreshTokens = validExisting;
    customer.lastLoginAt = now;
    await customer.save();

    return { accessToken, refreshToken };
  }

  static async register(payload: {
    fullName: string;
    email: string;
    phone?: string;
    password: string;
    preferredLanguage?: string;
    deviceInfo?: string;
  }): Promise<{ customer: ICustomer; tokens: CustomerAuthTokens }> {
    const emailLower = payload.email.toLowerCase().trim();
    const existing = await Customer.findOne({ email: emailLower });
    if (existing) {
      throw ApiError.conflict('An account with this email address already exists.');
    }

    const passwordHash = await bcrypt.hash(payload.password, 12);
    const verificationToken = crypto.randomBytes(24).toString('hex');

    const customer = await Customer.create({
      fullName: payload.fullName.trim(),
      email: emailLower,
      phone: payload.phone?.trim() || '',
      passwordHash,
      preferredLanguage: payload.preferredLanguage || 'en',
      emailVerificationTokenHash: hashToken(verificationToken),
      accountStatus: 'active'
    });

    const tokens = await this.issueTokens(customer, payload.deviceInfo);
    const cleanCustomer = await Customer.findById(customer._id);
    return { customer: cleanCustomer!, tokens };
  }

  static async login(
    email: string,
    password: string,
    deviceInfo?: string
  ): Promise<{ customer: ICustomer; tokens: CustomerAuthTokens }> {
    const emailLower = email.toLowerCase().trim();
    const customer = await Customer.findOne({ email: emailLower }).select('+passwordHash +refreshTokens');

    if (!customer || customer.accountStatus === 'deleted') {
      throw ApiError.unauthorized('Invalid email or password.');
    }

    if (customer.accountStatus === 'suspended') {
      throw ApiError.forbidden('Your account is currently suspended. Please contact support.');
    }

    const isMatch = await customer.comparePassword(password);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password.');
    }

    const tokens = await this.issueTokens(customer, deviceInfo);
    const cleanCustomer = await Customer.findById(customer._id);
    return { customer: cleanCustomer!, tokens };
  }

  static async refresh(
    refreshToken: string,
    deviceInfo?: string
  ): Promise<{ customer: ICustomer; tokens: CustomerAuthTokens }> {
    let payload: any;
    try {
      payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
    } catch {
      throw ApiError.unauthorized('Refresh token is invalid or expired. Please log in again.');
    }

    if (payload.role !== 'customer' || !payload.id) {
      throw ApiError.unauthorized('Invalid refresh token.');
    }

    const customer = await Customer.findById(payload.id).select('+refreshTokens');
    if (!customer || customer.accountStatus !== 'active') {
      throw ApiError.unauthorized('Customer account unavailable.');
    }

    const incomingHash = hashToken(refreshToken);
    const tokenIdx = (customer.refreshTokens || []).findIndex(
      (t) => t.tokenHash === incomingHash && t.expiresAt > new Date()
    );

    if (tokenIdx === -1) {
      // Possible token reuse after rotation: revoke all sessions as defensive security measure
      customer.refreshTokens = [];
      await customer.save();
      throw ApiError.unauthorized('Session is no longer valid. Please log in again.');
    }

    // Remove the consumed refresh token (rotation)
    customer.refreshTokens.splice(tokenIdx, 1);

    const tokens = await this.issueTokens(customer, deviceInfo);
    const cleanCustomer = await Customer.findById(customer._id);
    return { customer: cleanCustomer!, tokens };
  }

  static async logout(customerId: string, refreshToken?: string, pushToken?: string): Promise<void> {
    const customer = await Customer.findById(customerId).select('+refreshTokens');
    if (!customer) return;

    if (refreshToken) {
      const incomingHash = hashToken(refreshToken);
      customer.refreshTokens = (customer.refreshTokens || []).filter((t) => t.tokenHash !== incomingHash);
    }

    if (pushToken) {
      customer.pushTokens = (customer.pushTokens || []).filter((p) => p.token !== pushToken);
    }

    await customer.save();
  }

  static async updateProfile(
    customerId: string,
    payload: {
      fullName?: string;
      phone?: string;
      preferredLanguage?: string;
      city?: string;
      state?: string;
      notificationPreferences?: {
        pushEnabled?: boolean;
        emailEnabled?: boolean;
        matterUpdates?: boolean;
        messages?: boolean;
        consultations?: boolean;
      };
    }
  ): Promise<ICustomer> {
    const customer = await Customer.findById(customerId);
    if (!customer) throw ApiError.notFound('Customer not found');

    if (payload.fullName !== undefined) customer.fullName = payload.fullName.trim();
    if (payload.phone !== undefined) customer.phone = payload.phone.trim();
    if (payload.preferredLanguage !== undefined) customer.preferredLanguage = payload.preferredLanguage.trim();
    if (payload.city !== undefined) customer.city = payload.city.trim();
    if (payload.state !== undefined) customer.state = payload.state.trim();
    if (payload.notificationPreferences) {
      customer.notificationPreferences = {
        ...customer.notificationPreferences,
        ...payload.notificationPreferences
      };
    }

    await customer.save();
    return customer;
  }

  static async changePassword(customerId: string, currentPassword: string, newPassword: string): Promise<void> {
    const customer = await Customer.findById(customerId).select('+passwordHash +refreshTokens');
    if (!customer) throw ApiError.notFound('Customer not found');

    const matches = await customer.comparePassword(currentPassword);
    if (!matches) {
      throw ApiError.badRequest('Current password is incorrect.');
    }

    customer.passwordHash = await bcrypt.hash(newPassword, 12);
    // Revoke existing sessions so other devices must re-authenticate
    customer.refreshTokens = [];
    await customer.save();
  }

  static async requestPasswordReset(email: string): Promise<{ message: string; devResetToken?: string }> {
    const emailLower = email.toLowerCase().trim();
    const customer = await Customer.findOne({ email: emailLower }).select('+passwordResetTokenHash +passwordResetExpires');

    // Never reveal whether email exists
    const genericMsg = 'If an account matches that email, password reset instructions have been issued.';
    if (!customer || customer.accountStatus === 'deleted') {
      return { message: genericMsg };
    }

    const rawToken = crypto.randomBytes(20).toString('hex');
    customer.passwordResetTokenHash = hashToken(rawToken);
    customer.passwordResetExpires = new Date(Date.now() + 30 * 60 * 1000);
    await customer.save();

    return env.NODE_ENV === 'development' ? { message: genericMsg, devResetToken: rawToken } : { message: genericMsg };
  }

  static async resetPassword(email: string, resetToken: string, newPassword: string): Promise<void> {
    const emailLower = email.toLowerCase().trim();
    const customer = await Customer.findOne({ email: emailLower }).select(
      '+passwordResetTokenHash +passwordResetExpires +passwordHash +refreshTokens'
    );

    if (
      !customer ||
      !customer.passwordResetTokenHash ||
      !customer.passwordResetExpires ||
      customer.passwordResetExpires < new Date() ||
      customer.passwordResetTokenHash !== hashToken(resetToken)
    ) {
      throw ApiError.badRequest('Invalid or expired password reset token.');
    }

    customer.passwordHash = await bcrypt.hash(newPassword, 12);
    customer.passwordResetTokenHash = undefined;
    customer.passwordResetExpires = undefined;
    customer.refreshTokens = [];
    await customer.save();
  }

  static async requestDeletion(customerId: string): Promise<{ requestedAt: Date; retentionNotice: string }> {
    const customer = await Customer.findById(customerId);
    if (!customer) throw ApiError.notFound('Customer not found');

    const requestedAt = new Date();
    customer.deletionRequestedAt = requestedAt;
    await customer.save();

    return {
      requestedAt,
      retentionNotice:
        'Your account deletion request has been logged. Personal profile details will be anonymized after review, while legal matters, consultation audit trails, and statutory records shared with advocates are retained as required by applicable Indian law.'
    };
  }
}
