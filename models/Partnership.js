import mongoose from 'mongoose';

const partnershipSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address'],
        trim: true,
        lowercase: true,
    },
    location: {
        type: String,
        required: [true, 'Location is required'],
        trim: true,
    },
    partnershipType: {
        type: String,
        required: [true, 'Partnership type is required'],
        enum: ['Speaker', 'Partner', 'Exhibitor'],
    },
    companyName: {
        type: String,
        required: [true, 'Company name is required'],
        trim: true,
    },
    jobTitle: {
        type: String,
        required: [true, 'Job title is required'],
        trim: true,
    },
    phoneNumber: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
    },
    message: {
        type: String,
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.Partnership || mongoose.model('Partnership', partnershipSchema);
