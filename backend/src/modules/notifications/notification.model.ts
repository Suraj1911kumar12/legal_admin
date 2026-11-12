import mongoose, { Document, Schema, Types } from 'mongoose';

export type NotificationType =
  | 'query'
  | 'matter'
  | 'message'
  | 'consultation'
  | 'document'
  | 'ai'
  | 'system';

export interface INotification extends Document {
  recipientId: Types.ObjectId;
  recipientType: 'lawyer' | 'customer';
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  isRead: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipientId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true
    },
    recipientType: {
      type: String,
      enum: ['lawyer', 'customer'],
      default: 'lawyer',
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['query', 'matter', 'message', 'consultation', 'document', 'ai', 'system'],
      default: 'system'
    },
    link: {
      type: String
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

notificationSchema.index({ recipientId: 1, recipientType: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
