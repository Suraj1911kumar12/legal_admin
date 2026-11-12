import mongoose, { Document, Schema, Types } from 'mongoose';

export type AuditAction =
  | 'LAWYER_CREATED'
  | 'LAWYER_UPDATED'
  | 'LAWYER_VERIFICATION_STATUS_CHANGED'
  | 'LAWYER_ACCOUNT_STATUS_CHANGED'
  | 'LAWYER_SOFT_DELETED'
  | 'LAWYER_RESTORED'
  | 'ADMIN_LOGIN'
  | 'ADMIN_LOGOUT';

export interface IAuditLog extends Document {
  adminId: Types.ObjectId;
  adminEmail: string;
  action: AuditAction;
  entityType: 'Lawyer' | 'Admin' | 'Auth';
  entityId: Types.ObjectId | string;
  changeSummary: Record<string, any>;
  correlationId?: string;
  ipAddress?: string;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    adminId: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
      index: true
    },
    adminEmail: {
      type: String,
      required: true
    },
    action: {
      type: String,
      required: true,
      index: true
    },
    entityType: {
      type: String,
      required: true,
      index: true
    },
    entityId: {
      type: Schema.Types.Mixed,
      required: true,
      index: true
    },
    changeSummary: {
      type: Schema.Types.Mixed,
      default: {}
    },
    correlationId: {
      type: String
    },
    ipAddress: {
      type: String
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

// Compound index for querying audit history by entity
auditLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);

