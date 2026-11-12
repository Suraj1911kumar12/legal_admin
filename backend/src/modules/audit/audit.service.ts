import { AuditLog, AuditAction, IAuditLog } from './audit.model';
import { Types } from 'mongoose';
import { PaginationOptions, calculatePagination } from '../../utils/pagination';

export interface RecordAuditParams {
  adminId: Types.ObjectId | string;
  adminEmail: string;
  action: AuditAction;
  entityType: 'Lawyer' | 'Admin' | 'Auth';
  entityId: Types.ObjectId | string;
  changeSummary?: Record<string, any>;
  correlationId?: string;
  ipAddress?: string;
}

export class AuditService {
  static async record(params: RecordAuditParams): Promise<IAuditLog> {
    try {
      // Strip any sensitive fields just in case
      const safeSummary = { ...(params.changeSummary || {}) };
      delete safeSummary.password;
      delete safeSummary.passwordHash;
      delete safeSummary.token;

      return await AuditLog.create({
        adminId: new Types.ObjectId(params.adminId.toString()),
        adminEmail: params.adminEmail,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        changeSummary: safeSummary,
        correlationId: params.correlationId,
        ipAddress: params.ipAddress
      });
    } catch (err: any) {
      console.error('[AuditService Error] Failed to write audit log:', err.message);
      // We don't want audit failure to crash business transaction, but we log it
      return null as any;
    }
  }

  static async getLogs(
    filter: Record<string, any>,
    pagination: PaginationOptions
  ) {
    const query: Record<string, any> = {};

    if (filter.entityType) {
      query.entityType = filter.entityType;
    }
    if (filter.entityId) {
      query.entityId = filter.entityId;
    }
    if (filter.action) {
      query.action = filter.action;
    }
    if (filter.adminId) {
      query.adminId = filter.adminId;
    }

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .sort({ createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit)
        .populate('adminId', 'name email role'),
      AuditLog.countDocuments(query)
    ]);

    return {
      logs,
      pagination: calculatePagination(total, pagination.page, pagination.limit)
    };
  }
}

