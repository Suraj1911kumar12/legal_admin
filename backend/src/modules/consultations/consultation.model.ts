import mongoose, { Document, Schema, Types } from 'mongoose';

export type ConsultationType = 'video' | 'phone' | 'in_person';
export type ConsultationStatus = 'pending' | 'accepted' | 'completed' | 'cancelled';

export interface IConsultation extends Document {
  consultationReference: string;
  lawyerId: Types.ObjectId;
  customerId?: Types.ObjectId | null;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  matterId?: Types.ObjectId | null;
  date: Date;
  time: string;
  timeZone: string;
  type: ConsultationType;
  status: ConsultationStatus;
  meetingLink?: string;
  location?: string;
  notes?: string;
  fee: number;
  declineReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const consultationSchema = new Schema<IConsultation>(
  {
    consultationReference: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    lawyerId: {
      type: Schema.Types.ObjectId,
      ref: 'Lawyer',
      required: true,
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
      phone: { type: String, required: true }
    },
    matterId: {
      type: Schema.Types.ObjectId,
      ref: 'Matter',
      default: null
    },
    date: {
      type: Date,
      required: true,
      index: true
    },
    time: {
      type: String,
      required: true
    },
    timeZone: {
      type: String,
      default: 'Asia/Kolkata'
    },
    type: {
      type: String,
      enum: ['video', 'phone', 'in_person'],
      default: 'video'
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'completed', 'cancelled'],
      default: 'pending',
      index: true
    },
    meetingLink: {
      type: String
    },
    location: {
      type: String
    },
    notes: {
      type: String
    },
    fee: {
      type: Number,
      default: 1500
    },
    declineReason: {
      type: String
    }
  },
  { timestamps: true }
);

consultationSchema.index({ lawyerId: 1, date: 1 });

export const Consultation = mongoose.model<IConsultation>('Consultation', consultationSchema);

