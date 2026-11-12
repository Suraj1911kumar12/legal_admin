import { Request, Response } from 'express';
import { DashboardService } from './dashboard.service';
import { sendSuccess } from '../../utils/response';

export class DashboardController {
  static async getStats(_req: Request, res: Response) {
    const stats = await DashboardService.getStats();
    return sendSuccess(res, 200, 'Dashboard statistics retrieved successfully', stats);
  }
}

