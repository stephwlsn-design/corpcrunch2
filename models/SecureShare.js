import mongoose from 'mongoose';

const SecureShareSchema = new mongoose.Schema(
  {
    // Only a hash of the link token is stored.
    tokenHash: { type: String, required: true, unique: true, index: true },
    fileId: { type: mongoose.Schema.Types.ObjectId },
    fileName: { type: String, default: '' },
    fileMime: { type: String, default: '' },
    fileSize: { type: Number, default: 0 },
    iv: { type: String, default: '' },
    authTag: { type: String, default: '' },
    note: { type: String, default: '', trim: true },
    passcodeHash: { type: String, default: '' },
    failedAttempts: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true, index: true },
    purgeAt: { type: Date, required: true, index: true },
    viewedAt: { type: Date },
    viewCount: { type: Number, default: 0 },
    viewerIpHash: { type: String, default: '' },
    viewerUserAgent: { type: String, default: '' },
    uploaderIpHash: { type: String, default: '', index: true },
    uploaderUserAgent: { type: String, default: '' },
    revoked: { type: Boolean, default: false },
    revokedReason: { type: String, default: '' },
    reportCount: { type: Number, default: 0 },
    reportedAt: { type: Date },
    reportReason: { type: String, default: '' },
    purgedAt: { type: Date },
  },
  { timestamps: true }
);

SecureShareSchema.index({ createdAt: -1 });

export default mongoose.models.SecureShare || mongoose.model('SecureShare', SecureShareSchema);
