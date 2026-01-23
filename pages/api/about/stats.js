import connectDB from '@/lib/mongoose';
import AboutStats from '@/models/AboutStats';

export default async function handler(req, res) {
  // Prevent multiple responses
  let responseSent = false;
  
  const sendResponse = (statusCode, data) => {
    if (!responseSent) {
      responseSent = true;
      res.status(statusCode).json(data);
    }
  };

  // Disable Next.js caching for this API route
  if (!responseSent) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }

  if (req.method === 'GET') {
    try {
      await connectDB();
      
      const stats = await AboutStats.find({ isActive: true })
        .sort({ order: 1, createdAt: -1 })
        .lean();

      return sendResponse(200, {
        success: true,
        count: stats.length,
        stats: stats.map(stat => ({
          id: stat._id,
          label: stat.label,
          value: stat.value,
          description: stat.description,
          order: stat.order,
        })),
      });
    } catch (error) {
      console.error('[API /about/stats] Error:', error);
      return sendResponse(500, {
        success: false,
        message: 'Failed to fetch stats',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  if (req.method === 'POST') {
    try {
      await connectDB();
      
      const { label, value, description, order } = req.body;

      // Validate required fields
      if (!label || !value) {
        return sendResponse(400, {
          success: false,
          message: 'Label and value are required',
        });
      }

      const stat = new AboutStats({
        label: label.trim(),
        value: value.trim(),
        description: description?.trim(),
        order: order || 0,
        isActive: true,
      });

      await stat.save();

      return sendResponse(200, {
        success: true,
        message: 'Stat created successfully',
        data: {
          id: stat._id,
          label: stat.label,
          value: stat.value,
        },
      });
    } catch (error) {
      console.error('[API /about/stats] Error:', error);
      return sendResponse(500, {
        success: false,
        message: 'Failed to create stat',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  return sendResponse(405, {
    success: false,
    message: 'Method not allowed',
  });
}

