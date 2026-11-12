import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export type CustomerAccountStatus = 'active' | 'suspended' | 'deleted';

export interface IPushToken {
  token: string;
  platform: 'android' | 'ios' | 'web' | 'unknown';
  deviceName?: string;
  updatedAt: Date;
}

export interface IRefreshTokenRecord {
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
  deviceInfo?: string;
}

export interface INotificationPreferences {
  pushEnabled: boolean;
  emailEnabled: boolean;
  matterUpdates: boolean;
  messages: boolean;
  consultations: boolean;
}

export interface ICustomer extends Document {
  fullName: string;
  email: string;
  phone: string;
  passwordHash: string;
  preferredLanguage: string;
  city?: string;
  state?: string;
  profileImage?: string;
  isEmailVerified: boolean;
  emailVerificationTokenHash?: string;
  passwordResetTokenHash?: string;
  passwordResetExpires?: Date;
  accountStatus: CustomerAccountStatus;
  deletionRequestedAt?: Date;
  notificationPreferences: INotificationPreferences;
  pushTokens: IPushToken[];
  refreshTokens: IRefreshTokenRecord[];
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const customerSchema = new Schema<ICustomer>(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: 120
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      select: false
    },
    preferredLanguage: {
      type: String,
      default: 'en',
      trim: true
    },
    city: {
      type: String,
      trim: true,
      default: ''
    },
    state: {
      type: String,
      trim: true,
      default: ''
    },
    profileImage: {
      type: String,
      default: ''
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    emailVerificationTokenHash: {
      type: String,
      select: false
    },
    passwordResetTokenHash: {
      type: String,
      select: false
    },
    passwordResetExpires: {
      type: Date,
      select: false
    },
    accountStatus: {
      type: String,
      enum: ['active', 'suspended', 'deleted'],
      default: 'active',
      index: true
    },
    deletionRequestedAt: {
      type: Date
    },
    notificationPreferences: {
      pushEnabled: { type: Boolean, default: true },
      emailEnabled: { type: Boolean, default: true },
      matterUpdates: { type: Boolean, default: true },
      messages: { type: Boolean, default: true },
      consultations: { type: Boolean, default: true }
    },
    pushTokens: [
      {
        token: { type: String, required: true },
        platform: { type: String, enum: ['android', 'ios', 'web', 'unknown'], default: 'unknown' },
        deviceName: { type: String },
        updatedAt: { type: Date, default: Date.now }
      }
    ],
    refreshTokens: {
      type: [
        {
          tokenHash: { type: String, required: true },
          expiresAt: { type: Date, required: true },
          createdAt: { type: Date, default: Date.now },
          deviceInfo: { type: String }
        }
      ],
      select: false,
      default: []
    },
    lastLoginAt: {
      type: Date
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, any>) => {
        delete ret.passwordHash;
        delete ret.refreshTokens;
        delete ret.emailVerificationTokenHash;
        delete ret.passwordResetTokenHash;
        delete ret.passwordResetExpires;
        delete ret.__v;
        return ret;
      }
    }
  }
);

customerSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

export const Customer = mongoose.model<ICustomer>('Customer', customerSchema);
