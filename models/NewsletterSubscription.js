import mongoose from 'mongoose';

const NewsletterSubscriptionSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    source: {
      type: String,
      default: 'footer_newsletter',
    },
  },
  { timestamps: true }
);

NewsletterSubscriptionSchema.index({ email: 1 }, { unique: true });

export default mongoose.models.NewsletterSubscription ||
  mongoose.model('NewsletterSubscription', NewsletterSubscriptionSchema);
