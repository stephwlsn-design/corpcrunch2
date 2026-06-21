import mongoose from 'mongoose';

const PageViewSchema = new mongoose.Schema(
  {
    url: String,
    title: String,
    referrer: String,
    viewedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const SiteVisitorSchema = new mongoose.Schema(
  {
    visitorId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: String,
    email: {
      type: String,
      lowercase: true,
      trim: true,
      index: true,
      sparse: true,
    },
    phoneNumber: String,
    location: String,
    city: String,
    country: String,
    region: String,
    ipAddress: String,
    userAgent: String,
    consentStatus: {
      type: String,
      enum: ['accepted', 'declined', 'otto'],
      default: 'accepted',
    },
    consentAt: Date,
    source: {
      type: String,
      enum: ['pageview', 'register', 'newsletter', 'contact', 'login', 'profile', 'otto'],
      default: 'pageview',
    },
    pageViews: {
      type: [PageViewSchema],
      default: [],
    },
    pageViewCount: {
      type: Number,
      default: 0,
    },
    lastSeenAt: Date,
    firstSeenAt: Date,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      sparse: true,
    },
  },
  { timestamps: true }
);

SiteVisitorSchema.index({ lastSeenAt: -1 });
SiteVisitorSchema.index({ createdAt: -1 });
SiteVisitorSchema.index({ country: 1 });

export default mongoose.models.SiteVisitor ||
  mongoose.model('SiteVisitor', SiteVisitorSchema);
