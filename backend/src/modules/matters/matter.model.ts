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

export interface IMatterCustomer {
  name: string;
  email: string;
  phone: string;
}

export interface IMatter extends Document {
  matterReference: string;
  title: string;
  category: string;
  status: MatterStatus;
  lawyerId: Types.ObjectId;
  customer: IMatterCustomer;
  queryId?: Types.ObjectId | null;
  internalNotes: IInternalNote[];
  clientUpdates: IClientUpdate[];
  tasks: IMatterTask[];
  importantDates: IImportantDate[];
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
    status: {
      type: String,
      enum: ['intake', 'active', 'pending_court', 'under_negotiation', 'resolved', 'closed'],
      default: 'active',
      index: true
    },
    lawyerId: {
      type: Schema.Types.ObjectId,
      ref: 'Lawyer',
      required: true,
      index: true
    },
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true }
    },
    queryId: {
      type: Schema.Types.ObjectId,
      ref: 'Query',
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
    }
  },
  {
    timestamps: true
  }
);

matterSchema.index({ lawyerId: 1, status: 1 });

export const Matter = mongoose.model<IMatter>('Matter', matterSchema);

