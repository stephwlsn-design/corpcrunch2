import connectDB from '@/lib/mongoose';
import mongoose from 'mongoose';

// Define Company schema if model doesn't exist
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

const Company = mongoose.models.Company || mongoose.model('Company', CompanySchema);

export default async function handler(req, res) {
  // Prevent multiple responses
  let responseSent = false;
  
  const sendResponse = (statusCode, data) => {
    if (!responseSent) {
      responseSent = true;
      res.status(statusCode).json(data);
    }
  };

  // Set timeout for the entire request
  const timeout = setTimeout(() => {
    if (!responseSent) {
      sendResponse(200, {
        success: false,
        message: 'Request timeout',
        data: [],
      });
    }
  }, 8000); // 8 second timeout

  try {
    // Connect to database - mongoose handles timeouts internally
    try {
      await connectDB();
    } catch (error) {
      console.error('Failed to connect to database:', error.message);
      clearTimeout(timeout);
      // Return empty array instead of error to prevent frontend crash
      if (!responseSent) {
        sendResponse(200, {
          success: false,
          message: 'Database connection failed. Please check your MongoDB connection and IP whitelist.',
          data: [],
        });
      }
      return;
    }

    if (req.method === 'GET') {
      try {
        // Optimized query
        const companies = await Company.find({ isActive: true })
          .sort({ name: 1 })
          .limit(50) // Reduced limit for faster response
          .maxTimeMS(5000) // 5 second query timeout
          .lean();

        clearTimeout(timeout);
        if (!responseSent) {
          sendResponse(200, {
            success: true,
            data: companies,
          });
        }
        return;
      } catch (error) {
        console.error('Error fetching companies:', error);
        clearTimeout(timeout);
        // Return empty array instead of error to prevent frontend crash
        if (!responseSent) {
          sendResponse(200, {
            success: false,
            message: 'Error fetching companies',
            data: [],
          });
        }
        return;
      }
    }

    if (req.method === 'POST') {
      try {
        const companyData = req.body;

        const company = new Company(companyData);
        await company.save();

        clearTimeout(timeout);
        if (!responseSent) {
          sendResponse(201, {
            success: true,
            message: 'Company created successfully',
            data: company,
          });
        }
        return;
      } catch (error) {
        console.error('Error creating company:', error);
        clearTimeout(timeout);
        if (!responseSent) {
          sendResponse(500, {
            success: false,
            message: 'Error creating company',
            error: error.message,
          });
        }
        return;
      }
    }

    clearTimeout(timeout);
    if (!responseSent) {
      sendResponse(405, { success: false, message: 'Method not allowed' });
    }
    return;
  } catch (error) {
    clearTimeout(timeout);
    console.error('Unexpected error in companies API:', error);
    if (!responseSent) {
      sendResponse(500, {
        success: false,
        message: 'Internal server error',
        data: [],
      });
    }
    return;
  }
}
