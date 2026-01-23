import mongoose from 'mongoose';

const TeamMemberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
    },
    linkedinUrl: {
      type: String,
    },
    twitterUrl: {
      type: String,
    },
    instagramUrl: {
      type: String,
    },
    email: {
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
TeamMemberSchema.index({ order: 1 });
TeamMemberSchema.index({ isActive: 1 });

export default mongoose.models.TeamMember || mongoose.model('TeamMember', TeamMemberSchema);

