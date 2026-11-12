import { Request, Response } from 'express';
import { AuditService } from './audit.service';
import { getPaginationOptions } from '../../utils/pagination';
import { sendSuccess } from '../../utils/response';

export class AuditController {
  static async getLogs(req: Request, res: Response) {
    const pagination = getPaginationOptions(req.query);
    const filter: Record<string, any> = {};

    if (req.query.entityType) filter.entityType = req.query.entityType;
    if (req.query.entityId) filter.entityId = req.query.entityId;
    if (req.query.action) filter.action = req.query.action;

    const { logs, pagination: meta } = await AuditService.getLogs(filter, pagination);

    return sendSuccess(res, 200, 'Audit logs retrieved', logs, meta);
  }
}

