import mongoose from 'mongoose';

const SlideSchema = new mongoose.Schema(
  {
    title: { type: String, default: '' },
    body: { type: String, default: '' },
  },
  { _id: false }
);

const AccessSessionSchema = new mongoose.Schema(
  {
    tokenHash: { type: String, required: true },
    email: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const OtpSchema = new mongoose.Schema(
  {
    hash: { type: String, default: '' },
    email: { type: String, default: '' },
    expiresAt: { type: Date },
    attempts: { type: Number, default: 0 },
  },
  { _id: false }
);

const ProposalSchema = new mongoose.Schema(
  {
    token: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    clientName: { type: String, required: true, trim: true },
    clientEmail: { type: String, required: true, lowercase: true, trim: true },
    clientDesignation: { type: String, default: '', trim: true },
    clientCompany: { type: String, default: '', trim: true },
    industry: { type: String, default: '', trim: true },
    category: { type: String, default: '', trim: true },
    ownerName: { type: String, default: '', trim: true },
    version: { type: Number, default: 1 },
    slides: { type: [SlideSchema], default: [] },
    presentationUrl: { type: String, default: '' },
    oneTimeView: { type: Boolean, default: false },
    fileId: { type: mongoose.Schema.Types.ObjectId, default: null },
    fileName: { type: String, default: '' },
    fileMime: { type: String, default: '' },
    fileSize: { type: Number, default: 0 },
    viewedAt: { type: Date },
    status: {
      type: String,
      enum: ['draft', 'live', 'expired', 'converted'],
      default: 'live',
    },
    revoked: { type: Boolean, default: false },
    expiresAt: { type: Date },
    otp: { type: OtpSchema, default: () => ({}) },
    accessSessions: { type: [AccessSessionSchema], default: [] },
    firstViewedAt: { type: Date },
    lastViewedAt: { type: Date },
    viewCount: { type: Number, default: 0 },
    totalDurationMs: { type: Number, default: 0 },
    reminderSentAt: { type: Date },
  },
  { timestamps: true }
);

ProposalSchema.index({ clientEmail: 1 });
ProposalSchema.index({ createdAt: -1 });
ProposalSchema.index({ status: 1 });

if (mongoose.models.Proposal) {
  delete mongoose.models.Proposal;
}

export default mongoose.model('Proposal', ProposalSchema);
