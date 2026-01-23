import connectDB from './mongoose';
import Event from '@/models/Event';

/**
 * Get all events with optional filters
 * Direct MongoDB query - no API double-hop
 */
export async function getEvents(options = {}) {
  const { lang = 'en', category, status, featured, limit = 100 } = options;
  
  await connectDB();
  
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
  
  if (featured === true) {
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
    .limit(limit)
    .maxTimeMS(10000)
    .lean();

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
      id: event._id?.toString(),
    };
  });

  return events;
}

/**
 * Get event by slug or ID
 * Direct MongoDB query - no API double-hop
 */
export async function getEventBySlug(slug) {
  await connectDB();
  
  // Try to find by slug first, then by _id
  let event = await Event.findOne({ slug: slug }).lean();
  
  if (!event) {
    // Try to find by _id if slug doesn't match
    const mongoose = require('mongoose');
    if (mongoose.Types.ObjectId.isValid(slug)) {
      event = await Event.findById(slug).lean();
    }
  }

  if (!event) {
    return null;
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

  // Note: We don't increment viewsCount here for ISR/SSG
  // Views should be incremented via API route on client-side or via on-demand revalidation

  return {
    ...event,
    _id: event._id?.toString(),
    id: event._id?.toString(),
    status: currentStatus,
  };
}

/**
 * Get related events by category
 */
export async function getRelatedEvents(category, excludeId, limit = 3) {
  await connectDB();
  
  const events = await Event.find({
    category: category,
    _id: { $ne: excludeId }
  })
    .sort({ eventDate: -1 })
    .limit(limit)
    .lean();

  return events.map(event => ({
    ...event,
    _id: event._id?.toString(),
    id: event._id?.toString(),
  }));
}

