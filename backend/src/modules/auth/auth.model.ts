import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export type AdminRole = 'super_admin' | 'admin';

export interface IAdmin extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: AdminRole;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const adminSchema = new Schema<IAdmin>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 100
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      select: false // Exclude from normal queries by default
    },
    role: {
      type: String,
      enum: ['super_admin', 'admin'],
      default: 'admin'
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
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
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Method to verify candidate password
adminSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

export const Admin = mongoose.model<IAdmin>('Admin', adminSchema);

