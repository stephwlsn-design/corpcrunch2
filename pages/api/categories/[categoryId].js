import connectDB from '@/lib/mongoose';
import Category from '@/models/Category';
import Post from '@/models/Post';

export default async function handler(req, res) {
  await connectDB();

  if (req.method === 'GET') {
    try {
      const { categoryId } = req.query;
      const { lang = 'en' } = req.query;

      // Find category by ID or slug
      const category = await Category.findOne({
        $or: [
          { _id: categoryId },
          { id: categoryId },
          { slug: categoryId }
        ]
      }).lean();

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found',
        });
      }

      // Find all published posts in this category
      const query = {
        categoryId: category._id,
        publishStatus: 'published',
        visibility: 'public',
      };

      if (lang !== 'all') {
        query.language = lang;
      }

      // Fetch all posts for this category
      const allPosts = await Post.find(query)
        .populate('categoryId', 'name slug id')
        .maxTimeMS(5000) // 5 second query timeout
        .lean();

      // Map categoryId to Category for frontend compatibility
      const mappedPosts = allPosts.map(post => ({
        ...post,
        Category: post.categoryId ? {
          id: post.categoryId._id || post.categoryId.id,
          name: post.categoryId.name,
          slug: post.categoryId.slug
        } : null
      }));

      // Sort posts by different criteria
      // 1. Trending: Combination of viewsCount and recent date (last 30 days get boost)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const trendingPosts = [...mappedPosts].sort((a, b) => {
        const aDate = new Date(a.createdAt || a.publishDate || 0);
        const bDate = new Date(b.createdAt || b.publishDate || 0);
        const aIsRecent = aDate >= thirtyDaysAgo;
        const bIsRecent = bDate >= thirtyDaysAgo;
        
        // Recent posts get a boost
        const aScore = (a.viewsCount || 0) * (aIsRecent ? 2 : 1) + (a.sharesCount || 0);
        const bScore = (b.viewsCount || 0) * (bIsRecent ? 2 : 1) + (b.sharesCount || 0);
        
        return bScore - aScore;
      }).slice(0, 50);

      // 2. Most Viewed: Sort by viewsCount
      const mostViewedPosts = [...mappedPosts].sort((a, b) => {
        return (b.viewsCount || 0) - (a.viewsCount || 0);
      }).slice(0, 50);

      // 3. Newest to Oldest: Sort by createdAt
      const newestPosts = [...mappedPosts].sort((a, b) => {
        const aDate = new Date(a.createdAt || a.publishDate || 0);
        const bDate = new Date(b.createdAt || b.publishDate || 0);
        return bDate - aDate;
      }).slice(0, 50);

      // Return category with posts sorted in different ways
      return res.status(200).json({
        success: true,
        ...category,
        id: category._id || category.id,
        posts: mappedPosts, // Keep original for backward compatibility
        trendingPosts: trendingPosts,
        mostViewedPosts: mostViewedPosts,
        newestPosts: newestPosts,
      });
    } catch (error) {
      console.error('Error fetching category:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching category',
        error: error.message,
      });
    }
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
}
