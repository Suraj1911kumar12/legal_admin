import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IAIPossibleOption {
  title: string;
  explanation: string;
  whenRelevant: string;
  informationNeeded: string[];
  documentsRequired: string[];
  nextStep: string;
  limitations: string;
  sources?: string[];
}

export interface IAIStructuredResponse {
  understandingYourProblem: string;
  importantFacts: string[];
  missingInformation: string[];
  whatLawGenerallySays: string;
  possibleOptions: IAIPossibleOption[];
  documentsYouMayNeed: string[];
  suggestedNextSteps: string[];
  whenProfessionalHelpUseful: string;
  uncertaintyNotes?: string;
  disclaimer: string;
  likelyCategory: string;
  sources: { title: string; reference: string }[];
}

export interface IAIMessage {
  _id?: Types.ObjectId;
  role: 'user' | 'assistant';
  content: string;
  structuredResponse?: IAIStructuredResponse | null;
  followUpQuestions?: string[];
  createdAt: Date;
}

export interface IAISession extends Document {
  customerId: Types.ObjectId;
  intakeId?: Types.ObjectId | null;
  matterId?: Types.ObjectId | null;
  title: string;
  likelyCategory: string;
  preferredLanguage: string;
  status: 'active' | 'completed';
  selectedSolutionPath?: {
    choice: 'continue_alone' | 'get_legal_help';
    optionTitle?: string;
    selectedAt: Date;
  } | null;
  messages: IAIMessage[];
  latestAnalysis?: IAIStructuredResponse | null;
  createdAt: Date;
  updatedAt: Date;
}

const possibleOptionSchema = new Schema<IAIPossibleOption>(
  {
    title: { type: String, required: true },
    explanation: { type: String, required: true },
    whenRelevant: { type: String, default: '' },
    informationNeeded: { type: [String], default: [] },
    documentsRequired: { type: [String], default: [] },
    nextStep: { type: String, default: '' },
    limitations: { type: String, default: '' },
    sources: { type: [String], default: [] }
  },
  { _id: false }
);

const structuredResponseSchema = new Schema<IAIStructuredResponse>(
  {
    understandingYourProblem: { type: String, default: '' },
    importantFacts: { type: [String], default: [] },
    missingInformation: { type: [String], default: [] },
    whatLawGenerallySays: { type: String, default: '' },
    possibleOptions: { type: [possibleOptionSchema], default: [] },
    documentsYouMayNeed: { type: [String], default: [] },
    suggestedNextSteps: { type: [String], default: [] },
    whenProfessionalHelpUseful: { type: String, default: '' },
    uncertaintyNotes: { type: String, default: '' },
    disclaimer: {
      type: String,
      default:
        'AI-generated legal information only. This is not legal advice and does not create an attorney-client relationship.'
    },
    likelyCategory: { type: String, default: 'General Legal' },
    sources: [
      {
        title: { type: String, required: true },
        reference: { type: String, required: true }
      }
    ]
  },
  { _id: false }
);

const aiMessageSchema = new Schema<IAIMessage>(
  {
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    structuredResponse: { type: structuredResponseSchema, default: null },
    followUpQuestions: { type: [String], default: [] },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: true }
);

const aiSessionSchema = new Schema<IAISession>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    intakeId: { type: Schema.Types.ObjectId, ref: 'Query', default: null, index: true },
    matterId: { type: Schema.Types.ObjectId, ref: 'Matter', default: null },
    title: { type: String, required: true, trim: true },
    likelyCategory: { type: String, default: 'General Legal' },
    preferredLanguage: { type: String, default: 'en' },
    status: { type: String, enum: ['active', 'completed'], default: 'active' },
    selectedSolutionPath: {
      choice: { type: String, enum: ['continue_alone', 'get_legal_help'] },
      optionTitle: { type: String },
      selectedAt: { type: Date }
    },
    messages: { type: [aiMessageSchema], default: [] },
    latestAnalysis: { type: structuredResponseSchema, default: null }
  },
  { timestamps: true }
);

aiSessionSchema.index({ customerId: 1, updatedAt: -1 });

export const AISession = mongoose.model<IAISession>('AISession', aiSessionSchema);
