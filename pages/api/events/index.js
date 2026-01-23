import connectDB from '@/lib/mongoose';
import Event from '@/models/Event';
import { publicRateLimiter } from '@/lib/rateLimiter';

export default async function handler(req, res) {
  // Apply rate limiting to GET requests (public endpoint)
  if (req.method === 'GET') {
    try {
      const rateLimitResult = await publicRateLimiter(req);
      if (!rateLimitResult.allowed) {
        res.setHeader('Retry-After', rateLimitResult.retryAfter);
        return res.status(429).json({
          success: false,
          message: `Rate limit exceeded. Please try again after ${rateLimitResult.retryAfter} seconds.`,
          retryAfter: rateLimitResult.retryAfter,
          events: [],
        });
      }
    } catch (rateLimitError) {
      console.warn('[API /events] Rate limiting error:', rateLimitError.message);
      // Continue if rate limiting fails (fail open)
    }
  }
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
    console.log('[API /events] ✓ Database connected successfully');

    if (req.method === 'GET') {
      try {
        const { lang = 'en', category, status, featured, limit } = req.query;
        
        console.log('[API /events] Query params:', { lang, category, status, featured, limit });
        
        // Build query
        const query = {};
        
        if (lang && lang !== 'all') {
          query.language = lang;
        }
        
        if (category && category !== 'all') {
          query.category = category;
        }
        
        if (status && status !== 'all') {
          query.status = status;
        }
        
        if (featured === 'true') {
          query.featured = true;
        }

        // Determine sort order
        let sort = { eventDate: -1 };
        if (status === 'upcoming') {
          sort = { eventDate: 1 }; // Ascending for upcoming events
        }

        // Get events
        let events = await Event.find(query)
          .sort(sort)
          .limit(limit ? parseInt(limit) : 100)
          .maxTimeMS(10000)
          .lean();

        console.log(`[API /events] Found ${events.length} events`);

        // Update status based on current date
        const now = new Date();
        events = events.map(event => {
          const eventDate = new Date(event.eventDate);
          let currentStatus = event.status;
          
          if (eventDate > now) {
            currentStatus = 'upcoming';
          } else if (event.endDate && new Date(event.endDate) > now) {
            currentStatus = 'ongoing';
          } else {
            currentStatus = 'past';
          }
          
          return {
            ...event,
            status: currentStatus,
            _id: event._id?.toString(),
          };
        });

        sendResponse(200, {
          success: true,
          events,
          count: events.length,
        });
        return;
      } catch (error) {
        console.error('[API /events] Error fetching events:', error);
        sendResponse(500, {
          success: false,
          message: 'Failed to fetch events',
          error: error.message,
          events: [],
        });
        return;
      }
    }

    if (req.method === 'POST') {
      try {
        const eventData = req.body;
        
        // Sanitize and validate required fields
        const sanitizedData = {
          title: eventData.title?.trim() || '',
          description: eventData.description?.trim() || '',
          image: eventData.image?.trim() || '',
          date: eventData.date?.trim() || '',
          location: eventData.location?.trim() || '',
          slug: eventData.slug?.trim() || '',
        };

        // Validate required fields
        if (!sanitizedData.title || !sanitizedData.description || !sanitizedData.image || !sanitizedData.date || !sanitizedData.location) {
          sendResponse(400, {
            success: false,
            message: 'Missing required fields: title, description, image, date, location',
          });
          return;
        }

        // Validate field lengths
        if (sanitizedData.title.length > 200) {
          sendResponse(400, {
            success: false,
            message: 'Title is too long (maximum 200 characters)',
          });
          return;
        }

        if (sanitizedData.description.length > 10000) {
          sendResponse(400, {
            success: false,
            message: 'Description is too long (maximum 10000 characters)',
          });
          return;
        }

        // Validate URL format for image
        const urlRegex = /^https?:\/\/.+/i;
        if (!urlRegex.test(sanitizedData.image)) {
          sendResponse(400, {
            success: false,
            message: 'Image must be a valid HTTP/HTTPS URL',
          });
          return;
        }

        // Validate date format
        const dateObj = new Date(sanitizedData.date);
        if (isNaN(dateObj.getTime())) {
          sendResponse(400, {
            success: false,
            message: 'Invalid date format',
          });
          return;
        }

        // Generate slug if not provided
        if (!sanitizedData.slug) {
          sanitizedData.slug = sanitizedData.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
            .substring(0, 100);
        }

        // Check if slug already exists
        const existingEvent = await Event.findOne({ slug: sanitizedData.slug });
        if (existingEvent) {
          sendResponse(400, {
            success: false,
            message: 'Event with this slug already exists',
          });
          return;
        }

        // Build event data object
        const eventDataToSave = {
          title: sanitizedData.title,
          description: sanitizedData.description,
          image: sanitizedData.image,
          location: sanitizedData.location,
          slug: sanitizedData.slug,
          eventDate: dateObj,
        };

        // Determine status based on date
        const now = new Date();
        if (dateObj > now) {
          eventDataToSave.status = 'upcoming';
        } else if (eventData.endDate && new Date(eventData.endDate) > now) {
          eventDataToSave.status = 'ongoing';
        } else {
          eventDataToSave.status = 'past';
        }

        // Add optional fields if provided
        if (eventData.endDate) {
          const endDateObj = new Date(eventData.endDate);
          if (!isNaN(endDateObj.getTime())) {
            eventDataToSave.endDate = endDateObj;
          }
        }

        const newEvent = new Event(eventDataToSave);
        await newEvent.save();

        console.log('[API /events] ✓ Event created:', newEvent._id);

        sendResponse(201, {
          success: true,
          message: 'Event created successfully',
          event: {
            ...newEvent.toObject(),
            _id: newEvent._id.toString(),
          },
        });
        return;
      } catch (error) {
        console.error('[API /events] Error creating event:', error);
        sendResponse(500, {
          success: false,
          message: 'Failed to create event',
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
    console.error('[API /events] Database connection error:', error);
    sendResponse(500, {
      success: false,
      message: 'Database connection failed',
      error: error.message,
      events: [],
    });
  }
}

