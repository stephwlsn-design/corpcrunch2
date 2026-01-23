import mongoose from 'mongoose';

const AboutStatsSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
    description: {
      type: String,
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
AboutStatsSchema.index({ order: 1 });
AboutStatsSchema.index({ isActive: 1 });

export default mongoose.models.AboutStats || mongoose.model('AboutStats', AboutStatsSchema);

