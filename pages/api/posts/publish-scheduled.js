/**
 * API Endpoint: Publish Scheduled Posts
 * 
 * This endpoint can be called by a cron job to automatically publish scheduled posts
 * 
 * Usage:
 * - Set up a cron job to call this endpoint every 5-15 minutes
 * - Or use a service like Vercel Cron, GitHub Actions, etc.
 * 
 * Security: Requires admin authentication or can be secured with a secret token
 */

import { publishScheduledPosts, getScheduledPostsCount, getUpcomingScheduledPosts } from '@/lib/scheduledPosts';

export default async function handler(req, res) {
  // Disable caching
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  // Optional: Add secret token authentication for cron jobs
  const CRON_SECRET = process.env.CRON_SECRET;
  if (CRON_SECRET && req.headers['x-cron-secret'] !== CRON_SECRET) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized. Invalid cron secret.',
    });
  }

  if (req.method === 'POST') {
    // Publish scheduled posts
    try {
      const result = await publishScheduledPosts();
      
      return res.status(200).json({
        success: true,
        ...result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('[API /posts/publish-scheduled] Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error publishing scheduled posts',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  if (req.method === 'GET') {
    // Get scheduled posts info
    try {
      const count = await getScheduledPostsCount();
      const upcoming = await getUpcomingScheduledPosts(5);
      
      return res.status(200).json({
        success: true,
        scheduledCount: count,
        upcomingPosts: upcoming,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('[API /posts/publish-scheduled] Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching scheduled posts',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
}

