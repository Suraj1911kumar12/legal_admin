import mongoose, { Document, Schema, Types } from 'mongoose';

export type DocReviewStatus = 'pending' | 'reviewed' | 'action_required';

export interface IDocumentRecord extends Document {
  name: string;
  documentType: string;
  matterId?: Types.ObjectId | null;
  lawyerId: Types.ObjectId;
  customerName: string;
  fileKey: string;
  fileSize: number;
  mimeType: string;
  reviewStatus: DocReviewStatus;
  reviewComments?: string;
  reviewedAt?: Date;
  uploadedAt: Date;
}

const documentRecordSchema = new Schema<IDocumentRecord>(
  {
    name: { type: String, required: true, trim: true },
    documentType: { type: String, required: true, trim: true },
    matterId: { type: Schema.Types.ObjectId, ref: 'Matter', default: null, index: true },
    lawyerId: { type: Schema.Types.ObjectId, ref: 'Lawyer', required: true, index: true },
    customerName: { type: String, required: true, trim: true },
    fileKey: { type: String, required: true, trim: true },
    fileSize: { type: Number, default: 0 },
    mimeType: { type: String, default: 'application/pdf' },
    reviewStatus: {
      type: String,
      enum: ['pending', 'reviewed', 'action_required'],
      default: 'pending',
      index: true
    },
    reviewComments: { type: String, trim: true },
    reviewedAt: { type: Date },
    uploadedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

documentRecordSchema.index({ lawyerId: 1, matterId: 1 });

export const DocumentRecord = mongoose.model<IDocumentRecord>('DocumentRecord', documentRecordSchema);

