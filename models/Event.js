import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['image', 'video'],
      default: 'image',
    },
    date: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    eventDate: {
      type: Date,
      required: true,
    },
    endDate: Date,
    category: {
      type: String,
      enum: ['AIX', 'C3', 'Other'],
      default: 'Other',
    },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'past'],
      default: 'upcoming',
    },
    featured: {
      type: Boolean,
      default: false,
    },
    registrationUrl: String,
    content: String,
    tags: [String],
    viewsCount: {
      type: Number,
      default: 0,
    },
    sharesCount: {
      type: Number,
      default: 0,
    },
    metaTitle: String,
    metaDescription: String,
    ogImage: String,
    language: {
      type: String,
      default: 'en',
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for optimal query performance
EventSchema.index({ slug: 1 });
EventSchema.index({ eventDate: -1 });
EventSchema.index({ status: 1 });
EventSchema.index({ featured: 1 });
EventSchema.index({ category: 1 });
EventSchema.index({ createdAt: -1 });
EventSchema.index({ viewsCount: -1 });

// Compound indexes
EventSchema.index({ status: 1, eventDate: -1 });
EventSchema.index({ featured: 1, eventDate: -1 });
EventSchema.index({ category: 1, eventDate: -1 });

export default mongoose.models.Event || mongoose.model('Event', EventSchema);

