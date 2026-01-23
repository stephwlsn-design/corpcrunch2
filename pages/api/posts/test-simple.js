import connectDB from '@/lib/mongoose';
import Post from '@/models/Post';

export default async function handler(req, res) {
  try {
    console.log('[TEST] Starting simple test...');
    await connectDB();
    console.log('[TEST] Database connected');
    
    // Get ANY posts without any filters or populate
    const posts = await Post.find({}).limit(5).lean();
    console.log('[TEST] Found posts:', posts.length);
    
    // Get counts
    const total = await Post.countDocuments({});
    console.log('[TEST] Total posts:', total);
    
    return res.status(200).json({
      success: true,
      message: 'Simple test completed',
      totalPosts: total,
      samplePosts: posts.length,
      firstPost: posts[0] ? {
        _id: posts[0]._id?.toString(),
        title: posts[0].title,
        hasTitle: !!posts[0].title,
      } : null,
    });
  } catch (error) {
    console.error('[TEST] Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}
