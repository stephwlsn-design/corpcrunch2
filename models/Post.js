import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema(
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
    content: {
      type: String,
      required: true,
    },
    bannerImageUrl: {
      type: String,
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    authorFirstName: String,
    authorLastName: String,
    tags: [String],
    metaTitle: String,
    metaDescription: String,
    imageAltText: String,
    publishStatus: {
      type: String,
      enum: ['draft', 'review', 'scheduled', 'published'],
      default: 'published',
    },
    publishDate: Date,
    visibility: {
      type: String,
      enum: ['public', 'private', 'internal', 'members-only'],
      default: 'public',
    },
    excerpt: String,
    readingTime: Number,
    canonicalUrl: String,
    relatedArticles: [String],
    inlineImages: [String],
    attachments: [String],
    inlineImageAltText: String,
    allowIndexing: {
      type: Boolean,
      default: true,
    },
    allowFollowing: {
      type: Boolean,
      default: true,
    },
    schemaMarkupType: {
      type: String,
      default: 'Article',
    },
    ogTitle: String,
    ogDescription: String,
    ogImage: String,
    secondaryKeywords: [String],
    redirectFrom: String,
    language: {
      type: String,
      default: 'en',
    },
    region: String,
    structuredData: String,
    // Quote fields
    quoteText: String,
    quoteAuthorName: String,
    quoteAuthorTitle: String,
    // Content type
    contentType: {
      type: String,
      enum: ['article', 'video', 'magazine'],
      default: 'article',
    },
    // Video URL for video posts
    videoUrl: {
      type: String,
    },
    // Additional content fields
    whyThisMatters: String,
    whyThisMattersMultimediaUrl: String,
    whyThisMattersMultimediaType: {
      type: String,
      enum: ['graphic', 'video'],
    },
    whatsExpectedNext: String,
    whatsExpectedNextMultimediaUrl: String,
    whatsExpectedNextMultimediaType: {
      type: String,
      enum: ['graphic', 'video'],
    },
    // Statistics
    viewsCount: {
      type: Number,
      default: 0,
    },
    sharesCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for optimal query performance
// Slug index is already created by unique: true
PostSchema.index({ categoryId: 1 });
PostSchema.index({ publishStatus: 1 });
PostSchema.index({ publishDate: -1 });
PostSchema.index({ createdAt: -1 });
PostSchema.index({ visibility: 1 });
PostSchema.index({ contentType: 1 });
PostSchema.index({ language: 1 });
PostSchema.index({ viewsCount: -1 }); // For most viewed queries
PostSchema.index({ sharesCount: -1 }); // For trending queries

// Compound indexes for common query patterns
PostSchema.index({ publishStatus: 1, visibility: 1, createdAt: -1 });
PostSchema.index({ publishStatus: 1, visibility: 1, publishDate: -1 });
PostSchema.index({ categoryId: 1, publishStatus: 1, visibility: 1 });
PostSchema.index({ publishStatus: 1, language: 1, createdAt: -1 });
PostSchema.index({ tags: 1 }); // For tag-based queries

export default mongoose.models.Post || mongoose.model('Post', PostSchema);
