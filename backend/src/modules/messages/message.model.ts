import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IConversation extends Document {
  matterId?: Types.ObjectId | null;
  lawyerId: Types.ObjectId;
  customer: {
    name: string;
    email: string;
  };
  lastMessage: string;
  lastMessageAt: Date;
  unreadCountLawyer: number;
  unreadCountCustomer: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMessage extends Document {
  conversationId: Types.ObjectId;
  senderType: 'lawyer' | 'customer';
  senderId: string;
  senderName: string;
  content: string;
  attachments: {
    name: string;
    url: string;
    type: string;
  }[];
  readAt?: Date | null;
  createdAt: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    matterId: { type: Schema.Types.ObjectId, ref: 'Matter', default: null },
    lawyerId: { type: Schema.Types.ObjectId, ref: 'Lawyer', required: true, index: true },
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true }
    },
    lastMessage: { type: String, default: '' },
    lastMessageAt: { type: Date, default: Date.now },
    unreadCountLawyer: { type: Number, default: 0 },
    unreadCountCustomer: { type: Number, default: 0 }
  },
  { timestamps: true }
);

conversationSchema.index({ lawyerId: 1, lastMessageAt: -1 });

const messageSchema = new Schema<IMessage>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
    senderType: { type: String, enum: ['lawyer', 'customer'], required: true },
    senderId: { type: String, required: true },
    senderName: { type: String, required: true },
    content: { type: String, required: true, trim: true },
    attachments: [
      {
        name: { type: String, required: true },
        url: { type: String, required: true },
        type: { type: String, required: true }
      }
    ],
    readAt: { type: Date, default: null }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

messageSchema.index({ conversationId: 1, createdAt: 1 });

export const Conversation = mongoose.model<IConversation>('Conversation', conversationSchema);
export const Message = mongoose.model<IMessage>('Message', messageSchema);

