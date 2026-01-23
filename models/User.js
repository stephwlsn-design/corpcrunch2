import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      maxlength: 150,
      trim: true,
    },
    profilePicture: {
      type: String,
      default: '/assets/img/others/defaultAvatarProfile.jpg',
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'editor'],
      default: 'user',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Subscription fields (commented out as per the profile page)
    // isSubscriptionValid: {
    //   type: Boolean,
    //   default: false,
    // },
    // subscriptionStartDate: Date,
    // subscriptionEndDate: Date,
    // manageSubscriptionUrl: String,
  },
  {
    timestamps: true,
  }
);

// Create indexes
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });

export default mongoose.models.User || mongoose.model('User', UserSchema);

