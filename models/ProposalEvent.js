import mongoose from 'mongoose';

const ProposalEventSchema = new mongoose.Schema(
  {
    proposal: { type: mongoose.Schema.Types.ObjectId, ref: 'Proposal', required: true, index: true },
    type: {
      type: String,
      enum: ['access_requested', 'access_granted', 'view', 'heartbeat', 'section', 'unauthorised', 'feedback'],
      required: true,
    },
    email: { type: String, default: '' },
    ip: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    durationMs: { type: Number, default: 0 },
    section: { type: String, default: '' },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

ProposalEventSchema.index({ proposal: 1, createdAt: -1 });
ProposalEventSchema.index({ type: 1 });

export default mongoose.models.ProposalEvent ||
  mongoose.model('ProposalEvent', ProposalEventSchema);
