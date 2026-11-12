import { Types } from 'mongoose';
import { Lawyer, ILawyer, VerificationStatus, AccountStatus } from './lawyer.model';
import {
  CreateLawyerInput,
  UpdateLawyerInput,
  UpdateVerificationInput,
  UpdateAccountStatusInput,
  QueryLawyersInput
} from './lawyer.validation';
import { ApiError } from '../../utils/ApiError';
import { AuditService } from '../audit/audit.service';
import { calculatePagination, getPaginationOptions } from '../../utils/pagination';
import { IAdmin } from '../auth/auth.model';

export class LawyerService {
  static async createLawyer(input: CreateLawyerInput, admin: IAdmin): Promise<ILawyer> {
    // 1. Check duplicate email
    const existingEmail = await Lawyer.findOne({
      email: input.email.toLowerCase(),
      deletedAt: null
    });
    if (existingEmail) {
      throw ApiError.conflict(`A lawyer with email '${input.email}' already exists`);
    }

    // 2. Check duplicate bar enrollment in the authority/state
    const existingEnrollment = await Lawyer.findOne({
      barEnrollmentNumber: input.barEnrollmentNumber.toUpperCase(),
      enrollmentState: input.enrollmentState,
      deletedAt: null
    });
    if (existingEnrollment) {
      throw ApiError.conflict(
        `A lawyer with enrollment number '${input.barEnrollmentNumber}' already exists in state '${input.enrollmentState}'`
      );
    }

    // 3. Create lawyer document with default pending status
    const lawyer = await Lawyer.create({
      ...input,
      email: input.email.toLowerCase(),
      barEnrollmentNumber: input.barEnrollmentNumber.toUpperCase(),
      verificationStatus: 'pending',
      accountStatus: 'active',
      createdBy: admin._id,
      updatedBy: admin._id,
      deletedAt: null
    });

    // 4. Audit log
    await AuditService.record({
      adminId: admin._id,
      adminEmail: admin.email,
      action: 'LAWYER_CREATED',
      entityType: 'Lawyer',
      entityId: lawyer._id,
      changeSummary: {
        fullName: lawyer.fullName,
        email: lawyer.email,
        barEnrollmentNumber: lawyer.barEnrollmentNumber,
        enrollmentState: lawyer.enrollmentState
      }
    });

    return lawyer;
  }

  static async listLawyers(query: QueryLawyersInput) {
    const pagination = getPaginationOptions(query);
    const filter: Record<string, any> = {};

    // Soft delete filter
    if (query.includeDeleted !== 'true') {
      filter.deletedAt = null;
    }

    // Verification status filter
    if (query.verificationStatus) {
      filter.verificationStatus = query.verificationStatus;
    }

    // Account status filter
    if (query.accountStatus) {
      filter.accountStatus = query.accountStatus;
    }

    // Practice area filter
    if (query.practiceArea) {
      filter.practiceAreas = query.practiceArea;
    }

    // State filter
    if (query.state) {
      filter.state = { $regex: new RegExp(`^${query.state}$`, 'i') };
    }

    // City filter
    if (query.city) {
      filter.city = { $regex: new RegExp(`^${query.city}$`, 'i') };
    }

    // Search filter across name, email, phone, enrollment number
    if (query.search && query.search.trim().length > 0) {
      const searchRegex = new RegExp(query.search.trim(), 'i');
      filter.$or = [
        { fullName: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { barEnrollmentNumber: searchRegex },
        { city: searchRegex }
      ];
    }

    const sortObject: Record<string, 1 | -1> = {
      [pagination.sortField]: pagination.sortOrder
    };

    const [lawyers, total] = await Promise.all([
      Lawyer.find(filter)
        .sort(sortObject)
        .skip(pagination.skip)
        .limit(pagination.limit)
        .populate('createdBy', 'name email')
        .populate('verifiedBy', 'name email'),
      Lawyer.countDocuments(filter)
    ]);

    return {
      lawyers,
      pagination: calculatePagination(total, pagination.page, pagination.limit)
    };
  }

  static async getLawyerById(id: string, includeDeleted = false): Promise<ILawyer> {
    if (!Types.ObjectId.isValid(id)) {
      throw ApiError.badRequest('Invalid lawyer ID format');
    }

    const query: Record<string, any> = { _id: id };
    if (!includeDeleted) {
      query.deletedAt = null;
    }

    const lawyer = await Lawyer.findOne(query)
      .populate('createdBy', 'name email role')
      .populate('updatedBy', 'name email role')
      .populate('verifiedBy', 'name email role');

    if (!lawyer) {
      throw ApiError.notFound('Lawyer not found');
    }

    return lawyer;
  }

  static async updateLawyer(id: string, input: UpdateLawyerInput, admin: IAdmin): Promise<ILawyer> {
    const lawyer = await this.getLawyerById(id);

    // Check duplicate email if email is being updated
    if (input.email && input.email.toLowerCase() !== lawyer.email.toLowerCase()) {
      const existing = await Lawyer.findOne({
        email: input.email.toLowerCase(),
        _id: { $ne: lawyer._id },
        deletedAt: null
      });
      if (existing) {
        throw ApiError.conflict(`Email '${input.email}' is already registered with another lawyer`);
      }
    }

    // Check duplicate bar enrollment if enrollment info is being updated
    const targetEnrollment = input.barEnrollmentNumber?.toUpperCase() || lawyer.barEnrollmentNumber;
    const targetState = input.enrollmentState || lawyer.enrollmentState;

    if (
      (input.barEnrollmentNumber && input.barEnrollmentNumber.toUpperCase() !== lawyer.barEnrollmentNumber) ||
      (input.enrollmentState && input.enrollmentState !== lawyer.enrollmentState)
    ) {
      const existing = await Lawyer.findOne({
        barEnrollmentNumber: targetEnrollment,
        enrollmentState: targetState,
        _id: { $ne: lawyer._id },
        deletedAt: null
      });
      if (existing) {
        throw ApiError.conflict(
          `Enrollment '${targetEnrollment}' in state '${targetState}' is already in use by another lawyer`
        );
      }
    }

    // Apply allowed partial updates (prevent mass assignment of protected fields)
    const allowedFields: (keyof UpdateLawyerInput)[] = [
      'fullName',
      'email',
      'phone',
      'profileImage',
      'gender',
      'languages',
      'barEnrollmentNumber',
      'barCouncil',
      'enrollmentState',
      'yearsOfExperience',
      'practiceAreas',
      'professionalBio',
      'officeAddress',
      'city',
      'state',
      'pincode',
      'documents'
    ];

    const changes: Record<string, any> = {};

    for (const field of allowedFields) {
      if (input[field] !== undefined) {
        if (field === 'email' && input.email) {
          (lawyer as any)[field] = input.email.toLowerCase();
        } else if (field === 'barEnrollmentNumber' && input.barEnrollmentNumber) {
          (lawyer as any)[field] = input.barEnrollmentNumber.toUpperCase();
        } else if (field === 'officeAddress' && input.officeAddress) {
          lawyer.officeAddress = {
            ...lawyer.officeAddress,
            ...input.officeAddress
          };
        } else {
          (lawyer as any)[field] = input[field];
        }
        changes[field] = input[field];
      }
    }

    lawyer.updatedBy = admin._id;
    await lawyer.save();

    // Audit log
    await AuditService.record({
      adminId: admin._id,
      adminEmail: admin.email,
      action: 'LAWYER_UPDATED',
      entityType: 'Lawyer',
      entityId: lawyer._id,
      changeSummary: changes
    });

    return lawyer;
  }

  static async changeVerificationStatus(
    id: string,
    input: UpdateVerificationInput,
    admin: IAdmin
  ): Promise<ILawyer> {
    const lawyer = await this.getLawyerById(id);
    const currentStatus = lawyer.verificationStatus;
    const targetStatus = input.status;

    if (currentStatus === targetStatus) {
      throw ApiError.badRequest(`Lawyer verification is already in '${currentStatus}' status`);
    }

    // Allowed transition logic:
    // - pending -> under_review
    // - under_review -> verified | rejected
    // - rejected -> under_review (reopening)
    // - verified -> under_review (if admin needs to re-verify due to discrepancy)
    if (currentStatus === 'pending' && targetStatus !== 'under_review') {
      throw ApiError.badRequest(
        `Invalid status transition: A 'pending' profile must be marked 'under_review' before it can be verified or rejected.`
      );
    }

    if (currentStatus === 'rejected' && targetStatus === 'verified') {
      throw ApiError.badRequest(
        `Invalid status transition: A 'rejected' profile must first be reopened to 'under_review' before verification.`
      );
    }

    lawyer.verificationStatus = targetStatus;
    if (input.verificationNotes !== undefined) {
      lawyer.verificationNotes = input.verificationNotes;
    }

    if (targetStatus === 'verified') {
      lawyer.verifiedAt = new Date();
      lawyer.verifiedBy = admin._id;
      lawyer.rejectionReason = undefined;
    } else if (targetStatus === 'rejected') {
      lawyer.rejectionReason = input.rejectionReason;
      lawyer.verifiedAt = undefined;
      lawyer.verifiedBy = admin._id;
    } else if (targetStatus === 'under_review') {
      // Reopened or initial review
      lawyer.rejectionReason = undefined;
    }

    lawyer.updatedBy = admin._id;
    await lawyer.save();

    await AuditService.record({
      adminId: admin._id,
      adminEmail: admin.email,
      action: 'LAWYER_VERIFICATION_STATUS_CHANGED',
      entityType: 'Lawyer',
      entityId: lawyer._id,
      changeSummary: {
        from: currentStatus,
        to: targetStatus,
        rejectionReason: lawyer.rejectionReason,
        verificationNotes: lawyer.verificationNotes
      }
    });

    return lawyer;
  }

  static async changeAccountStatus(
    id: string,
    input: UpdateAccountStatusInput,
    admin: IAdmin
  ): Promise<ILawyer> {
    const lawyer = await this.getLawyerById(id);
    const currentStatus = lawyer.accountStatus;
    const targetStatus = input.status;

    if (currentStatus === targetStatus) {
      throw ApiError.badRequest(`Lawyer account is already '${currentStatus}'`);
    }

    lawyer.accountStatus = targetStatus;
    lawyer.statusReason = input.reason;
    lawyer.updatedBy = admin._id;
    await lawyer.save();

    await AuditService.record({
      adminId: admin._id,
      adminEmail: admin.email,
      action: 'LAWYER_ACCOUNT_STATUS_CHANGED',
      entityType: 'Lawyer',
      entityId: lawyer._id,
      changeSummary: {
        from: currentStatus,
        to: targetStatus,
        reason: input.reason
      }
    });

    return lawyer;
  }

  static async deleteLawyer(id: string, admin: IAdmin): Promise<ILawyer> {
    const lawyer = await this.getLawyerById(id);

    // Perform soft delete
    lawyer.deletedAt = new Date();
    lawyer.accountStatus = 'inactive';
    lawyer.statusReason = `Soft-deleted by admin ${admin.email}`;
    lawyer.updatedBy = admin._id;
    await lawyer.save();

    await AuditService.record({
      adminId: admin._id,
      adminEmail: admin.email,
      action: 'LAWYER_SOFT_DELETED',
      entityType: 'Lawyer',
      entityId: lawyer._id,
      changeSummary: {
        deletedAt: lawyer.deletedAt,
        fullName: lawyer.fullName,
        email: lawyer.email
      }
    });

    return lawyer;
  }
}

