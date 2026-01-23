import connectDB from '@/lib/mongoose';
import Event from '@/models/Event';

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

  try {
    await connectDB();
    console.log('[API /events/[slug]] ✓ Database connected successfully');

    if (req.method === 'GET') {
      try {
        const { slug } = req.query;
        
        if (!slug) {
          sendResponse(400, {
            success: false,
            message: 'Event slug or ID is required',
          });
          return;
        }

        console.log('[API /events/[slug]] Fetching event:', slug);
        
        // Try to find by slug first, then by _id
        let event = await Event.findOne({ slug: slug }).lean();
        
        if (!event) {
          // Try to find by _id if slug doesn't match
          try {
            const mongoose = require('mongoose');
            if (mongoose.Types.ObjectId.isValid(slug)) {
              event = await Event.findById(slug).lean();
            }
          } catch (idError) {
            console.log('[API /events/[slug]] Not a valid ObjectId');
          }
        }

        if (!event) {
          sendResponse(404, {
            success: false,
            message: 'Event not found',
          });
          return;
        }

        // Update status based on current date
        const now = new Date();
        const eventDate = new Date(event.eventDate);
        let currentStatus = event.status;
        
        if (eventDate > now) {
          currentStatus = 'upcoming';
        } else if (event.endDate && new Date(event.endDate) > now) {
          currentStatus = 'ongoing';
        } else {
          currentStatus = 'past';
        }

        // Increment views count
        await Event.findByIdAndUpdate(event._id, { 
          $inc: { viewsCount: 1 } 
        });

        const eventData = {
          ...event,
          _id: event._id?.toString(),
          status: currentStatus,
        };

        console.log('[API /events/[slug]] ✓ Event found:', eventData.title);

        sendResponse(200, {
          success: true,
          event: eventData,
        });
        return;
      } catch (error) {
        console.error('[API /events/[slug]] Error fetching event:', error);
        sendResponse(500, {
          success: false,
          message: 'Failed to fetch event',
          error: error.message,
        });
        return;
      }
    }

    sendResponse(405, {
      success: false,
      message: 'Method not allowed',
    });
  } catch (error) {
    console.error('[API /events/[slug]] Database connection error:', error);
    sendResponse(500, {
      success: false,
      message: 'Database connection failed',
      error: error.message,
    });
  }
}

