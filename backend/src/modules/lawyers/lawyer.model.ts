import mongoose, { Document, Schema, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

export type VerificationStatus = 'pending' | 'under_review' | 'verified' | 'rejected';
export type AccountStatus = 'active' | 'suspended' | 'inactive';

export interface IProfessionalDocument {
  documentType: string;
  storageKey: string;
  originalFileName: string;
  uploadedAt: Date;
  reviewStatus: 'pending' | 'verified' | 'rejected';
}

export interface IOfficeAddress {
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
}

export interface ILawyer extends Document {
  // Basic Information
  fullName: string;
  email: string;
  passwordHash?: string;
  phone: string;
  profileImage?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  languages: string[];

  // Professional Information
  barEnrollmentNumber: string;
  barCouncil: string;
  enrollmentState: string;
  yearsOfExperience: number;
  practiceAreas: string[];
  professionalBio?: string;
  officeAddress: IOfficeAddress;
  city: string;
  state: string;
  pincode: string;

  // Practice & Consultation Preferences
  consultationTypes: string[];
  consultationFee: number;
  isAvailable: boolean;
  lastLoginAt?: Date;

  // Verification Information
  verificationStatus: VerificationStatus;
  verificationNotes?: string;
  verifiedAt?: Date;
  verifiedBy?: Types.ObjectId;
  rejectionReason?: string;

  // Account Status
  accountStatus: AccountStatus;
  statusReason?: string;

  // Professional Documents
  documents: IProfessionalDocument[];

  // Metadata & Audit
  deletedAt?: Date | null;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const professionalDocumentSchema = new Schema<IProfessionalDocument>(
  {
    documentType: {
      type: String,
      required: true,
      trim: true
    },
    storageKey: {
      type: String,
      required: true,
      trim: true
    },
    originalFileName: {
      type: String,
      required: true,
      trim: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    reviewStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending'
    }
  },
  { _id: true }
);

const lawyerSchema = new Schema<ILawyer>(
  {
    // Basic Information
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
    passwordHash: {
      type: String,
      select: false
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      index: true
    },
    profileImage: {
      type: String,
      trim: true
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say']
    },
    languages: {
      type: [String],
      required: [true, 'At least one language is required'],
      validate: [(val: string[]) => val.length > 0, 'At least one language must be specified']
    },

    // Professional Information
    barEnrollmentNumber: {
      type: String,
      required: [true, 'Bar enrollment number is required'],
      trim: true,
      uppercase: true,
      index: true
    },
    barCouncil: {
      type: String,
      required: [true, 'Bar council / Enrollment authority is required'],
      trim: true
    },
    enrollmentState: {
      type: String,
      required: [true, 'Enrollment state is required'],
      trim: true,
      index: true
    },
    yearsOfExperience: {
      type: Number,
      required: [true, 'Years of experience is required'],
      min: [0, 'Experience cannot be negative'],
      max: [70, 'Experience exceeds realistic maximum']
    },
    practiceAreas: {
      type: [String],
      required: [true, 'At least one practice area is required'],
      validate: [(val: string[]) => val.length > 0, 'At least one practice area must be selected'],
      index: true
    },
    professionalBio: {
      type: String,
      trim: true,
      maxlength: 2500
    },
    officeAddress: {
      addressLine1: { type: String, required: true, trim: true },
      addressLine2: { type: String, trim: true },
      landmark: { type: String, trim: true }
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      index: true
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
      index: true
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      trim: true
    },

    // Practice & Consultation Preferences
    consultationTypes: {
      type: [String],
      default: ['phone', 'video']
    },
    consultationFee: {
      type: Number,
      default: 1500,
      min: 0
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    lastLoginAt: {
      type: Date
    },

    // Verification Information
    verificationStatus: {
      type: String,
      enum: ['pending', 'under_review', 'verified', 'rejected'],
      default: 'pending',
      index: true
    },
    verificationNotes: {
      type: String,
      trim: true
    },
    verifiedAt: {
      type: Date
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin'
    },
    rejectionReason: {
      type: String,
      trim: true
    },

    // Account Status
    accountStatus: {
      type: String,
      enum: ['active', 'suspended', 'inactive'],
      default: 'active',
      index: true
    },
    statusReason: {
      type: String,
      trim: true
    },

    // Professional Documents
    documents: {
      type: [professionalDocumentSchema],
      default: []
    },

    // Metadata
    deletedAt: {
      type: Date,
      default: null,
      index: true
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin'
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin'
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
lawyerSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.passwordHash) return false;
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Compound index to guarantee uniqueness of barEnrollmentNumber per state/authority
lawyerSchema.index({ barEnrollmentNumber: 1, enrollmentState: 1 }, { unique: true });

// Text search index on name, email, phone, enrollment number
lawyerSchema.index({
  fullName: 'text',
  email: 'text',
  phone: 'text',
  barEnrollmentNumber: 'text',
  city: 'text'
});

export const Lawyer = mongoose.model<ILawyer>('Lawyer', lawyerSchema);

