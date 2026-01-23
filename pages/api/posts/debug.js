import connectDB from '@/lib/mongoose';
import Post from '@/models/Post';

export default async function handler(req, res) {
  // Disable caching
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  try {
    await connectDB();
    console.log('[Debug API] Database connected');
    
    // Get all posts without any filters - try with populate first, fallback without
    let allPosts = [];
    try {
      allPosts = await Post.find({})
        .populate('categoryId', 'name slug id')
        .sort({ createdAt: -1 })
        .limit(5)
        .maxTimeMS(10000)
        .lean();
      console.log('[Debug API] Found posts with populate:', allPosts.length);
    } catch (populateError) {
      console.log('[Debug API] Populate failed, trying without populate:', populateError.message);
      // If populate fails, try without it
      try {
        allPosts = await Post.find({})
          .sort({ createdAt: -1 })
          .limit(5)
          .maxTimeMS(10000)
          .lean();
        console.log('[Debug API] Found posts without populate:', allPosts.length);
      } catch (queryError) {
        console.error('[Debug API] Query failed:', queryError.message);
        allPosts = [];
      }
    }
    
    // Get counts
    let totalCount = 0;
    let publishedCount = 0;
    let publicCount = 0;
    let bothCount = 0;
    
    try {
      totalCount = await Post.countDocuments({});
      publishedCount = await Post.countDocuments({ publishStatus: 'published' });
      publicCount = await Post.countDocuments({ visibility: 'public' });
      bothCount = await Post.countDocuments({ 
        publishStatus: 'published', 
        visibility: 'public' 
      });
    } catch (countError) {
      console.error('[Debug API] Error getting counts:', countError.message);
    }
    
    // Sample post structure
    const samplePost = allPosts[0] || null;
    
    // Check if response was already sent
    if (res.headersSent) {
      console.warn('[Debug API] ⚠ Response already sent, skipping...');
      return;
    }
    
    return res.status(200).json({
      success: true,
      counts: {
        total: totalCount,
        published: publishedCount,
        public: publicCount,
        both: bothCount,
      },
      samplePost: samplePost ? {
        _id: samplePost._id?.toString(),
        title: samplePost.title,
        publishStatus: samplePost.publishStatus,
        visibility: samplePost.visibility,
        language: samplePost.language,
        createdAt: samplePost.createdAt,
        hasCategoryId: !!samplePost.categoryId,
      } : null,
      allPostsSample: Array.isArray(allPosts) ? allPosts.map(p => ({
        title: p.title,
        publishStatus: p.publishStatus,
        visibility: p.visibility,
      })) : [],
      postsFound: allPosts.length,
    });
  } catch (error) {
    console.error('[Debug API] ❌ Unexpected error:', {
      message: error.message,
      stack: error.stack?.substring(0, 300),
      name: error.name,
    });
    
    // Check if response was already sent
    if (res.headersSent) {
      console.warn('[Debug API] ⚠ Response already sent in error handler, skipping...');
      return;
    }
    
    // Always return a valid response
    return res.status(200).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      counts: {
        total: 0,
        published: 0,
        public: 0,
        both: 0,
      },
      samplePost: null,
      allPostsSample: [],
    });
  }
}
