import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Lawyer, ILawyer } from './lawyer.model';
import { ApiError } from '../../utils/ApiError';
import { env } from '../../config/env';

export class LawyerAuthService {
  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
  }

  static generateToken(lawyer: ILawyer): string {
    return jwt.sign(
      {
        id: lawyer._id.toString(),
        email: lawyer.email,
        role: 'lawyer'
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN as any }
    );
  }

  static async register(input: any): Promise<{ lawyer: ILawyer; token: string }> {
    const existingEmail = await Lawyer.findOne({
      email: input.email.toLowerCase().trim(),
      deletedAt: null
    });
    if (existingEmail) {
      throw ApiError.conflict(`A lawyer account with email '${input.email}' already exists.`);
    }

    const existingBar = await Lawyer.findOne({
      barEnrollmentNumber: input.barEnrollmentNumber.toUpperCase().trim(),
      enrollmentState: input.enrollmentState,
      deletedAt: null
    });
    if (existingBar) {
      throw ApiError.conflict(
        `Enrollment number '${input.barEnrollmentNumber}' in '${input.enrollmentState}' is already registered.`
      );
    }

    const passwordHash = await this.hashPassword(input.password);

    const lawyer = await Lawyer.create({
      fullName: input.fullName,
      email: input.email.toLowerCase().trim(),
      passwordHash,
      phone: input.phone,
      gender: input.gender,
      languages: input.languages || ['English'],
      barEnrollmentNumber: input.barEnrollmentNumber.toUpperCase().trim(),
      barCouncil: input.barCouncil,
      enrollmentState: input.enrollmentState,
      yearsOfExperience: input.yearsOfExperience || 1,
      practiceAreas: input.practiceAreas || ['General Practice'],
      professionalBio: input.professionalBio,
      officeAddress: input.officeAddress || { addressLine1: input.city || 'Office' },
      city: input.city,
      state: input.state,
      pincode: input.pincode,
      verificationStatus: 'pending',
      accountStatus: 'active',
      consultationTypes: input.consultationTypes || ['phone', 'video'],
      consultationFee: input.consultationFee ?? 1500,
      isAvailable: true
    });

    const token = this.generateToken(lawyer);
    const safeLawyer = lawyer.toJSON() as ILawyer;

    return { lawyer: safeLawyer, token };
  }

  static async login(email: string, password: string): Promise<{ lawyer: ILawyer; token: string }> {
    const lawyer = await Lawyer.findOne({
      email: email.toLowerCase().trim(),
      deletedAt: null
    }).select('+passwordHash');

    if (!lawyer) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    if (!lawyer.passwordHash) {
      throw ApiError.unauthorized(
        'Password has not been set for this account yet. Please contact LegalDost admin support.'
      );
    }

    const isMatch = await lawyer.comparePassword(password);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    if (lawyer.accountStatus === 'suspended') {
      throw ApiError.forbidden(
        `Your lawyer account has been suspended. Reason: ${lawyer.statusReason || 'Administrative hold'}`
      );
    }

    if (lawyer.accountStatus === 'inactive') {
      throw ApiError.forbidden('Your lawyer account is deactivated.');
    }

    lawyer.lastLoginAt = new Date();
    await lawyer.save();

    const token = this.generateToken(lawyer);
    const safeLawyer = lawyer.toJSON() as ILawyer;

    return { lawyer: safeLawyer, token };
  }

  static async updateProfile(lawyerId: string, input: any): Promise<ILawyer> {
    const lawyer = await Lawyer.findById(lawyerId);
    if (!lawyer || lawyer.deletedAt) {
      throw ApiError.notFound('Lawyer profile not found');
    }

    // Allowed editable fields by lawyer (strictly protecting verificationStatus, barEnrollmentNumber, accountStatus)
    const allowedFields = [
      'fullName',
      'phone',
      'gender',
      'languages',
      'practiceAreas',
      'professionalBio',
      'profileImage',
      'officeAddress',
      'city',
      'state',
      'pincode',
      'consultationTypes',
      'consultationFee',
      'isAvailable'
    ];

    for (const key of allowedFields) {
      if (input[key] !== undefined) {
        if (key === 'officeAddress' && typeof input.officeAddress === 'object') {
          lawyer.officeAddress = {
            ...lawyer.officeAddress,
            ...input.officeAddress
          };
        } else {
          (lawyer as any)[key] = input[key];
        }
      }
    }

    await lawyer.save();
    return lawyer.toJSON() as ILawyer;
  }
}

