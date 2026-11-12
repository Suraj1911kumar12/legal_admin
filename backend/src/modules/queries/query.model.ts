import mongoose, { Document, Schema, Types } from 'mongoose';

export type QueryStatus = 'pending' | 'assigned' | 'accepted' | 'declined' | 'closed';
export type QueryUrgency = 'low' | 'medium' | 'high' | 'urgent';

export interface IIntakeSummary {
  aiSummary: string;
  likelyCategory: string;
  confirmedFacts?: string[];
  missingInformation: string[];
  recommendedNextSteps: string[];
}

export interface IQueryDocument {
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

export interface IQuery extends Document {
  queryReference: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerLocation: string;
  category: string;
  summary: string;
  specificQuestion: string;
  urgency: QueryUrgency;
  status: QueryStatus;
  assignedLawyerId?: Types.ObjectId | null;
  acceptedAt?: Date;
  declinedBy: IQueryDeclineRecord[];
  documents: IQueryDocument[];
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
      required: true,
      trim: true
    },
    customerLocation: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    summary: {
      type: String,
      required: true,
      trim: true
    },
    specificQuestion: {
      type: String,
      required: true,
      trim: true
    },
    urgency: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    status: {
      type: String,
      enum: ['pending', 'assigned', 'accepted', 'declined', 'closed'],
      default: 'pending',
      index: true
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
        name: { type: String, required: true },
        type: { type: String, required: true },
        url: { type: String, required: true },
        size: { type: Number }
      }
    ],
    intakeSummary: {
      aiSummary: { type: String, required: true },
      likelyCategory: { type: String, required: true },
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

export const Query = mongoose.model<IQuery>('Query', querySchema);

