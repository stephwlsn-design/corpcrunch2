import mongoose from 'mongoose';

const AboutContentSchema = new mongoose.Schema(
  {
    section: {
      type: String,
      required: true,
      enum: ['hero', 'whoWeAre', 'vision', 'mission', 'numbers'],
      unique: true,
    },
    title: {
      type: String,
    },
    content: {
      type: String,
    },
    subtitle: {
      type: String,
    },
    imageUrl: {
      type: String,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
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
AboutContentSchema.index({ section: 1 });
AboutContentSchema.index({ isActive: 1 });

export default mongoose.models.AboutContent || mongoose.model('AboutContent', AboutContentSchema);

