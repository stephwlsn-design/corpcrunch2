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
        
        // Validate required fields
        if (!eventData.title || !eventData.description || !eventData.image || !eventData.date || !eventData.location) {
          sendResponse(400, {
            success: false,
            message: 'Missing required fields: title, description, image, date, location',
          });
          return;
        }

        // Generate slug if not provided
        if (!eventData.slug) {
          eventData.slug = eventData.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        }

        // Check if slug already exists
        const existingEvent = await Event.findOne({ slug: eventData.slug });
        if (existingEvent) {
          sendResponse(400, {
            success: false,
            message: 'Event with this slug already exists',
          });
          return;
        }

        // Parse event date
        if (eventData.date) {
          eventData.eventDate = new Date(eventData.date);
        }

        // Determine status based on date
        if (eventData.eventDate) {
          const now = new Date();
          if (eventData.eventDate > now) {
            eventData.status = 'upcoming';
          } else if (eventData.endDate && new Date(eventData.endDate) > now) {
            eventData.status = 'ongoing';
          } else {
            eventData.status = 'past';
          }
        }

        const newEvent = new Event(eventData);
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

