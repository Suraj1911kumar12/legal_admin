import mongoose, { Document, Schema, Types } from 'mongoose';

export type MatterStatus =
  | 'intake'
  | 'active'
  | 'pending_court'
  | 'under_negotiation'
  | 'resolved'
  | 'closed';

export interface IInternalNote {
  _id?: Types.ObjectId;
  content: string;
  createdAt: Date;
  createdBy: string;
}

export interface IClientUpdate {
  _id?: Types.ObjectId;
  title: string;
  message: string;
  createdAt: Date;
  isShared: boolean;
}

export interface IMatterTask {
  _id?: Types.ObjectId;
  title: string;
  dueDate?: Date;
  isCompleted: boolean;
}

export interface IImportantDate {
  _id?: Types.ObjectId;
  title: string;
  date: Date;
  description?: string;
}

export interface IMatterTimelineEvent {
  _id?: Types.ObjectId;
  title: string;
  description?: string;
  eventType:
    | 'problem_submitted'
    | 'document_uploaded'
    | 'ai_analysis'
    | 'lawyer_assigned'
    | 'consultation'
    | 'matter_updated';
  createdAt: Date;
}

export interface IMatterCustomer {
  name: string;
  email: string;
  phone: string;
}

export interface IMatter extends Document {
  matterReference: string;
  title: string;
  category: string;
  description?: string;
  aiSummary?: string;
  importantFacts?: string[];
  selectedSolution?: string;
  status: MatterStatus;
  lawyerId?: Types.ObjectId | null;
  customerId?: Types.ObjectId | null;
  customer: IMatterCustomer;
  queryId?: Types.ObjectId | null;
  aiSessionId?: Types.ObjectId | null;
  internalNotes: IInternalNote[];
  clientUpdates: IClientUpdate[];
  tasks: IMatterTask[];
  importantDates: IImportantDate[];
  timeline: IMatterTimelineEvent[];
  createdAt: Date;
  updatedAt: Date;
}

const internalNoteSchema = new Schema<IInternalNote>(
  {
    content: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: String, required: true }
  },
  { _id: true }
);

const clientUpdateSchema = new Schema<IClientUpdate>(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
    isShared: { type: Boolean, default: true }
  },
  { _id: true }
);

const matterTaskSchema = new Schema<IMatterTask>(
  {
    title: { type: String, required: true, trim: true },
    dueDate: { type: Date },
    isCompleted: { type: Boolean, default: false }
  },
  { _id: true }
);

const importantDateSchema = new Schema<IImportantDate>(
  {
    title: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    description: { type: String, trim: true }
  },
  { _id: true }
);

const timelineEventSchema = new Schema<IMatterTimelineEvent>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    eventType: {
      type: String,
      enum: [
        'problem_submitted',
        'document_uploaded',
        'ai_analysis',
        'lawyer_assigned',
        'consultation',
        'matter_updated'
      ],
      default: 'matter_updated'
    },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: true }
);

const matterSchema = new Schema<IMatter>(
  {
    matterReference: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    title: {
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
    description: {
      type: String,
      trim: true,
      default: ''
    },
    aiSummary: {
      type: String,
      trim: true,
      default: ''
    },
    importantFacts: {
      type: [String],
      default: []
    },
    selectedSolution: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['intake', 'active', 'pending_court', 'under_negotiation', 'resolved', 'closed'],
      default: 'active',
      index: true
    },
    lawyerId: {
      type: Schema.Types.ObjectId,
      ref: 'Lawyer',
      default: null,
      index: true
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      default: null,
      index: true
    },
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true, lowercase: true, trim: true },
      phone: { type: String, default: '' }
    },
    queryId: {
      type: Schema.Types.ObjectId,
      ref: 'Query',
      default: null
    },
    aiSessionId: {
      type: Schema.Types.ObjectId,
      ref: 'AISession',
      default: null
    },
    internalNotes: {
      type: [internalNoteSchema],
      default: []
    },
    clientUpdates: {
      type: [clientUpdateSchema],
      default: []
    },
    tasks: {
      type: [matterTaskSchema],
      default: []
    },
    importantDates: {
      type: [importantDateSchema],
      default: []
    },
    timeline: {
      type: [timelineEventSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

matterSchema.index({ lawyerId: 1, status: 1 });
matterSchema.index({ customerId: 1, updatedAt: -1 });
matterSchema.index({ 'customer.email': 1 });

export const Matter = mongoose.model<IMatter>('Matter', matterSchema);
