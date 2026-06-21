import mongoose from 'mongoose';

const ContactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['new', 'read', 'replied', 'archived'],
      default: 'new',
    },
    formType: {
      type: String,
      enum: ['project', 'message', 'product'],
      default: 'message',
    },
    inquiryTopic: {
      type: String,
      default: '',
    },
    companyName: {
      type: String,
      default: '',
    },
    phoneCountryCode: {
      type: String,
      default: '',
    },
    phoneNumber: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
ContactSchema.index({ email: 1 });
ContactSchema.index({ status: 1 });
ContactSchema.index({ createdAt: -1 });

export default mongoose.models.Contact || mongoose.model('Contact', ContactSchema);





















