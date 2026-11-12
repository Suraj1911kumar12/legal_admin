import mongoose, { Document, Schema, Types } from 'mongoose';

export type QueryStatus = 'draft' | 'pending' | 'assigned' | 'accepted' | 'declined' | 'closed';
export type QueryUrgency = 'low' | 'medium' | 'high' | 'urgent';

export interface IIntakeSummary {
  aiSummary: string;
  likelyCategory: string;
  confirmedFacts?: string[];
  missingInformation: string[];
  recommendedNextSteps: string[];
}

export interface IQueryDocument {
  documentId?: Types.ObjectId | null;
  name: string;
  type: string;
  url: string;
  size?: number;
}

export interface IQueryDeclineRecord {
  lawyerId: Types.ObjectId;
  reason: string;
  declinedAt: Date;
}

export interface IFollowUpAnswer {
  question: string;
  answer: string;
  answeredAt: Date;
}

export interface IQuery extends Document {
  queryReference: string;
  customerId?: Types.ObjectId | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerLocation: string;
  category: string;
  summary: string;
  specificQuestion: string;
  preferredLanguage: string;
  urgency: QueryUrgency;
  status: QueryStatus;
  isDraft: boolean;
  clientSubmissionKey?: string;
  assignedLawyerId?: Types.ObjectId | null;
  acceptedAt?: Date;
  declinedBy: IQueryDeclineRecord[];
  documents: IQueryDocument[];
  followUpAnswers: IFollowUpAnswer[];
  intakeSummary: IIntakeSummary;
  associatedMatterId?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const querySchema = new Schema<IQuery>(
  {
    queryReference: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      default: null,
      index: true
    },
    customerName: {
      type: String,
      required: true,
      trim: true
    },
    customerEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    customerPhone: {
      type: String,
      default: '',
      trim: true
    },
    customerLocation: {
      type: String,
      default: '',
      trim: true
    },
    category: {
      type: String,
      default: 'General Legal',
      trim: true,
      index: true
    },
    summary: {
      type: String,
      default: '',
      trim: true
    },
    specificQuestion: {
      type: String,
      default: '',
      trim: true
    },
    preferredLanguage: {
      type: String,
      default: 'en',
      trim: true
    },
    urgency: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    status: {
      type: String,
      enum: ['draft', 'pending', 'assigned', 'accepted', 'declined', 'closed'],
      default: 'pending',
      index: true
    },
    isDraft: {
      type: Boolean,
      default: false,
      index: true
    },
    clientSubmissionKey: {
      type: String,
      trim: true
    },
    assignedLawyerId: {
      type: Schema.Types.ObjectId,
      ref: 'Lawyer',
      default: null,
      index: true
    },
    acceptedAt: {
      type: Date
    },
    declinedBy: [
      {
        lawyerId: { type: Schema.Types.ObjectId, ref: 'Lawyer', required: true },
        reason: { type: String, required: true },
        declinedAt: { type: Date, default: Date.now }
      }
    ],
    documents: [
      {
        documentId: { type: Schema.Types.ObjectId, ref: 'DocumentRecord', default: null },
        name: { type: String, required: true },
        type: { type: String, required: true },
        url: { type: String, default: '' },
        size: { type: Number }
      }
    ],
    followUpAnswers: [
      {
        question: { type: String, required: true },
        answer: { type: String, required: true },
        answeredAt: { type: Date, default: Date.now }
      }
    ],
    intakeSummary: {
      aiSummary: { type: String, default: '' },
      likelyCategory: { type: String, default: 'General Legal' },
      confirmedFacts: { type: [String], default: [] },
      missingInformation: { type: [String], default: [] },
      recommendedNextSteps: { type: [String], default: [] }
    },
    associatedMatterId: {
      type: Schema.Types.ObjectId,
      ref: 'Matter',
      default: null
    }
  },
  {
    timestamps: true
  }
);

querySchema.index({ category: 1, status: 1 });
querySchema.index({ customerEmail: 1 });
querySchema.index({ customerId: 1, clientSubmissionKey: 1 }, { sparse: true });

export const Query = mongoose.model<IQuery>('Query', querySchema);
