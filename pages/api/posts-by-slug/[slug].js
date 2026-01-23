import connectDB from '@/lib/mongoose';
import Post from '@/models/Post';

export default async function handler(req, res) {
  await connectDB();

  if (req.method === 'GET') {
    try {
      const { slug } = req.query;
      const { lang = 'en' } = req.query;

      const post = await Post.findOne({ slug })
        .populate('categoryId', 'name slug createdAt')
        .lean();

      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Post not found',
        });
      }

      // Get previous and next posts
      const allPosts = await Post.find({
        publishStatus: 'published',
        visibility: 'public',
      })
        .sort({ createdAt: -1 })
        .select('slug title bannerImageUrl')
        .lean();

      const currentIndex = allPosts.findIndex((p) => p.slug === slug);
      const prevPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
      const nextPost =
        currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;

      // Map categoryId to Category for frontend compatibility
      const Category = post.categoryId ? {
        id: post.categoryId._id || post.categoryId.id,
        name: post.categoryId.name,
        slug: post.categoryId.slug,
        createdAt: post.categoryId.createdAt || post.createdAt
      } : null;

      return res.status(200).json({
        success: true,
        ...post,
        prevPost,
        nextPost,
        Category, // Uppercase for frontend compatibility
        category: post.categoryId, // Keep lowercase for backward compatibility
      });
    } catch (error) {
      console.error('Error fetching post:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching post',
        error: error.message,
      });
    }
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
}
