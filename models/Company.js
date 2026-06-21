import mongoose from 'mongoose';

const CompanySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    logoUrl: String,
    description: String,
    website: String,
    industry: String,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

CompanySchema.index({ slug: 1 });
CompanySchema.index({ isActive: 1 });

export default mongoose.models.Company || mongoose.model('Company', CompanySchema);
