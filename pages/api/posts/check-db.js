import connectDB from '@/lib/mongoose';
import Post from '@/models/Post';

export default async function handler(req, res) {
  try {
    console.log('[Check DB] Starting database check...');
    
    // Try to connect
    try {
      await connectDB();
      console.log('[Check DB] ✓ Connected to database');
    } catch (connError) {
      return res.status(500).json({
        success: false,
        error: 'Connection failed',
        message: connError.message,
      });
    }
    
    // Get basic counts
    const total = await Post.countDocuments({});
    const published = await Post.countDocuments({ publishStatus: 'published' });
    const publicPosts = await Post.countDocuments({ visibility: 'public' });
    
    // Try to get ANY post
    const anyPost = await Post.findOne({}).lean();
    
    // Try to get posts with different queries
    const publishedPosts = await Post.find({ publishStatus: 'published' }).limit(5).lean();
    const allPosts = await Post.find({}).limit(5).lean();
    
    return res.status(200).json({
      success: true,
      counts: {
        total,
        published,
        public: publicPosts,
      },
      anyPost: anyPost ? {
        _id: anyPost._id?.toString(),
        title: anyPost.title,
        publishStatus: anyPost.publishStatus,
        visibility: anyPost.visibility,
      } : null,
      publishedPostsCount: publishedPosts.length,
      allPostsCount: allPosts.length,
      samplePublished: publishedPosts.map(p => ({
        title: p.title?.substring(0, 30),
        publishStatus: p.publishStatus,
        visibility: p.visibility,
      })),
      sampleAll: allPosts.map(p => ({
        title: p.title?.substring(0, 30),
        publishStatus: p.publishStatus,
        visibility: p.visibility,
      })),
    });
  } catch (error) {
    console.error('[Check DB] Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}
