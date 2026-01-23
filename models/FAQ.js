import mongoose from 'mongoose';

const FAQSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
FAQSchema.index({ order: 1 });
FAQSchema.index({ isActive: 1 });

export default mongoose.models.FAQ || mongoose.model('FAQ', FAQSchema);

