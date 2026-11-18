import mongoose from 'mongoose';

const BudgetSchema = new mongoose.Schema(
  {
    currency: { type: String, default: 'USD' },
    range: { type: String, default: '' },
    customAmount: { type: String, default: '' },
    type: { type: String, default: '' },
    status: { type: String, default: '' },
    flexibility: { type: String, default: '' },
  },
  { _id: false }
);

const ProposalFeedbackSchema = new mongoose.Schema(
  {
    proposal: { type: mongoose.Schema.Types.ObjectId, ref: 'Proposal', required: true, index: true },
    email: { type: String, required: true },
    name: { type: String, default: '' },
    decision: { type: String, enum: ['proceed', 'discuss', 'no'], required: true },
    rejectionReason: { type: String, default: '' },
    comments: { type: String, default: '' },
    budget: { type: BudgetSchema, default: () => ({}) },
    services: { type: [String], default: [] },
    serviceNotes: {
      type: [
        {
          id: { type: String, default: '' },
          note: { type: String, default: '' },
        },
      ],
      default: [],
    },
    noneExtra: { type: Boolean, default: false },
    followUpAt: { type: Date },
  },
  { timestamps: true }
);

ProposalFeedbackSchema.index({ proposal: 1, createdAt: -1 });
ProposalFeedbackSchema.index({ decision: 1 });

if (mongoose.models.ProposalFeedback) {
  delete mongoose.models.ProposalFeedback;
}

export default mongoose.model('ProposalFeedback', ProposalFeedbackSchema);
