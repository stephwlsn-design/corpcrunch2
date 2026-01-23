import connectDB from '@/lib/mongoose';
import Category from '@/models/Category';
import mongoose from 'mongoose';

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
        const categories = await Category.find({ isActive: true })
          .sort({ name: 1 })
          .limit(50) // Reduced limit for faster response
          .maxTimeMS(5000) // 5 second query timeout
          .lean();

        clearTimeout(timeout);
        if (!responseSent) {
          sendResponse(200, {
            success: true,
            data: categories,
          });
        }
        return;
      } catch (error) {
        console.error('Error fetching categories:', error);
        clearTimeout(timeout);
        // Return empty array instead of error to prevent frontend crash
        if (!responseSent) {
          sendResponse(200, {
            success: false,
            message: 'Error fetching categories',
            data: [],
          });
        }
        return;
      }
    }

    if (req.method === 'POST') {
      try {
        const categoryData = req.body;

        const category = new Category(categoryData);
        await category.save();

        clearTimeout(timeout);
        if (!responseSent) {
          sendResponse(201, {
            success: true,
            message: 'Category created successfully',
            data: category,
          });
        }
        return;
      } catch (error) {
        console.error('Error creating category:', error);
        clearTimeout(timeout);
        if (!responseSent) {
          sendResponse(500, {
            success: false,
            message: 'Error creating category',
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
    console.error('Unexpected error in categories API:', error);
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
