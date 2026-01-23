/**
 * Scheduled Posts Handler
 * Automatically publishes posts when their scheduled time arrives
 * 
 * This should be run as a cron job or scheduled task
 * Recommended: Run every 5-15 minutes
 */

import connectDB from '@/lib/mongoose';
import Post from '@/models/Post';

/**
 * Check and publish scheduled posts
 * @returns {Promise<{published: number, errors: string[]}>}
 */
export async function publishScheduledPosts() {
  try {
    await connectDB();
    
    const now = new Date();
    
    // Find all posts that are scheduled and their publishDate has passed
    const scheduledPosts = await Post.find({
      publishStatus: 'scheduled',
      publishDate: { $lte: now }, // publishDate is less than or equal to now
    });
    
    if (scheduledPosts.length === 0) {
      return {
        published: 0,
        errors: [],
        message: 'No scheduled posts to publish',
      };
    }
    
    const published = [];
    const errors = [];
    
    for (const post of scheduledPosts) {
      try {
        post.publishStatus = 'published';
        await post.save();
        published.push({
          id: post._id.toString(),
          slug: post.slug,
          title: post.title,
        });
        console.log(`[Scheduled Posts] ✓ Published: ${post.slug} (${post.title})`);
      } catch (error) {
        const errorMsg = `Failed to publish ${post.slug}: ${error.message}`;
        errors.push(errorMsg);
        console.error(`[Scheduled Posts] ❌ ${errorMsg}`);
      }
    }
    
    return {
      published: published.length,
      errors,
      posts: published,
      message: `Published ${published.length} scheduled post(s)`,
    };
  } catch (error) {
    console.error('[Scheduled Posts] ❌ Error:', error);
    return {
      published: 0,
      errors: [error.message],
      message: 'Error checking scheduled posts',
    };
  }
}

/**
 * Get scheduled posts count
 * @returns {Promise<number>}
 */
export async function getScheduledPostsCount() {
  try {
    await connectDB();
    const count = await Post.countDocuments({
      publishStatus: 'scheduled',
      publishDate: { $gte: new Date() }, // Future scheduled posts
    });
    return count;
  } catch (error) {
    console.error('[Scheduled Posts] Error getting count:', error);
    return 0;
  }
}

/**
 * Get upcoming scheduled posts
 * @param {number} limit - Maximum number of posts to return
 * @returns {Promise<Array>}
 */
export async function getUpcomingScheduledPosts(limit = 10) {
  try {
    await connectDB();
    const posts = await Post.find({
      publishStatus: 'scheduled',
      publishDate: { $gte: new Date() },
    })
      .sort({ publishDate: 1 }) // Sort by publishDate ascending
      .limit(limit)
      .select('title slug publishDate')
      .lean();
    
    return posts;
  } catch (error) {
    console.error('[Scheduled Posts] Error getting upcoming posts:', error);
    return [];
  }
}

