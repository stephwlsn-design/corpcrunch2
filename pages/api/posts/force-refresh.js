import connectDB from '@/lib/mongoose';
import Post from '@/models/Post';

/**
 * Simple diagnostic endpoint that bypasses all complex logic
 * and just tries to get ANY posts from the database
 */
export default async function handler(req, res) {
  // Disable caching
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  try {
    console.log('[API /posts/force-refresh] Starting force refresh...');
    
    // Connect to database
    await connectDB();
    console.log('[API /posts/force-refresh] ✓ Database connected');
    
    // Get total count
    const totalCount = await Post.countDocuments({});
    console.log('[API /posts/force-refresh] Total posts in DB:', totalCount);
    
    if (totalCount === 0) {
      return res.status(200).json({
        success: false,
        message: 'Database is empty - no posts exist',
        totalCount: 0,
        posts: [],
      });
    }
    
    // Try the absolute simplest query - no filters, no populate, no sorting
    let posts = [];
    try {
      posts = await Post.find({}).limit(20).lean();
      console.log('[API /posts/force-refresh] Found posts (no filters):', posts.length);
    } catch (error) {
      console.error('[API /posts/force-refresh] Error with simple query:', error.message);
      return res.status(200).json({
        success: false,
        message: `Query failed: ${error.message}`,
        totalCount,
        posts: [],
        error: error.message,
      });
    }
    
    // Try with populate
    let postsWithCategory = [];
    try {
      postsWithCategory = await Post.find({})
        .populate('categoryId', 'name slug id')
        .limit(20)
        .lean();
      console.log('[API /posts/force-refresh] Found posts (with populate):', postsWithCategory.length);
    } catch (popError) {
      console.error('[API /posts/force-refresh] Error with populate:', popError.message);
      // Use posts without populate
      postsWithCategory = posts;
    }
    
    // Get sample post data
    const samplePost = posts.length > 0 ? {
      _id: posts[0]._id?.toString(),
      title: posts[0].title,
      publishStatus: posts[0].publishStatus,
      visibility: posts[0].visibility,
      language: posts[0].language,
      createdAt: posts[0].createdAt,
      hasCategoryId: !!posts[0].categoryId,
    } : null;
    
    // Get counts by status
    const publishedCount = await Post.countDocuments({ publishStatus: 'published' });
    const publicCount = await Post.countDocuments({ visibility: 'public' });
    const bothCount = await Post.countDocuments({ publishStatus: 'published', visibility: 'public' });
    
    return res.status(200).json({
      success: true,
      message: `Found ${posts.length} posts (total: ${totalCount})`,
      totalCount,
      postsFound: posts.length,
      postsWithCategory: postsWithCategory.length,
      counts: {
        total: totalCount,
        published: publishedCount,
        public: publicCount,
        publishedAndPublic: bothCount,
      },
      samplePost,
      posts: postsWithCategory.slice(0, 5), // Return first 5 for inspection
    });
    
  } catch (error) {
    console.error('[API /posts/force-refresh] Error:', error);
    return res.status(200).json({
      success: false,
      message: `Error: ${error.message}`,
      error: error.message,
      posts: [],
    });
  }
}
