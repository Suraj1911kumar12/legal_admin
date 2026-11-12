import { Request, Response } from 'express';
import { LawyerService } from './lawyer.service';
import { sendSuccess } from '../../utils/response';
import { ApiError } from '../../utils/ApiError';

export class LawyerController {
  static async createLawyer(req: Request, res: Response) {
    if (!req.admin) {
      throw ApiError.unauthorized();
    }

    const lawyer = await LawyerService.createLawyer(req.body, req.admin);
    return sendSuccess(res, 201, 'Lawyer profile created successfully', lawyer);
  }

  static async listLawyers(req: Request, res: Response) {
    const { lawyers, pagination } = await LawyerService.listLawyers(req.query as any);
    return sendSuccess(res, 200, 'Lawyers retrieved successfully', lawyers, pagination);
  }

  static async getLawyerById(req: Request, res: Response) {
    const id = req.params.id as string;
    const lawyer = await LawyerService.getLawyerById(id);
    return sendSuccess(res, 200, 'Lawyer details retrieved successfully', lawyer);
  }

  static async updateLawyer(req: Request, res: Response) {
    if (!req.admin) {
      throw ApiError.unauthorized();
    }

    const id = req.params.id as string;
    const lawyer = await LawyerService.updateLawyer(id, req.body, req.admin);
    return sendSuccess(res, 200, 'Lawyer updated successfully', lawyer);
  }

  static async changeVerificationStatus(req: Request, res: Response) {
    if (!req.admin) {
      throw ApiError.unauthorized();
    }

    const id = req.params.id as string;
    const lawyer = await LawyerService.changeVerificationStatus(id, req.body, req.admin);
    return sendSuccess(res, 200, `Lawyer verification status changed to '${lawyer.verificationStatus}'`, lawyer);
  }

  static async changeAccountStatus(req: Request, res: Response) {
    if (!req.admin) {
      throw ApiError.unauthorized();
    }

    const id = req.params.id as string;
    const lawyer = await LawyerService.changeAccountStatus(id, req.body, req.admin);
    return sendSuccess(res, 200, `Lawyer account status changed to '${lawyer.accountStatus}'`, lawyer);
  }

  static async deleteLawyer(req: Request, res: Response) {
    if (!req.admin) {
      throw ApiError.unauthorized();
    }

    const id = req.params.id as string;
    const lawyer = await LawyerService.deleteLawyer(id, req.admin);
    return sendSuccess(res, 200, 'Lawyer record archived successfully', {
      id: lawyer._id,
      deletedAt: lawyer.deletedAt
    });
  }
}
